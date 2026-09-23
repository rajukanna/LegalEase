"""Document metadata and upload Pydantic models."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class DocumentBase(BaseModel):
    filename: str
    content_type: str
    file_size_bytes: int


class DocumentChunk(BaseModel):
    chunk_id: str
    clause_title: str
    page_number: int
    text: str
    token_count: int


class DocumentMetadata(DocumentBase):
    id: str
    owner_id: str
    upload_timestamp: datetime = Field(default_factory=datetime.utcnow)
    extracted_text_preview: str = ""
    total_characters: int = 0
    total_pages: int = 1
    total_chunks: int = 0
    detected_type: Optional[str] = "Unknown"


class DocumentUploadResponse(BaseModel):
    document: DocumentMetadata
    message: str = "Document uploaded, validated, and indexed successfully"


class DocumentDetail(BaseModel):
    metadata: DocumentMetadata
    full_text: str
    chunks: List[DocumentChunk] = []


class DocumentListResponse(BaseModel):
    documents: List[DocumentMetadata]
    total: int
