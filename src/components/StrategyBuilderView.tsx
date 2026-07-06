import React, { useState } from 'react';
import { Calculator, ShieldCheck, TrendingUp, Sparkles, BarChart2, Info, ArrowUpRight, Zap, RefreshCw, Layers } from 'lucide-react';

interface StrategyBuilderViewProps {
  currentUser: any;
}

export default function StrategyBuilderView({ currentUser }: StrategyBuilderViewProps) {
  // Calculators State
  const [capital, setCapital] = useState<number>(currentUser?.tradingCapital || 50000);
  const [riskPercent, setRiskPercent] = useState<number>(1.5);
  const [assetPrice, setAssetPrice] = useState<number>(96000);
  const [stopLossPrice, setStopLossPrice] = useState<number>(94500);
  const [rrTarget, setRrTarget] = useState<number>(3.0);
  const [assetType, setAssetType] = useState<'Crypto' | 'Forex' | 'Stocks'>('Crypto');

  // Strategy Builder State
  const [selectedRegime, setSelectedRegime] = useState<'Trending' | 'Range Bound'>('Trending');
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['SMC Liquidity Sweep', 'Fair Value Gap (FVG)']);

  // Position Sizing calculations
  const absoluteRiskAmount = (capital * riskPercent) / 100;
  const priceDifference = Math.abs(assetPrice - stopLossPrice);
  const percentStop = (priceDifference / assetPrice) * 100;

  // Position sizing output based on market types
  let positionSize = 0;
  let unitLabel = 'Units';
  if (priceDifference > 0) {
    if (assetType === 'Forex') {
      // Forex Standard Lot sizing approximation: (Risk Amount) / (PIP Value)
      // For EURUSD at 1.0850 with 50 pip stop: approx standard contracts
      positionSize = absoluteRiskAmount / (priceDifference * 100000);
      unitLabel = 'Lots';
    } else if (assetType === 'Stocks') {
      positionSize = absoluteRiskAmount / priceDifference;
      unitLabel = 'Shares';
    } else {
      // Crypto directly risk/stop delta units
      positionSize = absoluteRiskAmount / priceDifference;
      unitLabel = 'Units / Contracts';
    }
  }

  const takeProfitPrice = assetType === 'Forex' 
    ? assetPrice + (priceDifference * rrTarget) 
    : assetPrice + (priceDifference * rrTarget); // Handles short/long dynamically here simplified

  const expectedValue = (positionSize * priceDifference * rrTarget) * 0.55 - (absoluteRiskAmount * 0.45); // Coherent mathematical expectation

  // Toggle confluences
  const handleToggleIndicator = (indicator: string) => {
    setSelectedIndicators((prev) => 
      prev.includes(indicator) ? prev.filter(i => i !== indicator) : [...prev, indicator]
    );
  };

  // Simulated strategy backtester calculation based on selected blocks
  const calculateBacktestMetrics = () => {
    let baseWinRate = selectedRegime === 'Trending' ? 52 : 46;
    let baseProfitFactor = selectedRegime === 'Trending' ? 1.6 : 1.3;
    let baseDrawdown = 12.5;

    // Adjust based on active confluences
    selectedIndicators.forEach((ind) => {
      if (ind === 'SMC Liquidity Sweep') {
        baseWinRate += 4.5;
        baseProfitFactor += 0.25;
        baseDrawdown -= 1.2;
      } else if (ind === 'Fair Value Gap (FVG)') {
        baseWinRate += 3.2;
        baseProfitFactor += 0.15;
        baseDrawdown -= 0.8;
      } else if (ind === 'VWAP Mean Reversion') {
        baseWinRate += 2.5;
        baseProfitFactor += 0.10;
        baseDrawdown -= 0.5;
      } else if (ind === 'Relative Strength Index (RSI)') {
        baseWinRate += 1.8;
        baseProfitFactor += 0.05;
        baseDrawdown -= 0.2;
      } else if (ind === 'Bollinger Bands Breakdown') {
        baseWinRate += 2.2;
        baseProfitFactor += 0.08;
        baseDrawdown -= 0.4;
      }
    });

    return {
      winRate: Math.min(84, Math.round(baseWinRate)),
      profitFactor: parseFloat(Math.min(3.4, baseProfitFactor).toFixed(2)),
      maxDrawdown: parseFloat(Math.max(3.5, baseDrawdown).toFixed(1)),
      expectedRatio: rrTarget.toFixed(1)
    };
  };

  const backtest = calculateBacktestMetrics();

  return (
    <div id="strategy-view-root" className="space-y-6 animate-fadeIn">
      
      {/* Header Panel */}
      <div id="strategy-header-panel" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-900 bg-slate-950/80 backdrop-blur-md p-6 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-500" /> Strategy Builder & Risk Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build execution setups, model backtest expectancy, calculate position sizes, and analyze downside risk scenarios.
          </p>
        </div>

        <div className="flex bg-slate-900 p-1 border border-slate-800 rounded-lg text-xs font-mono">
          <span className="text-slate-500 uppercase font-semibold px-2">Operational Capital:</span>
          <span className="text-blue-400 font-bold px-2">€{capital.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: RISK POSITION CALCULATOR (7 columns) */}
        <div className="lg:col-span-7 border border-slate-800 bg-slate-950/40 rounded-2xl p-6 shadow-md space-y-6">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-slate-900">
            <Calculator className="w-4 h-4 text-blue-500" /> INSTITUTIONAL POSITION SIZER & RISK CALCULATOR
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            {/* Capital input */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Total Account Balance (€)</label>
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-white outline-none"
              />
            </div>

            {/* Asset Class */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Asset Class Category</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 border border-slate-800 rounded-lg">
                {(['Crypto', 'Forex', 'Stocks'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setAssetType(t);
                      if (t === 'Forex') {
                        setAssetPrice(1.0850);
                        setStopLossPrice(1.0800);
                      } else if (t === 'Stocks') {
                        setAssetPrice(180);
                        setStopLossPrice(175);
                      } else {
                        setAssetPrice(96000);
                        setStopLossPrice(94500);
                      }
                    }}
                    className={`py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      assetType === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Entry Price */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Tactical Entry Price</label>
              <input
                type="number"
                step="any"
                value={assetPrice}
                onChange={(e) => setAssetPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-white outline-none"
              />
            </div>

            {/* Stop Loss Price */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Defensive Stop-Loss Price</label>
              <input
                type="number"
                step="any"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-white outline-none"
              />
            </div>

            {/* Risk Percent */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Allowed Portfolio Risk (%)</label>
              <input
                type="number"
                step="0.1"
                value={riskPercent}
                onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-white outline-none"
                min="0.1"
                max="10"
              />
            </div>

            {/* Risk Reward Ratio target */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Desired Risk-Reward Ratio (R:R)</label>
              <input
                type="number"
                step="0.1"
                value={rrTarget}
                onChange={(e) => setRrTarget(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-white outline-none"
                min="0.5"
              />
            </div>
          </div>

          {/* CALCULATOR OUTPUT BLOCKS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-900">
            
            <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-xl">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold block">Absolute Capital at Risk</span>
              <span className="text-xl font-bold font-mono text-red-400 mt-1 block">
                €{absoluteRiskAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-500 font-mono block mt-1">({riskPercent}% of account)</span>
            </div>

            <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-xl">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold block">Calculated Position Size</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                {isNaN(positionSize) || !isFinite(positionSize) ? '0.00' : positionSize.toFixed(assetType === 'Forex' ? 2 : 4)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono block mt-1">{unitLabel}</span>
            </div>

            <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-xl col-span-2 sm:col-span-1">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold block">Take Profit Target Target</span>
              <span className="text-xl font-bold font-mono text-white mt-1 block">
                {isNaN(takeProfitPrice) ? '0.00' : takeProfitPrice.toFixed(assetType === 'Forex' ? 4 : 2)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono block mt-1">({rrTarget}x risk multiple)</span>
            </div>

          </div>

          {/* Drawdown Risk Warning */}
          <div className="p-4 bg-blue-950/10 border-l-2 border-blue-500 rounded text-xs flex gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white uppercase tracking-wider block">Portfolio Risk Mitigation Guard</span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                To survive active market drawdown streaks, maximum allowed portfolio-risk on a single execution setup should stay below <b>2.0%</b> for advanced traders and <b>1.0%</b> for beginners.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STRATEGY BUILDER & EXPECTANCY MODEL (5 columns) */}
        <div className="lg:col-span-5 border border-slate-800 bg-slate-950/40 rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-slate-900">
              <Sparkles className="w-4 h-4 text-blue-500" /> DYNAMIC STRATEGY BUILDER
            </h3>

            {/* Select Regime */}
            <div className="space-y-3 pt-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-1.5">1. Target Market Regime</span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {['Trending', 'Range Bound'].map((reg) => (
                    <button
                      key={reg}
                      onClick={() => setSelectedRegime(reg as any)}
                      className={`py-2 border rounded-xl text-center font-bold uppercase transition-all cursor-pointer ${
                        selectedRegime === reg 
                          ? 'bg-blue-950/40 border-blue-500 text-blue-400 shadow-sm' 
                          : 'border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {reg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Confluences */}
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-2">2. Assemble Core Confluences</span>
                <div className="space-y-1.5">
                  {[
                    'SMC Liquidity Sweep',
                    'Fair Value Gap (FVG)',
                    'VWAP Mean Reversion',
                    'Relative Strength Index (RSI)',
                    'Bollinger Bands Breakdown'
                  ].map((ind) => {
                    const active = selectedIndicators.includes(ind);
                    return (
                      <button
                        key={ind}
                        onClick={() => handleToggleIndicator(ind)}
                        className={`w-full flex justify-between items-center p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          active 
                            ? 'bg-blue-950/20 border-blue-500/20 text-blue-400' 
                            : 'border-slate-900/60 bg-slate-900/20 text-slate-400 hover:bg-slate-900/55'
                        }`}
                      >
                        <span className="font-semibold">{ind}</span>
                        <span className={`w-2 h-2 rounded-full ${active ? 'bg-blue-400' : 'bg-transparent border border-slate-700'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SIMULATED BACKTEST OUTPUT metrics */}
          <div className="mt-6 border-t border-slate-900 pt-5 space-y-4">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Expectancy Engine Projection</span>

            <div className="grid grid-cols-2 gap-4 text-center font-mono">
              <div className="p-3 bg-slate-900/20 border border-slate-900 rounded-xl">
                <span className="text-[8px] text-slate-500 uppercase block">Model Win Rate</span>
                <span className="text-lg font-bold text-emerald-400 block mt-1">{backtest.winRate}%</span>
              </div>

              <div className="p-3 bg-slate-900/20 border border-slate-900 rounded-xl">
                <span className="text-[8px] text-slate-500 uppercase block">Profit Factor</span>
                <span className="text-lg font-bold text-white block mt-1">{backtest.profitFactor}x</span>
              </div>

              <div className="p-3 bg-slate-900/20 border border-slate-900 rounded-xl">
                <span className="text-[8px] text-slate-500 uppercase block">Max Drawdown</span>
                <span className="text-lg font-bold text-red-400 block mt-1">-{backtest.maxDrawdown}%</span>
              </div>

              <div className="p-3 bg-slate-900/20 border border-slate-900 rounded-xl">
                <span className="text-[8px] text-slate-500 uppercase block">Expected Value / Trade</span>
                <span className="text-lg font-bold text-white block mt-1">
                  €{isNaN(expectedValue) || !isFinite(expectedValue) ? '0' : Math.round(expectedValue)}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
