export interface UserProfile {
  id: string;
  email: string;
  tradingExperience: 'Beginner' | 'Intermediate' | 'Advanced' | '';
  markets: string[]; // ['Crypto', 'Forex', 'Stocks', 'Indices']
  tradingStyle: 'Scalping' | 'Intraday' | 'Swing' | 'Position Trading' | '';
  tradingCapital: number;
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive' | '';
  isOnboarded: boolean;
  isBetaTester: boolean;
  isAdmin: boolean;
  createdAt: string;
}

export interface SavedAnalysis {
  id: string;
  userId: string;
  symbol: string;
  timeframe: string;
  timestamp: string;
  screenshotUrl?: string;
  report: AnalysisReport;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  asset: string;
  direction: 'Long' | 'Short';
  result: 'Win' | 'Loss' | 'Pending';
  pnl: number;
  notes: string;
  riskReward: number;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  symbol: string;
  market: 'Crypto' | 'Forex' | 'Stocks';
  price: number;
  change: number;
  addedAt: string;
}

export interface FeedbackMessage {
  id: string;
  userId: string;
  userEmail: string;
  message: string;
  category: 'Bug' | 'Feature' | 'Idea' | 'General';
  timestamp: string;
}

export interface TradeOpportunity {
  entry: string;
  stopLoss: string;
  takeProfit: string;
  riskRewardRatio: string;
  holdingPeriod: string;
  positionSizeGuidance: string;
  winRate?: number;
  justification?: string;
}

// 18 Sections Analysis Report (V3 Framework)
export interface AnalysisReport {
  // --- Old Fields (Kept for Full Backward Compatibility) ---
  bias: {
    direction: 'Bullish' | 'Bearish' | 'Neutral';
    confidence: number; // 0-100
  };
  structure: {
    trend: string;
    higherHighs: boolean;
    lowerHighs: boolean;
    breakOfStructure: string;
    liquidityZones: string[];
    explanation: string;
  };
  levels: {
    supportZones: string[];
    resistanceZones: string[];
    supplyZones: string[];
    demandZones: string[];
  };
  setup: {
    entryZone: string;
    stopLoss: string;
    takeProfit1: string;
    takeProfit2: string;
    takeProfit3: string;
    riskRewardRatio: string;
    holdingTime: string;
  };
  risk: {
    suggestedRiskPct: number; // e.g. 1.5%
    maxLoss: number; // calculated in capital currency
    positionSize: string; // recommended volume / shares
    capitalAllocation: string; // portion of overall capital
  };
  context: {
    macroEnvironment: string;
    marketSentiment: string;
    institutionalPositioning: string;
    potentialCatalysts: string[];
    riskEvents: string[];
  };
  conviction: {
    score: number; // 0-100
    category: 'Low Conviction' | 'Medium Conviction' | 'High Conviction';
  };
  summary: {
    reasonsToTake: string[];
    reasonsToAvoid: string[];
    verdict: 'Strong Buy Scenario' | 'Buy Scenario' | 'Neutral' | 'Sell Scenario' | 'Strong Sell Scenario';
  };

  // --- V3 Professional Sections (18-part Institutional Framework) ---
  // 1. Executive Summary
  executiveSummary: string;

  // 2. Market Regime
  marketRegime: {
    classification: 'Trending' | 'Range Bound' | 'High Volatility' | 'Low Volatility';
    details: string;
  };

  // 3. Technical Analysis
  technicalAnalysis: {
    trend: string;
    support: string;
    resistance: string;
    momentum: string;
    volume: string;
    rsi: string;
    macd: string;
    vwap: string;
    atr: string;
    bollinger: string;
    fibonacci: string;
    thesisSupports: string[];
    thesisContradicts: string[];
  };

  // 4. Market Structure
  marketStructure: {
    trendContinuation: string;
    trendExhaustion: string;
    reversalPotential: string;
    breakOfStructure: string;
    liquidityZones: string[];
    fairValueGaps: string[];
    supplyZones: string[];
    demandZones: string[];
  };

  // 5. Multi-Timeframe Assessment
  multiTimeframe: {
    higherTimeframe: string;
    intermediateTimeframe: string;
    executionTimeframe: string;
    alignmentAndConflicts: string;
  };

  // 6. Macro Environment
  macroEnvironment: {
    stance: 'Risk-On Environment' | 'Risk-Off Environment' | 'Neutral';
    interestRates: string;
    inflation: string;
    ppiCpi: string;
    employment: string;
    gdp: string;
    centralBankPolicy: string;
    geopoliticalRisks: string;
    economicCalendar: string;
    impactOnAsset: string;
  };

  // 7. Sentiment Analysis
  sentiment: {
    newsSentiment: string;
    retailSentiment: string;
    institutionalSentiment: string;
    marketNarrative: string;
    crowdedTrades: string;
    contrarianOpportunities: string;
  };

  // 8. Quantitative Assessment
  quantitative: {
    volatility: string;
    relativeStrength: string;
    correlations: string;
    historicalBehavior: string;
    marketRegime: string;
  };

  // 9. Bull Case
  bullCase: {
    probabilityEstimate: number; // e.g. 60
    reasoning: string;
  };

  // 10. Bear Case
  bearCase: {
    probabilityEstimate: number; // e.g. 30
    reasoning: string;
  };

  // 11. Base Case
  baseCase: {
    probabilityEstimate: number; // e.g. 10
    reasoning: string;
  };

  // 12. Key Levels
  keyLevels: {
    supportZones: string[];
    resistanceZones: string[];
    supplyBlocks: string[];
    demandBlocks: string[];
    fibonacciLevels: string[];
  };

  // 13. Trade Opportunities
  tradeOpportunities: {
    conservative: TradeOpportunity;
    balanced: TradeOpportunity;
    aggressive: TradeOpportunity;
  };

  // 14. Risk Management
  riskManagement: {
    suggestedRiskPct: number;
    maxLoss: number;
    positionSizeGuidance: string;
    capitalPreservation: string;
    downsideRisks: string[];
  };

  // 15. Portfolio Impact
  portfolioImpact: {
    exposure: string;
    correlationRisk: string;
    concentrationRisk: string;
    diversificationQuality: string;
    recommendations: string;
  };

  // 16. Contradiction Engine
  contradictionEngine: {
    reasonsNotToEnter: string[];
    thesisFailReasons: string[];
    keyInvalidationEvents: string[];
    hiddenRisks: string[];
    blackSwanFactors: string[];
  };

  // 17. Decision Support
  decisionSupport: {
    preEntryRequirements: string[];
    thesisConfirmations: string[];
    thesisInvalidations: string[];
    traderMonitorList: string[];
  };

  // 18. Final Conviction Score
  convictionScore: {
    total: number; // 0-100
    technical: number; // 0-100
    structure: number; // 0-100
    macro: number; // 0-100
    sentiment: number; // 0-100
    quantitative: number; // 0-100
    risk: number; // 0-100
    explanation: string;
  };
}
