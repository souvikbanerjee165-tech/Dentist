import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Search, 
  Filter, 
  Download, 
  Send, 
  UserX, 
  Bot, 
  Calendar, 
  Sparkles,
  Phone,
  Mail,
  ShieldAlert,
  Clock,
  ChevronRight
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Conversation, Lead, NavigationTab } from '../types';
import { ConversationsPage } from './ConversationsPage';
import { LeadsPage } from './LeadsPage';

interface PatientsPageProps {
  conversations: Conversation[];
  leads: Lead[];
  onToggleTakeover: (conversationId: string) => void;
  onSendMessage: (conversationId: string, text: string) => void;
  onSelectTab: (tab: NavigationTab) => void;
}

export const PatientsPage: React.FC<PatientsPageProps> = ({
  conversations,
  leads,
  onToggleTakeover,
  onSendMessage,
  onSelectTab,
}) => {
  const [activeView, setActiveView] = useState<'chats' | 'directory'>('chats');

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header with Unified Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Patients Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage live patient WhatsApp inquiries, appointments, and contact records.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-900/70 border border-black/5 dark:border-white/10 backdrop-blur-md">
          <button
            onClick={() => setActiveView('chats')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200
              ${
                activeView === 'chats'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }
            `}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Live WhatsApp Chats</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white">
              {conversations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveView('directory')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200
              ${
                activeView === 'directory'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }
            `}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Patient Records</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white">
              {leads.length}
            </span>
          </button>
        </div>
      </div>

      {/* Sub-view Content */}
      {activeView === 'chats' ? (
        <ConversationsPage
          conversations={conversations}
          onToggleTakeover={onToggleTakeover}
          onSendMessage={onSendMessage}
        />
      ) : (
        <LeadsPage
          leads={leads}
          onSelectTab={onSelectTab}
        />
      )}

    </div>
  );
};
