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
  ChevronRight,
  Clock
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

      {/* Top Banner: Greeting & Quick AI Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-xl shadow-lg shadow-blue-500/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              AI Receptionist Live & Converting
            </h2>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Auto-answering questions, qualifying dental patients, and scheduling consultations 24/7.
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
            <span>Simulate Patient Chat</span>
          </button>
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

    </div>
  );
};
