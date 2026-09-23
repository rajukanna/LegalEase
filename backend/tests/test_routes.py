"""Integration tests for all FastAPI endpoints including multi-tenant security checks."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.utils.security import create_access_token
from app.services.seed_data import seed_sample_documents

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_sample_data():
    """Ensures public seeded documents are loaded for all test runs."""
    seed_sample_documents()


def test_health_check():
    """Verifies that the /health endpoint responds with status healthy."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_guest_token_generation():
    """Verifies that anonymous users can generate a guest JWT session."""
    response = client.post("/api/v1/auth/guest-token")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_list_documents():
    """Verifies that default seeded documents are accessible."""
    response = client.get("/api/v1/documents")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 3
    doc_ids = [d["id"] for d in data["documents"]]
    assert "doc-sample-lease" in doc_ids


def test_upload_invalid_file_type():
    """Verifies that an unsupported or disguised file is rejected with 415."""
    fake_exe_bytes = b"MZ\x90\x00executable content disguised as pdf"
    files = {"file": ("malicious.pdf", fake_exe_bytes, "application/pdf")}
    response = client.post("/api/v1/documents/upload", files=files)
    assert response.status_code == 415
    assert "Unsupported or disguised" in response.json()["detail"]


def test_upload_valid_text_document():
    """Verifies that valid legal text can be uploaded and indexed."""
    text_content = b"AGREEMENT\nSECTION 1. SCOPE\nThis is a valid test document."
    files = {"file": ("test_doc.txt", text_content, "text/plain")}
    response = client.post("/api/v1/documents/upload", files=files)
    assert response.status_code == 201
    data = response.json()
    assert data["document"]["filename"] == "test_doc.txt"


def test_cross_tenant_document_access_forbidden():
    """Verifies that User B cannot access User A's private document (403 Forbidden)."""
    # 1. Upload a document as User A
    token_user_a = create_access_token("usr-tenant-a", "userA@test.com")
    headers_a = {"Authorization": f"Bearer {token_user_a}"}

    text_content = b"CONFIDENTIAL\nSECTION 1. PRIVATE\nPrivate confidential document for user A."
    files = {"file": ("private_a.txt", text_content, "text/plain")}
    res_upload = client.post("/api/v1/documents/upload", files=files, headers=headers_a)
    assert res_upload.status_code == 201
    doc_id = res_upload.json()["document"]["id"]

    # 2. Attempt to retrieve or analyze this document as User B
    token_user_b = create_access_token("usr-tenant-b", "userB@test.com")
    headers_b = {"Authorization": f"Bearer {token_user_b}"}

    res_access = client.get(f"/api/v1/documents/{doc_id}", headers=headers_b)
    assert res_access.status_code == 403
    assert "Access denied" in res_access.json()["detail"]

    # Also assert analyze endpoint enforces the same check
    res_analyze = client.post(f"/api/v1/analyze/{doc_id}", headers=headers_b)
    assert res_analyze.status_code == 403


def test_document_analysis_endpoint():
    """Verifies the /analyze endpoint returns structured intelligence and disclaimers."""
    response = client.post("/api/v1/analyze/doc-sample-lease")
    assert response.status_code == 200
    data = response.json()
    assert "Residential Lease" in data["document_type"]
    assert data["reading_level"] == "Grade 8"
    assert len(data["risk_flags"]) > 0
    assert "disclaimer" in data
    assert "not legal advice" in data["disclaimer"].lower()


def test_compare_endpoint():
    """Verifies the /compare endpoint returns structured diff items."""
    payload = {
        "doc_id_1": "doc-sample-nda-1",
        "doc_id_2": "doc-sample-nda-2"
    }
    response = client.post("/api/v1/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "diff_items" in data
    assert data["total_added"] + data["total_modified"] + data["total_removed"] > 0
    assert "disclaimer" in data


def test_chat_grounded_and_refusal():
    """Verifies grounded chat citations and out-of-scope refusal."""
    # 1. Grounded query
    grounded_req = {
        "document_id": "doc-sample-lease",
        "question": "What happens if I terminate early?"
    }
    res_grounded = client.post("/api/v1/chat", json=grounded_req)
    assert res_grounded.status_code == 200
    data_g = res_grounded.json()
    assert data_g["is_grounded"] is True
    assert len(data_g["citations"]) > 0

    # 2. Ungrounded query (must refuse)
    ungrounded_req = {
        "document_id": "doc-sample-lease",
        "question": "What is the warranty period on the kitchen refrigerator?"
    }
    res_ungrounded = client.post("/api/v1/chat", json=ungrounded_req)
    assert res_ungrounded.status_code == 200
    data_u = res_ungrounded.json()
    assert data_u["is_grounded"] is False or "couldn't find that" in data_u["answer"].lower()


def test_prepare_for_lawyer_brief():
    """Verifies lawyer preparation brief generation and markdown download."""
    res = client.post("/api/v1/prepare-for-lawyer/doc-sample-lease")
    assert res.status_code == 200
    data = res.json()
    assert "recommended_questions" in data
    assert "documents_to_bring" in data
    assert len(data["recommended_questions"]) > 0

    # Markdown download
    res_md = client.get("/api/v1/prepare-for-lawyer/doc-sample-lease/markdown")
    assert res_md.status_code == 200
    assert "text/markdown" in res_md.headers["content-type"]
    assert "# Attorney Consultation Brief" in res_md.text
