import React, { useState, useEffect } from 'react';
import { Award, ShieldAlert, Sparkles, AlertCircle, RefreshCw, Star, Info, ListChecks, MessageSquareCode } from 'lucide-react';
import { JournalEntry } from '../types';

interface AICoachConsoleProps {
  journalEntries: JournalEntry[];
  currentUser: any;
}

export default function AICoachConsole({ journalEntries, currentUser }: AICoachConsoleProps) {
  const [loading, setLoading] = useState(false);
  const [coachReport, setCoachReport] = useState<any>(null);

  const fetchCoachReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journalEntries, userProfile: currentUser })
      });
      if (res.ok) {
        const data = await res.json();
        setCoachReport(data.coachReport);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoachReport();
  }, [journalEntries]);

  return (
    <div id="ai-coach-console-root" className="space-y-6 animate-fadeIn">
      
      {/* Title & Stats summary */}
      <div id="coach-header" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-900 bg-slate-950/80 backdrop-blur-md p-6 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-500 animate-pulse" /> Performance AI Coach Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyze your quantitative trade journal, track recurring cognitive biases, and receive customized improvement action plans.
          </p>
        </div>

        <button
          onClick={fetchCoachReport}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-evaluate Journal Logs</span>
        </button>
      </div>

      {loading ? (
        <div className="border border-slate-900 bg-slate-950/40 rounded-2xl p-16 text-center space-y-4">
          <div className="relative w-14 h-14 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-950 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-widest animate-pulse">Running Journal Performance Diagnostic</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Extracting execution win rate metrics, computing risk reward expectancy margins, and tracking cognitive fatigue vectors...
          </p>
        </div>
      ) : coachReport ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* PERFORMANCE SCORE GAUGE & OVERALL EVALUATION (5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Overall Card */}
            <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-6 shadow-md space-y-5">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Current Performance Rating</span>
              
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-blue-950 text-white">
                  <Star className="w-6 h-6 text-yellow-300" />
                  <span className="text-[10px] font-bold uppercase tracking-widest mt-1">COACH</span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-wider">{coachReport.performanceRating}</h2>
                  <span className="text-[10px] text-blue-400 font-mono">Statistical consistency active</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">Performance evaluation</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-black/40 p-4 rounded-xl border border-slate-900 font-sans">
                  {coachReport.overallEvaluation}
                </p>
              </div>
            </div>

            {/* Cognitive psychology pitfall box */}
            <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-6 shadow-md space-y-3">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <MessageSquareCode className="w-4 h-4 text-purple-400" /> Cognitive Psychology Insights
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {coachReport.psychologyInsights}
              </p>
            </div>

            {/* Moat highlight */}
            <div className="p-4 rounded-xl border border-blue-950 bg-blue-950/10 text-[11px] text-slate-400 leading-relaxed">
              <span className="font-bold text-blue-400 uppercase tracking-wide block mb-1">Hedge Fund Discipline Protocol</span>
              Maintain an active execution journal. The AI performance coach monitors statistical deviations from your declared risk tolerance profile, correcting position-scaling mistakes before they compromise your operational capital pool.
            </div>

          </div>

          {/* DETAILED DRILLDOWN & PLAN (7 columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Strengths and Mistakes side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Strengths */}
              <div className="border border-slate-900 bg-slate-950/60 rounded-2xl p-5 space-y-3">
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold block">Observed Strengths</span>
                <div className="space-y-2.5">
                  {coachReport.coreStrengths.map((str: string, i: number) => (
                    <div key={i} className="flex gap-2 text-xs text-slate-400 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mistakes */}
              <div className="border border-slate-900 bg-slate-950/60 rounded-2xl p-5 space-y-3">
                <span className="text-[10px] text-red-400 uppercase tracking-widest font-bold block">Execution Flaws Identified</span>
                <div className="space-y-2.5">
                  {coachReport.identifiedMistakes.map((mis: string, i: number) => (
                    <div key={i} className="flex gap-2 text-xs text-slate-400 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-2" />
                      <span>{mis}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Recurring errors */}
            <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-5 shadow-md space-y-3">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" /> Recurring Mistakes Tracked
              </h3>
              <div className="space-y-2 text-xs text-slate-400 font-mono">
                {coachReport.recurringErrors.map((err: string, i: number) => (
                  <div key={i} className="p-3 bg-red-950/10 border-l-2 border-red-500 rounded flex gap-2.5 items-center">
                    <span className="text-red-400 font-bold">ERR-0{i+1}:</span>
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Personalized Improvement Plan */}
            <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-5 shadow-md space-y-3">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-blue-500" /> Customized Performance Improvement Steps
              </h3>
              <div className="space-y-3 text-xs font-sans">
                {coachReport.improvementPlan.map((step: string, i: number) => (
                  <div key={i} className="flex gap-3 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold font-mono text-[10px]">
                      {i+1}
                    </span>
                    <span className="text-slate-300">{step}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="border border-dashed border-slate-900 bg-slate-950/20 rounded-2xl p-16 text-center space-y-3 animate-fadeIn">
          <Info className="w-10 h-10 text-slate-700 mx-auto animate-pulse" />
          <h3 className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Psychology Terminal Dormant</h3>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
            Record executed trades inside the Trading Journal Ledger first. The AI performance coach processes historical win/loss correlations to provide advice.
          </p>
        </div>
      )}

    </div>
  );
}
