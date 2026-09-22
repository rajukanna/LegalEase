# LegalEase — 3-Minute Demo Script for Hackathon Evaluators

## Problem Statement
Every day, millions of people sign leases, employment agreements, SaaS terms, and NDAs without reading or understanding what rights they are signing away. Legal jargon is intentionally dense, hiring an attorney for everyday document review costs $350–$600/hr, and generic AI tools frequently hallucinate non-existent clauses or provide unauthorized legal advice.

**LegalEase** bridges this gap: a grounded, accessible AI platform that turns complex legal documents into plain-language summaries, color-coded risk flags, side-by-side version comparisons, and grounded Q&A with direct citation links.

---

## 3-Minute Live Demo Flow

### Minute 1: Upload, PII Redaction & Instant Document Intelligence
1. **Landing Page**:
   - Point out the persistent educational disclaimer header: *"This is general information, not legal advice. Consult a licensed attorney for your specific situation."*
2. **One-Click Sample or Upload**:
   - Click the quick-start button: **"Load Sample Residential Lease"** (or drag & drop a PDF).
   - Show the **Client-Side PII Redaction Preview**: demonstrates how SSNs, phone numbers, and names can be masked in the browser before transmission.
3. **Structured Intelligence**:
   - Point out the auto-classification: **Residential Lease Agreement**.
   - Show the **Grade-8 Plain-Language Summary**: key terms, deposit amount, and monthly rent explained clearly.
   - Show the **Suggested Action Checklist**: actions the tenant must take before signing.

---

### Minute 2: Interactive Risk Flags & Grounded Citation Q&A
1. **Multi-Modal Risk Flags**:
   - Point out the 3 risk levels (High Risk, Caution, Info) paired with icons and labels (WCAG AA compliant, not color alone).
   - Click on the **High Risk Flag** (*"Unilateral Landlord Entry Without 24hr Notice"*).
   - Notice how the left pane instantly scrolls to and highlights **Section 7.3** of the contract!
2. **Grounded Conversational Q&A**:
   - In the Chat Panel, click the suggested prompt: *"What penalties apply if I terminate the lease early?"*
   - Watch the answer stream in, accompanied by a citation pill: `[Section 12.1, Page 3]`.
   - Click the citation pill: the document viewer immediately jumps to Section 12.1.
3. **Zero-Hallucination Guardrail Demo**:
   - Type an ungrounded, out-of-scope question: *"What is the warranty period on the kitchen refrigerator?"*
   - Observe the response: The system immediately refuses with *"I couldn't find that in this document."* rather than inventing a warranty term.

---

### Minute 3: Contract Comparison Diff & "Prepare for Lawyer" Brief
1. **Compare Mode**:
   - Click the **"Compare Documents"** tab.
   - Select **"Original Standard NDA"** vs **"Vendor Revised NDA"**.
   - Review the structured diff:
     - Clauses added, modified, or removed.
     - The **"Who It Favors" badge** (e.g., *"Favors Disclosing Party"* vs *"Favors Receiving Party"*).
2. **Generate "Prepare for Lawyer" Brief**:
   - Click **"Export Attorney Brief"**.
   - View the generated 1-page structured attorney packet:
     - Executive summary of key contract facts.
     - List of flagged high-risk clauses with exact page references.
     - Suggested questions to ask the attorney during a 30-minute consultation.
     - Checklist of documents and evidence to bring.
   - Click **Download Markdown / PDF** to save the brief.

---

## Architecture Summary
```
[User Browser] ---> [Client PII Redactor]
                         │
                         ▼
             [FastAPI Security Gateway]
             (Magic Byte Sniff | JWT Isolation | Rate Limit)
                         │
                         ▼
      [Clause-Aware Chunker] ──► [Cosine Vector Store]
                         │                 │
                         ▼                 ▼
          [Swappable LLM Engine: Gemini / Mock]
                         │
                         ▼
         [Grounded Schema Validation & UI Stream]
```
