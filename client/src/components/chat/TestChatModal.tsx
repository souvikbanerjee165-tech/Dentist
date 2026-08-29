import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';

interface TestChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  confidence?: number;
  tools?: string[];
}

export const TestChatModal: React.FC<TestChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Hello! 👋 Welcome to Apex Care Clinic. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const lower = userText.toLowerCase();

      if (lower.includes('price') || lower.includes('cost') || lower.includes('whitening') || lower.includes('fee')) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: 'Our Laser Whitening & Deep Clean package is $350. It includes the 45-min in-office laser treatment plus a take-home maintenance kit! Would you like to check openings for this Friday or Saturday?',
            confidence: 0.96,
            tools: ['search_knowledge_base'],
          },
        ]);
      } else if (lower.includes('book') || lower.includes('friday') || lower.includes('appointment') || lower.includes('slot')) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: 'Great! I see an open slot this Friday at 3:00 PM with Dr. Reynolds. Could you please share your full name and email address so I can confirm the reservation for you?',
            confidence: 0.98,
            tools: ['check_calendar_availability'],
          },
        ]);
      } else if (lower.includes('surgery') || lower.includes('emergency') || lower.includes('severe') || lower.includes('pain')) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: 'Because this involves acute dental symptoms, I am immediately connecting you with Dr. Reynolds and our emergency triage team. Someone will message you on WhatsApp within 5 minutes.',
            confidence: 0.48,
            tools: ['request_human_handover'],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: 'Thanks for reaching out! We offer preventative cleanings, cosmetic dentistry, and dental implants. Would you like to know our service pricing or schedule an initial consultation?',
            confidence: 0.92,
            tools: ['search_knowledge_base'],
          },
        ]);
      }
    }, 800);
  };

  const handleReset = () => {
    setMessages([
      {
        sender: 'ai',
        text: 'Hello! 👋 Welcome to Apex Care Clinic. How can I help you today?',
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col h-[580px]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Live WhatsApp AI Simulator
              </h3>
              <p className="text-[11px] text-slate-400">
                Test prompts, RAG retrieval & calendar triggers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              title="Reset test session"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-100/50 dark:bg-slate-950/40">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`
                  max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm
                  ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-sm'
                  }
                `}
              >
                <p>{msg.text}</p>

                {msg.confidence !== undefined && (
                  <div className="mt-2 pt-1.5 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      Confidence: {Math.round(msg.confidence * 100)}%
                    </span>
                    {msg.tools && (
                      <span className="font-mono text-blue-500">
                        [{msg.tools.join(', ')}]
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-slate-400 text-xs p-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-150" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-300" />
              <span className="text-[11px] ml-1">AI Assistant typing...</span>
            </div>
          )}
        </div>

        {/* Quick Test Prompt Chips */}
        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/80 border-t border-black/5 dark:border-white/5 flex gap-1.5 overflow-x-auto text-[10px]">
          {[
            'How much is teeth whitening?',
            'Book for Friday 3 PM',
            'I have severe tooth pain and bleeding',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => setInput(prompt)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500 shrink-0 transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white dark:bg-slate-900 border-t border-black/5 dark:border-white/10 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type a test customer message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button
            type="submit"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-1 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};
