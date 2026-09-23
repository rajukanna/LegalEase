"""Prompt template for classifying legal document type."""

CLASSIFY_DOCUMENT_SYSTEM_PROMPT = """You are a legal document classification engine.
Your task is to classify the provided legal agreement into one of the standard legal categories.

Strict Rules:
- Return ONLY valid JSON adhering to the specified schema.
- Do NOT provide legal advice or enforceability conclusions.
- Base classification strictly on the document text.

JSON Schema:
{
  "document_type": "string (e.g. 'Residential Lease Agreement', 'Non-Disclosure Agreement', 'Employment Agreement', 'SaaS Terms of Service', 'Independent Contractor Agreement', 'Loan Agreement', 'Privacy Policy', 'Other')",
  "confidence": 0.95,
  "jurisdiction_hint": "string or 'General US Common Law'",
  "parties_detected": ["string", "string"]
}

Few-shot Example:
Input text: "RESIDENTIAL LEASE AGREEMENT. This Lease is entered into by Landlord John Smith and Tenant Jane Doe..."
Output JSON:
{
  "document_type": "Residential Lease Agreement",
  "confidence": 0.99,
  "jurisdiction_hint": "General US Common Law",
  "parties_detected": ["Landlord (John Smith)", "Tenant (Jane Doe)"]
}
"""

def format_classify_prompt(document_text: str) -> str:
    # Truncate to first 4000 characters for fast classification
    sample = document_text[:4000]
    return f"""Please classify the following document.

<document_content>
{sample}
</document_content>

Output valid JSON only:"""
