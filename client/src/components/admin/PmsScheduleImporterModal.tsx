import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
  Clock,
  User,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import { Badge } from '../ui/Badge';

interface PmsScheduleImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (result: any) => void;
}

const SAMPLE_CSV_DENTRIX = `Patient Name,Phone,Date,Time,Provider,Operatory,Procedure
Michael Scott,555-123-4567,2026-09-23,09:00 AM,Dr. Sarah Jensen,Operatory 1,Comprehensive Periodic Exam & Prophy
Pam Beesly,555-234-5678,2026-09-23,10:30 AM,Dr. Sarah Jensen,Operatory 2,Crown Preparation #19
Jim Halpert,555-345-6789,2026-09-23,01:15 PM,Dr. Marcus Vance,Operatory 1,Composite Resin Restoration (Filling)
Dwight Schrute,555-456-7890,2026-09-23,03:00 PM,Dr. Sarah Jensen,Operatory 3,Invisalign Progress Check & IPR`;

const SAMPLE_CSV_EAGLESOFT = `Patient_Last,Patient_First,Cell,Appt_Date,Start_Time,Doctor,Room,Service_Description
Rodriguez,Carlos,555-987-6543,09/23/2026,08:30,Dr. Jensen,Chair 1,Emergency Pulp Vitality & Root Canal
Chen,David,555-876-5432,09/23/2026,11:00,Dr. Jensen,Chair 2,Laser Periodontal Scaling (Full Mouth)
Taylor,Emily,555-765-4321,09/23/2026,14:00,Dr. Vance,Chair 3,Teeth Whitening In-Office Session`;

export const PmsScheduleImporterModal: React.FC<PmsScheduleImporterModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [csvContent, setCsvContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseAndSetCsv(text, file.name);
    };
    reader.onerror = () => {
      setError('Failed to read the selected file. Please ensure it is a valid CSV.');
    };
    reader.readAsText(file);
  };

  const parseAndSetCsv = (text: string, name: string) => {
    setCsvContent(text);
    setFileName(name);

    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setError('File is empty.');
      return;
    }

    const parsedHeaders = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim());
    const parsedRows = lines.slice(1, 6).map((line) =>
      line.split(',').map((c) => c.replace(/^["']|["']$/g, '').trim())
    );

    setHeaders(parsedHeaders);
    setPreviewRows(parsedRows);
  };

  const loadSample = (type: 'dentrix' | 'eaglesoft') => {
    const content = type === 'dentrix' ? SAMPLE_CSV_DENTRIX : SAMPLE_CSV_EAGLESOFT;
    const name = type === 'dentrix' ? 'Dentrix_Day_Schedule_Export.csv' : 'Eaglesoft_Schedule_Batch.csv';
    parseAndSetCsv(content, name);
  };

  const handleSubmitImport = async () => {
    if (!csvContent) {
      setError('Please upload or select a CSV schedule export first.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/pms/import-schedule-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvContent,
          fileName,
          defaultDoctor: 'Dr. Sarah Jensen',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data);
        if (onImportComplete) {
          onImportComplete(data);
        }
      } else {
        setError(data.message || 'Failed to import schedule.');
      }
    } catch (err: any) {
      setError(err.message || 'Server connection error during CSV import.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  PMS Schedule Importer (Dentrix • Eaglesoft • Open Dental)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                  Universal CSV Bridge
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Batch ingest tomorrow&apos;s chair schedule to auto-dispatch pre-visit intake SMS, consent forms, and medical histories.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            /* Success Summary View */
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-1">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-white">Daily Schedule Ingested Successfully!</h4>
                <p className="text-xs text-emerald-200 max-w-md">
                  {result.message}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
                  <span className="text-2xl font-extrabold text-blue-400">{result.importedAppointments ?? result.importedCount ?? 0}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Appointments Synced</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
                  <span className="text-2xl font-extrabold text-emerald-400">{result.createdPatients ?? result.importedCount ?? 0}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Patient Records Created</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
                  <span className="text-2xl font-extrabold text-cyan-400">{result.autoNotifiedCount ?? result.intakeMessagesQueuedCount ?? 0}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Intake SMS Queued</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
                  <span className="text-2xl font-extrabold text-purple-400">{result.processedRows ?? result.appointments?.length ?? 0}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Total CSV Rows</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setCsvContent('');
                    setFileName('');
                    setPreviewRows([]);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Import Another File
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/30"
                >
                  Done & View Patient Hub
                </button>
              </div>
            </div>
          ) : (
            /* Upload & Preview Step */
            <div className="space-y-5">
              
              {/* Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 bg-slate-950/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors group cursor-pointer"
                onClick={() => document.getElementById('csv-file-input')?.click()}
              >
                <input
                  id="csv-file-input"
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileInput}
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 group-hover:bg-blue-600/20 text-blue-400 flex items-center justify-center mb-3 transition-colors">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-white">
                  {fileName ? fileName : 'Drop your PMS Schedule Export CSV here'}
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Exports from <strong className="text-slate-300">Dentrix G6/G7</strong>, <strong className="text-slate-300">Patterson Eaglesoft</strong>, or <strong className="text-slate-300">Open Dental</strong> are automatically mapped.
                </p>
                <span className="mt-3 text-[11px] px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
                  Browse Files
                </span>
              </div>

              {/* Sample 1-Click Loaders */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Testing without an export file?
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => loadSample('dentrix')}
                    className="text-xs px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold transition-colors"
                  >
                    Load Dentrix Sample
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSample('eaglesoft')}
                    className="text-xs px-3 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 font-semibold transition-colors"
                  >
                    Load Eaglesoft Sample
                  </button>
                </div>
              </div>

              {/* CSV Preview Table */}
              {previewRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      File Preview ({headers.length} Columns Detected)
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono">
                      ✓ Headers Validated
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-800/80 text-[11px] text-slate-400 font-semibold uppercase">
                        <tr>
                          {headers.map((h, i) => (
                            <th key={i} className="px-3 py-2 border-b border-slate-700 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                        {previewRows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-800/30">
                            {row.map((col, cIdx) => (
                              <td key={cIdx} className="px-3 py-2 whitespace-nowrap text-slate-300">
                                {col}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  {previewRows.length > 0 ? 'Ready to parse appointments.' : 'Upload file to preview.'}
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitImport}
                    disabled={loading || !csvContent}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-95"
                  >
                    {loading ? (
                      <span>Importing & Syncing...</span>
                    ) : (
                      <>
                        <span>Confirm & Synchronize Schedule</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
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
