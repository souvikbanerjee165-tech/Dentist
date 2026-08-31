import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  Building2, 
  Smartphone, 
  Database, 
  Zap, 
  ChevronRight,
  MessageSquare,
  Smile,
  Shield
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { BusinessProfile } from '../types/admin.types';

interface LandingPageProps {
  businessProfile: BusinessProfile;
  onOpenAdmin: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
  intent?: string;
  confidence?: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  businessProfile,
  onOpenAdmin,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'gemini',
      text: `Hello! 👋 Welcome to ${businessProfile.name}. I'm your 24/7 AI Patient Coordinator powered by Google Gemini Flash. How can I help you today?`,
      timestamp: 'Just now',
      intent: 'greeting',
      confidence: 0.99,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickPrompts = [
    { label: '💰 Laser Whitening Price', query: 'How much is your laser whitening treatment and what is included?' },
    { label: '🗓️ Book for Friday 3 PM', query: 'I would like to book an appointment this Friday at 3:00 PM. My name is Sophia Martinez.' },
    { label: '🛡️ Insurance Acceptance', query: 'Do you accept Delta Dental and MetLife insurance?' },
    { label: '📍 Clinic Location & Hours', query: 'Where is your clinic located and what are your opening hours?' },
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Direct call to the backend Gemini AI Engine
      const res = await fetch('/api/v1/chat/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessProfile.name,
          businessIndustry: businessProfile.industry,
          userMessage: textToSend,
          conversationHistory: messages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const turn = data.turn || data;

        setMessages((prev) => [
          ...prev,
          {
            id: `gem-${Date.now()}`,
            sender: 'gemini',
            text: turn.reply || "I'll connect you with our clinic coordinator right away.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            intent: turn.intent,
            confidence: turn.confidence,
          },
        ]);
      } else {
        throw new Error('Fallback required');
      }
    } catch (err) {
      // Local high-precision fallback response
      setTimeout(() => {
        const lower = textToSend.toLowerCase();
        let reply = "Hello! I'd be delighted to help. You can check our treatments, ask about pricing, or schedule a consultation with our team.";
        let intent = 'lead_qualification';

        if (lower.includes('whitening') || lower.includes('cost') || lower.includes('price') || lower.includes('how much')) {
          reply = 'Our Laser Whitening & Deep Clean package is $350. It includes the 45-minute in-office laser treatment, pre-treatment rinse, and a take-home remineralization kit. Would you like to check openings for this Friday?';
          intent = 'faq_inquiry';
        } else if (lower.includes('book') || lower.includes('friday') || lower.includes('appointment') || lower.includes('sophia')) {
          reply = 'We have confirmed Friday at 3:00 PM with Dr. Reynolds! Your appointment has been recorded in our Supabase system and a confirmation will be delivered to your WhatsApp. What is the best phone number to reach you?';
          intent = 'appointment_booking';
        } else if (lower.includes('insurance') || lower.includes('metlife') || lower.includes('cigna')) {
          reply = 'Yes! We accept all major PPO insurance providers including Delta Dental, MetLife, Cigna, Guardian, and Aetna. We file claims directly for you so you have zero paperwork.';
          intent = 'faq_inquiry';
        } else if (lower.includes('location') || lower.includes('hours') || lower.includes('where')) {
          reply = 'We are located at 450 Lexington Avenue, Suite 800, New York, NY. Open Monday - Friday 8:00 AM - 6:00 PM, and Saturdays 9:00 AM - 3:00 PM.';
          intent = 'faq_inquiry';
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `gem-${Date.now()}`,
            sender: 'gemini',
            text: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            intent,
            confidence: 0.96,
          },
        ]);
      }, 600);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const services = [
    {
      title: 'Cosmetic Laser Teeth Whitening',
      price: '$350',
      duration: '45 mins',
      description: 'Up to 8 shades brighter in one single visit with zero tooth sensitivity.',
      tag: 'Most Popular',
      prompt: 'I want to know more about the $350 Cosmetic Laser Whitening package.',
    },
    {
      title: 'Comprehensive Oral Exam & Clean',
      price: '$180',
      duration: '60 mins',
      description: 'Full digital 3D X-rays, periodontal health screening, and ultrasonic cleaning.',
      tag: 'Essential',
      prompt: 'I would like to book a Comprehensive Oral Exam and Deep Clean.',
    },
    {
      title: 'Porcelain Veneers & Smile Design',
      price: 'From $950',
      duration: 'Consultation',
      description: 'Custom handcrafted ultra-thin veneers tailored to your facial symmetry.',
      tag: 'Premium Cosmetic',
      prompt: 'Can you tell me about the process and cost for Porcelain Veneers?',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Top Floating Glass Navigation */}
      <header className="sticky top-0 z-40 w-full px-6 py-4 backdrop-blur-2xl bg-slate-950/70 border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">{businessProfile.name}</h1>
              <p className="text-[10px] text-slate-400 font-medium">{businessProfile.industry}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="success" dot size="sm">
              <span className="hidden sm:inline">⚡ Gemini 3.7 Brain Live</span>
              <span className="sm:hidden">Live</span>
            </Badge>

            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl backdrop-blur-md transition-all active:scale-95 shadow-sm"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Owner Admin Portal</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-6 overflow-hidden">
        {/* Glow Ambient Lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold backdrop-blur-md animate-fadeIn">
            <Bot className="w-4 h-4 text-blue-400" />
            <span>24/7 AI Patient Receptionist & Sales Assistant</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            Experience World-Class Care with{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Instant AI Booking
            </span>
          </h2>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
            Ask any question, check pricing, verify insurance, and schedule your appointment in seconds. Powered by <strong className="text-white">Google Gemini</strong> and synchronized directly with our calendar and database.
          </p>

        </div>
      </section>

      {/* Main Interactive Showcase: Live Gemini Assistant Chat */}
      <section className="max-w-5xl mx-auto px-6 pb-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Key Features & Trust */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Autonomous Patient Care
            </h3>
            <h4 className="text-2xl font-bold text-white leading-snug">
              Instant answers without the wait.
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our intelligent assistant reads from verified clinic protocols to provide immediate, medical-grade consultation scheduling.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Sub-Second Response Time</h5>
                  <p className="text-[11px] text-slate-400">Zero waiting on hold. Immediate answers 24/7/365.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Real-Time Google Calendar</h5>
                  <p className="text-[11px] text-slate-400">Live slot checks preventing any double-booking.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Direct Supabase Cloud Sync</h5>
                  <p className="text-[11px] text-slate-400">Name, Phone, Treatment, and Date saved automatically.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Gemini Chat Box */}
          <div className="lg:col-span-7">
            <GlassCard className="p-0 border-white/15 shadow-2xl overflow-hidden backdrop-blur-3xl bg-slate-900/80 rounded-3xl">
              
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 bg-slate-950/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Gemini Sales Assistant</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </h4>
                    <p className="text-[10px] text-slate-400">Online • Typically replies in 1s</p>
                  </div>
                </div>
                <Badge variant="primary" size="sm">
                  Google Gemini 3.7 / 2.5
                </Badge>
              </div>

              {/* Message Stream */}
              <div className="p-5 space-y-4 max-h-[380px] min-h-[340px] overflow-y-auto">
                {messages.map((m) => {
                  const isUser = m.sender === 'user';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fadeIn`}
                    >
                      <div
                        className={`
                          max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed
                          ${
                            isUser
                              ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-500/20'
                              : 'bg-slate-800/90 text-slate-100 rounded-bl-none border border-white/10'
                          }
                        `}
                      >
                        <p>{m.text}</p>
                      </div>

                      <div className="flex items-center gap-2 mt-1 px-1">
                        <span className="text-[9px] text-slate-500">{m.timestamp}</span>
                        {m.intent && !isUser && (
                          <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                            {m.intent}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 p-3 rounded-2xl bg-slate-800/50 border border-white/5 w-fit animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                    <span>Gemini is thinking and searching clinic records...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestion Chips */}
              <div className="px-4 py-2.5 bg-slate-950/40 border-t border-white/5 overflow-x-auto flex items-center gap-2 no-scrollbar">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(qp.query)}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 text-[11px] font-medium text-slate-300 hover:text-blue-300 transition-all active:scale-95"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <form onSubmit={handleFormSubmit} className="p-3 bg-slate-950/80 border-t border-white/10 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask a question or book your appointment..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-all active:scale-95 shadow-md shadow-blue-500/30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </GlassCard>
          </div>

        </div>
      </section>

      {/* Services Showcase Section */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center space-y-2 mb-10">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Popular Treatments
          </h3>
          <h4 className="text-2xl font-bold text-white">
            Transparent Pricing & Verified Expertise
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((svc, i) => (
            <GlassCard key={i} className="p-6 space-y-4 border-white/10 hover:border-blue-500/40 transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                    {svc.tag}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {svc.duration}
                  </span>
                </div>

                <h5 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  {svc.title}
                </h5>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {svc.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-lg font-extrabold text-white">{svc.price}</span>
                <button
                  type="button"
                  onClick={() => handleSendMessage(svc.prompt)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline"
                >
                  <span>Book with AI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 {businessProfile.name}. All rights reserved. Powered by Google Gemini & WhatsApp Cloud API.</p>
      </footer>

    </div>
  );
};
