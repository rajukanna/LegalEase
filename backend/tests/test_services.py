"""Unit tests for backend core services: Parser, Chunker, DiffEngine, and PII Detector."""

import pytest
from fastapi import HTTPException
from app.services.document_parser import DocumentParser
from app.services.chunker import LegalChunker
from app.services.diff_service import ContractDiffEngine
from app.utils.pii_detector import PIIDetector
from app.models.document import DocumentChunk


def test_document_parser_magic_byte_sniffing():
    """Verifies that authentic formats pass sniffing and disguised executables are rejected."""
    # Authentic PDF header
    pdf_bytes = b"%PDF-1.4\n1 0 obj\n<<\n>>\nendobj"
    mime = DocumentParser.sniff_content_type(pdf_bytes, "contract.pdf")
    assert mime == "application/pdf"

    # Authentic text
    txt_bytes = b"This is a standard text agreement."
    mime_txt = DocumentParser.sniff_content_type(txt_bytes, "policy.txt")
    assert mime_txt == "text/plain"

    # Disguised executable masquerading as a PDF (e.g. MZ executable header)
    fake_pdf = b"MZ\x90\x00\x03\x00\x00\x00\x04\x00"
    with pytest.raises(HTTPException) as exc_info:
        DocumentParser.sniff_content_type(fake_pdf, "malicious.pdf")
    assert exc_info.value.status_code == 415

    # Text containing null bytes (binary disguised as text)
    binary_as_txt = b"Text file\x00with null\x00bytes"
    with pytest.raises(HTTPException) as exc_info2:
        DocumentParser.sniff_content_type(binary_as_txt, "notes.txt")
    assert exc_info2.value.status_code == 415


def test_legal_chunker_section_splitting():
    """Verifies that LegalChunker segments text by section boundaries rather than cutting mid-sentence."""
    sample_text = """SECTION 1. PREMISES
Landlord leases the apartment to tenant.

SECTION 2. RENT PAYMENTS
Rent is $2,000 per month payable on the first day.

SECTION 3. SECURITY DEPOSIT
Tenant shall deposit $2,000 upon signing."""

    pages = [{"page_number": 1, "text": sample_text}]
    chunks = LegalChunker.chunk_document(pages)

    assert len(chunks) == 3
    assert "SECTION 1" in chunks[0].clause_title or "Premises" in chunks[0].clause_title
    assert "SECTION 2" in chunks[1].clause_title or "Rent" in chunks[1].clause_title
    assert "SECTION 3" in chunks[2].clause_title or "Security" in chunks[2].clause_title


def test_contract_diff_engine():
    """Verifies that ContractDiffEngine detects additions, deletions, modifications, and favor heuristics."""
    chunks1 = [
        DocumentChunk(chunk_id="c1", clause_title="Section 1. Term", page_number=1, text="Term is 12 months.", token_count=10),
        DocumentChunk(chunk_id="c2", clause_title="Section 2. Renewal", page_number=1, text="Requires 30 days notice to renew.", token_count=10),
    ]

    chunks2 = [
        DocumentChunk(chunk_id="c1", clause_title="Section 1. Term", page_number=1, text="Term is 12 months with unilateral cancellation rights.", token_count=15),
        DocumentChunk(chunk_id="c3", clause_title="Section 3. Mandatory Arbitration", page_number=1, text="All disputes settled by binding arbitration in New York.", token_count=15),
    ]

    diff_res = ContractDiffEngine.compare_documents(
        doc_id_1="doc-1",
        doc_title_1="Original.pdf",
        chunks_1=chunks1,
        doc_id_2="doc-2",
        doc_title_2="Revised.pdf",
        chunks_2=chunks2
    )

    assert diff_res.total_added == 1       # Section 3 was added
    assert diff_res.total_removed == 1     # Section 2 was removed
    assert diff_res.total_modified == 1    # Section 1 was modified
    assert "favor" in diff_res.overall_favor.lower()


def test_pii_detector_scanning_and_redaction():
    """Verifies that sensitive PII (SSN, Phone, Email) is correctly detected and redacted."""
    sensitive_text = "Tenant John Doe with SSN 123-45-6789 and phone (555) 234-5678, contact john@example.com."
    scan_results = PIIDetector.scan_text(sensitive_text)

    assert "SSN" in scan_results
    assert "123-45-6789" in scan_results["SSN"]
    assert "EMAIL" in scan_results
    assert "john@example.com" in scan_results["EMAIL"]

    redacted_text, count = PIIDetector.redact_text(sensitive_text)
    assert count >= 3
    assert "123-45-6789" not in redacted_text
    assert "[REDACTED_SSN]" in redacted_text
    assert "[REDACTED_EMAIL]" in redacted_text
