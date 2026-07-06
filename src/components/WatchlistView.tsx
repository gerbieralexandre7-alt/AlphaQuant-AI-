import React, { useState, useEffect, useRef } from 'react';
import { supabaseEmulator } from '../utils/supabaseEmulator';
import { WatchlistItem } from '../types';
import { Bookmark, Star, Trash2, Plus, Zap, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useLiveMarketData } from '../hooks/useLiveMarketData';
import MarketTerminalHeader from './MarketTerminalHeader';

interface WatchlistViewProps {
  watchlist: WatchlistItem[];
  onRefreshWatchlist: () => void;
  onAnalyzeAsset: (symbol: string) => void;
}

export default function WatchlistView({
  watchlist,
  onRefreshWatchlist,
  onAnalyzeAsset
}: WatchlistViewProps) {
  // Use our real-time market data hook
  const { marketData, loading, error, forceRefresh, lastUpdated, dataSource, marketStatus } = useLiveMarketData(3000);

  // Input states
  const [newSymbol, setNewSymbol] = useState('');
  const [newMarket, setNewMarket] = useState<'Crypto' | 'Forex' | 'Stocks'>('Crypto');
  const [formError, setFormError] = useState('');

  // Keeps track of flashes for each item in the watchlist
  const [flashes, setFlashes] = useState<Record<string, 'up' | 'down' | null>>({});
  const prevPricesRef = useRef<Record<string, number>>({});

  // Detect when prices tick and trigger appropriate flashes
  useEffect(() => {
    if (!marketData || !marketData.prices) return;

    const newFlashes: Record<string, 'up' | 'down' | null> = { ...flashes };
    let changed = false;

    watchlist.forEach((item) => {
      const liveAsset = marketData.prices[item.symbol.toUpperCase()];
      if (!liveAsset) return;

      const prevPrice = prevPricesRef.current[item.symbol];
      if (prevPrice !== undefined && prevPrice !== liveAsset.price) {
        newFlashes[item.id] = liveAsset.price > prevPrice ? 'up' : 'down';
        changed = true;

        // Clear the flash after 800ms
        const itemId = item.id;
        setTimeout(() => {
          setFlashes((prev) => ({ ...prev, [itemId]: null }));
        }, 800);
      }
      prevPricesRef.current[item.symbol] = liveAsset.price;
    });

    if (changed) {
      setFlashes(newFlashes);
    }
  }, [marketData, watchlist]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newSymbol) {
      setFormError('Please provide a valid symbol (e.g., AAPL).');
      return;
    }

    const added = supabaseEmulator.addToWatchlist(newSymbol.toUpperCase(), newMarket);
    if (added) {
      setNewSymbol('');
      onRefreshWatchlist();
    } else {
      setFormError('Asset symbol already exists in watchlist.');
    }
  };

  const handleRemove = (id: string) => {
    supabaseEmulator.removeFromWatchlist(id);
    onRefreshWatchlist();
  };

  return (
    <div id="watchlist-root" className="space-y-6 animate-fadeIn">
      
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

      {/* Title */}
      <div id="watchlist-title-panel" className="border border-slate-900 bg-slate-950/40 backdrop-blur-md rounded-2xl p-5 shadow-sm">
        <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-blue-500 fill-blue-500/20" /> Portfolio Watchlists
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor your core assets, track live blinking tick data synchronized with the secure quantitative nodes, and dispatch instantly to the AI analyzer.
        </p>
      </div>

      <div id="watchlist-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Add Asset (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <form onSubmit={handleAdd} className="border border-slate-900 bg-slate-950/40 p-6 rounded-2xl space-y-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Append Asset</h3>

            {formError && (
              <div className="p-3 bg-red-950/20 border border-red-950/40 rounded-lg text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Asset Symbol / Ticker</label>
              <input
                type="text"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                placeholder="AAPL, BTC, SOL, EURUSD, XAUUSD"
                className="w-full bg-slate-900/60 border border-slate-850 hover:border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-200 uppercase font-mono outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Asset Market Category</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 border border-slate-850 rounded-lg text-center">
                {(['Crypto', 'Forex', 'Stocks'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setNewMarket(m)}
                    className={`py-1 rounded-md text-[10px] font-semibold uppercase transition-all cursor-pointer ${
                      newMarket === m ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-blue-950/10"
            >
              <Plus className="w-4 h-4" />
              <span>Append Watchlist Star</span>
            </button>
          </form>

          {/* Quick instructions */}
          <div className="p-4 border border-slate-900 bg-slate-950/20 rounded-2xl text-xs text-slate-500 leading-relaxed space-y-1.5">
            <span className="font-semibold text-slate-400 uppercase tracking-widest text-[9px] block">Institutional Desk Tickers</span>
            <p>Prices flash <span className="text-emerald-400 font-semibold">green</span> on bid increases and <span className="text-red-400 font-semibold">red</span> on offers. Connected directly to live Binance API and multi-asset routing feeds. Click <span className="text-blue-500 font-bold">Analyze Chart</span> to initialize the neural pattern scanner.</p>
          </div>
        </div>

        {/* RIGHT COLUMN: Watchlist Items Table (8 Cols) */}
        <div className="lg:col-span-8">
          <div className="border border-slate-900 bg-slate-950/40 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-900 bg-slate-950/80">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Active Watch Market Ledger</h3>
            </div>

            {watchlist.length === 0 ? (
              <div className="text-center py-16">
                <Bookmark className="w-10 h-10 text-slate-700 mx-auto mb-2 animate-pulse" />
                <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Empty Watchlist Ledger</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                  Append custom stocks, indices, crypto or currency symbols using the addition form on the left.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-950/60 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="p-4">Symbol</th>
                      <th className="p-4">Market</th>
                      <th className="p-4 text-right">Real-Time Price</th>
                      <th className="p-4 text-right">Change %</th>
                      <th className="p-4 text-right">Dispatch Pipeline</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 font-mono">
                    {watchlist.map((item) => {
                      // Fetch from live market data lookup
                      const liveAsset = marketData?.prices?.[item.symbol.toUpperCase()];
                      
                      const priceVal = liveAsset ? liveAsset.price : item.price;
                      const changeVal = liveAsset ? liveAsset.change : item.change;
                      const isUp = changeVal >= 0;
                      const decimals = item.market === 'Forex' ? 4 : 2;
                      const flashState = flashes[item.id];

                      return (
                        <tr key={item.id} className="hover:bg-slate-900/20 transition-all">
                          <td className="p-4 text-white font-bold text-xs font-sans">{item.symbol}</td>
                          <td className="p-4">
                            <span className="text-[10px] bg-slate-900 border border-slate-850 text-slate-400 px-2 py-0.5 rounded uppercase">
                              {item.market}
                            </span>
                          </td>
                          <td className={`p-4 text-right font-bold text-xs transition-all duration-300 ${
                            flashState === 'up' 
                              ? 'text-emerald-400 bg-emerald-950/20 scale-102' 
                              : flashState === 'down'
                              ? 'text-red-400 bg-red-950/20 scale-102'
                              : 'text-slate-200'
                          }`}>
                            ${priceVal.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                          </td>
                          <td className="p-4 text-right">
                            <span className={`inline-flex items-center font-bold text-xs ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                              {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                              <span>{isUp ? '+' : ''}{changeVal.toFixed(2)}%</span>
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => onAnalyzeAsset(item.symbol)}
                              className="bg-blue-950/40 hover:bg-blue-900/60 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Zap className="w-3 h-3 text-blue-400" />
                              <span>Analyze Chart</span>
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                              title="Delete watchlist bookmark"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
