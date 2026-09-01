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
}

export const TestChatModal: React.FC<TestChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: "Hello! 👋 Welcome to Dr. Sarah Jensen's clinic. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
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

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.reply,
          confidence: res.confidence,
          tools: ['search_knowledge_base', 'check_calendar_availability'],
        },
      ]);
    }, 450);
  };

  const handleReset = () => {
    setMessages([
      {
        sender: 'ai',
        text: "Hello! 👋 Welcome to Dr. Sarah Jensen's clinic. How can I help you today?",
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col h-[580px]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Simulator & Context Inspector</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Testing multi-turn patient booking flow</p>
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
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-slate-950/30">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1 animate-fadeIn`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-black/5 dark:border-white/10 shadow-sm'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
              </div>

              {msg.sender === 'ai' && msg.confidence && (
                <div className="flex items-center gap-2 text-[10px] text-slate-400 pl-1">
                  <span>Confidence: {(msg.confidence * 100).toFixed(0)}%</span>
                  {msg.tools && (
                    <span className="text-blue-500 font-mono">[{msg.tools.join(', ')}]</span>
                  )}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2.5 rounded-2xl bg-white dark:bg-slate-800 w-fit border border-black/5 dark:border-white/10 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-spin" />
              <span>AI is thinking...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 border-t border-black/5 dark:border-white/10 bg-white dark:bg-slate-900 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type as a patient (e.g., 'How much are implants?', then 'yes')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-black/5 dark:border-white/10 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
