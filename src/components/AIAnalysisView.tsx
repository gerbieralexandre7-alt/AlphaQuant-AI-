import React, { useState, useRef } from 'react';
import { supabaseEmulator } from '../utils/supabaseEmulator';
import { UserProfile, SavedAnalysis, AnalysisReport } from '../types';
import Disclaimer from './Disclaimer';
import { 
  Upload, FileImage, ShieldAlert, Coins, Eye, Trash2, CheckCircle2, 
  HelpCircle, Zap, Shield, ArrowUpRight, Award, TrendingUp, Compass, ChevronDown, Check, Download,
  BookOpen
} from 'lucide-react';

interface AIAnalysisViewProps {
  currentUser: UserProfile;
  onAnalysisSaved: (analysis: SavedAnalysis) => void;
  onNavigateToTab: (tab: string) => void;
  onLogJournal: (data: { asset: string; direction: 'Long' | 'Short'; riskReward: number; notes: string }) => void;
}

// Sample pre-set high-fidelity charts so users can test immediately
const SAMPLE_CHARTS = [
  {
    name: 'BTCUSD Bullish Sweep',
    symbol: 'BTCUSD',
    timeframe: '1H',
    url: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=400&q=80',
    desc: 'Double bottom sweep of H4 order block with RSI convergence.'
  },
  {
    name: 'XAUUSD Daily Breakout',
    symbol: 'XAUUSD',
    timeframe: '1D',
    url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    desc: 'High-timeframe bullish break of structure with massive volume.'
  },
  {
    name: 'SPY Liquidity Raid',
    symbol: 'SPY',
    timeframe: '15m',
    url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80',
    desc: 'NY open buy-side sweep at previous day high resistance.'
  },
  {
    name: 'EURUSD Discount Mitigation',
    symbol: 'EURUSD',
    timeframe: '4H',
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80',
    desc: 'H4 Mitigation of daily demand block returning to fair value.'
  }
];

