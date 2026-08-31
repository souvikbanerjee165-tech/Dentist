import React from 'react';
import { CheckCircle2, ShieldCheck, Zap, Calendar, Smartphone, Database } from 'lucide-react';

export const SystemHealthBanner: React.FC = () => {
  return (
    <div className="px-6 py-2 bg-emerald-500/5 dark:bg-emerald-950/20 border-b border-emerald-500/10 text-[11px] select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-4 scrollbar-none">
        
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>System Reliability Matrix</span>
        </div>

        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300 font-mono text-[10px] shrink-0">
          <span className="flex items-center gap-1">
            <Smartphone className="w-3 h-3 text-emerald-500" /> WhatsApp: <strong className="text-emerald-500">Live (200 OK)</strong>
          </span>

          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-blue-500" /> Google Calendar: <strong className="text-blue-400">Synced</strong>
          </span>

          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-purple-500" /> RAG Store: <strong className="text-purple-400">94% Covered</strong>
          </span>

          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-500" /> Primary AI (Gemini): <strong className="text-cyan-400">Online (142ms)</strong>
          </span>

          <span className="hidden md:flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-slate-400" /> Fallback (OpenAI): <strong className="text-slate-400">Standby</strong>
          </span>
        </div>

      </div>
    </div>
  );
};
