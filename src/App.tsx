import React, { useState, useEffect } from 'react';
import { supabaseEmulator } from './utils/supabaseEmulator';
import { UserProfile, SavedAnalysis, JournalEntry, WatchlistItem } from './types';
import AuthScreen from './components/AuthScreen';
import OnboardingFlow from './components/OnboardingFlow';
import DashboardView from './components/DashboardView';
import AIAnalysisView from './components/AIAnalysisView';
import TradingJournalView from './components/TradingJournalView';
import WatchlistView from './components/WatchlistView';
import HistoryView from './components/HistoryView';
import PricingView from './components/PricingView';
import AdminPanel from './components/AdminPanel';
import Disclaimer from './components/Disclaimer';

// Premium extra views for AlphaQuant Vision X
import AIResearchView from './components/AIResearchView';
import ScannersView from './components/ScannersView';
import StrategyBuilderView from './components/StrategyBuilderView';
import AICoachConsole from './components/AICoachConsole';
import CreatorProgramView from './components/CreatorProgramView';

import { 
  Flame, LayoutDashboard, Compass, BookOpen, Star, Clock, 
  CreditCard, ShieldCheck, LogOut, ShieldAlert, Check, X,
  Globe, Calendar, Terminal, Info, Users, BarChart, MessageSquare, Rocket
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [utcTime, setUtcTime] = useState('');

  // Loaded database items state
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [adminStats, setAdminStats] = useState<{
    users: UserProfile[];
    feedbacks: any[];
    analysesCount: number;
  }>({ users: [], feedbacks: [], analysesCount: 0 });

  // Prefilled manual trade logger state from AI Setup cards
  const [initialJournalForm, setInitialJournalForm] = useState<{
    asset: string;
    direction: 'Long' | 'Short';
    riskReward: number;
    notes: string;
  } | null>(null);

  // Modal active report viewer state
  const [selectedAnalysisModal, setSelectedAnalysisModal] = useState<SavedAnalysis | null>(null);

  // Sync state with database simulation
  const refreshUserData = () => {
    const user = supabaseEmulator.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      setSavedAnalyses(supabaseEmulator.getSavedAnalyses());
      setJournalEntries(supabaseEmulator.getJournalEntries());
      setWatchlist(supabaseEmulator.getWatchlist());
      if (user.isAdmin) {
        const stats = supabaseEmulator.getAdminStats();
        setAdminStats({
          users: stats.users,
          feedbacks: stats.feedbacks,
          analysesCount: stats.analysesCount
        });
      }
    }
  };

  useEffect(() => {
    refreshUserData();

    // Clock update ticker for institutional UTC clock
    const clockInterval = setInterval(() => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    refreshUserData();
  };

  const handleOnboardingComplete = (user: UserProfile) => {
    setCurrentUser(user);
    refreshUserData();
    setActiveTab('dashboard');
  };

  const handleSignOut = async () => {
    if (confirm('Conclude active AlphaQuant security session?')) {
      await supabaseEmulator.signOut();
      setCurrentUser(null);
      setActiveTab('dashboard');
    }
  };

  const handleLogJournalFromAI = (data: { asset: string; direction: 'Long' | 'Short'; riskReward: number; notes: string }) => {
    setInitialJournalForm(data);
    setActiveTab('journal');
  };

  const handleAnalyzeAssetFromWatchlist = (symbol: string) => {
    // Quick dispatch symbol to AI analyze form
    setActiveTab('analyze');
  };

  const handleViewAnalysisDetail = (analysis: SavedAnalysis) => {
    setSelectedAnalysisModal(analysis);
  };

  const handleDeleteAnalysis = (id: string) => {
    if (confirm('Remove archived analysis report?')) {
      supabaseEmulator.deleteAnalysis(id);
      refreshUserData();
    }
  };

  // If not logged in, show Auth Screen
  if (!currentUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // If logged in but onboarding details missing, force onboarding
  if (!currentUser.isOnboarded) {
    return (
      <OnboardingFlow 
        currentUser={currentUser} 
        onOnboardingComplete={handleOnboardingComplete} 
      />
    );
  }

  return (
    <div id="app-viewport" className="min-h-screen bg-black text-slate-100 flex font-sans relative overflow-x-hidden">
      
      {/* Decorative background vectors */}
      <div id="app-glow-top" className="absolute w-[800px] h-[500px] bg-blue-950/10 rounded-full blur-[160px] top-[-200px] left-1/4 pointer-events-none" />
      <div id="app-glow-bottom" className="absolute w-[600px] h-[600px] bg-cyan-950/5 rounded-full blur-[140px] bottom-[-200px] right-10 pointer-events-none" />

      {/* SIDEBAR NAVIGATION */}
      <aside id="terminal-sidebar" className="w-64 border-r border-slate-900 bg-slate-950/90 backdrop-blur-xl shrink-0 flex flex-col justify-between z-20 sticky top-0 h-screen hidden md:flex">
        <div id="sidebar-top">
          {/* Logo Brand */}
          <div id="brand-header" className="p-6 border-b border-slate-900 flex items-center gap-2.5">
            <div id="brand-logo-glow" className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <Flame id="brand-logo-icon" className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span id="brand-name" className="font-extrabold text-sm tracking-wider uppercase text-white block">AlphaQuant</span>
              <span id="brand-version" className="text-[9px] text-blue-400 font-mono font-semibold uppercase tracking-widest leading-none">INTELLIGENCE IA</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav id="sidebar-nav" className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-950/40 text-blue-400 border border-blue-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Main Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('analyze')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'analyze' 
                  ? 'bg-blue-950/40 text-blue-400 border border-blue-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Compass className="w-4 h-4 shrink-0 animate-spin-slow" />
              <span>AI Market Analysis</span>
            </button>

            <button
              onClick={() => setActiveTab('research')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'research' 
                  ? 'bg-blue-950/40 text-blue-400 border border-blue-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span>AI Research & Macro</span>
            </button>

            <button
              onClick={() => setActiveTab('scanners')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'scanners' 
                  ? 'bg-blue-950/40 text-blue-400 border border-blue-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <BarChart className="w-4 h-4 shrink-0" />
              <span>Scanners & Heatmaps</span>
            </button>

            <button
              onClick={() => setActiveTab('strategy')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'strategy' 
                  ? 'bg-blue-950/40 text-blue-400 border border-blue-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Terminal className="w-4 h-4 shrink-0" />
              <span>Strategy & Risk Lab</span>
            </button>

            <button
              onClick={() => setActiveTab('coach')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'coach' 
                  ? 'bg-blue-950/40 text-blue-400 border border-blue-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>AI Coach Console</span>
            </button>

            <button
              onClick={() => setActiveTab('journal')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'journal' 
                  ? 'bg-blue-950/40 text-blue-400 border border-blue-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Trading Journal</span>
            </button>

            <button
              onClick={() => setActiveTab('watchlist')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'watchlist' 
                  ? 'bg-blue-950/40 text-blue-400 border border-blue-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Star className="w-4 h-4 shrink-0" />
              <span>Portfolio Watchlist</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'history' 
                  ? 'bg-blue-950/40 text-blue-400 border border-blue-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>Analysis History</span>
            </button>

            <button
              onClick={() => setActiveTab('pricing')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'pricing' 
                  ? 'bg-blue-950/40 text-blue-400 border border-blue-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>Licensing Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('creator')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'creator' 
                  ? 'bg-blue-950/40 text-blue-400 border border-blue-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Rocket className="w-4 h-4 shrink-0 text-cyan-400" />
              <span>Creator Program</span>
            </button>

            {/* Admin only desk */}
            {currentUser.isAdmin && (
              <div className="pt-4 border-t border-slate-900 mt-4 space-y-1">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold px-3 block mb-1">Supervisor Control</span>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'admin' 
                      ? 'bg-blue-950/40 text-blue-400 border border-blue-500/10' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Supervisor Desk</span>
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* User Card Profile & Sign Out */}
        <div id="sidebar-user" className="p-4 border-t border-slate-900 space-y-3">
          <div className="flex items-center gap-2.5 bg-slate-900/20 border border-slate-900 p-2.5 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold font-mono">
              {currentUser.email.slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <span className="text-xs text-slate-200 font-bold block truncate leading-tight">{currentUser.email.split('@')[0]}</span>
              <span className="text-[9px] text-slate-500 block font-mono truncate">{currentUser.email}</span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-1.5 py-2 border border-slate-900 hover:border-red-900/50 hover:bg-red-950/10 text-slate-400 hover:text-red-400 text-xs font-semibold rounded-lg transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER NAVIGATION */}
      <div id="app-main-content-area" className="flex-1 flex flex-col min-w-0">
        
        {/* GLOBAL HEADER BAR */}
        <header id="app-global-header" className="h-14 border-b border-slate-900 bg-slate-950/60 backdrop-blur-md px-6 flex items-center justify-between z-10 sticky top-0">
          
          {/* Left indicator */}
          <div className="flex items-center gap-3">
            {/* Mobile Nav toggle or brand logo */}
            <div className="md:hidden flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-cyan-500 rounded flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-white">AlphaQuant</span>
            </div>

            {/* Live indicator desk */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Secured Node Terminal Connected</span>
            </div>
          </div>

          {/* Right indicator: UTC Clock, Balance, Mobile Menu */}
          <div className="flex items-center gap-4 text-xs">
            {/* UTC Institutional Clock */}
            <span className="hidden lg:inline-block text-[10px] text-slate-500 font-mono tracking-wider bg-slate-900/40 border border-slate-850 px-2.5 py-1 rounded">
              {utcTime || 'SYS TICK'}
            </span>

            {/* Active Onboarding Capital Indicator */}
            <div className="flex items-center gap-1.5 bg-blue-950/30 border border-blue-500/20 px-2.5 py-1 rounded text-[10px] font-mono">
              <span className="text-slate-500 uppercase font-semibold">Margin Capital:</span>
              <span className="text-blue-400 font-bold">€{currentUser.tradingCapital.toLocaleString()}</span>
            </div>

            {/* Mobile Navigation controls */}
            <div className="md:hidden flex gap-1">
              {['dash', 'analyze', 'journal', 'wl', 'creator'].map((item) => {
                const tabId = item === 'dash' ? 'dashboard' : item === 'analyze' ? 'analyze' : item === 'journal' ? 'journal' : item === 'wl' ? 'watchlist' : 'creator';
                const label = item === 'dash' ? 'Dash' : item === 'analyze' ? 'AI' : item === 'journal' ? 'Journal' : item === 'wl' ? 'Watchlist' : 'Creator';
                return (
                  <button
                    key={item}
                    onClick={() => setActiveTab(tabId)}
                    className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider cursor-pointer ${
                      activeTab === tabId ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
              <button
                onClick={handleSignOut}
                className="p-1 bg-red-950/20 text-red-400 border border-red-900/30 rounded"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* CONTAINER CONTENT AREA */}
        <main id="app-main-view" className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          
          {activeTab === 'dashboard' && (
            <DashboardView 
              currentUser={currentUser}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onViewAnalysis={handleViewAnalysisDetail}
              savedAnalyses={savedAnalyses}
              journalEntries={journalEntries}
            />
          )}

          {activeTab === 'analyze' && (
            <AIAnalysisView 
              currentUser={currentUser}
              onAnalysisSaved={refreshUserData}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onLogJournal={handleLogJournalFromAI}
            />
          )}

          {activeTab === 'research' && (
            <AIResearchView currentUser={currentUser} />
          )}

          {activeTab === 'scanners' && (
            <ScannersView />
          )}

          {activeTab === 'strategy' && (
            <StrategyBuilderView currentUser={currentUser} />
          )}

          {activeTab === 'coach' && (
            <AICoachConsole journalEntries={journalEntries} currentUser={currentUser} />
          )}

          {activeTab === 'journal' && (
            <TradingJournalView 
              entries={journalEntries}
              onRefreshEntries={refreshUserData}
              initialFormValue={initialJournalForm}
              onClearInitialFormValue={() => setInitialJournalForm(null)}
            />
          )}

          {activeTab === 'watchlist' && (
            <WatchlistView 
              watchlist={watchlist}
              onRefreshWatchlist={refreshUserData}
              onAnalyzeAsset={handleAnalyzeAssetFromWatchlist}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView 
              analyses={savedAnalyses}
              onRefreshHistory={refreshUserData}
              onViewAnalysis={handleViewAnalysisDetail}
              onDeleteAnalysis={handleDeleteAnalysis}
            />
          )}

          {activeTab === 'pricing' && <PricingView />}

          {activeTab === 'creator' && (
            <CreatorProgramView currentUser={currentUser} />
          )}

          {activeTab === 'admin' && currentUser.isAdmin && (
            <AdminPanel 
              onRefreshStats={refreshUserData}
              users={adminStats.users}
              feedbacks={adminStats.feedbacks}
              analysesCount={adminStats.analysesCount}
            />
          )}

        </main>
      </div>

      {/* REPORT VIEWER MODAL OVERLAY */}
      {selectedAnalysisModal && (
        <div id="modal-overlay" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div id="modal-container" className="bg-slate-950 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
            
            {/* Modal header */}
            <div id="modal-header" className="p-4 border-b border-slate-900 bg-slate-950 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-mono">{selectedAnalysisModal.symbol}</span>
                <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-mono uppercase">{selectedAnalysisModal.timeframe}</span>
                <span className="text-[10px] text-slate-500 font-mono ml-2">Archived: {new Date(selectedAnalysisModal.timestamp).toLocaleDateString()}</span>
              </div>
              <button
                onClick={() => setSelectedAnalysisModal(null)}
                className="text-slate-400 hover:text-white bg-slate-900 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal scrollable report content */}
            <div id="modal-body" className="flex-1 p-6 overflow-y-auto space-y-6">
              
              {/* Bias summary card */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/20">
                  <span className="text-[9px] text-slate-500 uppercase font-semibold block">Market Bias</span>
                  <span className={`text-base font-black uppercase tracking-wider block mt-1 ${
                    selectedAnalysisModal.report.bias.direction === 'Bullish' ? 'text-emerald-400' : selectedAnalysisModal.report.bias.direction === 'Bearish' ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {selectedAnalysisModal.report.bias.direction}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/20">
                  <span className="text-[9px] text-slate-500 uppercase font-semibold block">Confidence Level</span>
                  <span className="text-base font-mono font-bold text-white mt-1 block">{selectedAnalysisModal.report.bias.confidence}%</span>
                </div>
              </div>

              {/* Structure */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/10 space-y-3">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Market Structure Breakdown</span>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 block">Trend classification</span>
                    <p className="text-slate-300 font-medium mt-0.5">{selectedAnalysisModal.report.structure.trend}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Structural shift BOS</span>
                    <p className="text-slate-300 font-mono mt-0.5">{selectedAnalysisModal.report.structure.breakOfStructure}</p>
                  </div>
                </div>
                <div className="bg-black/40 p-2.5 rounded text-[11px] text-slate-400 italic">
                  {selectedAnalysisModal.report.structure.explanation}
                </div>
              </div>

              {/* Levels */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/10 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Key structural price zones</span>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-emerald-400 block font-sans">Support Levels</span>
                    <ul className="mt-1 space-y-0.5">
                      {selectedAnalysisModal.report.levels.supportZones.map((z, idx) => <li key={idx} className="text-slate-300">{z}</li>)}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[9px] text-red-400 block font-sans">Resistance Levels</span>
                    <ul className="mt-1 space-y-0.5">
                      {selectedAnalysisModal.report.levels.resistanceZones.map((z, idx) => <li key={idx} className="text-slate-300">{z}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Setup ticket */}
              <div className="p-4 rounded-xl border border-blue-900/30 bg-blue-950/20 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Institutional Setup Ticket</span>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2 bg-black/40 rounded text-center">
                    <span className="text-[8px] text-slate-500 block">ENTRY ZONE</span>
                    <span className="text-white font-bold block mt-0.5">{selectedAnalysisModal.report.setup.entryZone}</span>
                  </div>
                  <div className="p-2 bg-black/40 rounded text-center">
                    <span className="text-[8px] text-slate-500 block">STOP LOSS</span>
                    <span className="text-red-400 font-bold block mt-0.5">{selectedAnalysisModal.report.setup.stopLoss}</span>
                  </div>
                  <div className="p-2 bg-black/40 rounded text-center">
                    <span className="text-[8px] text-slate-500 block">TARGET R:R</span>
                    <span className="text-emerald-400 font-bold block mt-0.5">{selectedAnalysisModal.report.setup.riskRewardRatio}</span>
                  </div>
                </div>
              </div>

              <Disclaimer />
            </div>

            {/* Modal footer action */}
            <div id="modal-footer" className="p-4 border-t border-slate-900 bg-slate-950/80 flex justify-end">
              <button
                onClick={() => {
                  handleLogJournalFromAI({
                    asset: selectedAnalysisModal.symbol,
                    direction: selectedAnalysisModal.report.bias.direction === 'Bearish' ? 'Short' : 'Long',
                    riskReward: parseFloat(selectedAnalysisModal.report.setup.riskRewardRatio.replace('1:', '')) || 3.0,
                    notes: `Sourced from archived report: ${selectedAnalysisModal.report.structure.trend}`
                  });
                  setSelectedAnalysisModal(null);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Log Archived Trade to Active Journal
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
