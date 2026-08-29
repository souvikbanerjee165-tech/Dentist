import React, { useState } from 'react';
import { 
  Search, 
  Bot, 
  User, 
  Send, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Phone, 
  Mail, 
  FileText, 
  Zap,
  CheckCheck,
  UserCheck
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Conversation, Message } from '../types';

interface ConversationsPageProps {
  conversations: Conversation[];
  onToggleTakeover: (conversationId: string) => void;
  onSendMessage: (conversationId: string, text: string) => void;
}

export const ConversationsPage: React.FC<ConversationsPageProps> = ({
  conversations,
  onToggleTakeover,
  onSendMessage,
}) => {
  const [selectedId, setSelectedId] = useState<string>(conversations[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ai_active' | 'human_takeover'>('all');
  const [replyInput, setReplyInput] = useState('');

  const selectedConv = conversations.find((c) => c.id === selectedId) || conversations[0];

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lead.phoneNumber.includes(searchQuery);
    const matchesStatus =
      statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !selectedConv) return;
    onSendMessage(selectedConv.id, replyInput);
    setReplyInput('');
  };

  const quickReplies = [
    'Would you prefer Friday 3 PM or Saturday 11 AM?',
    'Could you share your best email address for the calendar invite?',
    'I have connected you directly with our clinic director.',
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-4 animate-fadeIn">
      
      {/* 1. Left Sidebar: Conversation List */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col gap-3 shrink-0">
        
        {/* Search & Filter header */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 p-1 bg-slate-200/50 dark:bg-slate-900/60 rounded-xl border border-black/5 dark:border-white/5 text-xs font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-1 py-1 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({conversations.length})
            </button>
            <button
              onClick={() => setStatusFilter('human_takeover')}
              className={`flex-1 py-1 rounded-lg transition-all ${
                statusFilter === 'human_takeover'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-rose-400'
              }`}
            >
              Needs Human
            </button>
            <button
              onClick={() => setStatusFilter('ai_active')}
              className={`flex-1 py-1 rounded-lg transition-all ${
                statusFilter === 'ai_active'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              AI Active
            </button>
          </div>
        </div>

        {/* Conversation Items List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredConversations.map((conv) => {
            const isSelected = conv.id === selectedConv?.id;
            const isHandover = conv.status === 'human_takeover';

            return (
              <div
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`
                  p-3.5 rounded-2xl cursor-pointer transition-all duration-200 border
                  ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500/40 shadow-sm'
                      : isHandover
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                      : 'bg-white/50 dark:bg-slate-900/40 border-black/5 dark:border-white/5 hover:bg-white dark:hover:bg-slate-800/60'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      {conv.lead.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {conv.lead.fullName}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {conv.lead.phoneNumber}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                    {conv.lastMessageTime}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mb-2">
                  {conv.lastMessage}
                </p>

                <div className="flex items-center justify-between">
                  {isHandover ? (
                    <Badge variant="danger" dot size="sm">
                      Takeover Needed
                    </Badge>
                  ) : (
                    <Badge variant="success" size="sm">
                      AI Active ({Math.round(conv.lastConfidenceScore * 100)}%)
                    </Badge>
                  )}

                  {conv.lead.status === 'booked' && (
                    <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      Booked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Middle: Active WhatsApp Conversation Pane */}
      {selectedConv ? (
        <div className="flex-1 flex flex-col rounded-3xl bg-white/70 dark:bg-slate-950/60 border border-black/5 dark:border-white/10 backdrop-blur-xl shadow-lg overflow-hidden">
          
          {/* Conversation Header */}
          <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-white/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
                {selectedConv.lead.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedConv.lead.fullName}
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    {selectedConv.lead.phoneNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>WhatsApp Cloud API Direct</span>
                </div>
              </div>
            </div>

            {/* AI vs Human Takeover Switch Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleTakeover(selectedConv.id)}
                className={`
                  flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 active:scale-95 shadow-sm
                  ${
                    selectedConv.status === 'human_takeover'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/25'
                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 border border-rose-500/30'
                  }
                `}
              >
                {selectedConv.status === 'human_takeover' ? (
                  <>
                    <Bot className="w-3.5 h-3.5" />
                    <span>Resume AI Autopilot</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Take Over Conversation</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
            {selectedConv.messages.map((msg) => {
              const isUser = msg.senderType === 'user';
              const isAI = msg.senderType === 'ai';
              const isAgent = msg.senderType === 'human_agent';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`
                      max-w-md md:max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm
                      ${
                        isUser
                          ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm'
                          : isAI
                          ? 'bg-blue-600 text-white rounded-tr-sm shadow-blue-500/20'
                          : 'bg-emerald-600 text-white rounded-tr-sm shadow-emerald-500/20'
                      }
                    `}
                  >
                    {/* Header of message bubble */}
                    <div className="flex items-center justify-between gap-2 mb-1 opacity-80 text-[10px] font-semibold">
                      <span className="flex items-center gap-1">
                        {isUser ? (
                          <User className="w-3 h-3" />
                        ) : isAI ? (
                          <Bot className="w-3 h-3" />
                        ) : (
                          <UserCheck className="w-3 h-3" />
                        )}
                        {isUser ? selectedConv.lead.fullName : isAI ? 'Sales AI Assistant' : 'Human Agent (Owner)'}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* AI Tool calls / Function tags badge */}
                    {isAI && msg.toolsUsed && msg.toolsUsed.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/20 flex flex-wrap gap-1">
                        {msg.toolsUsed.map((tool) => (
                          <span
                            key={tool}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-black/20 text-blue-100 font-mono"
                          >
                            ⚡ {tool}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Reply Suggestions */}
          <div className="px-4 py-2 bg-slate-100/60 dark:bg-slate-900/60 border-t border-black/5 dark:border-white/5 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Quick Reply:
            </span>
            {quickReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => setReplyInput(reply)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-500 shrink-0 transition-all"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Reply Input Bar */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white/80 dark:bg-slate-900/80 border-t border-black/5 dark:border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={
                selectedConv.status === 'human_takeover'
                  ? 'Type your message to the customer (Human Takeover mode)...'
                  : 'Type to reply manually or test AI...'
              }
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <button
              type="submit"
              className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      ) : null}

      {/* 3. Right: Lead Details & Context Inspector */}
      {selectedConv ? (
        <div className="hidden lg:flex w-72 flex-col gap-4 shrink-0">
          <GlassCard className="p-4 space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Lead Information
              </h4>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedConv.lead.fullName}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-mono">{selectedConv.lead.phoneNumber}</span>
              </div>
              {selectedConv.lead.email && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  <span>{selectedConv.lead.email}</span>
                </div>
              )}
            </div>

            {/* Custom attributes extracted by AI */}
            <div className="pt-3 border-t border-black/5 dark:border-white/10 space-y-2">
              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Captured Preferences
              </h5>
              <div className="space-y-1.5">
                {Object.entries(selectedConv.lead.customData).map(([key, val]) => (
                  <div key={key} className="bg-slate-50 dark:bg-slate-900/80 p-2 rounded-lg border border-black/5 dark:border-white/5">
                    <span className="text-[10px] text-slate-400 block">{key}</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {selectedConv.lead.notes && (
              <div className="pt-3 border-t border-black/5 dark:border-white/10">
                <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  AI Context Notes
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-blue-500/5 p-2 rounded-lg border border-blue-500/10">
                  {selectedConv.lead.notes}
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      ) : null}

    </div>
  );
};
