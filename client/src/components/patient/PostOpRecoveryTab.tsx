import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HeartPulse,
  Pill,
  ShieldAlert,
  Flame,
  ChevronRight,
  PhoneCall,
  Sparkles,
  Calendar,
  Coffee,
  Check
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';

interface PostOpRecoveryTabProps {
  patientId: string;
  patientName: string;
}

export const PostOpRecoveryTab: React.FC<PostOpRecoveryTabProps> = ({
  patientId,
  patientName,
}) => {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [painScale, setPainScale] = useState<number>(3);
  const [bleedingLevel, setBleedingLevel] = useState<'none' | 'light_spotting' | 'moderate' | 'heavy'>('light_spotting');
  const [swellingLevel, setSwellingLevel] = useState<'none' | 'mild' | 'moderate' | 'severe'>('mild');
  const [tookMedication, setTookMedication] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<any>(null);
  const [emergencyAlertActive, setEmergencyAlertActive] = useState<boolean>(false);

  useEffect(() => {
    fetchPlan();
  }, [patientId]);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/clinical/aftercare/${patientId}`);
      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
        if (data.plan.currentDay) {
          setSelectedDay(data.plan.currentDay);
        }
        if (data.plan.urgentReviewRequired) {
          setEmergencyAlertActive(true);
        }
      }
    } catch (err) {
      console.error('Failed to load aftercare plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionFeedback(null);

    try {
      const res = await fetch('/api/v1/clinical/aftercare/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          dayNumber: selectedDay,
          painScale,
          bleedingLevel,
          swellingLevel,
          tookPrescribedMedication: tookMedication,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmissionFeedback(data);
        if (data.urgentReviewTriggered) {
          setEmergencyAlertActive(true);
        }
        // refresh plan logs
        fetchPlan();
      }
    } catch (err) {
      console.error('Error submitting recovery log:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPainColor = (val: number) => {
    if (val <= 3) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (val <= 6) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10 animate-pulse';
  };

  if (loading && !plan) {
    return (
      <div className="py-16 text-center text-slate-400">
        <Activity className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-400" />
        <p>Loading personalized post-operative recovery protocol...</p>
      </div>
    );
  }

  const defaultProtocol = plan?.protocol || [
    {
      day: 1,
      title: 'Blood Clot Stabilization & Protection',
      guidelines: [
        'Keep sterile gauze in place with firm pressure for 45 minutes.',
        'Apply ice pack to cheek for 20 minutes on, 20 minutes off to minimize swelling.',
        'DO NOT rinse vigorously, spit forcefully, or drink through a straw (protects blood clot).',
        'Eat lukewarm or cold soft foods: yogurt, smoothies, pudding, applesauce.',
      ],
      medicationTiming: 'Take Ibuprofen 600mg every 6 hours with food. Begin Amoxicillin antibiotic course.',
    },
    {
      day: 2,
      title: 'Gentle Saltwater Rinsing & Diet Transition',
      guidelines: [
        'Begin warm saltwater rinses (1/2 tsp salt in 8oz warm water) 3-4 times daily after eating.',
        'Do not brush directly over the surgical site; brush all other teeth normally.',
        'Swelling typically peaks on Day 2-3 and is completely normal.',
      ],
      medicationTiming: 'Continue antibiotic course. Alternate Tylenol & Ibuprofen as needed.',
    },
    {
      day: 3,
      title: 'Peak Swelling Resolution & Muscle Warmth',
      guidelines: [
        'Switch from ice packs to warm moist compresses on cheek to encourage circulation.',
        'Gentle jaw stretching to prevent muscle tightness.',
        'Advance diet to scrambled eggs, mashed potatoes, soft pasta.',
      ],
      medicationTiming: 'Taper pain medication if discomfort has reduced below 4/10.',
    },
    {
      day: 5,
      title: 'Tissue Re-epithelialization & Granulation',
      guidelines: [
        'Continue gentle saltwater rinses after meals.',
        'Check that sutures are intact and no food debris is trapped.',
        'Normal physical activities can be gradually resumed; avoid heavy weightlifting.',
      ],
      medicationTiming: 'Complete full prescribed course of antibiotics even if feeling 100%.',
    },
    {
      day: 7,
      title: 'Final Healing & Suture Check',
      guidelines: [
        'Gums should look light pink with minimal tenderness.',
        'Return for suture removal or routine check-in if advised by clinic.',
      ],
      medicationTiming: 'Antibiotic completion confirmed.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* High Priority Clinical Alert Banner if Pain >= 7 or heavy bleeding */}
      {(emergencyAlertActive || painScale >= 7 || bleedingLevel === 'heavy') && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 via-red-900/60 to-rose-950/80 border-2 border-rose-500/80 shadow-xl shadow-rose-900/20 text-white animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-600 rounded-xl shadow-md shrink-0">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-rose-100">Urgent Clinical Escalation Triggered</span>
                <Badge variant="destructive" className="bg-rose-600 text-white font-semibold">Priority 1 Triage</Badge>
              </div>
              <p className="text-sm text-rose-200 mt-1 leading-relaxed">
                Your reported pain level ({painScale}/10) or bleeding status has automatically notified Dr. Sarah Jensen and our on-call clinical team.
              </p>
              <div className="mt-3 p-3 rounded-xl bg-black/40 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-rose-300">
                  <span className="font-semibold text-rose-100">Immediate Home Protocol:</span> Keep head elevated $\ge 30^\circ$, apply fresh damp gauze with firm biting pressure for 30 mins.
                </div>
                <a
                  href="tel:+15552349911"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all shrink-0"
                >
                  <PhoneCall className="w-4 h-4" />
                  Call Emergency Desk: (555) 234-9911
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Info Banner */}
      <GlassCard className="p-6 border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-cyan-950/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-cyan-500/10 border-cyan-400/30 text-cyan-300 text-xs">
                Post-Operative Care Protocol
              </Badge>
              <span className="text-xs text-slate-400">Dr. Sarah Jensen, DDS • Operatory 3</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {plan?.procedureName || 'Surgical Extraction & Bone Graft (Tooth #19)'}
            </h2>
            <p className="text-sm text-slate-300 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Procedure Date: {plan?.procedureDate || 'September 21, 2026'} &bull; Current Day:
              <span className="font-bold text-cyan-300">Day {selectedDay} of 7</span>
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700/60">
            {[1, 2, 3, 5, 7].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedDay === d
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Day {d}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Main Grid: Left = Day Guidance + Medications, Right = Daily Symptom Check-in */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Guidelines & Medications */}
        <div className="lg:col-span-7 space-y-6">
          {/* Day Milestone Card */}
          <GlassCard className="p-6 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                  D{selectedDay}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {defaultProtocol.find((p: any) => p.day === selectedDay)?.title || `Day ${selectedDay} Recovery Milestones`}
                  </h3>
                  <p className="text-xs text-slate-400">Clinical recovery benchmarks established by surgical team</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs text-cyan-300 border-cyan-500/30">
                Active Protocol
              </Badge>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Care Guidelines</h4>
              <div className="space-y-2">
                {(defaultProtocol.find((p: any) => p.day === selectedDay)?.guidelines || []).map((item: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
              <div className="flex items-center gap-2 text-cyan-300 text-sm font-semibold mb-1">
                <Pill className="w-4 h-4" />
                <span>Medication & Dosage Protocol</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {defaultProtocol.find((p: any) => p.day === selectedDay)?.medicationTiming || 'Continue prescribed antibiotic and anti-inflammatory regimen.'}
              </p>
            </div>
          </GlassCard>

          {/* Do's & Don'ts Checklist */}
          <GlassCard className="p-6 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>Crucial Post-Op Rules (First 72 Hours)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">DO THIS</span>
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2 text-xs text-slate-200">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Bite gently but firmly on gauze if bleeding occurs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Keep head elevated with 2 pillows when resting</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Drink plenty of water and stay hydrated</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">DO NOT DO THIS</span>
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-2 text-xs text-slate-200">
                  <div className="flex items-start gap-2">
                    <Flame className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>NO straws, spitting, or vaping/smoking (causes dry socket)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Flame className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>NO vigorous exercise or hot spicy liquids for 48h</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Flame className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>NO touching the surgery site with fingers or tongue</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Daily Patient Symptom Check-in Form */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard className="p-6 border border-slate-800 bg-slate-900/80">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Daily Recovery Log</h3>
                <p className="text-xs text-slate-400">Monitored 24/7 by clinical triage AI & Dr. Jensen</p>
              </div>
            </div>

            {submissionFeedback && (
              <div className={`p-4 rounded-xl border mb-4 text-xs ${
                submissionFeedback.urgentReviewTriggered
                  ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                  : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              }`}>
                <div className="font-semibold text-sm mb-1">
                  {submissionFeedback.urgentReviewTriggered ? 'Urgent Alert Created' : 'Check-in Recorded!'}
                </div>
                <p>{submissionFeedback.clinicalGuidance}</p>
              </div>
            )}

            <form onSubmit={handleSubmitCheckin} className="space-y-4">
              {/* Pain Scale Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Pain Intensity (1 to 10):
                  </label>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getPainColor(painScale)}`}>
                    {painScale} / 10 - {painScale <= 3 ? 'Mild' : painScale <= 6 ? 'Moderate' : 'Severe'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={painScale}
                  onChange={(e) => setPainScale(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1 (Minimal)</span>
                  <span>5 (Moderate)</span>
                  <span className="text-rose-400 font-semibold">10 (Excruciating)</span>
                </div>
              </div>

              {/* Bleeding Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Bleeding Level:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'light_spotting', label: 'Pink Saliva / Spotting' },
                    { id: 'moderate', label: 'Moderate Oozing' },
                    { id: 'heavy', label: 'Heavy Active Bleeding' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setBleedingLevel(opt.id as any)}
                      className={`p-2 rounded-lg text-xs font-medium border text-left transition-all ${
                        bleedingLevel === opt.id
                          ? opt.id === 'heavy'
                            ? 'bg-rose-500/20 border-rose-500 text-rose-200'
                            : 'bg-cyan-500/20 border-cyan-500 text-cyan-200'
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Swelling Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Swelling Level:</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['none', 'mild', 'moderate', 'severe'] as const).map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSwellingLevel(s)}
                      className={`p-1.5 rounded-lg text-xs font-medium capitalize border text-center transition-all ${
                        swellingLevel === s
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200'
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Took Meds Checkbox */}
              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tookMedication}
                  onChange={(e) => setTookMedication(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-600 focus:ring-cyan-500"
                />
                <span className="text-xs text-slate-200">
                  I have taken my prescribed medication on schedule
                </span>
              </label>

              {/* Additional Symptoms Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Specific symptoms or questions:</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. slight jaw stiffness when chewing soft eggs..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Logging Check-in...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Day {selectedDay} Check-In</span>
                  </>
                )}
              </button>
            </form>

            {/* Check-in History */}
            {plan?.checkinLogs && plan.checkinLogs.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Previous Logs</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {plan.checkinLogs.map((log: any, i: number) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800/80 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-white">Day {log.dayNumber}:</span> Pain {log.painScale}/10 &bull; {log.bleedingLevel}
                        {log.notes && <p className="text-[11px] text-slate-400 italic">"{log.notes}"</p>}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(log.loggedAtIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
