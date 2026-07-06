import React, { useState, useEffect } from 'react';
import { supabaseEmulator } from '../utils/supabaseEmulator';
import { JournalEntry } from '../types';
import { BookOpen, Plus, Trash2, TrendingUp, DollarSign, Award, ChevronDown, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface TradingJournalViewProps {
  entries: JournalEntry[];
  onRefreshEntries: () => void;
  initialFormValue: { asset: string; direction: 'Long' | 'Short'; riskReward: number; notes: string } | null;
  onClearInitialFormValue: () => void;
}

export default function TradingJournalView({
  entries,
  onRefreshEntries,
  initialFormValue,
  onClearInitialFormValue
}: TradingJournalViewProps) {
  
  // Show manual logging form toggles
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [asset, setAsset] = useState('BTCUSD');
  const [direction, setDirection] = useState<'Long' | 'Short'>('Long');
  const [result, setResult] = useState<'Win' | 'Loss' | 'Pending'>('Win');
  const [pnl, setPnl] = useState<number>(1000);
  const [notes, setNotes] = useState('');
  const [riskReward, setRiskReward] = useState<number>(3);
  const [error, setError] = useState('');

  // Handle prefilled entry values from AI outputs
  useEffect(() => {
    if (initialFormValue) {
      setAsset(initialFormValue.asset);
      setDirection(initialFormValue.direction);
      setRiskReward(initialFormValue.riskReward);
      setNotes(initialFormValue.notes);
      setResult('Pending'); // Default to pending since it was just planned
      setPnl(0);
      setShowForm(true);
      onClearInitialFormValue();
    }
  }, [initialFormValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!asset) {
      setError('Please provide a target asset symbol.');
      return;
    }

    try {
      const added = supabaseEmulator.addJournalEntry({
        date,
        asset: asset.toUpperCase(),
        direction,
        result,
        pnl: result === 'Pending' ? 0 : pnl,
        notes,
        riskReward
      });

      if (added) {
        // Reset manual form fields
        setNotes('');
        setPnl(0);
        setShowForm(false);
        onRefreshEntries();
      } else {
        setError('Could not preserve trade entry.');
      }
    } catch {
      setError('Database error occurred.');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this journal entry?')) {
      supabaseEmulator.deleteJournalEntry(id);
      onRefreshEntries();
    }
  };

  // Stats Calculations
  const completed = entries.filter((e) => e.result !== 'Pending');
  const wins = completed.filter((e) => e.result === 'Win');
  const winRate = completed.length > 0 ? Math.round((wins.length / completed.length) * 100) : 0;
  
  const totalProfit = entries.reduce((sum, item) => sum + item.pnl, 0);
  
  const avgRR = completed.length > 0 
    ? (completed.reduce((sum, item) => sum + item.riskReward, 0) / completed.length).toFixed(1) 
    : '0.0';

  // Determine favorite asset
  const assetCounts = entries.reduce((acc, curr) => {
    acc[curr.asset] = (acc[curr.asset] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const bestAsset = Object.keys(assetCounts).length > 0 
    ? Object.keys(assetCounts).reduce((a, b) => assetCounts[a] > assetCounts[b] ? a : b)
    : 'None';

  return (
    <div id="trading-journal-root" className="space-y-6">
      
      {/* Title with toggle form */}
      <div id="journal-heading-panel" className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" /> Quantitative Trading Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Maintain high-precision logs of your historical and planned market executions.
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1 shadow-lg shadow-blue-900/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Log Custom Execution
        </button>
      </div>

      {/* STATS STRIP */}
      <div id="journal-stats-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Win Rate */}
        <div className="border border-slate-800 bg-slate-950/40 p-4 rounded-xl shadow-md">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Win Rate</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white">{winRate}%</span>
            <span className="text-[10px] text-slate-500">({wins.length}/{completed.length} Trades)</span>
          </div>
          <div className="w-full bg-slate-900 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${winRate}%` }} />
          </div>
        </div>

        {/* Average Risk Reward */}
        <div className="border border-slate-800 bg-slate-950/40 p-4 rounded-xl shadow-md">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Average Target R:R</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white">{avgRR}R</span>
            <span className="text-[10px] text-emerald-400 font-medium">Positive expectancy</span>
          </div>
          <div className="w-full bg-slate-900 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, (parseFloat(avgRR) / 5) * 100)}%` }} />
          </div>
        </div>

        {/* Total Profit */}
        <div className="border border-slate-800 bg-slate-950/40 p-4 rounded-xl shadow-md">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Total Profit / Loss</p>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalProfit >= 0 ? '+' : ''}€{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-full bg-slate-900 h-1 rounded-full mt-3 overflow-hidden">
            <div className={`h-full rounded-full ${totalProfit >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: '100%' }} />
          </div>
        </div>

        {/* Best Asset */}
        <div className="border border-slate-800 bg-slate-950/40 p-4 rounded-xl shadow-md">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Best Performing Asset</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white">{bestAsset}</span>
          </div>
          <div className="w-full bg-slate-900 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* EXPANDABLE LOG TRADE FORM */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border border-slate-800 bg-slate-950/60 p-6 rounded-2xl space-y-4 shadow-lg animate-slideDown">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Trade Record Input Terminal</h3>

          {error && (
            <div className="p-3 bg-red-950/20 border border-red-950 rounded-lg text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Date */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Execution Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-200 outline-none"
                required
              />
            </div>

            {/* Asset Symbol */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Asset Symbol</label>
              <input
                type="text"
                value={asset}
                onChange={(e) => setAsset(e.target.value.toUpperCase())}
                placeholder="BTCUSD"
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-200 uppercase font-mono outline-none"
                required
              />
            </div>

            {/* Direction */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Order Direction</label>
              <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 border border-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setDirection('Long')}
                  className={`py-1 rounded-md text-center text-xs font-semibold transition-all ${
                    direction === 'Long' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Long / Buy
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('Short')}
                  className={`py-1 rounded-md text-center text-xs font-semibold transition-all ${
                    direction === 'Short' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Short / Sell
                </button>
              </div>
            </div>

            {/* Risk Reward */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Risk-Reward Ratio</label>
              <input
                type="number"
                step="0.1"
                value={riskReward}
                onChange={(e) => setRiskReward(parseFloat(e.target.value) || 0)}
                placeholder="3.2"
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-200 font-mono outline-none"
                required
                min="0.1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs pt-1">
            {/* Result */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Execution Outcome</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 border border-slate-800 rounded-lg">
                {(['Win', 'Loss', 'Pending'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setResult(r)}
                    className={`py-1 rounded-md text-center text-xs font-semibold transition-all uppercase tracking-wider ${
                      result === r ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* PNL Value */}
            {result !== 'Pending' && (
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Net PnL (EUR/USD)</label>
                <input
                  type="number"
                  value={pnl}
                  onChange={(e) => setPnl(parseInt(e.target.value) || 0)}
                  placeholder="1000"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-200 font-mono outline-none"
                  required
                />
              </div>
            )}

            {/* Notes */}
            <div className={result === 'Pending' ? 'sm:col-span-2' : 'sm:col-span-1'}>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Confluence Trade Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mitigated H4 demand area with sweep..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-200 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-800 text-slate-400 text-xs rounded-lg hover:bg-slate-900 cursor-pointer"
            >
              Discard
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-blue-900/20 cursor-pointer"
            >
              Commit Entry to Ledger
            </button>
          </div>
        </form>
      )}

      {/* LEDGER GRID TABLE */}
      <div id="ledger-table-box" className="border border-slate-800 bg-slate-950/40 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 bg-slate-950/80">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Active Execution Registry</h3>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-10 h-10 text-slate-700 mx-auto mb-2 animate-pulse" />
            <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wider">No Logs in Ledger Registry</h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              Maintain an active journal by manually adding trade items, or running AI analyses and pushing recommended setups directly.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/60 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="p-4">Execution Date</th>
                  <th className="p-4">Asset</th>
                  <th className="p-4">Direction</th>
                  <th className="p-4 text-center">Outcome</th>
                  <th className="p-4 text-center">Risk Reward</th>
                  <th className="p-4 text-right">Net PnL</th>
                  <th className="p-4 max-w-xs">Confluence Notes</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 text-slate-400 font-mono">{entry.date}</td>
                    <td className="p-4 text-white font-bold font-mono">{entry.asset}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold uppercase ${entry.direction === 'Long' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {entry.direction}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        entry.result === 'Win' 
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/30'
                          : entry.result === 'Loss'
                          ? 'bg-red-950/60 text-red-400 border border-red-900/30'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        {entry.result === 'Win' && <CheckCircle className="w-3 h-3" />}
                        {entry.result === 'Loss' && <XCircle className="w-3 h-3" />}
                        {entry.result === 'Pending' && <Clock className="w-3 h-3" />}
                        <span>{entry.result}</span>
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono text-slate-300">{entry.riskReward}R</td>
                    <td className={`p-4 text-right font-mono font-bold ${
                      entry.result === 'Pending' 
                        ? 'text-slate-500' 
                        : entry.pnl >= 0 
                        ? 'text-emerald-400' 
                        : 'text-red-400'
                    }`}>
                      {entry.result === 'Pending' ? '-' : `${entry.pnl >= 0 ? '+' : ''}€${entry.pnl}`}
                    </td>
                    <td className="p-4 max-w-xs truncate text-slate-400 text-[11px]" title={entry.notes}>
                      {entry.notes || '-'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                        title="Remove entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
