import React, { useState, useEffect } from 'react';
import { 
  X, 
  Stethoscope, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  CheckSquare, 
  FileText, 
  Plus, 
  User, 
  AlertCircle,
  CreditCard,
  Lock,
  Download
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';

interface DoctorPatientHistoryModalProps {
  patientId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DoctorPatientHistoryModal: React.FC<DoctorPatientHistoryModalProps> = ({
  patientId,
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newTreatment, setNewTreatment] = useState('Routine Checkup & Fluoride Polish');
  const [newSummary, setNewSummary] = useState('');
  const [newPrivateNotes, setNewPrivateNotes] = useState('');
  const [newFee, setNewFee] = useState(95);

  useEffect(() => {
    if (isOpen && patientId) {
      setIsLoading(true);
      fetch(`/api/v1/patient/doctor/patient/${patientId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setData(d);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setData(null);
    }
  }, [isOpen, patientId]);

  if (!isOpen || !patientId) return null;

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/patient/doctor/patient/${patientId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treatment: newTreatment,
          sharedSummary: newSummary,
          privateClinicalNotes: newPrivateNotes,
          feeGbp: newFee,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setIsAddingNote(false);
        setNewSummary('');
        setNewPrivateNotes('');
        // Re-fetch data
        const updated = await fetch(`/api/v1/patient/doctor/patient/${patientId}`).then((r) => r.json());
        if (updated.success) setData(updated);
      }
    } catch (err) {
      console.error('Failed adding clinical note:', err);
    }
  };

  const patient = data?.patient;
  const upcoming = data?.upcoming;
  const history = data?.history || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Clinical Record & Patient Trail
                </h3>
                <Badge variant="success" size="sm">Verified Patient</Badge>
              </div>
              <p className="text-xs text-slate-400">
                Doctor Inspection View • {patient?.fullName || 'Patient'} ({patient?.email || ''})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
              Loading encrypted patient records...
            </div>
          ) : patient ? (
            <>
              {/* Patient Demographics & Security Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Contact & Identity</span>
                  <p className="text-xs font-bold text-white">{patient.fullName}</p>
                  <p className="text-[11px] font-mono text-slate-300">{patient.phone}</p>
                  <p className="text-[11px] text-slate-400">{patient.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Insurance & Coverage</span>
                  <p className="text-xs font-semibold text-cyan-300">{patient.insuranceProvider || 'Self-Pay'}</p>
                  <p className="text-[11px] font-mono text-slate-400">{patient.insurancePolicyNumber || 'N/A'}</p>
                  <div className="flex gap-1 pt-0.5">
                    {patient.knownAllergies?.map((a: string, i: number) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-300">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Portal Security Status</span>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-xs font-bold text-white">{patient.authProvider.toUpperCase()} SSO</span>
                    <Badge variant={patient.twoFactorEnabled ? 'success' : 'neutral'} size="sm">
                      {patient.twoFactorEnabled ? '2FA Active' : '2FA Off'}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Last active: {new Date(patient.lastLoginAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Upcoming Booking & Checklist Progress */}
              {upcoming && (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold text-white">Upcoming Visit: {upcoming.treatment}</h4>
                    </div>
                    <Badge variant="success">{upcoming.dateStr} • {upcoming.timeStr}</Badge>
                  </div>

                  <div className="text-xs space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-300">Patient's "What to Bring" Readiness:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {upcoming.checklist.map((item: any) => (
                        <div
                          key={item.id}
                          className={`p-2 rounded-xl text-xs flex items-center gap-2 border ${
                            item.isCompleted
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                              : 'bg-slate-900 border-white/10 text-slate-400'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${item.isCompleted ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Clinical Visit Trail */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>Documented Clinical History Trail ({history.length})</span>
                  </h4>

                  <button
                    type="button"
                    onClick={() => setIsAddingNote(!isAddingNote)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingNote ? 'Cancel' : 'Add Clinical Record'}</span>
                  </button>
                </div>

                {/* Add Clinical Note Form */}
                {isAddingNote && (
                  <form onSubmit={handleAddNote} className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">Procedure / Treatment</label>
                        <input
                          type="text"
                          required
                          value={newTreatment}
                          onChange={(e) => setNewTreatment(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">Fee (£ GBP)</label>
                        <input
                          type="number"
                          required
                          value={newFee}
                          onChange={(e) => setNewFee(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Shared Clinical Summary (Visible to Patient)</label>
                      <textarea
                        required
                        rows={2}
                        value={newSummary}
                        onChange={(e) => setNewSummary(e.target.value)}
                        placeholder="Details of procedure performed and oral health status..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Private Doctor Notes (Doctor Eyes Only)</label>
                      <input
                        type="text"
                        value={newPrivateNotes}
                        onChange={(e) => setNewPrivateNotes(e.target.value)}
                        placeholder="Internal notes, teeth numbers to monitor, etc."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all"
                    >
                      Save to Patient's Permanent Trail
                    </button>
                  </form>
                )}

                {/* History Cards */}
                <div className="space-y-3">
                  {history.map((h: any) => (
                    <div key={h.id} className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-400">{h.date}</span>
                          <span className="font-semibold text-white">{h.treatment}</span>
                        </div>
                        <Badge variant="success">Paid £{h.feeGbp}</Badge>
                      </div>

                      <p className="text-slate-300 bg-white/5 p-2.5 rounded-xl border border-white/5">
                        "{h.sharedSummary}"
                      </p>

                      {h.privateClinicalNotes && (
                        <p className="text-amber-300 text-[11px] bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                          🔒 <strong>Private Note:</strong> {h.privateClinicalNotes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Audit Log */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Security Audit Log (HIPAA Verification)</span>
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {patient.securityAuditLog?.map((log: any, i: number) => (
                    <div key={i} className="p-2 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">{log.action}</span>
                      <span className="text-slate-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()} • {log.ipAddress || '127.0.0.1'}</span>
                    </div>
                  ))}
                </div>
              </div>

            </>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">Patient not found.</p>
          )}
        </div>

      </div>
    </div>
  );
};
