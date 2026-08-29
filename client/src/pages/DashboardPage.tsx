import React from 'react';
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
  ChevronRight
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Conversation, KPIStats, Lead, NavigationTab } from '../types';

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
      value: stats.appointments.toLocaleString(),
      delta: stats.appointmentsDelta,
      icon: CalendarCheck,
      color: 'purple',
      description: 'Booked in Google Calendar',
    },
    {
      title: 'Revenue Estimate',
      value: `$${stats.revenueEstimate.toLocaleString()}`,
      delta: stats.revenueEstimateDelta,
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
      
      {/* Top Banner: Greeting & Quick AI Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-xl shadow-lg shadow-blue-500/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Sales Assistant Live & Converting
            </h2>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Auto-answering questions from your uploaded knowledge base and scheduling consultations 24/7.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('knowledge')}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-black/5 dark:border-white/10 rounded-xl transition-all duration-200 shadow-sm"
          >
            Upload Price Sheet
          </button>
          <button
            onClick={onOpenTestChat}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl shadow-lg shadow-blue-600/25 transition-all duration-200"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Customer Chat</span>
          </button>
        </div>
      </div>

      {/* 6 Required Glassmorphic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          const isPositive = card.delta >= 0;

          return (
            <GlassCard
              key={idx}
              hoverEffect
              className="p-5 relative overflow-hidden group"
            >
              {/* Subtle gradient corner glow */}
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />

              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:scale-105 transition-transform duration-200">
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold">
                  {card.title === 'Human Takeovers' ? (
                    <span className="text-emerald-500 flex items-center">
                      <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> -33%
                    </span>
                  ) : (
                    <span
                      className={`flex items-center ${
                        isPositive ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                      )}
                      {card.delta}%
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {card.title}
                </p>
                <div className="flex items-baseline gap-2 mt-1 mb-1">
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {card.value}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {card.description}
                </p>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Main Grid: Recent Conversations & Lead Pipeline Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Conversations & Human Takeover Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Live WhatsApp Dialogues
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Recent conversations handled by AI with real-time confidence scores
              </p>
            </div>
            <button
              onClick={() => onSelectTab('conversations')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View All Inbox</span>
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
                  onClick={() => onSelectTab('conversations')}
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
                Recent Leads
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Captured contact info & preferences
              </p>
            </div>
            <button
              onClick={() => onSelectTab('leads')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Full CRM</span>
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

    </div>
  );
};
