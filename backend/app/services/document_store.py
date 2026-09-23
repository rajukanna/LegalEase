"""In-memory and file document store with strict multi-tenant ownership enforcement."""

from typing import Dict, List, Optional
from fastapi import HTTPException, status
from app.models.document import DocumentMetadata, DocumentDetail, DocumentChunk
from app.models.analysis import DocumentAnalysisResponse


class DocumentStore:
    """Multi-tenant document repository enforcing strict ownership isolation."""

    def __init__(self):
        # Maps doc_id -> DocumentDetail
        self._documents: Dict[str, DocumentDetail] = {}
        # Maps doc_id -> DocumentAnalysisResponse
        self._analyses: Dict[str, DocumentAnalysisResponse] = {}

    def save_document(self, document_detail: DocumentDetail) -> None:
        """Stores document detail keyed by its ID."""
        self._documents[document_detail.metadata.id] = document_detail

    def get_document(self, doc_id: str, user_id: str) -> DocumentDetail:
        """Retrieves document detail ensuring the requesting user is the owner or document is public demo."""
        doc = self._documents.get(doc_id)
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document with ID '{doc_id}' not found."
            )

        # Multi-tenant isolation: allow owner or public demo docs (owner_id == 'system')
        if doc.metadata.owner_id != user_id and doc.metadata.owner_id != "system":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You do not have permission to access this document."
            )

        return doc

    def list_user_documents(self, user_id: str) -> List[DocumentMetadata]:
        """Lists documents owned by user plus public system sample documents."""
        docs: List[DocumentMetadata] = []
        for doc in self._documents.values():
            if doc.metadata.owner_id == user_id or doc.metadata.owner_id == "system":
                docs.append(doc.metadata)
        # Sort newest first
        docs.sort(key=lambda d: d.upload_timestamp, reverse=True)
        return docs

    def delete_document(self, doc_id: str, user_id: str) -> bool:
        """Deletes a document after validating ownership."""
        doc = self.get_document(doc_id, user_id)
        if doc.metadata.owner_id == "system":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Default sample documents cannot be deleted."
            )
        self._documents.pop(doc_id, None)
        self._analyses.pop(doc_id, None)
        return True

    def save_analysis(self, doc_id: str, analysis: DocumentAnalysisResponse) -> None:
        """Caches computed analysis."""
        self._analyses[doc_id] = analysis

    def get_analysis(self, doc_id: str) -> Optional[DocumentAnalysisResponse]:
        """Retrieves cached analysis if available."""
        return self._analyses.get(doc_id)


# Global document store singleton
document_store = DocumentStore()
