import React from 'react';
import { Home, ShieldAlert, Watch, Users, Settings, History } from 'lucide-react';
import { ScreenType } from '../types';

interface BottomNavigationProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentScreen,
  onNavigate,
}) => {
  const items: { id: ScreenType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Home className="w-5 h-5" /> },
    { id: 'console', label: 'Console', icon: <ShieldAlert className="w-5 h-5" /> },
    { id: 'ble', label: 'BLE', icon: <Watch className="w-5 h-5" /> },
    { id: 'guardians', label: 'Guardians', icon: <Users className="w-5 h-5" /> },
    { id: 'history', label: 'History', icon: <History className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070D12]/95 backdrop-blur-xl border-t border-[#24434A] px-2 py-1.5 pb-safe shadow-2xl">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#00E6A0] scale-105'
                  : 'text-[#708792] hover:text-[#A2B5BF]'
              }`}
            >
              <div className="relative">
                {item.icon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#00E6A0] shadow-[0_0_8px_#00E6A0]" />
                )}
              </div>
              <span className="text-[10px] font-semibold mt-1 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
