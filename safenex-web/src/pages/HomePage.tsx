import React, { useState } from 'react';
import { 
  Share2, 
  PhoneCall, 
  Copy, 
  Check, 
  Users, 
  Settings, 
  Clock,
  ChevronRight,
  HeartPulse
} from 'lucide-react';
import { 
  UserProfile, 
  ActivityItemData, 
  LocationState, 
  BleBandState, 
  CommuteSession, 
  Guardian,
  ScreenType
} from '../types';
import { SosControlCard } from '../components/SosControlCard';
import { LiveMap } from '../components/LiveMap';
import { BleBandCard } from '../components/BleBandCard';
import { DittuVoiceCard } from '../components/DittuVoiceCard';
import { CommuteSafetyCard } from '../components/CommuteSafetyCard';
import { APP_PUBLIC_URL } from '../lib/constants';

interface HomePageProps {
  user: UserProfile;
  activities: ActivityItemData[];
  location: LocationState;
  onRetryLocation: () => void;
  bleBand: BleBandState;
  onConnectBle: () => void;
  onDisconnectBle: () => void;
  commuteSession: CommuteSession;
  onStartCommute: (dest: string, mins: number) => void;
  onCancelCommute: () => void;
  onExtendCommute: (mins: number) => void;
  onConfirmArrival: () => void;
  guardians: Guardian[];
  onTriggerSos: (source: string) => void;
  onSafeTest: (type: string) => void;
  onNavigateTo: (screen: ScreenType) => void;
  onNotify: (title: string, message?: string, type?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  user,
  activities,
  location,
  onRetryLocation,
  bleBand,
  onConnectBle,
  onDisconnectBle,
  commuteSession,
  onStartCommute,
  onCancelCommute,
  onExtendCommute,
  onConfirmArrival,
  guardians,
  onTriggerSos,
  onSafeTest,
  onNavigateTo,
  onNotify,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const primaryGuardian = guardians.find((g) => g.isPrimary) || (guardians.length > 0 ? guardians[0] : null);

  const handleCopyTrackingLink = () => {
    if (!location.latitude || !location.longitude) {
      onNotify('GPS Not Locked', 'Please allow location access to copy accurate tracking link.', 'warning');
      return;
    }
    const shareUrl = `${APP_PUBLIC_URL}/?track=live&lat=${location.latitude}&lng=${location.longitude}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    onNotify('Tracking Link Copied', 'Encrypted live link copied to clipboard.', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const lat = location.latitude;
    const lng = location.longitude;
    const mapsLink = (lat && lng) ? `https://maps.google.com/?q=${lat},${lng}` : 'GPS coordinates pending';
    const gPhone = primaryGuardian ? primaryGuardian.phone.replace(/[^0-9]/g, '') : '';
    const text = encodeURIComponent(
      `🛡️ *SafeNex Emergency Alert / Location Share*:\nMy current GPS: ${mapsLink}\nLive Portal: ${APP_PUBLIC_URL}/?track=live\nShared by: ${user.name}.`
    );
    const url = gPhone ? `https://wa.me/${gPhone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handleCallGuardian = () => {
    if (primaryGuardian) {
      window.location.href = `tel:${primaryGuardian.phone.replace(/[^0-9+]/g, '')}`;
    } else {
      onNotify('No Guardian Configured', 'Please add a trusted contact in Guardians tab.', 'warning');
      onNavigateTo('guardians');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7">
      {/* Top Banner / Real User Status Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl glass-panel border border-[#24434A]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#00E6A0] tracking-wider uppercase">
              {user.isAnonymous ? 'Local Safety Profile' : 'Verified Cloud Identity'}
            </span>
            <span className="text-[#708792]">•</span>
            <span className="text-xs text-[#A2B5BF] font-mono">
              {user.isAnonymous ? 'Unauthenticated' : user.email}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4FAFA] tracking-tight">
            Safety Core: <span className="text-[#00E6A0]">Armed & Active</span>
          </h1>
          <p className="text-xs text-[#A2B5BF] mt-1">
            {guardians.length === 0
              ? '⚠️ No emergency contacts registered yet. Add a guardian to enable automatic dispatch.'
              : `${guardians.length} Guardian(s) Active • Primary: ${primaryGuardian?.name}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTo('guardians')}
            className="py-2.5 px-4 rounded-2xl btn-emerald-gradient text-xs font-bold flex items-center gap-2 shadow-emerald-glow cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>{guardians.length === 0 ? 'Add Guardians' : 'Guardians Network'}</span>
          </button>
          <button
            onClick={() => onNavigateTo('settings')}
            className="py-2.5 px-4 rounded-2xl bg-[#101F29] hover:bg-[#142B35] border border-[#24434A] text-xs font-bold text-[#A2B5BF] hover:text-[#F4FAFA] flex items-center gap-2 transition cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Safety Settings</span>
          </button>
        </div>
      </div>

      {/* PRIMARY TWO-COLUMN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Emergency SOS Card + BLE Band + Commute */}
        <div className="lg:col-span-5 space-y-6">
          {/* Large Circular SOS Control Card */}
          <SosControlCard
            onTriggerSos={onTriggerSos}
            onSafeTest={onSafeTest}
            isEmergencyActive={false}
          />

          {/* Wearable BLE Wristband Card */}
          <BleBandCard
            bandState={bleBand}
            onConnect={onConnectBle}
            onDisconnect={onDisconnectBle}
          />

          {/* Commute Safety Card (Dead-Man's arrival switch) */}
          <CommuteSafetyCard
            session={commuteSession}
            onStartSession={onStartCommute}
            onCancelSession={onCancelCommute}
            onExtendSession={onExtendCommute}
            onConfirmArrival={onConfirmArrival}
          />
        </div>

        {/* RIGHT COLUMN: Live Location Map + Quick Actions + DITTU Assistant */}
        <div className="lg:col-span-7 space-y-6">
          {/* Real Live Map with dark mode, accuracy ring, telemetry overlay */}
          <div className="h-[360px] sm:h-[400px]">
            <LiveMap
              location={location}
              onRetry={onRetryLocation}
              isEmergency={false}
            />
          </div>

          {/* Quick Location & Guardian Action Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleShareWhatsApp}
              className="py-3 px-4 rounded-2xl bg-[#101F29] hover:bg-[#142B35] border border-[#24434A] hover:border-[#25D366]/40 text-[#F4FAFA] text-xs font-bold flex items-center justify-center gap-2 transition shadow-card group cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-[#25D366] group-hover:scale-110 transition-transform" />
              <span>Share Location (WhatsApp)</span>
            </button>

            <button
              onClick={handleCallGuardian}
              className="py-3 px-4 rounded-2xl bg-[#101F29] hover:bg-[#142B35] border border-[#24434A] hover:border-[#00E6A0]/40 text-[#F4FAFA] text-xs font-bold flex items-center justify-center gap-2 transition shadow-card group cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#00E6A0] group-hover:scale-110 transition-transform" />
              <span>{primaryGuardian ? `Call ${primaryGuardian.name.split(' ')[0]}` : 'Call Primary'}</span>
            </button>

            <button
              onClick={handleCopyTrackingLink}
              className="py-3 px-4 rounded-2xl bg-[#101F29] hover:bg-[#142B35] border border-[#24434A] hover:border-[#35DDF2]/40 text-[#F4FAFA] text-xs font-bold flex items-center justify-center gap-2 transition shadow-card group cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-[#00E6A0]" />
                  <span className="text-[#00E6A0]">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#35DDF2] group-hover:scale-110 transition-transform" />
                  <span>Copy GPS Link</span>
                </>
              )}
            </button>
          </div>

          {/* DITTU Voice Assistant Card with Waveform */}
          <DittuVoiceCard
            onTriggerSos={onTriggerSos}
            onCallGuardian={handleCallGuardian}
            onQueryLocation={() => onNotify('Location Telemetry', location.address || 'GPS lock pending', 'info')}
          />
        </div>
      </div>

      {/* SECONDARY ROW: Real Activity Log & Medical Emergency Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Real Activity Log */}
        <div className="glass-panel rounded-3xl p-6 border border-[#24434A]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00E6A0]" />
              <h3 className="text-sm font-bold text-[#F4FAFA] tracking-wide">
                SECURITY AUDIT LOG
              </h3>
            </div>
            <button
              onClick={() => onNavigateTo('history')}
              className="text-xs text-[#35DDF2] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>Cloud Incidents</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-xs text-[#708792] py-4 text-center">No recent security events.</p>
            ) : (
              activities.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-[#0B151D]/70 border border-[#24434A]/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'Emergency'
                        ? 'bg-[#FF304F] animate-ping'
                        : item.status === 'Active'
                        ? 'bg-[#00E6A0]'
                        : 'bg-[#35DDF2]'
                    }`} />
                    <div>
                      <h5 className="text-xs font-bold text-[#F4FAFA]">{item.title}</h5>
                      <p className="text-[11px] text-[#A2B5BF]">{item.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#708792]">
                    {item.timestamp}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Medical & Emergency Profile Details Card */}
        <div className="glass-panel rounded-3xl p-6 border border-[#24434A]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-[#FF304F]" />
              <h3 className="text-sm font-bold text-[#F4FAFA] tracking-wide">
                CRITICAL MEDICAL PROFILE
              </h3>
            </div>
            <button
              onClick={() => onNavigateTo('settings')}
              className="text-xs text-[#00E6A0] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>Edit Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-[#0B151D]/70 border border-[#24434A]/50 flex items-center justify-between">
              <span className="text-[#A2B5BF]">Full Name:</span>
              <span className="font-bold text-[#F4FAFA]">{user.name || 'Not configured'}</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#0B151D]/70 border border-[#24434A]/50 flex items-center justify-between">
              <span className="text-[#A2B5BF]">Blood Group:</span>
              <span className="font-bold text-[#00E6A0] font-mono">{user.bloodGroup || 'Not specified'}</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#0B151D]/70 border border-[#24434A]/50 flex items-center justify-between">
              <span className="text-[#A2B5BF]">Allergies:</span>
              <span className="text-[#F4FAFA]">{user.allergies || 'None recorded'}</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#0B151D]/70 border border-[#24434A]/50 flex items-center justify-between">
              <span className="text-[#A2B5BF]">Emergency Medical Notes:</span>
              <span className="text-[#F4FAFA] truncate max-w-[200px]">
                {user.medicalNotes || 'No special instructions'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
