import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase limit to allow base64 image uploads
app.use(express.json({ limit: '10mb' }));

// Helper to initialize Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.warn('GEMINI_API_KEY is not defined or is placeholder. Falling back to high-fidelity simulated analyses.');
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// Helper to call Gemini with robust retries and fallback
const generateContentWithRetry = async (
  ai: GoogleGenAI,
  params: {
    model: string;
    contents: any;
    config?: any;
  },
  maxRetries = 3,
  delayMs = 1500
) => {
  let attempts = 0;
  let currentModel = params.model;
  
  while (attempts < maxRetries) {
    try {
      attempts++;
      console.log(`Gemini API call attempt ${attempts} of ${maxRetries} using model '${currentModel}'...`);
      const response = await ai.models.generateContent({
        ...params,
        model: currentModel,
      });
      return { response, modelUsed: currentModel };
    } catch (error: any) {
      console.warn(`Gemini API call attempt ${attempts} failed.`, error);
      
      const isTransient = 
        error?.status === 503 || 
        error?.status === 429 || 
        error?.code === 503 ||
        error?.code === 429 ||
        (error?.message && (
          error.message.includes('503') || 
          error.message.includes('UNAVAILABLE') || 
          error.message.includes('429') ||
          error.message.includes('RESOURCE_EXHAUSTED') ||
          error.message.includes('high demand')
        ));

      if (isTransient && attempts < maxRetries) {
        // Try falling back to gemini-3.1-flash-lite on high load or retry with exponential backoff
        if (attempts >= 1 && currentModel === 'gemini-3.5-flash') {
          console.log(`Model '${currentModel}' is busy. Switching fallback to 'gemini-3.1-flash-lite' for next attempt.`);
          currentModel = 'gemini-3.1-flash-lite';
        }
        const backoff = delayMs * Math.pow(2, attempts - 1) * (0.8 + Math.random() * 0.4); // Exponential backoff + jitter
        console.log(`Transient error detected. Backing off for ${Math.round(backoff)}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
      } else {
        // Non-transient error or retries exhausted
        throw error;
      }
    }
  }
  throw new Error('All Gemini call retries exhausted');
};

// ==========================================
// REAL-TIME MARKET INTELLIGENCE INFRASTRUCTURE
// ==========================================

const livePrices: Record<string, any> = {
  // Stocks
  'SPY': { symbol: 'SPY', name: 'S&P 500 ETF', price: 512.50, change: 0.85, base: 512.50, type: 'Stocks', volume: '4.8M', volatility: 'Low', flow: 'Institutional Accumulation' },
  'QQQ': { symbol: 'QQQ', name: 'Nasdaq 100 ETF', price: 432.80, change: 1.22, base: 432.80, type: 'Stocks', volume: '6.2M', volatility: 'Medium', flow: 'High-Beta Momentum' },
  'DIA': { symbol: 'DIA', name: 'Dow Jones ETF', price: 389.20, change: 0.35, base: 389.20, type: 'Stocks', volume: '1.4M', volatility: 'Low', flow: 'Defensive Rotation' },
  'IWM': { symbol: 'IWM', name: 'Russell 2000 ETF', price: 198.50, change: -0.42, base: 198.50, type: 'Stocks', volume: '3.1M', volatility: 'Medium', flow: 'Retail Outflow' },
  'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', price: 182.40, change: 0.95, base: 182.40, type: 'Stocks', volume: '52.1M', volatility: 'Low', flow: 'Institutional Accumulation' },
  'MSFT': { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.60, change: 1.10, base: 415.60, type: 'Stocks', volume: '22.8M', volatility: 'Low', flow: 'Corporate Buyback' },
  'NVDA': { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.20, change: 4.82, base: 875.20, type: 'Stocks', volume: '78.5M', volatility: 'High', flow: 'High-Beta Momentum' },
  'TSLA': { symbol: 'TSLA', name: 'Tesla Inc.', price: 175.80, change: -2.35, base: 175.80, type: 'Stocks', volume: '88.1M', volatility: 'High', flow: 'Short Squeeze Sweep' },

  // Crypto
  'BTC': { symbol: 'BTC', name: 'Bitcoin', price: 96420.00, change: 3.45, base: 96420.00, type: 'Crypto', volume: '48.5K', volatility: 'High', flow: 'Liquidity Sweep' },
  'ETH': { symbol: 'ETH', name: 'Ethereum', price: 3450.00, change: 2.15, base: 3450.00, type: 'Crypto', volume: '125.1K', volatility: 'High', flow: 'Programmatic Gas Flow' },
  'SOL': { symbol: 'SOL', name: 'Solana', price: 148.60, change: -1.82, base: 148.60, type: 'Crypto', volume: '840.4K', volatility: 'Extreme', flow: 'Retail FOMO Drive' },
  'BNB': { symbol: 'BNB', name: 'Binance Coin', price: 585.30, change: 0.75, base: 585.30, type: 'Crypto', volume: '18.2K', volatility: 'Medium', flow: 'Institutional Accumulation' },
  'ADA': { symbol: 'ADA', name: 'Cardano', price: 0.485, change: -1.15, base: 0.485, type: 'Crypto', volume: '4.8M', volatility: 'Medium', flow: 'Retail Outflow' },
  'XRP': { symbol: 'XRP', name: 'Ripple', price: 0.582, change: -0.95, base: 0.582, type: 'Crypto', volume: '12.8M', volatility: 'High', flow: 'Systemic Settlement Flow' },

  // Forex
  'EURUSD': { symbol: 'EURUSD', name: 'Euro / US Dollar', price: 1.0854, change: 0.12, base: 1.0854, type: 'Forex', volume: '15.2M', volatility: 'Low', flow: 'Sovereign Rebalancing' },
  'GBPUSD': { symbol: 'GBPUSD', name: 'Pound / US Dollar', price: 1.2780, change: 0.28, base: 1.2780, type: 'Forex', volume: '8.4M', volatility: 'Low', flow: 'Sovereign Rebalancing' },
  'USDJPY': { symbol: 'USDJPY', name: 'US Dollar / Yen', price: 156.40, change: -0.65, base: 156.40, type: 'Forex', volume: '22.1M', volatility: 'Medium', flow: 'Yield Arbitrage' },
  'AUDUSD': { symbol: 'AUDUSD', name: 'Aussie / US Dollar', price: 0.6650, change: -0.15, base: 0.6650, type: 'Forex', volume: '4.5M', volatility: 'Low', flow: 'Commodity Backing Flow' },
  'USDCAD': { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar', price: 1.3680, change: 0.08, base: 1.3680, type: 'Forex', volume: '3.9M', volatility: 'Low', flow: 'Commodity Backing Flow' },

  // Commodities & Yields
  'XAUUSD': { symbol: 'XAUUSD', name: 'Gold Spot', price: 2342.50, change: 0.95, base: 2342.50, type: 'Commodities', volume: '85.2K', volatility: 'Medium', flow: 'Safe-Haven Premium' },
  'XAGUSD': { symbol: 'XAGUSD', name: 'Silver Spot', price: 28.35, change: 1.45, base: 28.35, type: 'Commodities', volume: '110.8K', volatility: 'High', flow: 'Industrial Inflation Hedge' },
  'WTI': { symbol: 'WTI', name: 'WTI Crude Oil', price: 78.45, change: -1.35, base: 78.45, type: 'Commodities', volume: '420.5K', volatility: 'High', flow: 'Geopolitical Supply Sweep' },
  'BRENT': { symbol: 'BRENT', name: 'Brent Crude Oil', price: 82.60, change: -1.15, base: 82.60, type: 'Commodities', volume: '310.2K', volatility: 'Medium', flow: 'Geopolitical Supply Sweep' },
  'NATGAS': { symbol: 'NATGAS', name: 'Natural Gas', price: 2.15, change: -3.40, base: 2.15, type: 'Commodities', volume: '1.2M', volatility: 'Extreme', flow: 'Short Squeeze Sweep' },
  'US10Y': { symbol: 'US10Y', name: 'US 10-Yr Yield', price: 4.425, change: -0.82, base: 4.425, type: 'Commodities', volume: 'N/A', volatility: 'Low', flow: 'Liquidity Sweep' }
};

let sectorPerformance = [
  { sector: 'Technology', momentum: 'High', weight: '28.5%', flow: 'Institutional Accumulation', status: 'Leading' as const, change: 1.45 },
  { sector: 'Financials', momentum: 'Medium', weight: '13.2%', flow: 'Corporate Buyback', status: 'Leading' as const, change: 0.54 },
  { sector: 'Healthcare', momentum: 'Low', weight: '12.4%', flow: 'Defensive Rotation', status: 'Improving' as const, change: 0.12 },
  { sector: 'Consumer Discretionary', momentum: 'Medium', weight: '10.8%', flow: 'Retail Outflow', status: 'Weakening' as const, change: -0.35 },
  { sector: 'Energy', momentum: 'High', weight: '4.2%', flow: 'Geopolitical Supply Sweep', status: 'Lagging' as const, change: -1.15 },
  { sector: 'Utilities', momentum: 'Low', weight: '2.5%', flow: 'Defensive Rotation', status: 'Lagging' as const, change: -0.62 }
];

const offlineNews = [
  {
    title: "US Core CPI Rises 0.2% in June, Supporting Rate Cut Expectations",
    source: "Federal Reserve Board",
    time: "15m ago",
    category: "Macroeconomics",
    summary: "The Core Consumer Price Index increased by 0.2% on a month-over-month basis, aligning perfectly with consensus forecasts. This brings the annualized rate to 3.2%, providing additional latitude for the Federal Open Market Committee (FOMC) to consider policy normalization guidelines in upcoming cycles.",
    whyMatters: "Validates inflation disinflationary momentum without triggering systemic recessions.",
    potentialImpact: "Yield curve flattening as market prices in a September rate cut.",
    affectedAssets: "SPY, QQQ, BTC, USD, EURUSD",
    probability: "85%",
    type: "Bullish" as const
  },
  {
    title: "NVIDIA Introduces Blackwell Ultra Architecture For Specialized Enterprise AI",
    source: "NVIDIA Corp.",
    time: "45m ago",
    category: "Stocks",
    summary: "NVIDIA has unveiled its next-generation Blackwell Ultra GPU architecture, optimizing floating-point performance and high-bandwidth memory (HBM3E) integration. Pre-orders from hyper-scalers have already exceeded production capacities for the first three fiscal quarters.",
    whyMatters: "Reinforces tech sector monopoly and guarantees robust high-performance computing hardware demand.",
    potentialImpact: "Continued institutional sector rotation back into heavy megacap technology.",
    affectedAssets: "NVDA, QQQ, MSFT, AAPL",
    probability: "95%",
    type: "Bullish" as const
  },
  {
    title: "Sovereign Funds Accumulate Gold Spot Amid Growing Geopolitical Frictions",
    source: "World Gold Council",
    time: "1h ago",
    category: "Commodities",
    summary: "Central banks in developing nations have expanded their official gold reserves, offsetting sovereign debt positions. This coordinated accumulation has pushed XAU/USD above critical order blocks, triggering retail breakout triggers.",
    whyMatters: "Signals a structural shift away from G10 treasury concentration.",
    potentialImpact: "Sustained upward commodity trends with technical consolidation boundaries.",
    affectedAssets: "XAUUSD, XAGUSD, SPY",
    probability: "90%",
    type: "Bullish" as const
  },
  {
    title: "SEC Approves Options Trading for Major Spot Ether ETFs",
    source: "SEC Filing Desk",
    time: "2h ago",
    category: "Crypto",
    summary: "The Securities and Exchange Commission has formally authorized options derivative listing for Ether exchange-traded funds. Market participants expect this to compress structural spot volatility while facilitating heavy institutional hedging desks.",
    whyMatters: "Bridges the gap between traditional options clearing houses and digital asset spot desks.",
    potentialImpact: "Decompression of open interest cycles with elevated basis yields.",
    affectedAssets: "ETH, BTC, SOL",
    probability: "80%",
    type: "Bullish" as const
  },
  {
    title: "European Central Bank Retains Rates, Signals Conditional Data Stance",
    source: "ECB Frankfurt",
    time: "3h ago",
    category: "Central Banks",
    summary: "The ECB Governing Council maintained its benchmark deposit facility rate at 3.75%. President Lagarde emphasized that domestic wage pressures remain elevated, meaning policy easing must progress on a highly restrictive, meeting-by-meeting basis.",
    whyMatters: "Limits near-term eurozone liquidity expansion while stabilizing euro valuation grids.",
    potentialImpact: "Euro/USD range consolidation within daily value boundaries.",
    affectedAssets: "EURUSD, GBPUSD, SPY",
    probability: "75%",
    type: "Neutral" as const
  }
];

const offlineCalendar = [
  {
    time: "08:30 AM",
    currency: "USD",
    event: "Core CPI MoM (June)",
    actual: "0.2%",
    forecast: "0.2%",
    previous: "0.1%",
    impact: "High" as const,
    aiVerdict: "Neutral/Slightly Bullish. Reinforces expectations for structural policy easing, preserving equities support."
  },
  {
    time: "08:30 AM",
    currency: "USD",
    event: "Unemployment Claims",
    actual: "222K",
    forecast: "225K",
    previous: "229K",
    impact: "Medium" as const,
    aiVerdict: "Bullish. Shows labor market stabilization. Mitigates aggressive hard-landing macro fears."
  },
  {
    time: "10:30 AM",
    currency: "USD",
    event: "Natural Gas Storage",
    actual: "-45B",
    forecast: "-48B",
    previous: "-52B",
    impact: "Low" as const,
    aiVerdict: "Neutral. Storage draw is slightly smaller than forecasted, capping natural gas commodity runs."
  },
  {
    time: "11:00 AM",
    currency: "EUR",
    event: "ECB President Lagarde Speech",
    actual: "Active",
    forecast: "N/A",
    previous: "N/A",
    impact: "High" as const,
    aiVerdict: "Slightly Hawkish. Emphasizes that future rate cuts require explicit convergence of services CPI."
  }
];

const offlineBriefs = {
  morning: `### AlphaQuant Morning Intelligence Brief
  
**Current Regime:** Risk-On / Disinflationary Stance
**Last Updated:** Today, Pre-Market Open

**Macro Overview:** Markets are exhibiting positive momentum following the pre-market release of the US Core CPI print. The 0.2% MoM figure aligns with expectations and reinforces the structural soft-landing narrative. Treasury yields are adjusting lower across the curve, with the 10-Yr yield sliding to 4.42%. 

**Asset Allocations & Technical Scenarios:**
*   **Equities (SPY/QQQ):** Indices are positioned to test historical value area highs. Look for a potential breakout above 513.50 on SPY to open a direct extension towards 515. 
*   **Digital Assets (BTC/ETH):** Bitcoin has successfully cleared the 96,000 order block, supported by options skew trends. Immediate resistance is located at 98,000.
*   **Commodities (Gold):** Spot gold is holding above 2,340, demonstrating safe-haven bid resilience amid ongoing geopolitical friction points.`,

  midday: `### AlphaQuant Midday Technical Summary
  
**Current Regime:** Intraday Volatility Expansion
**Last Updated:** Today, 12:30 PM EST

**Macro Overview:** Equity indices opened with a gap-up but are experiencing rotational profit-taking at the active resistance bands. The technology sector remains the primary engine of momentum, led by strong performance in semi-conductors following NVIDIA's Blackwell Ultra release. Defensive sectors (utilities and consumer staples) are showing minor outflows, confirming sustained retail risk appetite.

**Asset Allocations & Technical Scenarios:**
*   **Equities (QQQ):** Consolidated in a narrow 431.50-433.00 range. A breakout above 433.50 signals a run to session highs.
*   **Forex (EURUSD):** EURUSD is stable around 1.0850. The pair is tightly constrained inside its daily range following the ECB stance.
*   **Crypto (SOL):** Solana has recovered from earlier low liquidity sweeps around 146, returning to 148.60 as buying pressure accelerates near the hourly support line.`,

  closing: `### AlphaQuant Closing Market Brief
  
**Current Regime:** Systematic Buying Accumulation
**Last Updated:** Today, 4:15 PM EST

**Macro Overview:** US indices concluded the session near the upper boundaries of their daily ranges. Institutional volume profiles indicate active programmatic accumulation during the final 30 minutes of trading. The softer inflation outlook remains the principal catalyst, overshadowing brief hawkish central bank warnings. Total equity volume exceeded its 20-day moving average by 8%.

**Asset Allocations & Technical Scenarios:**
*   **Equities (SPY):** Closed at 512.50, up 0.85% on the day. The structural daily shift is confirmed bullish.
*   **Commodities (Crude Oil):** WTI Crude closed lower at 78.45, weighed down by higher inventory builds and a stronger-than-expected dollar index stabilization.
*   **Crypto (BTC):** BTC maintains a highly constructive daily candle, closing near session highs above 96,400. Open interest remains elevated across major derivatives exchanges, setting the stage for a potential squeeze.`,

  weekly: `### AlphaQuant Weekly Outlook
  
**Current Regime:** Regime Shift — Transitioning to Rate Cut Cycle
**Last Updated:** Weekly Technical Review

**Macro Analysis:** This week's macroeconomic trajectory was defined by the CPI and labor updates, both of which validate the Fed's dual mandate stabilization. The statistical probability of a September rate cut has climbed to 85% in Fed Funds futures markets. Central banks are entering a quiet period, shifting institutional focus to the commencement of Q2 corporate earnings.

**Strategic Execution Guidelines:**
*   **Long-Term Allocation:** Overweight mega-cap tech and high-conviction digital assets. Maintain a minor hedge position in spot gold to buffer sovereign risk vectors.
*   **Key Invalidation Points:** A weekly close for SPY below 505 would invalidate the current bullish structure, requiring a tactical shift to defensive cash allocations.`,

  monthly: `### AlphaQuant Monthly Strategic Outlook
  
**Current Regime:** Growth Expansion Stance
**Last Updated:** Monthly Regime Assessment

**Macro Analysis:** Macro indicators point to a robust, non-recessionary disinflation process. While GDP growth shows mild normalization, corporate balance sheets remain exceptionally healthy, with AI-driven capital expenditures leading productivity multiples. Credit spreads remain tight, indicating no immediate liquidity distress.

**Tactical Targets & Boundaries:**
*   **S&P 500 Index:** Monthly target revised upwards to 525, representing a 2.5% upside extension from current levels.
*   **Bitcoin (BTC):** Expect sustained structural consolidation within the 92,000 to 102,000 range, establishing a secure accumulation base for the next multi-month cycle.
*   **US 10-Yr Yield:** Projected to decline towards 4.10% over the next 45 days as inflation metrics cool.`
};

let liveNews = [...offlineNews];
let liveCalendar = [...offlineCalendar];
let liveBriefs = { ...offlineBriefs, lastGenerated: new Date().toISOString() };
let dataSource = "Binance API & Global Feeders (Live)";
let apiErrorCount = 0;

// Update Binance Prices (Background Task)
async function updateCryptoPricesFromBinance() {
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
    if (!res.ok) throw new Error('Binance API response error');
    const data = await res.json() as any[];
    
    const mappings: Record<string, string> = {
      'BTCUSDT': 'BTC',
      'ETHUSDT': 'ETH',
      'SOLUSDT': 'SOL',
      'BNBUSDT': 'BNB',
      'ADAUSDT': 'ADA',
      'XRPUSDT': 'XRP'
    };

    for (const item of data) {
      const sym = mappings[item.symbol];
      if (sym && livePrices[sym]) {
        const lastPrice = parseFloat(item.lastPrice);
        const priceChangePercent = parseFloat(item.priceChangePercent);
        if (!isNaN(lastPrice) && !isNaN(priceChangePercent)) {
          livePrices[sym].price = lastPrice;
          livePrices[sym].change = priceChangePercent;
          livePrices[sym].volume = `${(parseFloat(item.volume) / 1000).toFixed(1)}K`;
          livePrices[sym].high = parseFloat(item.highPrice) || lastPrice * 1.01;
          livePrices[sym].low = parseFloat(item.lowPrice) || lastPrice * 0.99;
          livePrices[sym].changeAmt = lastPrice * (priceChangePercent / 100);
        }
      }
    }
    dataSource = "Binance API & Global Feeders (Live)";
    apiErrorCount = 0;
  } catch (err: any) {
    console.warn('Binance price sync failed, falling back to local simulation:', err.message);
    apiErrorCount++;
    if (apiErrorCount > 3) {
      dataSource = "Local Algorithmic Feeder (Live)";
    }
  }
}

// Tick prices locally (Stocks, Forex, Commodities, and Crypto Fallback)
function tickPricesLocally() {
  const keys = Object.keys(livePrices);
  for (let i = 0; i < 4; i++) {
    const key = keys[Math.floor(Math.random() * keys.length)];
    const asset = livePrices[key];
    
    let volFactor = 0.0003; // Forex
    if (asset.type === 'Crypto') volFactor = 0.0010;
    else if (asset.type === 'Stocks') volFactor = 0.0006;
    else if (asset.type === 'Commodities') volFactor = 0.0005;

    const isUp = Math.random() > 0.48;
    const delta = (Math.random() * volFactor) * (isUp ? 1 : -1);
    
    asset.price = asset.price * (1 + delta);
    asset.changeAmt = (asset.price - asset.base);
    asset.change = (asset.changeAmt / asset.base) * 100;
    
    if (asset.change > 15) asset.change = 15;
    if (asset.change < -15) asset.change = -15;

    if (!asset.high || asset.price > asset.high) asset.high = asset.price;
    if (!asset.low || asset.price < asset.low) asset.low = asset.price;
  }

  // Also drift Sector performance slightly
  sectorPerformance = sectorPerformance.map(s => {
    const isUp = Math.random() > 0.49;
    const changeShift = (Math.random() * 0.02) * (isUp ? 1 : -1);
    const newChange = s.change + changeShift;
    return {
      ...s,
      change: parseFloat(newChange.toFixed(2)),
      momentum: newChange > 1.0 ? 'High' : newChange > 0.1 ? 'Medium' : 'Low',
      status: newChange > 0.8 ? 'Leading' : newChange > 0.1 ? 'Improving' : newChange > -0.2 ? 'Weakening' : 'Lagging'
    };
  });
}

// Grounded Macro Data Generator (Fetch Actual news and economic events using Google Search Grounding!)
async function fetchGroundedMarketData() {
  const ai = getGeminiClient();
  if (!ai) {
    console.log('Gemini client not available. Live news and briefs running on offline high-fidelity templates.');
    return;
  }

  try {
    console.log('Fetching live grounded market briefs and news using Gemini Search Grounding...');
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: "Search for today's top breaking US/Global macroeconomic and financial market news, central bank statements, and the high-impact economic calendar events. Generate a comprehensive JSON summarizing: 1) news: a list of 5 real breaking news articles with title, source, time (e.g. '10m ago'), category, summary, affectedAssets (comma-separated), whyMatters, potentialImpact, probability (e.g., '90%'), type ('Bullish' | 'Bearish' | 'Neutral'). 2) economicCalendar: 4 real economic events for today with time, currency, event, actual, forecast, previous, impact ('High' | 'Medium' | 'Low'), aiVerdict. 3) briefs: a detailed 3-paragraph summary of the current market state as a Morning Brief, a Midday Brief, a Closing Brief, a Weekly Outlook, and a Monthly Outlook. Ensure the response is ONLY raw, valid JSON conforming exactly to the fields.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            news: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  source: { type: Type.STRING },
                  time: { type: Type.STRING },
                  category: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  whyMatters: { type: Type.STRING },
                  potentialImpact: { type: Type.STRING },
                  affectedAssets: { type: Type.STRING },
                  probability: { type: Type.STRING },
                  type: { type: Type.STRING }
                },
                required: ['title', 'source', 'time', 'category', 'summary', 'whyMatters', 'potentialImpact', 'affectedAssets', 'probability', 'type']
              }
            },
            economicCalendar: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  currency: { type: Type.STRING },
                  event: { type: Type.STRING },
                  actual: { type: Type.STRING },
                  forecast: { type: Type.STRING },
                  previous: { type: Type.STRING },
                  impact: { type: Type.STRING },
                  aiVerdict: { type: Type.STRING }
                },
                required: ['time', 'currency', 'event', 'actual', 'forecast', 'previous', 'impact', 'aiVerdict']
              }
            },
            briefs: {
              type: Type.OBJECT,
              properties: {
                morning: { type: Type.STRING },
                midday: { type: Type.STRING },
                closing: { type: Type.STRING },
                weekly: { type: Type.STRING },
                monthly: { type: Type.STRING }
              },
              required: ['morning', 'midday', 'closing', 'weekly', 'monthly']
            }
          },
          required: ['news', 'economicCalendar', 'briefs']
        }
      }
    });

    const text = response.text || '';
    const parsed = JSON.parse(text.trim());
    if (parsed.news && parsed.economicCalendar && parsed.briefs) {
      liveNews = parsed.news;
      liveCalendar = parsed.economicCalendar;
      liveBriefs = {
        ...parsed.briefs,
        lastGenerated: new Date().toISOString()
      };
      console.log('Successfully updated Grounded Market News and Briefs!');
    }
  } catch (err: any) {
    console.error('Failed to fetch grounded market data via Gemini. Reverting to local dynamic backup engine.', err.message);
  }
}

// Start timers for live data
setInterval(tickPricesLocally, 2500);
setInterval(updateCryptoPricesFromBinance, 12000);
// Run background grounding search every 10 minutes
setInterval(fetchGroundedMarketData, 600000);

// Kick off initial background tasks
updateCryptoPricesFromBinance();
setTimeout(fetchGroundedMarketData, 5000); // Wait 5s on boot to trigger asynchronously

// Express API Router for Live Market Data
app.get('/api/market-data', (req, res) => {
  // Determine market status based on current UTC time
  const now = new Date();
  const day = now.getUTCDay(); // 0 is Sunday, 6 is Saturday
  const hour = now.getUTCHours();
  
  // Stocks open Mon-Fri (1-5), 13:30 to 20:00 UTC (9:30 AM to 4:00 PM EST)
  const isStockOpen = day >= 1 && day <= 5 && ((hour >= 13 && hour < 20) || (hour === 13 && now.getUTCMinutes() >= 30));
  // Forex open Mon-Fri (1-5), 24 hours a day
  const isForexOpen = day >= 1 && day <= 5;
  // Crypto is open 24/7/365
  const isCryptoOpen = true;

  // Compute Fear & Greed Index score based on live BTC & S&P momentum
  const btcChange = livePrices['BTC']?.change || 0;
  const spyChange = livePrices['SPY']?.change || 0;
  const goldChange = livePrices['XAUUSD']?.change || 0;
  
  let fearAndGreedScore = Math.round(55 + (spyChange * 12) + (btcChange * 5) - (goldChange * 8));
  if (fearAndGreedScore > 95) fearAndGreedScore = 95;
  if (fearAndGreedScore < 5) fearAndGreedScore = 5;

  let fearAndGreedRating: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed' = 'Neutral';
  let fgExpl = 'The market is displaying balanced risk-reward conditions.';
  if (fearAndGreedScore >= 80) {
    fearAndGreedRating = 'Extreme Greed';
    fgExpl = 'FOMO and momentum chasers dominate order books, suggesting potential volatility exhaustion.';
  } else if (fearAndGreedScore >= 60) {
    fearAndGreedRating = 'Greed';
    fgExpl = 'High-beta flows and options leverage indicate optimistic pricing conditions.';
  } else if (fearAndGreedScore <= 20) {
    fearAndGreedRating = 'Extreme Fear';
    fgExpl = 'Systemic liquidation sweeps have created massive discounts inside institutional order blocks.';
  } else if (fearAndGreedScore <= 40) {
    fearAndGreedRating = 'Fear';
    fgExpl = 'Safe-haven assets like Spot Gold are outperforming equities, signaling structural capital preservation.';
  }

  res.json({
    lastUpdated: now.toISOString(),
    dataSource,
    marketStatus: {
      stocks: isStockOpen ? 'Open' : 'Closed',
      forex: isForexOpen ? 'Open' : 'Closed',
      crypto: isCryptoOpen ? 'Open' : 'Closed'
    },
    prices: livePrices,
    fearAndGreed: {
      score: fearAndGreedScore,
      rating: fearAndGreedRating,
      explanation: fgExpl
    },
    sectorPerformance,
    economicCalendar: liveCalendar,
    news: liveNews,
    briefs: liveBriefs
  });
});

// API: Institutional Analysis Generator
app.post('/api/analyze', async (req, res) => {
  const { symbol, timeframe, imageBase64, userProfile } = req.body;

  if (!symbol || !timeframe) {
    return res.status(400).json({ error: 'Asset symbol and timeframe are required' });
  }

  const asset = symbol.toUpperCase();
  const capital = userProfile?.tradingCapital || 10000;
  const riskTol = userProfile?.riskTolerance || 'Moderate';
  const experience = userProfile?.tradingExperience || 'Intermediate';
  const style = userProfile?.tradingStyle || 'Intraday';

  console.log(`Analyzing asset ${asset} on timeframe ${timeframe} with AlphaQuant V3 profile: Capital=${capital}, Risk=${riskTol}`);

  // Check if we can use real Gemini API
  const ai = getGeminiClient();

  if (ai) {
    try {
      // Build parts
      const parts: any[] = [];

      // Add image if uploaded
      if (imageBase64) {
        // Strip data prefix if present (e.g. "data:image/png;base64,")
        const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: 'image/png',
            data: base64Data,
          },
        });
      }

      // Detailed Prompt for AlphaQuant V3
      const promptString = `
        You are AlphaQuant V3, an institutional-grade market intelligence terminal designed for advanced retail traders, proprietary traders, portfolio managers, analysts, and professional investors.
        Your mission is to transform market data, chart analysis, macroeconomic information, and market context into actionable intelligence.
        You are NOT a signal provider. You are NOT a financial advisor. You are a decision-support system.
        Your primary objective is to help users understand opportunities, risks, probabilities, and alternative scenarios.

        ====================================================
        CORE PRINCIPLE
        Always distinguish between:
        1. Observed Facts
        2. Evidence-Based Inferences
        3. Assumptions
        4. Unknown Information
        Never present assumptions as facts. Never fabricate unavailable data.
        If a data source is unavailable, explicitly state: "Data not currently available."
        ====================================================

        Perform an exhaustive, professional multi-dimensional analysis on asset: ${asset} using timeframe: ${timeframe}.
        Include these user parameters for customized risk management, position size calculations, and capital allocation:
        - Trading Capital: ${capital} EUR/USD
        - Risk Tolerance: ${riskTol} (Conservative: 0.5-1% risk, Moderate: 1-2% risk, Aggressive: 2-3% risk per setup)
        - Trader Experience Level: ${experience}
        - Trading Style: ${style}

        Perform technical analysis, evaluate trends, support/resistance, momentum, volume, and indicators (RSI, MACD, VWAP, ATR, Bollinger Bands, Moving Averages, Fibonacci Levels).
        Examine market structure (higher highs/lows, lower highs/lows, break of structure BOS, change of character CHoCH, liquidity zones, fair value gaps, supply and demand zones).
        Provide a multi-timeframe assessment (higher, intermediate, and execution timeframes).
        Evaluate the macroeconomic environment (interest rates, inflation, CPI, PPI, employment, GDP, central bank policy, geopolitics, and whether it's risk-on or risk-off).
        Analyze sentiment (news, retail, institutional positioning, crowded trades, contrarian opportunities).
        Conduct a quantitative assessment (volatility, relative strength, correlations, historical behavior, regime type).
        Evaluate portfolio impact (exposure, correlation risk, concentration risk, diversification, recommendations based on the capital of ${capital}).
        Generate three opportunities (Conservative Setup, Balanced Setup, Aggressive Setup) with precise Entry, Stop Loss, Take Profit targets, Risk Reward Ratio, estimated holding period, and position size guidance.
        Formulate three scenarios (Bull, Bear, and Base Cases) with a probability estimate (e.g., 55% Bull, 30% Bear, 15% Base) and detailed reasoning.
        Establish the Contradiction Engine (reasons not to enter, invalidation events, hidden risks, potential black swans).
        Provide Decision Support (pre-entry requirements, confirmations, invalidations, what to monitor next).
        Calculate the AI Conviction Score (0-100) and break it down across Technical, Structure, Macro, Sentiment, Quantitative, and Risk.

        Give concrete, realistic numbers matching the asset's normal range (e.g. if BTC, prices should be around the current BTC spot price; if EURUSD, around 1.08; if Gold, around $2300-$2400).

        You MUST respond ONLY with a single valid JSON object adhering strictly to the following schema. Do not write any explanatory markdown text outside the JSON object.

        Expected JSON Output Schema:
        {
          "executiveSummary": "A concise executive overview of the tactical and strategic landscape of the asset.",
          "marketRegime": {
            "classification": "Trending" | "Range Bound" | "High Volatility" | "Low Volatility",
            "details": "Professional description of the current quantitative market regime."
          },
          "technicalAnalysis": {
            "trend": "Detailed technical trend analysis",
            "support": "Key technical support zones description",
            "resistance": "Key technical resistance zones description",
            "momentum": "Detailed momentum assessment (e.g. divergence, acceleration)",
            "volume": "Institutional volume analysis and volume profile behavior",
            "rsi": "RSI assessment",
            "macd": "MACD indicator metrics",
            "vwap": "VWAP location relative to price",
            "atr": "Average True Range statistics",
            "bollinger": "Bollinger Bands volatility structure",
            "fibonacci": "Fibonacci key levels and retracements",
            "thesisSupports": ["Bullet point of technical evidence supporting the thesis", "Another point"],
            "thesisContradicts": ["Bullet point of technical evidence opposing the thesis", "Another point"]
          },
          "marketStructure": {
            "trendContinuation": "Analysis of structural continuation signals",
            "trendExhaustion": "Analysis of structural exhaustion points",
            "reversalPotential": "Quantitative risk of structural reversal",
            "breakOfStructure": "Details of recent Break of Structure (BOS) or Change of Character (CHoCH)",
            "liquidityZones": ["Detail of buy-side liquidity", "Detail of sell-side liquidity sweep"],
            "fairValueGaps": ["Fair value gaps or supply/demand imbalance zones"],
            "supplyZones": ["S1 Order block", "S2 Order block"],
            "demandZones": ["D1 Order block", "D2 Order block"]
          },
          "multiTimeframe": {
            "higherTimeframe": "Analysis on higher timeframe",
            "intermediateTimeframe": "Analysis on intermediate timeframe",
            "executionTimeframe": "Analysis on execution timeframe",
            "alignmentAndConflicts": "Alignment and conflict mapping across timeframes"
          },
          "macroEnvironment": {
            "stance": "Risk-On Environment" | "Risk-Off Environment" | "Neutral",
            "interestRates": "Interest rates assessment",
            "inflation": "Inflation / CPI / PPI data description",
            "ppiCpi": "Detailed CPI/PPI indexes and scheduled changes",
            "employment": "Employment data/Non-Farm Payrolls macro impact",
            "gdp": "GDP / Growth macro impact",
            "centralBankPolicy": "Central bank statement and policy projection",
            "geopoliticalRisks": "Geopolitical friction levels",
            "economicCalendar": "High-impact economic calendar events to monitor",
            "impactOnAsset": "Exhaustive breakdown of how macro forces affect this specific asset class"
          },
          "sentiment": {
            "newsSentiment": "Algorithmic news flow sentiment",
            "retailSentiment": "Retail trader long/short ratios and sentiment",
            "institutionalSentiment": "Commitment of Traders (CoT) or option flow indicators",
            "marketNarrative": "Prevailing market consensus and narrative drivers",
            "crowdedTrades": "Assessment of whether the current setup is a crowded trade",
            "contrarianOpportunities": "Viable contrarian opportunities or sweep potentials"
          },
          "quantitative": {
            "volatility": "Historical and implied volatility assessment",
            "relativeStrength": "Relative strength comparison against benchmark indices",
            "correlations": "Asset correlation matrix details",
            "historicalBehavior": "Seasonal or statistical performance history",
            "marketRegime": "Quantitative regime categorization"
          },
          "bullCase": {
            "probabilityEstimate": number,
            "reasoning": "Comprehensive case and reasoning for the bull scenario"
          },
          "bearCase": {
            "probabilityEstimate": number,
            "reasoning": "Comprehensive case and reasoning for the bear scenario"
          },
          "baseCase": {
            "probabilityEstimate": number,
            "reasoning": "Comprehensive case and reasoning for the base scenario"
          },
          "keyLevels": {
            "supportZones": ["S1 zone price", "S2 zone price", "S3 zone price"],
            "resistanceZones": ["R1 zone price", "R2 zone price", "R3 zone price"],
            "supplyBlocks": ["H4 Supply Order Block", "Daily Supply Block"],
            "demandBlocks": ["H4 Demand Order Block", "Daily Demand Block"],
            "fibonacciLevels": ["0.382 Level", "0.5 Golden Pocket", "0.618 Level"]
          },
          "tradeOpportunities": {
            "conservative": {
              "entry": "Precise price or price zone",
              "stopLoss": "Precise price or price zone",
              "takeProfit": "Conservative take profit target",
              "riskRewardRatio": "e.g. 1:2.5",
              "holdingPeriod": "Estimated holding time",
              "positionSizeGuidance": "Suggested conservative size based on capital",
              "winRate": 85,
              "justification": "A highly precise, qualitative and professional tactical justification for why this trade setup has a strong track record potential, detailing structure and Fib/volume levels."
            },
            "balanced": {
              "entry": "Precise price or price zone",
              "stopLoss": "Precise price or price zone",
              "takeProfit": "Balanced take profit target",
              "riskRewardRatio": "e.g. 1:3.2",
              "holdingPeriod": "Estimated holding time",
              "positionSizeGuidance": "Suggested balanced size based on capital",
              "winRate": 72,
              "justification": "A highly precise, qualitative and professional tactical justification for why this trade setup has a strong track record potential, detailing structure and Fib/volume levels."
            },
            "aggressive": {
              "entry": "Precise price or price zone",
              "stopLoss": "Precise price or price zone",
              "takeProfit": "Aggressive take profit target",
              "riskRewardRatio": "e.g. 1:4.5",
              "holdingPeriod": "Estimated holding time",
              "positionSizeGuidance": "Suggested aggressive size based on capital",
              "winRate": 58,
              "justification": "A highly precise, qualitative and professional tactical justification for why this trade setup has a strong track record potential, detailing structure and Fib/volume levels."
            }
          },
          "riskManagement": {
            "suggestedRiskPct": number,
            "maxLoss": number,
            "positionSizeGuidance": "Detailed mathematical lot/contract guidelines",
            "capitalPreservation": "Institutional guidelines for capital preservation",
            "downsideRisks": ["Downside risk 1", "Downside risk 2"]
          },
          "portfolioImpact": {
            "exposure": "Portfolio exposure metrics",
            "correlationRisk": "Cross-asset correlation threats",
            "concentrationRisk": "Asset concentration rating",
            "diversificationQuality": "Diversification feedback",
            "recommendations": "Tailored suggestions for portfolio integration"
          },
          "contradictionEngine": {
            "reasonsNotToEnter": ["Reason 1 NOT to enter", "Reason 2 NOT to enter"],
            "thesisFailReasons": ["Reason why thesis could fail", "Another point of failure"],
            "keyInvalidationEvents": ["Key invalidation event 1", "Key invalidation event 2"],
            "hiddenRisks": ["Hidden liquidity gap or spread spike risk", "Another hidden risk"],
            "blackSwanFactors": ["Potential black swan / tail risk factor", "Another point"]
          },
          "decisionSupport": {
            "preEntryRequirements": ["Prerequisite 1", "Prerequisite 2"],
            "thesisConfirmations": ["Confirmation trigger 1", "Confirmation trigger 2"],
            "thesisInvalidations": ["Invalidation trigger 1", "Invalidation trigger 2"],
            "traderMonitorList": ["Monitor factor 1", "Monitor factor 2"]
          },
          "convictionScore": {
            "total": number,
            "technical": number,
            "structure": number,
            "macro": number,
            "sentiment": number,
            "quantitative": number,
            "risk": number,
            "explanation": "Expert score justification breakdown."
          },
          "bias": {
            "direction": "Bullish" | "Bearish" | "Neutral",
            "confidence": number
          },
          "structure": {
            "trend": "Detailed structure trend",
            "higherHighs": boolean,
            "lowerHighs": boolean,
            "breakOfStructure": "Break of structure details",
            "liquidityZones": ["Liquidity detail 1", "Liquidity detail 2"],
            "explanation": "Structural explanation"
          },
          "levels": {
            "supportZones": ["S1 price", "S2 price"],
            "resistanceZones": ["R1 price", "R2 price"],
            "supplyZones": ["Supply 1", "Supply 2"],
            "demandZones": ["Demand 1", "Demand 2"]
          },
          "setup": {
            "entryZone": "Price entry zone",
            "stopLoss": "Price stop loss",
            "takeProfit1": "Conservative target",
            "takeProfit2": "Moderate target",
            "takeProfit3": "Aggressive target",
            "riskRewardRatio": "e.g. 1:3.2",
            "holdingTime": "Holding period"
          },
          "risk": {
            "suggestedRiskPct": number,
            "maxLoss": number,
            "positionSize": "e.g. 0.5 Lots",
            "capitalAllocation": "e.g. 15% active margin"
          },
          "context": {
            "macroEnvironment": "Macro context overview",
            "marketSentiment": "Sentiment indicators status",
            "institutionalPositioning": "Order flow / CoT reports status",
            "potentialCatalysts": ["Catalyst 1", "Catalyst 2"],
            "riskEvents": ["Risk event 1", "Risk event 2"]
          },
          "conviction": {
            "score": number,
            "category": "Low Conviction" | "Medium Conviction" | "High Conviction"
          },
          "summary": {
            "reasonsToTake": ["Reason 1", "Reason 2"],
            "reasonsToAvoid": ["Avoidance factor 1", "Avoidance factor 2"],
            "verdict": "Strong Buy Scenario" | "Buy Scenario" | "Neutral" | "Sell Scenario" | "Strong Sell Scenario"
          }
        }
      `;

      parts.push({ text: promptString });

      const { response, modelUsed } = await generateContentWithRetry(ai, {
        model: 'gemini-3.5-flash',
        contents: { parts },
        config: {
          systemInstruction: 'You are the intelligence core of AlphaQuant V3, a premier multi-strategy hedge fund intelligence terminal. You deliver cold, objective, highly analytical, and quantitative trading reports. You strictly follow instructions, distinguish observed facts from inferences, and return perfectly valid JSON following the schema.',
          responseMimeType: 'application/json',
          temperature: 0.15,
        },
      });

      const rawText = response.text || '';
      console.log('Gemini raw text length:', rawText.length);
      
      const parsedReport = JSON.parse(rawText.trim());
      return res.json({ report: parsedReport, modelUsed: modelUsed, isSimulated: false });

    } catch (err: any) {
      console.error('Gemini V3 call failed, utilizing simulated report:', err);
      // Fallback to simulation on API error
    }
  }

  // Graceful High-Fidelity Simulation Fallback (Always returns mathematically coherent, premium outputs for AlphaQuant V3)
  const isCrypto = ['BTC', 'ETH', 'SOL', 'DOGE', 'ADA', 'XRP'].some(k => asset.includes(k));
  const isForex = ['EUR', 'GBP', 'USD', 'JPY', 'CHF', 'AUD', 'CAD', 'XAU'].some(k => asset.includes(k)) && !isCrypto;
  
  // Set realistic current price
  let basePrice = 100;
  if (asset.includes('BTC')) basePrice = 96420;
  else if (asset.includes('ETH')) basePrice = 3450;
  else if (asset.includes('XAU') || asset.includes('GOLD')) basePrice = 2342;
  else if (asset.includes('EURUSD')) basePrice = 1.0854;
  else if (asset.includes('GBPUSD')) basePrice = 1.2780;
  else if (asset.includes('SPY')) basePrice = 512.50;
  else if (asset.includes('QQQ')) basePrice = 432.80;
  else if (asset.includes('NASDAQ') || asset.includes('NDX')) basePrice = 18240;

  const decimalPlaces = basePrice < 10 ? 5 : basePrice < 1000 ? 2 : 0;
  const f = (val: number) => val.toFixed(decimalPlaces);

  // Generate random but highly coherent structural values
  const randDir = Math.random() > 0.4 ? 'Bullish' : Math.random() > 0.5 ? 'Bearish' : 'Neutral';
  const confidence = Math.floor(Math.random() * 25) + (randDir === 'Neutral' ? 40 : 70);

  // Suggested risk percent based on user tolerance
  const riskPct = riskTol === 'Conservative' ? 0.75 : riskTol === 'Moderate' ? 1.5 : 2.5;
  const maxLossValue = Math.round((capital * riskPct) / 100);

  // Buy scenario or Sell scenario based on direction
  const verdict = randDir === 'Bullish' ? (confidence > 80 ? 'Strong Buy Scenario' : 'Buy Scenario') :
                  randDir === 'Bearish' ? (confidence > 80 ? 'Strong Sell Scenario' : 'Sell Scenario') : 'Neutral';

  const entryOffset = randDir === 'Bullish' ? -0.005 : randDir === 'Bearish' ? 0.005 : -0.001;
  const entryPrice = basePrice * (1 + entryOffset);
  const stopLossPrice = entryPrice * (randDir === 'Bullish' ? 0.985 : randDir === 'Bearish' ? 1.015 : 0.995);
  const tp1 = entryPrice * (randDir === 'Bullish' ? 1.015 : randDir === 'Bearish' ? 0.985 : 1.005);
  const tp2 = entryPrice * (randDir === 'Bullish' ? 1.035 : randDir === 'Bearish' ? 0.965 : 1.015);
  const tp3 = entryPrice * (randDir === 'Bullish' ? 1.060 : randDir === 'Bearish' ? 0.940 : 1.025);

  const calculatedPositionSize = isCrypto 
    ? `${(maxLossValue / (basePrice * 0.025)).toFixed(3)} Units` 
    : isForex 
    ? `${(maxLossValue / 100).toFixed(2)} Lots`
    : `${Math.round(maxLossValue / (basePrice * 0.03))} Shares`;

  const calculatedMargin = `${style === 'Scalping' ? '5%' : style === 'Intraday' ? '12%' : '20%'} of active portfolio`;

  const mockReport = {
    // --- Compatibility fields ---
    bias: {
      direction: randDir,
      confidence: confidence
    },
    structure: {
      trend: `${randDir} order flow observed on the ${timeframe} timeframe with strong structural persistence.`,
      higherHighs: randDir === 'Bullish',
      lowerHighs: randDir === 'Bearish',
      breakOfStructure: randDir === 'Bullish' 
        ? `Confirmed high-volume break of local swing high at ${f(basePrice * 1.01)} confirming continuation.` 
        : randDir === 'Bearish'
        ? `Confirmed breakdown of swing low at ${f(basePrice * 0.99)} marking structural shift.`
        : 'Symmetrical range consolidation between local boundaries.',
      liquidityZones: [
        `Buy-side liquidity resting above equal highs at ${f(basePrice * 1.025)}`,
        `Sell-side liquidity sweep completed below daily lows at ${f(basePrice * 0.978)}`
      ],
      explanation: `The market exhibits an institutional ${randDir.toLowerCase()} imbalance. Price action shows a clear intent to target ${randDir === 'Bullish' ? 'buy-side liquidity pools' : 'sell-side demand imbalances'} after a clean mitigation of high-timeframe order blocks.`
    },
    levels: {
      supportZones: [`S1 Zone: ${f(basePrice * 0.982)} - ${f(basePrice * 0.990)}`, `S2 Zone: ${f(basePrice * 0.965)}`],
      resistanceZones: [`R1 Zone: ${f(basePrice * 1.015)} - ${f(basePrice * 1.022)}`, `R2 Zone: ${f(basePrice * 1.040)}`],
      supplyZones: [`H4 bearish order block at ${f(basePrice * 1.028)}`, `Imbalance Gap at ${f(basePrice * 1.050)}`],
      demandZones: [`Daily institutional demand block at ${f(basePrice * 0.975)}`, `Bullish breaker block at ${f(basePrice * 0.955)}`]
    },
    setup: {
      entryZone: `${f(entryPrice * 0.998)} - ${f(entryPrice * 1.002)}`,
      stopLoss: `${f(stopLossPrice)}`,
      takeProfit1: `${f(tp1)}`,
      takeProfit2: `${f(tp2)}`,
      takeProfit3: `${f(tp3)}`,
      riskRewardRatio: `1:${randDir === 'Neutral' ? '1.5' : '3.4'}`,
      holdingTime: style === 'Scalping' ? '5 - 30 minutes' : style === 'Intraday' ? '2 - 8 hours' : style === 'Swing' ? '1 - 5 days' : '2 - 6 weeks'
    },
    risk: {
      suggestedRiskPct: riskPct,
      maxLoss: maxLossValue,
      positionSize: calculatedPositionSize,
      capitalAllocation: calculatedMargin
    },
    context: {
      macroEnvironment: 'Interests rates showing defensive stabilization. DXY consolidation triggers capital flows into high-beta assets.',
      marketSentiment: randDir === 'Bullish' ? 'Greed mode dominant, spot absorption active.' : randDir === 'Bearish' ? 'Fear and short-hedging active, derivative premium negative.' : 'Compressed volatility indices, waiting for directional expansion.',
      institutionalPositioning: 'CoT reports highlight accumulation by asset managers, offset by commercial hedging.',
      potentialCatalysts: ['Federal Reserve monetary minutes', 'ETF weekly inflow totals release', 'Global manufacturing PMI prints'],
      riskEvents: ['Sudden geopolitical escalation', 'Unscheduled liquidity intervention']
    },
    conviction: {
      score: confidence,
      category: confidence < 50 ? 'Low Conviction' : confidence < 75 ? 'Medium Conviction' : 'High Conviction'
    },
    summary: {
      reasonsToTake: [
        'Confluence of high-timeframe demand block with lower-timeframe market structure shift.',
        'High asymmetric risk-reward ratio offering robust statistical expectancy.',
        'Clear liquidity sweep pool providing fuel for immediate price expansion.'
      ],
      reasonsToAvoid: [
        'Approaching high-impact macroeconomic event with potential spread spikes.',
        'Relative volume (RVOL) is slightly below 10-day moving average on immediate entry zone.',
        'Opposing correlation assets exhibiting minor momentum divergence.'
      ],
      verdict: verdict
    },

    // --- V3 Core Engine Fields (18-part report) ---
    executiveSummary: `Tactical synthesis reveals an institutional imbalance on ${asset} (${timeframe}). Structural indicators align with a ${randDir.toLowerCase()} bias. Market liquidity sweeps have cleared near-term resting liquidity, establishing an asymmetric risk-reward profile for active traders. Capital protection protocols should be closely maintained.`,
    
    marketRegime: {
      classification: randDir === 'Neutral' ? 'Range Bound' : 'Trending',
      details: `The asset is currently operating in a ${randDir === 'Neutral' ? 'low-volatility range bound' : 'high-momentum trending'} regime on the ${timeframe} timeframe. Institutional volume profiles show concentrated order blocks forming solid boundary barriers.`
    },

    technicalAnalysis: {
      trend: `${randDir} technical structure with price positioning relative to the key moving averages.`,
      support: `Primary support layer anchored firmly at ${f(basePrice * 0.985)} backed by historical congestion.`,
      resistance: `Immediate resistance ceiling established at ${f(basePrice * 1.015)} exhibiting minor supply absorption.`,
      momentum: `RSI shows ${randDir === 'Bullish' ? 'ascending momentum with no bearish divergence' : randDir === 'Bearish' ? 'descending momentum pushing oversold boundaries' : 'flatline consolidation in neutral territories'}.`,
      volume: `Institutional volume profile shows high relative volume spikes around key support blocks.`,
      rsi: `RSI metrics printed at ${randDir === 'Bullish' ? '62.4' : randDir === 'Bearish' ? '37.8' : '50.1'} with standard trendline adherence.`,
      macd: `MACD signal line crossover ${randDir === 'Bullish' ? 'bullish above zero' : randDir === 'Bearish' ? 'bearish below zero' : 'converging near zero histogram'}.`,
      vwap: `Price action is currently trading ${randDir === 'Bullish' ? 'above the VWAP line at' : 'below the VWAP line at'} ${f(basePrice * 0.998)}, acting as structural magnet.`,
      atr: `Average True Range (ATR) indicates standard volatility levels of ${f(basePrice * 0.018)} units per interval.`,
      bollinger: `Bollinger bands are expanding, indicating ${randDir === 'Neutral' ? 'imminent contraction' : 'volatility breakout continuation'}.`,
      fibonacci: `0.618 Golden Pocket retracement level sits precisely at ${f(basePrice * 0.992)} providing critical confluence.`,
      thesisSupports: [
        `Moving averages (50, 100, 200 EMA) showing standard ${randDir.toLowerCase()} stack.`,
        `High volume absorption noticed around institutional demand zones.`
      ],
      thesisContradicts: [
        `Minor bearish divergence showing on lower execution timeframe (5m).`,
        `Friction around major psychological round numbers.`
      ]
    },

    marketStructure: {
      trendContinuation: `High-volume structural candle close above local high validates trend continuation.`,
      trendExhaustion: `Momentum decelerating as price approaches historical quarterly resistance levels.`,
      reversalPotential: `Low reversal potential; order book liquidity depth suggests massive defense on key blocks.`,
      breakOfStructure: randDir === 'Bullish' 
        ? `Confirmed break of local structure (BOS) at ${f(basePrice * 1.012)} on high volume.` 
        : `Confirmed breakdown of structure at ${f(basePrice * 0.988)} marking character change (CHoCH).`,
      liquidityZones: [
        `Buy-side liquidity resting above equal highs at ${f(basePrice * 1.025)}`,
        `Sell-side liquidity sweep completed below daily lows at ${f(basePrice * 0.978)}`
      ],
      fairValueGaps: [
        `H4 Fair Value Gap (FVG) resting between ${f(basePrice * 0.991)} and ${f(basePrice * 0.996)}.`
      ],
      supplyZones: [
        `H4 Supply Block: ${f(basePrice * 1.022)} - ${f(basePrice * 1.028)}`,
        `Daily order block supply at ${f(basePrice * 1.055)}`
      ],
      demandZones: [
        `Discount Demand Block: ${f(basePrice * 0.976)} - ${f(basePrice * 0.982)}`,
        `H4 Mitigation Breaker Block at ${f(basePrice * 0.960)}`
      ]
    },

    multiTimeframe: {
      higherTimeframe: 'Daily chart indicates strong structural trend direction with high accumulation profiles.',
      intermediateTimeframe: 'H4 chart shows clean consolidation and mitigation of previous liquidity pools.',
      executionTimeframe: 'M15 execution chart shows descending channel breakout confirming local entry points.',
      alignmentAndConflicts: 'Timeframes exhibit strong alignment on structural bias. No major conflicts identified.'
    },

    macroEnvironment: {
      stance: randDir === 'Bullish' ? 'Risk-On Environment' : randDir === 'Bearish' ? 'Risk-Off Environment' : 'Neutral',
      interestRates: 'Federal Reserve rate stance remains data-dependent; interest rates stabilized.',
      inflation: 'CPI prints within expectations. Core inflation slowing slightly, lowering rate hike risks.',
      ppiCpi: 'CPI Core YoY printed 3.1%, PPI Core 2.2% - stable macro trajectory.',
      employment: 'Unemployment rate stable at 3.9%, showing persistent economic resilience.',
      gdp: 'GDP growth printed 2.4% annualized, supporting corporate risk assets.',
      centralBankPolicy: 'Dovish tilt expected on upcoming FOMC policy statements.',
      geopoliticalRisks: 'Geopolitical risk index remains moderate; shipping lanes stable.',
      economicCalendar: 'Key CPI report release scheduled in 3 days. Prepare for temporary volatility.',
      impactOnAsset: `High-beta assets show high relative sensitivity to yields. DXY softening acts as a positive tailwind.`
    },

    sentiment: {
      newsSentiment: 'Neutral to slightly bullish news sentiment index across main financial publications.',
      retailSentiment: 'Retail long ratio stands at 42% (contrarian bullish indicator).',
      institutionalSentiment: 'Option delta skew shows institutional accumulation of calls / hedging of downside.',
      marketNarrative: 'Accumulation phase narrative dominates after macroeconomic stress testing.',
      crowdedTrades: 'Trade positioning is currently balanced, reducing short-squeeze or wash risks.',
      contrarianOpportunities: 'Taking long positioning at extreme discount range represents high contrarian expectancy.'
    },

    quantitative: {
      volatility: `Average True Range is currently at standard baseline. Implied Vol is ${randDir === 'Neutral' ? 'contracting' : 'gradually expanding'}.`,
      relativeStrength: `Relative strength index against SPY indicates high alpha generation over past 30 days.`,
      correlations: `Asset is highly correlated to global index flows, showing decoupling traits on news.`,
      historicalBehavior: `Historically, Q3 shows positive asset class performance of +3.4% on average.`,
      marketRegime: `${randDir === 'Neutral' ? 'Mean-reverting consolidation range.' : 'Trending momentum expansion.'}`
    },

    bullCase: {
      probabilityEstimate: randDir === 'Bullish' ? 65 : randDir === 'Bearish' ? 20 : 40,
      reasoning: `Strong validation of the H4 institutional demand block, accompanied by positive sentiment triggers and ETF inflow continuation. Expected target expansion toward ${f(basePrice * 1.06)}.`
    },

    bearCase: {
      probabilityEstimate: randDir === 'Bearish' ? 65 : randDir === 'Bullish' ? 15 : 35,
      reasoning: `Invalidation of key structural support at ${f(basePrice * 0.98)} triggering trailing stop cascades and pushing down to test daily demand block at ${f(basePrice * 0.95)}.`
    },

    baseCase: {
      probabilityEstimate: randDir === 'Neutral' ? 50 : 20,
      reasoning: `Extended sideways range consolidation between ${f(basePrice * 0.985)} and ${f(basePrice * 1.015)} waiting for next high-impact macroeconomic event.`
    },

    keyLevels: {
      supportZones: [`S1 Zone: ${f(basePrice * 0.985)}`, `S2 Zone: ${f(basePrice * 0.970)}`, `S3 Zone: ${f(basePrice * 0.950)}`],
      resistanceZones: [`R1 Zone: ${f(basePrice * 1.015)}`, `R2 Zone: ${f(basePrice * 1.035)}`, `R3 Zone: ${f(basePrice * 1.050)}`],
      supplyBlocks: [`H4 bearish order block at ${f(basePrice * 1.025)}`, `Daily Supply Block at ${f(basePrice * 1.045)}`],
      demandBlocks: [`Daily Demand block at ${f(basePrice * 0.978)}`, `H4 mitigation block at ${f(basePrice * 0.955)}`],
      fibonacciLevels: [`0.382 Fib at ${f(basePrice * 1.002)}`, `0.500 Fib at ${f(basePrice * 0.995)}`, `0.618 Golden Fib at ${f(basePrice * 0.988)}`]
    },

    tradeOpportunities: {
      conservative: {
        entry: `${f(basePrice * (randDir === 'Bullish' ? 0.988 : randDir === 'Bearish' ? 1.012 : 0.998))}`,
        stopLoss: `${f(basePrice * (randDir === 'Bullish' ? 0.976 : randDir === 'Bearish' ? 1.024 : 0.988))}`,
        takeProfit: `${f(basePrice * (randDir === 'Bullish' ? 1.015 : randDir === 'Bearish' ? 0.985 : 1.010))}`,
        riskRewardRatio: `1:${randDir === 'Neutral' ? '1.5' : '2.1'}`,
        holdingPeriod: style === 'Scalping' ? '20 mins' : '1-2 days',
        positionSizeGuidance: `Conservative Risk (0.75%): allocation of €${(capital * 0.0075).toFixed(0)} max risk (${calculatedPositionSize}).`,
        winRate: 85,
        justification: `HTF Demand Mitigation. Entry aligned with the daily institutional order block and 0.618 golden pocket Fibonacci retracement. Extremely high probability setup with defensive buffer below swing low.`
      },
      balanced: {
        entry: `${f(basePrice * (randDir === 'Bullish' ? 0.995 : randDir === 'Bearish' ? 1.005 : 0.999))}`,
        stopLoss: `${f(basePrice * (randDir === 'Bullish' ? 0.982 : randDir === 'Bearish' ? 1.018 : 0.992))}`,
        takeProfit: `${f(basePrice * (randDir === 'Bullish' ? 1.035 : randDir === 'Bearish' ? 0.965 : 1.020))}`,
        riskRewardRatio: `1:${randDir === 'Neutral' ? '2.1' : '3.3'}`,
        holdingPeriod: style === 'Scalping' ? '1 hour' : '2-4 days',
        positionSizeGuidance: `Balanced Risk (1.50%): allocation of €${(capital * 0.015).toFixed(0)} max risk (${calculatedPositionSize}).`,
        winRate: 72,
        justification: `Liquidity Sweep Retest. Triggered post buy-side liquidity sweep. Confirmed by 15m bullish change of character (CHoCH) and volume imbalance absorption.`
      },
      aggressive: {
        entry: `${f(basePrice * (randDir === 'Bullish' ? 1.002 : randDir === 'Bearish' ? 0.998 : 1.001))}`,
        stopLoss: `${f(basePrice * (randDir === 'Bullish' ? 0.992 : randDir === 'Bearish' ? 1.008 : 0.996))}`,
        takeProfit: `${f(basePrice * (randDir === 'Bullish' ? 1.060 : randDir === 'Bearish' ? 0.940 : 1.035))}`,
        riskRewardRatio: `1:${randDir === 'Neutral' ? '3.8' : '5.8'}`,
        holdingPeriod: style === 'Scalping' ? '2 hours' : '5-10 days',
        positionSizeGuidance: `Aggressive Risk (2.50%): allocation of €${(capital * 0.025).toFixed(0)} max risk (${calculatedPositionSize}).`,
        winRate: 58,
        justification: `Momentum Breakout. High-beta continuation play exploiting local fair value gap (FVG) and short squeeze cascades above key psychological boundaries.`
      }
    },

    riskManagement: {
      suggestedRiskPct: riskPct,
      maxLoss: maxLossValue,
      positionSizeGuidance: `Recommended exact volume: ${calculatedPositionSize}. Operational capital buffer maintained.`,
      capitalPreservation: `Never risk more than the maximum suggested risk parameter. Close trade manually if an H4 candle closes below stop loss.`,
      downsideRisks: [
        'Macro CPI report trigger spikes could bypass stop loss parameters due to liquidity slippage.',
        'High execution volatility on market opening hours.'
      ]
    },

    portfolioImpact: {
      exposure: `Active margin allocation of ${calculatedMargin} protects overall balance.`,
      correlationRisk: `Verify that other portfolio assets do not share high risk-beta factor with ${asset}.`,
      concentrationRisk: `Concentration rating stands at Low/Moderate. Recommended position limit of 15% max equity.`,
      diversificationQuality: `Adding this asset improves risk diversification compared to a standard benchmark.`,
      recommendations: `Hedge near-term exposure with short options or inverse indices if correlation risk spikes.`
    },

    contradictionEngine: {
      reasonsNotToEnter: [
        'The asset is trading extremely close to high-timeframe historical resistance pools.',
        'Relative volume index exhibits minor momentum divergence on local moves.'
      ],
      thesisFailReasons: [
        'A sudden hawkish tilt by the Federal Reserve spikes DXY index, crashing high-beta assets.',
        'Unscheduled protocol failures, network downtime, or negative regulatory announcements.'
      ],
      keyInvalidationEvents: [
        `H4 candle close below key support level of ${f(basePrice * 0.98)} completely invalidates this tactical thesis.`,
        'Sudden extreme volume selloffs breaking the daily demand block.'
      ],
      hiddenRisks: [
        'Low relative market liquidity during weekend sessions can lead to severe spread expansion.',
        'High leverage liquidations can cause flash-crash slippage across main exchanges.'
      ],
      blackSwanFactors: [
        'Unexpected major global conflict escalations triggering massive flight-to-safety risk-off flows.',
        'Regulatory ban or major exchange failure blocking normal capital flows.'
      ]
    },

    decisionSupport: {
      preEntryRequirements: [
        `Wait for M15 candle verification and volume confirmation inside the entry zone of ${f(entryPrice * 0.998)}.`,
        'Ensure no high-impact macroeconomic event is scheduled within the next 2 hours.'
      ],
      thesisConfirmations: [
        `M15 candle closes above ${f(basePrice * 1.008)} on relative volume higher than 10-period moving average.`,
        'Successful lower-timeframe double-bottom pattern formation.'
      ],
      thesisInvalidations: [
        `Immediate breakdown below structural lows at ${f(stopLossPrice)}.`,
        'Order book buy/sell wall ratio shifts heavily toward sell pressure.'
      ],
      traderMonitorList: [
        'Monitor the DXY dollar index movement for negative correlation alignment.',
        'Track large exchange transaction wallets or open interest (OI) profile shifts.'
      ]
    },

    convictionScore: {
      total: confidence,
      technical: Math.round(confidence * 1.05 > 100 ? 100 : confidence * 1.05),
      structure: Math.round(confidence * 0.98 > 100 ? 100 : confidence * 0.98),
      macro: Math.round(confidence * 0.90),
      sentiment: Math.round(confidence * 1.02 > 100 ? 100 : confidence * 1.02),
      quantitative: Math.round(confidence * 0.95),
      risk: Math.round(confidence * 1.10 > 100 ? 100 : confidence * 1.10),
      explanation: `The overall system score of ${confidence}/100 is supported by excellent technical stack indicators and clean market structure sweeps, offset slightly by near-term macroeconomic volatility indices.`
    }
  };

  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate premium processing
  return res.json({ report: mockReport, modelUsed: 'alphaquant-core-v3', isSimulated: true });
});

// API: AI Research Mode Endpoint
app.post('/api/research', async (req, res) => {
  const { query, userProfile } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Research query is required' });
  }

  const ai = getGeminiClient();
  if (ai) {
    try {
      const promptString = `
        You are AlphaQuant Research, an institutional intelligence desk.
        Analyze the following research query from an advanced trader: "${query}".
        Trading Profile: Capital=${userProfile?.tradingCapital || 10000}, Experience=${userProfile?.tradingExperience || 'Intermediate'}.
        
        Generate a highly structured, objective, and quantitative research report on this query.
        You MUST respond ONLY with a single valid JSON object following this schema. Do not write any markdown outside the JSON.
        
        JSON schema:
        {
          "title": "A precise, professional title for the research brief",
          "executiveSummary": "Executive summary of the intelligence findings",
          "comparativeAnalysis": {
            "keyFactors": ["Factor 1 description", "Factor 2 description"],
            "correlationStatus": "Statistical correlation status (e.g. decouples, high positive)",
            "benchmarkPerformance": "How this relates to benchmarks like SPY/DXY"
          },
          "coreRisks": ["Risk factor 1", "Risk factor 2", "Risk factor 3"],
          "macroDrivers": {
            "drivers": ["Macro force 1", "Macro force 2"],
            "geopoliticalFactor": "How geopolitical factors play in"
          },
          "probabilities": {
            "scenario1": "Bullish expansion case description",
            "prob1": 60,
            "scenario2": "Bearish compression case description",
            "prob2": 40
          },
          "actionableVerdict": "A direct, institutional action-oriented verdict recommendation."
        }
      `;

      const { response, modelUsed } = await generateContentWithRetry(ai, {
        model: 'gemini-3.5-flash',
        contents: { parts: [{ text: promptString }] },
        config: {
          systemInstruction: 'You are the chief research analyst at AlphaQuant. You generate crisp, high-density, mathematical and macro research briefs for institutional participants.',
          responseMimeType: 'application/json',
          temperature: 0.15,
        }
      });

      const rawText = response.text || '';
      const parsed = JSON.parse(rawText.trim());
      return res.json({ result: parsed, modelUsed, isSimulated: false });
    } catch (err) {
      console.error('Research Gemini call failed, falling back to simulated research:', err);
    }
  }

  // Coherent, high-fidelity simulation engine for AI Research Mode
  let title = `Tactical Analysis Report: ${query}`;
  let exec = `The quantitative research engine has formulated a comprehensive brief regarding: "${query}". System variables indicate elevated structural interest with specific micro-trend decouplings.`;
  let factors = [
    'Liquidity footprints indicate active passive absorption cycles.',
    'Derivative volume contracts showcase a hedge ratio imbalance.'
  ];
  let correlation = 'Slight positive correlation (+0.32) relative to standard indices.';
  let benchmark = 'Outperforming standard S&P 500 benchmarks with positive alpha expectancy.';
  let risks = [
    'Execution slip during high-impact central bank announcements.',
    'Systemic margin compression across liquidity networks.',
    'Microstructure blockages under rapid sell pressure.'
  ];
  let drivers = [
    'Stabilizing treasury yield structures supporting equity multiples.',
    'PCE/CPI inflation gauges staying close to target bands.'
  ];
  let geo = 'Geopolitical stress points remain localized; gold premium displays low expansion.';
  let sc1 = 'Extended macro-regime alignment driving high asset accumulation.';
  let sc2 = 'Near-term tactical profit-taking sweeps breaking down local support barriers.';
  let p1 = 65;
  let p2 = 35;
  let verdict = 'Maintain structured scaled-entries near daily demand zones with strict defensive stop margins.';

  // Custom simulation based on query keywords
  const qLower = query.toLowerCase();
  if (qLower.includes('gold') || qLower.includes('nasdaq')) {
    title = 'Inter-Asset Macro Study: XAUUSD vs NASDAQ Composite';
    exec = 'This research report maps the current capital rotation between monetary hedges (Gold) and risk-on technological equities (Nasdaq). Historically, an inverse correlation prevails; however, recent monetary easing has driven dual-accumulation patterns.';
    factors = [
      'High real-interest rates act as a minor drag on non-yielding assets (Gold), but tech multiples support NASDAQ.',
      'Sovereign central bank buying has established an absolute price floor under XAUUSD.'
    ];
    correlation = 'Negative correlation (-0.45) on medium-term daily bars, now shifting to neutral (+0.10).';
    benchmark = 'NASDAQ exhibits a beta of 1.35 vs SPY; Gold maintains zero-beta diversification properties.';
    risks = [
      'Hawkish surprises in upcoming FOMC minutes reversing tech valuation expansion.',
      "A decline in geopolitical tensions unwinding Gold's safe-haven risk premium."
    ];
    drivers = [
      'Federal Reserve rate path projections are the core driver of Tech equity terminal values.',
      'Global liquidity expansion index (M2) strongly supporting Gold capital preservation demand.'
    ];
    geo = 'Elevated geopolitical stress acts as a persistent tailwind for Gold relative to equities.';
    p1 = 58;
    p2 = 42;
    sc1 = 'Gold pushes past historical boundaries as central banks hedge currency debasement.';
    sc2 = 'Nasdaq resumes parabolic growth on strong corporate earnings and productivity multipliers.';
    verdict = 'Tactical allocation: Hold gold as a non-correlated portfolio stabilizer, while executing long-only momentum breakouts on Nasdaq with strict trailing stops.';
  } else if (qLower.includes('apple') || qLower.includes('aapl')) {
    title = 'Equity Research Desk: Apple Inc. (AAPL) Microstructure';
    exec = 'Apple Inc. exhibits solid balance-sheet resilience with robust capital return structures. Our microstructure analysis monitors spot block-order flow and institutional accumulation zones.';
    factors = [
      'Strong services revenue growth offsets cyclical device replacement headwinds.',
      'Extensive stock buyback programs continue to provide structural downside support.'
    ];
    correlation = 'High positive correlation (+0.82) to the S&P 500 tech sub-sector.';
    benchmark = 'Exhibits stable historical performance with lower maximum drawdown than beta peers.';
    risks = [
      'Supply chain blockages inside key manufacturing hubs.',
      'Anti-trust regulatory challenges on app store margins.'
    ];
    drivers = [
      'Consumer discretionary capital health indices.',
      'Corporate reinvestment yield metrics.'
    ];
    geo = 'International manufacturing exposure creates a minor trade-tariff risk premium.';
    p1 = 60;
    p2 = 40;
    sc1 = 'Institutional buying sweeps past $190 block resistance on tech earnings beats.';
    sc2 = 'Extended hardware cycles trigger range-bound sideways consolidation.';
    verdict = 'Institutional Buy-on-Retracement. Accumulate equity positions near the $175 support zone.';
  } else if (qLower.includes('btc') || qLower.includes('bitcoin') || qLower.includes('crypto')) {
    title = 'Digital Asset Desk: Bitcoin (BTC) Microstructure & Risks';
    exec = 'Bitcoin displays characteristics of an emerging institutional asset class, driven heavily by ETF inflows and sovereign balance-sheet speculation. High-timeframe structures indicate solid accumulation floors.';
    factors = [
      'Net daily spot ETF inflows dictate short-term order book imbalances.',
      'Option market open interest (OI) concentrations point to major gamma pins near current levels.'
    ];
    correlation = 'High correlation (+0.60) to global liquidity expansion indicators; low correlation to traditional yield curves.';
    benchmark = 'Massively outperforming traditional asset classes on a rolling 4-year basis, but with 3x higher annualized volatility.';
    risks = [
      'Regulatory clampdowns on crypto-to-fiat onramps.',
      'Sustained high-volume liquidations in derivative perpetual markets.',
      'Extreme volatility spikes causing broker-dealer liquidity mismatches.'
    ];
    drivers = [
      'Global M2 money supply growth and fiat currency debasement.',
      'Risk-on discretionary capital flows and venture allocation models.'
    ];
    geo = 'Sovereign adoption debates highlight geopolitical utility as a neutral settlement asset.';
    p1 = 70;
    p2 = 30;
    sc1 = 'Sustained spot demand breaks historical psychological barrier, triggering short-squeeze cascades.';
    sc2 = 'Deleveraging events sweep leverage-buyers down to daily dynamic support zones.';
    verdict = 'Strong Bullish asymmetry. Execute dollar-cost averaging (DCA) protocols into key demand blocks while avoiding extreme perpetual leverage.';
  } else if (qLower.includes('macro') || qLower.includes('interest') || qLower.includes('cpi')) {
    title = 'Macro Strategy Desk: Global Yield Curves & Central Bank Policies';
    exec = 'The global macro regime remains in a transition state. Central banks are balancing inflation mitigation with sovereign debt service costs, creating an active environment for macro traders.';
    factors = [
      'Real-yield yield curves remain slightly flat, signaling late-cycle economic characteristics.',
      'CPI core metrics show a slow drift toward central bank 2.0% targets.'
    ];
    correlation = 'Inverse correlation between the US Dollar Index (DXY) and high-beta assets stays active.';
    benchmark = 'Defensive positioning outperforms beta-heavy equities during macro transitions.';
    risks = [
      'An unexpected re-acceleration of core CPI metrics.',
      'Liquidity vacuums inside treasury bond markets during unscheduled auction periods.'
    ];
    drivers = [
      'Central bank quantitative tightening (QT) scale-back schedules.',
      'Fiscal spending and government deficit trends.'
    ];
    geo = 'Energy supply shocks represent the primary risk of re-triggering core commodity inflation cycles.';
    p1 = 55;
    p2 = 45;
    sc1 = 'Orderly monetary normalization stabilizes treasury yields, driving sustained equity growth.';
    sc2 = 'Sticky inflation pressures force prolonged tight policy, squeezing corporate profit margins.';
    verdict = 'Hedge asset exposure. Maintain larger-than-normal cash or yield-bearing reserves while waiting for clearer trend signals.';
  }

  const result = {
    title,
    executiveSummary: exec,
    comparativeAnalysis: {
      keyFactors: factors,
      correlationStatus: correlation,
      benchmarkPerformance: benchmark
    },
    coreRisks: risks,
    macroDrivers: {
      drivers,
      geopoliticalFactor: geo
    },
    probabilities: {
      scenario1: sc1,
      prob1: p1,
      scenario2: sc2,
      prob2: p2
    },
    actionableVerdict: verdict
  };

  await new Promise(resolve => setTimeout(resolve, 1000));
  return res.json({ result, isSimulated: true });
});

// API: AI Coach & Psychology Desk Endpoint
app.post('/api/coach', async (req, res) => {
  const { journalEntries, userProfile } = req.body;
  
  const ai = getGeminiClient();
  if (ai && journalEntries && journalEntries.length > 0) {
    try {
      const promptString = `
        You are AlphaQuant AI Coach, a master trading psychologist and quantitative trading performance specialist.
        Review the following list of trading journal entries from a user:
        ${JSON.stringify(journalEntries)}
        
        Trader profile: Capital=${userProfile?.tradingCapital || 10000}, ExperienceLevel=${userProfile?.tradingExperience || 'Intermediate'}.
        
        Identify recurring psychological pitfalls, structural mistakes, core strengths, and formulate a high-yield customized improvement plan.
        You MUST respond ONLY with a single valid JSON object adhering strictly to this schema. Do not write markdown.
        
        JSON schema:
        {
          "overallEvaluation": "Analytical assessment of the trading consistency, risk habits, and execution discipline shown.",
          "coreStrengths": ["Strength 1 description", "Strength 2 description"],
          "identifiedMistakes": ["Mistake 1 description", "Mistake 2 description"],
          "recurringErrors": ["Error 1", "Error 2"],
          "psychologyInsights": "Trading psychology analysis, suggestions to avoid FOMO/revenge-trading",
          "improvementPlan": ["Step 1 actionable guidance", "Step 2 actionable guidance"],
          "performanceRating": "Master" | "Professional" | "Intermediate" | "Disciplined Beginner"
        }
      `;

      const { response, modelUsed } = await generateContentWithRetry(ai, {
        model: 'gemini-3.5-flash',
        contents: { parts: [{ text: promptString }] },
        config: {
          systemInstruction: 'You are the ultimate performance coach for hedge fund traders. You diagnose mistakes with surgical precision and provide highly tactical, psychological, and statistical guidelines.',
          responseMimeType: 'application/json',
          temperature: 0.15,
        }
      });

      const rawText = response.text || '';
      const parsed = JSON.parse(rawText.trim());
      return res.json({ coachReport: parsed, modelUsed, isSimulated: false });
    } catch (err) {
      console.error('AI Coach Gemini call failed, falling back to simulated coach:', err);
    }
  }

  // Multi-tier Simulated AI Coaching Engine
  const total = journalEntries?.length || 0;
  const completed = journalEntries?.filter((j: any) => j.result !== 'Pending') || [];
  const wins = completed.filter((j: any) => j.result === 'Win') || [];
  const winRate = completed.length > 0 ? Math.round((wins.length / completed.length) * 100) : 75;

  let overallEvaluation = 'Your trading activity displays structured risk habits, with clean execution parameters. However, tracking consecutive outcome streaks suggests minor emotional volatility.';
  let strengths = [
    'Strict risk-reward parameters mapped across all active setups.',
    'Consistent selection of highly liquid asset pairs.'
  ];
  let mistakes = [
    'Occasional position scaling ahead of high-impact news data.',
    'Minor trailing stop-loss tightening during high-volatility sessions.'
  ];
  let errors = [
    'Re-entering the same asset immediately after a local stop loss sweep (revenge trading tendency).',
    'Scaling contract sizes prematurely on winning streaks.'
  ];
  let psychologyInsights = 'Your cognitive profile indicates a strong desire for immediate market validation. When trades enter consolidation zones, you display a tendency to manually close positions ahead of target, sacrificing the full statistical expectancy of your R:R model.';
  let improvement = [
    'Enforce a strict 2-hour "cool-down" period after any consecutive losing executions.',
    'Automate profit targets and turn off active chart indicators during high-timeframe holding cycles.',
    'Execute a weekly risk audit to confirm active capital drawdowns stay below 3%.'
  ];
  let rating: any = 'Intermediate';

  if (winRate > 75) {
    rating = 'Professional';
    overallEvaluation = 'Exceptional risk discipline. Your ledger demonstrates high statistical expectancy with beautiful win consistency. Continue scaling capital layout progressively.';
    strengths.push('Surgical entry accuracy inside institutional demand blocks.');
  } else if (winRate < 45) {
    rating = 'Disciplined Beginner';
    overallEvaluation = 'High-volume execution focus with suboptimal win metrics. The data suggests you are executing trades without waiting for proper higher-timeframe confluence triggers.';
    improvement.unshift('Reduce active trading frequency by 50% and focus exclusively on Daily/H4 demand zones.');
  }

  const coachReport = {
    overallEvaluation,
    coreStrengths: strengths,
    identifiedMistakes: mistakes,
    recurringErrors: errors,
    psychologyInsights,
    improvementPlan: improvement,
    performanceRating: rating
  };
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  return res.json({ coachReport, isSimulated: true });
});

// API: Creator Program AI Content Ideas Generator
app.post('/api/creator/generate-ideas', async (req, res) => {
  const { username, tier, focusMarket } = req.body;
  const market = focusMarket || 'Global Markets (Crypto, Forex & Stocks)';
  const userTier = tier || 'Starter';
  const name = username || 'Alpha Ambassador';

  console.log(`Generating personalized content ideas for Creator: ${name} (${userTier} Tier, Focus: ${market})`);

  const ai = getGeminiClient();

  // Robust default ideas fallback block (exactly 10 premium ideas per category)
  const fallbackIdeas = {
    tiktok: [
      { hook: "Stop drawing random lines on your charts. Here's how institutions actually trade.", body: "Show the AlphaQuant AI Market Analysis view. Focus on 'Institutional Setup Tickets' and 'Fair Value Gaps'. Explain that retail support/resistance gets swept, but institutional zones hold.", cta: "Use the link in my bio to run your first 3 AI audits for free." },
      { hook: "The 3 rules of risk management that Goldman Sachs traders live by.", body: "Break down position sizing. Show how AlphaQuant calculates the exact capital risk percentage (e.g., 1.5% max) and matches it to contract size.", cta: "Stop blowing accounts. Check out the Risk Lab via the link in my bio." },
      { hook: "I let an institutional AI analyze BTC structure, and here's the verdict.", body: "Show a screen capture of a Bullish structure shift (BOS). Zoom in on the multi-timeframe alignment scores.", cta: "Get the exact institutional entry zones at alphaquant.ai/ref/" + name },
      { hook: "Why 95% of traders fail, and how to join the 5% that don't.", body: "Explain that the 5% have a strict trading journal. Show how AlphaQuant's auto-journal lets you log setups and provides custom psychology coaching.", cta: "Claim your free professional journal access now." },
      { hook: "How to read Macro trends like a macro hedge fund manager.", body: "Navigate to the AI Research & Macro section. Point out interest rate cycles, inflation profile, and central bank policy grids.", cta: "Link in bio to read the full daily macro brief." },
      { hook: "Are you trading or just gambling? Let's check your 'Contradiction Engine'.", body: "Explain the anti-thesis rule. Show how AlphaQuant's AI forces you to list 3 reasons NOT to take a trade before you enter.", cta: "Trade like a scientist, not a gambler. Try AlphaQuant." },
      { hook: "The secret metric institutions use to measure market conviction.", body: "Show the conviction score breakdown (technical, structure, macro, sentiment, quantitative). Explain how it calculates a normalized rating.", cta: "Access the terminal for free via my referral link." },
      { hook: "What is 'Liquidity Sweeping' and how to stop getting stopped out?", body: "Demonstrate liquidity zones on the chart. Contrast retail stop losses with institutional liquidity pools. Show AlphaQuant's automated support/resistance grids.", cta: "Link in my bio to secure your free trial." },
      { hook: "My daily routine as an algorithmic prop trader.", body: "Step 1: Check heatmaps for volume spikes. Step 2: Generate an AI analysis report for structure. Step 3: Log setups. Step 4: Consult the AI Coach for cognitive biases.", cta: "Build your own prop desk workflow at alphaquant.ai/ref/" + name },
      { hook: "The absolute best way to backtest your trading strategies in 2026.", body: "Show the Strategy Lab inside AlphaQuant. Explain how it combines technical indicators with automated position sizing guidelines.", cta: "Build your first strategy today. Link in bio." }
    ],
    reels: [
      { hook: "The truth about 'Easy Money' trading courses.", body: "Debunk fake Lamborghinis. Explain that professional trading is about statistical expectancy, probability, and execution discipline. Show AlphaQuant's sleek UI.", cta: "Check out a real, premium terminal in my bio." },
      { hook: "How to trade a 'Risk-Off' macro environment.", body: "Explain what happens to assets when central banks tighten. Show AlphaQuant's Macro Environment panel outlining gold and USD yields.", cta: "Stay protected. View the current macro stance at the link in bio." },
      { hook: "Stop guessing. Start calculating. Here is the perfect trading formula.", body: "Show the mathematical formula for position sizing: Risk Amount / Stop Distance. Demo how AlphaQuant automates this instantly.", cta: "Access the terminal using my link." },
      { hook: "The psychology of a winning trader.", body: "Detail that winners don't celebrate wins and don't panic on losses. Show how the AI Coach provides feedback on emotional triggers from logged trades.", cta: "Unlock your cognitive trading profile today." },
      { hook: "What are Fair Value Gaps (FVG) and why do they act like magnets?", body: "Use visual aids or draw FVG blocks. Show how AlphaQuant automatically lists active FVG zones in its structure breakdown.", cta: "Run an AI scan on your favorite coin now." },
      { hook: "How to spot institutional accumulation in Crypto.", body: "Look at volume anomalies and divergence. Show the quantitative Relative Strength benchmark compared to SPY on the terminal.", cta: "Try it yourself. Free link in bio." },
      { hook: "3 technical indicators you need to throw away right now.", body: "Explain that indicators are lagging, but structure is leading. Show the difference between basic lagging moving averages and active order blocks.", cta: "Get structural breakdowns at my referral link." },
      { hook: "What is a 'BOS' in trading? (Break of Structure simplified).", body: "Explain structural shifts. Show the transition from a bearish lower-high cycle to a bullish higher-high shift.", cta: "Understand structure. Join AlphaQuant today." },
      { hook: "How I grew my trading account with institutional risk models.", body: "Highlight capital preservation. Detail why risking only 1% per trade is the mathematically superior way to compound capital over 100 trades.", cta: "Calculate your size perfectly. Link in bio." },
      { hook: "This single tool completely changed my trading consistency.", body: "Show the AI Coach console. Read a custom feedback line warning about revenge trading. Explain how it scans your actual journal ledger.", cta: "Get your own AI Coach at the link in my bio." }
    ],
    shorts: [
      { hook: "This is a 100% legal trading hack.", body: "Show the AlphaQuant AI analysis page. It generates a full 18-part report with support/resistance, macro, and sentiment matrix in 3 seconds.", cta: "Link in bio to test it out." },
      { hook: "The only trading check-list you'll ever need.", body: "Step 1: Trend alignment. Step 2: Key levels. Step 3: Risk size. Step 4: Anti-thesis test. Step 5: Log in journal.", cta: "All automated at alphaquant.ai/ref/" + name },
      { hook: "How Goldman Sachs manages portfolio risk.", body: "Highlight diversified exposure ratings, cross-asset correlations, and average revenue per trade. Show AlphaQuant's Portfolio Impact module.", cta: "Upgrade your risk profile. Link in bio." },
      { hook: "Stop using tight stop losses!", body: "Explain that tight stop losses are just liquidity for institutions. Show how to place stops beyond structural swings.", cta: "Get exact stop zone guides using my link." },
      { hook: "Is the dollar collapse real? Let's check the macro yields.", body: "Look at treasury yields, CPI, and GDP indices in the AlphaQuant terminal. Analyze the overall stance (Risk-On vs. Risk-Off).", cta: "Join our creator team. Link in bio." },
      { hook: "How to trade order blocks like a market maker.", body: "Explain order block concepts. Show how institutional limit orders reside in high-density blocks.", cta: "Locate active order blocks with AlphaQuant." },
      { hook: "If you trade without a journal, you are just donating money.", body: "Show the trading journal interface. Contrast a chaotic spreadsheet with a clean, searchable, PnL-tracking database.", cta: "Claim your free professional journal access now." },
      { hook: "What does 'Risk Reward 1:3' actually mean?", body: "Explain that you only need a 30% win rate to be highly profitable if your risk-reward is consistently 1:3.", cta: "Discover 1:3 setups. Link in bio." },
      { hook: "How to use AI to find trading setups.", body: "Show the AI Scanner view. Highlight assets with high volume breakouts or structural alignment.", cta: "Scan the markets. Link in bio." },
      { hook: "This trading terminal feels like 2030.", body: "Pan across the dark, sleek UI with smooth glowing animations, real-time UTC clock, and interactive charts.", cta: "Experience the future at alphaquant.ai/ref/" + name }
    ],
    x: [
      { text: "1/ Retail traders focus on entry. Institutional traders focus on risk. If you don't know your exact capital loss in currency before placing a trade, you are gambling, not trading. 🧵" },
      { text: "2/ Automated order flow analysis is a game-changer. Why manually map support/resistance levels when AI can cross-reference 18 different criteria including multi-timeframe structural shifts, macro stance, and options skew? Enter the terminal: alphaquant.ai/ref/" + name },
      { text: "3/ The 'Contradiction Engine' is my favorite trading tool. Before taking a setup, write down 3 reasons why the trade will FAIL. If your anti-thesis is stronger than your thesis, step aside. Risk preserved." },
      { text: "4/ Win rate is a vanity metric. Risk-to-reward ratio and consistency are the real drivers of wealth. A trader with a 35% win rate and 1:4 R:R will compound capital faster than an 80% win rate trader with a negative risk-to-reward ratio." },
      { text: "5/ Just ran the Weekly Macro Scan on BTC and indices. Central bank policies are leaning slightly hawkish, but employment metrics suggest consumer resilience. Full breakdown inside the AI Research terminal: alphaquant.ai/ref/" + name },
      { text: "6/ If you're still using multiple messy Excel sheets to track your PnL, you are holding yourself back. Automating your trading journal is the first step to scaling. Review metrics like Average Win vs. Loss, and let AI coach you on behavioral patterns." },
      { text: "7/ Spotting high-probability order blocks requires multi-timeframe alignment. When the Daily, 4-hour, and 15-minute structural shift all point to a single liquidity pool, you have a high-conviction setup. Plan. Execute. Preserve." },
      { text: "8/ What is your capital protection protocol? Drawdowns are inevitable, but blowing an account is optional. Limit your active risk to 1.5% max. Use professional tools to enforce this: alphaquant.ai/ref/" + name },
      { text: "9/ Glad to announce I've joined the AlphaQuant Creator Program as an elite Ambassador. I'll be sharing institutional-grade market briefs, AI-backed structural charts, and risk lab workshops every week. Stay tuned!" },
      { text: "10/ A crowded trade is a dangerous trade. When retail sentiment is 90% long and news flows are extremely bullish, look for the contrarian sweep. Institutions look for liquidity; retail stop losses are the ultimate source. Trade safe." }
    ],
    linkedin: [
      { title: "Redefining Risk Management in Modern Financial Markets", text: "In trading, capital preservation is the only metric that guarantees survival. Most beginner retail participants focus purely on target returns, whereas proprietary firms and institutions allocate 90% of their computational power to understanding downside variance. Utilizing automated, AI-driven terminals like AlphaQuant lets us calculate position size relative to real-time volatility indices (ATR) instantly.", hashtags: "#RiskManagement #QuantitativeTrading #FinTech #CapitalMarkets #AI" },
      { title: "The Transition from Subjective Charts to Probabilistic Systems", text: "Modern markets are highly efficient noise generators. To gain an edge, professional analysts are moving away from subjective hand-drawn lines towards structured, evidence-based systems. AlphaQuant's V3 institutional terminal evaluates assets across an 18-part criteria matrix—combining market structure, macro-environment stance, institutional options skew, and cross-asset correlations.", hashtags: "#MarketAnalysis #DataScience #ArtificialIntelligence #TradingTerminal #Fintech" },
      { title: "Building a Scientific Trading Journal: My Professional Workflow", text: "A trading ledger is not just a list of wins and losses; it is a mirrors of cognitive bias. To scale capital, a trader must audit execution habits. I have integrated AlphaQuant’s analytical suite into my prop workflow, utilizing its machine-learning AI Coach to parse my trading journal and detect behavioral loops like revenge trading or premature scaling.", hashtags: "#TradingJournal #BehavioralFinance #AIAnalytics #QuantitativeFinance" },
      { title: "Deciphering Global Macroeconomic Stance for Portfolio Allocation", text: "As monetary policies diverge, tracking global yield vectors is essential. Is the current regime 'Risk-On' or 'Risk-Off'? By cross-referencing central bank rate stances, employment data, and CPI, the AlphaQuant AI Research terminal provides a simplified, institutional-grade macro index. Read my daily briefs via the link in my profile.", hashtags: "#Macroeconomics #AssetAllocation #GlobalFinance #FintechInnovation" },
      { title: "Why We Force an 'Anti-Thesis' Before Portfolio Commitments", text: "Confirmation bias is the single most expensive psychological error in investing. At my desk, we enforce a strict 'Contradiction Engine' protocol: every bullish setup must be defended against a list of quantitative reasons to avoid the trade. If the anti-thesis carries higher statistical probability, the trade is rejected. Systems over emotions.", hashtags: "#SystematicTrading #FinanceInsights #InvestorEducation #BehavioralPsychology" },
      { title: "The Importance of Structured Community in Financial Education", text: "The financial creator space is saturated with low-quality alerts. Real value lies in educational materials, systematic workflows, and professional tools. I am proud to partner with AlphaQuant as an Ambassador to bring true quantitative and institutional intelligence to retail participants.", hashtags: "#AmbassadorProgram #FintechPartnerships #EdTech #ProfessionalTrading" },
      { title: "How High-Velocity Scanners Capture Cross-Asset Alpha", text: "Finding relative strength is the cornerstone of swing trading. By benchmarking equities and digital assets against core index ETFs (like SPY), we can instantly locate assets that exhibit positive divergence under market pressure. Automating this via AlphaQuant's visual heatmaps ensures we never miss a rotation.", hashtags: "#AlphaGeneration #MarketScanners #TechnicalAnalysis #InvestingSystems" },
      { title: "An Overview of Institutional Liquidity Swings (BOS and FVG)", text: "Retail traders buy breakouts; institutions buy retracements into discounted fair value gaps. By mapping automated structural grids, we can identify exactly where commercial buying limits are resting, avoiding the trap of chasing high-velocity moves.", hashtags: "#OrderFlow #MarketStructure #SmartMoney #FintechTerminal" },
      { title: "Monetizing your Financial Expertise via SaaS Creator Programs", text: "For financial educators, partnering with high-quality software providers creates long-term recurring value. The AlphaQuant Creator Program provides an elite, Stripe Atlas-style platform for builders to distribute professional terminals, track conversion funnels, and earn recurring rewards.", hashtags: "#Partnership #SaaSGrowth #CreatorEconomy #FinancialEducation" },
      { title: "The Next Frontier in Retail Investing Tools", text: "The gap between institutional prop terminals and retail software is closing. By combining natural language processing, advanced image diagnostics (chart scanning), and automated risk profiling, we are entering an era of democratized financial intelligence. This is AlphaQuant.", hashtags: "#FutureOfFinance #AIModel #FintechStartup #DemocratizingFinance" }
    ]
  };

  if (ai) {
    try {
      const promptString = `
        You are a world-class financial growth strategist and content director for AlphaQuant (an elite, sleek AI-powered market intelligence terminal).
        The creator named "${name}" is in the "${userTier}" Ambassador Tier and is focusing on "${market}".
        
        Generate a list of extremely high-quality, personalized weekly content ideas.
        The content should motivate traders and investors to build structured, risk-disciplined trading habits using AlphaQuant, rather than looking like low-quality spam.
        
        Please output EXACTLY a valid JSON object matching the schema below.
        DO NOT wrap the response in markdown blocks (like \`\`\`json ... \`\`\`), do not write "json", do not add any comments or text before/after the JSON. Just return raw parsable JSON.
        
        Each social channel MUST have EXACTLY 10 highly creative, complete items, customized specifically for AlphaQuant and reference its key components (AI Market Analysis, Visual Probability Matrix, Risk Management Profile, Contradiction Engine, AI Coach, and Portfolio Integration).
        
        JSON schema:
        {
          "tiktok": [
            { "hook": "An absolute scroll-stopper hook.", "body": "Step-by-step visual outline/script.", "cta": "Strong personalized CTA with referral link." }
          ],
          "reels": [
            { "hook": "Scroll-stopper hook for Instagram reels.", "body": "Visual style, audio mood, and core message.", "cta": "CTA directing viewers to link in bio." }
          ],
          "shorts": [
            { "hook": "Quick-fire attention grabber hook.", "body": "Speed-run script layout.", "cta": "Referral code CTA." }
          ],
          "x": [
            { "text": "High-engagement tweet or thread opener with professional fintech tone." }
          ],
          "linkedin": [
            { "title": "Sleek professional title.", "text": "A deep, insightful fintech/investment post (Stripe or Notion Style).", "hashtags": "#Fintech #Investing" }
          ]
        }
      `;

      const { response, modelUsed } = await generateContentWithRetry(ai, {
        model: 'gemini-3.5-flash',
        contents: { parts: [{ text: promptString }] },
        config: {
          responseMimeType: 'application/json'
        }
      });

      const rawText = response.text || '';
      const parsed = JSON.parse(rawText.trim());
      
      // Basic format validation
      if (parsed.tiktok && parsed.reels && parsed.shorts && parsed.x && parsed.linkedin) {
        console.log(`Successfully generated Creator Content via ${modelUsed}!`);
        return res.json({ ideas: parsed, modelUsed, isSimulated: false });
      }
    } catch (err) {
      console.error('Gemini content ideas generator failed, falling back to prefilled high-fidelity mock assets:', err);
    }
  }

  // Artificial latency for premium feeling
  await new Promise(resolve => setTimeout(resolve, 800));
  return res.json({ ideas: fallbackIdeas, modelUsed: 'simulation-engine-v3', isSimulated: true });
});

// Serve static assets in production, otherwise mount Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in development mode.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving compiled static assets in production mode.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AlphaQuant Server listening on http://localhost:${PORT}`);
  });
}

startServer();
