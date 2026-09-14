import React, { useState } from 'react';
import { 
  Smartphone, 
  Bot, 
  Calendar, 
  Bell, 
  CheckCircle2, 
  Save,
  Power,
  Sliders,
  Building2,
  Lock,
  ShieldCheck,
  Radio,
  MessageSquare
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { BusinessProfile } from '../types/admin.types';

interface SettingsPageProps {
  businessProfile: BusinessProfile;
  onUpdateProfile: (updated: BusinessProfile) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  businessProfile,
  onUpdateProfile,
}) => {
  const [profile, setProfile] = useState<BusinessProfile>(businessProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleGlobalAI = () => {
    const updated = {
      ...profile,
      aiAutopilotEnabled: !profile.aiAutopilotEnabled,
    };
    setProfile(updated);
    onUpdateProfile(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-fadeIn max-w-4xl">
      
      {/* Top Header with Global AI Master Switch & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Admin & Business Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control global AI autopilot, manage WhatsApp API keys, and update company details.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Global AI Autopilot Master Button */}
          <button
            type="button"
            onClick={handleToggleGlobalAI}
            className={`
              flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 shadow-sm active:scale-95 border
              ${
                profile.aiAutopilotEnabled
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
              }
            `}
          >
            <Power className="w-3.5 h-3.5" />
            <span>AI Autopilot: {profile.aiAutopilotEnabled ? 'ENABLED' : 'PAUSED'}</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl shadow-lg shadow-blue-500/25 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save All</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings successfully synchronized across all AI channels!</span>
        </div>
      )}

      {/* 1. Business Profile Information */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Business Profile & Identity
            </h3>
            <p className="text-xs text-slate-400">
              Information referenced by AI when welcoming customers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Business Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Industry Category
            </label>
            <select
              value={profile.industry}
              onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <option value="Medical & Dental Clinic">Doctor / Dental Clinic</option>
              <option value="Real Estate Brokerage">Real Estate Agency</option>
              <option value="Fitness & Personal Training Gym">Gym / Fitness Center</option>
              <option value="Growth Marketing & Design Agency">Marketing / Design Agency</option>
              <option value="Executive Coaching Practice">Executive Coach / Consultant</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* 2. Swappable AI Engine & LLM Provider Configuration */}
      <GlassCard className="p-6 space-y-4 border-indigo-500/20 bg-indigo-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Swappable AI Brain & LLM Provider Architecture
              </h3>
              <p className="text-xs text-slate-400">
                Provider-agnostic interface. Switch between Gemini (Validation) and OpenAI (Enterprise).
              </p>
            </div>
          </div>

          <Badge variant="purple" size="sm">
            Strategy Pattern
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          
          {/* Provider 1: Gemini (Active Default) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/50 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Google Gemini 3.7 / 2.5 Flash</h4>
              </div>
              <Badge variant="success" size="sm">Active Default</Badge>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Fast, cost-optimized, and responsive. Ideal for rapid iteration without recurring OpenAI token spend.
            </p>
            <div className="pt-2 text-[10px] text-emerald-500 font-mono">
              Status: Live & Connected (Zero Spend)
            </div>
          </div>

          {/* Provider 2: OpenAI GPT-4o (Plug-and-Play Option) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">OpenAI GPT-4o / Mini</h4>
              </div>
              <Badge variant="neutral" size="sm">Plug & Play Ready</Badge>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Implemented via <code>OpenAILLMProvider</code>. Activate by setting <code>LLM_PROVIDER=openai</code> before onboarding clients.
            </p>
            <div className="pt-2 text-[10px] text-slate-400 font-mono">
              Status: Interface Ready • Instant Failover
            </div>
          </div>

        </div>
      </GlassCard>

      {/* 2. AI Autopilot & System Prompt Configuration */}
      <GlassCard className="p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI Sales Persona & System Prompt
            </h3>
            <p className="text-xs text-slate-400">
              Define the tone, appointment instructions, and escalation rules.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Tone of Voice
            </label>
            <select
              value={profile.toneOfVoice}
              onChange={(e) => setProfile({ ...profile, toneOfVoice: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <option value="Warm & Professional">Warm & Professional (Medical / Coaching)</option>
              <option value="Exclusive & Luxury">Exclusive & Luxury (High-End Real Estate)</option>
              <option value="Energetic & Motivating">Energetic & Motivating (Gym / Fitness)</option>
              <option value="Direct & Analytical">Direct & Analytical (B2B SaaS / Agency)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Handover Confidence Threshold
              </label>
              <span className="font-mono font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                {profile.confidenceThreshold}%
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="95"
              value={profile.confidenceThreshold}
              onChange={(e) =>
                setProfile({ ...profile, confidenceThreshold: Number(e.target.value) })
              }
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
            />
          </div>
        </div>

        {/* System Prompt */}
        <div className="space-y-1.5 pt-2 text-xs">
          <label className="font-semibold text-slate-700 dark:text-slate-300">
            System Instructions
          </label>
          <textarea
            rows={5}
            value={profile.systemPrompt}
            onChange={(e) => setProfile({ ...profile, systemPrompt: e.target.value })}
            className="w-full p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
      </GlassCard>

      {/* 3. Messaging Infrastructure: US & Canada First (SMS / RCS 10DLC) + WhatsApp International */}
      <GlassCard className="p-6 space-y-5 border-blue-500/20 bg-blue-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Primary Market Messaging Foundation (US & Canada)
              </h3>
              <p className="text-xs text-slate-400">
                A2P 10DLC cellular SMS & Rich Communication Services (RCS) with Telnyx Wholesale Direct Gateway.
              </p>
            </div>
          </div>

          <Badge variant="success" size="sm">
            10DLC Compliant
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Primary Channel: SMS / RCS (US & Canada Standard) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-blue-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Telnyx Wholesale SMS / RCS Engine
                </h4>
              </div>
              <Badge variant="primary" size="sm">Foundation (Default)</Badge>
            </div>
            
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Wholesale carrier rate routing (~$0.004/msg) directly to Verizon, AT&T, and T-Mobile. Supports interactive Google/Apple RCS action chips.
            </p>

            <div className="space-y-2 text-xs pt-1">
              <div>
                <label className="text-[10px] font-semibold text-slate-400">Telnyx API Profile</label>
                <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-emerald-400">
                  Ready (Simulator / Live Plug-and-Play)
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> TCPA / HIPAA Opt-In:
                </span>
                <span className="font-bold text-emerald-400">Enforced & Audited</span>
              </div>
            </div>
          </div>

          {/* Secondary Channel: WhatsApp Cloud API (International / Non-US) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  WhatsApp Cloud API
                </h4>
              </div>
              <Badge variant="neutral" size="sm">Secondary / Global</Badge>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Retained as an optional secondary channel for international patients or users outside North America.
            </p>

            <div className="space-y-1.5 text-xs pt-1">
              <label className="text-[10px] font-semibold text-slate-400">Meta Phone Number ID</label>
              <input
                type="text"
                value={profile.phoneNumberId}
                onChange={(e) => setProfile({ ...profile, phoneNumberId: e.target.value })}
                placeholder="e.g. 104829104829104"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs"
              />
            </div>
          </div>

        </div>
      </GlassCard>

      {/* 4. Owner Notifications & Escalation */}
      <GlassCard className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            Clinic Owner & Reception Desk Instant Alerts
          </h4>
        </div>
        <p className="text-xs text-slate-400">
          Where urgent patient escalations, missed calls, and new bookings get routed.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          <div className="space-y-1">
            <label className="text-slate-400 text-[10px] font-semibold">Doctor / Reception Mobile Phone (SMS / WhatsApp)</label>
            <input
              type="text"
              placeholder="+1 (555) 345-6789"
              value={profile.ownerNotificationPhone}
              onChange={(e) => setProfile({ ...profile, ownerNotificationPhone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 text-[10px] font-semibold">Clinic Alert Email</label>
            <input
              type="email"
              placeholder="frontdesk@apexdental.com"
              value={profile.ownerNotificationEmail}
              onChange={(e) => setProfile({ ...profile, ownerNotificationEmail: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </GlassCard>

    </form>
  );
};
