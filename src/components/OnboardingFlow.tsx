import React, { useState } from 'react';
import { supabaseEmulator } from '../utils/supabaseEmulator';
import { UserProfile } from '../types';
import { ChevronRight, ChevronLeft, Award, TrendingUp, ShieldAlert, Coins, Target, Sparkles } from 'lucide-react';

interface OnboardingFlowProps {
  currentUser: UserProfile;
  onOnboardingComplete: (user: UserProfile) => void;
}

export default function OnboardingFlow({ currentUser, onOnboardingComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Form State
  const [tradingExperience, setTradingExperience] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [markets, setMarkets] = useState<string[]>(['Crypto', 'Stocks']);
  const [tradingStyle, setTradingStyle] = useState<'Scalping' | 'Intraday' | 'Swing' | 'Position Trading'>('Intraday');
  const [tradingCapital, setTradingCapital] = useState<number>(50000);
  const [riskTolerance, setRiskTolerance] = useState<'Conservative' | 'Moderate' | 'Aggressive'>('Moderate');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleMarket = (m: string) => {
    if (markets.includes(m)) {
      setMarkets(markets.filter((item) => item !== m));
    } else {
      setMarkets([...markets, m]);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (markets.length === 0) {
      setError('Please select at least one primary trading market.');
      return;
    }
    if (tradingCapital <= 0) {
      setError('Please specify a positive initial capital allocation.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await supabaseEmulator.submitOnboarding({
        tradingExperience,
        markets,
        tradingStyle,
        tradingCapital,
        riskTolerance,
      });

      if (res.success && res.user) {
        onOnboardingComplete(res.user);
      } else {
        setError(res.error || 'Failed to preserve profile data.');
      }
    } catch (err) {
      setError('An error occurred during state preservation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="onboarding-root" className="min-h-screen bg-black text-slate-100 flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Decorative ambient gradients */}
      <div id="onboarding-glow-1" className="absolute w-[600px] h-[600px] bg-blue-950/20 rounded-full blur-[140px] top-1/4 -left-40 pointer-events-none" />
      <div id="onboarding-glow-2" className="absolute w-[500px] h-[500px] bg-cyan-950/10 rounded-full blur-[120px] bottom-10 -right-20 pointer-events-none" />
      
      <div id="onboarding-card-wrap" className="w-full max-w-2xl z-10">
        
        {/* Onboarding Header */}
        <div id="onboarding-header" className="text-center mb-8">
          <div id="onboarding-spark-wrap" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-950/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Terminal Initialization</span>
          </div>
          <h1 id="onboarding-title" className="text-2xl font-bold tracking-tight text-white">
            Configure Your Quantitative Profile
          </h1>
          <p id="onboarding-desc" className="text-xs text-slate-400 mt-1">
            Let AlphaQuant align its risk modeling, level detection, and conviction algorithms to your style.
          </p>

          {/* Stepper Progress bar */}
          <div id="stepper-progress" className="max-w-xs mx-auto mt-6 flex items-center justify-between relative">
            <div className="absolute left-0 right-0 h-0.5 bg-slate-900 -z-10" />
            <div 
              className="absolute left-0 h-0.5 bg-blue-500 transition-all duration-300 -z-10" 
              style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
            />
            {[1, 2, 3].map((num) => (
              <div 
                key={num} 
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step >= num 
                    ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]' 
                    : 'bg-slate-950 border border-slate-800 text-slate-500'
                }`}
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        {/* Form panel glass box */}
        <div id="onboarding-glass-box" className="border border-slate-800/80 bg-slate-950/70 backdrop-blur-xl rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
          <div id="onboarding-decor-line" className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

          {error && (
            <div id="onboarding-error" className="mb-6 p-3 rounded-lg border border-red-950 bg-red-950/20 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* STEP 1: Experience & Style */}
          {step === 1 && (
            <div id="onboarding-step-1" className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-500" /> Trading Experience level
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setTradingExperience(lvl)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        tradingExperience === lvl
                          ? 'border-blue-500 bg-blue-950/20 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.1)]'
                          : 'border-slate-900 bg-slate-900/40 text-slate-400 hover:border-slate-800 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="font-semibold text-sm text-slate-200 mb-1">{lvl}</div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        {lvl === 'Beginner' && 'Focus on clear level safety'}
                        {lvl === 'Intermediate' && 'Balanced structures & sweeps'}
                        {lvl === 'Advanced' && 'Advanced institutional order block setup'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-200 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" /> Operational Trading Style
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {(['Scalping', 'Intraday', 'Swing', 'Position Trading'] as const).map((styleOpt) => (
                    <button
                      key={styleOpt}
                      type="button"
                      onClick={() => setTradingStyle(styleOpt)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        tradingStyle === styleOpt
                          ? 'border-blue-500 bg-blue-950/20 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.1)]'
                          : 'border-slate-900 bg-slate-900/40 text-slate-400 hover:border-slate-800 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="font-semibold text-sm text-slate-200 mb-0.5">{styleOpt}</div>
                      <span className="text-[10px] text-slate-500 leading-tight">
                        {styleOpt === 'Scalping' && 'Seconds to minutes. Tight, rapid setups.'}
                        {styleOpt === 'Intraday' && 'Hours. Open/close on same trading day.'}
                        {styleOpt === 'Swing' && 'Days to weeks. Riding medium structural trends.'}
                        {styleOpt === 'Position Trading' && 'Weeks to months. Long term macro positions.'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Markets */}
          {step === 2 && (
            <div id="onboarding-step-2" className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 mb-2 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" /> Target Assets & Markets
                </h3>
                <p className="text-xs text-slate-500 mb-4">Select all global asset classes you intend to track & analyze.</p>
                <div className="grid grid-cols-2 gap-3">
                  {['Crypto', 'Forex', 'Stocks', 'Indices'].map((mkt) => {
                    const isSelected = markets.includes(mkt);
                    return (
                      <button
                        key={mkt}
                        type="button"
                        onClick={() => toggleMarket(mkt)}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 bg-blue-950/20 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.1)]'
                            : 'border-slate-900 bg-slate-900/40 text-slate-400 hover:border-slate-800 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-slate-200">{mkt}</span>
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${
                            isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-800'
                          }`}>
                            {isSelected && '✓'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 leading-snug">
                          {mkt === 'Crypto' && 'BTC, ETH, Altcoins. High beta volatility.'}
                          {mkt === 'Forex' && 'G10 pairs, metals, safe-haven gold flow.'}
                          {mkt === 'Stocks' && 'US Equities, sector rotation benchmarks.'}
                          {mkt === 'Indices' && 'S&P 500, NASDAQ, Dow Jones aggregates.'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Capital & Risk */}
          {step === 3 && (
            <div id="onboarding-step-3" className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-2 uppercase tracking-wider flex items-center gap-2">
                    <Coins className="w-4 h-4 text-blue-500" /> Active Trading Capital
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-3">Allocated trading liquidity for position sizing recommendations.</p>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-bold">€ / $</span>
                    <input
                      type="number"
                      value={tradingCapital}
                      onChange={(e) => setTradingCapital(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="10000"
                      className="w-full bg-slate-900/50 border border-slate-800 focus:border-blue-500 rounded-lg pl-14 pr-4 py-2 text-sm text-slate-100 outline-none transition-colors"
                      min="1"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[10000, 50000, 100000, 500000].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setTradingCapital(v)}
                        className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 py-1 px-2 rounded cursor-pointer"
                      >
                        {v.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-2 uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-blue-500" /> Risk Tolerance Model
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-3">Defines the default risk percentage applied per generated setup.</p>
                  <div className="space-y-2">
                    {(['Conservative', 'Moderate', 'Aggressive'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRiskTolerance(r)}
                        className={`w-full p-2.5 rounded-lg border text-left transition-all flex justify-between items-center cursor-pointer ${
                          riskTolerance === r
                            ? 'border-blue-500 bg-blue-950/20 text-blue-400'
                            : 'border-slate-900 bg-slate-900/40 text-slate-400'
                        }`}
                      >
                        <div>
                          <span className="font-semibold text-xs text-slate-200 block">{r}</span>
                          <span className="text-[9px] text-slate-500">
                            {r === 'Conservative' && 'Risk 0.5% - 1.0% per setup'}
                            {r === 'Moderate' && 'Risk 1.0% - 2.0% per setup'}
                            {r === 'Aggressive' && 'Risk 2.0% - 3.0% per setup'}
                          </span>
                        </div>
                        <span className={`w-3 h-3 rounded-full ${
                          riskTolerance === r ? 'bg-blue-500' : 'bg-slate-800'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Actions */}
          <div id="stepper-actions" className="mt-8 pt-6 border-t border-slate-900/80 flex justify-between">
            <button
              id="onboarding-back"
              type="button"
              onClick={handleBack}
              disabled={step === 1 || loading}
              className="px-4 py-2 border border-slate-800 hover:border-slate-700 disabled:opacity-30 rounded-lg text-xs text-slate-400 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            {step < totalSteps ? (
              <button
                id="onboarding-next"
                type="button"
                onClick={handleNext}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1 shadow-lg shadow-blue-900/20 cursor-pointer"
              >
                Continue <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                id="onboarding-submit"
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs flex items-center gap-1 shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Initialize Terminal Console <Sparkles className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
