"""Seed data providing public-domain sample contracts for zero-setup demoing."""

import uuid
from app.models.document import DocumentMetadata, DocumentDetail, DocumentChunk
from app.services.document_store import document_store
from app.services.chunker import LegalChunker
from app.services.vector_store import vector_store

SAMPLE_LEASE_TEXT = """RESIDENTIAL LEASE AGREEMENT

PARTIES:
This Agreement is entered into between Premier Property Management ("Landlord") and Tenant ("Resident").

SECTION 1. PREMISES AND TERM
Landlord hereby leases to Resident the dwelling unit located at 452 Elm Street, Apt 3B, for a term of twelve (12) calendar months, commencing on July 1, 2026, and ending on June 30, 2027.

SECTION 2. MONTHLY RENT
Resident agrees to pay Landlord a monthly rent of $2,400.00. Rent is strictly due on or before the first (1st) day of each calendar month. Payments made after the third (3rd) calendar day shall incur an immediate non-negotiable late fee of $150.00.

SECTION 3. SECURITY DEPOSIT
Upon execution of this Lease, Resident shall deposit with Landlord the sum of $2,400.00 as a Security Deposit. Landlord may apply the Security Deposit toward unpaid rent, cleaning, or structural repairs at Landlord's sole discretion. The remaining balance, if any, shall be returned within sixty (60) days following complete surrender of possession.

SECTION 4. QUIET ENJOYMENT & RULES
Resident shall keep the premises in a clean, sanitary condition. Resident shall not permit excessive noise or conduct disruptive to other building occupants. No pets shall be kept without prior written authorization and payment of a $500.00 non-refundable pet fee.

SECTION 5. MAINTENANCE AND UTILITIES
Resident is responsible for all electricity, internet, and gas utility charges. Resident shall promptly notify Landlord of any plumbing leaks or hazardous conditions.

SECTION 6. SUBLETTING AND ASSIGNMENT
Resident shall not assign this Lease, sublet any portion of the premises, or allow unauthorized guests to occupy the premises for more than fourteen (14) consecutive days without Landlord's express written consent.

SECTION 7. LANDLORD RIGHT OF ENTRY
Landlord reserves the right to enter the leased premises at any time without prior notice for inspection, maintenance, or showing the property to prospective buyers or contractors.

SECTION 8. GOVERNING LAW & JURISDICTION
This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction in which the premises are situated.

SECTION 9. INDEMNIFICATION AND LIABILITY
Resident shall indemnify and hold Landlord harmless from any and all damages, claims, or injuries occurring on the property regardless of cause or fault, including injuries resulting from common area structural defects.

SECTION 10. REPAIR OBLIGATIONS
Minor repairs costing less than $200.00 per occurrence shall be the sole financial responsibility of the Resident, regardless of the cause of the defect.

SECTION 11. AUTOMATIC RENEWAL
Unless either party provides written notice of non-renewal at least sixty (60) days prior to the expiration date, this Lease shall automatically renew for a successive twelve (12) month term at a 10% rent increase.

SECTION 12. EARLY TERMINATION & LIQUIDATED DAMAGES
In the event Resident vacates the premises prior to the expiration of the twelve-month term, Resident forfeits the entire security deposit plus agrees to pay three (3) months additional rent as agreed liquidated damages."""

SAMPLE_NDA_ORIGINAL = """MUTUAL NON-DISCLOSURE AGREEMENT

1. PURPOSE
The parties desire to explore a mutual business transaction regarding cloud software integration ("Purpose").

2. CONFIDENTIAL INFORMATION
"Confidential Information" refers to any proprietary information disclosed by either party to the other that is marked as "Confidential" or reasonably understood to be confidential given the nature of the disclosure.

3. STANDARD OF CARE
Receiving Party agrees to use reasonable care to protect Disclosing Party's Confidential Information, using at least the same degree of care it employs to protect its own sensitive data of like nature.

4. EXCLUSIONS FROM CONFIDENTIALITY
Confidentiality obligations shall not apply to information that: (a) is or becomes publicly known without breach; (b) was already known to Receiving Party prior to disclosure; (c) is independently developed without reference to Confidential Information; or (d) is required to be disclosed pursuant to a lawful court order.

5. TERM OF OBLIGATION
The obligations of non-disclosure shall remain in effect for a period of two (2) years from the date of disclosure.

6. RETURN OF MATERIALS
Upon written request, Receiving Party shall return or destroy all physical and electronic copies of Confidential Information.

7. GOVERNING LAW
This Agreement is governed by the laws of the State of Delaware, without regard to conflict of laws principles."""

SAMPLE_NDA_REVISED = """NON-DISCLOSURE AGREEMENT (VENDOR REVISED VERSION)

1. PURPOSE
The parties desire to explore a commercial software engagement ("Purpose").

2. CONFIDENTIAL INFORMATION
"Confidential Information" refers to all trade secrets, customer records, technical source code, financial projections, and operational data disclosed by Disclosing Party, whether marked confidential or communicated orally, visually, or electronically.

3. STANDARD OF CARE & RESTRICTIONS
Receiving Party agrees to hold all Confidential Information in strictest confidence and shall not disclose, copy, reverse engineer, or decompile any materials without prior written consent.

4. EXCLUSIONS
Information is excluded only if Receiving Party proves by clear and convincing documentary evidence that such information was in the public domain prior to disclosure.

5. EXTENDED TERM OF OBLIGATION
The obligations of confidentiality shall remain in effect in perpetuity for trade secrets and for a period of five (5) years for all other Confidential Information.

6. MANDATORY BINDING ARBITRATION & JURY WAIVER
Any dispute, controversy, or claim arising out of or relating to this Agreement shall be settled by mandatory binding arbitration administered in New York City. Each party expressly waives any right to a trial by jury or participation in class actions.

7. INDEMNIFICATION FOR BREACH
Receiving Party agrees to indemnify, defend, and hold harmless Disclosing Party from all attorney fees, forensic audit expenses, and consequential damages arising from any suspected breach of confidentiality."""


def seed_sample_documents():
    """Initializes public sample documents in the document store."""
    samples = [
        ("doc-sample-lease", "Standard Residential Lease Agreement.pdf", "application/pdf", SAMPLE_LEASE_TEXT, "Residential Lease Agreement"),
        ("doc-sample-nda-1", "Original Mutual Non-Disclosure Agreement.pdf", "application/pdf", SAMPLE_NDA_ORIGINAL, "Non-Disclosure Agreement"),
        ("doc-sample-nda-2", "Revised Vendor NDA (Comparison Version).pdf", "application/pdf", SAMPLE_NDA_REVISED, "Non-Disclosure Agreement"),
    ]

    for doc_id, filename, content_type, text, detected_type in samples:
        pages = [{"page_number": 1, "text": text}]
        chunks = LegalChunker.chunk_document(pages)

        metadata = DocumentMetadata(
            id=doc_id,
            owner_id="system",  # Public sample accessible to all users
            filename=filename,
            content_type=content_type,
            file_size_bytes=len(text.encode("utf-8")),
            extracted_text_preview=text[:250],
            total_characters=len(text),
            total_pages=1,
            total_chunks=len(chunks),
            detected_type=detected_type
        )

        detail = DocumentDetail(
            metadata=metadata,
            full_text=text,
            chunks=chunks
        )

        document_store.save_document(detail)
        vector_store.index_document(doc_id, chunks)
