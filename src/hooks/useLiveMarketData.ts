import { useState, useEffect, useCallback } from 'react';

export interface MarketAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changeAmt: number;
  high: number;
  low: number;
  volume: string;
  volatility: 'Low' | 'Medium' | 'High' | 'Extreme';
  type: 'Stocks' | 'Crypto' | 'Forex' | 'Commodities';
  flow: string;
}

export interface SectorRotation {
  sector: string;
  momentum: string;
  weight: string;
  flow: string;
  status: 'Leading' | 'Weakening' | 'Lagging' | 'Improving';
  change: number;
}

export interface EconomicEvent {
  time: string;
  currency: string;
  event: string;
  actual: string;
  forecast: string;
  previous: string;
  impact: 'High' | 'Medium' | 'Low';
  aiVerdict: string;
}

export interface FinancialNews {
  title: string;
  source: string;
  time: string;
  category: string;
  summary: string;
  whyMatters: string;
  potentialImpact: string;
  affectedAssets: string;
  probability: string;
  type: 'Bullish' | 'Bearish' | 'Neutral';
}

export interface MarketData {
  lastUpdated: string;
  dataSource: string;
  marketStatus: {
    stocks: 'Open' | 'Closed';
    forex: 'Open' | 'Closed';
    crypto: 'Open' | 'Closed';
  };
  prices: Record<string, MarketAsset>;
  fearAndGreed: {
    score: number;
    rating: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
    explanation: string;
  };
  sectorPerformance: SectorRotation[];
  economicCalendar: EconomicEvent[];
  news: FinancialNews[];
  briefs: {
    morning: string;
    midday: string;
    closing: string;
    weekly: string;
    monthly: string;
    lastGenerated: string;
  };
}

export function useLiveMarketData(intervalMs = 4000) {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchMarketData = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setIsRefreshing(true);
    }
    try {
      const response = await fetch('/api/market-data');
      if (!response.ok) {
        throw new Error('Data temporarily unavailable.');
      }
      const data = await response.json();
      setMarketData(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching market data:', err);
      setError('Data temporarily unavailable.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchMarketData(false);

    // Dynamic auto-refresh timer
    const timer = setInterval(() => {
      fetchMarketData(true);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [fetchMarketData, intervalMs]);

  const forceRefresh = useCallback(() => {
    return fetchMarketData(false);
  }, [fetchMarketData]);

  return {
    marketData,
    loading,
    error,
    isRefreshing,
    forceRefresh,
    lastUpdated: marketData?.lastUpdated || new Date().toISOString(),
    dataSource: marketData?.dataSource || 'Connecting to network...',
    marketStatus: marketData?.marketStatus || { stocks: 'Closed', forex: 'Closed', crypto: 'Open' }
  };
}
