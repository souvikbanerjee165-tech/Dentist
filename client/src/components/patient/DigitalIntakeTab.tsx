import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  Camera, 
  Upload, 
  Lock, 
  Edit3, 
  CheckSquare, 
  Square,
  Activity,
  Heart,
  Pill,
  CreditCard,
  Building2,
  Clock,
  UserCheck
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';

interface DigitalIntakeTabProps {
  patientId: string;
  patientName: string;
  token?: string;
  onIntakeCompleted?: () => void;
}

export const DigitalIntakeTab: React.FC<DigitalIntakeTabProps> = ({
  patientId,
  patientName,
  onIntakeCompleted,
}) => {
  const [activeSubSection, setActiveSubSection] = useState<'history' | 'insurance' | 'screening' | 'signature'>('history');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Medical History State
  const [medications, setMedications] = useState('Vitamin D3 2000 IU, Cetirizine 10mg');
  const [chronicConditions, setChronicConditions] = useState<string[]>(['Mild Asthma']);
  const [allergies, setAllergies] = useState<string[]>(['Penicillin (Hives)']);
  const [hasHeartMurmur, setHasHeartMurmur] = useState(false);
  const [takesBloodThinners, setTakesBloodThinners] = useState(false);
  const [emergencyName, setEmergencyName] = useState('Carlos Martinez');
  const [emergencyPhone, setEmergencyPhone] = useState('+1 (555) 987-6543');
  const [emergencyRelation, setEmergencyRelation] = useState('Spouse');

  // Insurance & RTE State
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [cardData, setCardData] = useState<any>({
    payerName: 'Delta Dental PPO',
    payerId: '00430',
    memberId: 'DD-984210984',
    groupNumber: 'GRP-NYC-8841',
    subscriberName: patientName,
  });
  const [rteReport, setRteReport] = useState<any>(null);

  // E-Signature State
  const [signatureType, setSignatureType] = useState<'type' | 'draw'>('type');
  const [typedSignature, setTypedSignature] = useState(patientName);
  const [hipaaConsent, setHipaaConsent] = useState(true);
  const [treatmentConsent, setTreatmentConsent] = useState(true);
  const [financialConsent, setFinancialConsent] = useState(true);
  const [intakeCompleted, setIntakeCompleted] = useState(false);

  useEffect(() => {
    // Fetch existing intake data if already submitted
    const loadIntake = async () => {
      try {
        const res = await fetch(`/api/v1/clinical/intake/${patientId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.intake) {
            setIntakeCompleted(true);
            setTypedSignature(data.intake.signature?.signedByFullName || patientName);
          }
        }
        const insRes = await fetch(`/api/v1/financial/insurance/${patientId}`);
        if (insRes.ok) {
          const insData = await insRes.json();
          if (insData.data?.rteReport) {
            setRteReport(insData.data.rteReport);
            if (insData.data.card) setCardData(insData.data.card);
          }
        }
      } catch (err) {
        console.warn('Could not load existing intake record:', err);
      }
    };
    loadIntake();
  }, [patientId, patientName]);

  const toggleCondition = (cond: string) => {
    setChronicConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const toggleAllergy = (allergy: string) => {
    setAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  const handleScanCard = async () => {
    setIsScanningOcr(true);
    try {
      const ocrRes = await fetch('/api/v1/financial/insurance/scan-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, patientFullName: patientName }),
      });
      const ocrJson = await ocrRes.json();
      if (ocrJson.card) {
        setCardData(ocrJson.card);

        // Run RTE verification
        const rteRes = await fetch('/api/v1/financial/insurance/rte-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId, card: ocrJson.card }),
        });
        const rteJson = await rteRes.json();
        if (rteJson.report) {
          setRteReport(rteJson.report);
        }
      }
    } catch (err) {
      console.error('OCR scan failed:', err);
    } finally {
      setIsScanningOcr(false);
    }
  };

  const handleSubmitIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hipaaConsent || !treatmentConsent) {
      alert('Please agree to the HIPAA Privacy Notice and Treatment Consent.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/clinical/intake/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          patientFullName: patientName,
          medicalHistory: {
            currentMedications: medications.split(',').map((m) => m.trim()).filter(Boolean),
            chronicConditions,
            allergies,
            pastSurgeries: ['Wisdom Tooth Extraction (2021)'],
            hasHeartMurmurOrValveReplacement: hasHeartMurmur,
            takesBloodThinners,
            emergencyContactName: emergencyName,
            emergencyContactPhone: emergencyPhone,
            emergencyContactRelation: emergencyRelation,
          },
          hipaaAcknowledged: hipaaConsent,
          treatmentConsentAcknowledged: treatmentConsent,
          financialAgreementAcknowledged: financialConsent,
          signatureType,
          signatureData: typedSignature,
        }),
      });

      if (res.ok) {
        setIntakeCompleted(true);
        setSuccessMessage('Medical history & legal e-signature successfully saved! Clipboard eliminated.');
        onIntakeCompleted?.();
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed submitting intake:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">
              Digital Medical Intake & Pre-Visit Verification
            </h3>
            {intakeCompleted ? (
              <Badge variant="success" size="sm">
                Verified & E-Signed
              </Badge>
            ) : (
              <Badge variant="warning" size="sm">
                Action Required
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete your clinical paperwork and insurance verification from your device so you can walk straight into Operatory 3.
          </p>
        </div>

        {/* Sub Navigation Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-white/10 text-xs">
          <button
            onClick={() => setActiveSubSection('history')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSubSection === 'history' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Medical History
          </button>
          <button
            onClick={() => setActiveSubSection('insurance')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSubSection === 'insurance' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Insurance & RTE
          </button>
          <button
            onClick={() => setActiveSubSection('signature')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSubSection === 'signature' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            E-Sign & Consent
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 1. Medical History Section */}
      {activeSubSection === 'history' && (
        <GlassCard className="p-6 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Systemic Medical History & Prescriptions</h4>
              <p className="text-xs text-slate-400">Dr. Sarah Jensen references these during procedure anesthetic selection.</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Medications */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-blue-400" /> Current Medications & Supplements
              </label>
              <textarea
                rows={2}
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="e.g. Lisinopril 10mg daily, Multivitamins, Baby Aspirin 81mg"
                className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            {/* Chronic Conditions Multi-Select */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-300 block">Chronic Conditions (Check all that apply):</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Hypertension (High Blood Pressure)',
                  'Type 2 Diabetes',
                  'Mild Asthma',
                  'Bleeding / Clotting Disorder',
                  'Acid Reflux (GERD)',
                  'Artificial Heart Valve / Joint',
                ].map((cond) => {
                  const active = chronicConditions.includes(cond);
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => toggleCondition(cond)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        active
                          ? 'bg-blue-600/20 border-blue-500 text-white font-bold ring-1 ring-blue-500'
                          : 'bg-slate-950 border-white/10 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      {active ? (
                        <CheckSquare className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      )}
                      <span className="text-[11px] truncate">{cond}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drug Allergies */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-300 block">Allergies to Medications or Materials:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Penicillin (Hives)', 'Latex', 'Local Anesthetic (Lidocaine)', 'Sulfa Drugs', 'Codeine', 'Aspirin'].map(
                  (allergy) => {
                    const active = allergies.includes(allergy);
                    return (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => toggleAllergy(allergy)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          active
                            ? 'bg-rose-600/20 border-rose-500 text-white font-bold ring-1 ring-rose-500'
                            : 'bg-slate-950 border-white/10 text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        {active ? (
                          <CheckSquare className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        )}
                        <span className="text-[11px] truncate">{allergy}</span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400 text-[11px]">Emergency Contact Name</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 text-[11px]">Relationship</label>
                <input
                  type="text"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 text-[11px]">Contact Phone</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setActiveSubSection('insurance')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all"
            >
              Continue to Insurance Verification ➔
            </button>
          </div>
        </GlassCard>
      )}

      {/* 2. Insurance & Real-Time Eligibility (RTE) Section */}
      {activeSubSection === 'insurance' && (
        <GlassCard className="p-6 space-y-6 border-indigo-500/20 bg-indigo-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">OCR Insurance Card & Real-Time Eligibility (RTE)</h4>
                <p className="text-xs text-slate-400">Direct 270/271 clearinghouse gateway (Change Healthcare / Stedi).</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleScanCard}
              disabled={isScanningOcr}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{isScanningOcr ? 'Scanning Card OCR...' : 'Scan / Refresh Card'}</span>
            </button>
          </div>

          {/* Card Details & Extracted OCR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Payer Name</span>
              <span className="font-bold text-white text-sm">{cardData.payerName}</span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">Payer ID: {cardData.payerId}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Member ID</span>
              <span className="font-mono font-bold text-white text-sm">{cardData.memberId}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Group: {cardData.groupNumber}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Subscriber</span>
              <span className="font-bold text-white text-sm">{cardData.subscriberName}</span>
              <span className="text-[10px] text-cyan-400 block mt-0.5">Relationship: Self</span>
            </div>
          </div>

          {/* Real-Time Eligibility Breakdown Card */}
          {rteReport && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white text-xs">Coverage Verified: {rteReport.networkStatus}</span>
                </div>
                <Badge variant="success" size="sm">
                  Active Coverage
                </Badge>
              </div>

              {/* Deductibles & Limits Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Individual Deductible</span>
                  <span className="font-bold text-white">${rteReport.individualDeductibleTotal}</span>
                  <span className="text-[10px] text-emerald-400 block">Met: ${rteReport.individualDeductibleMet}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Annual Benefit Max</span>
                  <span className="font-bold text-white">${rteReport.annualMaximumBenefit}</span>
                  <span className="text-[10px] text-cyan-400 block">Rem: ${rteReport.annualBenefitRemaining}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Preventive Copay</span>
                  <span className="font-bold text-emerald-400">0% (100% Covered)</span>
                  <span className="text-[10px] text-slate-400 block">Exams & Cleanings</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Basic / Major Copay</span>
                  <span className="font-bold text-white">20% / 50%</span>
                  <span className="text-[10px] text-slate-400 block">Fillings / Crowns</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                EDI Transaction Reference: <span className="font-mono text-slate-300">{rteReport.transactionId}</span> • Verified via Change Healthcare.
              </p>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveSubSection('history')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
            >
              Back to Medical History
            </button>
            <button
              type="button"
              onClick={() => setActiveSubSection('signature')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all"
            >
              Continue to Legal E-Signature ➔
            </button>
          </div>
        </GlassCard>
      )}

      {/* 3. Legal E-Signature & Consent Section */}
      {activeSubSection === 'signature' && (
        <form onSubmit={handleSubmitIntake} className="space-y-6">
          <GlassCard className="p-6 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Legal E-Signature & Statutory Disclosures</h4>
                <p className="text-xs text-slate-400">Legally binding electronic signature under the Federal ESIGN Act.</p>
              </div>
            </div>

            {/* Regulatory Consent Checkboxes */}
            <div className="space-y-2.5 text-xs">
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-white/10 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hipaaConsent}
                  onChange={(e) => setHipaaConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500/40 shrink-0"
                />
                <span className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-white">HIPAA Privacy Rule Notice:</strong> I acknowledge receipt of the Apex Dental Care Notice of Privacy Practices and authorize the release of medical/dental records necessary to process insurance claims.
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-white/10 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={treatmentConsent}
                  onChange={(e) => setTreatmentConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500/40 shrink-0"
                />
                <span className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-white">Informed Treatment Consent:</strong> I authorize Dr. Sarah Jensen, DDS and clinical associates to perform diagnostic examinations, digital radiographs, and agreed-upon dental care.
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-white/10 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={financialConsent}
                  onChange={(e) => setFinancialConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500/40 shrink-0"
                />
                <span className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-white">Financial Responsibility Agreement:</strong> I understand I am financially responsible for all charges not covered by my dental insurance plan, including copays and deductibles.
                </span>
              </label>
            </div>

            {/* Legal Signature Input */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/15 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-400" /> Type Full Legal Name as E-Signature
                </label>
                <Badge variant="primary" size="sm">
                  ESIGN Act Compliant
                </Badge>
              </div>

              <input
                type="text"
                required
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                placeholder="e.g. Sophia Martinez"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white font-serif text-base italic focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Signed as: {typedSignature}</span>
                <span>Date: {new Date().toLocaleDateString()}</span>
                <span>SHA-256 Audit Fingerprint: Active</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setActiveSubSection('insurance')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !typedSignature}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs shadow-xl shadow-emerald-500/25 transition-all active:scale-95 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Securing & Encrypting...' : 'Submit & Complete Digital Intake'}</span>
              </button>
            </div>
          </GlassCard>
        </form>
      )}

    </div>
  );
};
