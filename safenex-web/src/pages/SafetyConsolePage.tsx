import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Volume2, 
  Eye, 
  Smartphone, 
  Radio, 
  CheckCircle2
} from 'lucide-react';
import { audioSiren } from '../services/audioSirenService';

interface SafetyConsolePageProps {
  onTriggerSos: (source: string) => void;
  onSafeTest: (source: string) => void;
  onNotify: (title: string, message?: string, type?: any) => void;
}

export const SafetyConsolePage: React.FC<SafetyConsolePageProps> = ({
  onTriggerSos,
  onSafeTest,
  onNotify,
}) => {
  const [testingSiren, setTestingSiren] = useState(false);
  const [testingStrobe, setTestingStrobe] = useState(false);
  const [strobeFlash, setStrobeFlash] = useState(false);

  const toggleTestSiren = () => {
    if (testingSiren) {
      audioSiren.stopSiren();
      setTestingSiren(false);
      onNotify('Siren Test Halted', 'Oscillator disconnected.', 'info');
    } else {
      audioSiren.startSiren();
      setTestingSiren(true);
      onNotify('Siren Diagnostics Active', '1200Hz sweeping sawtooth playing.', 'warning');
      setTimeout(() => {
        audioSiren.stopSiren();
        setTestingSiren(false);
      }, 3000);
    }
  };

  const toggleTestStrobe = () => {
    if (testingStrobe) {
      setTestingStrobe(false);
    } else {
      setTestingStrobe(true);
      let count = 0;
      const interval = setInterval(() => {
        setStrobeFlash((p) => !p);
        count++;
        if (count >= 16) {
          clearInterval(interval);
          setTestingStrobe(false);
          setStrobeFlash(false);
        }
      }, 150);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Visual Strobe Overlay for Diagnostics */}
      {testingStrobe && (
        <div
          className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-75 ${
            strobeFlash ? 'bg-white/40' : 'bg-transparent'
          }`}
        />
      )}

      {/* Header */}
      <div className="p-6 rounded-3xl glass-panel border border-[#24434A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#FF304F]/15 text-[#FF304F]">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-[#FF304F] uppercase tracking-wider">
              TACTICAL SAFETY CONSOLE
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#F4FAFA]">System Diagnostics & Trigger Suite</h2>
          <p className="text-xs text-[#A2B5BF] mt-1">
            Verify acoustic sirens, high-frequency strobes, motion sensors, and live cloud streaming.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-[#00E6A0]/15 border border-[#00E6A0]/30 text-xs font-mono text-[#00E6A0] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00E6A0] animate-pulse" />
            DIAGNOSTICS READY
          </span>
        </div>
      </div>

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Siren Diagnostics */}
        <div className="glass-panel rounded-3xl p-6 border border-[#24434A] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-2xl bg-[#FF304F]/10 text-[#FF304F] border border-[#FF304F]/20">
                <Volume2 className="w-5 h-5" />
              </div>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                testingSiren ? 'bg-[#FF304F]/20 text-[#FF304F] animate-pulse' : 'bg-[#142B35] text-[#708792]'
              }`}>
                {testingSiren ? 'SOUNDING' : 'IDLE'}
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#F4FAFA]">Acoustic Siren Synthesizer</h4>
            <p className="text-xs text-[#A2B5BF] mt-1">
              Dual-phase 800Hz–1300Hz sawtooth sweeping wave designed for maximum acoustic penetration.
            </p>
          </div>

          <button
            onClick={toggleTestSiren}
            className={`mt-4 w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              testingSiren
                ? 'bg-[#FF304F] text-white shadow-red-glow'
                : 'bg-[#142B35] hover:bg-[#1A3644] text-[#F4FAFA] border border-[#24434A]'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{testingSiren ? 'Stop Siren' : 'Test Siren (3 sec)'}</span>
          </button>
        </div>

        {/* Optical Strobe Diagnostics */}
        <div className="glass-panel rounded-3xl p-6 border border-[#24434A] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-2xl bg-[#35DDF2]/10 text-[#35DDF2] border border-[#35DDF2]/20">
                <Eye className="w-5 h-5" />
              </div>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                testingStrobe ? 'bg-[#35DDF2]/20 text-[#35DDF2] animate-pulse' : 'bg-[#142B35] text-[#708792]'
              }`}>
                {testingStrobe ? 'FLASHING' : 'READY'}
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#F4FAFA]">High-Frequency Strobe</h4>
            <p className="text-xs text-[#A2B5BF] mt-1">
              Rapid visual disorienting flash to deter intruders and signal distress in low-light environments.
            </p>
          </div>

          <button
            onClick={toggleTestStrobe}
            className={`mt-4 w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              testingStrobe
                ? 'bg-[#35DDF2] text-[#070D12] shadow-cyan-glow'
                : 'bg-[#142B35] hover:bg-[#1A3644] text-[#F4FAFA] border border-[#24434A]'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{testingStrobe ? 'Flashing...' : 'Test Optical Strobe'}</span>
          </button>
        </div>

        {/* Motion Shake Detection */}
        <div className="glass-panel rounded-3xl p-6 border border-[#24434A] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-2xl bg-[#00E6A0]/10 text-[#00E6A0] border border-[#00E6A0]/20">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#00E6A0]/20 text-[#00E6A0]">
                ACCEL ACTIVE
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#F4FAFA]">Shake-to-SOS Detection</h4>
            <p className="text-xs text-[#A2B5BF] mt-1">
              Accelerometer threshold detection activates emergency if phone is vigorously shaken 3 times.
            </p>
          </div>

          <button
            onClick={() => onSafeTest('SHAKE')}
            className="mt-4 w-full py-2.5 rounded-xl bg-[#142B35] hover:bg-[#1A3644] text-[#F4FAFA] border border-[#24434A] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-[#00E6A0]" />
            <span>Simulate Motion Shake</span>
          </button>
        </div>
      </div>

      {/* Primary Emergency Triggers Table */}
      <div className="glass-panel rounded-3xl p-6 border border-[#24434A]">
        <h3 className="text-sm font-bold text-[#F4FAFA] mb-2">MANUAL TRIGGER PROTOCOLS</h3>
        <p className="text-xs text-[#A2B5BF] mb-4">
          Direct manual triggers will initiate the full SafeNex SOS protocol, notify guardians, and upload telemetry.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => onTriggerSos('BUTTON')}
            className="p-4 rounded-2xl btn-sos-gradient text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            <ShieldAlert className="w-5 h-5 fill-white" />
            <span>Full SOS Alert</span>
          </button>

          <button
            onClick={() => onTriggerSos('VOICE')}
            className="p-4 rounded-2xl bg-[#142B35] hover:bg-[#1A3644] border border-[#24434A] text-[#F4FAFA] text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Volume2 className="w-5 h-5 text-[#35DDF2]" />
            <span>Voice "HELP!" Alert</span>
          </button>

          <button
            onClick={() => onTriggerSos('BLE_BAND_BUTTON')}
            className="p-4 rounded-2xl bg-[#142B35] hover:bg-[#1A3644] border border-[#24434A] text-[#F4FAFA] text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Radio className="w-5 h-5 text-[#00E6A0]" />
            <span>ESP32 Band Trigger</span>
          </button>

          <button
            onClick={() => onSafeTest('CLOUD_PING')}
            className="p-4 rounded-2xl bg-[#101F29] hover:bg-[#142B35] border border-[#00E6A0]/40 text-[#00E6A0] text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Safe Cloud Ping Test</span>
          </button>
        </div>
      </div>
    </div>
  );
};
