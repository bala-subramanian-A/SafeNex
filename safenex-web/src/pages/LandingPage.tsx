import React from 'react';
import {
  Shield,
  ArrowRight,
  Lock,
  Watch,
  Zap,
} from 'lucide-react';
import { ScreenType } from '../types';

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigateTo?: (screen: ScreenType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const scrollToFeatures = () => {
    const el = document.getElementById('features-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#070D12] text-[#F4FAFA] flex flex-col relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00E6A0]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#35DDF2]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Floating Glass Header */}
      <header className="sticky top-0 z-30 bg-[#070D12]/90 backdrop-blur-md border-b border-[#24434A] px-5 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#101F29] border border-[#00E6A0]/30 flex items-center justify-center text-[#00E6A0] shadow-emerald-glow">
              <Shield className="w-5 h-5 fill-[#00E6A0]/20 text-[#00E6A0]" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight text-[#F4FAFA]">SafeNex</span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00E6A0]/15 text-[#00E6A0] border border-[#00E6A0]/30">
                PRODUCTION
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onGetStarted}
              className="px-5 py-2 rounded-full btn-emerald-gradient text-xs font-black tracking-wide shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              Open Safety Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-5 sm:px-8 py-12 lg:py-20 flex flex-col items-center text-center">
        {/* Status Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#101F29] border border-[#24434A] text-xs font-semibold text-[#00E6A0] mb-8 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-[#00E6A0] animate-pulse" />
          <span>Next-Generation Mission-Critical Personal Safety Platform</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#F4FAFA] max-w-4xl leading-tight mb-6">
          Your Safety.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E6A0] via-[#78FFD0] to-[#35DDF2]">
            Always Protected.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[#A2B5BF] max-w-2xl leading-relaxed mb-10">
          ESP32 BLE hardware wristband panic triggers, continuous satellite GPS breadcrumbs, 
          1200Hz acoustic siren deterrents, and cloud blackbox evidence synced to Supabase.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl btn-emerald-gradient text-sm font-extrabold flex items-center justify-center space-x-3 shadow-emerald-glow hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span>Launch Safety Console</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={scrollToFeatures}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#101F29] hover:bg-[#142B35] border border-[#24434A] text-sm font-bold text-[#F4FAFA] hover:text-[#00E6A0] transition-colors cursor-pointer"
          >
            Explore Ecosystem
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div id="features-section" className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-7 rounded-3xl glass-panel border border-[#24434A] hover:border-[#00E6A0]/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-[#142B35] border border-[#00E6A0]/30 flex items-center justify-center text-[#00E6A0] mb-5 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 fill-[#00E6A0]/20" />
            </div>
            <h3 className="text-lg font-bold text-[#F4FAFA] mb-2">1-Tap Emergency SOS</h3>
            <p className="text-xs text-[#A2B5BF] leading-relaxed">
              Instant dispatch of live satellite coordinates to your emergency guardians with loud 1200Hz acoustic siren deterrent and tactical optical strobe.
            </p>
          </div>

          <div className="p-7 rounded-3xl glass-panel border border-[#24434A] hover:border-[#35DDF2]/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-[#142B35] border border-[#35DDF2]/30 flex items-center justify-center text-[#35DDF2] mb-5 group-hover:scale-110 transition-transform">
              <Watch className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F4FAFA] mb-2">ESP32 BLE Wristband</h3>
            <p className="text-xs text-[#A2B5BF] leading-relaxed">
              Discreet hardware panic button and IMU fall-detection accelerometer connected over real Web Bluetooth Low Energy.
            </p>
          </div>

          <div className="p-7 rounded-3xl glass-panel border border-[#24434A] hover:border-[#78FFD0]/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-[#142B35] border border-[#78FFD0]/30 flex items-center justify-center text-[#78FFD0] mb-5 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F4FAFA] mb-2">Cryptographic Stand-Down</h3>
            <p className="text-xs text-[#A2B5BF] leading-relaxed">
              Salted SHA-256 PIN architecture prevents false disarms. Continuous GPS breadcrumbs stream directly to PostgreSQL cloud tables.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#24434A] py-6 px-5 sm:px-8 text-center text-xs text-[#708792]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SafeNex Personal Emergency System © 2026.</span>
          <span className="font-mono text-[#00E6A0]">Mission-Critical Architecture</span>
        </div>
      </footer>
    </div>
  );
};
