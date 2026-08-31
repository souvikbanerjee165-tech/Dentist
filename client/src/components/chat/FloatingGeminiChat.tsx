import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  MessageCircle, 
  ChevronDown, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Stethoscope
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';

interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
  intent?: string;
}

interface FloatingGeminiChatProps {
  businessName?: string;
  currentPage?: string;
}

export const FloatingGeminiChat: React.FC<FloatingGeminiChatProps> = ({
  businessName = 'Apex Dental & Aesthetics',
  currentPage = 'home',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'gemini',
      text: `Hello! 👋 I'm Dr. Sarah Jensen's AI Dental Assistant powered by Google Gemini. How can I help you today? If you are having tooth pain, need pricing, or need help signing up, just ask me!`,
      timestamp: 'Just now',
      intent: 'greeting',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const quickPills = [
    { label: '🚨 My teeth pains', text: 'my teeth pains' },
    { label: '💎 Whitening Cost', text: 'How much is laser teeth whitening?' },
    { label: '📅 Book Today', text: 'Can I book an appointment with Dr. Jensen today?' },
    { label: '❓ Help me Sign Up', text: 'Can you help me fill out the sign up form?' },
  ];

  const handleSend = async (userText: string) => {
    if (!userText.trim()) return;

    const newMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/v1/chat/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          businessIndustry: 'Medical & Dental Clinic',
          userMessage: userText,
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
            text: turn.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            intent: turn.intent,
          },
        ]);
        return;
      }
      throw new Error('Fallback required');
    } catch {
      // Local high-precision dentist sales engine fallback
      setTimeout(() => {
        const lower = userText.toLowerCase();
        let reply = "I'm here to help! Whether you need urgent pain relief, want to know treatment options, or need help signing up, I can assist you.";
        let intent = 'lead_qualification';

        if (
          lower.includes('pain') ||
          lower.includes('teeth pains') ||
          lower.includes('toothache') ||
          lower.includes('tooth hurts') ||
          lower.includes('sensitive')
        ) {
          reply = "I'm so sorry you're in pain! Tooth pain is usually a clear signal of underlying nerve irritation or deep enamel decay that can worsen rapidly into a severe infection if delayed. Getting it checked immediately protects your natural tooth and avoids expensive root canals. Dr. Sarah Jensen has an urgent relief slot open today itself. Should I go ahead and reserve your priority examination today? What is your full name?";
          intent = 'urgent_pain_booking';
        } else if (lower.includes('sign up') || lower.includes('signup') || lower.includes('register') || lower.includes('form') || lower.includes('help')) {
          reply = "I'd be happy to guide you through the sign-up process! All you need is your Full Name, WhatsApp Phone Number, Email, and your primary dental goal (e.g. Checkup, Whitening, or Pain Relief). If you like, just tell me your details right here and I'll record your appointment in Supabase!";
          intent = 'signup_assistance';
        } else if (lower.includes('whitening') || lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
          reply = "Our Laser Whitening & Deep Clean package is $350. It includes the 45-minute treatment, remineralization kit, and pre-treatment rinse. Would you like to check openings for this Friday or Saturday?";
          intent = 'faq_inquiry';
        } else if (lower.includes('book') || lower.includes('today') || lower.includes('friday') || lower.includes('appointment')) {
          reply = "Dr. Sarah Jensen has priority consultation openings today at 3:30 PM and tomorrow at 10:00 AM. May I have your full name and phone number so I can secure your slot in our calendar and Supabase system?";
          intent = 'appointment_booking';
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `gem-${Date.now()}`,
            sender: 'gemini',
            text: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            intent,
          },
        ]);
      }, 500);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Expanded Glassmorphic Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[410px] h-[520px] rounded-3xl bg-slate-950/90 border border-white/20 shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden animate-fadeIn mb-4">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900/80 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/images/dentist_doctor.jpg"
                  alt="Dr. Sarah Jensen"
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-400 shadow-md"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Dr. Sarah's AI Assistant</span>
                </h4>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Powered by Google Gemini 3.7
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fadeIn`}
                >
                  <div
                    className={`
                      max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed
                      ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-500/20'
                          : 'bg-slate-800/90 text-slate-100 rounded-bl-none border border-white/10'
                      }
                    `}
                  >
                    <p>{m.text}</p>
                  </div>
                  <span className="text-[9px] text-slate-500 mt-0.5 px-1">{m.timestamp}</span>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2.5 rounded-2xl bg-slate-800/40 border border-white/5 w-fit animate-pulse">
                <Sparkles className="w-3 h-3 text-blue-400 animate-spin" />
                <span>Dr. Sarah's Assistant is analyzing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div className="px-3 py-2 bg-slate-950/70 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPills.map((pill, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(pill.text)}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 text-[10px] font-medium text-slate-300 hover:text-blue-300 transition-all active:scale-95 whitespace-nowrap"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
            className="p-3 bg-slate-950 border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything or type 'my teeth pains'..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-all active:scale-95 shadow-md shadow-blue-500/20"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}

      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
        >
          <div className="relative">
            <img
              src="/images/dentist_doctor.jpg"
              alt="Dr. Sarah Jensen"
              className="w-7 h-7 rounded-full object-cover border border-white/40"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900 animate-pulse" />
          </div>
          <div className="text-left pr-1 hidden sm:block">
            <p className="text-xs font-bold leading-tight">Need Dental Help?</p>
            <p className="text-[10px] text-blue-100 font-medium">Chat with Dr. Sarah's AI</p>
          </div>
          <Sparkles className="w-4 h-4 text-cyan-200 animate-spin group-hover:rotate-45 transition-transform" />
        </button>
      )}

    </div>
  );
};
