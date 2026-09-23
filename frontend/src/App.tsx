import React, { useState, useEffect, useCallback } from 'react';
import { SidebarNav } from './components/common/SidebarNav';
import { TopHeader } from './components/common/TopHeader';
import { ModernDashboard } from './components/dashboard/ModernDashboard';
import { LoginPage } from './components/auth/LoginPage';
import { DisclaimerBanner } from './components/common/DisclaimerBanner';
import { UploadZone } from './components/upload/UploadZone';
import { DocumentViewer } from './components/workspace/DocumentViewer';
import { RiskFlagPanel } from './components/analysis/RiskFlagPanel';
import { SummaryPanel } from './components/analysis/SummaryPanel';
import { ChatPanel } from './components/chat/ChatPanel';
import { CompareView } from './components/compare/CompareView';
import { LawyerBriefModal } from './components/export/LawyerBriefModal';
import { GuidedTourModal } from './components/common/GuidedTourModal';
import { AuthModal } from './components/auth/AuthModal';
import { DocumentMetadata, DocumentDetail, DocumentAnalysisResponse, RiskFlag, User } from './types/legal';
import { api } from './services/api';
import { AlertTriangle, BookOpen, MessageSquare, Plus, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  // Authentication & Entry State: Starts with login page if not authenticated
  const [currentUser, setCurrentUser] = useState<User | null>(() => api.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('legalease_token') && !!api.getCurrentUser();
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'signin' | 'signup'>('signin');

  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analyze' | 'compare' | 'brief'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Documents & Intelligence State (Clean slate: NO pre-loaded demo documents)
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
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

  const loadDocument = useCallback(async (docId: string) => {
    if (!docId) return;
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
  }, []);

  const refreshUserDocuments = useCallback(async () => {
    try {
      const docs = await api.listDocuments();
      // Remove all pre-loaded demo/sample documents to maintain clean personal workspace
      const userOnlyDocs = docs.filter((d) => !d.id.startsWith('doc-sample') && d.owner_id !== 'system');
      setDocuments(userOnlyDocs);

      if (userOnlyDocs.length > 0) {
        loadDocument(userOnlyDocs[0].id);
      } else {
        setSelectedDocId('');
        setCurrentDocDetail(null);
        setCurrentAnalysis(null);
      }
    } catch (e) {
      console.error('Failed to load user documents', e);
    }
  }, [loadDocument]);

  // Restore authenticated session on mount if token is present
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('legalease_token');
      if (token) {
        try {
          const user = await api.getMe();
          setCurrentUser(user);
          setIsAuthenticated(true);
          await refreshUserDocuments();
        } catch {
          // Token invalid, require login
          api.logout();
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      }
    };
    restoreSession();
  }, [refreshUserDocuments]);

  // Handle successful login or registration
  const handleAuthSuccess = async (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    await refreshUserDocuments();
  };

  // Handle continuing as guest from login page
  const handleContinueAsGuest = async () => {
    setIsLoading(true);
    try {
      await api.initGuestSession();
      const guestUser = api.getCurrentUser();
      setCurrentUser(guestUser);
      setIsAuthenticated(true);
      await refreshUserDocuments();
    } catch (err) {
      console.error('Failed to initialize guest session', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user logout: returns immediately to login page
  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setDocuments([]);
    setSelectedDocId('');
    setCurrentDocDetail(null);
    setCurrentAnalysis(null);
    setActiveTab('dashboard');
  };

  // Direct file upload from dashboard drag-and-drop
  const handleDirectFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const newDoc = await api.uploadDocument(file);
      setDocuments((prev) => [newDoc, ...prev]);
      await loadDocument(newDoc.id);
      setActiveTab('analyze');
    } catch (err) {
      console.error('Failed to upload file directly', err);
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

  // 1. START WITH LOGIN PAGE IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={handleAuthSuccess}
        onContinueAsGuest={handleContinueAsGuest}
      />
    );
  }

  // 2. MAIN APPLICATION (FLOATING ROUNDED CONTAINER MATCHING REFERENCE IMAGE)
  return (
    <div className="relative min-h-screen w-full bg-[#b8c8c2] flex items-center justify-center p-3 sm:p-5 lg:p-6 overflow-hidden font-sans">
      {/* Background Organic Wave Curves */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-35"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1600 1200"
        fill="none"
      >
        <path
          d="M-200 400 C 300 200, 500 700, 1100 400 C 1400 250, 1600 600, 1900 450"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="3"
        />
        <path
          d="M-100 700 C 400 500, 700 900, 1300 650 C 1600 550, 1800 800, 2000 750"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2.5"
        />
        <path
          d="M-50 150 C 500 350, 800 50, 1400 300 C 1700 400, 1900 150, 2100 250"
          stroke="rgba(45,75,65,0.15)"
          strokeWidth="2"
        />
      </svg>

      {/* Floating Rounded Central Frame */}
      <div className="relative z-10 flex h-[92vh] w-full max-w-[1500px] overflow-hidden rounded-[36px] sm:rounded-[42px] bg-white shadow-2xl border border-white/80 dark:bg-slate-900 dark:border-slate-800">
        {/* Left Vertical Sidebar Navbar */}
        <SidebarNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenUpload={() => setShowUploadModal(true)}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onOpenTour={() => setShowTour(true)}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-slate-900">
          {/* Top Header Navbar */}
          <TopHeader
            currentUser={currentUser}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onLogout={handleLogout}
            onOpenAuthModal={() => {
              setAuthModalInitialTab('signin');
              setShowAuthModal(true);
            }}
          />

          {/* Body Views */}
          <main className="flex-1 overflow-hidden bg-slate-50/40 dark:bg-slate-950/40">
            {/* View 1: Modern Dashboard (Pastel Cards, Calendar & Metrics) */}
            {activeTab === 'dashboard' && (
              <ModernDashboard
                documents={documents}
                onSelectDocument={(id) => {
                  loadDocument(id);
                  setActiveTab('analyze');
                }}
                onOpenUpload={() => setShowUploadModal(true)}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onUploadFile={handleDirectFileUpload}
              />
            )}

            {/* View 2: Document Workspace */}
            {activeTab === 'analyze' && (
              <div className="flex h-full flex-col">
                {/* Workspace Action Ribbon */}
                <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-6 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {currentDocDetail?.metadata.filename || 'Document Workspace'}
                    </span>
                    {currentAnalysis && (
                      <span className="rounded-md bg-[#d6eee6] px-2.5 py-0.5 text-[11px] font-semibold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                        {currentAnalysis.document_type}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Upload Document</span>
                    </button>

                    {selectedDocId && (
                      <button
                        onClick={() => loadDocument(selectedDocId)}
                        disabled={isLoading}
                        className="flex items-center gap-1 rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
                        aria-label="Refresh analysis"
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Workspace Content */}
                {isLoading ? (
                  <div className="flex flex-1 items-center justify-center p-12 text-sm text-slate-500">
                    <RefreshCw className="h-5 w-5 animate-spin text-slate-700 dark:text-slate-300 mr-2" />
                    <span>Analyzing contract clauses and checking risk guardrails...</span>
                  </div>
                ) : currentDocDetail && currentAnalysis ? (
                  <div className="grid flex-1 grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden">
                    {/* Left Pane: Original Document Viewer (7 cols) */}
                    <section
                      aria-label="Original Contract Text with Clause Highlighting"
                      className="lg:col-span-7 h-full overflow-hidden"
                    >
                      <DocumentViewer
                        document={currentDocDetail}
                        highlightQuery={highlightQuery || searchQuery}
                        activeClauseId={activeFlag?.clause_id}
                      />
                    </section>

                    {/* Right Pane: Intelligence & Risk Panel (5 cols) */}
                    <section
                      aria-label="Legal Intelligence and Risk Panel"
                      className="lg:col-span-5 flex flex-col h-full rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
                    >
                      {/* Sub-tab switcher */}
                      <div className="flex border-b border-slate-200/70 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-950 p-1.5 gap-1">
                        <button
                          onClick={() => setAnalysisSubTab('risks')}
                          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold transition-all ${
                            analysisSubTab === 'risks'
                              ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                          }`}
                        >
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                          <span>Risks ({currentAnalysis.risk_flags.length})</span>
                        </button>

                        <button
                          onClick={() => setAnalysisSubTab('summary')}
                          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold transition-all ${
                            analysisSubTab === 'summary'
                              ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                          }`}
                        >
                          <BookOpen className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                          <span>Summary</span>
                        </button>

                        <button
                          onClick={() => setAnalysisSubTab('chat')}
                          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold transition-all ${
                            analysisSubTab === 'chat'
                              ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                          }`}
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
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
                  <div className="flex flex-1 items-center justify-center p-6">
                    <UploadZone
                      onUploadSuccess={(doc) => {
                        setDocuments((prev) => [doc, ...prev]);
                        loadDocument(doc.id);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* View 3: Compare Contracts */}
            {activeTab === 'compare' && <CompareView documents={documents} />}

            {/* View 4: Attorney Preparation Brief */}
            {activeTab === 'brief' && <LawyerBriefModal documentId={selectedDocId} />}
          </main>

          {/* Persistent Legal Disclaimer Footer */}
          <DisclaimerBanner variant="footer" />
        </div>
      </div>

      {/* Upload Modal (if triggered via navbar or quick action) */}
      {showUploadModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-3xl rounded-[32px] bg-white p-6 shadow-2xl dark:bg-slate-900 relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              aria-label="Close upload dialog"
            >
              ✕
            </button>
            <UploadZone
              onUploadSuccess={(doc) => {
                setDocuments((prev) => [doc, ...prev]);
                loadDocument(doc.id);
                setActiveTab('analyze');
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
          setActiveTab('analyze');
          setShowTour(false);
        }}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setShowTour(false);
        }}
      />

      {/* Auth Modal (if triggered from header) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialTab={authModalInitialTab}
      />
    </div>
  );
};

export default App;
