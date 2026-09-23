/**
 * Shared TypeScript type definitions mirroring backend Pydantic models.
 */

export type RiskLevel = 'info' | 'caution' | 'high-risk';

export type ClauseCategory =
  | 'obligation'
  | 'right'
  | 'deadline'
  | 'payment_term'
  | 'termination'
  | 'auto_renewal'
  | 'liability_indemnity'
  | 'dispute_resolution'
  | 'confidentiality'
  | 'other';

export interface DocumentChunk {
  chunk_id: string;
  clause_title: string;
  page_number: number;
  text: string;
  token_count: number;
}

export interface DocumentMetadata {
  id: string;
  owner_id: string;
  filename: string;
  content_type: string;
  file_size_bytes: number;
  upload_timestamp: string;
  extracted_text_preview: string;
  total_characters: number;
  total_pages: number;
  total_chunks: number;
  detected_type?: string;
}

export interface DocumentDetail {
  metadata: DocumentMetadata;
  full_text: string;
  chunks: DocumentChunk[];
}

export interface ExtractedClause {
  clause_id: string;
  clause_type: ClauseCategory;
  title: string;
  text_span: string;
  page_or_section: string;
  plain_explanation: string;
  risk_level: RiskLevel;
  risk_reason?: string;
  who_it_favors?: string;
}

export interface RiskFlag {
  id: string;
  clause_id?: string;
  title: string;
  severity: RiskLevel;
  severity_label: string;
  clause_reference: string;
  verbatim_text: string;
  plain_explanation: string;
  why_it_matters: string;
  who_it_favors: string;
}

export interface ActionChecklistItem {
  id: string;
  action_text: string;
  category: string;
  priority: RiskLevel;
  description: string;
}

export interface DocumentAnalysisResponse {
  document_id: string;
  document_type: string;
  document_type_confidence: number;
  plain_summary: string;
  reading_level: string;
  key_takeaways: string[];
  clauses: ExtractedClause[];
  risk_flags: RiskFlag[];
  action_checklist: ActionChecklistItem[];
  disclaimer: string;
}

export type DiffChangeType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface ClauseDiffItem {
  diff_id: string;
  section_title: string;
  change_type: DiffChangeType;
  original_text?: string;
  revised_text?: string;
  plain_explanation: string;
  who_it_favors: string;
  impact_level: string;
}

export interface DocumentCompareResponse {
  doc_id_1: string;
  doc_id_2: string;
  doc_title_1: string;
  doc_title_2: string;
  summary_of_changes: string;
  overall_favor: string;
  diff_items: ClauseDiffItem[];
  total_added: number;
  total_removed: number;
  total_modified: number;
  disclaimer: string;
}

export interface ChatCitation {
  clause_title: string;
  section_reference: string;
  page_number: number;
  quote_snippet: string;
  relevance_score: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  is_grounded?: boolean;
  citations?: ChatCitation[];
  timestamp: string;
}

export interface LawyerPrepBrief {
  document_id: string;
  document_name: string;
  document_type: string;
  generated_date: string;
  executive_summary: string;
  critical_concerns: RiskFlag[];
  recommended_questions: {
    category: string;
    question: string;
    context_clause: string;
    why_to_ask: string;
  }[];
  documents_to_bring: string[];
  timeline_and_deadlines: string[];
  disclaimer: string;
}
