import React, { useState } from 'react';
import { Shield, Lock, Mail, User, ArrowRight, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { UserProfile } from '../types';

interface AuthPageProps {
  user: UserProfile;
  onAuthSuccess: (user: UserProfile) => void;
  onContinueOffline: () => void;
  onSignOut: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  user,
  onAuthSuccess,
  onContinueOffline,
  onSignOut,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full name.');
          setIsLoading(false);
          return;
        }
        const res = await supabaseService.signUp(email.trim(), password, fullName.trim());
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg('Account registered! Check your email for verification or sign in.');
          setIsSignUp(false);
        }
      } else {
        const res = await supabaseService.signIn(email.trim(), password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          const authUser = await supabaseService.getCurrentUser();
          if (authUser) {
            onAuthSuccess(authUser);
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-12 flex flex-col items-center">
      {/* Brand Icon */}
      <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-[#101F29] to-[#142B35] border border-[#00E6A0]/40 flex items-center justify-center text-[#00E6A0] shadow-emerald-glow mb-4">
        <Shield className="w-7 h-7" />
      </div>

      <h2 className="text-2xl font-black text-[#F4FAFA] tracking-tight text-center">
        {user.isAnonymous ? 'SafeNex Cloud Account' : 'Authenticated Profile'}
      </h2>
      <p className="text-xs text-[#A2B5BF] text-center mt-1 mb-6">
        {user.isAnonymous
          ? 'Sign in to link emergency incidents and guardian alerts to your verified cloud identity.'
          : `Signed in as ${user.email}`}
      </p>

      {!user.isAnonymous ? (
        /* Signed In State */
        <div className="w-full glass-panel rounded-3xl p-6 border border-[#00E6A0]/30 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#00E6A0]/15 text-[#00E6A0] border border-[#00E6A0]/30 flex items-center justify-center font-bold text-sm">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#F4FAFA]">{user.name}</h4>
              <p className="text-xs text-[#A2B5BF] font-mono">{user.email}</p>
              <span className="text-[10px] font-mono text-[#00E6A0] bg-[#00E6A0]/10 px-2 py-0.5 rounded-full border border-[#00E6A0]/20">
                Verified Supabase Auth
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#24434A] flex flex-col gap-2">
            <button
              onClick={onContinueOffline}
              className="w-full py-2.5 rounded-xl btn-emerald-gradient text-xs font-bold shadow-md cursor-pointer"
            >
              Go to Safety Dashboard
            </button>
            <button
              onClick={onSignOut}
              className="w-full py-2.5 rounded-xl bg-[#142B35] hover:bg-[#FF304F]/20 text-[#A2B5BF] hover:text-[#FF304F] border border-[#24434A] text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Account</span>
            </button>
          </div>
        </div>
      ) : (
        /* Login / Register Form */
        <form onSubmit={handleSubmit} className="w-full glass-panel rounded-3xl p-6 border border-[#24434A] shadow-card space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-[#FF304F]/10 border border-[#FF304F]/30 text-xs text-[#FF304F] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-[#00E6A0]/10 border border-[#00E6A0]/30 text-xs text-[#00E6A0] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-[#A2B5BF] mb-1">Full Legal Name *</label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-4 h-4 text-[#708792]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0B151D] border border-[#24434A] text-xs text-[#F4FAFA] focus:outline-none focus:border-[#00E6A0]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#A2B5BF] mb-1">Email Address *</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-[#708792]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0B151D] border border-[#24434A] text-xs text-[#F4FAFA] focus:outline-none focus:border-[#00E6A0]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A2B5BF] mb-1">Password *</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-[#708792]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0B151D] border border-[#24434A] text-xs text-[#F4FAFA] focus:outline-none focus:border-[#00E6A0]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl btn-emerald-gradient text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            <span>{isLoading ? 'Processing...' : isSignUp ? 'Create SafeNex Account' : 'Sign In to SafeNex'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg(null);
              }}
              className="text-xs text-[#35DDF2] hover:underline cursor-pointer"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Register here'}
            </button>
          </div>

          <div className="pt-3 border-t border-[#24434A] text-center">
            <button
              type="button"
              onClick={onContinueOffline}
              className="text-xs text-[#A2B5BF] hover:text-[#00E6A0] transition cursor-pointer"
            >
              Skip & Continue in Local Offline Mode →
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

