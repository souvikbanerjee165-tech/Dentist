import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Filter, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  UserPlus, 
  MessageSquare,
  Users
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Lead, LeadStatus, NavigationTab } from '../types';

interface LeadsPageProps {
  leads: Lead[];
  onSelectTab: (tab: NavigationTab) => void;
}

export const LeadsPage: React.FC<LeadsPageProps> = ({ leads, onSelectTab }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.fullName.toLowerCase().includes(search.toLowerCase()) ||
      lead.phoneNumber.includes(search) ||
      (lead.email && lead.email.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'booked':
        return <Badge variant="success" dot size="sm">Booked Appointment</Badge>;
      case 'qualified':
        return <Badge variant="primary" dot size="sm">Qualified Prospect</Badge>;
      case 'new':
        return <Badge variant="purple" size="sm">New Inquiry</Badge>;
      case 'unresponsive':
        return <Badge variant="neutral" size="sm">Unresponsive</Badge>;
      case 'lost':
        return <Badge variant="danger" size="sm">Lost</Badge>;
    }
  };

  const handleExportCSV = () => {
    const headers = ['Full Name', 'Phone Number', 'Email', 'Status', 'Source', 'Last Interaction'];
    const rows = filteredLeads.map((l) => [
      l.fullName,
      l.phoneNumber,
      l.email || '',
      l.status,
      l.source,
      l.lastInteraction,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'whatsapp_leads_crm.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header with Search and Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Leads & Prospects CRM
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automatically captured, qualified, and tagged by AI from WhatsApp messages
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard className="p-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['all', 'booked', 'qualified', 'new', 'unresponsive'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`
                px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all shrink-0
                ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }
              `}
            >
              {status}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Leads Table */}
      {filteredLeads.length > 0 ? (
        <div className="rounded-3xl overflow-hidden border border-black/5 dark:border-white/10 backdrop-blur-xl bg-white/70 dark:bg-slate-950/50 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Lead / Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Extracted Preferences</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4">Last Activity</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 text-xs text-slate-700 dark:text-slate-300">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-blue-500/5 dark:hover:bg-blue-500/5 transition-colors duration-150"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                          {lead.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {lead.fullName}
                          </p>
                          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono mt-0.5">
                            <span>{lead.phoneNumber}</span>
                            {lead.email && <span>• {lead.email}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {getStatusBadge(lead.status)}
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <div className="space-y-1">
                        {Object.entries(lead.customData).map(([k, v]) => (
                          <span
                            key={k}
                            className="inline-block mr-1.5 mb-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium"
                          >
                            <strong className="text-slate-500">{k}:</strong> {String(v)}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      {lead.source}
                    </td>

                    <td className="py-4 px-4 text-slate-400 text-[11px]">
                      {lead.lastInteraction}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => onSelectTab('conversations')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-all active:scale-95"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No leads match your filter"
          description="Try changing your search query or switching the status filter above."
          actionText="Reset Filters"
          onAction={() => {
            setSearch('');
            setStatusFilter('all');
          }}
        />
      )}

    </div>
  );
};
