import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { SignUpPage } from './pages/SignUpPage';
import { PatientPortalPage } from './pages/PatientPortalPage';
import { InteractiveSlotPicker, BookingDetails } from './components/booking/InteractiveSlotPicker';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { AIPlaygroundPage } from './pages/AIPlaygroundPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SecurityCenterPage } from './pages/SecurityCenterPage';
import { SettingsPage } from './pages/SettingsPage';
import { OnboardingWizardModal } from './components/onboarding/OnboardingWizardModal';
import { FloatingGeminiChat } from './components/chat/FloatingGeminiChat';
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
  const [currentView, setCurrentView] = useState<'landing' | 'booking' | 'patient-portal' | 'signup' | 'admin'>('landing');
  const [selectedInitialService, setSelectedInitialService] = useState<string>('Cosmetic Laser Teeth Whitening ($350)');
  const [currentBooking, setCurrentBooking] = useState<BookingDetails | null>({
    customerName: 'Sophia Martinez',
    customerPhone: '+1 (555) 234-5678',
    customerEmail: 'sophia@example.com',
    treatment: 'Cosmetic Laser Teeth Whitening ($350)',
    selectedDate: 'Friday, Sep 4',
    selectedTime: '3:00 PM',
    insurance: 'Delta Dental PPO',
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [stats, setStats] = useState<KPIStats>(initialKPIs);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFAQs);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(initialBusinessProfile);
  const [isTestChatOpen, setIsTestChatOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
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
      nextState ? '🤖 AI Receptionist Live' : '⏸️ AI Receptionist Paused',
      nextState 
        ? 'The AI receptionist is now auto-replying to patient inquiries.'
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
            nextStatus === 'human_takeover' ? '🔒 Human Takeover Active' : '🤖 AI Autopilot Resumed',
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

  const handleBookingCompleted = (details: BookingDetails) => {
    setCurrentBooking(details);
    // Add to live leads in CRM
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      fullName: details.customerName,
      phoneNumber: details.customerPhone,
      email: details.customerEmail,
      status: 'booked',
      customData: {
        'Treatment': details.treatment,
        'Appointment Slot': `${details.selectedDate} at ${details.selectedTime}`,
        'Insurance': details.insurance,
      },
      lastInteraction: 'Just now',
      source: 'Online Calendar Booking',
    };
    setLeads(prev => [newLead, ...prev]);
    setStats(prev => ({ ...prev, appointments: prev.appointments + 1 }));
    setCurrentView('patient-portal');
    showToast('Appointment Confirmed', `${details.customerName} booked for ${details.selectedDate}!`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* 1. Doctor Clinic Landing Page (Customer Ad Destination) */}
      {currentView === 'landing' && (
        <LandingPage
          businessProfile={businessProfile}
          onOpenAdmin={() => setCurrentView('admin')}
          onOpenSignUp={() => setCurrentView('booking')}
          onOpenSlotPicker={(svc) => {
            if (svc) setSelectedInitialService(svc);
            setCurrentView('booking');
          }}
        />
      )}

      {/* 2. Interactive Calendar Slot Picker & Patient Intake */}
      {currentView === 'booking' && (
        <InteractiveSlotPicker
          businessProfile={businessProfile}
          initialTreatment={selectedInitialService}
          onBookingComplete={handleBookingCompleted}
          onCancel={() => setCurrentView('landing')}
        />
      )}

      {/* 3. Confirmed Patient Portal View */}
      {currentView === 'patient-portal' && currentBooking && (
        <PatientPortalPage
          booking={currentBooking}
          businessProfile={businessProfile}
          onNavigateHome={() => setCurrentView('landing')}
          onBookAnother={() => setCurrentView('booking')}
        />
      )}

      {/* 4. Standalone Sign-Up */}
      {currentView === 'signup' && (
        <SignUpPage
          businessProfile={businessProfile}
          onNavigateHome={() => setCurrentView('landing')}
        />
      )}

      {/* 5. Doctor Admin Portal Dashboard */}
      {currentView === 'admin' && (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
          
          <div className="bg-slate-900 text-white px-6 py-2 border-b border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-300">Dr. Sarah Jensen • Practice Admin Portal</span>
            </div>
            <button
              onClick={() => setCurrentView('landing')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600/80 hover:bg-blue-600 font-semibold text-white transition-all shadow-sm"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>View Public Clinic Website</span>
            </button>
          </div>

          <Navbar
            businessName={businessProfile.name}
            isAIAutopilotEnabled={businessProfile.aiAutopilotEnabled}
            onToggleAI={handleToggleGlobalAI}
            onOpenTestChat={() => setIsTestChatOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
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

              {activeTab === 'patients' && (
                <PatientsPage
                  conversations={conversations}
                  leads={leads}
                  onToggleTakeover={handleToggleTakeover}
                  onSendMessage={handleSendMessage}
                  onSelectTab={setActiveTab}
                />
              )}

              {activeTab === 'playground' && (
                <AIPlaygroundPage />
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
                    showToast('Knowledge Chunked', `"${name}" indexed for AI knowledge base.`, 'success');
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

              {activeTab === 'performance' && (
                <AnalyticsPage onSelectTab={setActiveTab} />
              )}

              {activeTab === 'security' && (
                <SecurityCenterPage />
              )}

              {activeTab === 'settings' && (
                <SettingsPage
                  businessProfile={businessProfile}
                  onUpdateProfile={(u) => {
                    setBusinessProfile(u);
                    showToast('Saved', 'Profile synchronized across channels.', 'success');
                  }}
                />
              )}
            </main>
          </div>

        </div>
      )}

      {/* Floating 24/7 AI Receptionist Chat Widget */}
      <FloatingGeminiChat
        businessName={businessProfile.name}
        currentPage={currentView}
      />

      {/* Real-time Notification Toast */}
      {liveToast && (
        <div className="fixed top-6 right-6 z-50 max-w-sm p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-xl flex items-start gap-3 animate-fadeIn">
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

      {/* Enterprise Clinic Onboarding Wizard Modal */}
      <OnboardingWizardModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        businessProfile={businessProfile}
        onSaveProfile={(p) => {
          setBusinessProfile(p);
          showToast('Setup Complete! 🎉', 'Your AI receptionist is live and synchronized.', 'success');
        }}
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
