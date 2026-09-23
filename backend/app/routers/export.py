"""Endpoints for generating and downloading the Attorney Preparation Brief."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import PlainTextResponse
from app.models.auth import UserResponse
from app.models.lawyer_brief import LawyerPrepBrief
from app.services.document_store import document_store
from app.services.export_service import BriefExportService
from app.routers.analyze import analyze_document
from app.utils.security import get_current_user

router = APIRouter(prefix="/prepare-for-lawyer", tags=["Attorney Preparation"])


@router.post("/{doc_id}", response_model=LawyerPrepBrief)
async def generate_lawyer_brief(
    doc_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Generates a structured, one-page attorney consultation brief.

    Includes executive summary, key risk concerns, targeted questions for legal counsel,
    and a checklist of documents to bring.
    """
    doc = document_store.get_document(doc_id, current_user.id)
    analysis = document_store.get_analysis(doc_id)
    if not analysis:
        # Run analysis first if not yet analyzed
        analysis = await analyze_document(doc_id=doc_id, force_refresh=False, current_user=current_user)

    brief = BriefExportService.generate_brief(doc.metadata.filename, analysis)
    return brief


@router.get("/{doc_id}/markdown", response_class=PlainTextResponse)
async def export_brief_markdown(
    doc_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Downloads the Attorney Preparation Brief as a clean, ready-to-print Markdown file."""
    brief = await generate_lawyer_brief(doc_id=doc_id, current_user=current_user)
    md_content = BriefExportService.render_markdown(brief)
    return PlainTextResponse(content=md_content, media_type="text/markdown")
