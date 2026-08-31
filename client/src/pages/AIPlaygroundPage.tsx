import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Database, 
  FileText, 
  Sliders, 
  Zap, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Code,
  Layers,
  ChevronRight
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { GeminiHumanEngine } from '../services/geminiHumanEngine';

export const AIPlaygroundPage: React.FC = () => {
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');
  const [temperature, setTemperature] = useState(0.2);
  const [testInput, setTestInput] = useState('How much does cosmetic laser teeth whitening cost, and do you have slots this Friday?');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState<{
    reply: string;
    intent: string;
    confidence: number;
    latencyMs: number;
    ragChunks: { title: string; score: number; text: string }[];
    canonicalEntities: Record<string, string>;
  } | null>({
    reply: `Our Cosmetic Laser Teeth Whitening is $350 for a full 45-minute clinical treatment (up to 8 shades brighter in a single visit with zero tooth sensitivity). Dr. Sarah Jensen has openings this Friday at 3:00 PM and 4:15 PM. Would you like me to reserve the 3:00 PM slot for you? What is your full name?`,
    intent: 'appointment_booking',
    confidence: 0.96,
    latencyMs: 142,
    ragChunks: [
      {
        title: 'dental_pricing_2026.pdf',
        score: 0.94,
        text: 'Cosmetic Laser Teeth Whitening: $350 (45 mins). Single visit, gentle remineralizing shade boost.',
      },
      {
        title: 'clinic_operating_hours.txt',
        score: 0.88,
        text: 'Friday operating hours: 8:00 AM to 6:00 PM. Lead Dentist: Dr. Sarah Jensen, DDS.',
      },
    ],
    canonicalEntities: {
      TREATMENT: 'CanonicalTreatment.LASER_WHITENING',
      PRICE_QUOTED: '$350',
      TARGET_DATE: '2026-09-04T15:00:00.000Z',
      DOCTOR: 'Dr. Sarah Jensen, DDS',
    },
  });

  const handleRunPlayground = () => {
    setIsGenerating(true);
    const start = Date.now();

    setTimeout(() => {
      const resp = GeminiHumanEngine.generateResponse(testInput, []);
      const latency = Date.now() - start;

      setOutput({
        reply: resp.reply,
        intent: resp.intent,
        confidence: resp.confidence,
        latencyMs: latency,
        ragChunks: [
          {
            title: 'dental_pricing_2026.pdf',
            score: 0.92,
            text: 'Extracted treatment protocols, pricing structures, and emergency triage rules.',
          },
          {
            title: 'clinic_policies_and_faqs.pdf',
            score: 0.85,
            text: 'Prescription safety: Antibiotics do not cure nerve infections; require in-person exam.',
          },
        ],
        canonicalEntities: {
          INTENT: resp.intent.toUpperCase(),
          CONFIDENCE_SCORE: `${Math.round(resp.confidence * 100)}%`,
          EXECUTION_ACTION: resp.intent === 'appointment_booking' ? 'appointment_booked' : 'lead_qualified',
        },
      });
      setIsGenerating(false);
    }, 450);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-500" />
            <span>AI Playground & Model Diagnostics</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Test prompt injections, inspect retrieved RAG embeddings, and analyze token decision confidence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" size="sm">
            Swappable LLM Active
          </Badge>
          <Badge variant="purple" size="sm">
            RAG Vector Store Connected
          </Badge>
        </div>
      </div>

      {/* 3-Column Diagnostic Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Col 1: Controls & Inbound Input (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Model Controls */}
          <GlassCard className="p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-500" /> Model Configuration
            </h4>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-400 font-semibold">Active LLM Engine</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <option value="gemini">Google Gemini 3.7 / 2.5 Flash (Default)</option>
                  <option value="openai">OpenAI GPT-4o-mini (Plug & Play)</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span className="font-semibold">Temperature: {temperature}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Deterministic (0.2)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          </GlassCard>

          {/* Prompt / Input Box */}
          <GlassCard className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-500" /> Inbound Patient Query
            </h4>

            <textarea
              rows={4}
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Type test patient message here..."
              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />

            <button
              onClick={handleRunPlayground}
              disabled={isGenerating}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>{isGenerating ? 'Generating Diagnostic Trace...' : 'Run In Playground'}</span>
            </button>
          </GlassCard>

        </div>

        {/* Col 2: Live AI Model Output (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard className="p-6 space-y-4 h-full flex flex-col justify-between">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Model Response & Decision
                  </h4>
                </div>

                {output && (
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="sm">
                      {Math.round(output.confidence * 100)}% Conf.
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                      <Clock className="w-3 h-3" /> {output.latencyMs}ms
                    </span>
                  </div>
                )}
              </div>

              {output ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                    {output.reply}
                  </div>

                  {/* Intent & Action Tag */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Detected Intent</span>
                      <p className="font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                        {output.intent}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Routing Gate</span>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                        Auto-Reply (Passed)
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 text-xs">
                  Run a query to inspect live structured model response.
                </div>
              )}
            </div>

            {/* Canonical Entities Breakdown */}
            {output && (
              <div className="pt-4 border-t border-black/5 dark:border-white/10 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Code className="w-3 h-3" /> Canonical Normalized Entities
                </span>
                <div className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[10px] space-y-1">
                  {Object.entries(output.canonicalEntities).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-400">{k}:</span>
                      <span className="text-cyan-300 font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </GlassCard>
        </div>

        {/* Col 3: RAG Retrieved Chunks & Similarity Scores (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <GlassCard className="p-5 space-y-4 h-full">
            <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-3">
              <Database className="w-4 h-4 text-purple-500" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Retrieved RAG Chunks
              </h4>
            </div>

            {output?.ragChunks && output.ragChunks.length > 0 ? (
              <div className="space-y-3">
                {output.ragChunks.map((chunk, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-purple-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                        {chunk.title}
                      </span>
                      <Badge variant="purple" size="sm">
                        {Math.round(chunk.score * 100)}% Match
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                      "{chunk.text}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                No RAG context loaded yet.
              </div>
            )}
          </GlassCard>
        </div>

      </div>

    </div>
  );
};
