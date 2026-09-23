"""Clause classification and extraction Pydantic schemas."""

from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class ClauseCategory(str, Enum):
    OBLIGATION = "obligation"
    RIGHT = "right"
    DEADLINE = "deadline"
    PAYMENT_TERM = "payment_term"
    TERMINATION = "termination"
    AUTO_RENEWAL = "auto_renewal"
    LIABILITY_INDEMNITY = "liability_indemnity"
    DISPUTE_RESOLUTION = "dispute_resolution"
    CONFIDENTIALITY = "confidentiality"
    OTHER = "other"


class RiskLevel(str, Enum):
    INFO = "info"
    CAUTION = "caution"
    HIGH_RISK = "high-risk"


class ExtractedClause(BaseModel):
    clause_id: str
    clause_type: ClauseCategory
    title: str
    text_span: str = Field(description="Exact verbatim excerpt from source document")
    page_or_section: str = Field(description="Page number or section header reference")
    plain_explanation: str = Field(description="Grade-8 plain language explanation of what this means")
    risk_level: RiskLevel = RiskLevel.INFO
    risk_reason: Optional[str] = Field(default=None, description="Why this clause matters or poses a risk")
    who_it_favors: Optional[str] = Field(default="Neutral", description="E.g. Landlord, Tenant, Employer, Vendor, Neutral")


class ExtractedClausesResponse(BaseModel):
    clauses: List[ExtractedClause]
    total_clauses: int
