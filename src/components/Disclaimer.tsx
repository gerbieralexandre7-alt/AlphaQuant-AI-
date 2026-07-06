import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div id="disclaimer-container" className="mt-8 border border-slate-800 bg-slate-950/60 backdrop-blur-md rounded-lg p-4 flex gap-3 text-xs text-slate-400 leading-relaxed shadow-lg">
      <ShieldAlert id="disclaimer-icon" className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
      <div id="disclaimer-text">
        <span className="font-semibold text-slate-200 block mb-1 uppercase tracking-wider text-[10px]">Disclaimer</span>
        AlphaQuant IA provides market analysis and educational insights only. Nothing presented on this platform constitutes financial, investment, or trading advice. Trading financial markets carries high risk of capital loss. Past performance is not indicative of future results.
      </div>
    </div>
  );
}
