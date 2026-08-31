import React, { useState } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Plus, 
  TrendingUp, 
  FileText, 
  Zap, 
  Check, 
  ArrowRight,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';

export interface UnansweredQuestion {
  id: string;
  question: string;
  frequency: number;
  samplePatientQuery: string;
  suggestedAnswer: string;
  suggestedCategory: 'insurance' | 'treatments' | 'logistics' | 'pricing';
  status: 'pending' | 'trained';
}

export const AITrainingCenterPage: React.FC = () => {
  const [questions, setQuestions] = useState<UnansweredQuestion[]>([
    {
      id: 'uq-1',
      question: 'Do you accept Delta Dental Premier and Cigna DPPO?',
      frequency: 26,
      samplePatientQuery: '"Hi, I have Delta Dental Premier through Google. Will my cleanings be 100% covered at Sutter St?"',
      suggestedAnswer: 'Yes! We are in-network with Delta Dental Premier, Cigna DPPO, and MetLife. Standard preventive cleanings and 3D digital X-rays are typically 100% covered with zero out-of-pocket copay.',
      suggestedCategory: 'insurance',
      status: 'pending',
    },
    {
      id: 'uq-2',
      question: 'Do you offer IV sedation for wisdom teeth extraction & surgical procedures?',
      frequency: 19,
      samplePatientQuery: '"I am extremely anxious about getting my bottom wisdom teeth pulled. Can I get sleep sedation?"',
      suggestedAnswer: 'Yes! Dr. Sarah Jensen is certified in both conscious oral sedation and board-certified IV twilight sedation for gentle, pain-free wisdom teeth and implant surgeries.',
      suggestedCategory: 'treatments',
      status: 'pending',
    },
    {
      id: 'uq-3',
      question: 'Is patient parking validated at the Downtown 450 Sutter building?',
      frequency: 14,
      samplePatientQuery: '"Where do I park for my 3 PM appointment today? Is there parking under the building?"',
      suggestedAnswer: 'Yes! We provide 90-minute validated parking at the 450 Sutter Parking Garage directly connected to the medical building elevator.',
      suggestedCategory: 'logistics',
      status: 'pending',
    },
  ]);

  const [coverageScore, setCoverageScore] = useState(94);
  const [trainedCount, setTrainedCount] = useState(142);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleApproveTraining = (id: string) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === id) {
          return { ...q, status: 'trained' };
        }
        return q;
      })
    );

    setCoverageScore(prev => Math.min(99, prev + 2));
    setTrainedCount(prev => prev + 1);
    setToastMessage('✅ New FAQ automatically embedded & indexed in RAG Vector Store!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-purple-500" />
            <span>AI Self-Training & Knowledge Optimizer</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            The AI continuously monitors patient questions it couldn't fully answer and generates suggested knowledge base updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="purple" size="sm">
            Self-Learning Active
          </Badge>
          <Badge variant="success" size="sm">
            {coverageScore}% Knowledge Coverage
          </Badge>
        </div>
      </div>

      {/* 4 Health & Coverage Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <GlassCard className="p-5 space-y-2 border-purple-500/20 bg-purple-500/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Knowledge Coverage</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{coverageScore}%</p>
            <span className="text-xs font-bold text-emerald-500 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +6% this month
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${coverageScore}%` }}
            />
          </div>
        </GlassCard>

        <GlassCard className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Questions Answered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">987</p>
            <span className="text-xs text-slate-400">100% accurate</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Resolved via verified RAG clinic documents</p>
        </GlassCard>

        <GlassCard className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Hallucinations Prevented</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-blue-500 font-mono">17</p>
            <span className="text-xs text-emerald-500 font-bold">Zero bad advice</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Safely routed to human staff or clinical triage</p>
        </GlassCard>

        <GlassCard className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">AI Learned FAQs</span>
            <BookOpen className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{trainedCount}</p>
            <span className="text-xs text-cyan-500 font-bold">Active in RAG</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Self-trained answers approved by practice</p>
        </GlassCard>

      </div>

      {/* Toast alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Suggested Knowledge Base Improvements Queue */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>High-Frequency Unanswered Questions (Auto-Generated Improvements)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Patients asked these questions multiple times. Review the AI-generated answer and click Approve to train your AI instantly.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((q) => (
            <div 
              key={q.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                q.status === 'trained'
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-slate-100/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-400 font-mono text-[11px] font-bold">
                    Asked {q.frequency}x this month
                  </span>
                  <Badge variant={q.suggestedCategory === 'insurance' ? 'primary' : q.suggestedCategory === 'treatments' ? 'purple' : 'neutral'} size="sm">
                    {q.suggestedCategory}
                  </Badge>
                </div>

                {q.status === 'trained' ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Embedded in AI RAG
                  </span>
                ) : (
                  <button
                    onClick={() => handleApproveTraining(q.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/25 transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Approve & Train AI</span>
                  </button>
                )}
              </div>

              {/* Sample patient inquiry */}
              <div className="text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Sample Patient Inquiry:</span>
                <p className="text-slate-700 dark:text-slate-300 italic">
                  {q.samplePatientQuery}
                </p>
              </div>

              {/* Suggested AI Verified Answer */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-black/5 dark:border-white/10 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Suggested Verified Answer for RAG:
                </span>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                  {q.suggestedAnswer}
                </p>
              </div>

            </div>
          ))}
        </div>
      </GlassCard>

    </div>
  );
};
