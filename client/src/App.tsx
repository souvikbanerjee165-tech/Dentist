import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './pages/LandingPage';
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
import { Bell, CheckCircle2, Globe, LayoutDashboard } from 'lucide-react';

export const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'admin'>('landing');
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [stats, setStats] = useState<KPIStats>(initialKPIs);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFAQs);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(initialBusinessProfile);
  const [isTestChatOpen, setIsTestChatOpen] = useState(false);
  const [liveToast, setLiveToast] = useState<{ title: string; message: string; type: 'info' | 'success' | 'alert' } | null>(null);

  const takeoversNeeded = conversations.filter(c => c.status === 'human_takeover').length;
  const unreadMessages = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const showToast = (title: string, message: string, type: 'info' | 'success' | 'alert' = 'info') => {
    setLiveToast({ title, message, type });
    setTimeout(() => setLiveToast(null), 4500);
  };

  const handleToggleGlobalAI = () => {
    const nextState = !businessProfile.aiAutopilotEnabled;
    setBusinessProfile(prev => ({ ...prev, aiAutopilotEnabled: nextState }));
    showToast(
      nextState ? '🤖 Gemini Autopilot Live' : '⏸️ AI Autopilot Paused',
      nextState 
        ? 'The Gemini assistant is now auto-replying to patient inquiries.'
        : 'AI is paused. All messages will wait for manual staff reply.',
      nextState ? 'success' : 'alert'
    );
  };

  const handleToggleTakeover = (conversationId: string) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          const nextStatus = c.status === 'human_takeover' ? 'ai_active' : 'human_takeover';
          showToast(
            nextStatus === 'human_takeover' ? '🔒 Human Takeover Active' : '🤖 Gemini Autopilot Resumed',
            nextStatus === 'human_takeover'
              ? `You have taken over the chat with ${c.lead.fullName}.`
              : `AI Autopilot has resumed for ${c.lead.fullName}.`,
            nextStatus === 'human_takeover' ? 'alert' : 'success'
          );
          return {
            ...c,
            status: nextStatus,
          };
        }
        return c;
      })
    );
  };

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
    showToast('Delivered to WhatsApp', text.slice(0, 45) + '...', 'success');
  };

  // If customer landing view is selected
  if (currentView === 'landing') {
    return (
      <LandingPage
        businessProfile={businessProfile}
        onOpenAdmin={() => setCurrentView('admin')}
      />
    );
  }

  // Admin Portal Dashboard View
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Top Navbar with Public Landing View switcher */}
      <div className="bg-slate-900 text-white px-6 py-2 border-b border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-300">Admin Control Portal</span>
        </div>
        <button
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600/80 hover:bg-blue-600 font-semibold text-white transition-all shadow-sm"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>View Public Customer Landing Page</span>
        </button>
      </div>

      <Navbar
        businessName={businessProfile.name}
        isAIAutopilotEnabled={businessProfile.aiAutopilotEnabled}
        onToggleAI={handleToggleGlobalAI}
        onOpenTestChat={() => setIsTestChatOpen(true)}
      />

      <div className="max-w-7xl mx-auto flex">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          unreadMessagesCount={unreadMessages}
          takeoversNeededCount={takeoversNeeded}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-100px)]">
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
              onUploadDocument={(name, type, size) => {
                setDocuments(prev => [{
                  id: `doc-${Date.now()}`,
                  name,
                  type,
                  chunksCount: 12,
                  size,
                  uploadedAt: 'Just now',
                  status: 'indexed',
                }, ...prev]);
                showToast('Knowledge Chunked', `"${name}" indexed for Gemini RAG.`, 'success');
              }}
              onDeleteDocument={(id) => setDocuments(prev => prev.filter(d => d.id !== id))}
              onAddFAQ={(newFaq) => {
                setFaqs(prev => [{ id: `faq-${Date.now()}`, ...newFaq, updatedAt: 'Just now' }, ...prev]);
                showToast('FAQ Indexed', `Added "${newFaq.question}"`, 'success');
              }}
              onUpdateFAQ={(id, question, answer, category) => {
                setFaqs(prev => prev.map(f => f.id === id ? { ...f, question, answer, category, updatedAt: 'Just now' } : f));
              }}
              onDeleteFAQ={(id) => setFaqs(prev => prev.filter(f => f.id !== id))}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPage onSelectTab={setActiveTab} />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              businessProfile={businessProfile}
              onUpdateProfile={(u) => {
                setBusinessProfile(u);
                showToast('Saved', 'Profile synchronized across Gemini channels.', 'success');
              }}
            />
          )}
        </main>
      </div>

      {/* Real-time Notification Toast */}
      {liveToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-xl flex items-start gap-3 animate-fadeIn">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
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
