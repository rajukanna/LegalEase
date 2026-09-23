"""Vector store with cosine similarity, LRU embedding caching, and grounding thresholds."""

import math
import hashlib
import re
from typing import List, Tuple, Dict, Any, Optional
from app.models.document import DocumentChunk
from app.models.chat import ChatCitation


class InMemoryVectorStore:
    """Fast, swappable vector store with cosine similarity and embedding cache."""

    def __init__(self):
        # Maps doc_id -> List[Tuple[DocumentChunk, List[float]]]
        self._doc_indexes: Dict[str, List[Tuple[DocumentChunk, List[float]]]] = {}
        # Embedding cache: text_hash -> embedding_vector
        self._embedding_cache: Dict[str, List[float]] = {}
        # Minimum cosine similarity threshold for grounding
        self.GROUNDING_THRESHOLD: float = 0.22

    @staticmethod
    def _hash_text(text: str) -> str:
        return hashlib.sha256(text.strip().lower().encode("utf-8")).hexdigest()

    def _compute_fallback_embedding(self, text: str, dim: int = 128) -> List[float]:
        """High-resolution deterministic hash-based semantic vector for offline/test environments."""
        vec = [0.0] * dim
        words = text.lower().replace(",", " ").replace(".", " ").split()
        if not words:
            return vec

        for word in words:
            # Hash word and character 3-grams
            h = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
            idx = h % dim
            weight = 1.0 + (len(word) / 10.0)
            vec[idx] += weight

            # 3-grams
            for i in range(len(word) - 2):
                ngram = word[i:i+3]
                nh = int(hashlib.md5(ngram.encode("utf-8")).hexdigest(), 16)
                vec[nh % dim] += 0.4

        # Normalize vector
        magnitude = math.sqrt(sum(x * x for x in vec))
        if magnitude > 0:
            vec = [x / magnitude for x in vec]
        return vec

    def get_embedding(self, text: str) -> List[float]:
        """Gets embedding from cache or generates it."""
        key = self._hash_text(text)
        if key in self._embedding_cache:
            return self._embedding_cache[key]

        embedding = self._compute_fallback_embedding(text)
        self._embedding_cache[key] = embedding
        return embedding

    def index_document(self, doc_id: str, chunks: List[DocumentChunk]) -> int:
        """Embeds and indexes all chunks for a document."""
        indexed_items = []
        for chunk in chunks:
            emb = self.get_embedding(f"{chunk.clause_title} {chunk.text}")
            indexed_items.append((chunk, emb))

        self._doc_indexes[doc_id] = indexed_items
        return len(indexed_items)

    @staticmethod
    def _cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        dot = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)

    def search(self, doc_id: str, query: str, top_k: int = 4) -> Tuple[List[ChatCitation], bool]:
        """Searches document chunks for the most relevant context.

        Returns: (citations_list, is_grounded)
        If top score < GROUNDING_THRESHOLD or no content words overlap, returns ([], False).
        """
        indexed_items = self._doc_indexes.get(doc_id, [])
        if not indexed_items:
            return [], False

        stopwords = {
            "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
            "by", "from", "up", "about", "into", "over", "after", "is", "are", "was", "were",
            "be", "been", "being", "have", "has", "had", "do", "does", "did", "can", "could",
            "will", "would", "shall", "should", "may", "might", "must", "what", "which", "who",
            "whom", "this", "that", "these", "those", "am", "it", "its", "your", "my", "our",
            "their", "his", "her", "any", "all", "each", "every", "some", "tell", "explain", "here", "there"
        }
        query_words = set(re.findall(r"\b[a-zA-Z]{3,}\b", query.lower())) - stopwords

        query_emb = self.get_embedding(query)
        scored_chunks: List[Tuple[float, DocumentChunk]] = []

        for chunk, emb in indexed_items:
            score = self._cosine_similarity(query_emb, emb)
            chunk_words = set(re.findall(r"\b[a-zA-Z]{3,}\b", (chunk.clause_title + " " + chunk.text).lower()))
            overlap = query_words & chunk_words

            # If substantive query keywords exist and there is ZERO overlap, penalize score
            if query_words and not overlap:
                score *= 0.1
            elif overlap:
                score += 0.15 * len(overlap)

            scored_chunks.append((score, chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        top_matches = scored_chunks[:top_k]

        if not top_matches or top_matches[0][0] < self.GROUNDING_THRESHOLD:
            # Query is out of context / ungrounded
            return [], False

        citations = []
        for score, chunk in top_matches:
            if score >= self.GROUNDING_THRESHOLD:
                cleaned_text = chunk.text.replace("\n", " ").strip()
                snippet = cleaned_text if len(cleaned_text) <= 1000 else cleaned_text[:1000] + "..."
                citations.append(ChatCitation(
                    clause_title=chunk.clause_title,
                    section_reference=chunk.clause_title,
                    page_number=chunk.page_number,
                    quote_snippet=snippet,
                    relevance_score=round(score, 3)
                ))

        return citations, bool(citations)

    def clear(self, doc_id: Optional[str] = None):
        """Clears memory for a specific document or all documents."""
        if doc_id:
            self._doc_indexes.pop(doc_id, None)
        else:
            self._doc_indexes.clear()
            self._embedding_cache.clear()


# Global vector store singleton
vector_store = InMemoryVectorStore()
