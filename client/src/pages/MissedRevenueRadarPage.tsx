import React, { useState } from 'react';
import { 
  TrendingDown, 
  DollarSign, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Users, 
  ArrowRight, 
  Clock,
  Flame,
  AlertCircle
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';

export interface TreatmentPipeline {
  id: string;
  treatment: string;
  avgTicket: number;
  totalInquiries: number;
  bookedCount: number;
  unrecoveredCount: number;
  potentialLostRevenue: number;
  recoveryTemplate: string;
  isReengaged?: boolean;
}

export const MissedRevenueRadarPage: React.FC = () => {
  const [pipelines, setPipelines] = useState<TreatmentPipeline[]>([
    {
      id: 'pipe-1',
      treatment: 'Titanium Dental Implants & Bone Grafting',
      avgTicket: 3200,
      totalInquiries: 18,
      bookedCount: 6,
      unrecoveredCount: 12,
      potentialLostRevenue: 18400,
      recoveryTemplate: 'Hi {patient_name}, Dr. Sarah Jensen has 2 complimentary 3D implant digital scan slots this Thursday. Would you like to reserve one before they fill up?',
    },
    {
      id: 'pipe-2',
      treatment: 'Handcrafted Porcelain Veneers & Smile Makeover',
      avgTicket: 2800,
      totalInquiries: 14,
      bookedCount: 5,
      unrecoveredCount: 9,
      potentialLostRevenue: 14200,
      recoveryTemplate: 'Hi {patient_name}, we are offering a $300 cosmetic courtesy on full veneer consultations booked this week. Would Friday at 3 PM work for you?',
    },
    {
      id: 'pipe-3',
      treatment: 'Invisalign Clear Aligners & Orthodontic Triage',
      avgTicket: 1950,
      totalInquiries: 22,
      bookedCount: 9,
      unrecoveredCount: 13,
      potentialLostRevenue: 8800,
      recoveryTemplate: 'Hi {patient_name}, your preliminary Invisalign smile simulation is ready for Dr. Jensen to review. Can we schedule your 20-min fitting scan?',
    },
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalLostRevenue = pipelines.reduce((sum, p) => sum + p.potentialLostRevenue, 0);
  const totalUnbookedPatients = pipelines.reduce((sum, p) => sum + p.unrecoveredCount, 0);

  const handleTriggerReengagement = (id: string, treatment: string) => {
    setPipelines(prev =>
      prev.map(p => {
        if (p.id === id) {
          return { ...p, isReengaged: true };
        }
        return p;
      })
    );

    setToastMessage(`🚀 WhatsApp VIP Re-Engagement broadcast dispatched to ${treatment} prospects!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-rose-500" />
            <span>Missed Revenue & High-Ticket Opportunity Radar</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Patients who asked about high-value dental treatments but didn't book. Recover lost pipeline with automated VIP follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="danger" size="sm">
            ${totalLostRevenue.toLocaleString()} Unrecovered Pipeline
          </Badge>
        </div>
      </div>

      {/* 3 Executive High-Impact Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <GlassCard className="p-5 space-y-2 border-rose-500/30 bg-rose-500/5">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Unrecovered Pipeline</span>
          <p className="text-3xl font-extrabold text-rose-500 font-mono">
            ${totalLostRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">High-ticket inquiries without a confirmed appointment</p>
        </GlassCard>

        <GlassCard className="p-5 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Drop-off Patient Leads</span>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {totalUnbookedPatients} Patients
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Qualified leads waiting in WhatsApp follow-up queue</p>
        </GlassCard>

        <GlassCard className="p-5 space-y-2 border-emerald-500/30 bg-emerald-500/5">
          <span className="text-[10px] uppercase font-bold text-slate-400">Expected Recovery Yield (30%)</span>
          <p className="text-3xl font-extrabold text-emerald-500 font-mono">
            +${Math.round(totalLostRevenue * 0.3).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Realistic practice revenue lift with 1-click re-engagement</p>
        </GlassCard>

      </div>

      {/* Toast alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Pipeline Breakdown Table & 1-Click Re-Engagement Actions */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              High-Ticket Treatment Conversion Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Targeted patient cohorts grouped by treatment category.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {pipelines.map((item) => {
            const conversionRate = Math.round((item.bookedCount / item.totalInquiries) * 100);
            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{item.treatment}</span>
                      <span className="text-xs font-mono font-normal text-slate-400">
                        (~${item.avgTicket.toLocaleString()} avg)
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.totalInquiries} inquiries • <span className="text-emerald-500 font-bold">{item.bookedCount} booked</span> • <span className="text-rose-500 font-bold">{item.unrecoveredCount} dropped off</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Unrecovered Value</span>
                      <p className="text-base font-extrabold text-rose-500 font-mono">
                        ${item.potentialLostRevenue.toLocaleString()}
                      </p>
                    </div>

                    {item.isReengaged ? (
                      <Badge variant="success" size="sm">Broadcast Sent ✓</Badge>
                    ) : (
                      <button
                        onClick={() => handleTriggerReengagement(item.id, item.treatment)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send WhatsApp VIP Offer</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                    <span>Conversion Rate: {conversionRate}%</span>
                    <span>{item.bookedCount} of {item.totalInquiries} Patients Booked</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full rounded-l-full" 
                      style={{ width: `${conversionRate}%` }} 
                    />
                    <div 
                      className="bg-rose-500/50 h-full rounded-r-full" 
                      style={{ width: `${100 - conversionRate}%` }} 
                    />
                  </div>
                </div>

                {/* Template Preview */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-black/5 dark:border-white/10 text-xs space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-blue-400">Automated Re-Engagement Copy:</span>
                  <p className="text-slate-700 dark:text-slate-300 italic">
                    "{item.recoveryTemplate}"
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      </GlassCard>

    </div>
  );
};
