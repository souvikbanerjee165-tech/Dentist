import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  CheckCircle2, 
  Sparkles, 
  X, 
  ShieldCheck, 
  ArrowRight,
  Building2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Badge } from '../ui/Badge';

interface ClientProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicName?: string;
}

export const ClientProposalModal: React.FC<ClientProposalModalProps> = ({
  isOpen,
  onClose,
  clinicName: defaultClinic = 'St. James Dental Practice',
}) => {
  const [clinicName, setClinicName] = useState(defaultClinic);
  const [selectedTier, setSelectedTier] = useState<2>(2); // Default to Tier 2 Recommended
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const emailPitch = `Hi Dr. Sarah & Practice Manager,

Following up on our clinic acquisition audit for ${clinicName}:

We found that ${clinicName} is currently missing an estimated £9,600/month in high-value cosmetic and emergency dental appointments due to uncaptured after-hours patient visits and busy reception desks.

We have prepared a Done-For-You AI Front Desk proposal for your clinic:
• Package: Tier 2 — Revenue & Retention Engine (£495/month + £1,495 setup)
• Includes: 24/7 AI Receptionist, WhatsApp Concierge, Website Chat Widget, Missed Call Auto-Recovery, No-Show Killer (24h/2h reminders), and Google Calendar Sync.

Booking just 1 whitening patient (£395) covers your monthly investment. Any single implant consult (£2,800) yields a 560% direct ROI.

Would you be open to a 10-minute live demonstration this Thursday or Friday?

Best regards,
DentalDesk Managed AI Solutions`;

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(emailPitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header - Screen only */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-500/10 via-transparent to-transparent print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Client Proposal &amp; 3-Tier Agreement Generator
                </h3>
                <Badge variant="success">Print / PDF Ready</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1-Page high-ticket managed service agreement ready to present to dental clinic directors.
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

        {/* Printable Proposal Document */}
        <div className="p-8 overflow-y-auto space-y-8 bg-white text-slate-900 font-sans print:p-0 print:m-0 print:overflow-visible">
          
          {/* Document Top Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2 text-blue-600 font-black tracking-tight text-xl">
                <span>🦷 DentalDesk AI</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-2 py-0.5 rounded bg-slate-100">
                  Managed Solutions
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                AI Front Desk Proposal &amp; Service Agreement
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Prepared exclusively for: <strong className="text-slate-800">{clinicName}</strong>
              </p>
            </div>

            <div className="text-right space-y-1 text-xs">
              <div><span className="text-slate-400">Date:</span> <strong>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
              <div><span className="text-slate-400">Proposal ID:</span> <span className="font-mono font-bold">DDA-2026-UK</span></div>
              <div><span className="text-slate-400">Terms:</span> <strong>14-Day Price Guarantee</strong></div>
            </div>
          </div>

          {/* Executive Overview */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-700">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>The Strategic Objective:</span>
            </div>
            <p>
              Enable <strong>{clinicName}</strong> to operate an indefatigable, 24/7 digital front desk that automatically triages emergency toothaches, answers complex procedure questions (£95 exams, £395 whitening, £2,800 implants), and schedules appointments directly into Google Calendar — completely eliminating missed patient inquiries after hours.
            </p>
          </div>

          {/* The 3 Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Tier 1 */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tier 1</span>
                <h4 className="text-base font-extrabold text-slate-900">Front Desk Core</h4>
                <div className="pt-1">
                  <span className="text-2xl font-black text-slate-900">£295</span>
                  <span className="text-xs text-slate-500"> / month</span>
                  <div className="text-[11px] text-slate-400 font-medium">+ £995 one-off setup</div>
                </div>

                <ul className="space-y-2 pt-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>Website Chat Widget (1-Line)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>24/7 WhatsApp AI Concierge</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>Google Calendar Sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>Clinic Price Sheet Knowledge Base</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>8:00 AM Morning WhatsApp Briefing</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Tier 2 - Recommended */}
            <div className="p-5 rounded-2xl border-2 border-blue-600 bg-blue-50/40 space-y-4 relative flex flex-col justify-between shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
                Most Popular • High ROI
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Tier 2</span>
                <h4 className="text-base font-extrabold text-slate-900">Revenue &amp; Retention Engine</h4>
                <div className="pt-1">
                  <span className="text-2xl font-black text-blue-600">£495</span>
                  <span className="text-xs text-slate-500"> / month</span>
                  <div className="text-[11px] text-blue-600/80 font-semibold">+ £1,495 one-off setup</div>
                </div>

                <ul className="space-y-2 pt-2 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2 font-bold text-blue-900">
                    <span>✨ Everything in Tier 1, plus:</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Missed Call Auto-Recovery (£395)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>No-Show Killer (24h/2h Reminders)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>5-Star Google Review Engine</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>VIP Priority Triage Routing</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Tier 3 */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Tier 3</span>
                <h4 className="text-base font-extrabold text-slate-900">The Autonomous Clinic</h4>
                <div className="pt-1">
                  <span className="text-2xl font-black text-slate-900">£795</span>
                  <span className="text-xs text-slate-500"> / month</span>
                  <div className="text-[11px] text-slate-400 font-medium">+ £1,995 one-off setup</div>
                </div>

                <ul className="space-y-2 pt-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2 font-bold text-purple-900">
                    <span>⚡ Everything in Tier 2, plus:</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>Inbound Voice AI Phone Answering</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>Empty Chair / Cancellation Recall</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>Multi-Doctor Roster Scheduling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>Custom Dedicated Phone Line</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>

          {/* ROI Justification Box */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-emerald-800">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Guaranteed Economic Breakeven:</span>
            </div>
            <p>
              Just <strong>one single Laser Teeth Whitening booking (£395)</strong> or two routine examinations (£95) per month covers the entire Tier 2 investment. Booking just one single Dental Implant patient (£2,800) delivers an immediate <strong>560% ROI</strong> in month one.
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-xs">
            <div className="space-y-6">
              <div className="font-bold text-slate-800">For DentalDesk Managed AI:</div>
              <div className="border-b border-slate-300 w-48 h-8"></div>
              <div className="text-slate-500">Authorized Signature &amp; Date</div>
            </div>

            <div className="space-y-6">
              <div className="font-bold text-slate-800">For {clinicName}:</div>
              <div className="border-b border-slate-300 w-48 h-8"></div>
              <div className="text-slate-500">Practice Principal / Director Signature</div>
            </div>
          </div>

        </div>

        {/* Footer Buttons - Screen only */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={handleCopyPitch}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied Email Pitch!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Pitch Email</span>
                </>
              )}
            </button>
          </div>

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
