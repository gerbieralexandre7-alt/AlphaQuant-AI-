import React from 'react';
import { Check, Flame, Shield, HelpCircle, ArrowUpRight } from 'lucide-react';

export default function PricingView() {
  const plans = [
    {
      name: 'Starter License',
      price: '29€',
      period: 'month',
      desc: 'Ideal for beginner retail chart analysts establishing basic level confluences.',
      features: [
        '50 AI Institutional Analyses per month',
        'Standard Market Level Recognition',
        'Basic Risk Calculator sizing',
        'Local browser persistence storage',
        'Standard disclaimer generation'
      ],
      isPopular: false,
      color: 'border-slate-800 bg-slate-950/40'
    },
    {
      name: 'Professional License',
      price: '79€',
      period: 'month',
      desc: 'Optimized for intraday/swing active practitioners demanding unthrottled analytical confluences.',
      features: [
        'UNLIMITED AI Institutional Analyses',
        'Interactive Trading Journal Ledger',
        'Portfolio Watchlist syncing',
        'Liquidity Sweeps & FVG Detection',
        'High-conviction macro contexts',
        'Priority quantitative server threads'
      ],
      isPopular: true,
      color: 'border-blue-500 bg-gradient-to-br from-blue-950/20 to-slate-950/80 shadow-[0_0_30px_rgba(37,99,235,0.15)]'
    },
    {
      name: 'Elite Institutional',
      price: '149€',
      period: 'month',
      desc: 'Engineered for hedge fund analysts and proprietary traders requiring advanced intelligence matrices.',
      features: [
        'Advanced Intelligence Core Integration',
        'Priority API custom endpoints',
        'CoT Institutional Order Flow reports',
        'Dedicated custom risk profiling setups',
        'Dark pool absorption alerts',
        '24/7 dedicated advisor support desk'
      ],
      isPopular: false,
      color: 'border-slate-800 bg-slate-950/40'
    }
  ];

  return (
    <div id="pricing-root" className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header section */}
      <div id="pricing-heading" className="text-center max-w-xl mx-auto space-y-2 mb-10">
        <div id="pricing-badge" className="inline-flex items-center gap-1 bg-blue-950/40 border border-blue-500/20 text-blue-400 text-[10px] px-2.5 py-1 rounded-full uppercase tracking-widest font-semibold">
          <Shield className="w-3.5 h-3.5" /> License Entitlements
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Select Your Quantitative Access Node
        </h1>
        <p className="text-xs text-slate-400">
          Subscribe to unthrottle institutional-grade AI chart screenshot analyzers and trading registers.
        </p>
      </div>

      {/* PLANS GRID */}
      <div id="pricing-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p, idx) => (
          <div 
            key={idx} 
            className={`border rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${p.color}`}
          >
            {/* Popular glowing badge */}
            {p.isPopular && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-0.5">
                <Flame className="w-3 h-3 animate-pulse" /> Popular Choice
              </div>
            )}

            <div>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block mb-1">{p.name}</span>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold text-white font-mono">{p.price}</span>
                <span className="text-xs text-slate-500 font-mono">/ {p.period}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-6 border-b border-slate-900 pb-4">{p.desc}</p>

              <ul className="space-y-2.5 text-xs text-slate-300">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span className="leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <button
                onClick={() => alert(`Operational Sandbox Sandbox Checkout triggered for AlphaQuant ${p.name}. (Integration simulation complete).`)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  p.isPopular 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg' 
                    : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <span>Subscribe Access Node</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ banner */}
      <div id="pricing-faq" className="mt-12 p-5 border border-slate-800 bg-slate-950/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex gap-3 text-left">
          <HelpCircle className="w-8 h-8 text-blue-500 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Looking for Prop Firm Enterprise pricing?</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
              Contact our custom team to hook up AlphaQuant high-conviction models into API keys or MetaTrader terminals.
            </p>
          </div>
        </div>
        <button
          onClick={() => alert('Dispatching inquiries to sales@alphaquant.ia. (Simulation).')}
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs py-2 px-4 rounded-lg transition-colors cursor-pointer"
        >
          Contact quantitative desk
        </button>
      </div>

    </div>
  );
}
