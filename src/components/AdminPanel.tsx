import React, { useState } from 'react';
import { supabaseEmulator } from '../utils/supabaseEmulator';
import { UserProfile, FeedbackMessage } from '../types';
import { Users, ShieldCheck, MessageSquare, BarChart, ToggleLeft, ToggleRight, Sparkles, Check } from 'lucide-react';

interface AdminPanelProps {
  onRefreshStats: () => void;
  users: UserProfile[];
  feedbacks: FeedbackMessage[];
  analysesCount: number;
}

export default function AdminPanel({
  onRefreshStats,
  users,
  feedbacks,
  analysesCount
}: AdminPanelProps) {
  
  const [activeTab, setActiveTab] = useState<'users' | 'feedback'>('users');
  const [newFeedbackMessage, setNewFeedbackMessage] = useState('');
  const [newFeedbackCat, setNewFeedbackCat] = useState<'Bug' | 'Feature' | 'Idea' | 'General'>('Feature');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const handleToggleBeta = (userId: string) => {
    supabaseEmulator.toggleBetaTester(userId);
    onRefreshStats();
  };

  const handleMockFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedbackMessage) return;

    const res = await supabaseEmulator.submitFeedback(newFeedbackMessage, newFeedbackCat);
    if (res) {
      setNewFeedbackMessage('');
      setFeedbackSuccess(true);
      onRefreshStats();
      setTimeout(() => setFeedbackSuccess(false), 3000);
    }
  };

  return (
    <div id="admin-root" className="space-y-6">
      
      {/* Title */}
      <div id="admin-heading">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-500" /> Administrative Console Desk
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Hedge fund platform supervisors can audit users, beta testers permission lists, and live user feedback pipelines.
        </p>
      </div>

      {/* STATS */}
      <div id="admin-stats" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-slate-800 bg-slate-950/40 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Supervised Practitioners</p>
            <span className="text-xl font-bold font-mono text-white">{users.length}</span>
          </div>
          <Users className="w-8 h-8 text-blue-500/30" />
        </div>

        <div className="border border-slate-800 bg-slate-950/40 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Global AI Reports Synthesized</p>
            <span className="text-xl font-bold font-mono text-white">{analysesCount}</span>
          </div>
          <BarChart className="w-8 h-8 text-cyan-500/30" />
        </div>

        <div className="border border-slate-800 bg-slate-950/40 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Feedback Pipelines</p>
            <span className="text-xl font-bold font-mono text-white">{feedbacks.length}</span>
          </div>
          <MessageSquare className="w-8 h-8 text-purple-500/30" />
        </div>
      </div>

      {/* SUB TAB SELECTORS */}
      <div id="admin-tabs" className="flex border-b border-slate-900 pb-px gap-4">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'users' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Registered Accounts & Beta Testers
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'feedback' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Practitioner Feedback ({feedbacks.length})
        </button>
      </div>

      {/* USER LIST TAB */}
      {activeTab === 'users' && (
        <div id="admin-users-table" className="border border-slate-800 bg-slate-950/40 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/60 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="p-4">Email / User ID</th>
                  <th className="p-4">Experience</th>
                  <th className="p-4">Trading Style</th>
                  <th className="p-4 text-right">Trading Capital</th>
                  <th className="p-4">Risk Tolerance</th>
                  <th className="p-4 text-center">Beta Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/20 transition-all">
                    <td className="p-4">
                      <div className="font-bold text-white font-mono">{u.email}</div>
                      <span className="text-[9px] text-slate-600 block font-mono">{u.id}</span>
                    </td>
                    <td className="p-4">
                      {u.isOnboarded ? (
                        <span className="text-slate-300 font-semibold">{u.tradingExperience}</span>
                      ) : (
                        <span className="text-slate-600 italic">Not onboarded</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400">{u.tradingStyle || '-'}</td>
                    <td className="p-4 text-right font-mono font-semibold text-slate-200">
                      {u.isOnboarded ? `€${u.tradingCapital.toLocaleString()}` : '-'}
                    </td>
                    <td className="p-4">
                      {u.isOnboarded ? (
                        <span className={`text-[10px] font-bold ${
                          u.riskTolerance === 'Conservative' ? 'text-blue-400' : u.riskTolerance === 'Moderate' ? 'text-yellow-500' : 'text-red-400'
                        }`}>
                          {u.riskTolerance}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.isBetaTester 
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/30' 
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}>
                        {u.isBetaTester ? 'Approved Tester' : 'General Practitioner'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleBeta(u.id)}
                        className={`text-[10px] font-bold py-1 px-2.5 rounded transition-colors inline-flex items-center gap-1 cursor-pointer ${
                          u.isBetaTester
                            ? 'bg-slate-900 hover:bg-slate-800 text-red-400 border border-slate-800'
                            : 'bg-blue-950/40 hover:bg-blue-900/40 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {u.isBetaTester ? 'Revoke Beta Access' : 'Approve Beta Access'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FEEDBACK TAB */}
      {activeTab === 'feedback' && (
        <div id="admin-feedback-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Feedback messages (8 Cols) */}
          <div className="lg:col-span-8 border border-slate-800 bg-slate-950/40 rounded-2xl overflow-hidden shadow-lg h-full">
            {feedbacks.length === 0 ? (
              <div className="text-center py-16">
                <MessageSquare className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-semibold">No feedback messages in pipe.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-900">
                {feedbacks.map((f) => (
                  <div key={f.id} className="p-4 hover:bg-slate-900/10 transition-all text-xs">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="font-bold text-white font-mono">{f.userEmail}</span>
                        <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded uppercase ml-2">{f.category}</span>
                      </div>
                      <span className="text-[10px] text-slate-600 font-mono">{new Date(f.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-300 mt-2 leading-relaxed text-[11px]">{f.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Simulate feedback submittal form (4 Cols) */}
          <div className="lg:col-span-4">
            <form onSubmit={handleMockFeedbackSubmit} className="border border-slate-800 bg-slate-950/40 p-5 rounded-2xl space-y-4 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" /> Simulate Practitioner Submission
              </h3>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Test the feedback pipeline by submitting a mock review from your logged in email.
              </p>

              {feedbackSuccess && (
                <div className="p-2.5 bg-emerald-950/20 border border-emerald-950 text-xs text-emerald-400 rounded-lg flex items-center gap-1.5 animate-slideDown">
                  <Check className="w-4 h-4" /> Message committed to supervisor pipeline.
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Feedback Category</label>
                <select
                  value={newFeedbackCat}
                  onChange={(e) => setNewFeedbackCat(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none cursor-pointer"
                >
                  <option value="Feature">Feature Request</option>
                  <option value="Bug">Bug Report</option>
                  <option value="Idea">Product Idea</option>
                  <option value="General">General Comment</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Audit Message</label>
                <textarea
                  value={newFeedbackMessage}
                  onChange={(e) => setNewFeedbackMessage(e.target.value)}
                  placeholder="Analyze parameters function is incredible! Suggest adding a 30m candlestick timeframe option..."
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-xs text-slate-200 outline-none resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                Dispatch feedback log
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
