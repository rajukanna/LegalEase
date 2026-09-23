import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, ArrowLeft, Sparkles, ShieldCheck, Scale, X } from 'lucide-react';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sampleId: string) => void;
  onNavigateTab: (tab: 'analyze' | 'compare' | 'brief') => void;
}

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
  onNavigateTab,
}) => {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else onClose();
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          aria-label="Close guided tour"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Step Counter */}
        <div className="flex items-center gap-2 mb-3">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 border border-slate-200/60 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
            Step {step} of {totalSteps}
          </span>
          <span className="text-xs text-slate-400 font-medium">Product Tour</span>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              <Scale className="h-5 w-5" />
            </div>
            <h3 id="tour-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
              Welcome to LegalEase: Grounded AI Legal Assistant
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              LegalEase translates complex legal contracts into plain Grade-8 English, detects one-sided risk flags, highlights contract version diffs, and provides 100% grounded conversational Q&A.
            </p>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
              <strong>Non-Negotiable Guardrail:</strong> LegalEase displays persistent educational disclaimers across all AI screens, never gives conclusory legal advice, and refuses to speculate outside the text.
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 id="tour-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
              Clause-Level Risk Flags & Click-to-Scroll
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              In the Document Workspace, clauses are categorized by obligation, right, and risk level (High Risk, Caution, Info).
            </p>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Multi-Modal Badges:</strong> Uses color, icons, and text labels (WCAG AA compliant).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Interactive Highlighting:</strong> Click any risk card to automatically scroll and highlight the source clause in the contract!</span>
              </li>
            </ul>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 id="tour-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
              Grounded Chat & Strict Refusal
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Test conversational questions in the Grounded Q&A tab:
            </p>
            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800">
                <strong>Ask:</strong> "What penalties apply if I terminate early?"
                <div className="text-[11px] text-slate-500 mt-1">
                  Returns exact penalties with clickable citation: [Section 12.1, Page 1].
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800">
                <strong>Ask (Ungrounded):</strong> "What is the warranty on refrigerator?"
                <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                  Model refuses: <em>"I couldn't find that in this document."</em>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 id="tour-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
              Contract Diffing & Attorney Prep Brief
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Experience the full suite:
            </p>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-slate-900 dark:text-white font-bold">•</span>
                <span><strong>Compare Versions:</strong> Side-by-side diff showing added/modified clauses and who each change favors.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-900 dark:text-white font-bold">•</span>
                <span><strong>Attorney Prep Brief:</strong> Generates a structured 1-page dossier with questions to ask your attorney, saving hundreds in legal fees.</span>
              </li>
            </ul>
          </div>
        )}

        {/* Modal Controls */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 disabled:opacity-30 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {step === totalSteps ? (
              <button
                onClick={() => {
                  onSelectSample('doc-sample-lease');
                  onNavigateTab('analyze');
                  onClose();
                }}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-2xs hover:bg-slate-800 transition dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <span>Explore Sample Agreement</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-2xs hover:bg-slate-800 transition dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <span>Next</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
