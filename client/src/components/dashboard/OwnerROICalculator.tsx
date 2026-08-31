import React, { useState } from 'react';
import { DollarSign, TrendingUp, Clock, Users, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';

export const OwnerROICalculator: React.FC = () => {
  const [monthlyInquiries, setMonthlyInquiries] = useState(180);
  const [avgTreatmentPrice, setAvgTreatmentPrice] = useState(350);
  const [frontDeskHourlyWage, setFrontDeskHourlyWage] = useState(24);

  // Conversion lift from instant 1.2s 24/7 AI response (assumes 22% conversion vs 8% unassisted drop-off)
  const estimatedBookings = Math.round(monthlyInquiries * 0.22);
  const estimatedRevenue = estimatedBookings * avgTreatmentPrice;
  const hoursSaved = Math.round(monthlyInquiries * 0.25); // 15 mins saved per inquiry
  const wageSavings = hoursSaved * frontDeskHourlyWage;
  const totalValue = estimatedRevenue + wageSavings;
  const monthlySaaS = 250;
  const netROI = Math.round((totalValue / monthlySaaS) * 10) / 10;

  return (
    <GlassCard className="p-6 border-blue-500/30 bg-gradient-to-br from-blue-900/20 via-slate-900/40 to-cyan-900/20 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Practice Owner Value Calculator
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Projected Monthly ROI & Practice Growth
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Based on 24/7 instant response triage and automated calendar bookings.
          </p>
        </div>

        <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-center sm:text-right">
          <span className="text-[10px] uppercase font-bold text-emerald-300">Estimated Return</span>
          <p className="text-xl font-extrabold font-mono text-emerald-400">{netROI}x Monthly ROI</p>
        </div>
      </div>

      {/* 2 Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
        
        {/* Slider 1 */}
        <div className="space-y-2">
          <div className="flex justify-between font-semibold text-slate-300">
            <span>Monthly Patient WhatsApp Inquiries</span>
            <span className="font-mono text-blue-400 font-bold">{monthlyInquiries} inquiries</span>
          </div>
          <input
            type="range"
            min="40"
            max="600"
            step="10"
            value={monthlyInquiries}
            onChange={(e) => setMonthlyInquiries(parseInt(e.target.value, 10))}
            className="w-full accent-blue-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>40</span>
            <span>300</span>
            <span>600+</span>
          </div>
        </div>

        {/* Slider 2 */}
        <div className="space-y-2">
          <div className="flex justify-between font-semibold text-slate-300">
            <span>Average Dental Treatment Value</span>
            <span className="font-mono text-cyan-400 font-bold">${avgTreatmentPrice}</span>
          </div>
          <input
            type="range"
            min="100"
            max="1200"
            step="50"
            value={avgTreatmentPrice}
            onChange={(e) => setAvgTreatmentPrice(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>$100</span>
            <span>$600</span>
            <span>$1,200</span>
          </div>
        </div>

      </div>

      {/* 3 Value Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-blue-400" /> New Patients Booked
          </span>
          <p className="text-xl font-extrabold text-white font-mono">+{estimatedBookings}</p>
          <p className="text-[10px] text-slate-400">Automated appointments/mo</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Practice Revenue Lift
          </span>
          <p className="text-xl font-extrabold text-emerald-400 font-mono">+${estimatedRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400">Captured pipeline value</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Front-Desk Time Saved
          </span>
          <p className="text-xl font-extrabold text-amber-400 font-mono">~{hoursSaved} hrs/mo</p>
          <p className="text-[10px] text-slate-400">≈ ${wageSavings.toLocaleString()} staff hours saved</p>
        </div>

      </div>

    </GlassCard>
  );
};
