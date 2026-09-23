"""Export prompt templates and formatting helpers."""

from app.prompts.classify import CLASSIFY_DOCUMENT_SYSTEM_PROMPT, format_classify_prompt
from app.prompts.summarize import SUMMARIZE_DOCUMENT_SYSTEM_PROMPT, format_summarize_prompt
from app.prompts.extract_clauses import EXTRACT_CLAUSES_SYSTEM_PROMPT, format_extract_clauses_prompt
from app.prompts.compare import COMPARE_DOCUMENTS_SYSTEM_PROMPT, format_compare_prompt
from app.prompts.grounded_chat import GROUNDED_CHAT_SYSTEM_PROMPT, format_grounded_chat_prompt
from app.prompts.lawyer_brief import LAWYER_BRIEF_SYSTEM_PROMPT, format_lawyer_brief_prompt

__all__ = [
    "CLASSIFY_DOCUMENT_SYSTEM_PROMPT", "format_classify_prompt",
    "SUMMARIZE_DOCUMENT_SYSTEM_PROMPT", "format_summarize_prompt",
    "EXTRACT_CLAUSES_SYSTEM_PROMPT", "format_extract_clauses_prompt",
    "COMPARE_DOCUMENTS_SYSTEM_PROMPT", "format_compare_prompt",
    "GROUNDED_CHAT_SYSTEM_PROMPT", "format_grounded_chat_prompt",
    "LAWYER_BRIEF_SYSTEM_PROMPT", "format_lawyer_brief_prompt"
]
