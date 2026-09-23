/**
 * Typed API Client for LegalEase backend services.
 */

import {
  DocumentMetadata,
  DocumentDetail,
  DocumentAnalysisResponse,
  DocumentCompareResponse,
  ChatCitation,
  LawyerPrepBrief
} from '../types/legal';

const API_BASE = '/api/v1';

let authToken: string | null =
  typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('legalease_token') : null;

export const setAuthToken = (token: string) => {
  authToken = token;
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('legalease_token', token);
  }
};

const getHeaders = (isJson = true): HeadersInit => {
  const headers: Record<string, string> = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

export const api = {
  // Auth
  async initGuestSession(): Promise<string> {
    try {
      const res = await fetch(`${API_BASE}/auth/guest-token`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to obtain guest session');
      const data = await res.json();
      setAuthToken(data.access_token);
      return data.access_token;
    } catch (e) {
      console.warn('Backend not responding or offline, using demo fallback token', e);
      const fallbackToken = 'demo-offline-token';
      setAuthToken(fallbackToken);
      return fallbackToken;
    }
  },

  // Documents
  async listDocuments(): Promise<DocumentMetadata[]> {
    const res = await fetch(`${API_BASE}/documents`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch documents');
    const data = await res.json();
    return data.documents;
  },

  async getDocument(docId: string): Promise<DocumentDetail> {
    const res = await fetch(`${API_BASE}/documents/${docId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch document detail');
    return res.json();
  },

  async uploadDocument(file: File): Promise<DocumentMetadata> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: getHeaders(false),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    const data = await res.json();
    return data.document;
  },

  // Analysis
  async analyzeDocument(docId: string, forceRefresh = false): Promise<DocumentAnalysisResponse> {
    const res = await fetch(`${API_BASE}/analyze/${docId}?force_refresh=${forceRefresh}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to analyze document');
    return res.json();
  },

  // Comparison
  async compareDocuments(docId1: string, docId2: string): Promise<DocumentCompareResponse> {
    const res = await fetch(`${API_BASE}/compare`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ doc_id_1: docId1, doc_id_2: docId2 }),
    });
    if (!res.ok) throw new Error('Failed to compare documents');
    return res.json();
  },

  // Chat
  async askQuestion(docId: string, question: string): Promise<{
    answer: string;
    is_grounded: boolean;
    citations: ChatCitation[];
    suggested_follow_ups: string[];
    disclaimer: string;
  }> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ document_id: docId, question }),
    });
    if (!res.ok) throw new Error('Failed to ask question');
    return res.json();
  },

  // Lawyer Brief
  async generateLawyerBrief(docId: string): Promise<LawyerPrepBrief> {
    const res = await fetch(`${API_BASE}/prepare-for-lawyer/${docId}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to generate lawyer brief');
    return res.json();
  },

  async downloadBriefMarkdown(docId: string): Promise<string> {
    const res = await fetch(`${API_BASE}/prepare-for-lawyer/${docId}/markdown`, {
      headers: getHeaders(false),
    });
    if (!res.ok) throw new Error('Failed to download markdown');
    return res.text();
  }
};
