import React from 'react';
import { 
  Home, 
  ShieldAlert, 
  History, 
  Watch, 
  Users, 
  Settings, 
  Shield, 
  Zap,
  KeyRound
} from 'lucide-react';
import { ScreenType, UserProfile } from '../types';

interface SidebarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  user: UserProfile;
  onTriggerSos: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentScreen, 
  onNavigate, 
  user,
  onTriggerSos 
}) => {
  const navItems: { id: ScreenType; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Home className="w-4 h-4" />,
    },
    {
      id: 'console',
      label: 'Safety Console',
      icon: <ShieldAlert className="w-4 h-4" />,
      badge: 'Tactical',
    },
    {
      id: 'history',
      label: 'Incident History',
      icon: <History className="w-4 h-4" />,
    },
    {
      id: 'ble',
      label: 'BLE Wristband',
      icon: <Watch className="w-4 h-4" />,
      badge: 'ESP32',
    },
    {
      id: 'guardians',
      label: 'Guardians Network',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Safety Settings',
      icon: <Settings className="w-4 h-4" />,
    },
    {
      id: 'auth',
      label: user.isAnonymous ? 'Sign In / Account' : 'Account Profile',
      icon: <KeyRound className="w-4 h-4" />,
      badge: user.isAnonymous ? 'Offline' : 'Cloud',
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col justify-between w-64 xl:w-72 bg-[#0B151D] border-r border-[#24434A] p-5 h-screen sticky top-0 shrink-0 z-30">
      {/* Top Brand Logo */}
      <div className="space-y-6">
        <div
          onClick={() => onNavigate('overview')}
          className="flex items-center space-x-3 cursor-pointer group transition-transform active:scale-95"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#101F29] to-[#142B35] border border-[#00E6A0]/40 flex items-center justify-center text-[#00E6A0] shadow-emerald-glow group-hover:border-[#00E6A0] transition-colors">
            <Shield className="w-6 h-6 fill-[#00E6A0]/20 text-[#00E6A0]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#F4FAFA] via-[#78FFD0] to-[#35DDF2]">
                SAFENEX
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#00E6A0]/15 text-[#00E6A0] border border-[#00E6A0]/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-[#708792] font-medium">Mission-Critical Safety</p>
          </div>
        </div>

        {/* SOS Panic Trigger Button in Sidebar */}
        <button
          onClick={onTriggerSos}
          className="w-full py-3 px-4 rounded-2xl btn-sos-gradient text-white text-xs font-black tracking-widest flex items-center justify-center gap-2 shadow-red-glow hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>TRIGGER SOS</span>
        </button>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#708792] px-3 pb-1">
            DESTINATIONS
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#142B35] to-[#1A3644] text-[#00E6A0] border border-[#00E6A0]/30 shadow-sm font-bold'
                      : 'text-[#A2B5BF] hover:text-[#F4FAFA] hover:bg-[#142B35]/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={isActive ? 'text-[#00E6A0]' : 'text-[#A2B5BF]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-[#00E6A0] text-[#070D12] font-black'
                          : 'bg-[#142B35] text-[#35DDF2]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Profile Widget */}
      <div className="pt-4 border-t border-[#24434A] space-y-3">
        <div
          onClick={() => onNavigate('auth')}
          className="flex items-center space-x-3 p-3 rounded-2xl bg-[#101F29] border border-[#24434A] hover:border-[#00E6A0]/30 transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00E6A0] to-[#35DDF2] text-[#070D12] font-black text-xs flex items-center justify-center group-hover:scale-105 transition-transform">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#F4FAFA] truncate group-hover:text-[#00E6A0] transition-colors">
              {user.name}
            </p>
            <p className="text-[11px] text-[#A2B5BF] truncate">
              {user.isAnonymous ? 'Local User' : user.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
