import React from 'react';
import { RefreshCw, Radio, AlertCircle, ShieldAlert } from 'lucide-react';

interface MarketTerminalHeaderProps {
  lastUpdated: string;
  dataSource: string;
  marketStatus: {
    stocks: 'Open' | 'Closed';
    forex: 'Open' | 'Closed';
    crypto: 'Open' | 'Closed';
  };
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export default function MarketTerminalHeader({
  lastUpdated,
  dataSource,
  marketStatus,
  loading,
  error,
  onRefresh,
  isRefreshing = false
}: MarketTerminalHeaderProps) {
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'SYS SYNC';
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Error alert banner */}
      {error && (
        <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 flex items-center justify-between animate-fadeIn text-xs">
          <div className="flex items-center gap-2.5 text-red-400">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <div>
              <span className="font-bold uppercase tracking-wider block">Network Feed Disturbed</span>
              <p className="text-slate-400 text-[11px] mt-0.5">Connection timeout. {error}</p>
            </div>
          </div>
          <button 
            onClick={onRefresh}
            className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 border border-red-500/20 text-[10px] text-red-400 uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer"
          >
            Re-Establish Link
          </button>
        </div>
      )}

      {/* Main Terminal Bar */}
      <div className="border border-slate-900 bg-slate-950/60 backdrop-blur-md rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm relative overflow-hidden">
        {/* Glow indicator decoration */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-blue-500 to-cyan-500" />

        {/* Left: Live Connection & Data Source */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className={`absolute w-2.5 h-2.5 rounded-full ${error ? 'bg-red-500' : 'bg-emerald-500'} opacity-75 animate-ping`} />
            <span className={`relative w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-emerald-500'}`} />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider font-bold">Terminal Connection:</span>
              <span className={`text-[10px] font-mono font-bold uppercase ${error ? 'text-red-400' : 'text-emerald-400'}`}>
                {error ? 'DORMANT' : 'LIVE FEED ACTIVE'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Radio className="w-3 h-3 text-blue-500 shrink-0" />
              <span>Source: <b className="text-slate-300 font-sans">{dataSource}</b></span>
            </div>
          </div>
        </div>

        {/* Middle: Sovereign Market Statuses */}
        <div className="flex flex-wrap gap-2.5 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 bg-slate-900/50 border border-slate-850 px-2.5 py-1.5 rounded-lg">
            <span className="text-slate-500 uppercase">STOCKS:</span>
            <span className={`font-bold px-1 rounded text-[9px] uppercase ${
              marketStatus.stocks === 'Open' ? 'bg-emerald-950/40 text-emerald-400' : 'bg-slate-800 text-slate-400'
            }`}>
              {marketStatus.stocks}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/50 border border-slate-850 px-2.5 py-1.5 rounded-lg">
            <span className="text-slate-500 uppercase">FOREX:</span>
            <span className={`font-bold px-1 rounded text-[9px] uppercase ${
              marketStatus.forex === 'Open' ? 'bg-emerald-950/40 text-emerald-400' : 'bg-slate-800 text-slate-400'
            }`}>
              {marketStatus.forex}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/50 border border-slate-850 px-2.5 py-1.5 rounded-lg">
            <span className="text-slate-500 uppercase">CRYPTO:</span>
            <span className="font-bold px-1 rounded text-[9px] bg-emerald-950/40 text-emerald-400 uppercase">
              24/7/365
            </span>
          </div>
        </div>

        {/* Right: Last Sync & Interactive Button */}
        <div className="flex items-center gap-3.5 ml-auto sm:ml-0">
          <div className="text-right space-y-0.5 font-mono text-[10px]">
            <span className="text-slate-500 uppercase block">Last Feed Sync</span>
            <span className="text-slate-300 font-bold block">{formatTime(lastUpdated)}</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading || isRefreshing}
            className="p-2.5 bg-slate-900 hover:bg-slate-850 active:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center"
            title="Manual Intel Pull"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
