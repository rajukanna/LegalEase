"""Attorney Preparation Brief Pydantic models."""

from typing import List
from pydantic import BaseModel, Field
from app.models.analysis import LEGAL_DISCLAIMER, RiskFlag


class AttorneyConsultationQuestion(BaseModel):
    category: str
    question: str
    context_clause: str
    why_to_ask: str


class LawyerPrepBrief(BaseModel):
    document_id: str
    document_name: str
    document_type: str
    generated_date: str
    executive_summary: str
    critical_concerns: List[RiskFlag]
    recommended_questions: List[AttorneyConsultationQuestion]
    documents_to_bring: List[str]
    timeline_and_deadlines: List[str]
    disclaimer: str = LEGAL_DISCLAIMER
