import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { SystemHealthBanner } from './components/layout/SystemHealthBanner';
import { defaultLocations, ClinicLocation } from './components/layout/LocationSwitcher';
import { LandingPage } from './pages/LandingPage';
import { SignUpPage } from './pages/SignUpPage';
import { PatientPortalPage } from './pages/PatientPortalPage';
import { InteractiveSlotPicker, BookingDetails } from './components/booking/InteractiveSlotPicker';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { MissedRevenueRadarPage } from './pages/MissedRevenueRadarPage';
import { AITrainingCenterPage } from './pages/AITrainingCenterPage';
import { AIPlaygroundPage } from './pages/AIPlaygroundPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SecurityCenterPage } from './pages/SecurityCenterPage';
import { SettingsPage } from './pages/SettingsPage';
import { OnboardingWizardModal } from './components/onboarding/OnboardingWizardModal';
import { ExecutiveDailyBriefingModal } from './components/dashboard/ExecutiveDailyBriefingModal';
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
  const [currentLocation, setCurrentLocation] = useState<ClinicLocation>(defaultLocations[0]);
  const [stats, setStats] = useState<KPIStats>(initialKPIs);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFAQs);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(initialBusinessProfile);
  const [isTestChatOpen, setIsTestChatOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isDailyBriefingOpen, setIsDailyBriefingOpen] = useState(false);
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
      nextState ? '🤖 AI Front Desk Live' : '⏸️ AI Front Desk Paused',
      nextState 
        ? 'The AI front desk is now auto-replying to patient inquiries.'
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
              ? 'Clinic front desk has taken manual control of this chat.'
              : 'AI autopilot resumed responding to this patient.',
            nextStatus === 'human_takeover' ? 'alert' : 'success'
          );
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const handleSendMessage = (conversationId: string, text: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: text,
            lastMessageTime: now,
            unreadCount: 0,
          };
        }
        return c;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-300">
      
      {/* 1. Public Clinic Patient Landing Page */}
      {currentView === 'landing' && (
        <LandingPage
          businessProfile={businessProfile}
          onOpenAdmin={() => setCurrentView('admin')}
          onOpenSignUp={() => setCurrentView('signup')}
          onOpenSlotPicker={(treatment?: string) => {
            if (treatment) setSelectedInitialService(treatment);
            setCurrentView('booking');
          }}
        />
      )}

      {/* 2. Interactive Appointment Slot Picker */}
      {currentView === 'booking' && (
        <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 md:p-8">
          <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentView('landing')}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              ← Back to Practice Home
            </button>
            <span className="text-xs text-blue-400 font-mono">Verified 24/7 Booking Engine</span>
          </div>

          <InteractiveSlotPicker
            businessProfile={businessProfile}
            initialTreatment={selectedInitialService}
            onBookingComplete={(details: BookingDetails) => {
              setCurrentBooking(details);
              setCurrentView('patient-portal');
            }}
            onCancel={() => setCurrentView('landing')}
          />
        </div>
      )}

      {/* 3. Patient Account Creation Step */}
      {currentView === 'signup' && (
        <SignUpPage
          businessProfile={businessProfile}
          onNavigateHome={() => setCurrentView('landing')}
        />
      )}

      {/* 4. Confirmed Patient Portal */}
      {currentView === 'patient-portal' && (
        <PatientPortalPage
          booking={currentBooking || {
            customerName: 'Sophia Martinez',
            customerPhone: '+1 (555) 234-5678',
            customerEmail: 'sophia@example.com',
            treatment: 'Cosmetic Laser Teeth Whitening ($350)',
            selectedDate: 'Friday, Sep 4',
            selectedTime: '3:00 PM',
            insurance: 'Delta Dental PPO',
          }}
          businessProfile={businessProfile}
          onNavigateHome={() => setCurrentView('landing')}
          onBookAnother={() => setCurrentView('booking')}
        />
      )}

      {/* 5. Doctor Practice Administration Operating System */}
      {currentView === 'admin' && (
        <div className="min-h-screen flex flex-col">
          
          {/* Top Return to Patient Website Banner */}
          <div className="bg-gradient-to-r from-blue-900/90 via-indigo-950/90 to-slate-950 px-6 py-2 border-b border-blue-500/20 text-xs flex items-center justify-between text-blue-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">
                Apex Dental Operating System • {currentLocation.name}
              </span>
            </div>

            <button
              onClick={() => setCurrentView('landing')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600/80 hover:bg-blue-600 font-semibold text-white transition-all shadow-sm active:scale-95"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>View Public Clinic Website</span>
            </button>
          </div>

          {/* Top Enterprise Navbar */}
          <Navbar
            businessName={businessProfile.name}
            isAIAutopilotEnabled={businessProfile.aiAutopilotEnabled}
            currentLocation={currentLocation}
            onSelectLocation={setCurrentLocation}
            onToggleAI={handleToggleGlobalAI}
            onOpenTestChat={() => setIsTestChatOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onOpenDailyBriefing={() => setIsDailyBriefingOpen(true)}
          />

          {/* System Health Checkmark Matrix */}
          <SystemHealthBanner />

          <div className="max-w-7xl mx-auto flex w-full">
            <Sidebar
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              unreadMessagesCount={unreadMessages}
              takeoversNeededCount={takeoversNeeded}
            />

            <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-130px)]">
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

              {activeTab === 'missed-revenue' && (
                <MissedRevenueRadarPage />
              )}

              {activeTab === 'training' && (
                <AITrainingCenterPage />
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

      {/* Daily 8:00 AM Executive Morning Briefing Modal */}
      <ExecutiveDailyBriefingModal
        isOpen={isDailyBriefingOpen}
        onClose={() => setIsDailyBriefingOpen(false)}
        clinicName={businessProfile.name}
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
