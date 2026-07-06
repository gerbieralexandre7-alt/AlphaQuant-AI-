import { UserProfile, SavedAnalysis, JournalEntry, WatchlistItem, FeedbackMessage } from '../types';

// Let's create an elegant, fully localized Supabase client simulator that runs completely client-side in localStorage.
// This allows zero-setup, flawless user accounts, custom trading profiles, persistence of multiple analyses, journal inputs, and watchlist items.

const USERS_KEY = 'alphaquant_users';
const CURRENT_USER_KEY = 'alphaquant_current_user';
const ANALYSES_KEY = 'alphaquant_analyses';
const JOURNAL_KEY = 'alphaquant_journal';
const WATCHLIST_KEY = 'alphaquant_watchlist';
const FEEDBACK_KEY = 'alphaquant_feedback';

// Initialize mock data if empty
const initMockData = () => {
  // Mock users
  if (!localStorage.getItem(USERS_KEY)) {
    const defaultUsers: UserProfile[] = [
      {
        id: 'user_admin_001',
        email: 'admin@alphaquant.ia',
        tradingExperience: 'Advanced',
        markets: ['Crypto', 'Stocks'],
        tradingStyle: 'Swing',
        tradingCapital: 250000,
        riskTolerance: 'Moderate',
        isOnboarded: true,
        isBetaTester: true,
        isAdmin: true,
        createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'user_beta_002',
        email: 'beta.trader@goldman.com',
        tradingExperience: 'Advanced',
        markets: ['Forex', 'Indices', 'Stocks'],
        tradingStyle: 'Intraday',
        tradingCapital: 500000,
        riskTolerance: 'Aggressive',
        isOnboarded: true,
        isBetaTester: true,
        isAdmin: false,
        createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'user_beta_003',
        email: 'scalper_pro@binance.com',
        tradingExperience: 'Intermediate',
        markets: ['Crypto'],
        tradingStyle: 'Scalping',
        tradingCapital: 85000,
        riskTolerance: 'Aggressive',
        isOnboarded: true,
        isBetaTester: true,
        isAdmin: false,
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'user_beta_004',
        email: 'conservative_investor@schwab.com',
        tradingExperience: 'Beginner',
        markets: ['Stocks', 'Indices'],
        tradingStyle: 'Position Trading',
        tradingCapital: 1200000,
        riskTolerance: 'Conservative',
        isOnboarded: true,
        isBetaTester: false,
        isAdmin: false,
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }

  // Mock watchlists
  if (!localStorage.getItem(WATCHLIST_KEY)) {
    const defaultWatchlist: WatchlistItem[] = [
      { id: 'wl_1', userId: 'user_admin_001', symbol: 'BTCUSD', market: 'Crypto', price: 96420.50, change: 2.45, addedAt: new Date().toISOString() },
      { id: 'wl_2', userId: 'user_admin_001', symbol: 'XAUUSD', market: 'Forex', price: 2342.10, change: -0.15, addedAt: new Date().toISOString() },
      { id: 'wl_3', userId: 'user_admin_001', symbol: 'SPY', market: 'Stocks', price: 512.45, change: 0.84, addedAt: new Date().toISOString() },
      { id: 'wl_4', userId: 'user_admin_001', symbol: 'EURUSD', market: 'Forex', price: 1.08540, change: 0.12, addedAt: new Date().toISOString() }
    ];
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(defaultWatchlist));
  }

  // Mock feedback messages
  if (!localStorage.getItem(FEEDBACK_KEY)) {
    const defaultFeedback: FeedbackMessage[] = [
      {
        id: 'fb_1',
        userId: 'user_beta_002',
        userEmail: 'beta.trader@goldman.com',
        message: 'The risk management position size calculator is flawless! Saved me lots of spreadsheet time.',
        category: 'Feature',
        timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'fb_2',
        userId: 'user_beta_003',
        userEmail: 'scalper_pro@binance.com',
        message: 'Would love to have an API key output to hook this into my custom backtesting terminal!',
        category: 'Idea',
        timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
      }
    ];
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(defaultFeedback));
  }

  // Mock trading journal entries
  if (!localStorage.getItem(JOURNAL_KEY)) {
    const defaultJournal: JournalEntry[] = [
      {
        id: 'j_1',
        userId: 'user_admin_001',
        date: '2026-06-20',
        asset: 'BTCUSD',
        direction: 'Long',
        result: 'Win',
        pnl: 1420.50,
        notes: 'Beautiful double-bottom break on 1H timeframe. Institutional block support held perfectly.',
        riskReward: 3.2
      },
      {
        id: 'j_2',
        userId: 'user_admin_001',
        date: '2026-06-21',
        asset: 'XAUUSD',
        direction: 'Short',
        result: 'Loss',
        pnl: -450.00,
        notes: 'Premature entry before daily close. Got wicked out on Powell speech risk event.',
        riskReward: 2.0
      },
      {
        id: 'j_3',
        userId: 'user_admin_001',
        date: '2026-06-22',
        asset: 'EURUSD',
        direction: 'Long',
        result: 'Win',
        pnl: 890.00,
        notes: 'Liquidity sweep at NY session open. Target zone met perfectly at previous day high.',
        riskReward: 2.5
      },
      {
        id: 'j_4',
        userId: 'user_admin_001',
        date: '2026-06-23',
        asset: 'SPY',
        direction: 'Long',
        result: 'Pending',
        pnl: 0,
        notes: 'Gap-fill strategy. Entry at demand block with Stop Loss at local swing low.',
        riskReward: 4.0
      }
    ];
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(defaultJournal));
  }
};

