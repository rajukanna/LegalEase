# LegalEase System Architecture

LegalEase provides an end-to-end, grounded, AI-assisted legal document understanding system. It transforms complex, dense contracts and policies into plain-language summaries, color-coded risk flags, side-by-side diffs, and grounded conversational Q&A.

## Architecture Diagram

```mermaid
graph TD
    subgraph Client["Frontend (React + TypeScript + Vite + Tailwind)"]
        UI[User Interface & Workspace]
        PII[Client-Side PII Redaction Regex Pass]
        DocViewer[Dual-Pane Document Viewer]
        RiskPanel[Risk Flag & Clause Panel]
        ChatUI[Grounded Chat with Citation Pills]
        CompareUI[Two-Pane Comparison Diff Viewer]
        BriefExport[Attorney Prep Brief Exporter]
    end

    subgraph Gateway["API Gateway & Middleware (FastAPI)"]
        Auth[JWT Authentication & Multi-Tenant Isolation]
        Sniff[Magic Byte & Size File Sniffer]
        RateLimit[Sliding Window Rate Limiter]
        SecHeaders[Security Headers & CSP]
    end

    subgraph Processing["Document Intelligence Pipeline"]
        Parser[Text & OCR Parser PyMuPDF / docx]
        Chunker[Semantic Clause-Aware Chunker]
        VectorStore[(In-Memory / Persistent Vector Store)]
        EmbedCache[(Embedding & Query LRU Cache)]
    end

    subgraph GenAI["GenAI Prompting & LLM Layer"]
        PromptEngine[Versioned Prompt Templates]
        LLMClient{Swappable LLM Provider}
        Gemini[Google Gemini 2.5 Flash]
        Anthropic[Anthropic Claude / OpenAI]
        Mock[Deterministic Offline Mock LLM]
        Guard[Grounding & Refusal Verification]
    end

    subgraph Storage["Storage Layer"]
        DB[(Local SQLite / Cloud SQL)]
        FileStore[(Local Uploads / GCS Bucket)]
    end

    %% Flow connections
    UI -->|1. Upload File with PII Check| PII
    PII -->|2. Validated Upload| Sniff
    Sniff --> Auth
    Auth --> RateLimit
    RateLimit --> Parser
    Parser --> Chunker
    Chunker --> EmbedCache
    EmbedCache --> VectorStore
    Parser --> FileStore

    %% Analysis flow
    RiskPanel -->|Analyze Request| PromptEngine
    PromptEngine --> LLMClient
    LLMClient --> Gemini
    LLMClient --> Anthropic
    LLMClient --> Mock
    LLMClient --> Guard
    Guard --> RiskPanel

    %% Chat flow
    ChatUI -->|Ask Grounded Question| VectorStore
    VectorStore -->|Retrieve Top-K Clause Chunks| PromptEngine
    PromptEngine --> LLMClient
    LLMClient -->|Stream Answer + Clause Citations| ChatUI

    %% Compare flow
    CompareUI -->|Compare 2 Versions| PromptEngine
    PromptEngine --> LLMClient
    LLMClient --> CompareUI

    %% Export flow
    BriefExport -->|Generate Lawyer Prep Brief| DB
```

## Core Components

1. **Client-Side Layer**:
   - Built with React 18, TypeScript, and Vite.
   - Zero-dependency client-side regex/NER scanner detects and masks sensitive PII (SSNs, account numbers, names, phone numbers) before files leave the browser.
   - WCAG AA accessible interface with dual-pane layout: original contract on the left, plain-language breakdown and risk indicators on the right.
   - Grounded citations link directly to line numbers and text spans in the document.

2. **Backend API (FastAPI)**:
   - Strict Pydantic models for request/response validation.
   - JWT authentication ensuring strict multi-tenant isolation (users cannot access another tenant's documents).
   - Security filters: magic-byte content validation, rate limiting, and prompt injection isolation using strict XML delimitation.

3. **Document Ingestion & Semantic Chunking**:
   - `PyMuPDF` (`fitz`) and `python-docx` extract structured paragraphs and section titles.
   - Clause-aware chunker identifies legal structures (`Section 1.2`, `ARTICLE IV`, numbered clauses) preserving semantic context rather than cutting off sentences arbitrarily.

4. **Vector Retrieval & Swappable LLM Engine**:
   - Vector store computes cosine similarity across embedded chunks.
   - Grounding check: queries with low retrieval relevance immediately trigger fallback refusal (*"I couldn't find that in this document."*).
   - LLM provider abstraction supports Google Gemini, Anthropic Claude, and an offline Deterministic Mock Provider for instant, zero-key evaluation.
