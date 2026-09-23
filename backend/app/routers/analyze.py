"""Document intelligence and analysis endpoints."""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.auth import UserResponse
from app.models.analysis import DocumentAnalysisResponse, RiskFlag, ActionChecklistItem
from app.models.clause import ExtractedClause, ClauseCategory, RiskLevel
from app.services.document_store import document_store
from app.services.llm_service import get_llm_client
from app.prompts.classify import CLASSIFY_DOCUMENT_SYSTEM_PROMPT, format_classify_prompt
from app.prompts.summarize import SUMMARIZE_DOCUMENT_SYSTEM_PROMPT, format_summarize_prompt
from app.prompts.extract_clauses import EXTRACT_CLAUSES_SYSTEM_PROMPT, format_extract_clauses_prompt
from app.utils.security import get_current_user

router = APIRouter(prefix="/analyze", tags=["Document Intelligence"])


@router.post("/{doc_id}", response_model=DocumentAnalysisResponse)
async def analyze_document(
    doc_id: str,
    force_refresh: bool = False,
    current_user: UserResponse = Depends(get_current_user)
):
    """Executes the structured document intelligence analysis pass on an uploaded contract.

    Classifies doc type, generates Grade-8 plain-language summary, extracts categorized clauses,
    identifies multi-modal risk flags, and compiles actionable checklist items.
    """
    doc = document_store.get_document(doc_id, current_user.id)

    # Check cache if not forcing refresh
    if not force_refresh:
        cached = document_store.get_analysis(doc_id)
        if cached:
            return cached

    llm = get_llm_client()
    text = doc.full_text

    # Step 1: Classify document type
    classify_prompt = format_classify_prompt(text)
    classify_data = await llm.generate_json(CLASSIFY_DOCUMENT_SYSTEM_PROMPT, classify_prompt)
    doc_type = classify_data.get("document_type", "Legal Agreement")
    doc_confidence = float(classify_data.get("confidence", 0.95))

    # Update metadata
    doc.metadata.detected_type = doc_type

    # Step 2: Plain-language summary
    summary_prompt = format_summarize_prompt(text)
    summary_data = await llm.generate_json(SUMMARIZE_DOCUMENT_SYSTEM_PROMPT, summary_prompt)
    plain_summary = summary_data.get("plain_summary", "Summary could not be generated.")
    key_takeaways = summary_data.get("key_takeaways", [])

    # Step 3: Extract structured clauses & risk flags
    extract_prompt = format_extract_clauses_prompt(text)
    extract_data = await llm.generate_json(EXTRACT_CLAUSES_SYSTEM_PROMPT, extract_prompt)

    raw_clauses = extract_data.get("clauses", [])
    raw_flags = extract_data.get("risk_flags", [])
    raw_checklist = extract_data.get("action_checklist", [])

    # Format clauses
    clauses: list[ExtractedClause] = []
    for c in raw_clauses:
        try:
            category = ClauseCategory(c.get("clause_type", "other"))
        except ValueError:
            category = ClauseCategory.OTHER

        try:
            risk = RiskLevel(c.get("risk_level", "info"))
        except ValueError:
            risk = RiskLevel.INFO

        clauses.append(ExtractedClause(
            clause_id=c.get("clause_id") or str(uuid.uuid4()),
            clause_type=category,
            title=c.get("title", "Clause Provision"),
            text_span=c.get("text_span", ""),
            page_or_section=c.get("page_or_section", "Section"),
            plain_explanation=c.get("plain_explanation", ""),
            risk_level=risk,
            risk_reason=c.get("risk_reason"),
            who_it_favors=c.get("who_it_favors", "Neutral")
        ))

    # Format risk flags
    risk_flags: list[RiskFlag] = []
    for f in raw_flags:
        try:
            severity = RiskLevel(f.get("severity", "caution"))
        except ValueError:
            severity = RiskLevel.CAUTION

        severity_label = "High Risk" if severity == RiskLevel.HIGH_RISK else ("Caution" if severity == RiskLevel.CAUTION else "Informational")
        risk_flags.append(RiskFlag(
            id=f.get("id") or str(uuid.uuid4()),
            title=f.get("title", "Risk Flag"),
            severity=severity,
            severity_label=f.get("severity_label") or severity_label,
            clause_reference=f.get("clause_reference", "Section"),
            verbatim_text=f.get("verbatim_text", ""),
            plain_explanation=f.get("plain_explanation", ""),
            why_it_matters=f.get("why_it_matters", ""),
            who_it_favors=f.get("who_it_favors", "Neutral")
        ))

    # Format action checklist
    checklist: list[ActionChecklistItem] = []
    for a in raw_checklist:
        try:
            prio = RiskLevel(a.get("priority", "info"))
        except ValueError:
            prio = RiskLevel.INFO

        checklist.append(ActionChecklistItem(
            id=a.get("id") or str(uuid.uuid4()),
            action_text=a.get("action_text", "Review item"),
            category=a.get("category", "Before Signing"),
            priority=prio,
            description=a.get("description", "")
        ))

    analysis = DocumentAnalysisResponse(
        document_id=doc_id,
        document_type=doc_type,
        document_type_confidence=doc_confidence,
        plain_summary=plain_summary,
        reading_level="Grade 8",
        key_takeaways=key_takeaways,
        clauses=clauses,
        risk_flags=risk_flags,
        action_checklist=checklist
    )

    # Save to cache
    document_store.save_analysis(doc_id, analysis)
    return analysis


@router.get("/{doc_id}", response_model=DocumentAnalysisResponse)
async def get_cached_analysis(doc_id: str, current_user: UserResponse = Depends(get_current_user)):
    """Retrieves existing cached analysis for a document, or runs it if not yet analyzed."""
    cached = document_store.get_analysis(doc_id)
    if cached:
        return cached
    return await analyze_document(doc_id=doc_id, force_refresh=False, current_user=current_user)
