import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Users, 
  Key, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Database,
  ExternalLink
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';

export const SecurityCenterPage: React.FC = () => {
  const [auditLogs] = useState([
    {
      id: 'LOG-891',
      timestamp: '2 mins ago',
      actor: 'AI Receptionist (Emily)',
      action: 'APPOINTMENT_BOOKED',
      details: 'Sophia Martinez • Cosmetic Laser Whitening ($350) for Friday 3 PM',
      confidence: '96%',
      status: 'Verified & Logged',
    },
    {
      id: 'LOG-890',
      timestamp: '14 mins ago',
      actor: 'Meta Webhook Gateway',
      action: 'IDEMPOTENCY_GUARD',
      details: 'Duplicate wamid intercepted & suppressed (Zero side effects)',
      confidence: '100%',
      status: 'Blocked Duplicate',
    },
    {
      id: 'LOG-889',
      timestamp: '35 mins ago',
      actor: 'Validation Engine',
      action: 'PAST_DATE_REJECTED',
      details: 'Refused booking for past date 2020-05-15 (Zero DB write)',
      confidence: '90%',
      status: 'Enforced Rule',
    },
    {
      id: 'LOG-888',
      timestamp: '1 hour ago',
      actor: 'AI Receptionist (Emily)',
      action: 'HUMAN_TAKEOVER_ROUTED',
      details: 'Marcus Sterling asked complex bone graft question (42% conf.)',
      confidence: '42%',
      status: 'Handed to Staff',
    },
  ]);

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Log ID,Timestamp,Actor,Action,Details,Confidence,Status\n"
      + auditLogs.map(e => `"${e.id}","${e.timestamp}","${e.actor}","${e.action}","${e.details}","${e.confidence}","${e.status}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `clinical_audit_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <span>Security, Trust & Compliance Center</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            HIPAA-grade data protection, Role-Based Access Control (RBAC), and immutable audit logging.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 dark:bg-white/5 hover:bg-white/15 border border-black/10 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white transition-all shadow-sm active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* 4 Trust & Compliance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Data Encryption', desc: 'AES-256 at rest & TLS 1.3 in transit', icon: Lock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { title: 'Row Level Security', desc: 'Supabase RLS active on all tenant tables', icon: Database, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { title: 'Meta HMAC Guard', desc: 'SHA-256 Webhook signature verified', icon: Key, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { title: 'Compliance Ready', desc: 'HIPAA, GDPR & ADA patient privacy ready', icon: ShieldCheck, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
        ].map((item, i) => (
          <GlassCard key={i} className="p-4 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}>
                <item.icon className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
          </GlassCard>
        ))}
      </div>

      {/* Role-Based Access Control (RBAC) */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Role-Based Access Control (RBAC) Permissions
            </h3>
          </div>
          <Badge variant="primary" size="sm">3 Active Roles</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white">👑 Practice Owner</h4>
              <Badge variant="success" size="sm">Full Access</Badge>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Can view ROI metrics, edit billing, manage doctors, configure WhatsApp keys, and export data.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white">🦷 Dentist / Clinician</h4>
              <Badge variant="primary" size="sm">Clinical Access</Badge>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Can view assigned patient appointments, clinical notes, treatment preferences, and calendar slots.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white">👩 Receptionist / Staff</h4>
              <Badge variant="neutral" size="sm">Front-Desk</Badge>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Can perform 1-click Human Takeover, message patients directly on WhatsApp, and reschedule slots.</p>
          </div>
        </div>
      </GlassCard>

      {/* Immutable Diagnostic Audit Trail */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Clinical AI Decision Audit Trail
              </h3>
              <p className="text-xs text-slate-400">Chronological record of every AI decision, schema validation, and database execution.</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/10 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-3">Log ID</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3">Actor / Subsystem</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Details</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">{log.id}</td>
                  <td className="py-3 px-3 text-slate-400 text-[11px]">{log.timestamp}</td>
                  <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">{log.actor}</td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300 text-[11px] max-w-xs truncate">{log.details}</td>
                  <td className="py-3 px-3 font-mono font-semibold text-emerald-500">{log.confidence}</td>
                  <td className="py-3 px-3 text-right">
                    <Badge variant="success" size="sm">{log.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

    </div>
  );
};
