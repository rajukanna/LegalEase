import React, { useState } from 'react';
import { Send, MessageSquare, Sparkles, Bookmark, ShieldAlert } from 'lucide-react';
import { ChatMessage } from '../../types/legal';
import { api } from '../../services/api';

interface ChatPanelProps {
  documentId: string;
  onCitationClick: (section: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ documentId, onCitationClick }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      sender: 'assistant',
      text: "Hello! I am your grounded legal document assistant. Ask me any question about this agreement. Every answer is strictly grounded in the document text and cited with section references.",
      is_grounded: true,
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQuestions = [
    'What penalties apply if I terminate early?',
    'Does the landlord have right of entry without notice?',
    'What happens to my security deposit?',
    'What is the warranty on refrigerator? (Test Refusal)',
  ];

  const handleSend = async (queryText?: string) => {
    const query = (queryText || inputQuery).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await api.askQuestion(documentId, query);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        is_grounded: response.is_grounded,
        citations: response.citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Unable to reach the intelligence service. Please check your connection or try again.',
        is_grounded: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Grounded Document Q&A
            </h3>
            <p className="text-[10px] text-slate-500">Strictly grounded with citations</p>
          </div>
        </div>
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          Anti-Hallucination
        </span>
      </div>

      {/* Suggested Prompt Pills */}
      <div className="border-b border-slate-100 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-950/40">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
          Suggested Questions
        </span>
        <div className="flex flex-wrap gap-1.5">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-sm hover:border-blue-400 hover:text-blue-700 transition disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-500"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        aria-live="polite"
        role="log"
        aria-label="Conversation with Grounded Legal Assistant"
      >
        {messages.map((msg) => {
          const isAssistant = msg.sender === 'assistant';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                  isAssistant
                    ? 'border border-slate-100 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-100'
                    : 'bg-blue-600 text-white shadow-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Grounding Refusal Indicator */}
                {isAssistant && msg.is_grounded === false && msg.id !== 'init-msg' && (
                  <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-amber-50 p-2 text-[11px] font-medium text-amber-900 border border-amber-200 dark:bg-amber-950/60 dark:border-amber-900 dark:text-amber-300">
                    <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Grounding Guard: Refused speculation beyond document context.</span>
                  </div>
                )}

                {/* Inline Citation Pills */}
                {isAssistant && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 border-t border-slate-200/60 pt-2.5 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                      Source Citations (Click to View)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((c, idx) => (
                        <button
                          key={idx}
                          onClick={() => onCitationClick(c.section_reference)}
                          className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-800 hover:bg-blue-200 transition dark:bg-blue-950 dark:text-blue-300"
                        >
                          <Bookmark className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          <span>
                            {c.section_reference}, Page {c.page_number}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Persistent Disclaimer Badge on AI outputs */}
                {isAssistant && (
                  <div className="mt-2.5 text-[10px] text-slate-400 dark:text-slate-500 italic">
                    General information only. Not legal advice.
                  </div>
                )}
              </div>

              <span className="mt-1 text-[10px] text-slate-400 px-1">{msg.timestamp}</span>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 p-2" aria-live="polite">
            <Sparkles className="h-4 w-4 animate-spin text-blue-600" />
            <span>Consulting document index & grounding citations...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="border-t border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask a grounded question about this agreement..."
            disabled={isLoading}
            aria-label="Ask a question about the document"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            aria-label="Send query"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow hover:bg-blue-700 transition disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
