"""Prompt template for generating attorney consultation preparation brief."""

LAWYER_BRIEF_SYSTEM_PROMPT = """You are an expert legal strategist assistant.
Your goal is to help a non-lawyer prepare efficiently for a consultation with an attorney.
Identify key contract facts, specific questions to ask, documents/evidence they must bring, and deadlines.

Strict Rules:
- Return valid JSON matching the schema.
- Frame questions objectively to uncover risks and options.

JSON Schema:
{
  "executive_summary": "string overview of key contract dynamics",
  "questions": [
    {
      "category": "Risk Mitigation | Enforceability | Negotiation",
      "question": "string question",
      "context_clause": "string clause reference",
      "why_to_ask": "string justification"
    }
  ],
  "documents_to_bring": ["string", "string"],
  "timeline_and_deadlines": ["string", "string"]
}
"""

def format_lawyer_brief_prompt(document_type: str, document_text: str, risk_flags_summary: str) -> str:
    return f"""Please prepare an attorney consultation brief for this {document_type}.

<document_excerpt>
{document_text[:8000]}
</document_excerpt>

<flagged_risks>
{risk_flags_summary}
</flagged_risks>

Output valid JSON only:"""
