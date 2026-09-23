"""Clause-aware semantic document chunker for legal documents."""

import re
import uuid
from typing import List, Dict, Any
from app.models.document import DocumentChunk


SECTION_PATTERN = re.compile(
    r"(?m)^(?:(?:SECTION|ARTICLE|CLAUSE|PARAGRAPH)\s+[\dIVXLCDM]+[.:\s]|(?:\d{1,2}\.|\([a-z\d]\))\s+[A-Z])",
    re.IGNORECASE
)


class LegalChunker:
    """Segments legal text into coherent, clause-aware chunks with titles and page references."""

    @staticmethod
    def chunk_document(pages_data: List[Dict[str, Any]], max_chunk_tokens: int = 400) -> List[DocumentChunk]:
        """Splits document pages into clause-bound chunks rather than naive character slices."""
        chunks: List[DocumentChunk] = []

        for page in pages_data:
            page_num = page.get("page_number", 1)
            raw_text = page.get("text", "").strip()
            if not raw_text:
                continue

            # Identify candidate section headers
            lines = raw_text.split("\n")
            current_section_title = f"Page {page_num} Provisions"
            current_buffer: List[str] = []

            for line in lines:
                stripped = line.strip()
                if not stripped:
                    continue

                # Header detection
                is_header = bool(SECTION_PATTERN.match(stripped)) or (
                    len(stripped) < 60 and stripped.isupper() and len(stripped.split()) < 6
                )

                if is_header and current_buffer:
                    # Flush current buffer
                    chunk_text = "\n".join(current_buffer).strip()
                    if chunk_text:
                        approx_tokens = max(1, len(chunk_text) // 4)
                        chunks.append(DocumentChunk(
                            chunk_id=str(uuid.uuid4()),
                            clause_title=current_section_title,
                            page_number=page_num,
                            text=chunk_text,
                            token_count=approx_tokens
                        ))
                    current_buffer = [stripped]
                    current_section_title = stripped[:80]
                elif is_header and not current_buffer:
                    current_section_title = stripped[:80]
                    current_buffer.append(stripped)
                else:
                    current_buffer.append(stripped)

            # Flush final buffer on page
            if current_buffer:
                chunk_text = "\n".join(current_buffer).strip()
                if chunk_text:
                    approx_tokens = max(1, len(chunk_text) // 4)
                    chunks.append(DocumentChunk(
                        chunk_id=str(uuid.uuid4()),
                        clause_title=current_section_title,
                        page_number=page_num,
                        text=chunk_text,
                        token_count=approx_tokens
                    ))

        # Fallback if no sections were identified (e.g. dense single block)
        if not chunks and pages_data:
            full_text = "\n\n".join(p.get("text", "") for p in pages_data)
            paragraphs = [p.strip() for p in full_text.split("\n\n") if p.strip()]
            for idx, p in enumerate(paragraphs):
                chunks.append(DocumentChunk(
                    chunk_id=str(uuid.uuid4()),
                    clause_title=f"Section {idx + 1}",
                    page_number=1,
                    text=p,
                    token_count=max(1, len(p) // 4)
                ))

        return chunks
