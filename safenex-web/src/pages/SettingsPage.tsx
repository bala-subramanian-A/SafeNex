import React, { useState } from 'react';
import { 
  Settings, 
  Lock, 
  Smartphone, 
  Volume2, 
  Eye, 
  Camera, 
  User, 
  Database,
  Check,
  AlertCircle
} from 'lucide-react';
import { UserProfile, SecurityPreferences, SupabaseHealth } from '../types';
import { securityManager } from '../lib/security';
import { supabaseService } from '../services/supabaseService';

interface SettingsPageProps {
  user: UserProfile;
  preferences: SecurityPreferences;
  supabaseHealth: SupabaseHealth;
  onUpdateProfile: (profile: UserProfile) => void;
  onUpdatePreferences: (preferences: SecurityPreferences) => void;
  onNotify: (title: string, message?: string, type?: any) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  preferences,
  supabaseHealth,
  onUpdateProfile,
  onUpdatePreferences,
  onNotify,
}) => {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isPinSaved, setIsPinSaved] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [bloodGroup, setBloodGroup] = useState(user.bloodGroup || '');
  const [allergies, setAllergies] = useState(user.allergies || '');
  const [medicalNotes, setMedicalNotes] = useState(user.medicalNotes || '');
  const [instructions, setInstructions] = useState(user.emergencyInstructions || '');
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  const handleToggle = (key: keyof SecurityPreferences) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    onUpdatePreferences(updated);
    onNotify('Preference Updated', `${String(key)} has been updated.`, 'info');
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError('PIN must be exactly 4 numeric digits.');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('PIN confirmation does not match.');
      return;
    }

    const success = await securityManager.setPin(newPin);
    if (success) {
      setIsPinSaved(true);
      setNewPin('');
      setConfirmPin('');
      onNotify('Cryptographic PIN Updated', 'Salted SHA-256 hash stored. Plain-text PIN is never persisted.', 'success');
      setTimeout(() => setIsPinSaved(false), 2500);
    } else {
      setPinError('Failed to hash and store PIN.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserProfile = {
      ...user,
      name: name.trim(),
      phone: phone.trim(),
      bloodGroup: bloodGroup.trim(),
      allergies: allergies.trim(),
      medicalNotes: medicalNotes.trim(),
      emergencyInstructions: instructions.trim(),
    };

    onUpdateProfile(updatedUser);

    if (!user.isAnonymous) {
      await supabaseService.updateUserMetadata(updatedUser);
    }

    setIsProfileSaved(true);
    onNotify('Profile Saved', 'Personal and medical records updated in local encrypted state.', 'success');
    setTimeout(() => setIsProfileSaved(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl glass-panel border border-[#24434A] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#35DDF2]/15 text-[#35DDF2]">
              <Settings className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-[#35DDF2] uppercase tracking-wider">
              SYSTEM CONFIGURATION
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#F4FAFA]">Safety Settings & Medical Profile</h2>
          <p className="text-xs text-[#A2B5BF] mt-1">
            Configure cryptographic disarm credentials, tactical deterrents, medical records, and cloud telemetry.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cryptographic Disarm PIN Card */}
        <div className="glass-panel rounded-3xl p-6 border border-[#24434A] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-2xl bg-[#00E6A0]/10 text-[#00E6A0] border border-[#00E6A0]/20">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#F4FAFA]">Cryptographic Disarm PIN</h4>
                <p className="text-xs text-[#A2B5BF]">Salted SHA-256 hash verification (Default: 1234).</p>
              </div>
            </div>

            <form onSubmit={handleSavePin} className="mt-4 space-y-3">
              {pinError && (
                <div className="p-2.5 rounded-xl bg-[#FF304F]/10 border border-[#FF304F]/30 text-xs text-[#FF304F] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A2B5BF] mb-1">
                    New 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B151D] border border-[#24434A] text-lg font-mono text-[#00E6A0] tracking-widest text-center focus:outline-none focus:border-[#00E6A0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A2B5BF] mb-1">
                    Confirm PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B151D] border border-[#24434A] text-lg font-mono text-[#00E6A0] tracking-widest text-center focus:outline-none focus:border-[#00E6A0]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl btn-emerald-gradient text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {isPinSaved ? <Check className="w-4 h-4" /> : null}
                <span>{isPinSaved ? 'PIN Hash Updated!' : 'Update Disarm PIN'}</span>
              </button>
            </form>
          </div>

          <div className="pt-4 mt-4 border-t border-[#24434A] text-[11px] text-[#708792]">
            Uses constant-time comparison to mitigate timing attacks. PIN is never stored in plain text.
          </div>
        </div>

        {/* Real User Emergency Medical Profile */}
        <div className="glass-panel rounded-3xl p-6 border border-[#24434A] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-2xl bg-[#00E6A0]/10 text-[#00E6A0] border border-[#00E6A0]/20">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#F4FAFA]">Emergency Identity & Medical Info</h4>
                <p className="text-xs text-[#A2B5BF]">
                  {user.isAnonymous ? 'Local encrypted record' : `Linked to ${user.email}`}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-[#A2B5BF] mb-1">Your Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B151D] border border-[#24434A] text-white focus:outline-none focus:border-[#00E6A0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#A2B5BF] mb-1">Primary Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 000 0000"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B151D] border border-[#24434A] text-white focus:outline-none focus:border-[#00E6A0]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#A2B5BF] mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    placeholder="e.g. O+ / A- / B+"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B151D] border border-[#24434A] text-white focus:outline-none focus:border-[#00E6A0]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#A2B5BF] mb-1">Allergies & Medical Conditions</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Asthma, Diabetes"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B151D] border border-[#24434A] text-white focus:outline-none focus:border-[#00E6A0]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#A2B5BF] mb-1">Emergency Medical Notes</label>
                <input
                  type="text"
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="e.g. Inhaler in bag, daily insulin"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B151D] border border-[#24434A] text-white focus:outline-none focus:border-[#00E6A0]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#A2B5BF] mb-1">Special Emergency Instructions</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Call emergency contact 1 first"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B151D] border border-[#24434A] text-white focus:outline-none focus:border-[#00E6A0]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#142B35] hover:bg-[#1A3644] border border-[#24434A] text-xs font-bold text-[#00E6A0] flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {isProfileSaved ? <Check className="w-4 h-4" /> : null}
                <span>{isProfileSaved ? 'Profile Updated!' : 'Save Emergency Profile'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Cloud Health & Supabase Telemetry */}
      <div className="glass-panel rounded-3xl p-6 border border-[#24434A]">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-2xl bg-[#35DDF2]/10 text-[#35DDF2] border border-[#35DDF2]/20">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#F4FAFA]">Live Supabase Infrastructure</h4>
            <p className="text-xs text-[#A2B5BF]">Actual connected database tables & media storage buckets.</p>
          </div>
        </div>

        <div className="my-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-[#0B151D] border border-[#24434A] flex flex-col justify-between">
            <span className="text-[#A2B5BF]">PostgreSQL Database:</span>
            <span className="font-mono text-[#00E6A0] font-bold mt-1">
              {supabaseHealth.status === 'online' ? `Online (${supabaseHealth.latencyMs}ms)` : 'Offline'}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-[#0B151D] border border-[#24434A] flex flex-col justify-between">
            <span className="text-[#A2B5BF]">Storage Buckets:</span>
            <span className="font-mono text-[#35DDF2] mt-1">
              emergency-videos, emergency-audio
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-[#0B151D] border border-[#24434A] flex flex-col justify-between">
            <span className="text-[#A2B5BF]">Public SOS Dispatch Link:</span>
            <span className="font-mono text-white text-[11px] truncate mt-1">
              fancy-syrniki-12abab.netlify.app
            </span>
          </div>
        </div>
      </div>

      {/* Tactical Deterrent Toggles */}
      <div className="glass-panel rounded-3xl p-6 border border-[#24434A]">
        <h4 className="text-sm font-bold text-[#F4FAFA] mb-4">TACTICAL DETERRENT TOGGLES</h4>

        <div className="divide-y divide-[#24434A]/60">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-[#00E6A0]" />
              <div>
                <h5 className="text-xs font-bold text-[#F4FAFA]">Shake-to-SOS Detection</h5>
                <p className="text-[11px] text-[#A2B5BF]">Trigger alert automatically if phone accelerometer detects 3 violent shakes.</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('shakeToSosEnabled')}
              className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center cursor-pointer ${
                preferences.shakeToSosEnabled ? 'bg-[#00E6A0] justify-end' : 'bg-[#142B35] justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-[#070D12] shadow" />
            </button>
          </div>

          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-[#FF304F]" />
              <div>
                <h5 className="text-xs font-bold text-[#F4FAFA]">1200Hz Acoustic Siren</h5>
                <p className="text-[11px] text-[#A2B5BF]">Synthesize high-penetration sweeping sawtooth wave on emergency activation.</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('audioSirenEnabled')}
              className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center cursor-pointer ${
                preferences.audioSirenEnabled ? 'bg-[#00E6A0] justify-end' : 'bg-[#142B35] justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-[#070D12] shadow" />
            </button>
          </div>

          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-[#35DDF2]" />
              <div>
                <h5 className="text-xs font-bold text-[#F4FAFA]">High-Frequency Tactical Strobe</h5>
                <p className="text-[11px] text-[#A2B5BF]">Rapidly flash screen to signal distress and disorient assailants.</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('strobeLightEnabled')}
              className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center cursor-pointer ${
                preferences.strobeLightEnabled ? 'bg-[#00E6A0] justify-end' : 'bg-[#142B35] justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-[#070D12] shadow" />
            </button>
          </div>

          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-[#78FFD0]" />
              <div>
                <h5 className="text-xs font-bold text-[#F4FAFA]">Blackbox Evidence Capture</h5>
                <p className="text-[11px] text-[#A2B5BF]">Capture microphone & camera streams and upload to Supabase bucket.</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('cameraEvidenceRecording')}
              className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center cursor-pointer ${
                preferences.cameraEvidenceRecording ? 'bg-[#00E6A0] justify-end' : 'bg-[#142B35] justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-[#070D12] shadow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
