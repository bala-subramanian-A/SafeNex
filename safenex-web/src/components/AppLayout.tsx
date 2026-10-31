import React from 'react';
import { ScreenType, UserProfile, ToastMessage, SupabaseHealth } from '../types';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNavigation } from './BottomNavigation';
import { Toast } from './Toast';

interface AppLayoutProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  user: UserProfile;
  supabaseHealth: SupabaseHealth;
  onCheckSupabase: () => void;
  onTriggerSos: () => void;
  toasts: ToastMessage[];
  onDismissToast: (id: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentScreen,
  onNavigate,
  user,
  supabaseHealth,
  onCheckSupabase,
  onTriggerSos,
  toasts,
  onDismissToast,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#070D12] text-[#F4FAFA] flex flex-col antialiased">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={onDismissToast} />

      {/* Top Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={onNavigate}
        onTriggerSos={onTriggerSos}
        supabaseHealth={supabaseHealth}
        onCheckSupabase={onCheckSupabase}
        user={user}
      />

      {/* Main Container with Sidebar & Content */}
      <div className="flex-1 flex w-full">
        <Sidebar
          currentScreen={currentScreen}
          onNavigate={onNavigate}
          user={user}
          onTriggerSos={onTriggerSos}
        />

        <main className="flex-1 w-full min-h-[calc(100vh-80px)] pb-24 lg:pb-10 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <BottomNavigation currentScreen={currentScreen} onNavigate={onNavigate} />
    </div>
  );
};
