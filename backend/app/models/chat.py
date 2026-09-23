"""Grounded Chat and RAG interaction Pydantic models."""

from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.analysis import LEGAL_DISCLAIMER


class ChatCitation(BaseModel):
    clause_title: str
    section_reference: str
    page_number: int
    quote_snippet: str
    relevance_score: float = 1.0


class ChatRequest(BaseModel):
    document_id: str
    question: str = Field(min_length=2, max_length=500)
    chat_history: Optional[List[dict]] = []


class ChatResponse(BaseModel):
    document_id: str
    question: str
    answer: str
    is_grounded: bool = True
    citations: List[ChatCitation] = []
    confidence_score: float = 1.0
    suggested_follow_ups: List[str] = []
    disclaimer: str = LEGAL_DISCLAIMER
