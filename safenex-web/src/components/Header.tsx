import React from 'react';
import { Shield, Zap, RefreshCw, UserCheck, User } from 'lucide-react';
import { ScreenType, SupabaseHealth, UserProfile } from '../types';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onTriggerSos: () => void;
  supabaseHealth: SupabaseHealth;
  onCheckSupabase: () => void;
  user: UserProfile;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  onTriggerSos,
  supabaseHealth,
  onCheckSupabase,
  user,
}) => {
  const navItems: { id: ScreenType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'console', label: 'Safety Console' },
    { id: 'history', label: 'Incident History' },
    { id: 'ble', label: 'BLE Band' },
    { id: 'guardians', label: 'Guardians' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#070D12]/90 backdrop-blur-xl border-b border-[#24434A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('overview')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-[#101F29] to-[#142B35] border border-[#00E6A0]/40 shadow-emerald-glow">
              <Shield className="w-5 h-5 text-[#00E6A0]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#35DDF2] animate-ping" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#F4FAFA] via-[#78FFD0] to-[#35DDF2]">
                  SAFENEX
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-[#00E6A0]/15 text-[#00E6A0] border border-[#00E6A0]/30">
                  PRODUCTION
                </span>
              </div>
              <span className="text-[10px] font-medium text-[#708792] hidden sm:inline">
                Personal Emergency Safety Ecosystem
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#0B151D] p-1.5 rounded-2xl border border-[#24434A]/80 shadow-inner">
            {navItems.map((item) => {
              const active = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-[#142B35] to-[#1A3644] text-[#00E6A0] border border-[#00E6A0]/30 shadow-sm'
                      : 'text-[#A2B5BF] hover:text-[#F4FAFA] hover:bg-[#142B35]/50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Header Area */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Live Supabase Connection Indicator */}
            <button
              onClick={onCheckSupabase}
              title="Click to re-ping Supabase PostgreSQL"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101F29] border border-[#24434A] text-xs transition hover:border-[#00E6A0]/40 group cursor-pointer"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  supabaseHealth.status === 'online'
                    ? 'bg-[#00E6A0] animate-pulse shadow-[0_0_8px_#00E6A0]'
                    : supabaseHealth.status === 'checking'
                    ? 'bg-yellow-400 animate-pulse'
                    : 'bg-[#FF304F]'
                }`}
              />
              <span className="text-[11px] font-mono text-[#A2B5BF] group-hover:text-[#F4FAFA]">
                {supabaseHealth.status === 'online'
                  ? `Cloud ${supabaseHealth.latencyMs}ms`
                  : supabaseHealth.status === 'checking'
                  ? 'Ping...'
                  : 'Cloud Offline'}
              </span>
              <RefreshCw className="w-3 h-3 text-[#708792] group-hover:rotate-180 transition-transform" />
            </button>

            {/* Authenticated User Pill */}
            <div
              onClick={() => onNavigate('auth')}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101F29] border border-[#24434A] text-xs cursor-pointer hover:border-[#35DDF2]/40 transition"
              title={user.isAnonymous ? 'Click to Sign In with Supabase' : 'Account Details'}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00E6A0] to-[#35DDF2] text-[#070D12] font-black text-[10px] flex items-center justify-center">
                {user.isAnonymous ? <User className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold text-[#F4FAFA] leading-none">
                  {user.name || 'Sign In'}
                </span>
                <span className="text-[9px] text-[#708792] leading-none mt-0.5">
                  {user.isAnonymous ? 'Local Offline Mode' : user.email}
                </span>
              </div>
            </div>

            {/* Prominent Red SOS Header Shortcut */}
            <button
              onClick={onTriggerSos}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl btn-sos-gradient text-white text-xs font-black tracking-wider flex items-center gap-1.5 shadow-red-glow hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>SOS</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