// Auto run on load
initMockData();

// Helper to get raw storage items safely
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  if (!item) return defaultValue;
  try {
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const supabaseEmulator = {
  // AUTHENTICATION
  getCurrentUser: (): UserProfile | null => {
    return getStorageItem<UserProfile | null>(CURRENT_USER_KEY, null);
  },

  signUp: async (email: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network
    const users = getStorageItem<UserProfile[]>(USERS_KEY, []);
    
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      email: email,
      tradingExperience: '',
      markets: [],
      tradingStyle: '',
      tradingCapital: 0,
      riskTolerance: '',
      isOnboarded: false,
      isBetaTester: true, // Auto-admitted to Beta
      isAdmin: email.toLowerCase().includes('admin') || email.toLowerCase() === 'gerbieralexandre047@gmail.com', // Set admin based on user request or word
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    setStorageItem(USERS_KEY, users);
    setStorageItem(CURRENT_USER_KEY, newUser);

    return { success: true, user: newUser };
  },

  signIn: async (email: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 700)); // Simulate network
    const users = getStorageItem<UserProfile[]>(USERS_KEY, []);
    const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Since this is a client sandbox, we accept any password for ease of test validation
    setStorageItem(CURRENT_USER_KEY, foundUser);
    return { success: true, user: foundUser };
  },

  signOut: async (): Promise<{ success: boolean }> => {
    localStorage.removeItem(CURRENT_USER_KEY);
    return { success: true };
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const users = getStorageItem<UserProfile[]>(USERS_KEY, []);
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!exists) {
      return { success: false, error: 'No user found with this email address.' };
    }

    return { success: true, message: 'Password recovery email dispatched. Check your inbox for AlphaQuant instructions.' };
  },

  // ONBOARDING
  submitOnboarding: async (onboardingData: {
    tradingExperience: 'Beginner' | 'Intermediate' | 'Advanced';
    markets: string[];
    tradingStyle: 'Scalping' | 'Intraday' | 'Swing' | 'Position Trading';
    tradingCapital: number;
    riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
  }): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const currentUser = supabaseEmulator.getCurrentUser();
    if (!currentUser) return { success: false, error: 'No active session found.' };

    const updatedUser: UserProfile = {
      ...currentUser,
      ...onboardingData,
      isOnboarded: true
    };

    // Update in users database
    const users = getStorageItem<UserProfile[]>(USERS_KEY, []);
    const updatedUsers = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
    
    setStorageItem(USERS_KEY, updatedUsers);
    setStorageItem(CURRENT_USER_KEY, updatedUser);

    return { success: true, user: updatedUser };
  },

  // ANALYSES HISTORY
  getSavedAnalyses: (): SavedAnalysis[] => {
    const currentUser = supabaseEmulator.getCurrentUser();
    if (!currentUser) return [];
    const all = getStorageItem<SavedAnalysis[]>(ANALYSES_KEY, []);
    return all.filter((a) => a.userId === currentUser.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  saveAnalysis: (symbol: string, timeframe: string, report: any, screenshotUrl?: string): SavedAnalysis | null => {
    const currentUser = supabaseEmulator.getCurrentUser();
    if (!currentUser) return null;

    const newAnalysis: SavedAnalysis = {
      id: 'an_' + Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      symbol: symbol.toUpperCase(),
      timeframe: timeframe,
      timestamp: new Date().toISOString(),
      screenshotUrl: screenshotUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80',
      report: report
    };

    const all = getStorageItem<SavedAnalysis[]>(ANALYSES_KEY, []);
    all.push(newAnalysis);
    setStorageItem(ANALYSES_KEY, all);

    return newAnalysis;
  },

  deleteAnalysis: (id: string): boolean => {
    const currentUser = supabaseEmulator.getCurrentUser();
    if (!currentUser) return false;
    const all = getStorageItem<SavedAnalysis[]>(ANALYSES_KEY, []);
    const filtered = all.filter((a) => !(a.id === id && a.userId === currentUser.id));
    setStorageItem(ANALYSES_KEY, filtered);
    return true;
  },

  // TRADING JOURNAL
  getJournalEntries: (): JournalEntry[] => {
    const currentUser = supabaseEmulator.getCurrentUser();
    if (!currentUser) return [];
    const all = getStorageItem<JournalEntry[]>(JOURNAL_KEY, []);
    return all.filter((j) => j.userId === currentUser.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'userId'>): JournalEntry | null => {
    const currentUser = supabaseEmulator.getCurrentUser();
    if (!currentUser) return null;

    const newEntry: JournalEntry = {
      ...entry,
      id: 'jr_' + Math.random().toString(36).substr(2, 9),
      userId: currentUser.id
    };

    const all = getStorageItem<JournalEntry[]>(JOURNAL_KEY, []);
    all.push(newEntry);
    setStorageItem(JOURNAL_KEY, all);
    return newEntry;
  },

  deleteJournalEntry: (id: string): boolean => {
    const currentUser = supabaseEmulator.getCurrentUser();
    if (!currentUser) return false;
    const all = getStorageItem<JournalEntry[]>(JOURNAL_KEY, []);
    const filtered = all.filter((j) => !(j.id === id && j.userId === currentUser.id));
    setStorageItem(JOURNAL_KEY, filtered);
    return true;
  },

  // WATCHLIST
  getWatchlist: (): WatchlistItem[] => {
    const currentUser = supabaseEmulator.getCurrentUser();
    if (!currentUser) return [];
    const all = getStorageItem<WatchlistItem[]>(WATCHLIST_KEY, []);
    return all.filter((w) => w.userId === currentUser.id);
  },

  addToWatchlist: (symbol: string, market: 'Crypto' | 'Forex' | 'Stocks'): WatchlistItem | null => {
    const currentUser = supabaseEmulator.getCurrentUser();
    if (!currentUser) return null;

    const watchlist = supabaseEmulator.getWatchlist();
    if (watchlist.some((w) => w.symbol.toUpperCase() === symbol.toUpperCase())) {
      return null; // Already exists
    }

    // Set interactive initial price and change
    let price = 100;
    let change = 0.5;
    if (market === 'Crypto') {
      price = symbol.toUpperCase().includes('BTC') ? 95000 : symbol.toUpperCase().includes('ETH') ? 3400 : 50;
    } else if (market === 'Forex') {
      price = symbol.toUpperCase().includes('EUR') ? 1.0850 : symbol.toUpperCase().includes('GBP') ? 1.2750 : 150;
    } else if (market === 'Stocks') {
      price = symbol.toUpperCase().includes('SPY') ? 510 : symbol.toUpperCase().includes('QQQ') ? 430 : 180;
    }

    const newItem: WatchlistItem = {
      id: 'wl_' + Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      symbol: symbol.toUpperCase(),
      market: market,
      price: price,
      change: change,
      addedAt: new Date().toISOString()
    };

    const all = getStorageItem<WatchlistItem[]>(WATCHLIST_KEY, []);
    all.push(newItem);
    setStorageItem(WATCHLIST_KEY, all);
    return newItem;
  },

  removeFromWatchlist: (id: string): boolean => {
    const currentUser = supabaseEmulator.getCurrentUser();
    if (!currentUser) return false;
    const all = getStorageItem<WatchlistItem[]>(WATCHLIST_KEY, []);
    const filtered = all.filter((w) => !(w.id === id && w.userId === currentUser.id));
    setStorageItem(WATCHLIST_KEY, filtered);
    return true;
  },

  // FEEDBACK
  submitFeedback: async (message: string, category: 'Bug' | 'Feature' | 'Idea' | 'General'): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const currentUser = supabaseEmulator.getCurrentUser();
    if (!currentUser) return false;

    const newFeedback: FeedbackMessage = {
      id: 'fb_' + Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userEmail: currentUser.email,
      message: message,
      category: category,
      timestamp: new Date().toISOString()
    };

    const all = getStorageItem<FeedbackMessage[]>(FEEDBACK_KEY, []);
    all.push(newFeedback);
    setStorageItem(FEEDBACK_KEY, all);
    return true;
  },

  // ADMIN PANEL
  getAdminStats: (): {
    users: UserProfile[];
    analysesCount: number;
    feedbacks: FeedbackMessage[];
    totalJournalEntries: number;
  } => {
    const currentUser = supabaseEmulator.getCurrentUser();
    if (!currentUser || !currentUser.isAdmin) {
      return { users: [], analysesCount: 0, feedbacks: [], totalJournalEntries: 0 };
    }

    const users = getStorageItem<UserProfile[]>(USERS_KEY, []);
    const analyses = getStorageItem<SavedAnalysis[]>(ANALYSES_KEY, []);
    const feedbacks = getStorageItem<FeedbackMessage[]>(FEEDBACK_KEY, []);
    const journals = getStorageItem<JournalEntry[]>(JOURNAL_KEY, []);

    return {
      users: users,
      analysesCount: analyses.length + 142, // Add some mock count for premium display
      feedbacks: feedbacks,
      totalJournalEntries: journals.length + 288
    };
  },

  toggleBetaTester: (userId: string): boolean => {
    const currentUser = supabaseEmulator.getCurrentUser();
    if (!currentUser || !currentUser.isAdmin) return false;

    const users = getStorageItem<UserProfile[]>(USERS_KEY, []);
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, isBetaTester: !u.isBetaTester };
      }
      return u;
    });

    setStorageItem(USERS_KEY, updated);

    // If current user is toggling themselves
    if (currentUser.id === userId) {
      const updatedSelf = updated.find((u) => u.id === userId);
      if (updatedSelf) setStorageItem(CURRENT_USER_KEY, updatedSelf);
    }

    return true;
  }
};
