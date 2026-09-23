"""Document Intelligence and Analysis response schemas."""

from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.clause import ExtractedClause, RiskLevel


LEGAL_DISCLAIMER = "This is general information, not legal advice. Consult a licensed attorney for your specific situation."


class RiskFlag(BaseModel):
    id: str
    clause_id: Optional[str] = None
    title: str
    severity: RiskLevel  # info, caution, high-risk
    severity_label: str  # "Informational", "Caution", "High Risk"
    clause_reference: str  # E.g. "Section 4.2"
    verbatim_text: str
    plain_explanation: str
    why_it_matters: str
    who_it_favors: str = "Neutral"


class ActionChecklistItem(BaseModel):
    id: str
    action_text: str
    category: str  # "Before Signing", "Negotiate", "Monitor"
    priority: RiskLevel
    description: str


class DocumentAnalysisResponse(BaseModel):
    document_id: str
    document_type: str  # E.g., "Residential Lease Agreement", "Non-Disclosure Agreement"
    document_type_confidence: float = 0.95
    plain_summary: str = Field(description="Grade-8 plain language overview of the document")
    reading_level: str = "Grade 8"
    key_takeaways: List[str]
    clauses: List[ExtractedClause]
    risk_flags: List[RiskFlag]
    action_checklist: List[ActionChecklistItem]
    disclaimer: str = LEGAL_DISCLAIMER
