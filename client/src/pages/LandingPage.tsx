import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Calendar as CalendarIcon, 
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
  Heart,
  CalendarCheck,
  Check
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { BusinessProfile } from '../types/admin.types';
import { GeminiHumanEngine } from '../services/geminiHumanEngine';

interface LandingPageProps {
  businessProfile: BusinessProfile;
  onOpenAdmin: () => void;
  onOpenSignUp: () => void;
  onOpenSlotPicker: (initialService?: string) => void;
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
  onOpenSlotPicker,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'gemini',
      text: `Hello and welcome to ${businessProfile.name}! 😊 I'm Dr. Sarah Jensen's 24/7 AI Patient Receptionist. How can I help you today? If you're experiencing tooth pain, need pricing, or want to reserve an appointment slot, just ask!`,
      timestamp: 'Just now',
      intent: 'greeting',
      confidence: 0.99,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeFeeTab, setActiveFeeTab] = useState<'aesthetic' | 'general'>('aesthetic');
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const quickPrompts = [
    { label: '🚨 Tooth pain relief (£95)', query: 'my teeth pains' },
    { label: '💎 Teeth Whitening (£395)', query: 'How much is your professional teeth whitening package?' },
    { label: '✨ Emax Veneers (£850)', query: 'How much are Emax veneers per tooth?' },
    { label: '🦷 Implants (From £2,800)', query: 'How much are dental implants per tooth?' },
    { label: '🗓️ Book Friday 3 PM', query: 'I would like to book an appointment this Friday at 3:00 PM. My name is Sophia Martinez.' },
  ];

  const streamReply = (fullReply: string, intent: string, confidence: number) => {
    const msgId = `gem-${Date.now()}`;
    const words = fullReply.split(' ');
    let currentText = '';
    let wordIndex = 0;

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
    }, 28);
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
      description: 'Gentle 3D digital diagnosis, nerve soothing, and emergency pain relief with Dr. Sarah Jensen.',
      tag: 'Urgent Care',
    },
    {
      title: 'Cosmetic Laser Teeth Whitening',
      price: '$350',
      duration: '45 mins',
      description: 'Up to 8 shades brighter in one single visit with zero tooth sensitivity and take-home remineralizing kit.',
      tag: 'Most Popular',
    },
    {
      title: 'Comprehensive Oral Exam & Deep Clean',
      price: '$180',
      duration: '60 mins',
      description: 'Complete 3D digital imaging, periodontal screening, and ultrasonic gentle hygiene clean.',
      tag: 'Essential Health',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Top Floating Header */}
      <header className="sticky top-0 z-40 w-full px-6 py-4 backdrop-blur-2xl bg-slate-950/75 border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">{businessProfile.name}</h1>
              <p className="text-[10px] text-blue-400 font-semibold flex items-center gap-1">
                <Stethoscope className="w-3 h-3" /> Dr. Sarah Jensen, DDS • Harvard Dental Alum
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenSlotPicker()}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 border border-white/15"
            >
              <CalendarCheck className="w-4 h-4 text-cyan-300" />
              <span>Book Slot Now</span>
            </button>

            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-95 hidden sm:flex"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Doctor Portal</span>
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-cyan-500/20 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              <span>Dr. Sarah Jensen, DDS • Harvard Trained • 15+ Yrs Experience</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Gentle, Modern Dentistry with{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                Instant Online Booking
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Experience pain-free cosmetic & restorative dental treatments in Manhattan. Check live openings, get immediate triage, and reserve your priority appointment slot online 24/7.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
              <button
                onClick={() => onOpenSlotPicker()}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-xs shadow-xl shadow-blue-500/35 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <CalendarCheck className="w-4 h-4 text-cyan-200" />
                <span>Book Slot Now (Select Date & Time)</span>
              </button>

              <button
                onClick={() => handleSendMessage('my teeth pains')}
                className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Stethoscope className="w-4 h-4 text-rose-400" />
                <span>Having Tooth Pain? Instant Triage</span>
              </button>
            </div>

            {/* Credibility & Reviews */}
            <div className="flex items-center gap-6 pt-4 justify-center lg:justify-start text-xs text-slate-400 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold text-white">4.9 / 5.0</span>
                <span className="text-slate-400">(450+ Verified Reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-slate-300">ADA & AACD Certified</span>
              </div>
            </div>
          </div>

          {/* Right Doctor Images Showcase */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Main Treatment Photo */}
            <div className="relative group rounded-3xl overflow-hidden bg-slate-900 border border-white/20 shadow-2xl">
              <img
                src="/images/dentist_procedure.jpg"
                alt="Dr. Sarah Jensen treating patient"
                className="w-full h-56 sm:h-64 object-cover object-center group-hover:scale-105 transition duration-700"
              />
              <div className="p-4 bg-slate-900/90 border-t border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Gentle 3D Laser Care</span>
                    <Badge variant="success" size="sm">Pain-Free</Badge>
                  </h4>
                  <p className="text-[10px] text-slate-400">Digital scans with micro-anesthesia</p>
                </div>
                <button
                  onClick={() => onOpenSlotPicker()}
                  className="text-xs font-bold text-blue-400 hover:underline"
                >
                  Book Slot ➔
                </button>
              </div>
            </div>

            {/* Doctor Portrait Bar */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <img
                src="/images/dentist_doctor.jpg"
                alt="Dr. Sarah Jensen"
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-400"
              />
              <div className="flex-1">
                <h5 className="text-xs font-bold text-white">Dr. Sarah Jensen, DDS</h5>
                <p className="text-[10px] text-blue-300">Harvard Dental • 15+ Years Clinical Practice</p>
              </div>
              <Badge variant="primary" size="sm">Accepting Patients</Badge>
            </div>

          </div>

        </div>
      </section>

      {/* Interactive 24/7 AI Receptionist Box */}
      <section className="max-w-5xl mx-auto px-6 pb-20 relative z-20">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Bot className="w-3.5 h-3.5" />
            <span>24/7 AI Patient Receptionist</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Ask Questions or Triage Symptoms Instantly</h3>
          <p className="text-xs text-slate-400">Have tooth pain, need pricing, or want appointment recommendations? Chat below.</p>
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
                <p className="text-[10px] text-slate-400">Instant Dental Triage & Booking</p>
              </div>
            </div>

            <button
              onClick={() => onOpenSlotPicker()}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              Book Slot
            </button>
          </div>

          {/* Messages Feed */}
          <div ref={messagesContainerRef} className="p-5 space-y-4 max-h-[360px] min-h-[300px] overflow-y-auto">
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
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>

                  <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="text-[9px] text-slate-500">{m.timestamp}</span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-3 rounded-2xl bg-slate-800/50 border border-white/5 w-fit animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                <span>Dr. Sarah's Assistant is typing recommendation...</span>
              </div>
            )}
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
              placeholder="Ask anything or describe symptoms..."
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

      {/* Exact Match: DENTAL FEES Section from Screenshot */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="relative p-8 md:p-12 rounded-3xl bg-[#b8b3a7]/20 dark:bg-slate-900/60 border border-white/10 overflow-hidden">
          
          {/* Background Watermark FEES text */}
          <div className="absolute -bottom-8 -left-4 text-[120px] sm:text-[180px] font-black text-white/[0.04] dark:text-white/[0.02] select-none pointer-events-none tracking-tighter uppercase font-sans">
            FEES
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
            
            {/* Left Column: Heading, Subtitle & Get in Touch Button */}
            <div className="lg:col-span-4 space-y-6">
              <div className="space-y-2">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
                  DENTAL FEES
                </h3>
                <p className="text-sm text-slate-300 dark:text-slate-400">
                  Have more questions? Don't hesitate to get in touch.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onOpenSlotPicker()}
                className="px-6 py-3 rounded-md bg-[#2b2824] hover:bg-[#3d3934] text-white font-semibold text-xs tracking-wider transition-all shadow-md active:scale-95 border border-white/10"
              >
                Get in Touch
              </button>
            </div>

            {/* Right Column: High-End White Accordion Card */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Accordion 01: Aesthetic dentistry */}
              <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 sm:p-8 shadow-xl border border-black/5 dark:border-white/10 space-y-6">
                
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => setActiveFeeTab(activeFeeTab === 'aesthetic' ? 'general' : 'aesthetic')}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">01</span>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Aesthetic dentistry
                    </h4>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeFeeTab === 'aesthetic' ? 'rotate-90' : ''}`} />
                </button>

                {/* Table Header & Rows */}
                {activeFeeTab === 'aesthetic' && (
                  <div className="pt-2 divide-y divide-slate-100 dark:divide-slate-800 animate-fadeIn">
                    
                    {/* Header Row */}
                    <div className="flex items-center justify-between pb-3 text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                      <span>Treatment</span>
                      <span>Price</span>
                    </div>

                    {/* Row 1: Teeth whitening */}
                    <div 
                      className="py-4 flex items-start justify-between gap-4 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 px-2 rounded-xl transition-colors"
                      onClick={() => onOpenSlotPicker('Teeth whitening (£395)')}
                    >
                      <div className="space-y-1 max-w-md">
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white underline decoration-slate-300 underline-offset-4 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          Teeth whitening
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          Guaranteed whitening results with professional products which last long term
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono">£395</span>
                      </div>
                    </div>

                    {/* Row 2: Composite fillings */}
                    <div 
                      className="py-4 flex items-start justify-between gap-4 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 px-2 rounded-xl transition-colors"
                      onClick={() => onOpenSlotPicker('Composite fillings (From £225 per tooth)')}
                    >
                      <div className="space-y-1 max-w-md">
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white underline decoration-slate-300 underline-offset-4 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          Composite fillings
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          Replace old amalgam fillings with white fillings which blend seamlessly into your smile
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">FROM</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono">£225</span>
                        <span className="text-[10px] text-slate-400 block">per tooth</span>
                      </div>
                    </div>

                    {/* Row 3: Emax veneers */}
                    <div 
                      className="py-4 flex items-start justify-between gap-4 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 px-2 rounded-xl transition-colors"
                      onClick={() => onOpenSlotPicker('Emax veneers (£850 per tooth)')}
                    >
                      <div className="space-y-1 max-w-md">
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white underline decoration-slate-300 underline-offset-4 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          Emax veneers
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          High quality E-max veneers for long lasting, high strength, highly aesthetic results
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono">£850</span>
                        <span className="text-[10px] text-slate-400 block">per tooth</span>
                      </div>
                    </div>

                    {/* Row 4: Bespoke bonding */}
                    <div 
                      className="py-4 flex items-start justify-between gap-4 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 px-2 rounded-xl transition-colors"
                      onClick={() => onOpenSlotPicker('Bespoke bonding (£395 per tooth)')}
                    >
                      <div className="space-y-1 max-w-md">
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white underline decoration-slate-300 underline-offset-4 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          Bespoke bonding
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          High quality composite bonding designed using AI software to deliver predictable results
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono">£395</span>
                        <span className="text-[10px] text-slate-400 block">per tooth</span>
                      </div>
                    </div>

                    {/* Row 5: Implants */}
                    <div 
                      className="py-4 flex items-start justify-between gap-4 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 px-2 rounded-xl transition-colors"
                      onClick={() => onOpenSlotPicker('Implants (From £2800 per tooth)')}
                    >
                      <div className="space-y-1 max-w-md">
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white underline decoration-slate-300 underline-offset-4 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          Implants
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          A long-lasting solution to replace missing teeth and restore your smile with confidence
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">FROM</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono">£2800</span>
                        <span className="text-[10px] text-slate-400 block">per tooth</span>
                      </div>
                    </div>

                    {/* Row 6: Clear aligners */}
                    <div 
                      className="py-4 flex items-start justify-between gap-4 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 px-2 rounded-xl transition-colors"
                      onClick={() => onOpenSlotPicker('Clear aligners (From £3100)')}
                    >
                      <div className="space-y-1 max-w-md">
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white underline decoration-slate-300 underline-offset-4 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          Clear aligners
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          A discrete, comfortable way to straighten your teeth without the price tag of Invisalign
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">FROM</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono">£3100</span>
                      </div>
                    </div>

                  </div>
                )}

              </div>

              {/* Accordion 02: General dentistry */}
              <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 sm:p-8 shadow-xl border border-black/5 dark:border-white/10 space-y-4">
                <button
                  type="button"
                  onClick={() => setActiveFeeTab(activeFeeTab === 'general' ? 'aesthetic' : 'general')}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">02</span>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      General dentistry
                    </h4>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeFeeTab === 'general' ? 'rotate-90' : ''}`} />
                </button>

                {activeFeeTab === 'general' && (
                  <div className="pt-2 divide-y divide-slate-100 dark:divide-slate-800 animate-fadeIn">
                    <div className="flex items-center justify-between pb-3 text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                      <span>Treatment</span>
                      <span>Price</span>
                    </div>

                    <div 
                      className="py-4 flex items-start justify-between gap-4 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 px-2 rounded-xl transition-colors"
                      onClick={() => onOpenSlotPicker('Routine Dental Examination & 3D Scan (£95)')}
                    >
                      <div className="space-y-1 max-w-md">
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white underline decoration-slate-300 underline-offset-4 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          Routine Dental Examination & 3D Scan
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Full oral check, digital imaging, and clinical assessment
                        </p>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono">£95</span>
                    </div>

                    <div 
                      className="py-4 flex items-start justify-between gap-4 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 px-2 rounded-xl transition-colors"
                      onClick={() => onOpenSlotPicker('Hygiene & Airflow Deep Clean (£120)')}
                    >
                      <div className="space-y-1 max-w-md">
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white underline decoration-slate-300 underline-offset-4 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          Hygiene & Airflow Deep Clean
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Gentle ultrasonic stain removal and deep plaque polish
                        </p>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono">£120</span>
                    </div>

                    <div 
                      className="py-4 flex items-start justify-between gap-4 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 px-2 rounded-xl transition-colors"
                      onClick={() => onOpenSlotPicker('Emergency Same-Day Pain Relief (£95)')}
                    >
                      <div className="space-y-1 max-w-md">
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white underline decoration-slate-300 underline-offset-4 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          Emergency Same-Day Pain Relief
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Priority diagnosis, nerve soothing, and acute pain treatment
                        </p>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono">£95</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Modern Clinic Environment Showcase */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <GlassCard className="p-0 overflow-hidden rounded-3xl border-white/15 shadow-2xl grid grid-cols-1 md:grid-cols-12 items-center">
          <div className="md:col-span-6 p-8 space-y-4">
            <Badge variant="primary" size="sm">
              State-of-the-Art Clinic
            </Badge>
            <h4 className="text-2xl font-bold text-white">
              Relaxing, Spa-Like Dental Care in Manhattan
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

            <div className="pt-2">
              <button
                onClick={() => onOpenSlotPicker()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all"
              >
                Schedule Consultation
              </button>
            </div>
          </div>
          <div className="md:col-span-6 h-full">
            <img
              src="/images/clinic_interior.jpg"
              alt="Apex Modern Dental Clinic"
              className="w-full h-full object-cover min-h-[280px]"
            />
          </div>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 {businessProfile.name} • Dr. Sarah Jensen, DDS. All rights reserved.</p>
      </footer>

    </div>
  );
};
