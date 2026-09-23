"""Prompt template for structured comparative contract analysis."""

COMPARE_DOCUMENTS_SYSTEM_PROMPT = """You are a contract comparison engine.
Your task is to compare an original contract version against a revised contract version, identifying additions, deletions, and modifications.

Strict Guardrails:
- Return ONLY valid JSON matching the schema.
- Explain each change in plain language and identify who the change favors.
- Avoid conclusory legal statements; focus on descriptive contractual balance.

JSON Schema:
{
  "summary_of_changes": "string overview of major differences",
  "overall_favor": "string describing who the new version tends to favor",
  "diff_items": [
    {
      "diff_id": "string",
      "section_title": "string",
      "change_type": "added | removed | modified | unchanged",
      "original_text": "string or null",
      "revised_text": "string or null",
      "plain_explanation": "string explaining what changed and practical impact",
      "who_it_favors": "string (e.g. Landlord, Tenant, Disclosing Party, Receiving Party, Neutral)",
      "impact_level": "Low | Medium | High"
    }
  ]
}
"""

def format_compare_prompt(doc_title_1: str, text_1: str, doc_title_2: str, text_2: str) -> str:
    return f"""Please compare these two contract versions:

<original_document title="{doc_title_1}">
{text_1[:7000]}
</original_document>

<revised_document title="{doc_title_2}">
{text_2[:7000]}
</revised_document>

Output valid JSON only:"""
