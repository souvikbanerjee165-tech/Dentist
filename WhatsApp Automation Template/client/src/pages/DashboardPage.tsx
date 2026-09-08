import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  UserPlus, 
  CalendarCheck, 
  DollarSign, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  Sparkles,
  Bot,
  UserCheck,
  ChevronRight,
  Clock,
  Calendar,
  Phone,
  Globe,
  PhoneMissed,
  Star,
  Send,
  Coffee,
  Zap,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Conversation, KPIStats, Lead, NavigationTab } from '../types';
import { OwnerROICalculator } from '../components/dashboard/OwnerROICalculator';
import { WebsiteWidgetEmbedModal } from '../components/widget/WebsiteWidgetEmbedModal';
import { MorningBriefingModal } from '../components/briefing/MorningBriefingModal';
import { EmptyChairRecallModal } from '../components/recall/EmptyChairRecallModal';
import { ClientProposalModal } from '../components/proposal/ClientProposalModal';

interface DashboardPageProps {
  stats: KPIStats;
  conversations: Conversation[];
  leads: Lead[];
  onSelectTab: (tab: NavigationTab) => void;
  onOpenTestChat: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  conversations,
  leads,
  onSelectTab,
  onOpenTestChat,
}) => {
  const [liveAppointments, setLiveAppointments] = useState([
    {
      id: 'app-1',
      patientName: 'Sophia Martinez',
      treatment: 'Laser Teeth Whitening',
      fee: '£395',
      time: 'Today, 2:30 PM',
      doctor: 'Dr. Sarah Jensen',
      status: 'Confirmed (WhatsApp)',
    },
    {
      id: 'app-2',
      patientName: 'David Miller',
      treatment: 'Routine Exam & 3D Scan',
      fee: '£95',
      time: 'Tomorrow, 10:30 AM',
      doctor: 'Dr. Sarah Jensen',
      status: 'Confirmed (Google Cal)',
    },
    {
      id: 'app-3',
      patientName: 'Elena Rostova',
      treatment: 'Dental Implants Assessment',
      fee: '£2,800',
      time: 'Thursday, 3:15 PM',
      doctor: 'Dr. Sarah Jensen',
      status: 'Confirmed (WhatsApp)',
    },
  ]);

  const [liveToast, setLiveToast] = useState<string | null>(null);
  const [dynamicRevenue, setDynamicRevenue] = useState(4850);
  const [dynamicAppointmentsCount, setDynamicAppointmentsCount] = useState(stats.appointments || 14);
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [showBriefingModal, setShowBriefingModal] = useState(false);
  const [showRecallModal, setShowRecallModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [missedCallsRecovered, setMissedCallsRecovered] = useState(11);
  const [rescuedRevenue, setRescuedRevenue] = useState(4250);
  const [isTriggeringRecovery, setIsTriggeringRecovery] = useState(false);
  const [viewMode, setViewMode] = useState<'clinic' | 'agency'>('clinic');

  useEffect(() => {
    const handleNewBooking = (e: any) => {
      const details = e.detail;
      if (details) {
        const newApp = {
          id: `app-live-${Date.now()}`,
          patientName: details.patientName || 'New Patient',
          treatment: details.treatment || 'Emergency Pain Relief',
          fee: details.fee || '£95',
          time: details.slot || 'Tomorrow, 10:30 AM',
          doctor: 'Dr. Sarah Jensen',
          status: 'Confirmed (Live Golden Loop)',
        };

        setLiveAppointments(prev => [newApp, ...prev]);
        setDynamicAppointmentsCount(prev => prev + 1);
        setDynamicRevenue(prev => prev + (parseInt(details.fee?.replace(/[^0-9]/g, '') || '95', 10)));
        setLiveToast(`🎉 New Booking Synced: ${newApp.patientName} for ${newApp.treatment} (${newApp.fee}) at ${newApp.time}!`);
        setTimeout(() => setLiveToast(null), 5000);
      }
    };

    window.addEventListener('new_appointment_booked', handleNewBooking);
    return () => window.removeEventListener('new_appointment_booked', handleNewBooking);
  }, []);

  const handleSimulateMissedCall = async () => {
    setIsTriggeringRecovery(true);
    try {
      await fetch('/api/v1/followup/missed-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerPhone: '+44 7700 900123',
          callerName: 'Callum Wright',
          clinicName: 'St. James Dental Practice',
        }),
      });
      setMissedCallsRecovered(prev => prev + 1);
      setRescuedRevenue(prev => prev + 395);
      setLiveToast('📞 Missed Call Rescued! Instant WhatsApp dispatched to Callum Wright (+44 7700 900123). Estimated +£395 rescued!');
      setTimeout(() => setLiveToast(null), 5000);
    } catch {
      setMissedCallsRecovered(prev => prev + 1);
      setRescuedRevenue(prev => prev + 395);
      setLiveToast('📞 Missed Call Rescued! Instant WhatsApp dispatched (+£395).');
      setTimeout(() => setLiveToast(null), 5000);
    } finally {
      setIsTriggeringRecovery(false);
    }
  };

  const cards = [
    {
      title: "Today's Messages",
      value: stats.todayMessages.toLocaleString(),
      delta: stats.todayMessagesDelta,
      icon: MessageSquare,
      color: 'blue',
      description: 'Incoming WhatsApp inquiries',
    },
    {
      title: 'New Leads',
      value: stats.newLeads.toLocaleString(),
      delta: stats.newLeadsDelta,
      icon: UserPlus,
      color: 'emerald',
      description: 'Auto-qualified by AI',
    },
    {
      title: 'Appointments',
      value: dynamicAppointmentsCount.toLocaleString(),
      delta: '+3 today',
      icon: CalendarCheck,
      color: 'purple',
      description: 'Booked in Google Calendar',
    },
    {
      title: 'Revenue Estimate',
      value: `£${dynamicRevenue.toLocaleString()}`,
      delta: '+£490 today',
      icon: DollarSign,
      color: 'amber',
      description: 'Pipeline value generated',
    },
    {
      title: 'Human Takeovers',
      value: stats.humanTakeovers.toString(),
      delta: stats.humanTakeoversDelta,
      icon: ShieldAlert,
      color: stats.humanTakeovers > 0 ? 'rose' : 'slate',
      description: 'Low confidence handovers',
      isWarning: stats.humanTakeovers > 0,
    },
    {
      title: 'Conversation Success %',
      value: `${stats.conversationSuccessRate}%`,
      delta: stats.conversationSuccessDelta,
      icon: CheckCircle2,
      color: 'cyan',
      description: 'Handled 100% autonomously',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Executive Practice Activity & ROI Panel */}
      <GlassCard className="p-6 border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900/60 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Today's Clinic Activity & Practice ROI</h3>
              <p className="text-xs text-slate-400">Real-time automation impact for Dr. Sarah Jensen, DDS</p>
            </div>
          </div>

          <Badge variant="success" dot size="sm">
            Live Automated Practice
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-1">
          
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Today's Patients</span>
            <div className="text-2xl font-extrabold text-white">12</div>
            <span className="text-[10px] text-blue-400 font-semibold">4 New Inquiries</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Booked by AI</span>
            <div className="text-2xl font-extrabold text-emerald-400">8</div>
            <span className="text-[10px] text-emerald-400 font-semibold">67% Booking Rate</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Calls Avoided</span>
            <div className="text-2xl font-extrabold text-indigo-400">17</div>
            <span className="text-[10px] text-slate-400">Front-desk hours saved</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Estimated Revenue</span>
            <div className="text-2xl font-extrabold text-amber-400">$4,850</div>
            <span className="text-[10px] text-amber-400/90 font-semibold">Pipeline value</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-medium text-slate-400">Avg AI Response</span>
            <div className="text-2xl font-extrabold text-cyan-400">1.2s</div>
            <span className="text-[10px] text-cyan-400 font-semibold">Sub-second Triage</span>
          </div>

        </div>
      </GlassCard>

      {/* Mode Switcher & Top Banner */}
      <div className="space-y-3">
        
        {/* Mode Toggle Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Viewing as:</span>
            <div className="p-1 rounded-xl bg-slate-200/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('clinic')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  viewMode === 'clinic'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🏥 Clinic Staff View (Clean)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('agency')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  viewMode === 'agency'
                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ⚡ Agency / Admin View (All Tools)
              </button>
            </div>
          </div>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {viewMode === 'clinic' ? 'Staff Mode: Uncluttered daily reception view' : 'Agency Mode: Sales proposals & embed tools unlocked'}
          </span>
        </div>

        {/* Top Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-xl shadow-lg shadow-blue-500/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {viewMode === 'clinic' ? 'AI Front Desk • Active & Assisting' : 'Revenue Operations & AI Reception Engine'}
              </h2>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {viewMode === 'clinic' 
                ? 'Answering patient inquiries, managing triage, and synchronizing Google Calendar 24/7.'
                : 'Full agency suite: proposal generation, widget deployment, and empty chair recovery.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Agency-Only Actions (Hidden from Clinic Staff) */}
            {viewMode === 'agency' && (
              <>
                <button
                  onClick={() => setShowWidgetModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 rounded-xl transition-all shadow-sm"
                >
                  <Globe className="w-3.5 h-3.5 text-sky-500" />
                  <span>Website Widget</span>
                </button>
                <button
                  onClick={() => setShowRecallModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 rounded-xl transition-all shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 text-purple-500" />
                  <span>Refill Chair</span>
                </button>
                <button
                  onClick={() => setShowProposalModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-xl transition-all shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Client Proposal</span>
                </button>
              </>
            )}

            {/* Core Actions (Visible in Both Modes) */}
            <button
              onClick={() => setShowBriefingModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl transition-all shadow-sm"
            >
              <Coffee className="w-3.5 h-3.5 text-amber-500" />
              <span>8 AM Briefing</span>
            </button>
            <button
              onClick={onOpenTestChat}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl shadow-lg shadow-blue-600/25 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Chat</span>
            </button>
          </div>
        </div>

        {/* Enterprise System Health Monitor Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-xs shadow-sm">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-[11.5px]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Infrastructure Health:</span>
          </span>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> WhatsApp Connected</span>
            <span className="flex items-center gap-1.5 font-medium"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Gemini Flash (1.1s)</span>
            <span className="flex items-center gap-1.5 font-medium"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Google Calendar Synced</span>
            <span className="flex items-center gap-1.5 font-medium"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Knowledge Base Indexed</span>
            <span className="flex items-center gap-1.5 font-medium"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Missed Call Recovery Active</span>
          </div>
        </div>

      </div>

      {/* 6 Required Glassmorphic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          const isPositive = typeof card.delta === 'number' ? card.delta >= 0 : String(card.delta).startsWith('+');

          return (
            <GlassCard key={idx} hoverEffect className="p-6 relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {card.title}
                  </span>
                  <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {card.value}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {card.description}
                </span>

                <div
                  className={`flex items-center gap-1 text-xs font-bold ${
                    card.isWarning
                      ? 'text-rose-500'
                      : isPositive
                      ? 'text-emerald-500'
                      : 'text-slate-400'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>{card.delta}</span>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
 
      {/* Practice Owner ROI & Economic Value Calculator */}
      <OwnerROICalculator />

      {/* Version 1.5 Retention Engine: Missed Call Auto-Recovery & Smart Follow-Ups */}
      <GlassCard className="p-6 border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-sky-950/20 to-slate-900/40 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <PhoneMissed className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">
                Missed Call Recovery &amp; AI Follow-Up Engine (v1.5)
              </h3>
              <Badge variant="success" size="sm">
                Active Retention
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              When a prospective patient calls outside clinic hours or hangs up, the AI instantly messages them on WhatsApp within 5 seconds to rescue the inquiry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateMissedCall}
              disabled={isTriggeringRecovery}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-xl transition-all active:scale-95 shadow-sm"
            >
              <PhoneMissed className="w-3.5 h-3.5" />
              <span>{isTriggeringRecovery ? 'Dispatching WhatsApp...' : 'Simulate Missed Call'}</span>
            </button>
          </div>
        </div>

        {/* 4 Core Retention Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <PhoneMissed className="w-3.5 h-3.5 text-rose-400" />
              <span>Calls Missed</span>
            </div>
            <div className="text-2xl font-extrabold text-white">14</div>
            <span className="text-[10px] text-slate-400">After-hours &amp; busy desk</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rescued by AI</span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-400">{missedCallsRecovered}</div>
            <span className="text-[10px] text-emerald-400 font-semibold">79% Conversion Rate</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>Rescued Revenue</span>
            </div>
            <div className="text-2xl font-extrabold text-amber-400">£{rescuedRevenue.toLocaleString()}</div>
            <span className="text-[10px] text-amber-400/90 font-semibold">Emergency &amp; consult fees</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Google Reviews</span>
            </div>
            <div className="text-2xl font-extrabold text-cyan-400">22 Sent</div>
            <span className="text-[10px] text-cyan-400 font-semibold">4.9★ Clinic Rating</span>
          </div>
        </div>

        {/* Live Recovery Example */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-mono text-[11.5px]">
              <strong>Auto-SMS/WhatsApp:</strong> "Hi Callum! Sorry we missed your call at St. James Dental. This is Dr. Jensen's desk. How can we help you today with your dental care?"
            </span>
          </div>
          <Badge variant="success" size="sm">
            Dispatched in 4.2s
          </Badge>
        </div>
      </GlassCard>

      {/* High-Value Revenue Feature: Automated Abandoned Lead Recovery Engine */}
      <GlassCard className="p-6 border-indigo-500/30 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-blue-500/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Automated Abandoned Inquiries & Lead Recovery
              </h3>
              <Badge variant="purple" size="sm">
                High ROI Feature
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Patients who inquired about dental treatments but left without booking. The AI automatically re-engages them on WhatsApp 24 hours later.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              +$2,450 Recovered Pipeline
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          {/* Recovery Item 1 */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-500/20 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Sophia Martinez</h4>
                <p className="text-[11px] text-slate-400 font-mono">+1 (555) 234-5678 • Inquired Yesterday</p>
              </div>
              <span className="text-xs font-extrabold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg">
                $350 at Stake
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-black/5 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-300 font-mono leading-relaxed">
              💬 "Hi Sophia, yesterday you asked about Laser Teeth Whitening ($350) but didn't finish booking. Friday at 3:00 PM is still open with Dr. Jensen. Should I hold it for you?"
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" /> Auto-Followup Sent • Recovered!
              </span>
              <Badge variant="success" size="sm">
                Booked Friday 3 PM
              </Badge>
            </div>
          </div>

          {/* Recovery Item 2 */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-500/20 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Marcus Sterling</h4>
                <p className="text-[11px] text-slate-400 font-mono">+1 (555) 901-2345 • Inquired 2 Days Ago</p>
              </div>
              <span className="text-xs font-extrabold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg">
                $950 at Stake
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-black/5 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-300 font-mono leading-relaxed">
              💬 "Hi Marcus, you checked our Porcelain Veneers consultation earlier this week. We have 1 opening left this Saturday at 11:00 AM. Would you like me to hold that slot?"
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-purple-400 font-semibold flex items-center gap-1">
                <Bot className="w-3 h-3" /> WhatsApp Follow-Up Dispatched
              </span>
              <button
                onClick={() => onSelectTab('patients')}
                className="text-[11px] font-bold text-blue-500 hover:underline"
              >
                View Live Thread ➔
              </button>
            </div>
          </div>

        </div>
      </GlassCard>

      {/* Golden Loop Real-Time Scheduled Appointments Feed */}
      <GlassCard className="p-6 border-black/5 dark:border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Today's Live Scheduled Appointments (Google Calendar Sync)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bookings created autonomously by AI over WhatsApp, Voice Call, and Web Widget.
              </p>
            </div>
          </div>

          <Badge variant="purple" dot size="sm">
            {liveAppointments.length} Confirmed Slots
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {liveAppointments.map((app) => (
            <div
              key={app.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-2 hover:border-purple-500/40 transition-all shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{app.patientName}</h4>
                  <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">{app.treatment}</p>
                </div>
                <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  {app.fee}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-black/5 dark:border-white/5 font-mono">
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <Clock className="w-3 h-3 text-blue-400" /> {app.time}
                </span>
                <span className="text-emerald-500 font-sans font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Real-Time Booking Toast Alert */}
      {liveToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-500/40 shadow-2xl flex items-center gap-3 animate-fadeIn">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">{liveToast}</span>
        </div>
      )}

      {/* 2-Column Layout: Live Conversations & Captured CRM Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Col: Live Active Inbox */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Live Conversations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time patient chat sessions
              </p>
            </div>
            <button
              onClick={() => onSelectTab('patients')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View All Patients</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {conversations.map((conv) => {
              const isHandover = conv.status === 'human_takeover';

              return (
                <GlassCard
                  key={conv.id}
                  hoverEffect
                  onClick={() => onSelectTab('patients')}
                  className={`p-4 transition-all duration-200 ${
                    isHandover ? 'border-rose-500/40 dark:border-rose-500/40 bg-rose-500/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200">
                        {conv.lead.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                            {conv.lead.fullName}
                          </h4>
                          <span className="text-xs text-slate-400 font-mono">
                            {conv.lead.phoneNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {isHandover ? (
                        <Badge variant="danger" dot size="sm">
                          Human Handover
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm">
                          AI ({Math.round(conv.lastConfidenceScore * 100)}% Conf.)
                        </Badge>
                      )}
                      <span className="text-[11px] text-slate-400 font-medium">
                        {conv.lastMessageTime}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Right Col: High-Value Captured Leads */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Recent Captured Leads
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Contact details & treatment preferences
              </p>
            </div>
            <button
              onClick={() => onSelectTab('patients')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Full Patients Hub</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {leads.slice(0, 3).map((lead) => (
              <GlassCard key={lead.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">
                    {lead.fullName}
                  </div>
                  <Badge
                    variant={
                      lead.status === 'booked'
                        ? 'success'
                        : lead.status === 'qualified'
                        ? 'primary'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {lead.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                  {Object.entries(lead.customData).slice(0, 2).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-slate-400">{key}:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{String(val)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{lead.source}</span>
                  <span>{lead.lastInteraction}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

      </div>

      {/* Website Chat Widget Embed Modal */}
      <WebsiteWidgetEmbedModal
        isOpen={showWidgetModal}
        onClose={() => setShowWidgetModal(false)}
        clinicName="St. James Dental Practice"
      />

      {/* 8:00 AM Morning Executive WhatsApp Briefing Modal (Retention Engine) */}
      <MorningBriefingModal
        isOpen={showBriefingModal}
        onClose={() => setShowBriefingModal(false)}
        clinicName="St. James Dental Practice"
      />

      {/* Empty Chair / Short-Notice Cancellation Recall Modal (High-Ticket Upsell) */}
      <EmptyChairRecallModal
        isOpen={showRecallModal}
        onClose={() => setShowRecallModal(false)}
        clinicName="St. James Dental Practice"
      />

      {/* Client Proposal & 3-Tier Agreement Generator (Sales Velocity) */}
      <ClientProposalModal
        isOpen={showProposalModal}
        onClose={() => setShowProposalModal(false)}
        clinicName="St. James Dental Practice"
      />

    </div>
  );
};
