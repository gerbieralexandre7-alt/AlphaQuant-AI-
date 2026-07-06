import React, { useState, useMemo } from 'react';
import { Search, Globe, ChevronRight, HelpCircle, Activity, BarChart, AlertTriangle, Play, Sparkles, TrendingUp, Calendar, Clock, DollarSign } from 'lucide-react';
import { useLiveMarketData } from '../hooks/useLiveMarketData';
import MarketTerminalHeader from './MarketTerminalHeader';

interface AIResearchViewProps {
  currentUser: any;
}

export default function AIResearchView({ currentUser }: AIResearchViewProps) {
  // Pull live market data from our centralized terminal connection hook
  const { marketData, loading: feedLoading, error: feedError, forceRefresh, lastUpdated, dataSource, marketStatus } = useLiveMarketData(4000);

  const [activeSubTab, setActiveSubTab] = useState<'research' | 'news'>('research');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [newsCategoryFilter, setNewsCategoryFilter] = useState<'All' | 'Macro Economics' | 'Crypto Markets' | 'Forex' | 'Commodities'>('All');

  // Simulated live central bank policy database
  const macroIndicators = [
    { country: 'United States', bank: 'Federal Reserve (Fed)', rate: '5.25% - 5.50%', cpi: '3.1%', gdp: '+2.1%', stance: 'Hawkish Hold', target: '2.0%' },
    { country: 'Eurozone', bank: 'European Central Bank (ECB)', rate: '4.25%', cpi: '2.4%', gdp: '+0.3%', stance: 'Dovish Pivot', target: '2.0%' },
    { country: 'United Kingdom', bank: 'Bank of England (BoE)', rate: '5.25%', cpi: '2.0%', gdp: '+0.2%', stance: 'Neutral Hold', target: '2.0%' },
    { country: 'Japan', bank: 'Bank of Japan (BoJ)', rate: '0.10%', cpi: '2.5%', gdp: '-0.5%', stance: 'Staged Normalization', target: '2.0%' },
  ];

  // Map dynamic live economic calendar events from our hook
  const economicEvents = useMemo(() => {
    if (!marketData || !marketData.economicCalendar) return [];
    return marketData.economicCalendar;
  }, [marketData]);

  // Map dynamic live news stream from our hook
  const newsStories = useMemo(() => {
    if (!marketData || !marketData.news) return [];
    const stories = marketData.news;
    if (newsCategoryFilter === 'All') return stories;
    return stories.filter(s => s.category.toLowerCase().includes(newsCategoryFilter.split(' ')[0].toLowerCase()));
  }, [marketData, newsCategoryFilter]);

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    triggerSearch(term);
  };

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    triggerSearch(query);
  };

  const triggerSearch = async (searchTerm: string) => {
    setLoading(true);
    setReport(null);
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchTerm, userProfile: currentUser })
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-research-view-root" className="space-y-6 animate-fadeIn">
      
      {/* Live Terminal Header */}
      <MarketTerminalHeader 
        lastUpdated={lastUpdated}
        dataSource={dataSource}
        marketStatus={marketStatus}
        loading={feedLoading && !marketData}
        error={feedError}
        onRefresh={forceRefresh}
        isRefreshing={feedLoading}
      />

      {/* Title & Navigation sub-bar */}
      <div id="research-header-panel" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-900 bg-slate-950/80 backdrop-blur-md p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-[150px] bg-[radial-gradient(circle_at_right,rgba(37,99,235,0.03),transparent_70%)] pointer-events-none" />
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" /> Institutional AI Research Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Explore macroeconomic indicators, central bank policies, live search-grounded financial news, and custom semantic correlation models.
          </p>
        </div>

        {/* Sub tabs switcher */}
        <div className="flex bg-slate-900 p-1 border border-slate-850 rounded-xl shrink-0">
          <button
            onClick={() => setActiveSubTab('research')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'research' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Research Mode
          </button>
          <button
            onClick={() => setActiveSubTab('news')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'news' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            News Terminal & Calendar
          </button>
        </div>
      </div>

      {activeSubTab === 'research' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* SEARCH TRIGGER PANEL (5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-slate-900 bg-slate-950/40 backdrop-blur-md rounded-2xl p-5 shadow-md">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4">Formulate Intelligence Inquiry</h3>
              
              <form onSubmit={handleSubmitSearch} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Compare Nasdaq vs Gold, analyze Apple, what are BTC risks..."
                    className="w-full bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none placeholder-slate-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-blue-900/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Synthesizing Quantitative Intelligence...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Execute AI Research Report</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick Inquiry Cards */}
              <div className="mt-6 border-t border-slate-900 pt-5 space-y-3">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">Quick Prompt Suggestions</span>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: 'Study Gold vs Nasdaq Rotation', q: 'Compare Gold vs Nasdaq' },
                    { label: 'Exhaustive Apple Inc. Microstructure', q: 'Analyze Apple Inc. (AAPL)' },
                    { label: 'Sovereign Risks on Bitcoin (BTC)', q: 'What are today\'s macro risks on Bitcoin?' },
                    { label: 'Examine Global Inflation CPI Multiples', q: 'Explain global central bank policies and interest rate trends' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickSearch(item.q)}
                      className="p-3 bg-slate-900/30 hover:bg-slate-900/95 border border-slate-900 hover:border-slate-800 rounded-xl text-left text-xs text-slate-400 hover:text-white transition-all flex justify-between items-center group cursor-pointer"
                    >
                      <span className="font-medium truncate">{item.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform Moat Highlight */}
            <div className="p-4 rounded-2xl border border-blue-950 bg-blue-950/10 text-xs">
              <span className="text-blue-400 font-bold uppercase tracking-wider block mb-1">Decision Support Philosophy</span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                AlphaQuant operates as an institutional decision support tool. Every intelligence report presents a multi-scenario probability spectrum (Bull, Bear, and Base) accompanied by structural invalidation thresholds. We do not provide predictions; we present calculated tactical boundaries.
              </p>
            </div>
          </div>

          {/* RESEARCH OUTPUT SCREEN (7 columns) */}
          <div className="lg:col-span-7">
            {loading ? (
              <div className="border border-slate-900 bg-slate-950/40 rounded-2xl p-16 text-center space-y-4 animate-pulse">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 border-4 border-blue-950 rounded-full" />
                  <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <h3 className="text-sm font-bold text-white font-mono">AlphaQuant Research Core Processing</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-sans">
                  Synthesizing macroeconomic models, cross-market yield indexes, option chain Open Interest spikes, and social volume metrics...
                </p>
              </div>
            ) : report ? (
              <div className="border border-slate-900 bg-slate-950/60 rounded-2xl p-6 space-y-6 animate-fadeIn">
                {/* Report Header */}
                <div className="border-b border-slate-900 pb-4 flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] text-blue-400 font-mono tracking-widest uppercase font-bold">Research Intelligence Brief</span>
                    <h2 className="text-base font-bold text-white mt-1">{report.title}</h2>
                  </div>
                  <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-850 px-2.5 py-1 rounded font-mono">
                    SECURED NODE TERM
                  </span>
                </div>

                {/* Executive Summary */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">Executive Summary</span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-slate-900 font-sans">
                    {report.executiveSummary}
                  </p>
                </div>

                {/* Comparative factors & correlation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                  <div className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 space-y-3">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">Comparative Factors</span>
                    <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4 leading-relaxed">
                      {report.comparativeAnalysis.keyFactors.map((f: string, i: number) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 space-y-3">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block font-sans">Regime Alignment</span>
                    <div>
                      <span className="text-[9px] text-slate-500 block font-mono">System Correlation Matrix</span>
                      <p className="text-xs text-white font-medium mt-0.5 font-mono">{report.comparativeAnalysis.correlationStatus}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">vs Benchmark Index</span>
                      <p className="text-xs text-white font-medium mt-0.5">{report.comparativeAnalysis.benchmarkPerformance}</p>
                    </div>
                  </div>
                </div>

                {/* Macro & Risks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 space-y-2 font-sans">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">Primary Risks Monitored</span>
                    <div className="space-y-1.5">
                      {report.coreRisks.map((r: string, i: number) => (
                        <div key={i} className="flex gap-2 text-xs text-slate-400 leading-relaxed">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 space-y-3">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block font-sans">Macro Drivers</span>
                    <div className="space-y-2 text-xs font-sans">
                      <div>
                        <span className="text-[9px] text-slate-500 block font-mono">Drivers Hierarchy:</span>
                        <p className="text-slate-300 mt-0.5 leading-relaxed">{report.macroDrivers.drivers.join(', ')}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block font-mono">Geopolitical Factor:</span>
                        <p className="text-slate-300 mt-0.5 leading-relaxed">{report.macroDrivers.geopoliticalFactor}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scenarios / Probabilities block */}
                <div className="p-4 rounded-xl border border-blue-950 bg-blue-950/10 space-y-3">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Probability Scenario Engine</span>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-emerald-400 font-bold">Bull Case Scenario</span>
                        <span className="text-white font-bold">{report.probabilities.prob1}% Probability</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${report.probabilities.prob1}%` }} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 font-sans">{report.probabilities.scenario1}</p>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-red-400 font-bold">Bear Case Scenario</span>
                        <span className="text-white font-bold">{report.probabilities.prob2}% Probability</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full rounded-full" style={{ width: `${report.probabilities.prob2}%` }} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 font-sans">{report.probabilities.scenario2}</p>
                    </div>
                  </div>
                </div>

                {/* Tactical Verdict */}
                <div className="p-4 rounded-xl border border-emerald-950 bg-emerald-950/15 font-sans">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold block">Institutional Tactical Verdict</span>
                  <p className="text-xs text-white font-medium mt-1 leading-relaxed">{report.actionableVerdict}</p>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-slate-900 bg-slate-950/20 rounded-2xl p-16 text-center space-y-3">
                <Globe className="w-10 h-10 text-slate-750 mx-auto animate-pulse" />
                <h3 className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Research Terminal Dormant</h3>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Submit an asset class or macro-economic inquiry above. The platform connects directly with real-time semantic analysis to construct a structured tactical report.
                </p>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* LEFT: Central Bank Watch & Economic Events (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Live Economic Calendar */}
            <div className="border border-slate-900 bg-slate-950/40 rounded-2xl p-5 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" /> High-Impact Economic Calendar
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono font-semibold uppercase bg-emerald-950/40 px-2 py-0.5 rounded">AUTO-REFRESH: ACTIVE</span>
              </div>

              <div className="space-y-3">
                {economicEvents.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 font-mono text-xs animate-pulse">Sourcing high-fidelity global calendars...</div>
                ) : (
                  economicEvents.map((item, i) => (
                    <div key={i} className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-2.5 hover:bg-slate-900/60 transition-all font-mono">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">[{item.time}]</span>
                          <span className="bg-slate-850 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-bold">{item.currency}</span>
                          <span className="text-white font-bold font-sans">{item.event}</span>
                        </div>
                        <div className="flex gap-4 text-[11px]">
                          <span>ACT: <b className="text-emerald-400">{item.actual || '-'}</b></span>
                          <span>EXP: <b className="text-slate-400">{item.forecast || '-'}</b></span>
                          <span>PREV: <b className="text-slate-500">{item.previous || '-'}</b></span>
                        </div>
                      </div>
                      <div className="p-2.5 bg-blue-950/10 border-l-2 border-blue-500 text-[11px] text-slate-300 flex items-start gap-1.5 font-sans leading-relaxed">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <b>AI Synthesis & Volatility Forecast:</b> {item.aiVerdict}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Central Bank Monetary Watch */}
            <div className="border border-slate-900 bg-slate-950/40 rounded-2xl p-5 shadow-md">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" /> Central Bank Monetary Policy Watch
              </h3>

              <div className="overflow-x-auto font-sans">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 text-[10px] uppercase font-bold tracking-wider font-mono">
                      <th className="pb-3">Sovereign Authority</th>
                      <th className="pb-3">Benchmark Rate</th>
                      <th className="pb-3">Annualized CPI</th>
                      <th className="pb-3">YoY GDP Output</th>
                      <th className="pb-3">Policy Stance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 font-mono">
                    {macroIndicators.map((bank, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/20">
                        <td className="py-3 font-sans">
                          <span className="font-bold text-white block">{bank.country}</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{bank.bank}</span>
                        </td>
                        <td className="py-3 text-white font-bold">{bank.rate}</td>
                        <td className="py-3 text-slate-300">{bank.cpi} <span className="text-[9px] text-slate-500 block font-sans">Target: {bank.target}</span></td>
                        <td className="py-3 text-slate-400">{bank.gdp}</td>
                        <td className="py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            bank.stance.includes('Hawkish') ? 'bg-red-950/50 text-red-400' : bank.stance.includes('Dovish') ? 'bg-emerald-950/50 text-emerald-400' : 'bg-slate-900 text-slate-400'
                          }`}>
                            {bank.stance}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* RIGHT: Breaking News summarized with impact indicators (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-slate-900 bg-slate-950/40 rounded-2xl p-5 shadow-md space-y-4">
              <div className="flex flex-wrap justify-between items-center pb-2 border-b border-slate-900 gap-2">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-500 animate-pulse" /> News Feed
                </h3>
                
                {/* News category filter */}
                <select
                  value={newsCategoryFilter}
                  onChange={(e) => setNewsCategoryFilter(e.target.value as any)}
                  className="bg-slate-900 border border-slate-850 text-[10px] font-bold font-mono uppercase text-slate-300 px-1.5 py-1 rounded outline-none"
                >
                  <option value="All">All Feed</option>
                  <option value="Macro Economics">Global Macro</option>
                  <option value="Crypto Markets">Cryptocurrency</option>
                  <option value="Forex">Forex Markets</option>
                  <option value="Commodities">Commodities</option>
                </select>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
                {newsStories.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 font-mono text-xs animate-pulse">Sourcing breaking financial intel...</div>
                ) : (
                  newsStories.map((story, i) => (
                    <div key={i} className="p-3 bg-slate-900/40 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 rounded-xl transition-all space-y-2.5">
                      
                      {/* Header */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider font-mono">{story.category}</span>
                          <span className="text-[9px] text-slate-500 font-mono mt-0.5">{story.source} • {story.time}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase shrink-0 ${
                          story.type === 'Bullish' ? 'bg-emerald-950/60 text-emerald-400' : story.type === 'Bearish' ? 'bg-red-950/60 text-red-400' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {story.type}
                        </span>
                      </div>

                      <h4 className="text-[11px] font-bold text-white leading-snug font-sans">{story.title}</h4>

                      {/* Summary */}
                      <p className="text-[10px] text-slate-400 leading-relaxed bg-black/30 p-2.5 rounded border border-slate-900 font-sans">
                        {story.summary}
                      </p>

                      {/* AI explanation insights */}
                      <div className="text-[10px] space-y-1.5 pt-1.5 border-t border-slate-900/50 font-sans">
                        <div className="flex items-start gap-1">
                          <span className="text-slate-500 uppercase font-semibold shrink-0">Why It Matters:</span>
                          <span className="text-slate-300">{story.whyMatters}</span>
                        </div>
                        <div className="flex items-start gap-1">
                          <span className="text-slate-500 uppercase font-semibold shrink-0">Impact Scenario:</span>
                          <span className="text-blue-400 font-medium">{story.potentialImpact}</span>
                        </div>
                        <div className="flex items-start gap-1">
                          <span className="text-slate-500 uppercase font-semibold shrink-0">Affected Assets:</span>
                          <span className="text-slate-200 font-mono text-[9px] font-semibold">{story.affectedAssets}</span>
                        </div>
                        <div className="flex items-center justify-between bg-black/40 p-1.5 rounded font-mono text-[9px] mt-1">
                          <span className="text-slate-500 uppercase">Impact Probability:</span>
                          <span className="text-emerald-400 font-bold">{story.probability}</span>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
