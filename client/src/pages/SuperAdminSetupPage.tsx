import React, { useState, useEffect } from 'react';
import {
  Building2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Palette,
  Phone,
  CreditCard,
  Volume2,
  Bell,
  Clock,
  ShieldCheck,
  Users,
  MapPin,
  ExternalLink,
  Plus,
  Trash2,
  Check
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { notificationSoundService } from '../services/notification-sound.service';

interface SuperAdminSetupPageProps {
  onProfileUpdated?: (newProfile: any) => void;
  onNavigateBack?: () => void;
}

export const SuperAdminSetupPage: React.FC<SuperAdminSetupPageProps> = ({
  onProfileUpdated,
  onNavigateBack,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [clinicName, setClinicName] = useState('Apex Dental & Aesthetics');
  const [legalBusinessName, setLegalBusinessName] = useState('Apex Dental Partners, LLC');
  const [tagline, setTagline] = useState('Modern, Gentle & Tech-Forward Dentistry in Manhattan');
  const [logoUrl, setLogoUrl] = useState('/images/dentist_doctor.jpg');

  // Colors
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [secondaryColor, setSecondaryColor] = useState('#0891b2');
  const [accentColor, setAccentColor] = useState('#10b981');
  const [brandDarkColor, setBrandDarkColor] = useState('#0b1120');

  // Contact
  const [address, setAddress] = useState('450 Lexington Ave, Suite 800');
  const [city, setCity] = useState('New York');
  const [stateCode, setStateCode] = useState('NY');
  const [zip, setZip] = useState('10017');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [email, setEmail] = useState('appointments@apexdental.com');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('https://g.page/r/apex-dental/review');
  const [emergencyPhone, setEmergencyPhone] = useState('+1 (555) 234-9911');

  // Telephony (Telnyx / Twilio)
  const [telephonyProvider, setTelephonyProvider] = useState<'telnyx' | 'twilio'>('telnyx');
  const [accountSid, setAccountSid] = useState('KEY0184A918B744_DEMO');
  const [authToken, setAuthToken] = useState('c8f041b3d76e4811a221f7e');
  const [fromPhoneNumber, setFromPhoneNumber] = useState('+18005550199');
  const [messagingProfileId, setMessagingProfileId] = useState('msg_prof_4981a');

  // Billing (Stripe)
  const [stripeAccountId, setStripeAccountId] = useState('acct_1NvDentalApexDemo');
  const [stripePublishableKey, setStripePublishableKey] = useState('pk_live_51NvDentalDemoKey99');

  // Providers & Operatories
  const [providers, setProviders] = useState<any[]>([
    {
      id: 'prov-01',
      name: 'Dr. Sarah Jensen',
      title: 'Lead Cosmetic Dentist',
      credentials: 'DDS, FAGD',
      npiNumber: '1982736450',
      active: true,
    },
    {
      id: 'prov-02',
      name: 'Dr. Marcus Vance',
      title: 'Oral Surgeon',
      credentials: 'DMD, MD',
      npiNumber: '1249876531',
      active: true,
    },
  ]);

  const [operatories, setOperatories] = useState<string[]>([
    'Operatory 1 (Hygiene Suite)',
    'Operatory 2 (Restorative)',
    'Operatory 3 (Laser & Aesthetic Suite)',
    'Operatory 4 (Emergency)',
  ]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/clinic-profile');
      const data = await res.json();
      if (data.success && data.config) {
        const c = data.config;
        setClinicName(c.name || '');
        setLegalBusinessName(c.legalBusinessName || '');
        setTagline(c.tagline || '');
        setLogoUrl(c.logoUrl || '');
        if (c.colors) {
          setPrimaryColor(c.colors.primary || '#2563eb');
          setSecondaryColor(c.colors.secondary || '#0891b2');
          setAccentColor(c.colors.accent || '#10b981');
          setBrandDarkColor(c.colors.brandDark || '#0b1120');
        }
        if (c.contact) {
          setAddress(c.contact.address || '');
          setCity(c.contact.city || '');
          setStateCode(c.contact.state || '');
          setZip(c.contact.zip || '');
          setPhone(c.contact.phone || '');
          setEmail(c.contact.email || '');
          setGoogleReviewUrl(c.contact.googleReviewUrl || '');
          setEmergencyPhone(c.contact.emergencyPhone || '');
        }
        if (c.telephony) {
          setTelephonyProvider(c.telephony.provider || 'telnyx');
          setAccountSid(c.telephony.accountSid || '');
          setAuthToken(c.telephony.authToken || '');
          setFromPhoneNumber(c.telephony.fromPhoneNumber || '');
          setMessagingProfileId(c.telephony.messagingProfileId || '');
        }
        if (c.billing) {
          setStripeAccountId(c.billing.stripeAccountId || '');
          setStripePublishableKey(c.billing.stripePublishableKey || '');
        }
        if (c.providers) {
          setProviders(c.providers);
        }
        if (c.operatories) {
          setOperatories(c.operatories.map((o: any) => o.name));
        }
      }
    } catch (err) {
      console.error('Failed fetching clinic profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: clinicName,
        legalBusinessName,
        tagline,
        logoUrl,
        colors: {
          primary: primaryColor,
          secondary: secondaryColor,
          accent: accentColor,
          brandDark: brandDarkColor,
        },
        contact: {
          address,
          city,
          state: stateCode,
          zip,
          phone,
          email,
          googleReviewUrl,
          emergencyPhone,
        },
        telephony: {
          provider: telephonyProvider,
          accountSid,
          authToken,
          fromPhoneNumber,
          messagingProfileId,
        },
        billing: {
          stripeAccountId,
          stripePublishableKey,
          currency: 'USD',
        },
        providers,
        operatories: operatories.map((name, i) => ({
          id: `op-${i + 1}`,
          name,
          roomNumber: `Room ${101 + i}`,
          specialty: 'Clinical Suite',
          active: true,
        })),
      };

      const res = await fetch('/api/v1/admin/clinic-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setToastMessage('🎉 Clinic profile saved & white-labeled across all portals!');
        if (onProfileUpdated) {
          onProfileUpdated(data.config);
        }
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error('Error updating clinic profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Reset clinic settings to demo default (Apex Dental)?')) return;
    try {
      const res = await fetch('/api/v1/admin/clinic-profile/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchProfile();
        setToastMessage('Reset to default demo clinic profile.');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error resetting profile:', err);
    }
  };

  const testCurbsideAudio = () => {
    notificationSoundService.playCurbsideArrivalChime();
    notificationSoundService.requestDesktopPermission().then((granted) => {
      if (granted) {
        notificationSoundService.showDesktopNotification('🚗 Test Curbside Arrival Chime', {
          body: 'Sophia Martinez arrived in Parking Spot #3 • Operatory 3 Ready',
        });
      }
    });
  };

  const testEmergencyAudio = () => {
    notificationSoundService.playEmergencyTriageAlarm();
    notificationSoundService.requestDesktopPermission().then((granted) => {
      if (granted) {
        notificationSoundService.showDesktopNotification('🚨 Urgent Triage Alert', {
          body: 'Patient logged Pain 8/10. Dr. Sarah Jensen alerted.',
        });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-fadeIn">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-semibold text-xs shadow-2xl backdrop-blur-md flex items-center gap-2 border border-emerald-400/40 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <GlassCard className="p-6 border border-blue-500/20 bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-950">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary" className="text-xs">
                Managed Service Super-Admin
              </Badge>
              <span className="text-xs text-slate-400">$1,500 Setup &bull; $399/mo Deployment Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              White-Label Clinic Onboarding
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Configure a new client's practice identity, carriers, Google review URL, and billing in 15 minutes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onNavigateBack && (
              <button
                type="button"
                onClick={onNavigateBack}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all"
              >
                Back to Dashboard
              </button>
            )}
            <button
              type="button"
              onClick={handleResetDemo}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Audio & Notification Test Bar */}
      <GlassCard className="p-4 border border-cyan-500/20 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white">Staff Chime & Audio Safety Buffers</span>
            <p className="text-[11px] text-slate-400">Zero-asset Web Audio harmonic synthesizers & browser desktop alerts.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={testCurbsideAudio}
            className="px-3 py-1.5 rounded-lg bg-cyan-600/80 hover:bg-cyan-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Test Curbside Chime</span>
          </button>
          <button
            type="button"
            onClick={testEmergencyAudio}
            className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Test Emergency Alarm</span>
          </button>
        </div>
      </GlassCard>

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Practice Branding & Palette */}
        <GlassCard className="p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">1. Practice Identity & Branding</h2>
              <p className="text-xs text-slate-400">Re-themes the patient portal, booking widgets, and header branding instantly.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Public Practice Name:</label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Legal Entity Name (for BAA):</label>
              <input
                type="text"
                value={legalBusinessName}
                onChange={(e) => setLegalBusinessName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Tagline / Mission:</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Color Palette Customizer */}
          <div className="pt-3 border-t border-slate-800/80">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-3">
              <Palette className="w-3.5 h-3.5 text-blue-400" />
              <span>Theme Colors (Hex Codes):</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <div>
                  <div className="text-[11px] text-slate-400">Primary Brand</div>
                  <div className="text-xs font-mono font-bold text-white">{primaryColor}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <div>
                  <div className="text-[11px] text-slate-400">Secondary / Cyan</div>
                  <div className="text-xs font-mono font-bold text-white">{secondaryColor}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <div>
                  <div className="text-[11px] text-slate-400">Success / Accent</div>
                  <div className="text-xs font-mono font-bold text-white">{accentColor}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <input
                  type="color"
                  value={brandDarkColor}
                  onChange={(e) => setBrandDarkColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <div>
                  <div className="text-[11px] text-slate-400">Midnight Slate</div>
                  <div className="text-xs font-mono font-bold text-white">{brandDarkColor}</div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Section 2: Contact, Location & Google Reviews */}
        <GlassCard className="p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">2. Contact & Reputation Management</h2>
              <p className="text-xs text-slate-400">Coordinates review requests and pre-visit direction links.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Street Address:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">City, State, Zip:</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="New York"
                  className="w-2/4 px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                />
                <input
                  type="text"
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  placeholder="NY"
                  className="w-1/4 px-2 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none text-center"
                />
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="10017"
                  className="w-1/4 px-2 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none text-center"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Main Office Phone:</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Office Notification Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Emergency After-Hours Direct Line:</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Google Business 5-Star Review Link:</label>
              <input
                type="text"
                value={googleReviewUrl}
                onChange={(e) => setGoogleReviewUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </GlassCard>

        {/* Section 3: Telephony & 10DLC Messaging (Telnyx / Twilio) */}
        <GlassCard className="p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">3. Telephony & 10DLC Messaging Integration</h2>
              <p className="text-xs text-slate-400">Direct wholesale connectivity (Telnyx $0.002/min / Twilio) for voice AI & RCS.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Provider:</label>
              <select
                value={telephonyProvider}
                onChange={(e) => setTelephonyProvider(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="telnyx">Telnyx (Wholesale 10DLC & Voice SIP)</option>
                <option value="twilio">Twilio (Voice API & Messaging)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Account SID / API Key:</label>
              <input
                type="text"
                value={accountSid}
                onChange={(e) => setAccountSid(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Auth Token / Secret:</label>
              <input
                type="password"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Assigned 10DLC Phone Number:</label>
              <input
                type="text"
                value={fromPhoneNumber}
                onChange={(e) => setFromPhoneNumber(e.target.value)}
                placeholder="+18005550199"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </GlassCard>

        {/* Section 4: Billing & Card-on-File (Stripe Connect) */}
        <GlassCard className="p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">4. Payment Processing (Stripe Connect)</h2>
              <p className="text-xs text-slate-400">Powers pre-authorized copay checkout and patient invoice settlement.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Stripe Connected Account ID:</label>
              <input
                type="text"
                value={stripeAccountId}
                onChange={(e) => setStripeAccountId(e.target.value)}
                placeholder="acct_1Nv..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Stripe Publishable Key:</label>
              <input
                type="text"
                value={stripePublishableKey}
                onChange={(e) => setStripePublishableKey(e.target.value)}
                placeholder="pk_live_..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </GlassCard>

        {/* Save Bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 sticky bottom-4 z-20 shadow-2xl backdrop-blur-md">
          <div className="text-xs text-slate-400">
            Changes propagate to all patient booking pages, SMS templates, and doctor portals instantly.
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
          >
            {saving ? (
              <span>Deploying White-Label Profile...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Deploy Clinic Configuration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
