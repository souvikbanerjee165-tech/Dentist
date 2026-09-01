import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings, 
  Bot,
  Zap,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Flame,
  BrainCircuit
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  unreadMessagesCount: number;
  takeoversNeededCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  unreadMessagesCount,
  takeoversNeededCount,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }>; badge?: number; alert?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'patients', 
      label: 'Patients', 
      icon: Users, 
      badge: unreadMessagesCount,
      alert: takeoversNeededCount > 0 
    },
    { id: 'missed-revenue', label: 'Missed Revenue', icon: Flame },
    { id: 'training', label: 'AI Training', icon: BrainCircuit },
    { id: 'playground', label: 'AI Playground', icon: Sparkles },
    { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'security', label: 'Security & Trust', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between p-4 h-[calc(100vh-65px)] sticky top-[65px] border-r border-black/5 dark:border-white/10 backdrop-blur-xl bg-white/40 dark:bg-slate-950/40 select-none">
      <div className="space-y-6">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              Nexus AI
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500 dark:text-blue-400 font-semibold border border-blue-500/20">PRO</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">WhatsApp Sales Engine</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.alert ? (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30 animate-pulse">
                    <ShieldAlert className="w-3 h-3" />
                    {takeoversNeededCount}
                  </span>
                ) : item.badge && item.badge > 0 ? (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-500/15 text-blue-500 dark:text-blue-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Human Takeover Alert Banner (when active) */}
      {takeoversNeededCount > 0 ? (
        <div 
          onClick={() => onSelectTab('patients')}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-500/10 to-amber-500/10 border border-rose-500/30 cursor-pointer hover:scale-[1.02] transition-transform duration-200 shadow-sm"
        >
          <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400 text-xs font-bold mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Human Action Needed</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {takeoversNeededCount} conversation(s) need owner attention due to low confidence.
          </p>
        </div>
      ) : (
        /* AI Status Pill */
        <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              AI Autopilot
            </span>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              ACTIVE
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[94%]" />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
            94.2% automated without human intervention
          </p>
        </div>
      )}
    </aside>
  );
};
