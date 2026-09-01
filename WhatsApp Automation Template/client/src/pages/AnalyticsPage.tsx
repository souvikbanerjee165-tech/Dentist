import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Zap, 
  CheckCircle2, 
  ShieldAlert, 
  DollarSign, 
  Calendar, 
  HelpCircle, 
  AlertTriangle,
  Plus,
  ArrowUpRight,
  ChevronRight,
  Flame
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { NavigationTab } from '../types';

interface AnalyticsPageProps {
  onSelectTab?: (tab: NavigationTab) => void;
  onAddFAQFromMissed?: (question: string) => void;
}

type Timeframe = 'daily' | 'weekly' | 'monthly';

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  onSelectTab,
  onAddFAQFromMissed,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('weekly');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Timeframe Data Models
  const dataByTimeframe = {
    daily: {
      label: 'Today (Hourly Activity)',
      totalConversations: 142,
      deltaConversations: 18.4,
      avgResponseTime: '1.3s',
      leadConversionRate: '28.2%',
      appointmentsBooked: 9,
      revenueGenerated: 3150,
      chartBars: [
        { label: '8 AM', value: 8, revenue: '$250' },
        { label: '10 AM', value: 24, revenue: '$700' },
        { label: '12 PM', value: 32, revenue: '$950' },
        { label: '2 PM', value: 28, revenue: '$600' },
        { label: '4 PM', value: 19, revenue: '$350' },
        { label: '6 PM', value: 18, revenue: '$300' },
        { label: '8 PM', value: 13, revenue: '$0' },
      ],
    },
    weekly: {
      label: 'This Week (Mon - Sun)',
      totalConversations: 840,
      deltaConversations: 24.6,
      avgResponseTime: '1.4s',
      leadConversionRate: '25.8%',
      appointmentsBooked: 48,
      revenueGenerated: 16800,
      chartBars: [
        { label: 'Mon', value: 98, revenue: '$2,100' },
        { label: 'Tue', value: 135, revenue: '$3,150' },
        { label: 'Wed', value: 152, revenue: '$3,850' },
        { label: 'Thu', value: 140, revenue: '$2,800' },
        { label: 'Fri', value: 178, revenue: '$4,200' },
        { label: 'Sat', value: 92, revenue: '$700' },
        { label: 'Sun', value: 45, revenue: '$0' },
      ],
    },
    monthly: {
      label: 'Last 12 Months',
      totalConversations: 3620,
      deltaConversations: 34.2,
      avgResponseTime: '1.4s',
      leadConversionRate: '24.1%',
      appointmentsBooked: 194,
      revenueGenerated: 68400,
      chartBars: [
        { label: 'Jan', value: 210, revenue: '$4,200' },
        { label: 'Feb', value: 245, revenue: '$4,900' },
        { label: 'Mar', value: 290, revenue: '$5,800' },
        { label: 'Apr', value: 310, revenue: '$6,200' },
        { label: 'May', value: 340, revenue: '$6,800' },
        { label: 'Jun', value: 385, revenue: '$7,700' },
        { label: 'Jul', value: 420, revenue: '$8,400' },
        { label: 'Aug', value: 480, revenue: '$9,600' },
      ],
    },
  };

  const currentData = dataByTimeframe[timeframe];
  const maxBarValue = Math.max(...currentData.chartBars.map((b) => b.value));

  // Top Customer Questions
  const topQuestions = [
    {
      question: 'How much is the laser teeth whitening & deep clean?',
      category: 'Pricing',
      count: 342,
      accuracy: '99.4%',
    },
    {
      question: 'Do you accept MetLife and Delta Dental insurance?',
      category: 'Insurance',
      count: 215,
      accuracy: '98.8%',
    },
    {
      question: 'What are your clinic opening hours on Saturday?',
      category: 'Hours',
      count: 184,
      accuracy: '100%',
    },
    {
      question: 'Can I book a consultation with Dr. Reynolds for Friday?',
      category: 'Booking',
      count: 156,
      accuracy: '97.6%',
    },
  ];

  // Missed / Low Confidence Questions (Needing Owner Review / FAQ Training)
  const missedQuestions = [
    {
      id: 'mq-1',
      question: 'Can your clinic design a custom rehab plan for post-surgery L4-L5 herniated disc?',
      reason: 'Medical clearance & diagnosis required',
      confidence: 48,
      timestamp: '2 hours ago',
    },
    {
      id: 'mq-2',
      question: 'Do you have financing plans with 0% interest for dental implants?',
      reason: 'Financing tiers not present in Knowledge Base',
      confidence: 52,
      timestamp: '5 hours ago',
    },
    {
      id: 'mq-3',
      question: 'Can you provide emergency root canal treatment on Sunday evening?',
      reason: 'After-hours on-call policy unverified',
      confidence: 45,
      timestamp: 'Yesterday',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Header with Timeframe Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Performance & Revenue Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time conversion tracking, customer inquiry volume, and AI resolution quality.
          </p>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-900/80 border border-black/5 dark:border-white/5 text-xs font-semibold">
          {(['daily', 'weekly', 'monthly'] as Timeframe[]).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3.5 py-1.5 rounded-lg capitalize transition-all ${
                timeframe === t
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t} View
            </button>
          ))}
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* 1. Conversations */}
        <GlassCard className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {timeframe} Chats
            </span>
            <span className="text-xs font-semibold text-emerald-500 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +{currentData.deltaConversations}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {currentData.totalConversations.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Total WhatsApp dialogues
          </p>
        </GlassCard>

        {/* 2. Response Time */}
        <GlassCard className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Avg. Response
            </span>
            <span className="text-xs font-semibold text-emerald-500">Instant</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {currentData.avgResponseTime}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            vs 45m manual average
          </p>
        </GlassCard>

        {/* 3. Lead Conversion */}
        <GlassCard className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Lead Conversion
            </span>
            <span className="text-xs font-semibold text-blue-500">Auto-Qualified</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {currentData.leadConversionRate}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Inquiries captured in CRM
          </p>
        </GlassCard>

        {/* 4. Appointments Booked */}
        <GlassCard className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Bookings
            </span>
            <span className="text-xs font-semibold text-purple-500">Google Cal</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {currentData.appointmentsBooked}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Confirmed consultations
          </p>
        </GlassCard>

        {/* 5. Revenue Generated */}
        <GlassCard className="p-4 space-y-2 border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Revenue Won
            </span>
            <span className="text-xs font-semibold text-emerald-500 flex items-center">
              <Flame className="w-3.5 h-3.5" /> Pipeline
            </span>
          </div>
          <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ${currentData.revenueGenerated.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Direct sales attribution
          </p>
        </GlassCard>

      </div>

      {/* Main Interactive Chart: Volume & Revenue Progression */}
      <GlassCard className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span>Inbound WhatsApp Traffic & Sales Activity ({currentData.label})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hover over bars to inspect conversation volume and revenue generated.
            </p>
          </div>
          <Badge variant="primary" size="sm">
            {timeframe.toUpperCase()} TREND
          </Badge>
        </div>

        {/* Interactive SVG / Bar Visualizer */}
        <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-4 px-2 border-b border-black/5 dark:border-white/10">
          {currentData.chartBars.map((bar, idx) => {
            const heightPercent = Math.max((bar.value / maxBarValue) * 100, 12);
            const isHovered = hoveredBarIndex === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredBarIndex(idx)}
                onMouseLeave={() => setHoveredBarIndex(null)}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer relative"
              >
                {/* Floating Tooltip on Hover */}
                {isHovered && (
                  <div className="absolute -top-12 z-20 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl whitespace-nowrap animate-fadeIn border border-white/10">
                    <p className="font-bold">{bar.value} Messages</p>
                    <p className="text-[10px] text-emerald-400">{bar.revenue} Pipeline</p>
                  </div>
                )}

                {/* Animated Glass Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`
                    w-full max-w-[48px] rounded-t-xl transition-all duration-300 relative overflow-hidden
                    ${
                      isHovered
                        ? 'bg-gradient-to-t from-blue-600 via-indigo-500 to-cyan-400 shadow-lg shadow-blue-500/30'
                        : 'bg-gradient-to-t from-blue-600/60 to-indigo-500/60 hover:from-blue-600 hover:to-cyan-400'
                    }
                  `}
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors">
                  {bar.label}
                </span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Grid: Top Questions vs Missed Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Top Inquired Questions */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Top Customer Questions</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Most frequent inquiries handled 100% autonomously by AI
              </p>
            </div>
            <Badge variant="success" size="sm">
              High Accuracy
            </Badge>
          </div>

          <div className="space-y-2.5">
            {topQuestions.map((q, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-black/5 dark:border-white/5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded-md">
                      {q.category}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {q.count} queries
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                    "{q.question}"
                  </h4>
                </div>

                <span className="text-xs font-bold text-emerald-500 shrink-0">
                  {q.accuracy}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Right: Missed Questions & Human Escalations (Interactive Training) */}
        <GlassCard className="p-6 space-y-4 border-rose-500/20 bg-rose-500/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Missed & Escalated Questions</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Inquiries with low confidence — 1-click add to Knowledge Base
              </p>
            </div>
            <Badge variant="danger" size="sm">
              Train AI
            </Badge>
          </div>

          <div className="space-y-2.5">
            {missedQuestions.map((mq) => (
              <div
                key={mq.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-500/20 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                    "{mq.question}"
                  </h4>
                  <span className="text-[10px] font-mono text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded-md shrink-0">
                    {mq.confidence}% Conf.
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-black/5 dark:border-white/5">
                  <span>Reason: {mq.reason}</span>
                  
                  {onSelectTab && (
                    <button
                      onClick={() => onSelectTab('knowledge')}
                      className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add to FAQ</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

      </div>

    </div>
  );
};
