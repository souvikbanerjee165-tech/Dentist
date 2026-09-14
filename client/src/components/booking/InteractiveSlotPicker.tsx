import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  User, 
  Phone, 
  Mail, 
  Stethoscope, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Lock,
  AlertCircle,
  Smartphone,
  MessageSquare,
  Shield
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { BusinessProfile } from '../../types/admin.types';

export interface BookingDetails {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  treatment: string;
  selectedDate: string;
  selectedTime: string;
  insurance: string;
  preferredChannel?: 'sms' | 'rcs' | 'whatsapp';
  tcpaConsentGranted?: boolean;
}

interface InteractiveSlotPickerProps {
  businessProfile: BusinessProfile;
  initialTreatment?: string;
  onBookingComplete: (details: BookingDetails) => void;
  onCancel: () => void;
}

export const InteractiveSlotPicker: React.FC<InteractiveSlotPickerProps> = ({
  businessProfile,
  initialTreatment = 'Teeth whitening (£395)',
  onBookingComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Slot Picker, Step 2: Patient Sign-Up Intake
  const [treatment, setTreatment] = useState(initialTreatment);
  const [selectedDate, setSelectedDate] = useState('Friday, Sep 4');
  const [selectedTime, setSelectedTime] = useState('3:00 PM');
  
  // Patient details form
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    insurance: 'Private / Self-Pay',
  });
  const [preferredChannel, setPreferredChannel] = useState<'sms' | 'rcs' | 'whatsapp'>('sms');
  const [tcpaConsent, setTcpaConsent] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableDates = [
    { label: 'Today (Priority)', value: 'Today, Aug 31', tag: '3 Slots Left' },
    { label: 'Tomorrow', value: 'Tomorrow, Sep 1', tag: '5 Slots' },
    { label: 'This Friday', value: 'Friday, Sep 4', tag: 'Popular' },
    { label: 'This Saturday', value: 'Saturday, Sep 5', tag: 'Weekend' },
    { label: 'Next Monday', value: 'Monday, Sep 7', tag: 'Open' },
  ];

  const availableTimes = [
    '9:00 AM',
    '10:30 AM',
    '1:00 PM',
    '2:30 PM',
    '3:00 PM',
    '4:15 PM',
  ];

  const treatmentOptions = [
    {
      title: 'Teeth whitening',
      price: '£395',
      tag: '✨ Aesthetic Dentistry',
      desc: 'Guaranteed whitening results with professional products',
    },
    {
      title: 'Composite fillings',
      price: 'From £225',
      tag: '🦷 Restorative',
      desc: 'Replace old amalgam with seamless tooth-colored fillings',
    },
    {
      title: 'Emax veneers',
      price: '£850 / tooth',
      tag: '💎 Aesthetic Dentistry',
      desc: 'High strength, highly aesthetic porcelain veneers',
    },
    {
      title: 'Bespoke bonding',
      price: '£395 / tooth',
      tag: '🤖 AI Smile Design',
      desc: 'High quality composite bonding designed using AI software',
    },
    {
      title: 'Dental Implants',
      price: 'From £2,800',
      tag: '🔩 Permanent Solution',
      desc: 'Long-lasting titanium solution to restore your smile',
    },
    {
      title: 'Clear aligners',
      price: 'From £3,100',
      tag: '📐 Orthodontics',
      desc: 'Discrete, comfortable teeth straightening',
    },
    {
      title: 'Emergency Tooth Pain & Exam',
      price: '£95',
      tag: '🚨 Priority Today',
      desc: '3D digital diagnosis, nerve soothing & immediate relief',
    },
    {
      title: 'Routine Examination & 3D Scan',
      price: '£95',
      tag: '🩺 General Dentistry',
      desc: 'Complete oral check, cancer screening & 3D digital imaging',
    },
  ];

  const handleConfirmAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (preferredChannel !== 'whatsapp' && !tcpaConsent) {
      setConsentError('HIPAA & TCPA compliance requires active opt-in consent before we can dispatch medical appointment text messages to your phone.');
      return;
    }

    setIsSubmitting(true);
    setConsentError(null);

    const bookingPayload: BookingDetails = {
      customerName: formData.fullName,
      customerPhone: formData.phone,
      customerEmail: formData.email,
      treatment,
      selectedDate,
      selectedTime,
      insurance: formData.insurance,
      preferredChannel,
      tcpaConsentGranted: tcpaConsent,
    };

    try {
      // 1. Record TCPA & HIPAA regulatory consent
      if (preferredChannel !== 'whatsapp' && tcpaConsent) {
        await fetch('/api/v1/sms/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: formData.phone,
            patientName: formData.fullName,
            channel: preferredChannel,
            tcpaConsentGranted: true,
            hipaaAcknowledgementGranted: true,
          }),
        });
      }

      // 2. Dispatch SMS / RCS 10DLC booking confirmation
      await fetch('/api/v1/sms/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: formData.phone,
          patientName: formData.fullName,
          treatment,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          channel: preferredChannel,
          clinicName: businessProfile.name,
        }),
      });
    } catch (err) {
      console.warn('SMS dispatch processed in background:', err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      onBookingComplete(bookingPayload);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30 selection:text-blue-200 py-12 px-6 relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-cyan-500/20 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6 relative z-10">
        
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" />
            <span>Back to Clinic Website</span>
          </button>

          <Badge variant="primary" size="sm">
            Step {step} of 2: {step === 1 ? 'Choose Slot' : 'Patient Registration'}
          </Badge>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dr. Sarah Jensen, DDS • Instant Online Scheduling</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {step === 1 ? 'Select Your Appointment Slot' : 'Confirm Your Patient Details'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            {step === 1 
              ? 'Choose your dental service and preferred appointment date below.'
              : 'Enter your WhatsApp number & details to receive instant confirmation and pre-visit reminders.'}
          </p>
        </div>

        {/* STEP 1: INTERACTIVE CALENDAR & SLOT PICKER */}
        {step === 1 && (
          <GlassCard className="p-8 rounded-3xl border-white/15 shadow-2xl space-y-8 animate-fadeIn w-full">
            
            {/* 1. Select Treatment */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-400" /> 1. Select Dental Treatment
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {treatmentOptions.map((svc, idx) => {
                  const isSelected = treatment.toLowerCase().includes(svc.title.toLowerCase());
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTreatment(`${svc.title} (${svc.price})`)}
                      className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-500 bg-blue-600/15 text-white shadow-lg shadow-blue-500/20'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{svc.tag}</span>
                        <h4 className="text-xs font-bold leading-tight">{svc.title}</h4>
                      </div>
                      <div className="text-sm font-extrabold text-white mt-3">{svc.price}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Select Date */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-400" /> 2. Select Date
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {availableDates.map((d, idx) => {
                  const isSelected = selectedDate === d.value;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedDate(d.value)}
                      className={`
                        p-3 rounded-2xl border text-center transition-all duration-200
                        ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-600/20 text-white shadow-md shadow-emerald-500/20 scale-[1.02]'
                            : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                        }
                      `}
                    >
                      <p className="text-xs font-bold">{d.label}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{d.tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Select Time Slot */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> 3. Select Time Slot
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {availableTimes.map((t, idx) => {
                  const isSelected = selectedTime === t;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedTime(t)}
                      className={`
                        py-2.5 rounded-xl border text-xs font-bold text-center transition-all duration-200
                        ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-md shadow-amber-500/20 scale-105'
                            : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                        }
                      `}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary Bar & Continue Button */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs space-y-0.5">
                <p className="text-slate-400">Selected Appointment:</p>
                <p className="font-bold text-white text-sm">
                  {selectedDate} at {selectedTime} • <span className="text-blue-400">{treatment}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Continue to Patient Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </GlassCard>
        )}

        {/* STEP 2: PATIENT REGISTRATION & CONFIRMATION */}
        {step === 2 && (
          <GlassCard className="p-8 rounded-3xl border-white/15 shadow-2xl space-y-6 animate-fadeIn">
            
            {/* Slot Banner */}
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Reserved Slot</span>
                <p className="text-xs font-bold text-white mt-0.5">
                  Dr. Sarah Jensen, DDS • {selectedDate} at {selectedTime}
                </p>
                <p className="text-[11px] text-slate-400">{treatment}</p>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-blue-400 hover:underline font-semibold"
              >
                Change Slot
              </button>
            </div>

            <form onSubmit={handleConfirmAndRegister} className="space-y-4 text-xs">
              
              {/* Notification Channel Preference (US & Canada Primary) */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                    Appointment Confirmation Channel
                  </span>
                  <span className="text-[10px] text-blue-400 font-mono">10DLC & A2P Verified</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setPreferredChannel('sms'); setConsentError(null); }}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      preferredChannel !== 'whatsapp'
                        ? 'border-blue-500 bg-blue-600/15 text-white shadow-md shadow-blue-500/20'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <Smartphone className={`w-5 h-5 shrink-0 mt-0.5 ${preferredChannel !== 'whatsapp' ? 'text-blue-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">SMS / RCS Text</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-emerald-500/20 text-emerald-300">
                          Recommended (US & CA)
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Interactive Google & Apple RCS Rich Cards with 10DLC cellular SMS fallback.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setPreferredChannel('whatsapp'); setConsentError(null); }}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      preferredChannel === 'whatsapp'
                        ? 'border-emerald-500 bg-emerald-600/15 text-white shadow-md shadow-emerald-500/20'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <MessageSquare className={`w-5 h-5 shrink-0 mt-0.5 ${preferredChannel === 'whatsapp' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">WhatsApp</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-slate-700 text-slate-300">
                          Optional / International
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        For international patients traveling from the UK, Europe, or Latin America.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" /> Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Johnathan Miller"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    {preferredChannel === 'whatsapp' ? 'WhatsApp Phone' : 'Mobile / Cell Phone (For SMS & RCS)'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 345-6789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-purple-400" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>

              {/* Insurance */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Dental Insurance Provider
                </label>
                <select
                  value={formData.insurance}
                  onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <option value="Delta Dental PPO">Delta Dental PPO (US)</option>
                  <option value="MetLife Dental">MetLife Dental (US)</option>
                  <option value="Cigna Dental">Cigna Dental (US / CA)</option>
                  <option value="Sun Life Financial">Sun Life Financial (Canada)</option>
                  <option value="Manulife Dental">Manulife Dental (Canada)</option>
                  <option value="Aetna PPO">Aetna PPO</option>
                  <option value="Self-Pay / Cash">Self-Pay / Private (No Insurance)</option>
                </select>
              </div>

              {/* TCPA & HIPAA Regulatory Consent Checkbox (US & Canada Mandatory) */}
              {preferredChannel !== 'whatsapp' && (
                <div className={`p-4 rounded-2xl border transition-all ${
                  consentError 
                    ? 'bg-rose-500/10 border-rose-500/40 ring-1 ring-rose-500/40' 
                    : 'bg-slate-900/90 border-white/10'
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="tcpaConsent"
                      checked={tcpaConsent}
                      onChange={(e) => {
                        setTcpaConsent(e.target.checked);
                        if (e.target.checked) setConsentError(null);
                      }}
                      className="mt-1 w-4 h-4 rounded text-blue-600 bg-slate-800 border-white/20 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer shrink-0"
                    />
                    <label htmlFor="tcpaConsent" className="text-[11px] text-slate-300 leading-relaxed cursor-pointer select-none">
                      <span className="text-white font-bold block mb-0.5 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-blue-400" />
                        TCPA & HIPAA Regulatory Consent for Medical Text Messages
                      </span>
                      I consent to receive automated appointment confirmations, preparation guidelines, and care updates via SMS/RCS from <strong className="text-blue-300">{businessProfile.name}</strong> at the mobile number provided. Consent is not a condition of purchase. Msg frequency varies by visit. Msg & data rates may apply. Reply STOP to cancel at any time, HELP for assistance. I acknowledge the HIPAA Notice of Privacy Practices.
                    </label>
                  </div>

                  {consentError && (
                    <p className="text-[11px] text-rose-400 font-semibold pl-7 pt-2 flex items-center gap-1.5 animate-fadeIn">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {consentError}
                    </p>
                  )}
                </div>
              )}

              {/* Trust Badge */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-[11px] text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {preferredChannel === 'whatsapp'
                    ? 'You will receive an instant WhatsApp confirmation with directions & pre-visit guidelines.'
                    : 'Instant SMS / RCS Rich Card confirmation dispatched with interactive 1-tap confirmation.'}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'Verifying Consent & Confirming Slot...' : 'Confirm Appointment & Complete Registration'}</span>
              </button>

            </form>

          </GlassCard>
        )}

      </div>

    </div>
  );
};
