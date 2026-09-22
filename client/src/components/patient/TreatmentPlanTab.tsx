import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  CreditCard,
  Calculator,
  Calendar,
  Sparkles,
  Lock,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Percent
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';

interface TreatmentPlanTabProps {
  patientId: string;
  patientName: string;
}

export const TreatmentPlanTab: React.FC<TreatmentPlanTabProps> = ({
  patientId,
  patientName,
}) => {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);
  const [selectedPhases, setSelectedPhases] = useState<number[]>([1]);
  const [typedSignature, setTypedSignature] = useState(patientName);
  const [isSubmittingAcceptance, setIsSubmittingAcceptance] = useState(false);
  const [acceptanceMessage, setAcceptanceMessage] = useState<string | null>(null);

  // BNPL Calculator State
  const [bnplTerm, setBnplTerm] = useState<number>(12);
  const [bnplProvider, setBnplProvider] = useState<'carecredit' | 'cherry' | 'sunbit'>('cherry');
  const [bnplPlans, setBnplPlans] = useState<any[]>([]);

  // Copay Pre-authorization
  const [isAuthorizingCopay, setIsAuthorizingCopay] = useState(false);
  const [copayAuthorized, setCopayAuthorized] = useState(false);

  useEffect(() => {
    fetchPlan();
  }, [patientId]);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/financial/treatment-plan/${patientId}`);
      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
        // calculate initial BNPL for patient OOP
        fetchBnpl(data.plan.summary?.patientOutOfPocket || 1200);
      }
    } catch (err) {
      console.error('Error fetching treatment plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBnpl = async (amount: number) => {
    try {
      const res = await fetch(`/api/v1/financial/bnpl/calculate?amount=${amount}`);
      const data = await res.json();
      if (data.success && data.options) {
        setBnplPlans(data.options);
      }
    } catch (err) {
      console.error('Failed to calculate BNPL financing:', err);
    }
  };

  const handleTogglePhase = (phaseNum: number) => {
    if (selectedPhases.includes(phaseNum)) {
      if (selectedPhases.length === 1) return; // Keep at least one
      setSelectedPhases(selectedPhases.filter((p) => p !== phaseNum));
    } else {
      setSelectedPhases([...selectedPhases, phaseNum].sort());
    }
  };

  const handleAcceptPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedSignature.trim()) return;

    setIsSubmittingAcceptance(true);
    setAcceptanceMessage(null);

    try {
      const res = await fetch('/api/v1/financial/treatment-plan/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          phaseNumbers: selectedPhases,
          signedName: typedSignature,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAcceptanceMessage(data.message);
        fetchPlan();
      }
    } catch (err) {
      console.error('Failed to accept treatment plan:', err);
    } finally {
      setIsSubmittingAcceptance(false);
    }
  };

  const handlePreAuthorizeCopay = async () => {
    setIsAuthorizingCopay(true);
    try {
      const oop = plan?.summary?.patientOutOfPocket || 250;
      const res = await fetch('/api/v1/financial/copay/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          treatmentName: 'Phase 1 Clinical Procedures Copay Hold',
          amount: oop > 300 ? 150 : oop, // Initial copay deposit hold
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCopayAuthorized(true);
      }
    } catch (err) {
      console.error('Failed to authorize copay:', err);
    } finally {
      setIsAuthorizingCopay(false);
    }
  };

  if (loading && !plan) {
    return (
      <div className="py-16 text-center text-slate-400">
        <DollarSign className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-400" />
        <p>Loading personalized clinical treatment plan & insurance benefits...</p>
      </div>
    );
  }

  const selectedPhasesTotalOOP = (plan?.phases || [])
    .filter((ph: any) => selectedPhases.includes(ph.phaseNumber))
    .reduce((sum: number, ph: any) => sum + ph.patientTotal, 0);

  const selectedPhasesInsCoverage = (plan?.phases || [])
    .filter((ph: any) => selectedPhases.includes(ph.phaseNumber))
    .reduce((sum: number, ph: any) => sum + ph.insuranceTotal, 0);

  const selectedBnplOption = bnplPlans.find((b) => b.providerId === bnplProvider && b.termMonths === bnplTerm) || bnplPlans[0];

  return (
    <div className="space-y-6">
      {/* Overview Financial Summary Card */}
      <GlassCard className="p-6 border border-emerald-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-emerald-950/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-emerald-500/10 border-emerald-400/30 text-emerald-300 text-xs">
                Comprehensive Treatment Plan
              </Badge>
              <span className="text-xs text-slate-400">Prepared by Dr. Sarah Jensen, DDS</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Phased Clinical & Restorative Proposal
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Real-time cross-referenced with your <span className="font-semibold text-emerald-400">{plan?.insurancePayerName || 'Delta Dental PPO'}</span> benefits.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
            <div className="text-right">
              <div className="text-xs text-slate-400">Total Treatment Fee</div>
              <div className="text-lg font-bold text-slate-200">
                ${plan?.summary?.totalCost?.toLocaleString() || '3,450'}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-right">
              <div className="text-xs text-emerald-400 font-semibold">Insurance Covers</div>
              <div className="text-lg font-bold text-emerald-400">
                -${plan?.summary?.insuranceEstimatedCoverage?.toLocaleString() || '1,850'}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-right">
              <div className="text-xs text-cyan-400 font-semibold">Your Responsibility</div>
              <div className="text-xl font-extrabold text-cyan-300">
                ${plan?.summary?.patientOutOfPocket?.toLocaleString() || '1,600'}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Main Grid: Left = Phases & CDT Items, Right = E-Signature & BNPL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Phased Treatment Items */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Recommended Treatment Phases</span>
            </h3>
            <span className="text-xs text-slate-400">
              Select phases to accept for scheduling
            </span>
          </div>

          {(plan?.phases || []).map((phase: any) => {
            const isSelected = selectedPhases.includes(phase.phaseNumber);
            const isAccepted = phase.status === 'accepted';

            return (
              <GlassCard
                key={phase.phaseNumber}
                className={`p-5 border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500/50 bg-slate-900/90 shadow-lg shadow-emerald-500/5'
                    : 'border-slate-800 bg-slate-900/50 opacity-80 hover:opacity-100'
                }`}
                onClick={() => handleTogglePhase(phase.phaseNumber)}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Handled by card click
                      className="mt-1 w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          Phase {phase.phaseNumber}
                        </span>
                        <h4 className="text-base font-bold text-white">{phase.phaseName}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{phase.description}</p>
                    </div>
                  </div>

                  <Badge
                    variant={isAccepted ? 'default' : 'outline'}
                    className={`text-xs ${
                      isAccepted
                        ? 'bg-emerald-600 text-white'
                        : 'border-slate-700 text-slate-400'
                    }`}
                  >
                    {isAccepted ? 'Accepted & Scheduled' : 'Pending Patient Decision'}
                  </Badge>
                </div>

                {/* CDT Line Items Table */}
                <div className="space-y-2 mt-4 pt-3 border-t border-slate-800">
                  <div className="grid grid-cols-12 text-[11px] font-semibold uppercase text-slate-500 px-2">
                    <span className="col-span-3">Code / Tooth</span>
                    <span className="col-span-5">Procedure</span>
                    <span className="col-span-2 text-right">Insurance</span>
                    <span className="col-span-2 text-right">You Pay</span>
                  </div>

                  {(phase.items || []).map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 items-center text-xs p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="col-span-3 font-mono text-cyan-300">
                        <span className="font-semibold">{item.cdtCode}</span>
                        {item.toothNumber && (
                          <span className="text-slate-400 ml-1.5 text-[11px]">#{item.toothNumber}</span>
                        )}
                      </div>
                      <div className="col-span-5 text-slate-200 truncate pr-2" title={item.description}>
                        {item.description}
                      </div>
                      <div className="col-span-2 text-right text-emerald-400 font-mono">
                        ${item.estimatedInsurance}
                      </div>
                      <div className="col-span-2 text-right text-white font-mono font-bold">
                        ${item.patientPortion}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Phase Summary Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                  <span>Estimated Appointments: <strong className="text-white">{phase.estimatedVisits || 1} visit(s)</strong></span>
                  <div className="flex items-center gap-3 font-mono">
                    <span>Phase Total: <strong className="text-slate-200">${phase.phaseTotal}</strong></span>
                    <span className="text-cyan-300 font-bold">Your OOP: ${phase.patientTotal}</span>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Right Column: E-Signature Acceptance & BNPL Financing */}
        <div className="lg:col-span-5 space-y-6">
          {/* Digital Phase Acceptance Form */}
          <GlassCard className="p-6 border border-slate-800 bg-slate-900/80">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Accept & Schedule Phase(s)</h3>
                <p className="text-xs text-slate-400">ESIGN Act Compliant Legal Authorization</p>
              </div>
            </div>

            {acceptanceMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs mb-4 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{acceptanceMessage}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2 mb-4 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Selected Phases:</span>
                <span className="font-bold text-white">
                  {selectedPhases.map((p) => `Phase ${p}`).join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Insurance Estimated Benefit:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  ${selectedPhasesInsCoverage.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-slate-700/60">
                <span className="font-semibold text-white">Total Out-of-Pocket:</span>
                <span className="font-extrabold text-cyan-300 font-mono">
                  ${selectedPhasesTotalOOP.toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleAcceptPlan} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Type Legal Name to Sign:</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> SHA-256 Fingerprint
                  </span>
                </label>
                <input
                  type="text"
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  placeholder="e.g. Sophia Martinez"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-signature text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed">
                By signing, I authorize Dr. Sarah Jensen to proceed with selected phases and confirm understanding of estimated insurance benefits and copay responsibilities.
              </div>

              <button
                type="submit"
                disabled={isSubmittingAcceptance || !typedSignature.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                {isSubmittingAcceptance ? (
                  <span>Securing Electronic Signature...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize & Accept Selected Phases</span>
                  </>
                )}
              </button>
            </form>
          </GlassCard>

          {/* Card-on-File Copay Pre-Authorization */}
          <GlassCard className="p-6 border border-slate-800 bg-slate-900/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Pre-Authorized Copay Checkout</h3>
                  <p className="text-xs text-slate-400">Depart effortlessly without queueing at billing</p>
                </div>
              </div>
              {copayAuthorized && (
                <Badge variant="default" className="bg-cyan-600 text-white text-xs">
                  Active Hold
                </Badge>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-6 bg-slate-700 rounded flex items-center justify-center text-[10px] font-bold text-slate-300">
                  VISA
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">•••• •••• •••• 4242</div>
                  <div className="text-[10px] text-slate-400">Expires 08/29 &bull; Saved on File</div>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-semibold">Verified</span>
            </div>

            <button
              type="button"
              disabled={isAuthorizingCopay || copayAuthorized}
              onClick={handlePreAuthorizeCopay}
              className={`w-full py-2.5 rounded-xl font-semibold text-xs border transition-all flex items-center justify-center gap-2 ${
                copayAuthorized
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
              }`}
            >
              {copayAuthorized ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Copay Pre-Authorized ($150 Hold Active)</span>
                </>
              ) : isAuthorizingCopay ? (
                <span>Authorizing Card...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Pre-Authorize Copay for 1-Click Departure</span>
                </>
              )}
            </button>
          </GlassCard>

          {/* BNPL 0% APR Financing Calculator */}
          <GlassCard className="p-6 border border-slate-800 bg-slate-900/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">0% APR Patient Financing</h3>
                  <p className="text-xs text-slate-400">Soft credit check &bull; 85%+ Instant approval</p>
                </div>
              </div>
              <Badge variant="outline" className="border-purple-500/40 text-purple-300 text-xs">
                No Prepayment Fee
              </Badge>
            </div>

            {/* Provider Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { id: 'cherry', name: 'Cherry', tag: 'Fastest (85%)' },
                { id: 'carecredit', name: 'CareCredit', tag: '0% 24 Mo' },
                { id: 'sunbit', name: 'Sunbit', tag: 'Flexible' },
              ].map((prov) => (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() => setBnplProvider(prov.id as any)}
                  className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                    bnplProvider === prov.id
                      ? 'bg-purple-500/20 border-purple-500 text-purple-200'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div>{prov.name}</div>
                  <div className="text-[10px] text-purple-400 font-normal">{prov.tag}</div>
                </button>
              ))}
            </div>

            {/* Term Selection */}
            <div className="space-y-2 mb-4">
              <label className="text-xs font-semibold text-slate-300">Repayment Term:</label>
              <div className="grid grid-cols-3 gap-2">
                {[6, 12, 24].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setBnplTerm(t)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                      bnplTerm === t
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t} Months (0% APR)
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Calculation Banner */}
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-center">
              <div className="text-xs text-purple-300">Estimated Monthly Payment</div>
              <div className="text-3xl font-extrabold text-white my-1">
                ${Math.round(selectedPhasesTotalOOP / bnplTerm)}
                <span className="text-sm font-normal text-slate-400">/mo</span>
              </div>
              <div className="text-[11px] text-purple-300/80">
                Total financed: ${selectedPhasesTotalOOP} across {bnplTerm} equal monthly installments at 0% APR.
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
