import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { DisclaimerBanner } from './components/common/DisclaimerBanner';
import { UploadZone } from './components/upload/UploadZone';
import { DocumentViewer } from './components/workspace/DocumentViewer';
import { RiskFlagPanel } from './components/analysis/RiskFlagPanel';
import { SummaryPanel } from './components/analysis/SummaryPanel';
import { ChatPanel } from './components/chat/ChatPanel';
import { CompareView } from './components/compare/CompareView';
import { LawyerBriefModal } from './components/export/LawyerBriefModal';
import { GuidedTourModal } from './components/common/GuidedTourModal';
import { DocumentMetadata, DocumentDetail, DocumentAnalysisResponse, RiskFlag } from './types/legal';
import { api } from './services/api';
import { AlertTriangle, BookOpen, MessageSquare, Plus, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'compare' | 'brief'>('analyze');
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('doc-sample-lease');
  const [currentDocDetail, setCurrentDocDetail] = useState<DocumentDetail | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<DocumentAnalysisResponse | null>(null);

  // Right pane sub-tab in Document Workspace
  const [analysisSubTab, setAnalysisSubTab] = useState<'risks' | 'summary' | 'chat'>('risks');
  const [activeFlag, setActiveFlag] = useState<RiskFlag | null>(null);
  const [highlightQuery, setHighlightQuery] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Apply dark mode class to root document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initial load: authenticate guest session and fetch documents
  useEffect(() => {
    const init = async () => {
      await api.initGuestSession();
      try {
        const docs = await api.listDocuments();
        setDocuments(docs);
        if (docs.length > 0) {
          loadDocument(docs[0].id);
        }
      } catch (e) {
        console.error('Failed to load initial documents', e);
      }
    };
    init();
  }, []);

  const loadDocument = async (docId: string) => {
    setSelectedDocId(docId);
    setIsLoading(true);
    setActiveFlag(null);
    setHighlightQuery(null);

    try {
      const [detail, analysis] = await Promise.all([
        api.getDocument(docId),
        api.analyzeDocument(docId),
      ]);
      setCurrentDocDetail(detail);
      setCurrentAnalysis(analysis);
    } catch (err) {
      console.error('Failed to load document detail and analysis', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFlag = (flag: RiskFlag) => {
    setActiveFlag(flag);
    setHighlightQuery(flag.clause_reference);
  };

  const handleCitationClick = (sectionReference: string) => {
    setHighlightQuery(sectionReference);
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Top Persistent Disclaimer Banner */}
      <DisclaimerBanner variant="top" />

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        documents={documents}
        selectedDocId={selectedDocId}
        onSelectDocument={loadDocument}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onOpenTour={() => setShowTour(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'analyze' && (
          <div className="flex h-full flex-col">
            {/* Top Workspace Action Ribbon */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 text-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">
                  {currentDocDetail?.metadata.filename || 'Document Workspace'}
                </span>
                {currentAnalysis && (
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {currentAnalysis.document_type}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Upload Another Document</span>
                </button>

                <button
                  onClick={() => loadDocument(selectedDocId)}
                  disabled={isLoading}
                  className="flex items-center gap-1 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Refresh analysis"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Split Screen Workspace */}
            {isLoading ? (
              <div className="flex flex-1 items-center justify-center p-12 text-sm text-slate-500">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                <span>Running structured legal intelligence pass...</span>
              </div>
            ) : currentDocDetail && currentAnalysis ? (
              <div className="grid flex-1 grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden">
                {/* Left Pane: Original Document with Highlights (7 cols) */}
                <section
                  aria-label="Original Contract Text with Clause Highlighting"
                  className="lg:col-span-7 h-full overflow-hidden"
                >
                  <DocumentViewer
                    document={currentDocDetail}
                    highlightQuery={highlightQuery}
                    activeClauseId={activeFlag?.clause_id}
                  />
                </section>

                {/* Right Pane: Multi-Tab Intelligence Panel (5 cols) */}
                <section
                  aria-label="Legal Intelligence and Risk Panel"
                  className="lg:col-span-5 flex flex-col h-full rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
                >
                  {/* Sub-tab switcher */}
                  <div className="flex border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 p-1.5 gap-1">
                    <button
                      onClick={() => setAnalysisSubTab('risks')}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
                        analysisSubTab === 'risks'
                          ? 'bg-white text-red-700 shadow-sm dark:bg-slate-900 dark:text-red-400'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                      }`}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Risk Flags ({currentAnalysis.risk_flags.length})</span>
                    </button>

                    <button
                      onClick={() => setAnalysisSubTab('summary')}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
                        analysisSubTab === 'summary'
                          ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-300'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                      }`}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Plain Summary</span>
                    </button>

                    <button
                      onClick={() => setAnalysisSubTab('chat')}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
                        analysisSubTab === 'chat'
                          ? 'bg-white text-indigo-700 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                      }`}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Grounded Q&A</span>
                    </button>
                  </div>

                  {/* Sub-tab content */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {analysisSubTab === 'risks' && (
                      <RiskFlagPanel
                        flags={currentAnalysis.risk_flags}
                        activeFlagId={activeFlag?.id}
                        onSelectFlag={handleSelectFlag}
                      />
                    )}

                    {analysisSubTab === 'summary' && (
                      <SummaryPanel analysis={currentAnalysis} />
                    )}

                    {analysisSubTab === 'chat' && (
                      <ChatPanel
                        documentId={selectedDocId}
                        onCitationClick={handleCitationClick}
                      />
                    )}
                  </div>
                </section>
              </div>
            ) : (
              <UploadZone
                onUploadSuccess={(doc) => {
                  setDocuments((prev) => [doc, ...prev]);
                  loadDocument(doc.id);
                }}
                onSelectSample={(sampleId) => loadDocument(sampleId)}
              />
            )}
          </div>
        )}

        {/* Tab 2: Compare Contracts */}
        {activeTab === 'compare' && <CompareView documents={documents} />}

        {/* Tab 3: Attorney Preparation Brief */}
        {activeTab === 'brief' && <LawyerBriefModal documentId={selectedDocId} />}
      </main>

      {/* Upload Modal (if opened from workspace) */}
      {showUploadModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              aria-label="Close upload dialog"
            >
              ✕
            </button>
            <UploadZone
              onUploadSuccess={(doc) => {
                setDocuments((prev) => [doc, ...prev]);
                loadDocument(doc.id);
                setShowUploadModal(false);
              }}
              onSelectSample={(sampleId) => {
                loadDocument(sampleId);
                setShowUploadModal(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Guided Evaluator Tour Modal */}
      <GuidedTourModal
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        onSelectSample={(sampleId) => {
          loadDocument(sampleId);
          setShowTour(false);
        }}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setShowTour(false);
        }}
      />

      {/* Persistent Disclaimer Footer */}
      <DisclaimerBanner variant="footer" />
    </div>
  );
};

export default App;
