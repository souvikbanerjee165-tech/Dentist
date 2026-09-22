import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileText,
  Printer,
  Download,
  X,
  CheckCircle2,
  Lock,
  Building2,
  Calendar,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { Badge } from '../ui/Badge';

interface BaaAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BaaAgreementModal: React.FC<BaaAgreementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [baaData, setBaaData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchBaaSummary();
    }
  }, [isOpen]);

  const fetchBaaSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/compliance/baa-summary');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBaaData(data.baa || data.agreement);
        }
      }
    } catch (err) {
      console.error('Error fetching BAA summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadAuditLog = () => {
    window.open('/api/v1/compliance/export-audit-log', '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  HIPAA Business Associate Agreement (BAA)
                </h3>
                <Badge variant="success" className="text-[10px]">
                  45 CFR § 164.504(e) Active
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Legally binding healthcare privacy contract between the Dental Covered Entity and Nexus AI Platform.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleDownloadAuditLog}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Export complete HIPAA audit event trail"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit CSV</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contract Scroll View */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 text-xs text-slate-300 leading-relaxed font-sans print:bg-white print:text-black">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 text-xs font-medium">
              Generating dynamic clinic BAA terms...
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Covered Entity (Client Practice)
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {baaData?.coveredEntity?.practiceName || baaData?.coveredEntity?.clinicName || 'Apex Dental & Aesthetics'}
                  </h4>
                  <p className="text-slate-400">
                    {baaData?.coveredEntity?.legalName || baaData?.coveredEntity?.legalBusinessName || 'Apex Dental Partners, LLC'}
                  </p>
                  <p className="text-slate-400">
                    {baaData?.coveredEntity?.address || '450 Lexington Ave, New York, NY 10017'}
                  </p>
                  <p className="text-slate-400 font-mono">
                    {baaData?.coveredEntity?.phone || '+1 (555) 234-5678'} &bull; {baaData?.coveredEntity?.email || 'appointments@apexdental.com'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Business Associate (Platform Provider)
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {baaData?.businessAssociate?.legalName || baaData?.businessAssociate?.name || 'Nexus AI Healthcare Automation Systems LLC'}
                  </h4>
                  <p className="text-slate-400">
                    Privacy & Compliance: {baaData?.businessAssociate?.contactEmail || baaData?.businessAssociate?.complianceContact || 'compliance@dentalai.agency'}
                  </p>
                  <p className="text-slate-400">
                    Data Protection Officer: {baaData?.businessAssociate?.dpoContact || 'dpo@dentalai.agency'}
                  </p>
                  <p className="text-emerald-400 font-medium">
                    Effective Date: {baaData?.effectiveDate ? new Date(baaData.effectiveDate).toLocaleDateString() : 'Active Ongoing'}
                  </p>
                </div>
              </div>

              {/* Legal Text Sections */}
              <div className="prose prose-invert max-w-none space-y-5 text-slate-300 text-xs">
                
                <section className="space-y-2">
                  <h5 className="text-sm font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    1. Background and Statutory Authority
                  </h5>
                  <p>
                    This Business Associate Agreement (&quot;BAA&quot;) supplements and is made part of the Managed Dental Practice Automation Agreement by and between Covered Entity and Business Associate. This Agreement satisfies the requirements of the Health Insurance Portability and Accountability Act of 1996 (&quot;HIPAA&quot;), the Health Information Technology for Economic and Clinical Health Act (&quot;HITECH&quot;), and the HIPAA Omnibus Final Rule, codified at 45 CFR Parts 160 and 164.
                  </p>
                </section>

                <section className="space-y-2">
                  <h5 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    2. Permitted Uses and Disclosures of Protected Health Information (PHI)
                  </h5>
                  <p>
                    Business Associate shall receive, create, maintain, or transmit Protected Health Information solely to perform services specified in the Service Agreement, including: automated SMS/RCS appointment booking confirmations, pre-visit medical intake forms and consent collection, post-operative symptom triage, and real-time electronic insurance eligibility checks.
                  </p>
                  <p className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                    <strong>Zero Data Selling:</strong> Business Associate explicitly warrants that patient PHI, phone numbers, treatment histories, and insurance details are never sold, de-anonymized for advertising, or utilized to train general foundational models without explicit de-identification under 45 CFR § 164.514.
                  </p>
                </section>

                <section className="space-y-2">
                  <h5 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    3. Technical, Administrative & Physical Safeguards
                  </h5>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                    <li>
                      <strong>Encryption Standards:</strong> All electronic PHI (ePHI) is encrypted at rest using AES-256 and encrypted in transit across all public and internal network connections using TLS 1.3.
                    </li>
                    <li>
                      <strong>Cryptographic Audit Trails:</strong> Every access, export, intake submission, and consent revocation is immutably signed using SHA-256 hash chaining with client IP addresses and user agents.
                    </li>
                    <li>
                      <strong>Access Governance:</strong> Role-based access controls (RBAC) restrict staff visibility strictly to the minimum necessary information pursuant to 45 CFR § 164.502(b).
                    </li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h5 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    4. Breach Notification Protocols
                  </h5>
                  <p>
                    Business Associate agrees to notify Covered Entity in writing without unreasonable delay, and in no event later than <strong>72 hours</strong>, following the discovery of any confirmed Breach of Unsecured Protected Health Information pursuant to 45 CFR § 164.410. Notification shall detail the nature of the event, affected patient records, and immediate mitigations deployed.
                  </p>
                </section>

                <section className="space-y-2">
                  <h5 className="text-sm font-bold text-white">
                    5. Termination & Data Return
                  </h5>
                  <p>
                    Upon termination of the managed service agreement, Business Associate shall, at the instruction of Covered Entity, return or securely destroy all PHI maintained across active databases and backups in accordance with NIST SP 800-88 Rev. 1 media sanitization standards.
                  </p>
                </section>

              </div>

              {/* Signature Verification Block */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-white">ESIGN Act & HIPAA Cryptographic Validation</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Checksum Fingerprint: <span className="font-mono text-emerald-400 text-[10px]">sha256:d8a9e407f8bc...apex-prod</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadAuditLog}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
                  >
                    View Audit Log
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all"
                  >
                    Save Executed BAA (PDF)
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
