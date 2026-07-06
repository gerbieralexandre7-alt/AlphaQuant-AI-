import React, { useState } from 'react';
import { supabaseEmulator } from '../utils/supabaseEmulator';
import { UserProfile } from '../types';
import { Lock, Mail, ChevronRight, AlertCircle, Info, ShieldCheck, Flame } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: UserProfile) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!email) {
      setError('Please provide a valid email address.');
      setLoading(false);
      return;
    }

    try {
      if (isForgotPassword) {
        const res = await supabaseEmulator.forgotPassword(email);
        if (res.success) {
          setMessage(res.message || 'Reset link dispatched successfully.');
        } else {
          setError(res.error || 'Recovery failed.');
        }
      } else if (isLogin) {
        const res = await supabaseEmulator.signIn(email, password);
        if (res.success && res.user) {
          onAuthSuccess(res.user);
        } else {
          setError(res.error || 'Authentication failed.');
        }
      } else {
        // Sign Up
        if (password.length < 6) {
          setError('Security policy: Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        const res = await supabaseEmulator.signUp(email, password);
        if (res.success && res.user) {
          onAuthSuccess(res.user);
        } else {
          setError(res.error || 'Registration failed.');
        }
      }
    } catch (err) {
      setError('An unexpected connection issue occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async (role: 'Admin' | 'Trader') => {
    setEmail(role === 'Admin' ? 'admin@alphaquant.ia' : 'beta.trader@goldman.com');
    setPassword('demopass123');
    setIsLogin(true);
    setIsForgotPassword(false);
  };

  return (
    <div id="auth-root" className="min-h-screen bg-black text-slate-100 flex items-center justify-center relative overflow-hidden px-4">
      {/* Premium ambient backdrop glow */}
      <div id="auth-glow-1" className="absolute w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] -top-40 -left-20 pointer-events-none" />
      <div id="auth-glow-2" className="absolute w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[140px] -bottom-45 -right-20 pointer-events-none" />

      {/* Decorative trading terminal grid background */}
      <div id="auth-grid-overlay" className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div id="auth-card-container" className="w-full max-w-md z-10">
        
        {/* Terminal Header Logo */}
        <div id="auth-logo-section" className="text-center mb-8 flex flex-col items-center">
          <div id="logo-icon-wrap" className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] mb-3">
            <Flame id="logo-icon" className="w-7 h-7 text-white animate-pulse" />
          </div>
          <h1 id="app-title" className="text-2xl font-bold tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-blue-400">
            AlphaQuant <span className="text-blue-500 font-extrabold text-sm ml-1 px-1.5 py-0.5 border border-blue-500/30 bg-blue-950/40 rounded">IA</span>
          </h1>
          <p id="app-subtitle" className="text-xs text-slate-400 mt-2 tracking-wide max-w-[280px]">
            Institutional-Grade Trading Intelligence & Chart Screenshot Imbalance Analyzers
          </p>
        </div>

        {/* Main interactive glass container */}
        <div id="auth-glass-box" className="border border-slate-800 bg-slate-950/80 backdrop-blur-xl rounded-2xl p-8 shadow-[0_15px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Accent light bar */}
          <div id="auth-accent-bar" className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

          {/* Form Title */}
          <h2 id="form-heading" className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
            {isForgotPassword ? (
              <span>Recover Core Session</span>
            ) : isLogin ? (
              <span>Institutional Console Login</span>
            ) : (
              <span>Establish Beta Session</span>
            )}
          </h2>

          {/* Alerts */}
          {error && (
            <div id="auth-error-box" className="mb-5 p-3 rounded-lg border border-red-900/50 bg-red-950/30 flex gap-2 text-xs text-red-400 items-center">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div id="auth-msg-box" className="mb-5 p-3 rounded-lg border border-emerald-900/50 bg-emerald-950/30 flex gap-2 text-xs text-emerald-400 items-center">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form id="auth-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label id="email-label" className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                Terminal Email Address
              </label>
              <div id="email-input-wrap" className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.com"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div>
                <div id="pass-label-wrap" className="flex justify-between items-center mb-1.5">
                  <label id="password-label" className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Console Password
                  </label>
                  {isLogin && (
                    <button
                      id="forgot-pass-btn"
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[10px] text-blue-500 hover:text-blue-400 hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div id="password-input-wrap" className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    id="password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all"
                    required={!isForgotPassword}
                  />
                </div>
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-1 shadow-lg hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {isForgotPassword ? 'Transmit Recovery Code' : isLogin ? 'Access Trading Console' : 'Initialize Beta Account'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Screen Actions */}
          <div id="auth-toggle-footer" className="mt-6 pt-6 border-t border-slate-900 text-center text-xs">
            {isForgotPassword ? (
              <button
                id="back-to-login-btn"
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="text-slate-400 hover:text-blue-500 transition-colors"
              >
                Return to Institutional Login
              </button>
            ) : isLogin ? (
              <p id="toggle-to-signup-txt" className="text-slate-500">
                New beta practitioner?{' '}
                <button
                  id="toggle-to-signup-btn"
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-blue-500 hover:text-blue-400 hover:underline font-semibold"
                >
                  Apply for Beta Account
                </button>
              </p>
            ) : (
              <p id="toggle-to-login-txt" className="text-slate-500">
                Already registered?{' '}
                <button
                  id="toggle-to-login-btn"
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-blue-500 hover:text-blue-400 hover:underline font-semibold"
                >
                  Console Sign In
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Demo Fast Login Panel (highly appreciated for sandbox review) */}
        <div id="auth-fast-login-panel" className="mt-6 border border-slate-900 bg-slate-950/40 rounded-xl p-4 text-center">
          <p id="fast-login-title" className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center justify-center gap-1">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            Sandbox Quick Access Accounts
          </p>
          <div id="fast-login-buttons" className="flex gap-2 justify-center">
            <button
              id="fast-login-admin"
              onClick={() => handleTestLogin('Admin')}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] py-1.5 px-3 rounded-lg border border-slate-800 transition-colors cursor-pointer"
            >
              Demo Admin (Full Features)
            </button>
            <button
              id="fast-login-trader"
              onClick={() => handleTestLogin('Trader')}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] py-1.5 px-3 rounded-lg border border-slate-800 transition-colors cursor-pointer"
            >
              Demo Beta Tester
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
