import React, { useState, useRef } from 'react';
import { UploadCloud, AlertTriangle, Shield, Lock } from 'lucide-react';
import { DocumentMetadata } from '../../types/legal';
import { api } from '../../services/api';

interface UploadZoneProps {
  onUploadSuccess: (doc: DocumentMetadata) => void;
  onSelectSample: (docId: string) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUploadSuccess, onSelectSample }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPiiModal, setShowPiiModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [redactPii, setRedactPii] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setErrorMsg(null);

    // Validate size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File exceeds the 10 MB maximum limit. Please select a smaller document.');
      return;
    }

    // Validate extension
    const validExtensions = ['.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setErrorMsg('Unsupported format. Please upload a PDF, DOCX, TXT, PNG, or JPG file.');
      return;
    }

    setPendingFile(file);
    setShowPiiModal(true);
  };

  const processUpload = async () => {
    if (!pendingFile) return;
    setShowPiiModal(false);
    setIsUploading(true);
    setUploadProgress(20);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
    }, 200);

    try {
      const newDoc = await api.uploadDocument(pendingFile);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        onUploadSuccess(newDoc);
      }, 400);
    } catch (err: any) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setErrorMsg(err.message || 'Failed to upload document. Please check the file format.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      {/* Quick Demo Pre-seed Banner */}
      <div className="mb-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-sm dark:border-blue-900/60 dark:from-blue-950/40 dark:to-indigo-950/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              ⚡ Zero-Setup Hackathon Demo
            </span>
            <h2 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
              Try LegalEase Instantly with Pre-Loaded Contracts
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Select a sample document below to test automatic classification, Grade-8 summarization, and risk flagging:
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => onSelectSample('doc-sample-lease')}
              className="flex-1 sm:flex-none rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 transition focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Residential Lease
            </button>
            <button
              onClick={() => onSelectSample('doc-sample-nda-1')}
              className="flex-1 sm:flex-none rounded-lg bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-slate-700 transition dark:bg-slate-700 dark:hover:bg-slate-600 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Mutual NDA
            </button>
          </div>
        </div>
      </div>

      {/* Main Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
          }
        }}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-950/20'
            : 'border-slate-300 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          aria-label="Upload legal contract file"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
          accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
          className="hidden"
          id="legal-doc-upload"
        />

        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-950 dark:text-blue-400">
          <UploadCloud className="h-8 w-8" aria-hidden="true" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Upload Any Legal Agreement or Policy
        </h3>
        <p className="mt-1 max-w-md text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Drag and drop your PDF, DOCX, or text file here, or browse your device.
        </p>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
          >
            Browse Files
          </button>
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
          <span>Supported: PDF, DOCX, TXT, PNG</span>
          <span>•</span>
          <span>Max: 10 MB</span>
          <span>•</span>
          <span>Sniff Verified</span>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="mt-6 w-full max-w-md" role="status" aria-live="polite">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Extracting & Chunking Clauses...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div
            role="alert"
            className="mt-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300 max-w-md"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <p className="text-left">{errorMsg}</p>
          </div>
        )}
      </div>

      {/* PII Privacy & Client Redaction Modal */}
      {showPiiModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pii-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:border dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 id="pii-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                  Privacy & PII Protection Notice
                </h3>
                <p className="text-xs text-slate-500">Notice prior to processing</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Your document ({pendingFile?.name}) will be parsed to extract clauses and generate plain-language explanations.
              </p>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                <div className="flex items-start gap-2">
                  <Lock className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
                  <p>
                    <strong>Client-Side PII Redaction:</strong> We automatically mask Social Security Numbers, account numbers, and phone numbers before analysis.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="pii-redact-checkbox"
                checked={redactPii}
                onChange={(e) => setRedactPii(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <label htmlFor="pii-redact-checkbox" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                Enable automatic PII masking (Recommended)
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPiiModal(false)}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={processUpload}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 transition"
              >
                Continue & Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
