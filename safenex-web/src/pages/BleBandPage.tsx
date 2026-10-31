import React, { useState } from 'react';
import { Watch, Bluetooth, Battery, Radio, Zap, AlertTriangle, Loader2 } from 'lucide-react';
import { BleBandState } from '../types';
import { BLE_SERVICE_UUID, BLE_SOS_CHAR_UUID, BLE_STATUS_CHAR_UUID } from '../lib/constants';
import { bleService } from '../services/bleService';

interface BleBandPageProps {
  bandState: BleBandState;
  onConnect: () => void;
  onDisconnect: () => void;
  onSimulateSos: () => void;
  onNotify?: (title: string, message?: string, type?: any) => void;
}

export const BleBandPage: React.FC<BleBandPageProps> = ({
  bandState,
  onConnect,
  onDisconnect,
  onSimulateSos,
  onNotify,
}) => {
  const [virtualMode, setVirtualMode] = useState(bandState.simulated);

  const toggleVirtualMode = () => {
    const next = !virtualMode;
    setVirtualMode(next);
    bleService.toggleVirtualBand(next);
    if (onNotify) {
      onNotify(
        next ? 'Virtual Hardware Simulator Enabled' : 'Virtual Simulator Disabled',
        next ? 'Testing mode: Simulated ESP32 GATT protocol active.' : 'Scanning for physical hardware.',
        'info'
      );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl glass-panel border border-[#24434A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#00E6A0]/15 text-[#00E6A0]">
              <Watch className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-[#00E6A0] uppercase tracking-wider">
              HARDWARE INTEGRATION
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#F4FAFA]">ESP32 Wearable SafeNex Band</h2>
          <p className="text-xs text-[#A2B5BF] mt-1">
            Direct Web Bluetooth Low Energy GATT communication with tactical panic button and fall sensor.
          </p>
        </div>

        <div>
          {bandState.connected ? (
            <button
              onClick={onDisconnect}
              className="py-2.5 px-4 rounded-2xl bg-[#142B35] hover:bg-[#FF304F]/20 text-xs font-semibold text-[#A2B5BF] hover:text-[#FF304F] border border-[#24434A] transition cursor-pointer"
            >
              Disconnect Band
            </button>
          ) : (
            <button
              onClick={onConnect}
              disabled={bandState.isScanning}
              className="py-2.5 px-4 rounded-2xl btn-emerald-gradient text-xs font-bold flex items-center gap-2 shadow-emerald-glow cursor-pointer disabled:opacity-50"
            >
              {bandState.isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Bluetooth className="w-4 h-4" />
                  <span>Scan & Pair Bluetooth Band</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Browser Warning if Web Bluetooth is unavailable */}
      {!bandState.serviceAvailable && (
        <div className="p-4 rounded-2xl bg-[#FF304F]/10 border border-[#FF304F]/30 text-xs text-[#F4FAFA] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#FF304F] flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-bold text-[#FF304F]">Web Bluetooth Unsupported in this Browser</h5>
            <p className="text-[#A2B5BF] mt-0.5 leading-relaxed">
              Your browser does not expose the Web Bluetooth GATT API. To connect physical ESP32 hardware directly, please open SafeNex in <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> on desktop, or Chrome on Android.
            </p>
          </div>
        </div>
      )}

      {/* Hardware Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-3xl p-6 border border-[#24434A] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#A2B5BF]">Hardware Identity</span>
            <span className={`w-2.5 h-2.5 rounded-full ${
              bandState.connected ? 'bg-[#00E6A0] animate-pulse' : 'bg-[#708792]'
            }`} />
          </div>
          <div className="my-2">
            <h3 className="text-lg font-black text-[#F4FAFA]">{bandState.name}</h3>
            <p className="text-xs text-[#A2B5BF] mt-1">
              {bandState.simulated ? 'Virtual Protocol Simulator' : 'ESP32-WROOM-32E • BLE 5.0'}
            </p>
          </div>
          <div className="pt-3 border-t border-[#24434A] flex items-center justify-between text-xs text-[#708792] font-mono">
            <span>Link State:</span>
            <span className={bandState.connected ? 'text-[#00E6A0] font-bold' : 'text-[#708792]'}>
              {bandState.connected ? (bandState.simulated ? 'SIMULATED' : 'GATT CONNECTED') : 'DISCONNECTED'}
            </span>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-[#24434A] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#A2B5BF]">Hardware Battery</span>
            <Battery className={`w-4 h-4 ${bandState.batteryLevel ? 'text-[#00E6A0]' : 'text-[#708792]'}`} />
          </div>
          <div className="my-2">
            <h3 className="text-2xl font-black font-mono text-[#F4FAFA]">
              {bandState.batteryLevel !== null ? `${bandState.batteryLevel}%` : 'N/A'}
            </h3>
            <p className="text-xs text-[#A2B5BF] mt-1">
              {bandState.batteryLevel !== null ? 'Characteristic 0x7b7a1002 active' : 'Battery status requires pairing'}
            </p>
          </div>
          <div className="pt-3 border-t border-[#24434A] flex items-center justify-between text-xs text-[#708792] font-mono">
            <span>Last Heartbeat:</span>
            <span className="text-[#A2B5BF]">{bandState.lastHeartbeat || 'No packet received'}</span>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-[#24434A] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#A2B5BF]">GATT Protocol</span>
            <Radio className="w-4 h-4 text-[#35DDF2]" />
          </div>
          <div className="my-2">
            <h3 className="text-lg font-black text-[#35DDF2]">SafeNex BLE 5.0</h3>
            <p className="text-xs text-[#A2B5BF] mt-1">SOS Characteristic & Status Monitor</p>
          </div>
          <div className="pt-3 border-t border-[#24434A] flex items-center justify-between text-xs text-[#708792] font-mono">
            <span>Notifications:</span>
            <span className={bandState.connected ? 'text-[#00E6A0]' : 'text-[#708792]'}>
              {bandState.connected ? 'ACTIVE' : 'IDLE'}
            </span>
          </div>
        </div>
      </div>

      {/* GATT UUID Registry */}
      <div className="glass-panel rounded-3xl p-6 border border-[#24434A]">
        <h4 className="text-sm font-bold text-[#F4FAFA] mb-4">ESP32 GATT UUID SPECIFICATION</h4>
        <div className="space-y-3 font-mono text-xs">
          <div className="p-3 rounded-2xl bg-[#0B151D] border border-[#24434A] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-[#A2B5BF]">SafeNex Service UUID:</span>
            <span className="text-[#00E6A0]">{BLE_SERVICE_UUID}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#0B151D] border border-[#24434A] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-[#A2B5BF]">Panic Button Characteristic (Notify):</span>
            <span className="text-[#FF304F]">{BLE_SOS_CHAR_UUID}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#0B151D] border border-[#24434A] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-[#A2B5BF]">Battery & Status Characteristic (Read/Notify):</span>
            <span className="text-[#35DDF2]">{BLE_STATUS_CHAR_UUID}</span>
          </div>
        </div>

        {/* Developer Testing Mode (Explicitly distinguished) */}
        <div className="mt-6 pt-5 border-t border-[#24434A] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#F4FAFA]">Developer Hardware Testing Mode</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#142B35] text-[#35DDF2] border border-[#24434A]">
                Local Only
              </span>
            </div>
            <p className="text-[11px] text-[#A2B5BF] mt-0.5">
              Simulates ESP32 button press characteristics for test environments without physical silicon.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleVirtualMode}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                virtualMode
                  ? 'bg-[#00E6A0]/15 text-[#00E6A0] border-[#00E6A0]'
                  : 'bg-[#142B35] text-[#A2B5BF] border-[#24434A]'
              }`}
            >
              {virtualMode ? 'Virtual Band Active' : 'Enable Virtual Band'}
            </button>

            {virtualMode && (
              <button
                onClick={onSimulateSos}
                className="py-2 px-3 rounded-xl bg-[#FF304F]/20 hover:bg-[#FF304F]/30 border border-[#FF304F]/40 text-[#FF304F] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Trigger Hardware SOS</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
