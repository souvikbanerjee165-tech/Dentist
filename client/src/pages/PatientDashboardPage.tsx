import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  CalendarPlus, 
  MessageSquare, 
  Stethoscope, 
  FileText, 
  Download, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  Lock, 
  Shield, 
  CreditCard, 
  HelpCircle, 
  User, 
  ArrowLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { PatientUser } from '../components/patient/PatientAuthModal';
import { BusinessProfile } from '../types/admin.types';

interface ChecklistItem {
  id: string;
  label: string;
  category: 'identity' | 'insurance' | 'medical' | 'dental_hardware' | 'instructions';
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
}

interface ClinicalVisitRecord {
  id: string;
  date: string;
  treatment: string;
  doctorName: string;
  doctorRole: string;
  operatory: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  sharedSummary: string;
  aftercareInstructions: string[];
  privateClinicalNotes?: string;
  feeGbp: number;
  paymentStatus: 'paid' | 'insurance_pending' | 'due';
  receiptNumber: string;
  prescriptions?: string[];
  vitals?: {
    bloodPressure?: string;
    pulse?: number;
  };
}

interface UpcomingAppointment {
  id: string;
  treatment: string;
  dateStr: string;
  timeStr: string;
  startIso: string;
  endIso: string;
  doctorName: string;
  doctorRole: string;
  clinicName: string;
  clinicAddress: string;
  room: string;
  status: 'confirmed' | 'checked_in' | 'in_prep';
  estimatedDuration: string;
  feeGbp: number;
  checklist: ChecklistItem[];
  preVisitGuidelines: string[];
}

interface PatientDashboardProps {
  user: PatientUser;
  token: string;
  businessProfile: BusinessProfile;
  onLogout: () => void;
  onBookAnother: () => void;
  onNavigateHome: () => void;
}

