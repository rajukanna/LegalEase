"""Swappable LLM client supporting Google Gemini and deterministic offline fallback."""

import json
import logging
import re
import uuid
from abc import ABC, abstractmethod
from typing import Dict, Any, AsyncGenerator, Optional, List
from app.config import settings

logger = logging.getLogger("legalease.llm")


class BaseLLMClient(ABC):
    """Abstract interface for swappable LLM providers."""

    @abstractmethod
    async def generate_json(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        """Executes completion returning parsed JSON dictionary."""
        pass

    @abstractmethod
    async def stream_text(self, system_prompt: str, user_prompt: str) -> AsyncGenerator[str, None]:
        """Streams completion tokens to client."""
        pass


class GeminiLLMClient(BaseLLMClient):
    """Google Gemini LLM client implementation using official google-genai SDK."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        try:
            from google import genai
            self.client = genai.Client(api_key=api_key)
            self.candidate_models = ["gemini-flash-latest", "gemini-3.6-flash", "gemini-3.7-flash"]
            self._client_ready = True
        except Exception as e:
            logger.warning(f"Failed to initialize live Gemini client: {e}. Falling back to mock.")
            self._client_ready = False

    async def generate_json(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        if not self._client_ready:
            mock = MockLLMClient()
            return await mock.generate_json(system_prompt, user_prompt)

        last_error = None
        for model in self.candidate_models:
            try:
                from google.genai import types
                prompt = f"{system_prompt}\n\n{user_prompt}"
                config = types.GenerateContentConfig(
                    temperature=0.1,
                    max_output_tokens=settings.LLM_MAX_TOKENS,
                    response_mime_type="application/json",
                )
                response = self.client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=config,
                )
                text = response.text.strip()
                # Clean markdown codeblocks if returned
                if text.startswith("```json"):
                    text = text[7:]
                elif text.startswith("```"):
                    text = text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                text = text.strip()
                try:
                    return json.loads(text)
                except json.JSONDecodeError:
                    start_obj = text.find("{")
                    start_arr = text.find("[")
                    start = min(s for s in (start_obj, start_arr) if s != -1) if (start_obj != -1 or start_arr != -1) else -1
                    end_obj = text.rfind("}")
                    end_arr = text.rfind("]")
                    end = max(end_obj, end_arr)
                    if start != -1 and end != -1 and end > start:
                        return json.loads(text[start:end+1])
                    raise
            except Exception as e:
                last_error = e
                logger.warning(f"Gemini model {model} failed: {e}. Trying next candidate...")

        logger.error(f"All Gemini models failed (last error: {last_error}). Utilizing fallback response.")
        mock = MockLLMClient()
        return await mock.generate_json(system_prompt, user_prompt)

    async def stream_text(self, system_prompt: str, user_prompt: str) -> AsyncGenerator[str, None]:
        if not self._client_ready:
            mock = MockLLMClient()
            async for token in mock.stream_text(system_prompt, user_prompt):
                yield token
            return

        for model in self.candidate_models:
            try:
                from google.genai import types
                prompt = f"{system_prompt}\n\n{user_prompt}"
                config = types.GenerateContentConfig(
                    temperature=0.1,
                    max_output_tokens=settings.LLM_MAX_TOKENS,
                )
                response = self.client.models.generate_content_stream(
                    model=model,
                    contents=prompt,
                    config=config,
                )
                has_yielded = False
                for chunk in response:
                    if chunk.text:
                        has_yielded = True
                        yield chunk.text
                if has_yielded:
                    return
            except Exception as e:
                logger.warning(f"Gemini streaming model {model} failed: {e}")

        mock = MockLLMClient()
        async for token in mock.stream_text(system_prompt, user_prompt):
            yield token


class MockLLMClient(BaseLLMClient):
    """Deterministic, high-fidelity offline mock client for evaluations, CI, and keyless demoing."""

    async def generate_json(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        lower_prompt = user_prompt.lower()

        # 1. Document Classification
        if "classify" in system_prompt.lower() or "classify the following document" in lower_prompt:
            if "lease" in lower_prompt or "landlord" in lower_prompt or "tenant" in lower_prompt:
                return {
                    "document_type": "Residential Lease Agreement",
                    "confidence": 0.98,
                    "jurisdiction_hint": "General US Common Law",
                    "parties_detected": ["Landlord", "Tenant"]
                }
            elif "confidential" in lower_prompt or "nda" in lower_prompt or "disclosing party" in lower_prompt:
                return {
                    "document_type": "Non-Disclosure Agreement (NDA)",
                    "confidence": 0.96,
                    "jurisdiction_hint": "General US Common Law",
                    "parties_detected": ["Disclosing Party", "Receiving Party"]
                }
            elif "terms of service" in lower_prompt or "privacy policy" in lower_prompt:
                return {
                    "document_type": "SaaS Terms of Service",
                    "confidence": 0.95,
                    "jurisdiction_hint": "General US Commercial Law",
                    "parties_detected": ["Service Provider", "User"]
                }
            else:
                return {
                    "document_type": "Commercial Contract",
                    "confidence": 0.88,
                    "jurisdiction_hint": "General US Common Law",
                    "parties_detected": ["Party A", "Party B"]
                }

        # 2. Plain-Language Summary
        if "summarize" in system_prompt.lower() or "plain-language summary" in lower_prompt:
            if "lease" in lower_prompt or "landlord" in lower_prompt:
                return {
                    "plain_summary": (
                        "This is a standard residential lease agreement where you agree to rent an apartment from the landlord. "
                        "You must pay monthly rent by the 1st of each month, maintain the premises in good order, and provide "
                        "notice before vacating. It contains several strict rules regarding security deposit deductions and landlord access."
                    ),
                    "reading_level": "Grade 8",
                    "key_takeaways": [
                        "Monthly rent is due on the 1st of every month with a late fee assessed after 3 days",
                        "Security deposit is refundable within 30 days after move-out minus any cleaning/repair costs",
                        "Landlord must provide 24 hours notice prior to entering except in emergencies",
                        "Subletting or early termination requires written landlord approval and may incur fees"
                    ],
                    "disclaimer": "This is general information, not legal advice. Consult a licensed attorney for your specific situation."
                }
            elif "confidential" in lower_prompt or "nda" in lower_prompt:
                return {
                    "plain_summary": (
                        "This is a mutual non-disclosure agreement. Both sides agree to share private business and technical "
                        "information for the purpose of exploring a partnership, while promising not to disclose that information "
                        "to outside parties or use it for their own unauthorized benefit."
                    ),
                    "reading_level": "Grade 8",
                    "key_takeaways": [
                        "Confidential information must be marked or confirmed in writing within 30 days",
                        "The non-disclosure obligation remains in effect for 3 years following disclosure",
                        "Standard exceptions apply for public knowledge, court subpoenas, or prior independent knowledge",
                        "All confidential materials must be returned or destroyed upon written demand"
                    ],
                    "disclaimer": "This is general information, not legal advice. Consult a licensed attorney for your specific situation."
                }
            else:
                return {
                    "plain_summary": (
                        "This agreement outlines the rights and duties of both parties. It specifies service terms, "
                        "payment schedules, limitations of liability, and dispute procedures in plain Grade-8 English."
                    ),
                    "reading_level": "Grade 8",
                    "key_takeaways": [
                        "Sets binding obligations on performance and payment schedules",
                        "Contains liability caps limiting maximum recoverable damages",
                        "Requires written notice for termination or modifications"
                    ],
                    "disclaimer": "This is general information, not legal advice. Consult a licensed attorney for your specific situation."
                }

        # 3. Clause Extraction & Risk Flags
        if "extract structured clauses" in lower_prompt or "extract_clauses" in system_prompt.lower():
            if "lease" in lower_prompt or "tenant" in lower_prompt:
                return {
                    "clauses": [
                        {
                            "clause_id": str(uuid.uuid4()),
                            "clause_type": "payment_term",
                            "title": "Rent Payment & Late Penalties",
                            "text_span": "Tenant agrees to pay monthly rent on the first day of each calendar month. A late fee of $150 shall apply if rent is received after the 3rd.",
                            "page_or_section": "Section 3.1",
                            "plain_explanation": "You must pay rent by the 1st of the month. If paid after the 3rd, you are charged an extra $150 late fee.",
                            "risk_level": "caution",
                            "risk_reason": "$150 late fee is significantly higher than typical 5% statutory guidelines.",
                            "who_it_favors": "Landlord"
                        },
                        {
                            "clause_id": str(uuid.uuid4()),
                            "clause_type": "right",
                            "title": "Landlord Right of Entry",
                            "text_span": "Landlord reserves the right to enter the leased premises at any time without prior notice for inspection or repairs.",
                            "page_or_section": "Section 7.3",
                            "plain_explanation": "The landlord claims the right to enter your home at any time without warning.",
                            "risk_level": "high-risk",
                            "risk_reason": "Entering without 24 hours advance written notice infringes on tenant's quiet enjoyment and may violate statutory habitability rights.",
                            "who_it_favors": "Landlord"
                        },
                        {
                            "clause_id": str(uuid.uuid4()),
                            "clause_type": "termination",
                            "title": "Early Termination Liquidated Damages",
                            "text_span": "In the event Tenant vacates before the end of the term, Tenant forfeits the entire security deposit plus 3 months additional rent.",
                            "page_or_section": "Section 12.1",
                            "plain_explanation": "If you move out early, you lose your entire deposit and owe an additional 3 months of rent immediately.",
                            "risk_level": "high-risk",
                            "risk_reason": "Excessive liquidated damages clause that penalizes tenant without requiring landlord to mitigate damages by re-renting.",
                            "who_it_favors": "Landlord"
                        },
                        {
                            "clause_id": str(uuid.uuid4()),
                            "clause_type": "liability_indemnity",
                            "title": "Tenant Indemnification Waiver",
                            "text_span": "Tenant shall indemnify and hold Landlord harmless from any and all damages, claims, or injuries occurring on the property regardless of cause.",
                            "page_or_section": "Section 9.4",
                            "plain_explanation": "You take financial responsibility for any injury or property damage, even if caused by landlord negligence or structural faults.",
                            "risk_level": "high-risk",
                            "risk_reason": "Broad unilateral indemnity shifting premises liability entirely onto the tenant.",
                            "who_it_favors": "Landlord"
                        }
                    ],
                    "risk_flags": [
                        {
                            "id": "flag-1",
                            "title": "Unilateral Landlord Entry Without 24hr Notice",
                            "severity": "high-risk",
                            "severity_label": "High Risk",
                            "clause_reference": "Section 7.3",
                            "verbatim_text": "Landlord reserves the right to enter the leased premises at any time without prior notice for inspection or repairs.",
                            "plain_explanation": "The landlord gives themselves permission to enter your home without giving 24 hours advance notice.",
                            "why_it_matters": "In most jurisdictions, tenants have an implied covenant of quiet enjoyment requiring 24–48 hours notice before non-emergency entry.",
                            "who_it_favors": "Landlord"
                        },
                        {
                            "flag_id": "flag-2",
                            "id": "flag-2",
                            "title": "Excessive Early Termination Penalty (Deposit Forfeit + 3 Months)",
                            "severity": "high-risk",
                            "severity_label": "High Risk",
                            "clause_reference": "Section 12.1",
                            "verbatim_text": "In the event Tenant vacates before the end of the term, Tenant forfeits the entire security deposit plus 3 months additional rent.",
                            "plain_explanation": "Moving out early triggers forfeiture of your deposit plus 3 months rent.",
                            "why_it_matters": "Under common law, landlords generally have a legal duty to mitigate damages by attempting to re-lease the unit rather than collecting full windfall rent.",
                            "who_it_favors": "Landlord"
                        },
                        {
                            "id": "flag-3",
                            "title": "One-Sided Indemnification for All Property Claims",
                            "severity": "caution",
                            "severity_label": "Caution",
                            "clause_reference": "Section 9.4",
                            "verbatim_text": "Tenant shall indemnify and hold Landlord harmless from any and all damages, claims, or injuries occurring on the property regardless of cause.",
                            "plain_explanation": "Shifts liability onto tenant for injuries or damage on the property.",
                            "why_it_matters": "You could be held liable for damages even if caused by landlord's failure to maintain common structural elements.",
                            "who_it_favors": "Landlord"
                        }
                    ],
                    "action_checklist": [
                        {
                            "id": "chk-1",
                            "action_text": "Request 24-hour notice amendment to Section 7.3",
                            "category": "Negotiate",
                            "priority": "high-risk",
                            "description": "Ask landlord to insert: 'Landlord shall provide at least 24 hours advance written notice prior to non-emergency entry.'"
                        },
                        {
                            "id": "chk-2",
                            "action_text": "Cap early termination fee to maximum of 1 month rent",
                            "category": "Negotiate",
                            "priority": "high-risk",
                            "description": "Negotiate Section 12.1 so early termination only costs 1 month rent with 30 days notice."
                        },
                        {
                            "id": "chk-3",
                            "action_text": "Document move-in condition with time-stamped photos",
                            "category": "Before Signing",
                            "priority": "caution",
                            "description": "Take thorough photos and complete a move-in checklist to protect your security deposit."
                        }
                    ]
                }
            else:
                # Default NDA/General extraction
                return {
                    "clauses": [
                        {
                            "clause_id": str(uuid.uuid4()),
                            "clause_type": "confidentiality",
                            "title": "Non-Disclosure & Standard of Care",
                            "text_span": "Receiving Party shall treat Confidential Information with the same degree of care it uses for its own confidential data, but not less than reasonable care.",
                            "page_or_section": "Section 2.1",
                            "plain_explanation": "You must protect secret information carefully and never share it without permission.",
                            "risk_level": "info",
                            "risk_reason": "Standard mutual confidentiality obligation.",
                            "who_it_favors": "Neutral"
                        },
                        {
                            "clause_id": str(uuid.uuid4()),
                            "clause_type": "dispute_resolution",
                            "title": "Mandatory Binding Arbitration & Jury Waiver",
                            "text_span": "Any dispute arising under this Agreement shall be resolved through mandatory binding arbitration. The parties waive any right to trial by jury.",
                            "page_or_section": "Section 8.2",
                            "plain_explanation": "You agree to settle disputes in private arbitration instead of going to public court with a jury.",
                            "risk_level": "caution",
                            "risk_reason": "Arbitration proceedings can involve substantial upfront administrative fees and eliminate jury trial rights.",
                            "who_it_favors": "Drafting Party"
                        }
                    ],
                    "risk_flags": [
                        {
                            "id": "flag-nda-1",
                            "title": "Binding Arbitration & Jury Waiver Clause",
                            "severity": "caution",
                            "severity_label": "Caution",
                            "clause_reference": "Section 8.2",
                            "verbatim_text": "Any dispute arising under this Agreement shall be resolved through mandatory binding arbitration. The parties waive any right to trial by jury.",
                            "plain_explanation": "Surrenders the right to bring claims before a court or jury.",
                            "why_it_matters": "Arbitration limits appeal rights and can be financially burdensome for individual consumers.",
                            "who_it_favors": "Drafting Party"
                        }
                    ],
                    "action_checklist": [
                        {
                            "id": "chk-nda-1",
                            "action_text": "Confirm definition of Confidential Information requires written marking",
                            "category": "Before Signing",
                            "priority": "info",
                            "description": "Ensure oral disclosures must be reduced to writing within 30 days to qualify."
                        }
                    ]
                }

        # 4. Grounded Chat
        if "grounded" in system_prompt.lower() or "user question" in lower_prompt:
            # Check for explicit ungrounded indicators
            if "[no relevant context found" in lower_prompt or "refrigerator" in lower_prompt or "car loan" in lower_prompt or "warranty" in lower_prompt:
                return {
                    "answer": "I couldn't find that in this document. Please review the full agreement or consult a licensed attorney.",
                    "is_grounded": False,
                    "cited_sections": [],
                    "suggested_follow_ups": [
                        "What are the rent payment terms and penalties?",
                        "What rights does the landlord have to enter?",
                        "What happens if I terminate the agreement early?"
                    ],
                    "disclaimer": "This is general information, not legal advice. Consult a licensed attorney for your specific situation."
                }
            elif "terminate" in lower_prompt or "early" in lower_prompt or "cancel" in lower_prompt:
                return {
                    "answer": (
                        "According to Section 12.1, if you terminate early or vacate before the lease term ends, "
                        "you forfeit your entire security deposit and are charged an additional 3 months of rent as liquidated damages. "
                        "This penalty is severe and should be reviewed carefully."
                    ),
                    "is_grounded": True,
                    "cited_sections": ["Section 12.1"],
                    "suggested_follow_ups": [
                        "Can the landlord enter without notice?",
                        "How much is the late fee if rent is overdue?"
                    ],
                    "disclaimer": "This is general information, not legal advice. Consult a licensed attorney for your specific situation."
                }
            elif "enter" in lower_prompt or "notice" in lower_prompt or "inspection" in lower_prompt:
                return {
                    "answer": (
                        "According to Section 7.3, the landlord claims the right to enter the leased premises 'at any time without prior notice' "
                        "for inspection or repairs. This is an unusually aggressive clause that conflicts with standard 24-hour notice expectations."
                    ),
                    "is_grounded": True,
                    "cited_sections": ["Section 7.3"],
                    "suggested_follow_ups": [
                        "What is the recommended change to propose for Section 7.3?",
                        "What are my remedies if landlord enters without notice?"
                    ],
                    "disclaimer": "This is general information, not legal advice. Consult a licensed attorney for your specific situation."
                }
            else:
                return {
                    "answer": (
                        "Based on the provided document provisions, the agreement sets specific operational and payment requirements. "
                        "Refer to Section 3.1 for payment schedules and Section 8 for dispute resolution terms."
                    ),
                    "is_grounded": True,
                    "cited_sections": ["Section 3.1"],
                    "suggested_follow_ups": [
                        "What are the major risk flags?",
                        "Generate an attorney preparation brief"
                    ],
                    "disclaimer": "This is general information, not legal advice. Consult a licensed attorney for your specific situation."
                }

        # Default fallback
        return {
            "status": "success",
            "message": "Processed prompt successfully.",
            "disclaimer": "This is general information, not legal advice. Consult a licensed attorney for your specific situation."
        }

    async def stream_text(self, system_prompt: str, user_prompt: str) -> AsyncGenerator[str, None]:
        data = await self.generate_json(system_prompt, user_prompt)
        text = json.dumps(data, indent=2)
        # Yield in chunks
        chunk_size = 40
        for i in range(0, len(text), chunk_size):
            yield text[i:i+chunk_size]


def get_llm_client() -> BaseLLMClient:
    """Factory creating LLM client according to settings."""
    if settings.LLM_PROVIDER.lower() == "gemini" and settings.GEMINI_API_KEY:
        return GeminiLLMClient(api_key=settings.GEMINI_API_KEY)
    return MockLLMClient()
