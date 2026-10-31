import React, { useState, useRef } from 'react';
import { Zap, ShieldAlert, Smartphone, Volume2 } from 'lucide-react';

interface SosControlCardProps {
  onTriggerSos: (source: string) => void;
  onSafeTest: (type: string) => void;
  isEmergencyActive: boolean;
}

export const SosControlCard: React.FC<SosControlCardProps> = ({
  onTriggerSos,
  onSafeTest,
  isEmergencyActive,
}) => {
  const [pressProgress, setPressProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef<any>(null);

  const handlePressStart = () => {
    if (isEmergencyActive) return;
    setIsPressing(true);
    let current = 0;
    const interval = 25;
    timerRef.current = setInterval(() => {
      current += 2.5;
      if (current >= 100) {
        clearInterval(timerRef.current);
        setIsPressing(false);
        setPressProgress(0);
        onTriggerSos('BUTTON');
      } else {
        setPressProgress(current);
      }
    }, interval);
  };

  const handlePressEnd = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Fast tap support
    if (isPressing && pressProgress < 30) {
      setIsPressing(false);
      setPressProgress(0);
      onTriggerSos('BUTTON');
      return;
    }
    setIsPressing(false);
    setPressProgress(0);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-7 relative overflow-hidden flex flex-col items-center justify-between border border-[#24434A] shadow-card">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#FF304F]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#FF304F]/10 border border-[#FF304F]/30 text-[#FF304F]">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F4FAFA] tracking-wide">EMERGENCY SOS</h3>
            <p className="text-[11px] text-[#A2B5BF]">Press or hold to broadcast alert</p>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-[#142B35] border border-[#24434A] text-[11px] font-mono text-[#00E6A0] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E6A0] animate-pulse"></span>
          ARMED
        </div>
      </div>

      {/* Big Circular SOS Button */}
      <div className="relative my-4 flex items-center justify-center">
        {/* Pulsing Outer Rings */}
        <div className="absolute w-56 h-56 rounded-full border border-[#FF304F]/20 animate-ping-slow pointer-events-none" />
        <div className="absolute w-48 h-48 rounded-full border border-[#FF304F]/30 pointer-events-none" />

        {/* Progress circular SVG ring for press-and-hold */}
        {isPressing && (
          <svg className="absolute w-44 h-44 -rotate-90 pointer-events-none">
            <circle
              cx="88"
              cy="88"
              r="76"
              stroke="#00E6A0"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 76}
              strokeDashoffset={2 * Math.PI * 76 * (1 - pressProgress / 100)}
              className="transition-all duration-75"
            />
          </svg>
        )}

        {/* Main SOS Button */}
        <button
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          aria-label="Activate Emergency SOS"
          className={`relative w-40 h-40 rounded-full btn-sos-gradient flex flex-col items-center justify-center text-white cursor-pointer select-none focus:outline-none transition-transform active:scale-95 ${
            isEmergencyActive ? 'animate-pulse ring-8 ring-[#FF304F]/50' : ''
          }`}
        >
          <Zap className="w-10 h-10 mb-1 fill-white drop-shadow" />
          <span className="text-3xl font-black tracking-widest leading-none drop-shadow-md">
            SOS
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-85 mt-1">
            {isPressing ? `HOLD (${Math.round(pressProgress)}%)` : isEmergencyActive ? 'ACTIVE' : 'PRESS NOW'}
          </span>
        </button>
      </div>

      {/* Real Action Description */}
      <div className="text-center my-2">
        <p className="text-xs text-[#A2B5BF]">
          Logs incident in PostgreSQL, streams GPS breadcrumbs, and records audio/video evidence.
        </p>
      </div>

      {/* Diagnostic Triggers Bar */}
      <div className="w-full mt-4 pt-4 border-t border-[#24434A]/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-[#708792] uppercase tracking-wider">
            Diagnostic Hardware Test Suite
          </span>
          <span className="text-[10px] text-[#00E6A0] bg-[#00E6A0]/10 px-2 py-0.5 rounded-full border border-[#00E6A0]/20">
            No Contacts Alerted
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onSafeTest('SHAKE')}
            className="p-2 rounded-xl bg-[#142B35] hover:bg-[#1A3644] border border-[#24434A] hover:border-[#00E6A0]/30 transition text-center flex flex-col items-center justify-center gap-1 group"
          >
            <Smartphone className="w-4 h-4 text-[#A2B5BF] group-hover:text-[#00E6A0]" />
            <span className="text-[10px] font-medium text-[#A2B5BF] group-hover:text-[#F4FAFA]">
              Shake Sensor
            </span>
          </button>

          <button
            onClick={() => onSafeTest('SIREN')}
            className="p-2 rounded-xl bg-[#142B35] hover:bg-[#1A3644] border border-[#24434A] hover:border-[#35DDF2]/30 transition text-center flex flex-col items-center justify-center gap-1 group"
          >
            <Volume2 className="w-4 h-4 text-[#A2B5BF] group-hover:text-[#35DDF2]" />
            <span className="text-[10px] font-medium text-[#A2B5BF] group-hover:text-[#F4FAFA]">
              Audio Siren
            </span>
          </button>

          <button
            onClick={() => onSafeTest('CLOUD_PING')}
            className="p-2 rounded-xl bg-[#142B35] hover:bg-[#1A3644] border border-[#24434A] hover:border-[#78FFD0]/30 transition text-center flex flex-col items-center justify-center gap-1 group"
          >
            <Zap className="w-4 h-4 text-[#A2B5BF] group-hover:text-[#78FFD0]" />
            <span className="text-[10px] font-medium text-[#A2B5BF] group-hover:text-[#F4FAFA]">
              Cloud Latency
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
