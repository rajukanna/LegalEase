"""Document comparison endpoint returning structured diffs and plain-language impact analysis."""

from fastapi import APIRouter, Depends, HTTPException, status
from app.models.auth import UserResponse
from app.models.compare import DocumentCompareRequest, DocumentCompareResponse
from app.services.document_store import document_store
from app.services.diff_service import ContractDiffEngine
from app.utils.security import get_current_user

router = APIRouter(prefix="/compare", tags=["Document Comparison"])


@router.post("", response_model=DocumentCompareResponse)
async def compare_documents(
    payload: DocumentCompareRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Compares two documents (or two versions of an agreement) at the clause level.

    Returns structured added/removed/modified diff items and plain-language assessments
    of who each change favors.
    """
    # Verify ownership of both documents
    doc1 = document_store.get_document(payload.doc_id_1, current_user.id)
    doc2 = document_store.get_document(payload.doc_id_2, current_user.id)

    comparison = ContractDiffEngine.compare_documents(
        doc_id_1=doc1.metadata.id,
        doc_title_1=doc1.metadata.filename,
        chunks_1=doc1.chunks,
        doc_id_2=doc2.metadata.id,
        doc_title_2=doc2.metadata.filename,
        chunks_2=doc2.chunks
    )

    return comparison
