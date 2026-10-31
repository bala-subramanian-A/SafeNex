import React, { useState } from 'react';
import { Route, Clock, CheckCircle2, AlertOctagon, Plus } from 'lucide-react';
import { CommuteSession } from '../types';

interface CommuteSafetyCardProps {
  session: CommuteSession;
  onStartSession: (dest: string, minutes: number) => void;
  onCancelSession: () => void;
  onExtendSession: (extraMinutes: number) => void;
  onConfirmArrival: () => void;
}

export const CommuteSafetyCard: React.FC<CommuteSafetyCardProps> = ({
  session,
  onStartSession,
  onCancelSession,
  onExtendSession,
  onConfirmArrival,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<number>(15);
  const [destinationInput, setDestinationInput] = useState('Walking to Apartment 4B');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel rounded-3xl p-5 border border-[#24434A] shadow-card flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-[#35DDF2]/10 border border-[#35DDF2]/30 text-[#35DDF2]">
            <Route className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#F4FAFA] tracking-wide">
              COMMUTE SAFETY MODE
            </h4>
            <p className="text-[11px] text-[#A2B5BF]">Dead-man arrival check-in timer</p>
          </div>
        </div>

        {session.isActive && (
          <span className="px-2.5 py-0.5 rounded-full bg-[#00E6A0]/15 border border-[#00E6A0]/30 text-[10px] font-mono text-[#00E6A0] animate-pulse">
            TRACKING
          </span>
        )}
      </div>

      {session.isActive ? (
        /* Active Timer View */
        <div className="my-2 p-4 rounded-2xl bg-[#0B151D]/90 border border-[#24434A] flex flex-col items-center">
          <div className="text-center mb-2">
            <span className="text-xs font-semibold text-[#A2B5BF]">Destination</span>
            <p className="text-sm font-bold text-[#F4FAFA]">{session.destination}</p>
          </div>

          {/* Time Display */}
          <div className="my-2 flex flex-col items-center">
            <span className="text-3xl font-black font-mono tracking-wider text-[#35DDF2]">
              {formatTime(session.remainingSeconds)}
            </span>
            <span className="text-[11px] text-[#708792]">Time until arrival check-in</span>
          </div>

          {/* Overdue Warning */}
          {session.isOverdue && (
            <div className="w-full mt-2 p-2 rounded-xl bg-[#FF304F]/20 border border-[#FF304F] text-[#FF304F] text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
              <AlertOctagon className="w-4 h-4" />
              <span>Overdue! Check-in or SOS in {session.overdueCountdown}s</span>
            </div>
          )}

          {/* Active Buttons */}
          <div className="w-full mt-4 flex items-center gap-2">
            <button
              onClick={onConfirmArrival}
              className="flex-1 py-2.5 rounded-xl bg-[#00E6A0] hover:bg-[#78FFD0] text-[#070D12] text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Arrived Safely</span>
            </button>
            <button
              onClick={() => onExtendSession(5)}
              className="py-2.5 px-3 rounded-xl bg-[#142B35] hover:bg-[#1A3644] border border-[#24434A] text-[#F4FAFA] text-xs font-semibold transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-[#35DDF2]" />
              <span>+5m</span>
            </button>
            <button
              onClick={onCancelSession}
              className="py-2.5 px-3 rounded-xl bg-[#142B35] hover:bg-[#1A3644] border border-[#24434A] text-[#A2B5BF] hover:text-[#FF304F] text-xs font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Preset Configuration View */
        <div className="my-2 flex flex-col gap-3">
          <input
            type="text"
            value={destinationInput}
            onChange={(e) => setDestinationInput(e.target.value)}
            placeholder="Where are you heading?"
            className="w-full px-3 py-2 rounded-xl bg-[#0B151D] border border-[#24434A] text-xs text-[#F4FAFA] focus:outline-none focus:border-[#00E6A0]"
          />

          <div className="grid grid-cols-3 gap-2">
            {[10, 15, 30].map((mins) => (
              <button
                key={mins}
                onClick={() => setSelectedPreset(mins)}
                className={`py-2 rounded-xl text-xs font-semibold border transition ${
                  selectedPreset === mins
                    ? 'bg-[#00E6A0]/15 border-[#00E6A0] text-[#00E6A0]'
                    : 'bg-[#142B35] border-[#24434A] text-[#A2B5BF] hover:border-[#35DDF2]/40'
                }`}
              >
                {mins} mins
              </button>
            ))}
          </div>

          <button
            onClick={() => onStartSession(destinationInput, selectedPreset)}
            className="w-full py-2.5 rounded-xl btn-emerald-gradient text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Arm Commute Arrival Timer</span>
          </button>
        </div>
      )}
    </div>
  );
};
