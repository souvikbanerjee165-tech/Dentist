import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink, 
  Globe, 
  Sliders, 
  X,
  MessageSquare,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';

interface WebsiteWidgetEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicName?: string;
}

export const WebsiteWidgetEmbedModal: React.FC<WebsiteWidgetEmbedModalProps> = ({
  isOpen,
  onClose,
  clinicName = 'St. James Dental Practice',
}) => {
  const [selectedColor, setSelectedColor] = useState('#0284c7'); // Default Sky-600
  const [copied, setCopied] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'wordpress' | 'wix' | 'squarespace' | 'html'>('wordpress');

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://whatsapp-ai-sales-assistant-rho.vercel.app';
  const embedCode = `<!-- DentalDesk AI - Front Desk Website Chat Widget -->
<script 
  src="${currentHost}/widget.js" 
  data-clinic="${clinicName}" 
  data-color="${selectedColor}" 
  data-doctor="Dr. Sarah Jensen"
  data-api="${currentHost}" 
  async>
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-sky-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 text-sky-500 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Embed AI Website Chat Widget
                </h3>
                <Badge variant="success">1-Line Install</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deploy Dr. Sarah Jensen's AI Front Desk on any dental clinic website in 60 seconds.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Key Value Banner */}
          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-900 dark:text-sky-200 text-xs flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Instant Patient Capture:</strong> When website visitors have toothaches or search for veneer pricing at 9 PM, they won't bounce to a competitor. The AI Front Desk responds in 2 seconds and books them directly into Google Calendar.
            </div>
          </div>

          {/* Color & Customization */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
              Match Clinic Brand Color:
            </label>
            <div className="flex items-center gap-3">
              {[
                { name: 'Royal Sky', hex: '#0284c7' },
                { name: 'Emerald Dental', hex: '#059669' },
                { name: 'Deep Indigo', hex: '#4f46e5' },
                { name: 'Rose Luxury', hex: '#e11d48' },
                { name: 'Slate Minimal', hex: '#334155' },
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    selectedColor === c.hex
                      ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Embed Code Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-sky-500" />
                <span>HTML Embed Snippet (Paste before &lt;/body&gt;):</span>
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed select-all">
              {embedCode}
            </pre>
          </div>

          {/* Platform Tabs & Step-by-Step Instructions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              {(['wordpress', 'wix', 'squarespace', 'html'] as const).map((plat) => (
                <button
                  key={plat}
                  onClick={() => setActivePlatform(plat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    activePlatform === plat
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              {activePlatform === 'wordpress' && (
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">WordPress Installation:</div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400">
                    <li>Log into your WordPress Admin dashboard.</li>
                    <li>Install the free plugin <strong>WPCode (Insert Headers and Footers)</strong>.</li>
                    <li>Navigate to <strong>Code Snippets &rarr; Header &amp; Footer</strong>.</li>
                    <li>Paste the snippet above into the <strong>Footer</strong> box and click <strong>Save Changes</strong>.</li>
                  </ol>
                </div>
              )}
              {activePlatform === 'wix' && (
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Wix Installation:</div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400">
                    <li>Go to your Wix Site Dashboard &rarr; <strong>Settings &rarr; Custom Code</strong>.</li>
                    <li>Click <strong>+ Add Custom Code</strong> in the <strong>Body - End</strong> section.</li>
                    <li>Paste the code snippet, choose <em>Load code on all pages</em>, and click <strong>Apply</strong>.</li>
                  </ol>
                </div>
              )}
              {activePlatform === 'squarespace' && (
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Squarespace Installation:</div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400">
                    <li>In Squarespace, navigate to <strong>Settings &rarr; Advanced &rarr; Code Injection</strong>.</li>
                    <li>Paste the snippet into the <strong>Footer</strong> field.</li>
                    <li>Click <strong>Save</strong>. The widget appears instantly across all pages.</li>
                  </ol>
                </div>
              )}
              {activePlatform === 'html' && (
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Custom HTML / Webflow:</div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Paste the single <code>&lt;script&gt;</code> tag right before the closing <code>&lt;/body&gt;</code> tag in your layout template.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Zero impact on page load speed • Fully responsive on iOS &amp; Android</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
