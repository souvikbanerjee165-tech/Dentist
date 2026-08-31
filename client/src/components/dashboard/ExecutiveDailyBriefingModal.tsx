import React, { useState } from 'react';
import { 
  Mail, 
  Sparkles, 
  X, 
  TrendingUp, 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Send, 
  Smartphone,
  Bot
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';

interface ExecutiveDailyBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicName: string;
}

export const ExecutiveDailyBriefingModal: React.FC<ExecutiveDailyBriefingModalProps> = ({
  isOpen,
  onClose,
  clinicName,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSendTestBriefing = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      setTimeout(() => setIsSent(false), 3500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <GlassCard className="w-full max-w-xl p-0 overflow-hidden border-white/20 shadow-2xl bg-slate-900/95 text-slate-100 rounded-3xl">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Daily 8:00 AM Executive Briefing</h3>
              <p className="text-[11px] text-slate-400">Automated morning summary delivered to clinic owners</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email / WhatsApp Preview Card */}
        <div className="p-6 max-h-[460px] overflow-y-auto space-y-4">
          
          <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 space-y-4 font-sans text-xs">
            
            {/* Subject */}
            <div className="border-b border-white/10 pb-3">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Subject:</span>
              <p className="font-bold text-white text-sm mt-0.5">
                ☕ Good morning Dr. Jensen — Yesterday's AI Front Desk Performance (+14 Bookings, $4,900 Revenue)
              </p>
            </div>

            {/* Body */}
            <div className="space-y-3 text-slate-300 leading-relaxed">
              <p>
                Good morning! Here is your 24-hour summary for <strong className="text-white">{clinicName}</strong>:
              </p>

              {/* 4 Metric Highlights */}
              <div className="grid grid-cols-2 gap-3 py-1 font-mono text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Conversations</span>
                  <p className="text-base font-extrabold text-white">53 inquiries</p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold">New Bookings</span>
                  <p className="text-base font-extrabold text-emerald-400">+14 appointments</p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-blue-400 uppercase font-bold">Revenue Pipeline</span>
                  <p className="text-base font-extrabold text-blue-400">+$4,900</p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-amber-400 uppercase font-bold">Staff Hours Saved</span>
                  <p className="text-base font-extrabold text-amber-400">7.8 hrs</p>
                </div>
              </div>

              {/* Actionable items */}
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-[11px] space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" /> AI Knowledge Insights:
                </p>
                <p>• 3 new insurance questions caught and ready for 1-click training in your dashboard.</p>
                <p>• 100% of emergency pain inquiries were triaged and booked in under 3 minutes.</p>
              </div>

              <p className="text-[11px] text-slate-400 pt-1">
                — Your 24/7 AI Front Desk Engine • Apex Dental OS
              </p>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 bg-slate-950/70 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sends via Email + WhatsApp at 8:00 AM Daily</span>
          </div>

          <button
            onClick={handleSendTestBriefing}
            disabled={isSending || isSent}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all active:scale-95"
          >
            {isSent ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Dispatched to Phone & Email!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Dispatching...' : 'Send Test Briefing'}</span>
              </>
            )}
          </button>
        </div>

      </GlassCard>
    </div>
  );
};
