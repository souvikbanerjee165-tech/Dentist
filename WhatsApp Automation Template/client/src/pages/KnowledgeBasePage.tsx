import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  Search, 
  Sparkles, 
  Layers, 
  Plus,
  Edit3,
  CheckCircle2, 
  BookOpen,
  HelpCircle,
  X
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { DocumentItem } from '../types';
import { FAQItem } from '../types/admin.types';

interface KnowledgeBasePageProps {
  documents: DocumentItem[];
  faqs: FAQItem[];
  onUploadDocument: (name: string, type: DocumentItem['type'], size: string) => void;
  onDeleteDocument: (id: string) => void;
  onAddFAQ: (faq: Omit<FAQItem, 'id' | 'updatedAt'>) => void;
  onUpdateFAQ: (id: string, question: string, answer: string, category: string) => void;
  onDeleteFAQ: (id: string) => void;
}

export const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = ({
  documents,
  faqs,
  onUploadDocument,
  onDeleteDocument,
  onAddFAQ,
  onUpdateFAQ,
  onDeleteFAQ,
}) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'faqs'>('documents');
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);

  // FAQ Form State
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCategory, setFaqCategory] = useState('Pricing & Packages');

  // RAG Search State
  const [testQuery, setTestQuery] = useState('How much is the laser teeth whitening?');
  const [testResult, setTestResult] = useState<{
    retrievedChunk: string;
    similarity: number;
    sourceDoc: string;
    aiAnswer: string;
  } | null>({
    retrievedChunk: 'Laser Whitening & Deep Clean Package: $350. Includes initial consultation, 45-minute laser activation session, and take-home enamel maintenance kit.',
    similarity: 0.94,
    sourceDoc: '2026_Treatment_Pricing_and_Services.pdf',
    aiAnswer: 'Our Laser Whitening & Deep Clean package is $350. It includes the 45-min in-office laser treatment plus a take-home maintenance kit! Would you like to check openings for Friday or Saturday?',
  });

  const [isSimulatingRag, setIsSimulatingRag] = useState(false);

  const handleTestRag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    setIsSimulatingRag(true);
    setTimeout(() => {
      setIsSimulatingRag(false);

      // Check matching FAQ first
      const matchedFaq = faqs.find(
        (f) =>
          f.question.toLowerCase().includes(testQuery.toLowerCase()) ||
          testQuery.toLowerCase().includes(f.question.toLowerCase().slice(0, 10))
      );

      if (matchedFaq) {
        setTestResult({
          retrievedChunk: `FAQ [${matchedFaq.category}]: Q: ${matchedFaq.question} | A: ${matchedFaq.answer}`,
          similarity: 0.98,
          sourceDoc: 'Live FAQ Knowledge Base',
          aiAnswer: `${matchedFaq.answer} Let me know if you would like me to book your slot!`,
        });
      } else {
        setTestResult({
          retrievedChunk: `Matched Context for "${testQuery}": Standard policy states appointments can be rescheduled up to 24 hours prior with 0 penalty. Consultation fee is applied directly to any treatment package booked.`,
          similarity: 0.91,
          sourceDoc: 'Clinic_FAQ_and_Patient_Policies.docx',
          aiAnswer: `Based on your question about "${testQuery}", you can reschedule anytime with 24 hours notice at no fee. Let me know if you would like me to check the schedule for you!`,
        });
      }
    }, 500);
  };

  const handleOpenAddFAQ = () => {
    setEditingFAQ(null);
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqCategory('Pricing & Packages');
    setIsFAQModalOpen(true);
  };

  const handleOpenEditFAQ = (faq: FAQItem) => {
    setEditingFAQ(faq);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqCategory(faq.category);
    setIsFAQModalOpen(true);
  };

  const handleSaveFAQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;

    if (editingFAQ) {
      onUpdateFAQ(editingFAQ.id, faqQuestion, faqAnswer, faqCategory);
    } else {
      onAddFAQ({
        question: faqQuestion,
        answer: faqAnswer,
        category: faqCategory,
      });
    }
    setIsFAQModalOpen(false);
  };

  const handleSimulatedUpload = () => {
    const fileNames = [
      '2026_VIP_Treatment_Guide.pdf',
      'Insurance_and_Copay_Breakdown.pdf',
      'Orthodontic_Aligner_Brochure.docx',
    ];
    const picked = fileNames[Math.floor(Math.random() * fileNames.length)];
    onUploadDocument(picked, 'pricing', '1.1 MB');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Knowledge Base & AI Grounding
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload PDFs or edit FAQs directly. Every update is vector-indexed in real time for RAG.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-900/80 border border-black/5 dark:border-white/5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'documents'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>PDFs & Docs ({documents.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'faqs'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Edit FAQs ({faqs.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Active Tab Content */}
        <div className="lg:col-span-7 space-y-6">
          
          {activeTab === 'documents' ? (
            <>
              {/* Drag and Drop Upload Box */}
              <div
                onClick={handleSimulatedUpload}
                className="group p-8 rounded-3xl border-2 border-dashed border-blue-500/30 hover:border-blue-500/60 bg-blue-500/5 hover:bg-blue-500/10 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer shadow-sm"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Upload PDF, Word (.docx), or TXT Files
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                  Files are automatically split into 500-token chunks with 1536-dim vector embeddings in Supabase.
                </p>
                <span className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-xl shadow-md shadow-blue-500/25">
                  Choose PDF to Ingest
                </span>
              </div>

              {/* Document List */}
              <div className="space-y-2.5">
                {documents.map((doc) => (
                  <GlassCard
                    key={doc.id}
                    className="p-4 flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                        <FileText className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                          {doc.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-300">
                            <Layers className="w-3 h-3 text-purple-500" />
                            {doc.chunksCount} Vector Chunks
                          </span>
                          <span>•</span>
                          <span>{doc.uploadedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Badge variant="success" dot size="sm">
                        Live in RAG
                      </Badge>
                      <button
                        onClick={() => onDeleteDocument(doc.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </>
          ) : (
            /* FAQs Manager */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                  <span>Frequently Asked Questions ({faqs.length})</span>
                </h3>

                <button
                  onClick={handleOpenAddFAQ}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl shadow-md shadow-blue-500/20 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add FAQ</span>
                </button>
              </div>

              <div className="space-y-3">
                {faqs.map((faq) => (
                  <GlassCard key={faq.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider block mb-1">
                          {faq.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Q: {faq.question}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditFAQ(faq)}
                          className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteFAQ(faq.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-black/5 dark:border-white/5">
                      <strong>A:</strong> {faq.answer}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Updated {faq.updatedAt}</span>
                      <span className="text-emerald-500 font-medium">✓ Indexed</span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right 5 Cols: Live RAG Test Simulator */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard className="p-5 space-y-4 border-blue-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  RAG Vector Playground
                </h3>
              </div>
              <Badge variant="purple" size="sm">
                Real-Time RAG
              </Badge>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Test how new FAQs and uploaded PDFs immediately update AI answers.
            </p>

            <form onSubmit={handleTestRag} className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Ask a Customer Question
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder="e.g. Do you accept MetLife insurance?"
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
                <button
                  type="submit"
                  disabled={isSimulatingRag}
                  className="px-3 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-500/20 active:scale-95 transition-all"
                >
                  {isSimulatingRag ? 'Searching...' : 'Test'}
                </button>
              </div>
            </form>

            {testResult && (
              <div className="space-y-3 pt-3 border-t border-black/5 dark:border-white/10 text-xs">
                
                {/* 1. Retrieved Chunk */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Retrieved Knowledge Chunk</span>
                    <span className="text-emerald-500 font-mono">
                      Cosine Sim: {Math.round(testResult.similarity * 100)}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-mono">
                    "{testResult.retrievedChunk}"
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Source: {testResult.sourceDoc}
                  </span>
                </div>

                {/* 2. Generated Output */}
                <div className="space-y-1 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 dark:text-purple-400 block">
                    Generated WhatsApp Reply
                  </span>
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-slate-900 dark:text-slate-100 text-xs leading-relaxed">
                    {testResult.aiAnswer}
                  </div>
                </div>

              </div>
            )}
          </GlassCard>
        </div>

      </div>

      {/* Add / Edit FAQ Modal */}
      {isFAQModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingFAQ ? 'Edit FAQ Item' : 'Add New FAQ Question & Answer'}
              </h3>
              <button
                onClick={() => setIsFAQModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFAQ} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={faqCategory}
                  onChange={(e) => setFaqCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Pricing & Packages">Pricing & Packages</option>
                  <option value="Policies & Cancellations">Policies & Cancellations</option>
                  <option value="Insurance & Payments">Insurance & Payments</option>
                  <option value="Location & Hours">Location & Hours</option>
                  <option value="Special Promotions">Special Promotions</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Question</label>
                <input
                  type="text"
                  placeholder="e.g. Do you accept walk-ins on weekends?"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Answer</label>
                <textarea
                  rows={4}
                  placeholder="Write the exact answer the AI should deliver to patients..."
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFAQModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-500/25 active:scale-95"
                >
                  {editingFAQ ? 'Update FAQ' : 'Save FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
