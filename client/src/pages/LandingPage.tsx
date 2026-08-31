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
  Shield,
  UserPlus,
  Stethoscope,
  Award,
  Heart
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { BusinessProfile } from '../types/admin.types';

import { GeminiHumanEngine } from '../services/geminiHumanEngine';

interface LandingPageProps {
  businessProfile: BusinessProfile;
  onOpenAdmin: () => void;
  onOpenSignUp: () => void;
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
  onOpenSignUp,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'gemini',
      text: `Hello and welcome to ${businessProfile.name}! 😊 I'm Dr. Sarah Jensen's 24/7 AI Patient Receptionist. How can I help you today? If you're experiencing tooth pain, need pricing, or want to schedule an appointment, just ask!`,
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
    { label: '🚨 My teeth pains', query: 'my teeth pains' },
    { label: '💊 Can I take Azithromycin?', query: 'can i take azithromycin on my own?' },
    { label: '💎 Laser Whitening ($350)', query: 'How much is your laser whitening package?' },
    { label: '🗓️ Book Friday 3 PM', query: 'I would like to book an appointment this Friday at 3:00 PM. My name is Sophia Martinez.' },
  ];

  const streamReply = (fullReply: string, intent: string, confidence: number) => {
    const msgId = `gem-${Date.now()}`;
    const words = fullReply.split(' ');
    let currentText = '';
    let wordIndex = 0;

    // Add empty message placeholder
    setMessages((prev) => [
      ...prev,
      {
        id: msgId,
        sender: 'gemini',
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent,
        confidence,
      },
    ]);

    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += (wordIndex > 0 ? ' ' : '') + words[wordIndex];
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, text: currentText } : m))
        );
        wordIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 28); // 28ms word streaming speed for human typing feel
  };

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

    // Generate rich Human-Grade Gemini Response
    setTimeout(() => {
      const humanResponse = GeminiHumanEngine.generateResponse(
        textToSend,
        messages.map((m) => ({ sender: m.sender, text: m.text }))
      );

      streamReply(humanResponse.reply, humanResponse.intent, humanResponse.confidence);
    }, 400);
  };

  const services = [
    {
      title: 'Emergency Tooth Pain Relief & Exam',
      price: '$95 (Priority Slot)',
      duration: 'Immediate Today',
      description: 'Instant diagnosis, digital 3D scans, and emergency pain relief with Dr. Sarah Jensen.',
      tag: 'Urgent Care',
      prompt: 'I have tooth pain and need an emergency exam today with Dr. Jensen.',
    },
    {
      title: 'Cosmetic Laser Teeth Whitening',
      price: '$350',
      duration: '45 mins',
      description: 'Up to 8 shades brighter in one single visit with gentle remineralizing care.',
      tag: 'Most Popular',
      prompt: 'How much is your $350 Laser Teeth Whitening package?',
    },
    {
      title: 'Comprehensive Oral Exam & Deep Clean',
      price: '$180',
      duration: '60 mins',
      description: 'Full 3D digital imaging, periodontal screening, and ultrasonic gentle hygiene clean.',
      tag: 'Essential Health',
      prompt: 'I want to schedule a Comprehensive Exam and Deep Clean.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Top Floating Glass Navigation */}
      <header className="sticky top-0 z-40 w-full px-6 py-4 backdrop-blur-2xl bg-slate-950/70 border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">{businessProfile.name}</h1>
              <p className="text-[10px] text-blue-400 font-semibold flex items-center gap-1">
                <Stethoscope className="w-3 h-3" /> Dr. Sarah Jensen, DDS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSignUp}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-95 border border-white/15"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Patient Sign Up</span>
            </button>

            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-95 hidden sm:flex"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Admin Portal</span>
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section with Doctor Photo */}
      <section className="relative pt-12 pb-16 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-cyan-500/20 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              <span>Dr. Sarah Jensen, DDS • 24/7 AI-Powered Dental Care</span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Gentle, Modern Dentistry with{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                Zero Waiting Time
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
              Experience pain-free cosmetic & restorative dental treatments in New York. Ask questions, check pricing, and get same-day appointment slots via our <strong>Google Gemini Flash</strong> assistant.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
              <button
                onClick={onOpenSignUp}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register as New Patient</span>
              </button>

              <button
                onClick={() => handleSendMessage('my teeth pains')}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Stethoscope className="w-4 h-4 text-rose-400" />
                <span>Having Tooth Pain? Click for Instant Help</span>
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-4 justify-center lg:justify-start text-xs text-slate-400 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold text-white">4.9 / 5.0</span>
                <span className="text-slate-400">(450+ Patient Reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-slate-300">ADA Certified</span>
              </div>
            </div>
          </div>

          {/* Right Doctor Portrait Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm">
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 rounded-3xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500" />
              <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-white/20 shadow-2xl">
                <img
                  src="/images/dentist_doctor.jpg"
                  alt="Dr. Sarah Jensen, DDS"
                  className="w-full h-96 object-cover object-top hover:scale-105 transition duration-700"
                />
                <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                  <h4 className="text-lg font-bold text-white">Dr. Sarah Jensen, DDS</h4>
                  <p className="text-xs text-blue-400 font-medium">Lead Cosmetic & General Dentist</p>
                  <p className="text-[11px] text-slate-300 mt-1">15+ Years Specializing in Pain-Free Laser Dentistry & Aesthetic Smile Makeovers.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive 24/7 AI Patient Receptionist Chat Box */}
      <section className="max-w-5xl mx-auto px-6 pb-20 relative z-20">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Bot className="w-3.5 h-3.5" />
            <span>24/7 AI Patient Receptionist</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Book Appointments & Get Immediate Dental Answers</h3>
          <p className="text-xs text-slate-400">Ask any question about treatment, pricing, or emergency pain relief below.</p>
        </div>

        <GlassCard className="p-0 border-white/15 shadow-2xl overflow-hidden backdrop-blur-3xl bg-slate-900/80 rounded-3xl max-w-4xl mx-auto">
          
          {/* Chat Window Header */}
          <div className="p-4 border-b border-white/10 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/images/dentist_doctor.jpg"
                  alt="Dr. Sarah Jensen"
                  className="w-9 h-9 rounded-full object-cover border-2 border-blue-400"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Dr. Sarah's Clinic Receptionist</span>
                  <span className="text-[10px] text-emerald-400 font-normal">• Online Now</span>
                </h4>
                <p className="text-[10px] text-slate-400">Instant Appointment Booking & Triage</p>
              </div>
            </div>
            <Badge variant="success" dot size="sm">
              Instant Replies
            </Badge>
          </div>

          {/* Messages Feed */}
          <div className="p-5 space-y-4 max-h-[380px] min-h-[320px] overflow-y-auto">
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
                <span>Dr. Sarah's Assistant is preparing clinical recommendation...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Click Prompts */}
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

          {/* Input Submission */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-3 bg-slate-950/80 border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask a question or type 'my teeth pains'..."
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
      </section>

      {/* Modern Clinic Environment Showcase */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <GlassCard className="p-0 overflow-hidden rounded-3xl border-white/15 shadow-2xl grid grid-cols-1 md:grid-cols-12 items-center">
          <div className="md:col-span-6 p-8 space-y-4">
            <Badge variant="primary" size="sm">
              State-of-the-Art Clinic
            </Badge>
            <h4 className="text-2xl font-bold text-white">
              Relaxing, Spa-Like Dental Care in New York
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Equipped with high-definition digital 3D scanners, ultra-quiet laser instruments, and noise-canceling headphones to ensure every treatment is serene and pain-free.
            </p>
            <div className="pt-2 flex flex-col gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 450 Lexington Ave, Suite 800, New York
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Mon - Fri: 8 AM - 6 PM | Sat: 9 AM - 3 PM
              </span>
            </div>
          </div>
          <div className="md:col-span-6 h-full">
            <img
              src="/images/clinic_interior.jpg"
              alt="Apex Modern Dental Clinic"
              className="w-full h-full object-cover min-h-[260px]"
            />
          </div>
        </GlassCard>
      </section>

      {/* Services Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center space-y-2 mb-10">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Our Dental Services
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
                <span className="text-sm font-bold text-white">{svc.price}</span>
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
        <p>© 2026 {businessProfile.name} • Dr. Sarah Jensen, DDS. Powered by Google Gemini 3.7 & Supabase.</p>
      </footer>

    </div>
  );
};
