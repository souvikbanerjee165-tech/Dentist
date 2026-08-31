import React from 'react';
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
  ExternalLink
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
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30 selection:text-blue-200 py-12 px-6 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-emerald-600/20 via-blue-600/20 to-cyan-500/20 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-8 animate-fadeIn">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" />
            <span>Back to Clinic Website</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400">Patient Portal Active</span>
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
            Welcome, <strong className="text-white">{booking.customerName}</strong>. Your appointment with <strong className="text-blue-400">Dr. Sarah Jensen, DDS</strong> has been confirmed.
          </p>
        </div>

        {/* 2-Column Appointment & Notification Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Col: Confirmed Appointment Details */}
          <div className="md:col-span-7 space-y-6">
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
                  Confirmed
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
          </div>

          {/* Right Col: Verified Contact & Automated Notification Timeline */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Patient Info Card */}
            <GlassCard className="p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Your Contact Information
              </h4>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Verified WhatsApp Phone</p>
                    <p className="font-mono font-bold text-white">{booking.customerPhone}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Confirmation Email</p>
                    <p className="font-mono font-bold text-white truncate max-w-[200px]">{booking.customerEmail}</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Automated Notification Timeline */}
            <GlassCard className="p-5 space-y-3 border-indigo-500/20 bg-indigo-500/5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold text-white">Automated Reminder Schedule</h4>
              </div>

              <div className="space-y-3 text-xs pt-1">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Instant WhatsApp Confirmation</p>
                    <p className="text-[10px] text-slate-400">Delivered with directions & clinic preparation tips.</p>
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
                    <p className="font-semibold text-amber-300">2-Hour WhatsApp Reminder</p>
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
