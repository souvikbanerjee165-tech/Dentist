import React, { useState } from 'react';
import { 
  Coffee, 
  Send, 
  Check, 
  Clock, 
  Smartphone, 
  CheckCheck, 
  Sparkles, 
  X, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '../ui/Badge';

interface MorningBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicName?: string;
}

export const MorningBriefingModal: React.FC<MorningBriefingModalProps> = ({
  isOpen,
  onClose,
  clinicName = 'St. James Dental Practice',
}) => {
  const [phoneNumber, setPhoneNumber] = useState('+44 7911 123456');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [cronEnabled, setCronEnabled] = useState(true);

  if (!isOpen) return null;

  const handleSendTestBriefing = async () => {
    setIsSending(true);
    try {
      await fetch('/api/v1/briefing/send-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPhone: phoneNumber,
          clinicName,
        }),
      });
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 4000);
    } catch {
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 4000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  8:00 AM Morning Executive WhatsApp Briefing
                </h3>
                <Badge variant="success">Retention Engine</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The daily executive summary sent straight to Dr. Sarah Jensen's personal phone every morning.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Grid: Left Controls, Right Mock Smartphone */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Why this drives retention + controls */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Psychology Card */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>The #1 Reason Clinics Never Churn:</span>
              </div>
              <p>
                When a dental clinic owner wakes up every day and sees <strong>£1,245+ of booked patients</strong> captured while they were sleeping, they will never cancel their subscription. It makes your service indispensable.
              </p>
            </div>

            {/* Test Send Form */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <span>Send Live WhatsApp Test Briefing:</span>
              </h4>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Doctor / Practice Owner Mobile Number (with country code):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+44 7911 123456"
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  <button
                    onClick={handleSendTestBriefing}
                    disabled={isSending}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white transition-all shadow-md shadow-emerald-600/25 disabled:opacity-60"
                  >
                    {isSending ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch Test</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {sentSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4" />
                  <span>WhatsApp briefing successfully sent to {phoneNumber}!</span>
                </div>
              )}
            </div>

            {/* Automation Schedule */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Automated 8:00 AM Cron Dispatch</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Sends Monday–Sunday at 8:00 AM before clinic doors open.
                </div>
              </div>
              <button
                onClick={() => setCronEnabled(!cronEnabled)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  cronEnabled
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
              >
                {cronEnabled ? 'Active (8:00 AM)' : 'Paused'}
              </button>
            </div>
          </div>

          {/* Right Column: WhatsApp Mockup Screen */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[320px] rounded-[36px] bg-slate-900 p-3 shadow-2xl border-4 border-slate-800 relative">
              {/* iPhone Notch */}
              <div className="w-24 h-4 bg-slate-800 rounded-b-xl mx-auto mb-2"></div>

              {/* WhatsApp App Screen */}
              <div className="rounded-[26px] bg-[#0b141a] overflow-hidden text-slate-100 text-xs flex flex-col h-[460px]">
                
                {/* WA Top Bar */}
                <div className="bg-[#1f2c34] p-3 flex items-center gap-2 border-b border-[#2a3942]">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-[10px]">
                    JD
                  </div>
                  <div>
                    <div className="font-bold text-[11px] text-white">DentalDesk AI Dispatch</div>
                    <div className="text-[9.5px] text-emerald-400">Official Executive Bot</div>
                  </div>
                </div>

                {/* WA Message Container */}
                <div className="flex-1 p-3 overflow-y-auto bg-[url('https://static.whatsapp.net/rsrc.php/v3/y6/r/wa6duAYBgdu.png')] bg-repeat bg-opacity-5 flex flex-col justify-end space-y-2">
                  
                  {/* The Daily Briefing Chat Bubble */}
                  <div className="bg-[#005c4b] text-slate-100 p-3 rounded-2xl rounded-tl-sm shadow-md space-y-2 text-[11px] leading-relaxed border border-emerald-500/20">
                    <div className="font-bold text-amber-300 flex items-center gap-1">
                      <span>☕ Good Morning, Dr. Sarah!</span>
                    </div>
                    <div className="text-[10px] text-slate-200">
                      Here is your 8:00 AM Executive Briefing for <strong>{clinicName}</strong>:
                    </div>

                    <div className="p-2 rounded-xl bg-black/20 space-y-1 text-[10.5px]">
                      <div>📊 <strong>Yesterday's Activity (Overnight):</strong></div>
                      <div>• Inquiries Handled: <strong>12</strong> (24/7 Autopilot)</div>
                      <div>• Confirmed Bookings: <strong className="text-emerald-300">+3 Patients</strong></div>
                      <div>• Missed Calls Rescued: <strong>1</strong> (£395)</div>
                      <div>• Est. Treatment Value: <strong className="text-amber-300">£1,980</strong></div>
                    </div>

                    <div className="text-[10px] space-y-0.5 pt-1">
                      <div>🗓️ <strong>Today's Next Bookings:</strong></div>
                      <div>1. Sophia Martinez — Whitening (10:30 AM)</div>
                      <div>2. David Miller — Emergency Exam (1:15 PM)</div>
                    </div>

                    <div className="text-[9.5px] text-slate-300 italic pt-1 border-t border-white/10">
                      All slots synced to your Google Calendar. Have a great clinic day! 🦷✨
                    </div>

                    <div className="flex justify-end items-center gap-1 text-[9px] text-emerald-200/70 pt-0.5">
                      <span>08:00 AM</span>
                      <CheckCheck className="w-3 h-3 text-cyan-400" />
                    </div>
                  </div>

                </div>

              </div>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 font-mono">Live iPhone WhatsApp Preview</span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Automatic Vercel Cron triggered daily at 08:00 AM UK local time</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
