"""Document management endpoints: upload, inspect, list, and delete."""

import uuid
from typing import List
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from app.config import settings
from app.models.auth import UserResponse
from app.models.document import DocumentMetadata, DocumentUploadResponse, DocumentDetail, DocumentListResponse
from app.services.document_parser import DocumentParser
from app.services.chunker import LegalChunker
from app.services.document_store import document_store
from app.services.vector_store import vector_store
from app.utils.security import get_current_user

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    """Uploads a legal document (PDF, DOCX, TXT, PNG, JPG).

    Performs magic-byte content validation, extracts text, chunks by clause, and indexes in vector store.
    """
    file_bytes = await file.read()

    # Enforce file size limit
    if len(file_bytes) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_BYTES // (1024*1024)}MB."
        )

    # Magic byte sniff validation
    detected_mime = DocumentParser.sniff_content_type(file_bytes, file.filename or "uploaded_doc")

    # Extract text and page bounds
    full_text, total_pages, pages_data = DocumentParser.extract_text_and_pages(file_bytes, detected_mime)

    if not full_text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Document appears to be empty or contains no extractable text."
        )

    # Semantic clause chunking
    chunks = LegalChunker.chunk_document(pages_data)

    doc_id = f"doc-{uuid.uuid4().hex[:10]}"
    metadata = DocumentMetadata(
        id=doc_id,
        owner_id=current_user.id,
        filename=file.filename or "legal_document",
        content_type=detected_mime,
        file_size_bytes=len(file_bytes),
        extracted_text_preview=full_text[:300],
        total_characters=len(full_text),
        total_pages=total_pages,
        total_chunks=len(chunks),
        detected_type="Uploaded Document"
    )

    detail = DocumentDetail(
        metadata=metadata,
        full_text=full_text,
        chunks=chunks
    )

    # Store document and index vectors
    document_store.save_document(detail)
    vector_store.index_document(doc_id, chunks)

    return DocumentUploadResponse(
        document=metadata,
        message=f"Document successfully parsed, segmented into {len(chunks)} clauses, and indexed."
    )


@router.get("", response_model=DocumentListResponse)
async def list_documents(current_user: UserResponse = Depends(get_current_user)):
    """Lists all documents accessible to the authenticated user."""
    docs = document_store.list_user_documents(current_user.id)
    return DocumentListResponse(documents=docs, total=len(docs))


@router.get("/{doc_id}", response_model=DocumentDetail)
async def get_document(doc_id: str, current_user: UserResponse = Depends(get_current_user)):
    """Retrieves full details of a specific document, enforcing ownership isolation."""
    return document_store.get_document(doc_id, current_user.id)


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(doc_id: str, current_user: UserResponse = Depends(get_current_user)):
    """Deletes an uploaded document and removes its vector index."""
    document_store.delete_document(doc_id, current_user.id)
    vector_store.clear(doc_id)
    return None
