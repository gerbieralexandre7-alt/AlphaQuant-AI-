import React, { useState } from 'react';
import { SavedAnalysis } from '../types';
import { Clock, Eye, Trash2, Download, AlertCircle, Calendar, ChevronRight, Compass } from 'lucide-react';

interface HistoryViewProps {
  analyses: SavedAnalysis[];
  onRefreshHistory: () => void;
  onViewAnalysis: (analysis: SavedAnalysis) => void;
  onDeleteAnalysis: (id: string) => void;
}

export default function HistoryView({
  analyses,
  onRefreshHistory,
  onViewAnalysis,
  onDeleteAnalysis
}: HistoryViewProps) {
  
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAnalyses = analyses.filter((item) => {
    return item.symbol.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleExportAllJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(analyses, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `AlphaQuant_Full_History_Export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="history-root" className="space-y-6">
      
      {/* Title */}
      <div id="history-header" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" /> Analysis Archival Vault
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access past reports, export datasets, and audit systemic technical analyses.
          </p>
        </div>

        {analyses.length > 0 && (
          <button
            onClick={handleExportAllJSON}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs py-2 px-4 rounded-lg flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Archival Dataset (.json)
          </button>
        )}
      </div>

      {/* FILTER BAR */}
      <div id="history-filters" className="flex gap-4">
        <input
          type="text"
          placeholder="Filter archived symbols (e.g., BTCUSD)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-lg px-4 py-2.5 text-xs text-slate-200 uppercase font-mono outline-none transition-colors"
        />
      </div>

      {/* LIST OF HISTORICAL ARCHIVE */}
      <div id="history-list-box" className="border border-slate-800 bg-slate-950/40 rounded-2xl overflow-hidden shadow-lg">
        {filteredAnalyses.length === 0 ? (
          <div className="text-center py-20">
            <Compass className="w-12 h-12 text-slate-700 mx-auto mb-3 animate-spin-slow" />
            <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wider">No Archived Analyses Matched</h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              Run chart analyses on the AI Market Analysis console. Successful reports are automatically preserved in the vault.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-900">
            {filteredAnalyses.map((analysis) => {
              const directionColor = analysis.report.bias.direction === 'Bullish' 
                ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-900/30' 
                : analysis.report.bias.direction === 'Bearish'
                ? 'text-red-400 bg-red-950/40 border border-red-900/30'
                : 'text-slate-400 bg-slate-900 border border-slate-800';

              return (
                <div 
                  key={analysis.id}
                  className="p-5 hover:bg-slate-900/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4">
                    {/* Tiny thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-850 overflow-hidden shrink-0">
                      <img src={analysis.screenshotUrl} alt={analysis.symbol} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-mono">{analysis.symbol}</span>
                        <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-mono uppercase">{analysis.timeframe}</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 mt-1.5 font-mono">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-600" /> {new Date(analysis.timestamp).toLocaleString()}</span>
                        <span>R:R: {analysis.report.setup.riskRewardRatio}</span>
                        <span>Conviction: {analysis.report.conviction.score}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-end shrink-0">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${directionColor}`}>
                      {analysis.report.bias.direction}
                    </span>

                    <button
                      onClick={() => onViewAnalysis(analysis)}
                      className="bg-blue-950/40 hover:bg-blue-900/60 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Auditing report</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteAnalysis(analysis.id)}
                      className="text-slate-600 hover:text-red-400 p-1.5 transition-colors cursor-pointer"
                      title="Delete archived entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
