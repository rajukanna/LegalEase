import React, { useState, useEffect } from 'react';
import { BookOpen, Download, Copy, Check, FileText, Calendar } from 'lucide-react';
import { LawyerPrepBrief } from '../../types/legal';
import { api } from '../../services/api';

interface LawyerBriefModalProps {
  documentId: string;
}

export const LawyerBriefModal: React.FC<LawyerBriefModalProps> = ({ documentId }) => {
  const [brief, setBrief] = useState<LawyerPrepBrief | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadBrief = async () => {
      setIsLoading(true);
      try {
        const data = await api.generateLawyerBrief(documentId);
        setBrief(data);
      } catch (err) {
        console.error('Failed to load brief', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadBrief();
  }, [documentId]);

  const handleDownloadMarkdown = async () => {
    try {
      const md = await api.downloadBriefMarkdown(documentId);
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Lawyer_Prep_Brief_${brief?.document_name || 'Document'}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed', e);
    }
  };

  const handleCopy = () => {
    if (!brief) return;
    navigator.clipboard.writeText(brief.executive_summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <BookOpen className="h-8 w-8 animate-pulse text-blue-600 mb-2" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Synthesizing Attorney Preparation Dossier...
        </p>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        No brief available. Please select a document to generate.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 border border-slate-200/60 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
            One-Page Dossier
          </span>
          <h2 className="mt-1.5 text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Attorney Consultation Preparation Brief
          </h2>
          <p className="text-xs text-slate-400">
            Targeted summary and specific questions to make your 30-minute legal consultation maximally cost-effective.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-2xs hover:bg-slate-800 transition dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <Download className="h-4 w-4" />
            <span>Download Markdown / PDF</span>
          </button>
        </div>
      </div>

      {/* Persistent Disclaimer Box */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
        <p>
          <strong className="text-slate-800 dark:text-slate-200">Notice to Client & Attorney:</strong> {brief.disclaimer} This document serves as an analytical briefing sheet to assist counsel during consultation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Summary & Questions */}
        <div className="md:col-span-2 space-y-6">
          {/* Executive Summary */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
              1. Executive Summary
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {brief.executive_summary}
            </p>
          </div>

          {/* Recommended Questions */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              2. Strategic Questions to Ask Your Lawyer
            </h3>

            <div className="space-y-3">
              {brief.recommended_questions.map((q, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/40 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {q.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Ref: {q.context_clause}
                    </span>
                  </div>

                  <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    "{q.question}"
                  </h5>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <strong>Reasoning for consultation:</strong> {q.why_to_ask}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Evidence to Bring & Timelines */}
        <div className="space-y-6">
          {/* Documents to bring */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-blue-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Documents to Bring
              </h4>
            </div>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {brief.documents_to_bring.map((doc, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Timelines & Deadlines */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-amber-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Important Timelines
              </h4>
            </div>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {brief.timeline_and_deadlines.map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">⏳</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
