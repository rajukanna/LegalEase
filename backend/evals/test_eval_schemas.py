"""Quality & Safety Evals: Validates that all sample documents generate strict Pydantic-compliant outputs."""

import os
import pytest
from app.models.analysis import DocumentAnalysisResponse
from app.prompts.classify import CLASSIFY_DOCUMENT_SYSTEM_PROMPT, format_classify_prompt
from app.prompts.summarize import SUMMARIZE_DOCUMENT_SYSTEM_PROMPT, format_summarize_prompt
from app.prompts.extract_clauses import EXTRACT_CLAUSES_SYSTEM_PROMPT, format_extract_clauses_prompt
from app.services.llm_service import MockLLMClient

CORPUS_DIR = os.path.join(os.path.dirname(__file__), "sample_corpus")


@pytest.fixture
def sample_contracts():
    contracts = {}
    for filename in sorted(os.listdir(CORPUS_DIR)):
        if filename.endswith(".txt"):
            filepath = os.path.join(CORPUS_DIR, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                contracts[filename] = f.read()
    return contracts


@pytest.mark.asyncio
async def test_all_sample_contracts_schema_conformance(sample_contracts):
    """Asserts that all 5 sample contracts produce valid JSON matching the Pydantic schema."""
    assert len(sample_contracts) >= 5, "Sample corpus must contain at least 5 legal documents"
    client = MockLLMClient()

    for doc_name, text in sample_contracts.items():
        # 1. Classification
        classify_prompt = format_classify_prompt(text)
        classify_res = await client.generate_json(CLASSIFY_DOCUMENT_SYSTEM_PROMPT, classify_prompt)
        assert "document_type" in classify_res
        assert classify_res.get("confidence", 0) > 0.7

        # 2. Plain Language Summary
        summary_prompt = format_summarize_prompt(text)
        summary_res = await client.generate_json(SUMMARIZE_DOCUMENT_SYSTEM_PROMPT, summary_prompt)
        assert "plain_summary" in summary_res
        assert summary_res.get("reading_level") == "Grade 8"
        assert len(summary_res.get("key_takeaways", [])) > 0
        assert "disclaimer" in summary_res

        # 3. Clause Extraction
        extract_prompt = format_extract_clauses_prompt(text)
        extract_res = await client.generate_json(EXTRACT_CLAUSES_SYSTEM_PROMPT, extract_prompt)
        assert "clauses" in extract_res
        assert "risk_flags" in extract_res
        assert "action_checklist" in extract_res

        # Validate risk flags have non-color text labels and why it matters
        for flag in extract_res["risk_flags"]:
            assert "severity" in flag
            assert "severity_label" in flag
            assert "why_it_matters" in flag
            assert len(flag["why_it_matters"]) > 5
