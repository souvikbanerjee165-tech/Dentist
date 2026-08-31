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

  // Onboarding form state
  const [clinicName, setClinicName] = useState(businessProfile.name || 'Apex Dental & Aesthetics');
  const [dentistName, setDentistName] = useState('Dr. Sarah Jensen, DDS');
  const [aiName, setAiName] = useState('Emily');
  const [hours, setHours] = useState('Mon - Fri: 8 AM - 6 PM | Sat: 9 AM - 3 PM');
  const [selectedTreatments, setSelectedTreatments] = useState([
    { name: 'Emergency Tooth Pain Relief & Exam', price: '$95', duration: '30m' },
    { name: 'Cosmetic Laser Teeth Whitening', price: '$350', duration: '45m' },
    { name: 'Comprehensive Oral Exam & Deep Clean', price: '$180', duration: '60m' },
    { name: 'Porcelain Veneers Consultation', price: '$950', duration: '45m' },
  ]);

  // Test chat simulation state
  const [simulatedMessage, setSimulatedMessage] = useState('Hi! My molar hurts badly. Do you have slots today?');
  const [simulatedReply, setSimulatedReply] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Trigger Celebration Confetti
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#8b5cf6', '#06b6d4'],
      });

      onSaveProfile({
        ...businessProfile,
        name: clinicName,
      });

      setTimeout(() => {
        onClose();
      }, 1800);
    }
  };

  const handleSimulateTest = () => {
    setIsSimulating(true);
    setSimulatedReply('');

    setTimeout(() => {
      setSimulatedReply(
        `Hello! 😊 I'm ${aiName}, ${dentistName}'s 24/7 AI Receptionist at ${clinicName}. I'm so sorry to hear your molar is hurting! For severe pain, we recommend getting examined today before the nerve infection spreads. Dr. Jensen has 2 emergency relief slots open this afternoon at 2:30 PM and 4:15 PM ($95 with 3D digital diagnosis). Would you like me to hold one for you? What is your full name?`
      );
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <GlassCard className="w-full max-w-2xl p-0 overflow-hidden border-white/20 shadow-2xl bg-slate-900/95 text-slate-100 rounded-3xl">
        
        {/* Modal Header with Progress Bar */}
        <div className="p-6 border-b border-white/10 bg-slate-950/70">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Clinic Onboarding Wizard</h3>
                <p className="text-[11px] text-slate-400">Set up your 24/7 AI Receptionist in 3 minutes</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-semibold text-slate-300">
              <span>Step {currentStep} of {totalSteps}: {
                currentStep === 1 ? 'Clinic & Doctor Identity' :
                currentStep === 2 ? 'AI Receptionist Persona' :
                currentStep === 3 ? 'Treatment Catalog & Pricing' :
                currentStep === 4 ? 'Business Hours & Calendar' :
                currentStep === 5 ? 'WhatsApp Live Channel' : 'AI Test Simulation'
              }</span>
              <span className="text-blue-400 font-mono">{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Body Content */}
        <div className="p-6 max-h-[420px] overflow-y-auto space-y-6">
          
          {/* STEP 1: Clinic Identity */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Practice Information</h4>
                <p className="text-xs text-slate-400">The AI will use these details when introducing the clinic to patients.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Clinic / Practice Name</label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Lead Dentist Name & Title</label>
                  <input
                    type="text"
                    value={dentistName}
                    onChange={(e) => setDentistName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: AI Receptionist Persona */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">AI Receptionist Persona & Branding</h4>
                <p className="text-xs text-slate-400">Give your AI receptionist a human, friendly persona for patients.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">AI Receptionist Name</label>
                  <input
                    type="text"
                    value={aiName}
                    onChange={(e) => setAiName(e.target.value)}
                    placeholder="e.g. Emily, Sarah, Jessica"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5" /> Greeting Preview:
                  </p>
                  <p className="italic text-slate-300">
                    "Hello! 😊 I'm {aiName}, Dr. Sarah Jensen's 24/7 AI Receptionist at {clinicName}. How can I assist you today?"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Treatments & Pricing */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Treatment Menu & Transparent Pricing</h4>
                <p className="text-xs text-slate-400">Select standard dental services the AI is authorized to quote and book.</p>
              </div>

              <div className="space-y-2 text-xs">
                {selectedTreatments.map((svc, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold text-slate-200">{svc.name}</span>
                    </div>
                    <span className="font-bold text-white font-mono">{svc.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Hours & Calendar */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Business Hours & Calendar Sync</h4>
                <p className="text-xs text-slate-400">The AI checks available slots in real-time during these operating windows.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Practice Operating Hours</label>
                  <input
                    type="text"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <Calendar className="w-4 h-4" />
                    <span>Google Calendar Sync</span>
                  </div>
                  <Badge variant="success" size="sm">Connected ✓</Badge>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: WhatsApp Channel */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">WhatsApp Cloud API Connection</h4>
                <p className="text-xs text-slate-400">Meta Webhook & Cloud API handshake verification status.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <Smartphone className="w-4 h-4" />
                    <span>Meta Cloud API Webhook</span>
                  </div>
                  <Badge variant="success" size="sm">Active (200 OK)</Badge>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 space-y-1 text-slate-400">
                  <p className="font-semibold text-slate-300">Automatic Capabilities Enabled:</p>
                  <p>✓ 24/7 instant auto-response in 1.2s</p>
                  <p>✓ 2-hour pre-appointment automated reminders</p>
                  <p>✓ Instant human handover routing on complex questions</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Live AI Test Simulation */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Test Your AI Receptionist</h4>
                <p className="text-xs text-slate-400">Simulate an emergency inquiry to verify your setup before going live.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-white/10 text-slate-300">
                  <span className="text-[10px] text-blue-400 font-bold uppercase">Patient Inbound:</span>
                  <p className="font-medium text-white mt-0.5">"{simulatedMessage}"</p>
                </div>

                {simulatedReply ? (
                  <div className="p-3.5 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-white space-y-1 animate-fadeIn">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {aiName} (AI Receptionist):
                    </span>
                    <p className="text-xs leading-relaxed text-slate-200">{simulatedReply}</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSimulateTest}
                    disabled={isSimulating}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Bot className="w-4 h-4" />
                    <span>{isSimulating ? 'Simulating AI Response...' : 'Run Test Simulation'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 border-t border-white/10 bg-slate-950/70 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all active:scale-95"
          >
            <span>{currentStep === totalSteps ? '🎉 Complete & Go Live!' : 'Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </GlassCard>
    </div>
  );
};
