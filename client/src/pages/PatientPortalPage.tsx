import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft, 
  Bell, 
  CalendarPlus, 
  MessageSquare,
  Stethoscope,
  ChevronRight,
  ExternalLink,
  Smartphone,
  Send,
  Info
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { BookingDetails } from '../components/booking/InteractiveSlotPicker';
import { BusinessProfile } from '../types/admin.types';

interface PatientPortalPageProps {
  booking: BookingDetails;
  businessProfile: BusinessProfile;
  onNavigateHome: () => void;
  onBookAnother: () => void;
}

export const PatientPortalPage: React.FC<PatientPortalPageProps> = ({
  booking,
  businessProfile,
  onNavigateHome,
  onBookAnother,
}) => {
  const isSmsChannel = booking.preferredChannel !== 'whatsapp';
  const [rcsStatus, setRcsStatus] = useState<'pending' | 'confirmed' | 'info_shown'>('pending');
  const [rcsInfoNote, setRcsInfoNote] = useState<string | null>(null);

  const handleRcsAction = (action: string) => {
    if (action === 'confirm') {
      setRcsStatus('confirmed');
      setRcsInfoNote('Appointment verified via RCS 1-Click Action Chip! Dr. Jensen has marked your slot locked.');
    } else if (action === 'bring') {
      setRcsInfoNote('Please bring your Government Photo ID, Dental Insurance Card, and arrive 10 min early for pre-exam imaging.');
    } else if (action === 'reschedule') {
      setRcsInfoNote('To change your time slot, reply RESCHEDULE to this text or use our online portal.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30 selection:text-blue-200 py-12 px-6 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-emerald-600/20 via-blue-600/20 to-cyan-500/20 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-8 animate-fadeIn">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" />
            <span>Back to Clinic Website</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {isSmsChannel ? 'US / Canada SMS/RCS Network Active' : 'WhatsApp Cloud Connected'}
            </span>
          </div>
        </div>

        {/* Hero Confirmation Card */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Appointment Confirmed!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Welcome, <strong className="text-white">{booking.customerName}</strong>. Your appointment with <strong className="text-blue-400">Dr. Sarah Jensen, DDS</strong> has been reserved.
          </p>
        </div>

        {/* 2-Column Appointment & Notification Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Col: Confirmed Appointment Details */}
          <div className="lg:col-span-6 space-y-6">
            <GlassCard className="p-6 border-emerald-500/30 bg-emerald-500/5 space-y-6 shadow-2xl">
              
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="/images/dentist_doctor.jpg"
                    alt="Dr. Sarah Jensen"
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">Dr. Sarah Jensen, DDS</h4>
                    <p className="text-xs text-slate-400">Lead Cosmetic & General Dentist</p>
                  </div>
                </div>

                <Badge variant="success" dot size="sm">
                  {rcsStatus === 'confirmed' ? 'RCS Verified' : 'Confirmed'}
                </Badge>
              </div>

              {/* Countdown Pill */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Clock className="w-4 h-4" />
                  <span>Your Appointment Time</span>
                </div>
                <span className="text-xs font-bold text-white">
                  {booking.selectedDate} • {booking.selectedTime}
                </span>
              </div>

              {/* Treatment & Location Details */}
              <div className="space-y-3 text-xs divide-y divide-white/5">
                <div className="flex justify-between pt-2">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-blue-400" /> Treatment:
                  </span>
                  <span className="font-bold text-white">{booking.treatment}</span>
                </div>

                <div className="flex justify-between pt-2">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Insurance:
                  </span>
                  <span className="font-medium text-slate-200">{booking.insurance}</span>
                </div>

                <div className="flex justify-between pt-2">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" /> Location:
                  </span>
                  <span className="font-medium text-slate-200">450 Lexington Ave, Suite 800, New York</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span>Add to Google Calendar</span>
                </a>

                <button
                  onClick={onBookAnother}
                  className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs transition-all"
                >
                  Book Another Slot
                </button>
              </div>

            </GlassCard>

            {/* Patient Contact Info & Compliance Card */}
            <GlassCard className="p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Your Contact Information & Regulatory Status
              </h4>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">
                        {isSmsChannel ? 'Verified Mobile (SMS / RCS Ready)' : 'Verified WhatsApp Phone'}
                      </p>
                      <p className="font-mono font-bold text-white">{booking.customerPhone}</p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">
                    {isSmsChannel ? '10DLC Active' : 'WhatsApp'}
                  </Badge>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Confirmation Email</p>
                    <p className="font-mono font-bold text-white truncate max-w-[240px]">{booking.customerEmail}</p>
                  </div>
                </div>

                {isSmsChannel && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-emerald-200">TCPA & HIPAA Regulatory Consent Confirmed</p>
                      <p className="text-[10px] text-emerald-400/80 mt-0.5">
                        Opt-in timestamped & stored in auditable compliance log. Standard carrier rates apply. Reply STOP anytime to cancel.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>

          </div>

          {/* Right Col: Live Interactive SMS / RCS Message Simulator & Timeline */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Interactive Phone Screen Preview */}
            <GlassCard className="p-5 space-y-4 border-blue-500/30 bg-blue-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <h4 className="text-xs font-bold text-white">
                    {isSmsChannel ? 'Live RCS Rich Card / SMS Simulation' : 'WhatsApp Chat Preview'}
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {isSmsChannel ? 'Carrier: Verizon / AT&T / T-Mobile' : 'WhatsApp Cloud API'}
                </span>
              </div>

              {/* Smartphone Message Body */}
              <div className="bg-slate-950/90 rounded-2xl border border-white/15 p-4 space-y-3">
                {isSmsChannel ? (
                  /* RCS Rich Card Layout */
                  <div className="bg-slate-900 border border-blue-500/30 rounded-xl overflow-hidden shadow-lg">
                    {/* Card Header Image */}
                    <div className="relative h-28 w-full bg-slate-800 overflow-hidden">
                      <img 
                        src="/images/modern_dental_clinic.jpg" 
                        alt="Apex Dental Care Clinic" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-white drop-shadow">Apex Dental Care</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/80 text-white font-semibold">
                          RCS Verified
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-3.5 space-y-2">
                      <p className="text-xs font-bold text-white">
                        Appointment Confirmed: {booking.treatment}
                      </p>
                      <p className="text-[11px] text-slate-300">
                        Hello {booking.customerName}, Dr. Sarah Jensen, DDS is scheduled to see you on <strong className="text-blue-300">{booking.selectedDate} at {booking.selectedTime}</strong>.
                      </p>
                      <p className="text-[10px] text-slate-400">
                        📍 450 Lexington Ave, Suite 800, New York
                      </p>

                      {/* RCS Interactive Action Chips */}
                      <div className="pt-2 border-t border-white/10 space-y-1.5">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          1-Click Interactive Actions (Tap to test):
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRcsAction('confirm')}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                              rcsStatus === 'confirmed'
                                ? 'bg-emerald-500 text-white font-bold'
                                : 'bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>{rcsStatus === 'confirmed' ? 'Confirmed!' : 'Confirm Slot'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRcsAction('bring')}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Info className="w-3 h-3 text-amber-400" />
                            <span>What to Bring</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRcsAction('reschedule')}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Clock className="w-3 h-3 text-cyan-400" />
                            <span>Reschedule</span>
                          </button>

                          <a
                            href="https://maps.google.com"
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 flex items-center justify-center gap-1.5 transition-all"
                          >
                            <MapPin className="w-3 h-3 text-rose-400" />
                            <span>Directions</span>
                          </a>
                        </div>
                      </div>

                      {/* Interactive Feedback Message */}
                      {rcsInfoNote && (
                        <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-[11px] text-blue-200 animate-fadeIn">
                          {rcsInfoNote}
                        </div>
                      )}

                      {/* 10DLC Mandatory Compliance Suffix */}
                      <p className="text-[9px] text-slate-500 pt-1 leading-tight border-t border-white/5">
                        Apex Dental Care: Reply STOP to cancel, HELP for help. Msg & data rates may apply.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* WhatsApp Message Layout */
                  <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
                    <p className="text-xs font-bold text-white">Apex Dental Care</p>
                    <p className="text-[11px] text-slate-200 leading-relaxed">
                      Hello {booking.customerName}! Your appointment for <strong>{booking.treatment}</strong> has been confirmed for <strong>{booking.selectedDate} at {booking.selectedTime}</strong>.
                    </p>
                    <p className="text-[10px] text-slate-400">Dr. Sarah Jensen, DDS looks forward to welcoming you.</p>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Automated Notification Timeline */}
            <GlassCard className="p-5 space-y-3 border-indigo-500/20 bg-indigo-500/5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold text-white">Automated Delivery Schedule</h4>
              </div>

              <div className="space-y-3 text-xs pt-1">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {isSmsChannel ? 'Instant SMS / RCS Rich Card Confirmation' : 'Instant WhatsApp Confirmation'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {isSmsChannel 
                        ? 'Dispatched via Telnyx Wholesale Gateway with interactive action chips.'
                        : 'Delivered with directions & clinic preparation tips.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Email Receipt & Calendar Invite</p>
                    <p className="text-[10px] text-slate-400">Sent to {booking.customerEmail}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-300">
                      {isSmsChannel ? '2-Hour SMS / RCS Appointment Reminder' : '2-Hour WhatsApp Reminder'}
                    </p>
                    <p className="text-[10px] text-slate-400">Automated reminder dispatched 2 hours before your slot.</p>
                  </div>
                </div>
              </div>
            </GlassCard>

          </div>

        </div>

      </div>

    </div>
  );
};
