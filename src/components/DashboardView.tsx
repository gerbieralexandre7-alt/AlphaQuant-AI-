import React, { useEffect, useState, useMemo } from 'react';
import { useLiveMarketData, MarketAsset } from '../hooks/useLiveMarketData';
import MarketTerminalHeader from './MarketTerminalHeader';
import { 
  Award, TrendingUp, BarChart3, Clock, ChevronRight, Activity, 
  Globe, DollarSign, ArrowUpRight, ArrowDownRight, RefreshCw, 
  AlertTriangle, ShieldCheck, Flame, Bell, Sparkles, Sliders, Check, Trash2, ShieldAlert
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: any;
  onNavigateToTab: (tab: string) => void;
  onViewAnalysis: (analysis: any) => void;
  savedAnalyses: any[];
  journalEntries: any[];
}

interface AlertRule {
  id: string;
  symbol: string;
  type: 'Above' | 'Below' | 'Volatility' | 'Breakout';
  value: number;
  isActive: boolean;
  createdAt: string;
}

interface TriggeredAlert {
  id: string;
  symbol: string;
  message: string;
  timestamp: string;
  type: 'Bullish' | 'Bearish' | 'Neutral';
}

export default function DashboardView({
  currentUser,
  onNavigateToTab,
  onViewAnalysis,
  savedAnalyses,
  journalEntries
}: DashboardViewProps) {
  // Call our central live market data polling hook
  const { marketData, loading, error, forceRefresh, lastUpdated, dataSource, marketStatus } = useLiveMarketData(3500);

  // Sub-tabs within Dashboard Homepage
  const [dashSubTab, setDashSubTab] = useState<'terminal' | 'briefs' | 'alerts' | 'assets'>('terminal');
  const [selectedBriefTab, setSelectedBriefTab] = useState<'morning' | 'midday' | 'closing' | 'weekly' | 'monthly'>('morning');

  // Interactive Alert Rule Setup state
  const [alertSymbol, setAlertSymbol] = useState('BTC');
  const [alertType, setAlertType] = useState<'Above' | 'Below' | 'Volatility'>('Above');
  const [alertValue, setAlertValue] = useState('');
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState<TriggeredAlert[]>([]);

  // Rolling Bloomberg-style sentinel logs
  const [terminalFeed, setTerminalFeed] = useState<string[]>([
    'SYSTEM: AlphaQuant IA Core initialized. Security protocol active.',
    'ALGO: High-timeframe liquidity sweeps detected below $95,800 on BTCUSD.',
    'FLOW: Spot absorption clusters identified in gold (XAUUSD) demand zones.',
    'MACRO: Bond yields stabilize ahead of scheduled Federal Reserve prints.',
    'ALGO: Order book imbalance shifts 5.2% to bid side on SPY ETF.'
  ]);

  // Load custom alerts from localStorage on mount
  useEffect(() => {
    const savedRules = localStorage.getItem(`aq_alerts_${currentUser.id}`);
    if (savedRules) {
      setAlertRules(JSON.parse(savedRules));
    } else {
      // Default alerts
      const defaultRules: AlertRule[] = [
        { id: 'al_1', symbol: 'BTC', type: 'Above', value: 98000, isActive: true, createdAt: new Date().toISOString() },
        { id: 'al_2', symbol: 'SPY', type: 'Below', value: 508, isActive: true, createdAt: new Date().toISOString() },
        { id: 'al_3', symbol: 'XAUUSD', type: 'Above', value: 2360, isActive: true, createdAt: new Date().toISOString() }
      ];
      setAlertRules(defaultRules);
      localStorage.setItem(`aq_alerts_${currentUser.id}`, JSON.stringify(defaultRules));
    }

    const savedTrig = localStorage.getItem(`aq_triggered_${currentUser.id}`);
    if (savedTrig) {
      setTriggeredAlerts(JSON.parse(savedTrig));
    }
  }, [currentUser.id]);

  // Rolling terminal feed simulation
  useEffect(() => {
    if (!marketData) return;
    const feeds = [
      'FLOW: High-frequency CTA buying flows detected in stock index futures.',
      'ALGO: Fair Value Gap (FVG) mitigated on EURUSD at 1.08420.',
      'NEWS: MicroStrategy acquires additional 12,000 BTC, spot support solidified.',
      'FLOW: Dark pool delta buy orders spike in technology sector block trades.',
      'ALGO: Local swing highs swept on NASDAQ; expecting range consolidation.',
      'ALGO: Heavy block trade trade volume detected on AAPL order book.',
      'FLOW: Safe-haven demand premiums spike gold bidding velocities.'
    ];

    const interval = setInterval(() => {
      const randomMsg = feeds[Math.floor(Math.random() * feeds.length)];
      setTerminalFeed((prev) => [
        `[${new Date().toLocaleTimeString()}] ${randomMsg}`,
        ...prev.slice(0, 5)
      ]);
    }, 12000);

    return () => clearInterval(interval);
  }, [marketData]);

  // Real-Time Alert Engine scanner!
  // Scans incoming marketData price ticks against registered alert rules
  useEffect(() => {
    if (!marketData || !marketData.prices || alertRules.length === 0) return;

    let updatedRules = [...alertRules];
    let triggered: TriggeredAlert[] = [];
    let stateChanged = false;

    updatedRules.forEach((rule) => {
      if (!rule.isActive) return;
      const asset = marketData.prices[rule.symbol];
      if (!asset) return;

      let isTriggered = false;
      let msg = '';

      if (rule.type === 'Above' && asset.price >= rule.value) {
        isTriggered = true;
        msg = `ALERT: ${rule.symbol} crossed ABOVE targeted benchmark of ${rule.value.toLocaleString()} (Active Price: ${asset.price.toLocaleString()})`;
      } else if (rule.type === 'Below' && asset.price <= rule.value) {
        isTriggered = true;
        msg = `ALERT: ${rule.symbol} slid BELOW targeted benchmark of ${rule.value.toLocaleString()} (Active Price: ${asset.price.toLocaleString()})`;
      } else if (rule.type === 'Volatility' && asset.change >= 3) {
        isTriggered = true;
        msg = `ALERT: Volatility anomaly detected on ${rule.symbol}. Price fluctuated ${asset.change.toFixed(2)}% (Active Price: ${asset.price.toLocaleString()})`;
      }

      if (isTriggered) {
        stateChanged = true;
        rule.isActive = false; // Mark triggered / inactive
        
        const newTrig: TriggeredAlert = {
          id: `trig_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          symbol: rule.symbol,
          message: msg,
          timestamp: new Date().toISOString(),
          type: asset.change >= 0 ? 'Bullish' : 'Bearish'
        };
        triggered.push(newTrig);

        // Also push to terminal feeds!
        setTerminalFeed((prev) => [
          `[${new Date().toLocaleTimeString()}] 🚨 TRIGGER: ${msg}`,
          ...prev.slice(0, 5)
        ]);
      }
    });

    if (stateChanged) {
      setAlertRules(updatedRules);
      localStorage.setItem(`aq_alerts_${currentUser.id}`, JSON.stringify(updatedRules));
      
      const newTriggeredList = [...triggered, ...triggeredAlerts].slice(0, 30);
      setTriggeredAlerts(newTriggeredList);
      localStorage.setItem(`aq_triggered_${currentUser.id}`, JSON.stringify(newTriggeredList));
    }
  }, [marketData, alertRules, triggeredAlerts, currentUser.id]);

  // Format price metrics dynamically
  const pricesList = useMemo(() => {
    if (!marketData || !marketData.prices) return [];
    return Object.values(marketData.prices);
  }, [marketData]);

  // Compute stats dynamically from the actual live prices
  const { gainers, losers, activeList, highestVol } = useMemo(() => {
    if (pricesList.length === 0) return { gainers: [], losers: [], activeList: [], highestVol: [] };
    
    const sorted = [...pricesList];
    const gain = [...sorted].sort((a, b) => b.change - a.change).slice(0, 4);
    const lose = [...sorted].sort((a, b) => a.change - b.change).slice(0, 4);
    
    // Most Active defined by simulated volume metrics
    const active = [...sorted]
      .filter(p => p.volume !== 'N/A')
      .sort((a, b) => {
        const valA = parseFloat(a.volume.replace('M', '').replace('K', '')) * (a.volume.includes('K') ? 0.001 : 1);
        const valB = parseFloat(b.volume.replace('M', '').replace('K', '')) * (b.volume.includes('K') ? 0.001 : 1);
        return valB - valA;
      })
      .slice(0, 4);

    const vol = [...sorted]
      .sort((a, b) => {
        const weightA = a.volatility === 'Extreme' ? 4 : a.volatility === 'High' ? 3 : a.volatility === 'Medium' ? 2 : 1;
        const weightB = b.volatility === 'Extreme' ? 4 : b.volatility === 'High' ? 3 : b.volatility === 'Medium' ? 2 : 1;
        return weightB - weightA || Math.abs(b.change) - Math.abs(a.change);
      })
      .slice(0, 4);

    return { gainers: gain, losers: lose, activeList: active, highestVol: vol };
  }, [pricesList]);

  // Account P&L and metrics from journal entries
  const totalAnalyses = savedAnalyses.length + 42; 
  const completedTrades = journalEntries.filter((j) => j.result !== 'Pending');
  const winRate = completedTrades.length > 0 
    ? Math.round((completedTrades.filter((t) => t.result === 'Win').length / completedTrades.length) * 100) 
    : 72;

  const totalPnL = journalEntries.reduce((sum, item) => sum + item.pnl, 0);
  const avgRR = completedTrades.length > 0 
    ? (completedTrades.reduce((sum, item) => sum + item.riskReward, 0) / completedTrades.length).toFixed(1)
    : '2.8';

  const rawConfidence = Math.min(99, Math.max(50, winRate + 8));

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(alertValue);
    if (isNaN(val) || val <= 0) {
      alert('Specify a valid numeric threshold.');
      return;
    }

    const newRule: AlertRule = {
      id: `al_${Date.now()}`,
      symbol: alertSymbol,
      type: alertType,
      value: val,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const updatedRules = [newRule, ...alertRules];
    setAlertRules(updatedRules);
    localStorage.setItem(`aq_alerts_${currentUser.id}`, JSON.stringify(updatedRules));
    setAlertValue('');
  };

  const handleDeleteAlertRule = (id: string) => {
    const updated = alertRules.filter(r => r.id !== id);
    setAlertRules(updated);
    localStorage.setItem(`aq_alerts_${currentUser.id}`, JSON.stringify(updated));
  };

  const handleClearAlertHistory = () => {
    setTriggeredAlerts([]);
    localStorage.removeItem(`aq_triggered_${currentUser.id}`);
  };

  // Custom Simple Markdown Formatter
  const renderBriefMarkdown = (text: string) => {
    if (!text) return <p className="text-slate-500 font-mono text-[11px] animate-pulse">Retrieving strategic brief cache from secure node...</p>;
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('###')) {
        return <h3 key={idx} className="text-sm font-bold text-white mt-5 mb-2.5 pb-1 border-b border-slate-900 font-sans tracking-tight">{trimmed.replace('###', '')}</h3>;
      }
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        return <h4 key={idx} className="text-[11px] font-bold text-blue-400 mt-4 mb-1 font-mono uppercase tracking-wider">{trimmed.replace(/\*\*/g, '')}</h4>;
      }
      if (trimmed.startsWith('*')) {
        return (
          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 pl-3 py-1 font-sans leading-relaxed">
            <span className="text-blue-500 shrink-0 mt-1">•</span>
            <span>{trimmed.replace('*', '').trim()}</span>
          </div>
        );
      }
      if (trimmed === '') return <div key={idx} className="h-3" />;
      return <p key={idx} className="text-xs text-slate-400 leading-relaxed mb-2 font-sans">{trimmed}</p>;
    });
  };

  return (
    <div id="dashboard-root" className="space-y-6 animate-fadeIn">
      
      {/* Live Terminal Header */}
      <MarketTerminalHeader 
        lastUpdated={lastUpdated}
        dataSource={dataSource}
        marketStatus={marketStatus}
        loading={loading && !marketData}
        error={error}
        onRefresh={forceRefresh}
        isRefreshing={loading}
      />

      {/* Account Info Bar */}
      <div id="dashboard-header-panel" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-900 bg-slate-950/40 backdrop-blur-md rounded-2xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-[150px] bg-[radial-gradient(circle_at_right,rgba(37,99,235,0.04),transparent_70%)] pointer-events-none" />
        <div>
          <h1 id="dashboard-welcome" className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            Welcome, Quantitative Officer <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-mono">{currentUser.email.split('@')[0].toUpperCase()}</span>
          </h1>
          <p id="dashboard-subtitle" className="text-xs text-slate-400 mt-1">
            Execution Profile: <span className="text-slate-200 font-semibold">{currentUser.tradingStyle}</span> | Risk Posture: <span className="text-blue-400 font-semibold">{currentUser.riskTolerance}</span>
          </p>
        </div>
        
        {/* Quick action controls */}
        <div id="dashboard-quick-actions" className="flex gap-2 w-full md:w-auto shrink-0 z-10">
          <button
            onClick={() => onNavigateToTab('analyze')}
            className="flex-1 md:flex-none bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold px-4.5 py-2.5 rounded-xl shadow-md shadow-blue-900/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
            <span>Generate AI Report</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-white" />
          </button>
          <button
            onClick={() => onNavigateToTab('journal')}
            className="flex-1 md:flex-none border border-slate-800 bg-slate-900/40 hover:bg-slate-900 text-slate-300 text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Log Trade</span>
          </button>
        </div>
      </div>

      {/* GLOBAL MARKET INDEX BANNER */}
      {marketData && marketData.prices && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {['SPY', 'QQQ', 'DIA', 'IWM', 'XAUUSD', 'US10Y'].map((sym) => {
            const asset = marketData.prices[sym];
            if (!asset) return null;
            const isPos = asset.change >= 0;
            return (
              <div key={sym} className="border border-slate-900 bg-slate-950/30 backdrop-blur-md rounded-xl p-3.5 space-y-1 hover:bg-slate-950/70 transition-all relative">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-500 font-bold">{asset.symbol}</span>
                  <span className={`font-bold px-1 rounded-[3px] text-[9px] ${isPos ? 'bg-emerald-950/40 text-emerald-400' : 'bg-red-950/40 text-red-400'}`}>
                    {isPos ? '+' : ''}{asset.change.toFixed(2)}%
                  </span>
                </div>
                <div className="text-sm font-bold text-white font-mono flex items-baseline justify-between pt-1">
                  <span>
                    {sym === 'US10Y' ? `${asset.price.toFixed(3)}%` : sym.includes('USD') || sym === 'XAUUSD' ? `$${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${asset.price.toFixed(2)}`}
                  </span>
                  <span className="text-[9px] text-slate-500 font-normal truncate max-w-[50px] font-sans">{asset.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MAIN LAYOUT SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Main Dashboard Tabs Content (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* NAVIGATION BAR WITHIN DASHBOARD */}
          <div className="border border-slate-900 bg-slate-950/40 backdrop-blur-md rounded-2xl p-2 flex gap-1 shadow-sm">
            {[
              { id: 'terminal', label: 'Market Intelligence', icon: Activity },
              { id: 'briefs', label: 'AI Intelligence Briefs', icon: Sparkles },
              { id: 'assets', label: 'Sovereign Markets', icon: Globe },
              { id: 'alerts', label: 'Alert Desk', icon: Bell }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setDashSubTab(tab.id as any)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    dashSubTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/10' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: MARKET INTELLIGENCE TERMINAL */}
          {dashSubTab === 'terminal' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Top Gainer/Losers Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gainers */}
                <div className="border border-slate-900 bg-slate-950/40 rounded-2xl p-4.5 space-y-3 shadow-md">
                  <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <TrendingUp className="w-3.5 h-3.5" /> Top Gainers
                  </h3>
                  <div className="divide-y divide-slate-900/60 font-mono text-xs">
                    {gainers.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-[11px]">Loading real market indicators...</div>
                    ) : (
                      gainers.map((g: MarketAsset) => (
                        <div key={g.symbol} className="py-2.5 flex justify-between items-center">
                          <div className="space-y-0.5">
                            <span className="font-bold text-white font-sans">{g.symbol}</span>
                            <span className="text-[9px] text-slate-500 block font-sans">{g.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-200 font-bold">
                              ${g.price.toLocaleString(undefined, { minimumFractionDigits: g.price < 10 ? 4 : 2, maximumFractionDigits: g.price < 10 ? 4 : 2 })}
                            </span>
                            <span className="text-emerald-400 text-[10px] font-bold block">+{g.change.toFixed(2)}%</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Losers */}
                <div className="border border-slate-900 bg-slate-950/40 rounded-2xl p-4.5 space-y-3 shadow-md">
                  <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <ArrowDownRight className="w-3.5 h-3.5" /> Top Losers
                  </h3>
                  <div className="divide-y divide-slate-900/60 font-mono text-xs">
                    {losers.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-[11px]">Loading real market indicators...</div>
                    ) : (
                      losers.map((l: MarketAsset) => (
                        <div key={l.symbol} className="py-2.5 flex justify-between items-center">
                          <div className="space-y-0.5">
                            <span className="font-bold text-white font-sans">{l.symbol}</span>
                            <span className="text-[9px] text-slate-500 block font-sans">{l.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-200 font-bold">
                              ${l.price.toLocaleString(undefined, { minimumFractionDigits: l.price < 10 ? 4 : 2, maximumFractionDigits: l.price < 10 ? 4 : 2 })}
                            </span>
                            <span className="text-red-400 text-[10px] font-bold block">{l.change.toFixed(2)}%</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Heatmap visual list */}
              <div className="border border-slate-900 bg-slate-950/40 rounded-2xl p-5 shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Global Heatmap Matrix</h3>
                  <span className="text-[10px] text-slate-500 font-mono">FLOW CONVECTIVE MAPPING</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {pricesList.slice(0, 12).map((asset) => {
                    const isPos = asset.change >= 0;
                    return (
                      <div 
                        key={asset.symbol} 
                        className={`p-3.5 rounded-xl border flex flex-col justify-between h-20 transition-all cursor-pointer ${
                          isPos 
                            ? 'bg-emerald-950/20 border-emerald-950 hover:bg-emerald-950/30 text-emerald-400' 
                            : 'bg-red-950/20 border-red-950 hover:bg-red-950/30 text-red-400'
                        }`}
                        onClick={() => onNavigateToTab('analyze')}
                      >
                        <div className="flex justify-between items-start font-mono text-[10px] font-bold">
                          <span>{asset.symbol}</span>
                          <span>{isPos ? '+' : ''}{asset.change.toFixed(2)}%</span>
                        </div>
                        <div className="font-mono text-xs font-bold text-white truncate">
                          ${asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.price < 1 ? 4 : 2, maximumFractionDigits: asset.price < 1 ? 4 : 2 })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active / High Volatility Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Active */}
                <div className="border border-slate-900 bg-slate-950/40 rounded-2xl p-4.5 space-y-3 shadow-md">
                  <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <Activity className="w-3.5 h-3.5" /> High Volume Active
                  </h3>
                  <div className="divide-y divide-slate-900/60 font-mono text-xs">
                    {activeList.map((a: MarketAsset) => (
                      <div key={a.symbol} className="py-2.5 flex justify-between items-center">
                        <span className="font-bold text-white font-sans">{a.symbol} <span className="text-[9px] text-slate-500 block font-normal font-sans">{a.name}</span></span>
                        <div className="text-right">
                          <span className="text-slate-300 font-bold">Vol: {a.volume}</span>
                          <span className={`text-[10px] block font-semibold ${a.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            ${a.price.toLocaleString(undefined, { minimumFractionDigits: a.price < 5 ? 3 : 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Volatility */}
                <div className="border border-slate-900 bg-slate-950/40 rounded-2xl p-4.5 space-y-3 shadow-md">
                  <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <Sliders className="w-3.5 h-3.5" /> Volatility Anomalies
                  </h3>
                  <div className="divide-y divide-slate-900/60 font-mono text-xs">
                    {highestVol.map((hv: MarketAsset) => (
                      <div key={hv.symbol} className="py-2.5 flex justify-between items-center">
                        <span className="font-bold text-white font-sans">{hv.symbol} <span className="text-[9px] text-slate-500 block font-normal font-sans">{hv.name}</span></span>
                        <div className="text-right">
                          <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] inline-block uppercase ${
                            hv.volatility === 'Extreme' ? 'bg-red-950/50 text-red-400' : 'bg-purple-950/50 text-purple-400'
                          }`}>{hv.volatility}</span>
                          <span className={`text-[10px] block font-semibold mt-0.5 ${hv.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {hv.change >= 0 ? '+' : ''}{hv.change.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: AI INTELLIGENCE BRIEFS */}
          {dashSubTab === 'briefs' && marketData && (
            <div className="border border-slate-900 bg-slate-950/40 rounded-2xl p-6 shadow-md space-y-6 animate-fadeIn">
              <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-900 pb-4">
                <div>
                  <span className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-wider">AI Grounded Synthesis</span>
                  <h2 className="text-base font-bold text-white mt-0.5">Macro Research & Market Briefs</h2>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Grounded: {new Date(marketData.briefs.lastGenerated).toLocaleString()}</span>
              </div>

              {/* Sub-tabs for specific brief types */}
              <div className="flex flex-wrap gap-1.5 bg-slate-900/40 p-1 rounded-xl border border-slate-900">
                {[
                  { id: 'morning', label: 'Morning Brief' },
                  { id: 'midday', label: 'Midday Brief' },
                  { id: 'closing', label: 'Closing Brief' },
                  { id: 'weekly', label: 'Weekly Outlook' },
                  { id: 'monthly', label: 'Monthly Outlook' }
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBriefTab(b.id as any)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                      selectedBriefTab === b.id 
                        ? 'bg-slate-800 text-white' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Brief Content Display */}
              <div className="p-5 rounded-2xl bg-slate-900/20 border border-slate-900 shadow-inner relative max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                <Sparkles className="absolute right-4 top-4 w-4 h-4 text-blue-500 opacity-20 animate-pulse" />
                <div className="prose prose-invert max-w-none">
                  {renderBriefMarkdown(marketData.briefs[selectedBriefTab])}
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono bg-slate-950/50 p-3 rounded-xl border border-slate-900">
                <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Reports are compiled dynamically via Gemini 3.5 Flash using Search Grounding. AlphaQuant models are advisory; manage leverage risks.</span>
              </div>
            </div>
          )}

          {/* TAB 3: SOVEREIGN ASSETS OVERVIEW */}
          {dashSubTab === 'assets' && (
            <div className="space-y-6 animate-fadeIn">
              {['Stocks', 'Crypto', 'Forex', 'Commodities'].map((assetClass) => {
                const classPrices = pricesList.filter(p => p.type === assetClass);
                return (
                  <div key={assetClass} className="border border-slate-900 bg-slate-950/40 rounded-2xl p-5 shadow-md space-y-4">
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest border-b border-slate-900 pb-2">
                      {assetClass} Market Overview
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300 font-mono">
                        <thead>
                          <tr className="border-b border-slate-900 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                            <th className="pb-2">Asset Symbol</th>
                            <th className="pb-2">Reference Name</th>
                            <th className="pb-2">Live Price</th>
                            <th className="pb-2">Change (%)</th>
                            <th className="pb-2">Volatility Profile</th>
                            <th className="pb-2 text-right">Order flow Stance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900/40">
                          {classPrices.map((p) => {
                            const isPos = p.change >= 0;
                            return (
                              <tr key={p.symbol} className="hover:bg-slate-900/20">
                                <td className="py-2.5 font-bold text-white">{p.symbol}</td>
                                <td className="py-2.5 text-slate-400 text-[11px] font-sans">{p.name}</td>
                                <td className="py-2.5 text-white">
                                  ${p.price.toLocaleString(undefined, { minimumFractionDigits: p.price < 5 ? 3 : 2 })}
                                </td>
                                <td className={`py-2.5 font-bold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {isPos ? '+' : ''}{p.change.toFixed(2)}%
                                </td>
                                <td className="py-2.5">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                                    p.volatility === 'Extreme' ? 'bg-red-950/50 text-red-400' : p.volatility === 'High' ? 'bg-purple-950/50 text-purple-400' : 'bg-slate-900 text-slate-500'
                                  }`}>{p.volatility}</span>
                                </td>
                                <td className="py-2.5 text-right font-sans text-slate-400 text-[11px]">{p.flow}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: ALERT CONTROL DESK */}
          {dashSubTab === 'alerts' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fadeIn">
              
              {/* Alert Creation form */}
              <div className="md:col-span-5 border border-slate-900 bg-slate-950/40 rounded-2xl p-5 shadow-md h-fit">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-500" /> Configure Smart Rule
                </h3>
                
                <form onSubmit={handleCreateAlert} className="space-y-4">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Target Asset</label>
                    <select
                      value={alertSymbol}
                      onChange={(e) => setAlertSymbol(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                    >
                      {pricesList.map(p => (
                        <option key={p.symbol} value={p.symbol}>{p.symbol} - {p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Trigger Condition</label>
                    <select
                      value={alertType}
                      onChange={(e) => setAlertType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                    >
                      <option value="Above">Price Crosses ABOVE</option>
                      <option value="Below">Price Crosses BELOW</option>
                      <option value="Volatility">Volatility Spikes (&gt; 3%)</option>
                    </select>
                  </div>

                  {alertType !== 'Volatility' && (
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Target Value ($)</label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={alertValue}
                        onChange={(e) => setAlertValue(e.target.value)}
                        placeholder="e.g. 98000"
                        className="w-full bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none placeholder-slate-600 font-mono"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-blue-950/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Engage Dynamic Alert</span>
                  </button>
                </form>
              </div>

              {/* Rules List & Trigger Logs */}
              <div className="md:col-span-7 space-y-6">
                
                {/* Active Rules */}
                <div className="border border-slate-900 bg-slate-950/40 rounded-2xl p-5 shadow-md">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-500" /> Active Alert Scanners
                  </h3>
                  
                  {alertRules.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No active rule scanners configured.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                      {alertRules.map((rule) => (
                        <div key={rule.id} className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${rule.isActive ? 'bg-blue-400 animate-pulse' : 'bg-slate-700'}`} />
                            <span className="font-sans font-bold text-white">{rule.symbol}</span>
                            <span className="text-slate-400">{rule.type === 'Volatility' ? 'Volatility Breakout' : `${rule.type} $${rule.value.toLocaleString()}`}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteAlertRule(rule.id)}
                            className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Trigger History Logs */}
                <div className="border border-slate-900 bg-slate-950/40 rounded-2xl p-5 shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                      <Bell className="w-4 h-4 text-red-400" /> Triggered Alert Dispatch
                    </h3>
                    {triggeredAlerts.length > 0 && (
                      <button
                        onClick={handleClearAlertHistory}
                        className="text-[10px] text-red-400 hover:text-red-300 uppercase tracking-wider font-mono font-bold cursor-pointer"
                      >
                        Purge Records
                      </button>
                    )}
                  </div>

                  {triggeredAlerts.length === 0 ? (
                    <p className="text-xs text-slate-500 py-8 text-center">No alert dispatches triggered in this session.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin">
                      {triggeredAlerts.map((log) => (
                        <div key={log.id} className="p-3 bg-red-950/5 border border-red-950/20 rounded-xl text-[11px] leading-relaxed relative overflow-hidden flex flex-col gap-1">
                          <div className="absolute left-0 top-0 bottom-0 w-[2.5px] bg-red-500" />
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                            <span className="font-bold text-red-400 uppercase tracking-widest">DISPATCH TRIGGERED</span>
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <span className="text-slate-300 font-sans">{log.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Terminal Sidebar Widgets (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* FEAR AND GREED INDEX GAUGE */}
          {marketData && (
            <div className="border border-slate-900 bg-slate-950/40 rounded-2xl p-5 shadow-md space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Fear & Greed Index</h3>
                <span className="text-[10px] text-slate-500 font-mono">SENTIMENT REGIME</span>
              </div>

              {/* Dynamic visual indicator gauge */}
              <div className="relative flex flex-col items-center py-4 bg-black/30 border border-slate-900 rounded-2xl">
                {/* Score Dial Circle Representation */}
                <div className="relative w-32 h-16 overflow-hidden">
                  {/* Arc Background */}
                  <div className="absolute inset-0 w-32 h-32 rounded-full border-[10px] border-slate-850" />
                  
                  {/* Dynamic Pointer Line Pin */}
                  <div 
                    className="absolute bottom-0 left-1/2 w-[3px] h-12 bg-gradient-to-t from-blue-500 to-cyan-400 origin-bottom rounded-full transition-transform duration-1000"
                    style={{ transform: `translate(-50%, 0) rotate(${(marketData.fearAndGreed.score / 100) * 180 - 90}deg)` }}
                  />
                  {/* Core Pivot Pin */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-950 border-2 border-slate-700 rounded-full z-10" />
                </div>

                <div className="text-center mt-3 font-mono">
                  <span className="text-2xl font-bold text-white">{marketData.fearAndGreed.score}</span>
                  <span className={`block text-[11px] font-bold uppercase mt-1 ${
                    marketData.fearAndGreed.score >= 60 ? 'text-emerald-400' : marketData.fearAndGreed.score <= 40 ? 'text-red-400' : 'text-slate-300'
                  }`}>
                    {marketData.fearAndGreed.rating}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/10 p-3 rounded-xl border border-slate-900">
                {marketData.fearAndGreed.explanation}
              </p>
            </div>
          )}

          {/* DYNAMIC SECTOR MOMENTUM ROTATION */}
          {marketData && (
            <div className="border border-slate-900 bg-slate-950/40 rounded-2xl p-5 shadow-md space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Sector Momentum Rotation</h3>
                <span className="text-[10px] text-slate-500 font-mono">G10 EQUITIES WEIGHT</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {marketData.sectorPerformance.map((s) => {
                  const isPos = s.change >= 0;
                  return (
                    <div key={s.sector} className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white font-sans">{s.sector}</span>
                        <span className={`text-[10px] font-bold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isPos ? '+' : ''}{s.change.toFixed(2)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isPos ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, Math.max(10, 50 + (s.change * 20)))}%` }} />
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-slate-500 font-sans">
                        <span>Weight: <b>{s.weight}</b></span>
                        <span className={`font-mono text-[9px] px-1 py-0.2 rounded ${
                          s.status === 'Leading' ? 'bg-emerald-950/40 text-emerald-400' : s.status === 'Improving' ? 'bg-blue-950/40 text-blue-400' : 'bg-slate-900 text-slate-500'
                        }`}>{s.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bloomberg terminal flow feed */}
          <div className="border border-slate-900 bg-slate-950/40 rounded-2xl p-5 shadow-md space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" /> LIQUIDITY SENTINEL FEED
            </h3>
            <div className="bg-black/70 border border-slate-900 rounded-xl p-3 font-mono text-[10px] text-emerald-400 space-y-2 h-[150px] overflow-y-auto scrollbar-thin">
              {terminalFeed.map((log, i) => (
                <div key={i} className="leading-relaxed border-b border-slate-900 pb-1 hover:bg-slate-950 p-0.5 rounded transition-all">
                  <span className={log.includes('🚨') ? 'text-red-400' : log.includes('ALGO') ? 'text-blue-400' : log.includes('FLOW') ? 'text-cyan-400' : 'text-emerald-400'}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