export const PatientDashboardPage: React.FC<PatientDashboardProps> = ({
  user,
  token,
  businessProfile,
  onLogout,
  onBookAnother,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'history' | 'profile'>('overview');
  const [upcoming, setUpcoming] = useState<UpcomingAppointment | null>(null);
  const [history, setHistory] = useState<ClinicalVisitRecord[]>([]);
  const [loyaltyStatus, setLoyaltyStatus] = useState<string>('Regular Patient');
  const [twoFactorActive, setTwoFactorActive] = useState(user.twoFactorEnabled);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3500);
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/patient/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUpcoming(data.upcomingAppointment);
        setHistory(data.clinicalHistory || []);
        setLoyaltyStatus(data.loyaltyStatus || 'Regular Patient');
        if (data.user) {
          setTwoFactorActive(data.user.twoFactorEnabled);
          setAuditLog(data.user.securityAuditLog || []);
        }
      }
    } catch (err) {
      console.error('Failed fetching dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleToggleChecklist = async (itemId: string, currentCompleted: boolean) => {
    if (!upcoming) return;
    const nextCompleted = !currentCompleted;

    // Optimistic UI update
    setUpcoming((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        checklist: prev.checklist.map((c) =>
          c.id === itemId ? { ...c, isCompleted: nextCompleted } : c
        ),
      };
    });

    try {
      await fetch('/api/v1/patient/checklist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId, isCompleted: nextCompleted }),
      });
      showToast(nextCompleted ? 'Item marked as packed / ready! ✅' : 'Item marked as pending.');
    } catch (err) {
      console.error('Error toggling checklist:', err);
    }
  };

  const handleToggle2FA = async () => {
    const nextVal = !twoFactorActive;
    setTwoFactorActive(nextVal);
    try {
      await fetch('/api/v1/patient/toggle-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: nextVal }),
      });
      showToast(nextVal ? 'Two-Factor Authentication activated 🛡️' : 'Two-Factor Authentication disabled');
    } catch (err) {
      console.error('Failed toggling 2FA:', err);
    }
  };

  const completedChecklistCount = upcoming?.checklist.filter((c) => c.isCompleted).length || 0;
  const totalChecklistCount = upcoming?.checklist.length || 0;
  const checklistPercent = totalChecklistCount > 0 ? Math.round((completedChecklistCount / totalChecklistCount) * 100) : 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30 selection:text-blue-200 pb-20 relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-cyan-500/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Floating Action Toast */}
      {actionToast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-500/90 text-white font-semibold text-xs shadow-2xl backdrop-blur-md flex items-center gap-2 animate-fadeIn border border-emerald-400/30">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full px-6 py-4 backdrop-blur-2xl bg-slate-950/80 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Clinic Home</span>
            </button>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-2.5">
              <img
                src="/images/dentist_doctor.jpg"
                alt="Dr. Sarah Jensen"
                className="w-8 h-8 rounded-full object-cover border border-blue-400"
              />
              <div>
                <h1 className="text-xs font-bold text-white leading-tight">{businessProfile.name}</h1>
                <p className="text-[10px] text-blue-400 font-medium">Dr. Sarah Jensen, DDS</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="success" dot size="sm">
              {loyaltyStatus}
            </Badge>

            <button
              onClick={onBookAnother}
              className="px-3 py-1.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 font-bold text-xs text-white transition-all shadow-md active:scale-95 hidden sm:flex items-center gap-1.5"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all active:scale-95"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="max-w-6xl mx-auto px-6 pt-8 relative z-10 space-y-6">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                alt={user.fullName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-400 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Welcome back, {user.fullName}!
                </h2>
                <Badge variant="primary" size="sm">
                  {user.authProvider.toUpperCase()} SSO
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                <span>{user.email}</span>
                <span>•</span>
                <span>{user.insuranceProvider || 'Delta Dental PPO'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Completed Visits</span>
              <span className="text-sm font-extrabold text-white">{history.length} Visits on Record</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Upcoming Booking</span>
            {upcoming && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'checklist'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>What to Bring / Carry</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-mono">
              {completedChecklistCount}/{totalChecklistCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Clinical Visit Trail</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-mono">
              {history.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Medical Profile & Security</span>
            {twoFactorActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </button>
        </div>

        {/* TAB 1: OVERVIEW & UPCOMING APPOINTMENT */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {upcoming ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Main Hero Card (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                  <GlassCard className="p-6 border-emerald-500/30 bg-emerald-500/5 space-y-6 shadow-2xl">
                    
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src="/images/dentist_doctor.jpg"
                          alt="Dr. Sarah Jensen"
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
                        />
                        <div>
                          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                            <span>{upcoming.treatment}</span>
                          </h3>
                          <p className="text-xs text-emerald-400 font-medium">
                            {upcoming.doctorName} • {upcoming.doctorRole}
                          </p>
                        </div>
                      </div>

                      <Badge variant="success" dot>
                        {upcoming.status.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Time Slot Pill */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Confirmed Slot</span>
                          <span className="text-sm font-extrabold text-white">
                            {upcoming.dateStr} • {upcoming.timeStr}
                          </span>
                        </div>
                      </div>

                      <div className="text-right sm:border-l sm:border-white/10 sm:pl-4">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Duration & Room</span>
                        <span className="text-xs font-semibold text-slate-200">
                          {upcoming.estimatedDuration} • {upcoming.room}
                        </span>
                      </div>
                    </div>

                    {/* Location and Directions */}
                    <div className="space-y-3 text-xs divide-y divide-white/5">
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-rose-400" /> Practice Address:
                        </span>
                        <span className="font-semibold text-white text-right">
                          {upcoming.clinicAddress}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-blue-400" /> Treatment Fee:
                        </span>
                        <span className="font-bold text-emerald-400 text-sm">
                          £{upcoming.feeGbp} (Covered by Insurance / Co-pay)
                        </span>
                      </div>
                    </div>

                    {/* Pre-visit Guidelines */}
                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                      <h4 className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                        Doctor Sarah’s Pre-Visit Instructions:
                      </h4>
                      <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                        {upcoming.preVisitGuidelines.map((g, i) => (
                          <li key={i}>{g}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap gap-3 pt-2">
                      <a
                        href="https://calendar.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                      >
                        <CalendarPlus className="w-4 h-4" />
                        <span>Add to Google Calendar</span>
                      </a>

                      <button
                        onClick={() => setActiveTab('checklist')}
                        className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs transition-all flex items-center gap-2"
                      >
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                        <span>View What to Carry ({completedChecklistCount}/{totalChecklistCount})</span>
                      </button>
                    </div>

                  </GlassCard>
                </div>

                {/* Right Column: Quick Status & Preparation Progress (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Preparation Checklist Progress Widget */}
                  <GlassCard className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                        <span>Pre-Visit Readiness</span>
                      </h4>
                      <span className="text-xs font-mono font-bold text-emerald-400">{checklistPercent}%</span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${checklistPercent}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {checklistPercent === 100 
                        ? '🎉 You have checked off all items required for your visit! You are completely ready.'
                        : `You have ${totalChecklistCount - completedChecklistCount} item(s) pending to carry. Review your checklist before leaving.`
                      }
                    </p>

                    <button
                      onClick={() => setActiveTab('checklist')}
                      className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all flex items-center justify-center gap-2"
                    >
                      <span>Open Interactive Checklist</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </GlassCard>

                  {/* Clinic Concierge Support */}
                  <GlassCard className="p-5 space-y-3 border-indigo-500/20 bg-indigo-500/5">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-xs font-bold text-white">24/7 AI Dental Concierge</h4>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Need to adjust your appointment or ask about post-care? Our front desk AI receptionist is available around the clock.
                    </p>
                    <div className="text-xs space-y-1.5 pt-1">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-mono">{businessProfile.ownerNotificationPhone || '+1 (555) 234-5678'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-purple-400" />
                        <span>{businessProfile.ownerNotificationEmail || 'appointments@stjamesdental.com'}</span>
                      </div>
                    </div>
                  </GlassCard>

                </div>

              </div>
            ) : (
              <GlassCard className="p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                  <CalendarIcon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">No Upcoming Appointments Scheduled</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You are currently up to date on your hygiene recalls. Would you like to schedule your next visit with Dr. Sarah?
                </p>
                <button
                  onClick={onBookAnother}
                  className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 transition-all"
                >
                  Book New Treatment Slot
                </button>
              </GlassCard>
            )}
          </div>
        )}

        {/* TAB 2: WHAT TO BRING / CARRY CHECKLIST */}
        {activeTab === 'checklist' && (
          <div className="space-y-6 animate-fadeIn">
            <GlassCard className="p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                    <span>What to Bring / Carry for Your Appointment</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Check off each item as you pack them. This list is customized specifically for{' '}
                    <strong className="text-white">{upcoming?.treatment || 'your scheduled dental treatment'}</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Checklist Progress</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {completedChecklistCount} of {totalChecklistCount} Packed ({checklistPercent}%)
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                    {checklistPercent}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${checklistPercent}%` }}
                />
              </div>

              {/* Checklist Items */}
              <div className="space-y-3">
                {upcoming?.checklist && upcoming.checklist.length > 0 ? (
                  upcoming.checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id, item.isCompleted)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                        item.isCompleted
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-200'
                          : 'bg-slate-900/80 border-white/10 hover:border-white/20 text-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                            item.isCompleted
                              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                              : 'border-2 border-slate-600 hover:border-slate-400'
                          }`}
                        >
                          {item.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${item.isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                              {item.label}
                            </span>
                            {item.isRequired && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/25">
                                Mandatory
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <Badge variant={item.isCompleted ? 'success' : 'neutral'} size="sm">
                        {item.isCompleted ? 'Packed' : 'To Bring'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No checklist items configured for this booking.</p>
                )}
              </div>

            </GlassCard>
          </div>
        )}

        {/* TAB 3: CLINICAL VISIT TRAIL & HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fadeIn">
            <GlassCard className="p-6 space-y-6">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-blue-400" />
                    <span>Full Clinical Visit Trail & History</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Chronological record of every procedure, clinician notes, and invoice receipt at {businessProfile.name}.
                  </p>
                </div>

                <Badge variant="success" size="sm">
                  {history.length} Visits Documented
                </Badge>
              </div>

              {/* Timeline Container */}
              <div className="space-y-6 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-white/10">
                {history.length > 0 ? (
                  history.map((record, index) => (
                    <div key={record.id} className="relative pl-12 space-y-3">
                      
                      {/* Timeline Dot */}
                      <div className="absolute left-4 top-1.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-slate-900 shadow-md shadow-blue-500/40" />

                      <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-4 hover:border-white/20 transition-all shadow-xl">
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-blue-400">{record.date}</span>
                              <span className="text-slate-600">•</span>
                              <span className="text-xs text-slate-400 font-semibold">{record.operatory}</span>
                            </div>
                            <h4 className="text-sm font-bold text-white mt-1">{record.treatment}</h4>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-center">
                            <Badge variant="success">Paid £{record.feeGbp}</Badge>
                            <span className="text-[11px] font-mono text-slate-400">{record.receiptNumber}</span>
                          </div>
                        </div>

                        {/* Doctor's Shared Clinical Summary */}
                        <div className="space-y-1 text-xs">
                          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-cyan-300" />
                            Doctor's Examination & Procedure Notes:
                          </span>
                          <p className="text-slate-200 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                            "{record.sharedSummary}"
                          </p>
                        </div>

                        {/* Aftercare Instructions */}
                        {record.aftercareInstructions && record.aftercareInstructions.length > 0 && (
                          <div className="space-y-1 text-xs">
                            <span className="text-slate-400 font-semibold">Aftercare Recommendations:</span>
                            <ul className="list-disc pl-5 space-y-0.5 text-slate-300">
                              {record.aftercareInstructions.map((ins, idx) => (
                                <li key={idx}>{ins}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Vitals snapshot if recorded */}
                        {record.vitals && (
                          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                            <span>Vitals: BP <strong>{record.vitals.bloodPressure}</strong></span>
                            <span>•</span>
                            <span>Pulse <strong>{record.vitals.pulse} bpm</strong></span>
                          </div>
                        )}

                        {/* Download Receipt Button */}
                        <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs">
                          <span className="text-slate-400">Attending: <strong>{record.doctorName}</strong></span>
                          <button
                            type="button"
                            onClick={() => showToast(`Receipt ${record.receiptNumber} downloaded!`)}
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
                          >
                            <Download className="w-3.5 h-3.5 text-blue-400" />
                            <span>Download Receipt</span>
                          </button>
                        </div>

                      </div>

                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No past visit history recorded yet.</p>
                )}
              </div>

            </GlassCard>
          </div>
        )}

        {/* TAB 4: MEDICAL PROFILE & SECURITY */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Medical & Insurance Record */}
              <div className="md:col-span-6 space-y-6">
                <GlassCard className="p-6 space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-400" />
                    <span>Patient Profile & Coverage</span>
                  </h3>

                  <div className="space-y-3 text-xs divide-y divide-white/5">
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400">Legal Name:</span>
                      <span className="font-semibold text-white">{user.fullName}</span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400">Email Address:</span>
                      <span className="font-mono text-white">{user.email}</span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400">WhatsApp Phone:</span>
                      <span className="font-mono text-white">{user.phone}</span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400">Dental Insurance:</span>
                      <span className="font-semibold text-cyan-300">{user.insuranceProvider || 'Delta Dental Premier PPO'}</span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400">Policy Identifier:</span>
                      <span className="font-mono text-slate-300">{user.insurancePolicyNumber || 'DD-98234-NY'}</span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400">Known Drug Allergies:</span>
                      <div className="flex gap-1.5">
                        {user.knownAllergies && user.knownAllergies.length > 0 ? (
                          user.knownAllergies.map((all, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 text-[10px] font-semibold">
                              {all}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400">None Reported</span>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Right Column: Healthcare Security & Two-Factor Controls */}
              <div className="md:col-span-6 space-y-6">
                <GlassCard className="p-6 space-y-5 border-blue-500/30">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Security & Healthcare Privacy</span>
                    </h3>
                    <Badge variant="success" size="sm">Active Guard</Badge>
                  </div>

                  {/* Two-Factor Authentication Switch */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <Lock className="w-3.5 h-3.5 text-blue-400" />
                        <span>Two-Factor Authentication (2FA)</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Requires SMS or Authenticator verification upon login.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggle2FA}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        twoFactorActive ? 'bg-blue-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          twoFactorActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Security Audit Trail */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Recent Account Security Activity
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {auditLog.length > 0 ? (
                        auditLog.map((log, index) => (
                          <div
                            key={index}
                            className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-semibold text-white">{log.action}</p>
                              <p className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</p>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {log.status.toUpperCase()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic">No recent security events.</p>
                      )}
                    </div>
                  </div>

                </GlassCard>
              </div>

            </div>
          </div>
        )}

      </main>

    </div>
  );
};
