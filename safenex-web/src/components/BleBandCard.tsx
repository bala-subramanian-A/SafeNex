import React from 'react';
import { Watch, Battery, Bluetooth, Loader2, AlertCircle } from 'lucide-react';
import { BleBandState } from '../types';

interface BleBandCardProps {
  bandState: BleBandState;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const BleBandCard: React.FC<BleBandCardProps> = ({
  bandState,
  onConnect,
  onDisconnect,
}) => {
  return (
    <div className="glass-panel rounded-3xl p-5 border border-[#24434A] shadow-card flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2.5 rounded-xl border ${
            bandState.connected
              ? 'bg-[#00E6A0]/10 border-[#00E6A0]/30 text-[#00E6A0]'
              : 'bg-[#142B35] border-[#24434A] text-[#708792]'
          }`}>
            <Watch className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#F4FAFA] tracking-wide">
              WEARABLE BLE BAND
            </h4>
            <p className="text-[11px] text-[#A2B5BF]">
              {bandState.connected 
                ? bandState.name 
                : bandState.serviceAvailable 
                ? 'ESP32 Hardware Disconnected' 
                : 'Web Bluetooth Unsupported'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${
            bandState.connected ? 'bg-[#00E6A0] animate-pulse' : 'bg-[#708792]'
          }`} />
          <span className="text-[11px] font-mono text-[#A2B5BF]">
            {bandState.connected ? 'CONNECTED' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* Status Box */}
      <div className="my-2 p-3 rounded-2xl bg-[#0B151D]/80 border border-[#24434A]/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Battery className={`w-4 h-4 ${bandState.batteryLevel !== null ? 'text-[#00E6A0]' : 'text-[#708792]'}`} />
          <span className="text-xs font-semibold text-[#F4FAFA]">
            {bandState.batteryLevel !== null ? `${bandState.batteryLevel}% Battery` : 'Battery N/A'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#A2B5BF]">
          <Bluetooth className="w-3.5 h-3.5 text-[#35DDF2]" />
          <span>{bandState.connected ? 'GATT Active' : '2.4GHz BLE'}</span>
        </div>
      </div>

      {/* Error or Browser Warning Banner if any */}
      {bandState.scanError && (
        <div className="mb-2 p-2 rounded-xl bg-[#FF304F]/10 border border-[#FF304F]/30 text-[11px] text-[#FF304F] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{bandState.scanError}</span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-2">
        {bandState.connected ? (
          <button
            onClick={onDisconnect}
            className="w-full py-2 px-3 rounded-xl bg-[#142B35] hover:bg-[#1A3644] border border-[#24434A] text-[#A2B5BF] hover:text-[#FF304F] text-xs font-semibold transition cursor-pointer"
          >
            Disconnect Wristband
          </button>
        ) : (
          <button
            onClick={onConnect}
            disabled={bandState.isScanning}
            className="w-full py-2.5 px-4 rounded-xl btn-emerald-gradient flex items-center justify-center gap-2 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
          >
            {bandState.isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Scanning for SafeNex Band...</span>
              </>
            ) : (
              <>
                <Bluetooth className="w-4 h-4" />
                <span>Pair Physical ESP32 Band</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
