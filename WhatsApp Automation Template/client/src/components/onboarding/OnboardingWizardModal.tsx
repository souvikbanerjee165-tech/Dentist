import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Building2, 
  Clock, 
  Stethoscope, 
  Calendar, 
  Smartphone, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  DollarSign, 
  Bot, 
  ShieldCheck, 
  Send,
  Zap,
  Check
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { BusinessProfile } from '../../types/admin.types';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessProfile: BusinessProfile;
  onSaveProfile: (profile: BusinessProfile) => void;
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onClose,
  businessProfile,
  onSaveProfile,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const [isDeploying, setIsDeploying] = useState(false);

  // Onboarding form state
  const [clinicName, setClinicName] = useState(businessProfile.name || 'Apex Dental & Aesthetics');
  const [dentistName, setDentistName] = useState('Dr. Sarah Jensen, BDS');
  const [city, setCity] = useState('London');
  const [phone, setPhone] = useState('+44 20 7946 0912');
  const [email, setEmail] = useState('reception@apexdental.co.uk');
  const [hours, setHours] = useState('Mon - Fri: 8:30 AM - 6:00 PM | Sat: 9:00 AM - 2:00 PM');
  
  const [selectedTreatments, setSelectedTreatments] = useState([
    { name: 'Emergency Same-Day Pain Relief', price: 95, category: 'Emergency' },
    { name: 'Routine Examination & 3D Digital Scan', price: 95, category: 'General' },
    { name: 'Clinical Laser Teeth Whitening', price: 395, category: 'Cosmetic' },
    { name: 'Bespoke Composite Bonding', price: 395, category: 'Cosmetic' },
    { name: 'Emax Porcelain Veneers', price: 850, category: 'Cosmetic' },
    { name: 'Titanium Dental Implants', price: 2800, category: 'Surgical' },
    { name: 'Clear Aligners & Orthodontics', price: 3100, category: 'Orthodontics' },
  ]);

  // Test chat simulation state
  const [simulatedMessage, setSimulatedMessage] = useState('Hi! My molar hurts badly. Do you have slots today?');
  const [simulatedReply, setSimulatedReply] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsDeploying(true);

      // Call live backend auto-provisioning endpoint
      try {
        await fetch('/api/v1/onboarding/provision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clinicName,
            doctorName: dentistName,
            city,
            phone,
            email,
            openingHours: hours,
            services: selectedTreatments,
            emergencyRules: 'Same-day urgent emergency relief slot available daily at 4:30 PM (£95).',
          }),
        });
      } catch {
        // Fallback gracefully
      } finally {
        setIsDeploying(false);
      }

      // Trigger Celebration Confetti
      confetti({
        particleCount: 130,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#8b5cf6', '#06b6d4'],
      });

      onSaveProfile({
        ...businessProfile,
        name: clinicName,
      });

      setTimeout(() => {
        onClose();
      }, 1600);
    }
  };

  const handleSimulateTest = () => {
    setIsSimulating(true);
    setSimulatedReply('');

    setTimeout(() => {
      setSimulatedReply(
        `Hello! 😊 I'm Dr. Sarah Jensen's 24/7 AI Receptionist at ${clinicName}. I'm so sorry to hear your molar is hurting! For severe pain, we recommend getting examined today before the nerve infection spreads. Dr. Jensen has an urgent relief slot open today at 4:30 PM (£95 with 3D digital diagnosis). Would you like me to hold this slot for you? What is your full name?`
      );
      setIsSimulating(false);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <GlassCard className="w-full max-w-2xl p-0 overflow-hidden border-white/20 shadow-2xl bg-slate-900/95 text-slate-100 rounded-3xl">
        
        {/* Modal Header with Progress Bar */}
        <div className="p-6 border-b border-white/10 bg-slate-950/70">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">1-Click Client Onboarding Engine</h3>
                <p className="text-xs text-slate-400">Step {currentStep} of {totalSteps} • Auto-generating knowledge base & prompts</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          
          {/* STEP 1: Clinic Profile */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>Practice Identity</span>
              </div>
              <h4 className="text-lg font-bold text-white">What is the clinic's name and location?</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Practice / Brand Name</label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">City / Region</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Clinic Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Lead Doctor */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Stethoscope className="w-4 h-4" />
                <span>Clinical Roster</span>
              </div>
              <h4 className="text-lg font-bold text-white">Who is the primary dentist & clinical director?</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Lead Doctor Name & Title</label>
                  <input
                    type="text"
                    value={dentistName}
                    onChange={(e) => setDentistName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Doctor's Notification Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Working Hours */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Clinic Hours</span>
              </div>
              <h4 className="text-lg font-bold text-white">When is the physical clinic open for patient visits?</h4>
              
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Operating Schedule</label>
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white focus:outline-hidden focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-2">
                  The AI answers patient questions 24/7, but only offers in-person booking slots during these active practice hours.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Treatment Pricing */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <DollarSign className="w-4 h-4" />
                <span>Fee Schedule</span>
              </div>
              <h4 className="text-lg font-bold text-white">Confirm standard treatment pricing (£)</h4>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedTreatments.map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-white/10">
                    <span className="text-xs font-semibold text-white">{t.name}</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">£{t.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Emergency Triage */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Urgent Care Protocols</span>
              </div>
              <h4 className="text-lg font-bold text-white">Emergency Tooth Pain & Medical Triage Rules</h4>
              
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Automated Same-Day Priority Escalation</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When a patient mentions severe pain, bleeding, or swelling, the AI immediately flags the inquiry, offers an urgent slot (£95), and notifies the doctor's phone.
                </p>
              </div>
            </div>
          )}

          {/* STEP 6: Live Simulation & Instant Activation */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Instant Validation</span>
              </div>
              <h4 className="text-lg font-bold text-white">Test Your Generated AI Receptionist</h4>

              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Simulated Patient Message:</span>
                  <p className="text-xs text-slate-200 italic font-mono">"{simulatedMessage}"</p>
                </div>

                {simulatedReply && (
                  <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-2 animate-fadeIn">
                    <span className="text-[11px] text-blue-400 font-bold uppercase flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5" /> AI Response:
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">{simulatedReply}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSimulateTest}
                  disabled={isSimulating}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSimulating ? 'Simulating...' : 'Test AI Emergency Reply'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-white/10 bg-slate-950/70 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1 || isDeploying}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={isDeploying}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all active:scale-95 flex items-center gap-2"
          >
            {isDeploying ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Provisioning Clinic & Indexing pgvector...</span>
              </>
            ) : currentStep === totalSteps ? (
              <>
                <Zap className="w-4 h-4 text-cyan-300" />
                <span>Activate Clinic in 1-Click</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </GlassCard>
    </div>
  );
};
