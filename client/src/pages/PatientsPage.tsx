import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Search, 
  Filter, 
  Download, 
  Send, 
  UserX, 
  Bot, 
  Calendar, 
  Sparkles,
  Phone,
  Mail,
  ShieldAlert,
  Clock,
  ChevronRight,
  Car,
  Activity,
  Zap,
  CheckCircle2,
  PhoneCall,
  AlertTriangle,
  Volume2,
  BellRing
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Conversation, Lead, NavigationTab } from '../types';
import { ConversationsPage } from './ConversationsPage';
import { LeadsPage } from './LeadsPage';
import { notificationSoundService } from '../services/notification-sound.service';

interface PatientsPageProps {
  conversations: Conversation[];
  leads: Lead[];
  onToggleTakeover: (conversationId: string) => void;
  onSendMessage: (conversationId: string, text: string) => void;
  onSelectTab: (tab: NavigationTab) => void;
}

export const PatientsPage: React.FC<PatientsPageProps> = ({
  conversations,
  leads,
  onToggleTakeover,
  onSendMessage,
  onSelectTab,
}) => {
  const [activeView, setActiveView] = useState<'chats' | 'directory'>('chats');
  const [criticalAlerts, setCriticalAlerts] = useState<any[]>([]);
  const [waitlistCount, setWaitlistCount] = useState<number>(3);
  const [isBroadcastingBackfill, setIsBroadcastingBackfill] = useState(false);
  const [backfillFeedback, setBackfillFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchAlertsAndOps();
  }, []);

  const fetchAlertsAndOps = async () => {
    try {
      const [alertsRes, waitlistRes] = await Promise.all([
        fetch('/api/v1/clinical/alerts'),
        fetch('/api/v1/operations/waitlist'),
      ]);
      if (alertsRes.ok) {
        const data = await alertsRes.json();
        if (data.success && data.alerts) {
          setCriticalAlerts(data.alerts);
        }
      }
      if (waitlistRes.ok) {
        const data = await waitlistRes.json();
        if (data.success && data.count !== undefined) {
          setWaitlistCount(data.count);
        }
      }
    } catch (err) {
      console.error('Failed to fetch clinical ops:', err);
    }
  };

  const handleTriggerBackfill = async () => {
    setIsBroadcastingBackfill(true);
    setBackfillFeedback(null);
    try {
      const res = await fetch('/api/v1/operations/waitlist/trigger-backfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotDate: 'Today (2:30 PM)',
          slotTime: '14:30',
          doctorName: 'Dr. Sarah Jensen',
          treatmentType: 'Emergency / Routine Hygiene Care',
          operatory: 'Operatory 2',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBackfillFeedback(data.message);
        fetchAlertsAndOps();
      }
    } catch (err) {
      console.error('Error triggering backfill:', err);
    } finally {
      setIsBroadcastingBackfill(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Urgent Clinical Aftercare Triage Banner (Pain >= 7 or heavy bleeding) */}
      {criticalAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/90 via-red-900/80 to-rose-950/90 border-2 border-rose-500 shadow-xl shadow-rose-950/50 text-white animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-600 rounded-xl shrink-0">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-rose-100 uppercase tracking-wider">
                    Critical Recovery Alert (Staff Action Required)
                  </span>
                  <Badge variant="destructive" className="bg-rose-700 text-white text-[10px] font-bold">
                    {criticalAlerts.length} High Priority
                  </Badge>
                </div>
                <p className="text-xs text-rose-200 mt-0.5">
                  Patient {criticalAlerts[0]?.patientFullName || 'Sophia Martinez'} logged severe pain ({criticalAlerts[0]?.painScale}/10) / symptom escalation after procedure.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => notificationSoundService.playEmergencyTriageAlarm()}
                className="px-3 py-1.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-rose-100 font-medium text-xs flex items-center gap-1.5 transition-colors"
                title="Audible Triage Siren"
              >
                <Volume2 className="w-3.5 h-3.5 text-rose-300" />
                <span>Test Alarm</span>
              </button>
              <a
                href={`tel:${criticalAlerts[0]?.patientPhone || '+15559876543'}`}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Patient Now</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Operational Highlights Bar: Curbside Arrivals & Waitlist Engine */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Curbside Arrival Live Monitor */}
        <div className="md:col-span-7 p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Curbside Arrival Monitor</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                <strong className="text-white">Sophia Martinez</strong> arrived &bull; <span className="text-cyan-300 font-semibold">Spot #3 / Main Entrance</span> &bull; Assigned to <strong className="text-white">Operatory 3</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                notificationSoundService.playCurbsideArrivalChime();
                notificationSoundService.sendCurbsideArrivalNotification('Sophia Martinez', 'Spot #3');
              }}
              className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-[11px] font-medium flex items-center gap-1 transition-colors"
              title="Test Curbside Arrival Harmonic Chime"
            >
              <Volume2 className="w-3 h-3" />
              <span>Chime</span>
            </button>
            <Badge variant="success" className="text-[10px]">
              Checked In
            </Badge>
          </div>
        </div>

        {/* Priority Waitlist & Backfill Broadcast Trigger */}
        <div className="md:col-span-5 p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Chair Backfill Engine
              </div>
              <p className="text-xs text-purple-300 mt-0.5">
                <strong className="text-white">{waitlistCount} patients</strong> waiting for openings
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTriggerBackfill}
            disabled={isBroadcastingBackfill}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all shrink-0 flex items-center gap-1.5 active:scale-95"
          >
            {isBroadcastingBackfill ? (
              <span>Broadcasting...</span>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Fill Empty Slot</span>
              </>
            )}
          </button>
        </div>
      </div>

      {backfillFeedback && (
        <div className="p-3 rounded-xl bg-purple-950/70 border border-purple-500/40 text-xs text-purple-200 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{backfillFeedback}</span>
        </div>
      )}

      {/* Top Header with Unified Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Patients Hub & Clinical CRM
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage live patient communications, insurance verification, recovery triage, and appointments.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-900/70 border border-black/5 dark:border-white/10 backdrop-blur-md">
          <button
            onClick={() => setActiveView('chats')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200
              ${
                activeView === 'chats'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }
            `}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Live Communications</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white">
              {conversations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveView('directory')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200
              ${
                activeView === 'directory'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }
            `}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Patient Records & Intake</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white">
              {leads.length}
            </span>
          </button>
        </div>
      </div>

      {/* Sub-view Content */}
      {activeView === 'chats' ? (
        <ConversationsPage
          conversations={conversations}
          onToggleTakeover={onToggleTakeover}
          onSendMessage={onSendMessage}
        />
      ) : (
        <LeadsPage
          leads={leads}
          onSelectTab={onSelectTab}
        />
      )}

    </div>
  );
};