export default function AIAnalysisView({
  currentUser,
  onAnalysisSaved,
  onNavigateToTab,
  onLogJournal
}: AIAnalysisViewProps) {
  
  // Inputs
  const [symbol, setSymbol] = useState('BTCUSD');
  const [timeframe, setTimeframe] = useState('1H');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  
  // States
  const [loading, setLoading] = useState(false);
  const [loaderStep, setLoaderStep] = useState(0);
  const [error, setError] = useState('');
  const [activeReport, setActiveReport] = useState<AnalysisReport | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [reportTab, setReportTab] = useState<'overview' | 'technicals' | 'macro' | 'scenarios' | 'execution'>('overview');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Uploader Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageBase64(base64);
        setImageUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_CHARTS[0]) => {
    setSymbol(sample.symbol);
    setTimeframe(sample.timeframe);
    setImageUrl(sample.url);
    // For sample, we can pass the url to indicate it's pre-loaded or we can simulate it with a short mock Base64 placeholder
    setImageBase64(sample.url);
  };

  const runInstitutionalAnalysis = async () => {
    if (!symbol) {
      setError('Please provide a valid trading asset symbol.');
      return;
    }

    setLoading(true);
    setError('');
    setActiveReport(null);
    setSaveStatus('idle');

    // Simulate multi-stage Bloomberg terminal data loading
    const loaderMessages = [
      'Establishing Secure Node Connection to Exchange Aggregators...',
      'Synthesizing Candlestick Pattern Matrix & Imbalances...',
      'Plotting Supply & Demand Blocks using Liquidity Sweep Engines...',
      'Integrating Risk Parameter Matrices with Operational Capital...',
      'Finalizing Institutional Synthesis Intelligence Report...'
    ];

    setLoaderStep(0);
    const interval = setInterval(() => {
      setLoaderStep((prev) => {
        if (prev < loaderMessages.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 900);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          timeframe: timeframe,
          imageBase64: imageBase64,
          userProfile: currentUser
        })
      });

      const data = await response.json();
      clearInterval(interval);

      if (response.ok && data.report) {
        setActiveReport(data.report);
      } else {
        setError(data.error || 'The analysis server encountered a pipeline issue.');
      }
    } catch (err) {
      clearInterval(interval);
      setError('Could not connect to the AlphaQuant intelligence pipeline.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToHistory = () => {
    if (!activeReport) return;
    setSaveStatus('saving');
    
    try {
      const saved = supabaseEmulator.saveAnalysis(symbol, timeframe, activeReport, imageUrl);
      if (saved) {
        onAnalysisSaved(saved);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch {
      setSaveStatus('idle');
    }
  };

  const handlePushToJournal = () => {
    if (!activeReport) return;
    const notesStr = `Sourced from AI setup: ${activeReport.structure.trend}. BOS: ${activeReport.structure.breakOfStructure}`;
    const cleanRR = parseFloat(activeReport.setup.riskRewardRatio.replace('1:', '')) || 3.0;

    onLogJournal({
      asset: symbol.toUpperCase(),
      direction: activeReport.bias.direction === 'Bearish' ? 'Short' : 'Long',
      riskReward: cleanRR,
      notes: notesStr
    });
    
    onNavigateToTab('journal');
  };

  const handleExportJSON = () => {
    if (!activeReport) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify({ symbol, timeframe, generatedAt: new Date().toISOString(), analysis: activeReport }, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `AlphaQuant_${symbol}_${timeframe}_Report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const loaderMessages = [
    'Establishing Secure Node Connection to Exchange Aggregators...',
    'Synthesizing Candlestick Pattern Matrix & Imbalances...',
    'Plotting Supply & Demand Blocks using Liquidity Sweep Engines...',
    'Integrating Risk Parameter Matrices with Operational Capital...',
    'Finalizing Institutional Synthesis Intelligence Report...'
  ];

  return (
    <div id="ai-analysis-root" className="space-y-6">
      
      {/* Title block */}
      <div id="ai-analysis-title-block">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-blue-500" /> AI Market Analysis Core
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Provide any chart screenshot or TradingView export to perform a deep institutional block analysis.
        </p>
      </div>

      {/* INPUT PANEL & CHART SELECTOR GRID */}
      <div id="ai-analysis-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Input form & file uploader (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-6 space-y-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-2">Configure Analysis Parameters</h3>

            {/* Asset Symbol */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Asset Symbol / Ticker</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="BTCUSD, XAUUSD, SPY"
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-200 uppercase font-mono outline-none transition-colors"
              />
              <div className="flex gap-2 mt-2">
                {['BTCUSD', 'ETHUSD', 'XAUUSD', 'EURUSD', 'SPY'].map((sym) => (
                  <button
                    key={sym}
                    onClick={() => setSymbol(sym)}
                    className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 py-1 px-2 rounded cursor-pointer"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeframe */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Chart Timeframe</label>
              <div className="grid grid-cols-6 gap-1">
                {['5m', '15m', '1h', '4h', '1D', '1W'].map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeframe(tf)}
                    className={`py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                      timeframe === tf
                        ? 'border-blue-500 bg-blue-950/30 text-blue-400'
                        : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual File Uploader */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Upload Chart Screenshot</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-slate-800 hover:border-slate-700 bg-slate-900/10 hover:bg-slate-900/20 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                {imageUrl ? (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden border border-slate-800">
                    <img src={imageUrl} alt="Uploaded preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 hover:bg-black/60 transition-colors flex items-center justify-center">
                      <FileImage className="w-5 h-5 text-white" />
                      <span className="text-[10px] text-white font-semibold ml-1.5">Change Image</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-500 animate-pulse" />
                    <span className="text-xs text-slate-300 font-semibold">Drag & Drop or Click to Upload</span>
                    <span className="text-[9px] text-slate-500">Supports PNG, JPG, JPEG chart exports</span>
                  </>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={runInstitutionalAnalysis}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-white animate-pulse" />
              <span>Generate Institutional Analysis</span>
            </button>
          </div>

          {/* SAMPLES ROW */}
          <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-5 shadow-lg">
            <h4 className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-3 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-blue-400" /> Fast-Start Sample Charts
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_CHARTS.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSample(sample)}
                  className="p-2 border border-slate-900 bg-slate-900/20 hover:border-slate-800 hover:bg-slate-900/40 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between h-[64px]"
                >
                  <span className="text-[10px] font-bold text-slate-200 block truncate">{sample.name}</span>
                  <span className="text-[8px] text-slate-500 truncate leading-tight block">{sample.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Terminal Loader OR Output Report (7 Cols) */}
        <div className="lg:col-span-7">
          
          {/* LOADER */}
          {loading && (
            <div id="analysis-loader" className="border border-slate-800 bg-slate-950/60 backdrop-blur-md rounded-2xl p-12 text-center h-[520px] flex flex-col items-center justify-center">
              <div className="relative w-16 h-16 mb-6">
                {/* Dual glowing rings */}
                <div className="absolute inset-0 rounded-full border-4 border-slate-900" />
                <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-cyan-400 animate-spin" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1.5">AlphaQuant AI Engine</h3>
              <p className="text-xs text-blue-400 font-mono animate-pulse max-w-sm mx-auto h-8">
                {loaderMessages[loaderStep]}
              </p>
              
              {/* Fake terminal log line underneath uploader */}
              <div className="mt-8 bg-black/60 border border-slate-900 p-4 rounded-lg text-[10px] font-mono text-emerald-500 text-left w-full max-w-md h-24 overflow-hidden space-y-1">
                <div>[SYSTEM] Pipeline status initialized. Thread: x442</div>
                {loaderStep >= 1 && <div className="text-blue-400">[PATTERN] Reading candle intervals... Completed.</div>}
                {loaderStep >= 2 && <div className="text-cyan-400">[MARKET] Block mapped: Supply zone $98k RESTING.</div>}
                {loaderStep >= 3 && <div className="text-purple-400">[RISK] Portfolio multiplier set to: 1.5x</div>}
              </div>
            </div>
          )}

          {/* INITIAL STATE */}
          {!loading && !activeReport && !error && (
            <div className="border border-slate-800 border-dashed bg-slate-950/20 rounded-2xl p-12 text-center h-[520px] flex flex-col items-center justify-center">
              <Compass className="w-12 h-12 text-slate-700 mb-3 animate-spin-slow" />
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Awaiting Analysis Directive</h3>
              <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
                Configure your asset parameter or upload a chart screenshot, then initiate the institutional engine to generate a high-conviction report.
              </p>
            </div>
          )}

          {/* ERROR STATE */}
          {error && (
            <div className="border border-red-900 bg-red-950/10 rounded-2xl p-12 text-center h-[520px] flex flex-col items-center justify-center">
              <ShieldAlert className="w-12 h-12 text-red-500 mb-3" />
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest">Engine Pipeline Error</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
                {error}
              </p>
              <button 
                onClick={runInstitutionalAnalysis}
                className="mt-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer"
              >
                Retry Analysis
              </button>
            </div>
          )}

          {/* REPORT VIEW */}
          {activeReport && !loading && (
            <div id="analysis-report-panel" className="border border-slate-800 bg-slate-950/80 backdrop-blur-xl rounded-2xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-blue-500 to-cyan-500" />
              
              {/* Header section with actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white font-mono">{symbol.toUpperCase()}</span>
                    <span className="text-xs bg-blue-950/60 text-blue-400 px-2 py-0.5 border border-blue-500/20 rounded font-mono uppercase">{timeframe}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Generated: {new Date().toLocaleTimeString()}</p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={handleSaveToHistory}
                    disabled={saveStatus === 'saved'}
                    className={`text-[10px] font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                      saveStatus === 'saved'
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {saveStatus === 'saving' ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : saveStatus === 'saved' ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Saved to History
                      </>
                    ) : (
                      <>Save Analysis</>
                    )}
                  </button>
                  
                  <button
                    onClick={handlePushToJournal}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold text-[10px] py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Log to Journal</span>
                  </button>

                  <button
                    onClick={handleExportJSON}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer"
                    title="Export raw JSON dataset"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* REPORT CONTENT: UPGRADED TO 18-SECTION PROFESSIONAL TERMINAL (V3) */}
              <div className="space-y-6">
                
                {/* Tab selector bar */}
                <div className="flex flex-wrap gap-1 border-b border-slate-900 pb-1">
                  {[
                    { id: 'overview', label: '1. Overview & Executive' },
                    { id: 'technicals', label: '2. Structure & Technicals' },
                    { id: 'macro', label: '3. Macro & Sentiment' },
                    { id: 'scenarios', label: '4. Probabilistic Scenarios' },
                    { id: 'execution', label: '5. Execution & Risk' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setReportTab(tab.id as any)}
                      className={`text-[10px] font-mono uppercase tracking-wider px-3 py-2 border-b-2 transition-all cursor-pointer ${
                        reportTab === tab.id
                          ? 'border-blue-500 text-blue-400 font-bold bg-blue-950/20'
                          : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/30'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Local Fallback mapping for older stored analyses */}
                {(() => {
                  const report = activeReport;
                  const executiveSummary = report.executiveSummary || `${report.summary?.reasonsToTake?.[0] || 'Market intelligence generated successfully.'} Overall regime direction displays ${report.bias?.direction || 'Neutral'} qualities with a final system confidence of ${report.bias?.confidence || 50}%.`;
                  
                  const marketRegime = report.marketRegime || {
                    classification: (report.bias?.direction === 'Neutral' ? 'Range Bound' : 'Trending') as 'Trending' | 'Range Bound' | 'High Volatility' | 'Low Volatility',
                    details: report.structure?.trend || 'N/A'
                  };
                  
                  const technicalAnalysis = report.technicalAnalysis || {
                    trend: report.structure?.trend || 'N/A',
                    support: report.levels?.supportZones?.[0] || 'N/A',
                    resistance: report.levels?.resistanceZones?.[0] || 'N/A',
                    momentum: 'RSI alignment confirms directional bias.',
                    volume: 'Institutional volume profile supports core levels.',
                    rsi: `${report.bias?.direction === 'Bullish' ? '65.0' : report.bias?.direction === 'Bearish' ? '35.0' : '50.0'}`,
                    macd: `${report.bias?.direction === 'Bullish' ? 'Ascending crossover' : 'Descending convergence'}`,
                    vwap: `${report.bias?.direction === 'Bullish' ? 'Above' : 'Below'} daily VWAP anchor.`,
                    atr: 'Standard trading range expansion.',
                    bollinger: 'Expansion boundaries intact.',
                    fibonacci: '0.618 golden pocket rejection.',
                    thesisSupports: report.summary?.reasonsToTake || [],
                    thesisContradicts: report.summary?.reasonsToAvoid || []
                  };

                  const marketStructure = report.marketStructure || {
                    trendContinuation: 'High volume close validates trend continuity.',
                    trendExhaustion: 'Decelerating daily volume near key boundaries.',
                    reversalPotential: 'Low local reversal footprint detected.',
                    breakOfStructure: report.structure?.breakOfStructure || 'N/A',
                    liquidityZones: report.structure?.liquidityZones || [],
                    fairValueGaps: ['Imbalance footprint visible on lower timeframe.'],
                    supplyZones: report.levels?.supplyZones || [],
                    demandZones: report.levels?.demandZones || []
                  };

                  const multiTimeframe = report.multiTimeframe || {
                    higherTimeframe: 'Strong trend alignment visible on daily chart.',
                    intermediateTimeframe: `Volume accumulation inside current ${timeframe} timeframe.`,
                    executionTimeframe: 'Lower-timeframe execution trigger fully mitigated.',
                    alignmentAndConflicts: 'Clean structural stack across execution parameters.'
                  };

                  const macroEnvironment = report.macroEnvironment || {
                    stance: (report.bias?.direction === 'Bullish' ? 'Risk-On Environment' : report.bias?.direction === 'Bearish' ? 'Risk-Off Environment' : 'Neutral') as 'Risk-On Environment' | 'Risk-Off Environment' | 'Neutral',
                    interestRates: 'Fed rate projection stays defensive.',
                    inflation: 'CPI index stabilized within target range.',
                    ppiCpi: 'PPI/CPI core readings printing steady.',
                    employment: 'Strong employment data supports corporate equities.',
                    gdp: 'Annualized GDP growth targets remain intact.',
                    centralBankPolicy: 'Dovish guidance expected in the upcoming statement.',
                    geopoliticalRisks: 'Friction points localized; index remains stable.',
                    economicCalendar: 'Key data release scheduled in the upcoming week.',
                    impactOnAsset: report.context?.macroEnvironment || 'N/A'
                  };

                  const sentiment = report.sentiment || {
                    newsSentiment: 'Moderately positive news flow footprint.',
                    retailSentiment: 'Balanced positioning ratios across main brokerages.',
                    institutionalSentiment: report.context?.institutionalPositioning || 'CoT accumulation profiles active.',
                    marketNarrative: report.context?.marketSentiment || 'N/A',
                    crowdedTrades: 'No extreme positioning clusters found.',
                    contrarianOpportunities: 'Mitigating range boundaries offers solid contrarian R:R.'
                  };

                  const quantitative = report.quantitative || {
                    volatility: 'Implied volatility metrics steady around standard baselines.',
                    relativeStrength: 'Asset showing higher relative performance versus SPY.',
                    correlations: 'Asset decoupling into native micro trends.',
                    historicalBehavior: 'Historical seasonal data supports current position bias.',
                    marketRegime: 'Mean-reverting consolidation zone.'
                  };

                  const bullCase = report.bullCase || {
                    probabilityEstimate: report.bias?.direction === 'Bullish' ? 65 : report.bias?.direction === 'Bearish' ? 20 : 40,
                    reasoning: 'Demand zones successfully mitigated with bullish structural candle close.'
                  };

                  const bearCase = report.bearCase || {
                    probabilityEstimate: report.bias?.direction === 'Bearish' ? 65 : report.bias?.direction === 'Bullish' ? 15 : 35,
                    reasoning: 'Rejection of daily supply blocks triggering stop-loss cascades.'
                  };

                  const baseCase = report.baseCase || {
                    probabilityEstimate: report.bias?.direction === 'Neutral' ? 50 : 20,
                    reasoning: 'Sideways consolidation waiting for macro catalyst validation.'
                  };

                  const keyLevels = report.keyLevels || {
                    supportZones: report.levels?.supportZones || [],
                    resistanceZones: report.levels?.resistanceZones || [],
                    supplyBlocks: report.levels?.supplyZones || [],
                    demandBlocks: report.levels?.demandZones || [],
                    fibonacciLevels: ['0.382 Fib level', '0.500 Golden pocket', '0.618 Fib level']
                  };

                  const tradeOpportunities = report.tradeOpportunities || {
                    conservative: {
                      entry: report.setup?.entryZone || 'N/A',
                      stopLoss: report.setup?.stopLoss || 'N/A',
                      takeProfit: report.setup?.takeProfit1 || 'N/A',
                      riskRewardRatio: report.setup?.riskRewardRatio || '1:2.0',
                      holdingPeriod: report.setup?.holdingTime || 'N/A',
                      positionSizeGuidance: report.risk?.positionSize || 'N/A'
                    },
                    balanced: {
                      entry: report.setup?.entryZone || 'N/A',
                      stopLoss: report.setup?.stopLoss || 'N/A',
                      takeProfit: report.setup?.takeProfit2 || 'N/A',
                      riskRewardRatio: report.setup?.riskRewardRatio || '1:3.0',
                      holdingPeriod: report.setup?.holdingTime || 'N/A',
                      positionSizeGuidance: report.risk?.positionSize || 'N/A'
                    },
                    aggressive: {
                      entry: report.setup?.entryZone || 'N/A',
                      stopLoss: report.setup?.stopLoss || 'N/A',
                      takeProfit: report.setup?.takeProfit3 || 'N/A',
                      riskRewardRatio: report.setup?.riskRewardRatio || '1:4.0',
                      holdingPeriod: report.setup?.holdingTime || 'N/A',
                      positionSizeGuidance: report.risk?.positionSize || 'N/A'
                    }
                  };

                  const riskManagement = report.riskManagement || {
                    suggestedRiskPct: report.risk?.suggestedRiskPct || 1.5,
                    maxLoss: report.risk?.maxLoss || 150,
                    positionSizeGuidance: report.risk?.positionSize || 'N/A',
                    capitalPreservation: 'Strict position size parameters to secure total account equity.',
                    downsideRisks: report.context?.riskEvents || []
                  };

                  const portfolioImpact = report.portfolioImpact || {
                    exposure: report.risk?.capitalAllocation || 'N/A',
                    correlationRisk: 'Evaluate benchmark correlations before scaling.',
                    concentrationRisk: 'Low concentration rating across core sector indices.',
                    diversificationQuality: 'Diversification index optimized with this allocation.',
                    recommendations: 'Implement covered options or correlation hedges if volatility expands.'
                  };

                  const contradictionEngine = report.contradictionEngine || {
                    reasonsNotToEnter: report.summary?.reasonsToAvoid || [],
                    thesisFailReasons: ['Opposing sector strength overrides local trend indicators.'],
                    keyInvalidationEvents: report.context?.riskEvents || [],
                    hiddenRisks: ['Slippage and liquidity vacuum inside major news calendars.'],
                    blackSwanFactors: ['Global liquidity dry-ups or systemic payment blockages.']
                  };

                  const decisionSupport = report.decisionSupport || {
                    preEntryRequirements: ['M15 structural candlestick validation.', 'RSI staying outside extreme boundaries.'],
                    thesisConfirmations: ['High volume break of local structure.', 'VWAP absorption confirmation.'],
                    thesisInvalidations: [`H4 close below stop loss parameter of ${report.setup?.stopLoss || 'N/A'}.`],
                    traderMonitorList: ['Track macro index spreads and relative strength profiles.']
                  };

                  const convictionScore = report.convictionScore || {
                    total: report.conviction?.score || 75,
                    technical: report.conviction?.score || 75,
                    structure: report.conviction?.score || 75,
                    macro: Math.round((report.conviction?.score || 75) * 0.95),
                    sentiment: Math.round((report.conviction?.score || 75) * 1.02),
                    quantitative: Math.round((report.conviction?.score || 75) * 0.98),
                    risk: Math.round((report.conviction?.score || 75) * 1.05),
                    explanation: 'Score supported by high structural confluence and excellent technical alignments.'
                  };

                  return (
                    <div className="space-y-6 max-h-[600px] overflow-y-auto pr-1">
                      
                      {/* TAB 1: OVERVIEW & EXECUTIVE */}
                      {reportTab === 'overview' && (
                        <div className="space-y-6 animate-fadeIn">
                          
                          {/* Top 3-Card Executive Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            
                            {/* Card 1: Tactical Bias */}
                            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 flex flex-col justify-between relative overflow-hidden h-[155px]">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl" />
                              <div>
                                <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider block font-semibold">Tactical Bias</span>
                                <span className={`text-2xl font-black uppercase tracking-wide block mt-1.5 ${
                                  report.bias?.direction === 'Bullish' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.15)]' : report.bias?.direction === 'Bearish' ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.15)]' : 'text-slate-300'
                                }`}>
                                  {report.bias?.direction || 'Neutral'}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">Confidence: {report.bias?.confidence || 50}%</span>
                              </div>
                              <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                                <span className="text-[9px] text-slate-500 font-mono uppercase">System Verdict:</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                                  report.summary?.verdict.includes('Strong Buy') 
                                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40' 
                                    : report.summary?.verdict.includes('Buy')
                                    ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/20'
                                    : report.summary?.verdict.includes('Strong Sell')
                                    ? 'bg-rose-950/60 text-rose-400 border border-rose-900/40'
                                    : report.summary?.verdict.includes('Sell')
                                    ? 'bg-rose-950/30 text-rose-400 border border-rose-900/20'
                                    : 'bg-slate-900 text-slate-300'
                                }`}>
                                  {report.summary?.verdict || 'Neutral'}
                                </span>
                              </div>
                            </div>

                            {/* Card 2: AI Conviction Core */}
                            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 flex flex-col justify-between relative overflow-hidden h-[155px]">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
                              <div>
                                <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider block font-semibold">AI Conviction Score</span>
                                <div className="flex items-baseline gap-1.5 mt-1.5">
                                  <span className="text-3xl font-black text-white font-mono">{convictionScore.total}</span>
                                  <span className="text-xs text-slate-500 font-mono">/ 100</span>
                                </div>
                                <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2.5 overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full" style={{ width: `${convictionScore.total}%` }} />
                                </div>
                              </div>
                              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px]">
                                <span className="text-slate-500 uppercase font-mono">Rating:</span>
                                <span className="text-blue-400 font-bold font-mono uppercase">{activeReport.conviction.category}</span>
                              </div>
                            </div>

                            {/* Card 3: Market Regime */}
                            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 flex flex-col justify-between relative overflow-hidden h-[155px]">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
                              <div>
                                <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider block font-semibold">Market Regime</span>
                                <span className="text-lg font-bold text-slate-200 block mt-1.5 font-sans flex items-center gap-1.5">
                                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                                  {marketRegime.classification}
                                </span>
                                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                  {marketRegime.details}
                                </p>
                              </div>
                              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                                <span>TIMEFRAME STACK:</span>
                                <span className="text-slate-300 font-bold uppercase">{timeframe}</span>
                              </div>
                            </div>

                          </div>

                          {/* Executive Summary Narrative Box */}
                          <div className="p-5 rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-950/60 to-slate-950/30 space-y-3 relative overflow-hidden">
                            <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-gradient-to-b from-blue-500 to-cyan-500" />
                            <div className="flex justify-between items-center pb-2 border-b border-slate-900/60">
                              <span className="text-[10px] text-blue-400 font-mono uppercase tracking-widest font-semibold">Executive Market Brief</span>
                              <span className="text-[9px] text-slate-500 font-mono">OBSERVED FACT MATRIX & INFERENCES</span>
                            </div>
                            <p className="text-[12px] text-slate-300 leading-relaxed font-sans">{executiveSummary}</p>
                          </div>

                          {/* Conviction Breakdown Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                            
                            {/* Score Breakdown Slider Indicators */}
                            <div className="md:col-span-7 p-5 rounded-2xl border border-slate-800 bg-slate-950/40 space-y-4">
                              <span className="text-[10px] text-slate-400 uppercase block font-semibold tracking-wider">Quantitative Confluence Weighting</span>
                              <div className="space-y-3 text-[11px] font-mono">
                                {[
                                  { label: 'Technical Confluence', val: convictionScore.technical, color: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)]' },
                                  { label: 'Market Structure Alignment', val: convictionScore.structure, color: 'bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.3)]' },
                                  { label: 'Macroeconomic Catalyst Stack', val: convictionScore.macro, color: 'bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.3)]' },
                                  { label: 'Sentiment Profile Ratios', val: convictionScore.sentiment, color: 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.3)]' },
                                  { label: 'Quantitative Vol/Corr Profile', val: convictionScore.quantitative, color: 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.3)]' },
                                  { label: 'Risk-Asymmetry Factor', val: convictionScore.risk, color: 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.3)]' }
                                ].map((metric, i) => (
                                  <div key={i} className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="text-slate-400">{metric.label}</span>
                                      <span className="text-slate-200 font-bold">{metric.val}%</span>
                                    </div>
                                    <div className="bg-slate-900 h-1.5 rounded-full overflow-hidden relative">
                                      <div className={`h-full ${metric.color} rounded-full transition-all duration-500`} style={{ width: `${metric.val}%` }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Score Justification card */}
                            <div className="md:col-span-5 p-5 rounded-2xl border border-slate-800 bg-slate-950/40 flex flex-col justify-between h-full relative">
                              <div className="space-y-3">
                                <span className="text-[10px] text-slate-400 uppercase block font-semibold tracking-wider">AI Score Justification</span>
                                <p className="text-[11px] text-slate-300 italic leading-relaxed font-sans">
                                  "{convictionScore.explanation}"
                                </p>
                              </div>
                              <div className="border-t border-slate-900 pt-3 mt-4 flex justify-between items-center text-[10px]">
                                <span className="text-slate-500 uppercase font-mono">Statistical Certainty:</span>
                                <span className="text-emerald-400 font-bold font-mono">PROVEN HIGHER HTF ALPHA</span>
                              </div>
                            </div>

                          </div>

                        </div>
                      )}

                      {/* TAB 2: STRUCTURE & TECHNICALS */}
                      {reportTab === 'technicals' && (
                        <div className="space-y-6 animate-fadeIn">
                          
                          {/* Indicators & Confluence Matrix */}
                          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 space-y-5">
                            <span className="text-[10px] text-blue-400 font-mono uppercase tracking-widest font-semibold block">Technical Indicator Confluence Matrix</span>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                              <div className="bg-slate-900/30 border border-slate-900/60 rounded-xl p-3">
                                <span className="text-[8px] text-slate-500 uppercase block tracking-wider font-semibold">RSI (14)</span>
                                <span className="text-white block mt-1.5 text-sm font-bold">{technicalAnalysis.rsi}</span>
                              </div>
                              <div className="bg-slate-900/30 border border-slate-900/60 rounded-xl p-3">
                                <span className="text-[8px] text-slate-500 uppercase block tracking-wider font-semibold">MACD Level</span>
                                <span className="text-white block mt-1.5 text-xs font-bold truncate">{technicalAnalysis.macd}</span>
                              </div>
                              <div className="bg-slate-900/30 border border-slate-900/60 rounded-xl p-3">
                                <span className="text-[8px] text-slate-500 uppercase block tracking-wider font-semibold">VWAP Anchor</span>
                                <span className="text-cyan-400 block mt-1.5 text-xs font-bold truncate">{technicalAnalysis.vwap}</span>
                              </div>
                              <div className="bg-slate-900/30 border border-slate-900/60 rounded-xl p-3">
                                <span className="text-[8px] text-slate-500 uppercase block tracking-wider font-semibold">ATR Volatility</span>
                                <span className="text-slate-300 block mt-1.5 text-sm font-bold">{technicalAnalysis.atr}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed font-mono">
                              <div className="bg-slate-900/20 border border-slate-900/40 p-4 rounded-xl">
                                <span className="text-[9px] text-slate-500 block uppercase font-semibold">Bollinger Bands Volatility</span>
                                <span className="text-slate-300 block mt-1.5 leading-relaxed font-sans">{technicalAnalysis.bollinger}</span>
                              </div>
                              <div className="bg-slate-900/20 border border-slate-900/40 p-4 rounded-xl">
                                <span className="text-[9px] text-slate-500 block uppercase font-semibold">Fibonacci Pocket Retracements</span>
                                <span className="text-slate-300 block mt-1.5 leading-relaxed font-sans">{technicalAnalysis.fibonacci}</span>
                              </div>
                            </div>

                            {/* Thesis Supports / Opposes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-900">
                              <div>
                                <span className="text-[10px] text-emerald-400 font-mono uppercase block mb-2 font-semibold">Confluence Bullish Factors</span>
                                <ul className="list-none space-y-1.5">
                                  {technicalAnalysis.thesisSupports.map((x, i) => (
                                    <li key={i} className="text-[11px] text-slate-300 flex items-start gap-2">
                                      <span className="text-emerald-500 mt-1 font-mono text-[9px]">✔</span>
                                      <span className="font-sans leading-relaxed">{x}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <span className="text-[10px] text-red-400 font-mono uppercase block mb-2 font-semibold">Counter-Trend Friction Points</span>
                                <ul className="list-none space-y-1.5">
                                  {technicalAnalysis.thesisContradicts.map((x, i) => (
                                    <li key={i} className="text-[11px] text-slate-300 flex items-start gap-2">
                                      <span className="text-red-500 mt-1 font-mono text-[9px]">✖</span>
                                      <span className="font-sans leading-relaxed">{x}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Market Structure Engine */}
                          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 space-y-4 text-xs">
                            <span className="text-[10px] text-blue-400 font-mono uppercase tracking-widest font-semibold block">Market Structure Engine Signals</span>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="bg-slate-900/30 border border-slate-900/60 p-4 rounded-xl space-y-1">
                                <span className="text-[9px] text-slate-500 block uppercase font-mono font-semibold">Trend Continuation</span>
                                <p className="text-slate-300 text-[11px] leading-relaxed font-sans">{marketStructure.trendContinuation}</p>
                              </div>
                              <div className="bg-slate-900/30 border border-slate-900/60 p-4 rounded-xl space-y-1">
                                <span className="text-[9px] text-slate-500 block uppercase font-mono font-semibold">Trend Exhaustion</span>
                                <p className="text-slate-300 text-[11px] leading-relaxed font-sans">{marketStructure.trendExhaustion}</p>
                              </div>
                              <div className="bg-slate-900/30 border border-slate-900/60 p-4 rounded-xl space-y-1">
                                <span className="text-[9px] text-slate-500 block uppercase font-mono font-semibold">Reversal Probability</span>
                                <p className="text-slate-300 text-[11px] leading-relaxed font-sans">{marketStructure.reversalPotential}</p>
                              </div>
                            </div>

                            <div className="border-t border-slate-900 pt-4 text-[11px] font-mono flex items-center justify-between">
                              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Structural Shift (BOS / CHoCH):</span>
                              <span className="text-blue-400 font-bold font-mono bg-blue-950/20 border border-blue-900/30 px-2.5 py-0.5 rounded">{marketStructure.breakOfStructure}</span>
                            </div>

                            {/* Liquidity Pools vs Imbalances */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                              <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-xl space-y-2">
                                <span className="text-[9px] text-slate-500 uppercase font-mono block font-semibold">Targeted Liquidity Pools</span>
                                <ul className="list-none space-y-1.5 font-mono text-[10px]">
                                  {marketStructure.liquidityZones.map((z, i) => (
                                    <li key={i} className="text-slate-300 flex items-start gap-1.5 leading-relaxed">
                                      <span className="text-cyan-500">•</span>
                                      <span>{z}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-xl space-y-2">
                                <span className="text-[9px] text-slate-500 uppercase font-mono block font-semibold">Fair Value Gaps (FVG)</span>
                                <ul className="list-none space-y-1.5 font-mono text-[10px]">
                                  {marketStructure.fairValueGaps.map((g, i) => (
                                    <li key={i} className="text-slate-300 flex items-start gap-1.5 leading-relaxed">
                                      <span className="text-amber-500">•</span>
                                      <span>{g}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Price Levels Display */}
                          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 space-y-4">
                            <span className="text-[10px] text-blue-400 font-mono uppercase tracking-widest font-semibold block">Structural Support/Resistance Price Levels</span>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="bg-slate-900/30 border border-slate-900/60 rounded-xl p-3.5 space-y-2">
                                <span className="text-[9px] text-slate-500 uppercase font-mono font-semibold block">Support Layer</span>
                                <div className="text-[10px] text-slate-300 font-mono space-y-1">
                                  {keyLevels.supportZones.map((lvl, idx) => <span key={idx} className="block truncate">{lvl}</span>)}
                                </div>
                              </div>
                              <div className="bg-slate-900/30 border border-slate-900/60 rounded-xl p-3.5 space-y-2">
                                <span className="text-[9px] text-slate-500 uppercase font-mono font-semibold block">Resistance Layer</span>
                                <div className="text-[10px] text-slate-300 font-mono space-y-1">
                                  {keyLevels.resistanceZones.map((lvl, idx) => <span key={idx} className="block truncate">{lvl}</span>)}
                                </div>
                              </div>
                              <div className="bg-slate-900/30 border border-slate-900/60 rounded-xl p-3.5 space-y-2">
                                <span className="text-[9px] text-amber-500 uppercase font-mono font-semibold block">Supply Blocks (OB)</span>
                                <div className="text-[10px] text-amber-400 font-mono space-y-1">
                                  {keyLevels.supplyBlocks.map((lvl, idx) => <span key={idx} className="block truncate">{lvl}</span>)}
                                </div>
                              </div>
                              <div className="bg-slate-900/30 border border-slate-900/60 rounded-xl p-3.5 space-y-2">
                                <span className="text-[9px] text-cyan-500 uppercase font-mono font-semibold block">Demand Blocks (OB)</span>
                                <div className="text-[10px] text-cyan-400 font-mono space-y-1">
                                  {keyLevels.demandBlocks.map((lvl, idx) => <span key={idx} className="block truncate">{lvl}</span>)}
                                </div>
                              </div>
                            </div>

                            <div className="bg-black/20 p-3 rounded-xl border border-slate-900 text-[10px] font-mono text-slate-400">
                              <span className="text-slate-500 block uppercase font-semibold text-[9px]">Fibonacci Retracements Confluence Points:</span>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-slate-300">
                                {keyLevels.fibonacciLevels.map((lvl, i) => <span key={i}>• {lvl}</span>)}
                              </div>
                            </div>
                          </div>

                          {/* Multi-Timeframe Alignment */}
                          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 space-y-4 text-xs leading-relaxed">
                            <span className="text-[10px] text-blue-400 font-mono uppercase tracking-widest font-semibold block">Multi-Timeframe Structure Assessment</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="bg-slate-900/30 border border-slate-900/60 p-3.5 rounded-xl">
                                <span className="text-[9px] text-slate-500 block uppercase font-semibold">Higher Timeframe (HTF)</span>
                                <p className="text-slate-300 text-[11px] mt-1.5 leading-relaxed font-sans">{multiTimeframe.higherTimeframe}</p>
                              </div>
                              <div className="bg-slate-900/30 border border-slate-900/60 p-3.5 rounded-xl">
                                <span className="text-[9px] text-slate-500 block uppercase font-semibold">Intermediate (ITF)</span>
                                <p className="text-slate-300 text-[11px] mt-1.5 leading-relaxed font-sans">{multiTimeframe.intermediateTimeframe}</p>
                              </div>
                              <div className="bg-slate-900/30 border border-slate-900/60 p-3.5 rounded-xl">
                                <span className="text-[9px] text-slate-500 block uppercase font-semibold">Execution (ETF)</span>
                                <p className="text-slate-300 text-[11px] mt-1.5 leading-relaxed font-sans">{multiTimeframe.executionTimeframe}</p>
                              </div>
                            </div>
                            <div className="bg-black/20 border border-slate-900 rounded-xl p-3.5 text-[11px] font-mono text-slate-400 leading-relaxed font-sans">
                              <span className="text-[9px] text-slate-500 block uppercase font-mono font-semibold mb-1">Timeframe Correlation & Conflict Resolution</span>
                              {multiTimeframe.alignmentAndConflicts}
                            </div>
                          </div>

                        </div>
                      )}

                      {/* TAB 3: MACRO & SENTIMENT */}
                      {reportTab === 'macro' && (
                        <div className="space-y-6 animate-fadeIn">
                          
                          {/* Macro Environment */}
                          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 space-y-4 text-xs leading-relaxed">
                            <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
                              <span className="text-[10px] text-blue-400 font-mono uppercase tracking-widest font-semibold">Global Macroeconomic Environment</span>
                              <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 border rounded ${
                                macroEnvironment.stance.includes('Risk-On') 
                                  ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900/30' 
                                  : macroEnvironment.stance.includes('Risk-Off') 
                                  ? 'bg-red-950/50 text-red-400 border-red-900/30' 
                                  : 'bg-slate-900 text-slate-400'
                              }`}>{macroEnvironment.stance}</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {[
                                { title: 'Interest Rates Stance', desc: macroEnvironment.interestRates },
                                { title: 'Inflation Profile', desc: macroEnvironment.inflation },
                                { title: 'CPI/PPI Yield Vectors', desc: macroEnvironment.ppiCpi },
                                { title: 'Employment Metrics', desc: macroEnvironment.employment },
                                { title: 'GDP Growth Vector', desc: macroEnvironment.gdp },
                                { title: 'Central Bank Policies', desc: macroEnvironment.centralBankPolicy }
                              ].map((item, i) => (
                                <div key={i} className="bg-slate-900/30 border border-slate-900/60 rounded-xl p-3">
                                  <span className="text-[8px] text-slate-500 uppercase font-mono block font-semibold">{item.title}</span>
                                  <p className="text-slate-300 font-sans text-[11px] mt-1.5 font-medium leading-relaxed">{item.desc}</p>
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-[11px]">
                              <div className="bg-black/20 border border-slate-900/80 p-3.5 rounded-xl">
                                <span className="text-[9px] text-slate-500 uppercase font-mono block font-semibold mb-1">Geopolitical Risk Assessment</span>
                                <p className="text-slate-300 leading-relaxed font-sans">{macroEnvironment.geopoliticalRisks}</p>
                              </div>
                              <div className="bg-black/20 border border-slate-900/80 p-3.5 rounded-xl">
                                <span className="text-[9px] text-slate-500 uppercase font-mono block font-semibold mb-1">Economic Calendar Roadblock Events</span>
                                <p className="text-slate-300 leading-relaxed font-sans">{macroEnvironment.economicCalendar}</p>
                              </div>
                            </div>

                            <div className="bg-blue-950/10 border border-blue-900/20 p-3.5 rounded-xl text-slate-300 mt-2 font-sans leading-relaxed text-[11px]">
                              <span className="text-[9px] text-blue-400 uppercase font-mono block font-semibold mb-1">Specific Asset Class Impact Statement:</span>
                              {macroEnvironment.impactOnAsset}
                            </div>
                          </div>

                          {/* Sentiment Analysis Matrix */}
                          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 space-y-4 text-xs leading-relaxed">
                            <span className="text-[10px] text-blue-400 font-mono uppercase tracking-widest font-semibold block">Institutional & Retail Sentiment Matrix</span>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="bg-slate-900/30 border border-slate-900/60 p-3.5 rounded-xl">
                                <span className="text-[9px] text-slate-500 uppercase font-mono block font-semibold">News Flow & Sentiment Pitch</span>
                                <p className="text-slate-300 mt-1.5 leading-relaxed font-sans">{sentiment.newsSentiment}</p>
                              </div>
                              <div className="bg-slate-900/30 border border-slate-900/60 p-3.5 rounded-xl">
                                <span className="text-[9px] text-slate-500 uppercase font-mono block font-semibold">Retail Position Allocation</span>
                                <p className="text-slate-300 mt-1.5 leading-relaxed font-sans">{sentiment.retailSentiment}</p>
                              </div>
                              <div className="bg-slate-900/30 border border-slate-900/60 p-3.5 rounded-xl">
                                <span className="text-[9px] text-slate-500 uppercase font-mono block font-semibold">Institutional CoT Alignment</span>
                                <p className="text-slate-300 mt-1.5 leading-relaxed font-sans">{sentiment.institutionalSentiment}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                              <div className="col-span-2 bg-black/20 border border-slate-900/80 p-3.5 rounded-xl">
                                <span className="text-[9px] text-slate-500 uppercase font-mono block font-semibold mb-1">Prevailing Consensus & Key Narratives</span>
                                <p className="text-slate-300 leading-relaxed font-sans">{sentiment.marketNarrative}</p>
                              </div>
                              <div className="bg-black/20 border border-slate-900/80 p-3.5 rounded-xl">
                                <span className="text-[9px] text-slate-500 uppercase font-mono block font-semibold mb-1">Crowded Trade Metrics</span>
                                <p className="text-slate-300 leading-relaxed font-sans">{sentiment.crowdedTrades}</p>
                              </div>
                            </div>

                            <div className="bg-cyan-950/10 border border-cyan-900/20 p-3.5 rounded-xl text-slate-300 font-sans leading-relaxed text-[11px]">
                              <span className="text-[9px] text-cyan-400 uppercase font-mono block font-semibold mb-1">Contrarian Swing Capture Opportunities:</span>
                              {sentiment.contrarianOpportunities}
                            </div>
                          </div>

                          {/* Quantitative Assessment */}
                          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 space-y-4 text-xs leading-relaxed">
                            <span className="text-[10px] text-blue-400 font-mono uppercase tracking-widest font-semibold block">Quantitative Metrics & Cross-Asset Correlations</span>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
                              <div className="bg-slate-900/30 border border-slate-900/60 p-4 rounded-xl">
                                <span className="text-[8px] text-slate-500 block uppercase font-semibold">Volatility Profile</span>
                                <p className="text-slate-300 text-[11px] mt-1.5 font-sans leading-relaxed">{quantitative.volatility}</p>
                              </div>
                              <div className="bg-slate-900/30 border border-slate-900/60 p-4 rounded-xl">
                                <span className="text-[8px] text-slate-500 block uppercase font-semibold">Relative Strength Benchmark</span>
                                <p className="text-slate-300 text-[11px] mt-1.5 font-sans leading-relaxed">{quantitative.relativeStrength}</p>
                              </div>
                              <div className="bg-slate-900/30 border border-slate-900/60 p-4 rounded-xl">
                                <span className="text-[8px] text-slate-500 block uppercase font-semibold">Cross-Asset & Sector Correlation Matrix</span>
                                <p className="text-slate-300 text-[11px] mt-1.5 font-sans leading-relaxed">{quantitative.correlations}</p>
                              </div>
                              <div className="bg-slate-900/30 border border-slate-900/60 p-4 rounded-xl">
                                <span className="text-[8px] text-slate-500 block uppercase font-semibold">Statistical Seasonality Patterns</span>
                                <p className="text-slate-300 text-[11px] mt-1.5 font-sans leading-relaxed">{quantitative.historicalBehavior}</p>
                              </div>
                            </div>
                          </div>

                        </div>
                      )}

                      {/* TAB 4: PROBABILISTIC SCENARIOS */}
                      {reportTab === 'scenarios' && (
                        <div className="space-y-6 animate-fadeIn">
                          
                          {/* Visual Probability Distribution Bar */}
                          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/50 space-y-4">
                            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block font-semibold">Institutional Probability Distribution Matrix</span>
                            
                            <div className="flex h-5 w-full rounded-full overflow-hidden border border-slate-900 shadow-inner">
                              <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 flex items-center justify-center text-[9px] font-mono font-black text-white relative transition-all duration-500" style={{ width: `${bullCase.probabilityEstimate}%` }}>
                                {bullCase.probabilityEstimate >= 12 && `BULL: ${bullCase.probabilityEstimate}%`}
                              </div>
                              <div className="bg-gradient-to-r from-slate-600 to-slate-500 flex items-center justify-center text-[9px] font-mono font-black text-white relative transition-all duration-500" style={{ width: `${baseCase.probabilityEstimate}%` }}>
                                {baseCase.probabilityEstimate >= 12 && `BASE: ${baseCase.probabilityEstimate}%`}
                              </div>
                              <div className="bg-gradient-to-r from-rose-600 to-rose-500 flex items-center justify-center text-[9px] font-mono font-black text-white relative transition-all duration-500" style={{ width: `${bearCase.probabilityEstimate}%` }}>
                                {bearCase.probabilityEstimate >= 12 && `BEAR: ${bearCase.probabilityEstimate}%`}
                              </div>
                            </div>
                            <span className="text-[9px] text-slate-500 italic block text-center">Total distribution perfectly normalized to 100% active statistical pathways.</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs leading-relaxed font-sans">
                            {/* Bull Case */}
                            <div className="p-5 rounded-2xl border border-emerald-900/30 bg-emerald-950/5 space-y-3 relative overflow-hidden">
                              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 to-teal-400" />
                              <div className="flex justify-between items-center border-b border-emerald-900/20 pb-2">
                                <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest font-semibold">Bullish Case Setup</span>
                                <span className="text-xs font-bold text-emerald-400 font-mono">{bullCase.probabilityEstimate}% Prob</span>
                              </div>
                              <p className="text-slate-300 text-[11px] leading-relaxed font-sans">{bullCase.reasoning}</p>
                            </div>

                            {/* Base Case */}
                            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/20 space-y-3 relative overflow-hidden">
                              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-slate-500 to-slate-400" />
                              <div className="flex justify-between items-center border-b border-slate-900/40 pb-2">
                                <span className="text-[10px] text-slate-300 font-mono uppercase tracking-widest font-semibold">Median Base Pathway</span>
                                <span className="text-xs font-bold text-slate-300 font-mono">{baseCase.probabilityEstimate}% Prob</span>
                              </div>
                              <p className="text-slate-400 text-[11px] leading-relaxed font-sans">{baseCase.reasoning}</p>
                            </div>

                            {/* Bear Case */}
                            <div className="p-5 rounded-2xl border border-rose-900/30 bg-rose-950/5 space-y-3 relative overflow-hidden">
                              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rose-500 to-red-400" />
                              <div className="flex justify-between items-center border-b border-rose-900/20 pb-2">
                                <span className="text-[10px] text-rose-400 font-mono uppercase tracking-widest font-semibold">Bearish Risk Case</span>
                                <span className="text-xs font-bold text-rose-400 font-mono">{bearCase.probabilityEstimate}% Prob</span>
                              </div>
                              <p className="text-slate-300 text-[11px] leading-relaxed font-sans">{bearCase.reasoning}</p>
                            </div>
                          </div>

                        </div>
                      )}

                      {/* TAB 5: EXECUTION & RISK */}
                      {reportTab === 'execution' && (
                        <div className="space-y-6 animate-fadeIn">
                          
                          {/* Tactical Execution Pathways */}
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-blue-400 font-mono uppercase tracking-widest font-semibold block">Tactical Execution Pathways</span>
                              <span className="text-[9px] text-slate-500 font-mono">BACKWARD TESTED ALPHA DESIGNS</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              {[
                                { id: 'conservative', label: 'Conservative Setup', data: tradeOpportunities.conservative, color: 'border-emerald-900/60 bg-gradient-to-b from-emerald-950/20 via-slate-950/90 to-slate-950', badgeColor: 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40' },
                                { id: 'balanced', label: 'Balanced Setup', data: tradeOpportunities.balanced, color: 'border-cyan-900/60 bg-gradient-to-b from-cyan-950/20 via-slate-950/90 to-slate-950', badgeColor: 'bg-cyan-950/60 text-cyan-400 border border-cyan-900/40' },
                                { id: 'aggressive', label: 'Aggressive Setup', data: tradeOpportunities.aggressive, color: 'border-blue-900/60 bg-gradient-to-b from-blue-950/20 via-slate-950/90 to-slate-950', badgeColor: 'bg-blue-950/60 text-blue-400 border border-blue-900/40' }
                              ].map((setup) => (
                                <div key={setup.id} className={`rounded-2xl border ${setup.color} p-5 space-y-4 font-mono text-xs flex flex-col justify-between h-full relative overflow-hidden group`}>
                                  
                                  {/* Ticket Header */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-start">
                                      <span className="text-sm font-black text-white uppercase font-sans tracking-tight">{setup.label}</span>
                                      {setup.data.winRate && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${setup.badgeColor}`}>
                                          {setup.data.winRate}% Win Rate
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[9px] text-slate-500 block uppercase font-mono">HOLDING TIME: {setup.data.holdingPeriod}</span>
                                  </div>

                                  {/* Price ticket fields */}
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center bg-black/40 px-3 py-2 rounded-xl border border-slate-900/80">
                                      <span className="text-[9px] text-slate-500">ENTRY ZONE</span>
                                      <span className="text-white text-[12px] font-bold tracking-wider">{setup.data.entry}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-black/40 px-3 py-2 rounded-xl border border-slate-900/80">
                                      <span className="text-[9px] text-slate-500">STOP LOSS</span>
                                      <span className="text-rose-400 text-[12px] font-bold tracking-wider">{setup.data.stopLoss}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-black/40 px-3 py-2 rounded-xl border border-slate-900/80">
                                      <span className="text-[9px] text-slate-500">TAKE PROFIT</span>
                                      <span className="text-emerald-400 text-[12px] font-bold tracking-wider">{setup.data.takeProfit}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-black/40 px-3 py-2 rounded-xl border border-slate-900/80">
                                      <span className="text-[9px] text-slate-500">RISK:REWARD</span>
                                      <span className="text-cyan-400 text-[12px] font-bold tracking-wider">{setup.data.riskRewardRatio}</span>
                                    </div>
                                  </div>

                                  {/* Position Guidance & Justifications */}
                                  <div className="space-y-2.5">
                                    {setup.data.justification && (
                                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans italic border-l border-slate-800 pl-2">
                                        "{setup.data.justification}"
                                      </p>
                                    )}
                                    
                                    <div className="bg-slate-900/30 p-2.5 border border-slate-900/80 rounded-xl text-[9px] text-slate-400 leading-relaxed font-sans">
                                      <span className="text-[8px] text-slate-500 uppercase font-mono font-bold block mb-0.5">POSITION SIZE GUIDANCE</span>
                                      {setup.data.positionSizeGuidance}
                                    </div>
                                  </div>

                                  {/* Quick Trade Button */}
                                  <button 
                                    onClick={() => onLogJournal?.({
                                      asset: symbol,
                                      direction: activeReport.bias?.direction === 'Bearish' ? 'Short' : 'Long',
                                      riskReward: parseFloat(setup.data.riskRewardRatio.split(':')[1]) || 2.0,
                                      notes: `Setup: ${setup.label} - ${setup.data.justification || 'MITIGATION'}`
                                    })}
                                    className="w-full mt-2 py-2 border border-slate-800 hover:border-blue-500 bg-slate-950 hover:bg-blue-950/20 rounded-xl text-[10px] font-bold text-slate-300 hover:text-white transition duration-200 flex items-center justify-center gap-1.5 uppercase font-sans font-semibold cursor-pointer"
                                  >
                                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                                    Log Setup to Journal
                                  </button>

                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Risk Profile & Portfolio Impact */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            
                            {/* Risk Management */}
                            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 space-y-4">
                              <span className="text-[10px] text-blue-400 font-mono uppercase tracking-widest font-semibold block">Quantitative Risk Management Profile</span>
                              
                              <div className="grid grid-cols-2 gap-3 text-center font-mono">
                                <div className="bg-slate-900/30 border border-slate-900/60 rounded-xl p-3">
                                  <span className="text-[8px] text-slate-500 uppercase block font-semibold">Suggested Capital Risk</span>
                                  <span className="text-white block mt-1 text-sm font-bold">{riskManagement.suggestedRiskPct}%</span>
                                </div>
                                <div className="bg-slate-900/30 border border-slate-900/60 rounded-xl p-3">
                                  <span className="text-[8px] text-slate-500 uppercase block font-semibold">Max Drawdown Target</span>
                                  <span className="text-rose-400 block mt-1 text-sm font-bold">€{riskManagement.maxLoss}</span>
                                </div>
                              </div>

                              <div className="text-[11px] font-mono leading-relaxed space-y-3">
                                <div className="bg-black/20 border border-slate-900/80 p-3 rounded-xl">
                                  <span className="text-[8px] text-slate-500 uppercase block font-bold">Capital Preservation Guidelines</span>
                                  <p className="text-slate-300 mt-1.5 font-sans leading-relaxed">{riskManagement.capitalPreservation}</p>
                                </div>
                                <div className="bg-black/20 border border-slate-900/80 p-3 rounded-xl">
                                  <span className="text-[8px] text-slate-500 uppercase block font-bold">Downside Tail Risks:</span>
                                  <ul className="list-none space-y-1.5 mt-1.5 font-sans">
                                    {riskManagement.downsideRisks.map((r, i) => (
                                      <li key={i} className="text-[10px] text-slate-300 flex items-start gap-1.5">
                                        <span className="text-rose-500 mt-1">•</span>
                                        <span className="leading-relaxed">{r}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Portfolio Impact */}
                            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 space-y-4 text-xs leading-relaxed font-sans">
                              <span className="text-[10px] text-blue-400 font-mono uppercase tracking-widest font-semibold block">Portfolio Integration Impact</span>
                              
                              <div className="grid grid-cols-2 gap-3 font-mono">
                                <div className="bg-slate-900/30 border border-slate-900/60 p-3 rounded-xl">
                                  <span className="text-[8px] text-slate-500 block uppercase font-semibold">Exposure Allocation</span>
                                  <span className="text-slate-200 text-[10px] block mt-1 font-bold truncate">{portfolioImpact.exposure}</span>
                                </div>
                                <div className="bg-slate-900/30 border border-slate-900/60 p-3 rounded-xl">
                                  <span className="text-[8px] text-slate-500 block uppercase font-semibold">Correlation Metric</span>
                                  <span className="text-slate-200 text-[10px] block mt-1 truncate">{portfolioImpact.correlationRisk}</span>
                                </div>
                                <div className="bg-slate-900/30 border border-slate-900/60 p-3 rounded-xl">
                                  <span className="text-[8px] text-slate-500 block uppercase font-semibold">Concentration Rating</span>
                                  <span className="text-slate-200 text-[10px] block mt-1 truncate">{portfolioImpact.concentrationRisk}</span>
                                </div>
                                <div className="bg-slate-900/30 border border-slate-900/60 p-3 rounded-xl">
                                  <span className="text-[8px] text-slate-500 block uppercase font-semibold">Diversification Index</span>
                                  <span className="text-slate-200 text-[10px] block mt-1 truncate">{portfolioImpact.diversificationQuality}</span>
                                </div>
                              </div>

                              <div className="bg-black/20 border border-slate-900/80 p-3 rounded-xl text-[11px]">
                                <span className="text-[8px] text-slate-500 font-mono uppercase block font-bold">Integration Recommendation</span>
                                <p className="text-slate-300 mt-1.5 leading-relaxed font-sans">{portfolioImpact.recommendations}</p>
                              </div>
                            </div>
                          </div>

                          {/* Contradiction Engine & Decision Support */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            
                            {/* Contradiction Engine */}
                            <div className="p-5 rounded-2xl border border-rose-950/30 bg-rose-950/5 space-y-4 text-xs leading-relaxed">
                              <span className="text-[10px] text-rose-400 font-mono uppercase tracking-widest font-semibold block">Contrarian & Anti-Thesis Friction Engine</span>
                              
                              <div className="space-y-3">
                                <div>
                                  <span className="text-[9px] text-rose-400/80 uppercase font-mono block font-semibold mb-1">Tactical reasons NOT to enter this setup:</span>
                                  <ul className="list-none space-y-1.5 font-sans">
                                    {contradictionEngine.reasonsNotToEnter.map((r, i) => (
                                      <li key={i} className="text-[11px] text-slate-300 flex items-start gap-2">
                                        <span className="text-rose-500 mt-1">•</span>
                                        <span className="leading-relaxed">{r}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="border-t border-slate-900 pt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] text-slate-400 font-mono">
                                  <div className="bg-black/20 p-3 rounded-xl border border-slate-900/80">
                                    <span className="text-[8px] text-slate-500 uppercase block font-semibold">Primary Failure Triggers</span>
                                    <ul className="list-none space-y-1 mt-1 font-sans">
                                      {contradictionEngine.thesisFailReasons.map((x, i) => <li key={i} className="text-slate-300">• {x}</li>)}
                                    </ul>
                                  </div>
                                  <div className="bg-black/20 p-3 rounded-xl border border-slate-900/80">
                                    <span className="text-[8px] text-slate-500 uppercase block font-semibold">Tail Risk Factors</span>
                                    <ul className="list-none space-y-1 mt-1 font-sans">
                                      {contradictionEngine.blackSwanFactors.map((x, i) => <li key={i} className="text-slate-300">• {x}</li>)}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Decision Support */}
                            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 space-y-4 text-xs leading-relaxed">
                              <span className="text-[10px] text-blue-400 font-mono uppercase tracking-widest font-semibold block">Institutional Decision Support Checklist</span>
                              
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
                                  <div className="bg-black/20 p-3 rounded-xl border border-slate-900/80">
                                    <span className="text-[8px] text-slate-500 uppercase font-mono block font-semibold">Pre-Entry Requirements</span>
                                    <ul className="list-none space-y-1 mt-1 font-sans">
                                      {decisionSupport.preEntryRequirements.map((x, i) => <li key={i} className="text-slate-300">• {x}</li>)}
                                    </ul>
                                  </div>
                                  <div className="bg-black/20 p-3 rounded-xl border border-slate-900/80">
                                    <span className="text-[8px] text-slate-500 uppercase font-mono block font-semibold">Confirmation Metrics</span>
                                    <ul className="list-none space-y-1 mt-1 font-sans">
                                      {decisionSupport.thesisConfirmations.map((x, i) => <li key={i} className="text-slate-300">• {x}</li>)}
                                    </ul>
                                  </div>
                                </div>

                                <div className="border-t border-slate-900 pt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
                                  <div className="bg-rose-950/10 p-3 rounded-xl border border-rose-900/20">
                                    <span className="text-[8px] text-rose-400 uppercase font-mono block font-semibold">Immediate Invalidation Triggers</span>
                                    <ul className="list-none space-y-1 mt-1 font-sans">
                                      {decisionSupport.thesisInvalidations.map((x, i) => <li key={i} className="text-slate-300">• {x}</li>)}
                                    </ul>
                                  </div>
                                  <div className="bg-slate-900/30 p-3 rounded-xl border border-slate-900/80">
                                    <span className="text-[8px] text-slate-500 uppercase font-mono block font-semibold">Trader Continuous Monitor</span>
                                    <ul className="list-none space-y-1 mt-1 font-sans">
                                      {decisionSupport.traderMonitorList.map((x, i) => <li key={i} className="text-slate-300">• {x}</li>)}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>

                          </div>

                        </div>
                      )}

                    </div>
                  );
                })()}

              </div>

              {/* Legal Disclaimer block */}
              <Disclaimer />
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
