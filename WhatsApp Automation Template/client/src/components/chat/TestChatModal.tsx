import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw,
  Calendar,
  Phone,
  Flame
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { GeminiHumanEngine } from '../../services/geminiHumanEngine';

interface TestChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  confidence?: number;
  tools?: string[];
  bookingDetails?: {
    patientName: string;
    treatment: string;
    slot: string;
    fee: string;
  };
}

export const TestChatModal: React.FC<TestChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: "Hello! 👋 Welcome to Dr. Sarah Jensen's clinic. How can I help you with your smile or dental care today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSendText = (userText: string) => {
    if (!userText.trim()) return;

    const historyPayload = messages.map((m) => ({
      sender: (m.sender === 'ai' ? 'gemini' : 'user') as 'gemini' | 'user',
      text: m.text,
    }));

    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const res = GeminiHumanEngine.generateResponse(userText, historyPayload);

      // Check if booking was confirmed
      let bookingDetails: { patientName: string; treatment: string; slot: string; fee: string; } | undefined = undefined;
      if (res.isBooked && res.bookedDetails) {
        bookingDetails = {
          patientName: res.bookedDetails.patientName || 'Patient',
          treatment: res.bookedDetails.treatment || 'Dental Consultation',
          slot: res.bookedDetails.slot || 'Tomorrow 10:30 AM',
          fee: res.bookedDetails.fee || '£95',
        };

        // Dispatch live event to update Dashboard in real time
        window.dispatchEvent(
          new CustomEvent('new_appointment_booked', {
            detail: bookingDetails,
          })
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.reply,
          confidence: res.confidence,
          tools: ['search_knowledge_base', 'check_calendar_availability', 'sync_google_calendar'],
          bookingDetails,
        },
      ]);
    }, 400);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendText(input);
  };

  const handleReset = () => {
    setMessages([
      {
        sender: 'ai',
        text: "Hello! 👋 Welcome to Dr. Sarah Jensen's clinic. How can I help you with your smile or dental care today?",
      },
    ]);
  };

  const goldenScenarios = [
    { label: '🚨 Tooth Pain Urgent', prompt: 'I have severe pain in my lower left tooth since yesterday, can I come in today?' },
    { label: '✨ Whitening £395', prompt: 'How much is laser teeth whitening and how long does it take?' },
    { label: '🦷 Implants £2,800', prompt: 'I need dental implants for two missing back teeth. What is the starting price?' },
    { label: '📅 Book Exam & Scan', prompt: 'I want to book a routine examination and 3D scan for next Monday morning please. My name is David Miller.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col h-[620px]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Golden Booking Loop Simulator</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Testing Multi-Turn WhatsApp Dialogue & Calendar Sync</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Reset Conversation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1-Click Golden Scenario Quick Prompts */}
        <div className="p-2.5 bg-slate-100/80 dark:bg-slate-950/80 border-b border-black/5 dark:border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
          {goldenScenarios.map((sc, i) => (
            <button
              key={i}
              onClick={() => handleSendText(sc.prompt)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-blue-500/50 transition-all shrink-0 active:scale-95 shadow-xs"
            >
              {sc.label}
            </button>
          ))}
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/50 font-sans">
          {messages.map((m, idx) => {
            const isAI = m.sender === 'ai';
            return (
              <div key={idx} className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}>
                {isAI && (
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className="max-w-[82%] space-y-1.5">
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isAI
                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-black/5 dark:border-white/5 shadow-xs'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>

                  {/* Confirmed Booking Event Badge */}
                  {m.bookingDetails && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 space-y-1 text-[11px]">
                      <div className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Appointment Confirmed & Synced to Calendar</span>
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                        👤 {m.bookingDetails.patientName} • {m.bookingDetails.treatment} ({m.bookingDetails.fee}) • 📅 {m.bookingDetails.slot}
                      </div>
                    </div>
                  )}

                  {isAI && m.confidence && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="font-mono text-emerald-500">{(m.confidence * 100).toFixed(0)}% confidence</span>
                      <span>•</span>
                      <span>{m.tools?.join(', ')}</span>
                    </div>
                  )}
                </div>

                {!isAI && (
                  <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-2.5 items-center text-xs text-slate-400 font-sans pl-1">
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span>Checking calendar availability & fee schedule...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-black/5 dark:border-white/10 bg-white dark:bg-slate-950 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a patient inquiry (e.g. '10:30 AM works. My name is David.')..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-black/5 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs transition-all active:scale-95 shadow-md shadow-blue-600/20"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};
