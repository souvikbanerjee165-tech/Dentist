import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ConversationsPage } from './pages/ConversationsPage';
import { LeadsPage } from './pages/LeadsPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TestChatModal } from './components/chat/TestChatModal';
import { NavigationTab, Conversation, Lead, DocumentItem, KPIStats } from './types';
import { FAQItem, BusinessProfile } from './types/admin.types';
import { 
  initialKPIs, 
  initialConversations, 
  initialLeads, 
  initialDocuments,
  initialFAQs,
  initialBusinessProfile
} from './data/mockData';
import { Bell, CheckCircle2, Bot, MessageSquare } from 'lucide-react';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [stats, setStats] = useState<KPIStats>(initialKPIs);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFAQs);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(initialBusinessProfile);
  const [isTestChatOpen, setIsTestChatOpen] = useState(false);
  const [liveToast, setLiveToast] = useState<{ title: string; message: string; type: 'info' | 'success' | 'alert' } | null>(null);

  // Takeovers needed count
  const takeoversNeeded = conversations.filter(c => c.status === 'human_takeover').length;
  const unreadMessages = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  // Show toast helper
  const showToast = (title: string, message: string, type: 'info' | 'success' | 'alert' = 'info') => {
    setLiveToast({ title, message, type });
    setTimeout(() => setLiveToast(null), 4500);
  };

  // Toggle Global AI Autopilot
  const handleToggleGlobalAI = () => {
    const nextState = !businessProfile.aiAutopilotEnabled;
    setBusinessProfile(prev => ({ ...prev, aiAutopilotEnabled: nextState }));
    showToast(
      nextState ? '🤖 AI Autopilot Enabled' : '⏸️ AI Autopilot Paused',
      nextState 
        ? 'The AI assistant is now auto-replying to WhatsApp inquiries.'
        : 'AI is paused. All incoming messages will wait for manual owner replies.',
      nextState ? 'success' : 'alert'
    );
  };

  // Toggle Human Takeover on specific conversation
  const handleToggleTakeover = (conversationId: string) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          const nextStatus = c.status === 'human_takeover' ? 'ai_active' : 'human_takeover';
          showToast(
            nextStatus === 'human_takeover' ? '🔒 Human Takeover Active' : '🤖 AI Autopilot Resumed',
            nextStatus === 'human_takeover'
              ? `You have taken over the chat with ${c.lead.fullName}. AI is paused for this thread.`
              : `AI Autopilot has resumed for ${c.lead.fullName}.`,
            nextStatus === 'human_takeover' ? 'alert' : 'success'
          );
          return {
            ...c,
            status: nextStatus,
            messages: [
              ...c.messages,
              {
                id: `sys-${Date.now()}`,
                conversationId: c.id,
                senderType: 'system',
                content: nextStatus === 'human_takeover' 
                  ? '🔒 Human takeover activated. AI is now paused for this chat.' 
                  : '🤖 AI autopilot resumed for this conversation.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }
            ]
          };
        }
        return c;
      })
    );
  };

  // Send Human Agent reply
  const handleSendMessage = (conversationId: string, text: string) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: text,
            lastMessageTime: 'Just now',
            messages: [
              ...c.messages,
              {
                id: `msg-${Date.now()}`,
                conversationId: c.id,
                senderType: 'human_agent',
                content: text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }
            ]
          };
        }
        return c;
      })
    );
    showToast('Sent to WhatsApp', `Delivered reply to customer via WhatsApp Cloud API.`, 'success');
  };

  // Document upload handler
  const handleUploadDocument = (name: string, type: DocumentItem['type'], size: string) => {
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      name,
      type,
      chunksCount: Math.floor(Math.random() * 15) + 6,
      size,
      uploadedAt: 'Just now',
      status: 'indexed',
    };
    setDocuments(prev => [newDoc, ...prev]);
    showToast('Document Indexed', `"${name}" processed into vector chunks for RAG.`, 'success');
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    showToast('Document Removed', 'Knowledge chunks removed from vector store.', 'info');
  };

  // FAQ Handlers
  const handleAddFAQ = (newFaq: Omit<FAQItem, 'id' | 'updatedAt'>) => {
    const item: FAQItem = {
      id: `faq-${Date.now()}`,
      ...newFaq,
      updatedAt: 'Just now',
    };
    setFaqs(prev => [item, ...prev]);
    showToast('FAQ Added', `Question "${newFaq.question}" indexed for AI answers.`, 'success');
  };

  const handleUpdateFAQ = (id: string, question: string, answer: string, category: string) => {
    setFaqs(prev =>
      prev.map(f => (f.id === id ? { ...f, question, answer, category, updatedAt: 'Just now' } : f))
    );
    showToast('FAQ Updated', 'Vector embeddings re-indexed with new answer.', 'success');
  };

  const handleDeleteFAQ = (id: string) => {
    setFaqs(prev => prev.filter(f => f.id !== id));
    showToast('FAQ Deleted', 'FAQ removed from knowledge base.', 'info');
  };

  // Business Profile handler
  const handleUpdateProfile = (updated: BusinessProfile) => {
    setBusinessProfile(updated);
    showToast('Settings Saved', 'Business profile & AI system prompt updated.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Top Navbar */}
      <Navbar
        businessName={businessProfile.name}
        isAIAutopilotEnabled={businessProfile.aiAutopilotEnabled}
        onToggleAI={handleToggleGlobalAI}
        onOpenTestChat={() => setIsTestChatOpen(true)}
      />

      {/* Main App Body */}
      <div className="max-w-7xl mx-auto flex">
        
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          unreadMessagesCount={unreadMessages}
          takeoversNeededCount={takeoversNeeded}
        />

        {/* Dynamic Center Page View */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-65px)]">
          {activeTab === 'dashboard' && (
            <DashboardPage
              stats={stats}
              conversations={conversations}
              leads={leads}
              onSelectTab={setActiveTab}
              onOpenTestChat={() => setIsTestChatOpen(true)}
            />
          )}

          {activeTab === 'conversations' && (
            <ConversationsPage
              conversations={conversations}
              onToggleTakeover={handleToggleTakeover}
              onSendMessage={handleSendMessage}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsPage
              leads={leads}
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === 'knowledge' && (
            <KnowledgeBasePage
              documents={documents}
              faqs={faqs}
              onUploadDocument={handleUploadDocument}
              onDeleteDocument={handleDeleteDocument}
              onAddFAQ={handleAddFAQ}
              onUpdateFAQ={handleUpdateFAQ}
              onDeleteFAQ={handleDeleteFAQ}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPage onSelectTab={setActiveTab} />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              businessProfile={businessProfile}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </main>

      </div>

      {/* Real-time Notification Toast */}
      {liveToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce max-w-sm p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-xl flex items-start gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            liveToast.type === 'success' ? 'bg-emerald-500/15 text-emerald-500' :
            liveToast.type === 'alert' ? 'bg-rose-500/15 text-rose-500' : 'bg-blue-500/15 text-blue-500'
          }`}>
            {liveToast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{liveToast.title}</h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{liveToast.message}</p>
          </div>
        </div>
      )}

      {/* AI Customer Chat Simulator Modal */}
      <TestChatModal
        isOpen={isTestChatOpen}
        onClose={() => setIsTestChatOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
