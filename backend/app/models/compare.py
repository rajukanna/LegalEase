"""Document comparison and diff Pydantic models."""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.analysis import LEGAL_DISCLAIMER


class DiffChangeType(str, Enum):
    ADDED = "added"
    REMOVED = "removed"
    MODIFIED = "modified"
    UNCHANGED = "unchanged"


class ClauseDiffItem(BaseModel):
    diff_id: str
    section_title: str
    change_type: DiffChangeType
    original_text: Optional[str] = None
    revised_text: Optional[str] = None
    plain_explanation: str = Field(description="Plain-language explanation of what changed")
    who_it_favors: str = Field(description="Who this change favors (e.g. Disclosing Party, Landlord, Tenant, Neutral)")
    impact_level: str = "Medium"  # Low, Medium, High


class DocumentCompareRequest(BaseModel):
    doc_id_1: str  # Original / Baseline
    doc_id_2: str  # Revised / Comparison version


class DocumentCompareResponse(BaseModel):
    doc_id_1: str
    doc_id_2: str
    doc_title_1: str
    doc_title_2: str
    summary_of_changes: str
    overall_favor: str  # E.g. "Revised version significantly favors Landlord"
    diff_items: List[ClauseDiffItem]
    total_added: int
    total_removed: int
    total_modified: int
    disclaimer: str = LEGAL_DISCLAIMER
