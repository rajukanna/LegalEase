# LegalEase Assumptions Log

This document records the foundational assumptions, technical constraints, and operating boundaries for the **LegalEase** project.

---

### 1. Target Jurisdictions Assumed
- **Primary Assumption**: The application focuses on general common-law principles applicable to consumer and small-business agreements in the United States (standard commercial contracts, residential leases, non-disclosure agreements, and SaaS terms of service).
- **Boundary**: The system does not purport to apply state-specific statutory exceptions (e.g., California Civil Code § 1950.5 security deposit limits or New York rent stabilization formulas) unless explicitly provided in the uploaded document. It flags potential legal friction points for attorney review rather than declaring enforceability.

---

### 2. Supported Document Types & Formats
- **Formats**: PDF (`.pdf`), Microsoft Word (`.docx`), plain text (`.txt`), and scanned document images (`.png`, `.jpg`).
- **File Limits**: Maximum file size of 10 MB per document; up to 100 pages per document for responsive analysis.
- **Document Categories**:
  - Residential Leases & Rental Agreements
  - Non-Disclosure Agreements (One-way and Mutual NDAs)
  - Employment Offer Letters & Non-Compete Clauses
  - SaaS Terms of Service & Privacy Policies
  - Independent Contractor / Service Agreements

---

### 3. "Legal Advice" Boundary Definition
- **Educational / Information Tool**: The platform is strictly an information extraction, summarization, and educational tool.
- **No Conclusory Legal Opinions**: The model is instructed never to declare: *"You will win this case"*, *"This contract is illegal"*, or *"You are legally released from this obligation"*.
- **Descriptive & Comparative Framing**: All findings use analytical phrasing:
  - *"Clause 4.2 imposes a unilateral late penalty that is uncommon in standard residential leases."*
  - *"Section 8 waives your right to a jury trial in favor of binding arbitration."*
- **Persistent Disclaimers**: Every screen displaying AI-generated analysis prominently displays:
  > *"This is general information, not legal advice. Consult a licensed attorney for your specific situation."*
- **Attorney Handoff**: Rather than encouraging self-representation, the system provides a structured "Prepare for Lawyer" brief designed to save legal fees during consultations.

---

### 4. LLM Provider & Infrastructure Assumptions
- **Primary Provider**: Google Gemini (`gemini-2.5-flash` or `gemini-1.5-pro`) using the official Google GenAI SDK.
- **Swappability**: Abstracted via `BaseLLMClient` to support Anthropic Claude or OpenAI via standard environment variables.
- **Zero-Key Offline Guarantee**: A deterministic high-fidelity mock engine is included so that test suites, continuous integration, and demo reviews run reliably without external API keys or network latency.

---

### 5. Data Retention & Privacy Assumptions
- **Default Privacy**: User documents are strictly scoped to the authenticated user ID. Cross-tenant document queries are rejected with `403 Forbidden`.
- **Pre-Upload PII Scrubbing**: Users are provided a client-side redaction utility allowing names, SSNs, credit cards, and phone numbers to be masked locally in the browser before transmission.
- **Retention**: Local temporary storage files are ephemeral; production deployments assume encrypted GCS buckets with 30-day lifecycle expiration.
