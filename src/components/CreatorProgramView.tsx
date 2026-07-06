import React, { useState, useEffect } from 'react';
import { 
  Flame, Award, ArrowUpRight, Copy, Share2, QrCode, Search, Filter, 
  Play, Download, Send, Sparkles, TrendingUp, HelpCircle, ChevronRight, 
  Lock, Unlock, CheckCircle2, RefreshCw, Bell, Zap, Trophy, Users, 
  BarChart, MessageSquare, Check, X, Calendar, DollarSign, Globe, ExternalLink, LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

interface CreatorProgramViewProps {
  currentUser: UserProfile;
}

// Interfaces for Referral, Level, Reward, Content, News, etc.
interface ReferredUser {
  id: string;
  name: string;
  dateJoined: string;
  plan: 'Pro' | 'Elite' | 'Free';
  status: 'Trial' | 'Active' | 'Cancelled';
  monthlyRevenue: number;
  lifetimeRevenue: number;
}

interface CreatorLevel {
  name: string;
  requiredActive: number;
  revenueShare: number;
  badgeColor: string;
  bgColor: string;
}

interface CreatorReward {
  referralsNeeded: number;
  title: string;
  description: string;
  perk: string;
}

interface CreatorChallenge {
  id: string;
  title: string;
  objective: string;
  reward: string;
  progress: number;
  totalNeeded: number;
  isCompleted: boolean;
  type: 'video' | 'refer' | 'guide';
}

interface CommunityMessage {
  id: string;
  username: string;
  avatarColor: string;
  tier: string;
  text: string;
  timestamp: string;
}

export default function CreatorProgramView({ currentUser }: CreatorProgramViewProps) {
  // Navigation tabs inside the Creator program
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'referrals' | 'resources' | 'community'>('overview');

  // Custom slug customized by the creator
  const [referralSlug, setReferralSlug] = useState(currentUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''));
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [slugInputValue, setSlugInputValue] = useState(referralSlug);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrCodeModal, setShowQrCodeModal] = useState(false);

  // Live Notifications State
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'signup' | 'upgrade' | 'trial' | 'reward' | 'commission' | 'leaderboard';
    title: string;
    description: string;
    time: string;
  }>>([
    { id: '1', type: 'commission', title: 'Commission Received', description: 'You earned €45.00 from ref_fiona_goldman.', time: '10 mins ago' },
    { id: '2', type: 'reward', title: 'Reward Level Unlocked!', description: 'Early Access to AlphaQuant Vision X features is now active.', time: '2 hours ago' },
    { id: '3', type: 'upgrade', title: 'Referral Upgraded', description: 'ref_alexander upgraded to the ELITE subscription model.', time: '1 day ago' },
    { id: '4', type: 'signup', title: 'New Registration', description: 'trader_dan99 joined AlphaQuant via your referral code.', time: '2 days ago' }
  ]);

  // Simulated Database of Referrals
  const [referrals, setReferrals] = useState<ReferredUser[]>([
    { id: 'ref_1', name: 'Marcus V.', dateJoined: '2026-06-15', plan: 'Elite', status: 'Active', monthlyRevenue: 150, lifetimeRevenue: 300 },
    { id: 'ref_2', name: 'Sophie Duboix', dateJoined: '2026-06-18', plan: 'Pro', status: 'Active', monthlyRevenue: 79, lifetimeRevenue: 158 },
    { id: 'ref_3', name: 'Fiona Goldman', dateJoined: '2026-06-21', plan: 'Elite', status: 'Active', monthlyRevenue: 150, lifetimeRevenue: 150 },
    { id: 'ref_4', name: 'Lucas Rossi', dateJoined: '2026-06-25', plan: 'Pro', status: 'Trial', monthlyRevenue: 0, lifetimeRevenue: 0 },
    { id: 'ref_5', name: 'Yuki Tanaka', dateJoined: '2026-06-29', plan: 'Free', status: 'Cancelled', monthlyRevenue: 0, lifetimeRevenue: 79 },
    { id: 'ref_6', name: 'David Miller', dateJoined: '2026-07-01', plan: 'Pro', status: 'Active', monthlyRevenue: 79, lifetimeRevenue: 79 },
    { id: 'ref_7', name: 'Amara Diop', dateJoined: '2026-07-03', plan: 'Elite', status: 'Trial', monthlyRevenue: 0, lifetimeRevenue: 0 },
    { id: 'ref_8', name: 'Chen Wei', dateJoined: '2026-07-05', plan: 'Pro', status: 'Active', monthlyRevenue: 79, lifetimeRevenue: 79 }
  ]);

  // Filter, Sort and Search referrals
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Trial' | 'Active' | 'Cancelled'>('All');
  const [planFilter, setPlanFilter] = useState<'All' | 'Pro' | 'Elite' | 'Free'>('All');
  const [sortBy, setSortBy] = useState<'date' | 'revenue' | 'name'>('date');

  // New Referrals simulation helper
  const handleAddMockReferral = () => {
    const names = ['Ethan Carter', 'Isabella Santos', 'Noah Lindqvist', 'Zara Al-Mansoori', 'Viktor Kowalski', 'Chloe Dupont'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const plans: Array<'Pro' | 'Elite' | 'Free'> = ['Pro', 'Elite', 'Trial' as any];
    const chosenPlan = plans[Math.floor(Math.random() * plans.length)];
    
    let status: 'Trial' | 'Active' | 'Cancelled' = 'Active';
    let monthlyRev = chosenPlan === 'Elite' ? 150 : 79;
    
    if (chosenPlan === ('Trial' as any)) {
      status = 'Trial';
      monthlyRev = 0;
    }

    const newRef: ReferredUser = {
      id: `ref_mock_${Date.now()}`,
      name: randomName,
      dateJoined: new Date().toISOString().split('T')[0],
      plan: chosenPlan === ('Trial' as any) ? 'Pro' : chosenPlan,
      status: status,
      monthlyRevenue: monthlyRev,
      lifetimeRevenue: monthlyRev
    };

    setReferrals([newRef, ...referrals]);

    // Push Notification
    const newNotif = {
      id: `notif_${Date.now()}`,
      type: status === 'Trial' ? 'trial' : 'signup' as any,
      title: status === 'Trial' ? 'Trial Started' : 'Referral Joined',
      description: `${randomName} joined AlphaQuant as an active ${status === 'Trial' ? 'Trialist' : 'Member'}.`,
      time: 'Just now'
    };
    setNotifications([newNotif, ...notifications]);
  };

  // Derived metrics
  const totalReferralsCount = referrals.length;
  const activeReferralsCount = referrals.filter(r => r.status === 'Active').length;
  const totalMonthlyRevenueGenerated = referrals.reduce((acc, curr) => acc + (curr.status === 'Active' ? curr.monthlyRevenue : 0), 0);
  const estimatedMonthlyRewards = totalMonthlyRevenueGenerated * 0.30; // 30% commission
  const lifetimeRewards = referrals.reduce((acc, curr) => acc + curr.lifetimeRevenue, 0) * 0.30;
  const clickCount = 4280;
  const conversionRate = totalReferralsCount > 0 ? ((totalReferralsCount / clickCount) * 100).toFixed(2) : '3.82';
  const ctrValue = '14.25%';
  const leaderboardPosition = activeReferralsCount >= 15 ? 12 : activeReferralsCount >= 5 ? 48 : 104;
  const creatorScore = activeReferralsCount * 12 + Math.floor(lifetimeRewards * 0.1) + 120; // gamified creator ranking index

  // Levels matching specifications
  const creatorLevels: CreatorLevel[] = [
    { name: 'Starter', requiredActive: 0, revenueShare: 30, badgeColor: 'text-slate-400 border-slate-700/50', bgColor: 'bg-slate-900/40' },
    { name: 'Explorer', requiredActive: 5, revenueShare: 30, badgeColor: 'text-cyan-400 border-cyan-500/20', bgColor: 'bg-cyan-950/20' },
    { name: 'Creator', requiredActive: 15, revenueShare: 30, badgeColor: 'text-blue-400 border-blue-500/20', bgColor: 'bg-blue-950/20' },
    { name: 'Partner', requiredActive: 50, revenueShare: 35, badgeColor: 'text-indigo-400 border-indigo-500/20', bgColor: 'bg-indigo-950/20' },
    { name: 'Elite', requiredActive: 150, revenueShare: 40, badgeColor: 'text-purple-400 border-purple-500/20', bgColor: 'bg-purple-950/20' },
    { name: 'Ambassador', requiredActive: 500, revenueShare: 50, badgeColor: 'text-amber-400 border-amber-500/20', bgColor: 'bg-amber-950/20' }
  ];

  // Current Creator Level
  const currentLevelIndex = creatorLevels.reduce((acc, level, index) => {
    if (activeReferralsCount >= level.requiredActive) return index;
    return acc;
  }, 0);
  const currentLevel = creatorLevels[currentLevelIndex];
  const nextLevel = currentLevelIndex < creatorLevels.length - 1 ? creatorLevels[currentLevelIndex + 1] : null;

  // Level Up Progress Math
  const referralsForNextLevel = nextLevel ? nextLevel.requiredActive - activeReferralsCount : 0;
  const progressToNextLevel = nextLevel 
    ? ((activeReferralsCount - currentLevel.requiredActive) / (nextLevel.requiredActive - currentLevel.requiredActive)) * 100 
    : 100;

  // Creator rewards timeline
  const rewardsList: CreatorReward[] = [
    { referralsNeeded: 5, title: 'Pro Trial Extension', description: 'One free month of AlphaQuant Pro subscription', perk: '1 Month Free Pro' },
    { referralsNeeded: 10, title: 'Pro Booster', description: 'Three free months of AlphaQuant Pro subscription', perk: '3 Months Free Pro' },
    { referralsNeeded: 20, title: 'Creator Badge', description: 'Exclusive Creator Badge on user profiles and supervisor dashboard', perk: 'Exclusive Badge' },
    { referralsNeeded: 30, title: 'Vision X Early Access', description: 'Early access to premium AI-guided backtesting and orderflow scanner models', perk: 'Beta AI Models' },
    { referralsNeeded: 50, title: 'Creator Advisory Group', description: 'Access to private Ambassador Discord server with weekly mastermind calls', perk: 'Private Discord & Masterminds' },
    { referralsNeeded: 100, title: 'Permanent Discount', description: 'Lifetime subscription waiver and dedicated supervisor onboarding desk', perk: 'Waved Fees + Personal VIP Onboarding' },
    { referralsNeeded: 200, title: 'Enterprise Revenue Matrix', description: 'Increase direct commission share to 45% and feature on homepage', perk: '45% RevShare Tier + Featured Profile Page' }
  ];

  // Challenge Missions
  const [challenges, setChallenges] = useState<CreatorChallenge[]>([
    { id: 'ch_1', title: 'Content Catalyst', objective: 'Publish 3 educational trading clips on TikTok or YouTube Shorts referencing risk parameters', reward: 'Unlock "Viral Creator" Profile Badge + €50 Payout Booster', progress: 2, totalNeeded: 3, isCompleted: false, type: 'video' },
    { id: 'ch_2', title: 'Cohort Recruiter', objective: 'Refer 5 new active traders to start institutional trials during current week cycle', reward: 'Unlock "Ambassador Core" Trophy + 5% RevShare bonus for 30 days', progress: activeReferralsCount >= 5 ? 5 : activeReferralsCount, totalNeeded: 5, isCompleted: activeReferralsCount >= 5, type: 'refer' },
    { id: 'ch_3', title: 'Expert Academy', objective: 'Design and upload a custom trade walk-through tutorial referencing the AI coach', reward: 'Featured Creator Status on AlphaQuant home resources', progress: 0, totalNeeded: 1, isCompleted: false, type: 'guide' }
  ]);

  // Handle Challenge Claim simulation
  const handleProgressChallenge = (id: string) => {
    setChallenges(challenges.map(c => {
      if (c.id === id && !c.isCompleted) {
        const nextProgress = Math.min(c.progress + 1, c.totalNeeded);
        const completedNow = nextProgress === c.totalNeeded;
        if (completedNow) {
          // Add notification
          const rewardNotif = {
            id: `notif_${Date.now()}`,
            type: 'reward' as any,
            title: 'Challenge Completed!',
            description: `You completed "${c.title}" and unlocked: ${c.reward}`,
            time: 'Just now'
          };
          setNotifications([rewardNotif, ...notifications]);
        }
        return { ...c, progress: nextProgress, isCompleted: completedNow };
      }
      return c;
    }));
  };

  // AI content generator focus state
  const [focusMarket, setFocusMarket] = useState('Crypto (BTC/ETH Focus)');
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [activeIdeaPlatform, setActiveIdeaPlatform] = useState<'tiktok' | 'reels' | 'shorts' | 'x' | 'linkedin'>('tiktok');
  
  // Real or Fallback AI content ideas state
  const [aiIdeas, setAiIdeas] = useState<any>(null);
  const [aiModelUsed, setAiModelUsed] = useState('');
  const [aiIsSimulated, setAiIsSimulated] = useState(true);

  // Auto-generate initial content on load
  const loadContentIdeas = async () => {
    setIsGeneratingIdeas(true);
    try {
      const response = await fetch('/api/creator/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: referralSlug,
          tier: currentLevel.name,
          focusMarket: focusMarket
        })
      });
      const data = await response.json();
      setAiIdeas(data.ideas);
      setAiModelUsed(data.modelUsed);
      setAiIsSimulated(data.isSimulated);
    } catch (err) {
      console.error('Failed fetching AI content from backend', err);
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  useEffect(() => {
    loadContentIdeas();
  }, [focusMarket]);

  // Copy referral link logic
  const referralLink = `alphaquant.ai/ref/${referralSlug}`;
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://${referralLink}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Custom QR Code drawing (visually striking vector graphic)
  const renderQRCodeSvg = () => {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full text-white">
        {/* Outer Frame */}
        <rect x="5" y="5" width="90" height="90" rx="8" fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.1" />
        
        {/* QR Corner Markers */}
        {/* Top-Left */}
        <rect x="12" y="12" width="20" height="20" rx="3" fill="none" stroke="currentColor" strokeWidth="3" />
        <rect x="17" y="17" width="10" height="10" rx="1.5" fill="currentColor" />
        
        {/* Top-Right */}
        <rect x="68" y="12" width="20" height="20" rx="3" fill="none" stroke="currentColor" strokeWidth="3" />
        <rect x="73" y="17" width="10" height="10" rx="1.5" fill="currentColor" />
        
        {/* Bottom-Left */}
        <rect x="12" y="68" width="20" height="20" rx="3" fill="none" stroke="currentColor" strokeWidth="3" />
        <rect x="17" y="73" width="10" height="10" rx="1.5" fill="currentColor" />
        
        {/* Bottom-Right alignment point */}
        <rect x="73" y="73" width="10" height="10" rx="2" fill="currentColor" />
        
        {/* Simulated random QR-code bit grids */}
        <g fill="currentColor" opacity="0.85">
          <rect x="38" y="12" width="6" height="6" rx="1" />
          <rect x="48" y="12" width="12" height="6" rx="1" />
          <rect x="38" y="24" width="18" height="6" rx="1" />
          <rect x="12" y="38" width="12" height="6" rx="1" />
          <rect x="28" y="38" width="6" height="12" rx="1" />
          <rect x="38" y="38" width="24" height="24" rx="12" fill="none" stroke="url(#qr-gradient)" strokeWidth="4" />
          <circle cx="50" cy="50" r="4" fill="url(#qr-gradient)" />
          <rect x="68" y="38" width="12" height="6" rx="1" />
          <rect x="68" y="48" width="6" height="12" rx="1" />
          <rect x="80" y="48" width="8" height="8" rx="1.5" />
          <rect x="38" y="68" width="12" height="6" rx="1" />
          <rect x="56" y="68" width="8" height="12" rx="1" />
          <rect x="38" y="80" width="18" height="8" rx="2" />
        </g>
        
        <defs>
          <linearGradient id="qr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  // Filter and search referrals logic
  const filteredReferrals = referrals.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesPlan = planFilter === 'All' || r.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  }).sort((a, b) => {
    if (sortBy === 'date') return new Date(b.dateJoined).getTime() - new Date(a.dateJoined).getTime();
    if (sortBy === 'revenue') return b.lifetimeRevenue - a.lifetimeRevenue;
    return a.name.localeCompare(b.name);
  });

  // Community Chat Box State
  const [chatMessages, setChatMessages] = useState<CommunityMessage[]>([
    { id: 'm1', username: 'alex_growth', avatarColor: 'bg-emerald-600', tier: 'Partner', text: 'Just published my third video. Hooking them with the "Contradiction Engine" was key!', timestamp: '09:12' },
    { id: 'm2', username: 'fx_titan', avatarColor: 'bg-blue-600', tier: 'Elite', text: 'Nice! The risk calculator is what converts 90% of my Forex trialists. Truly professional tool.', timestamp: '09:20' },
    { id: 'm3', username: 'coin_pioneer', avatarColor: 'bg-purple-600', tier: 'Creator', text: 'Anyone hosting a webinar soon? Would love to co-host and break down structural BOS shifts.', timestamp: '10:04' },
    { id: 'm4', username: 'ambassador_josh', avatarColor: 'bg-amber-600', tier: 'Ambassador', text: 'I am hosting our monthly mastermind call tomorrow at 18:00 UTC. Check the webinars list!', timestamp: '10:15' }
  ]);
  const [newChatMessage, setNewChatMessage] = useState('');

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;

    const msg: CommunityMessage = {
      id: `chat_${Date.now()}`,
      username: currentUser.email.split('@')[0],
      avatarColor: 'bg-indigo-600',
      tier: currentLevel.name,
      text: newChatMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages([...chatMessages, msg]);
    setNewChatMessage('');
  };

  return (
    <div id="creator-program-view" className="space-y-8 animate-fade-in text-slate-100">
      
      {/* HEADER SECTION - Brand Identity */}
      <div id="creator-program-header" className="p-8 rounded-2xl border border-slate-900 bg-gradient-to-r from-slate-950 to-slate-900/60 relative overflow-hidden shadow-2xl">
        <div id="header-glow-ambient" className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -top-24 -right-24 pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-xs font-bold font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-3 h-3" />
                Exclusive Partner Console
              </div>
              <span className="text-xs font-mono text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-400">ID: {currentUser.id.slice(0, 10).toUpperCase()}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white uppercase">
              Creator Program
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Welcome to the elite AlphaQuant Ambassador network. Empower your trading community, distribute institutional market terminal resources, and secure up to <span className="text-emerald-400 font-bold">50% lifetime recurring commissions</span>.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAddMockReferral}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-500/20 bg-blue-950/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold font-mono tracking-wider cursor-pointer uppercase shadow-lg shadow-blue-950/20"
            >
              <Users className="w-4 h-4" />
              Simulate Referral Sign Up
            </button>
            <button
              onClick={() => {
                const randType = ['signup', 'upgrade', 'trial', 'reward', 'commission'][Math.floor(Math.random() * 5)] as any;
                const randTitle = randType === 'signup' ? 'New Ambassador Joined' : randType === 'upgrade' ? 'Referral Level Up' : randType === 'trial' ? 'Pro Trial Initiated' : randType === 'reward' ? 'Exclusive Badge Active' : 'Payout Dispatched';
                const randDesc = randType === 'signup' ? 'ref_trader_alpha registered via your widget.' : randType === 'upgrade' ? 'Sophie upgraded to Elite level.' : randType === 'trial' ? 'A customer started their 14-day institutional trial.' : randType === 'reward' ? 'You unlocked the custom creator profile badge!' : 'Commission payout transferred to your account.';
                const dummyNotif = {
                  id: `notif_${Date.now()}`,
                  type: randType,
                  title: randTitle,
                  description: randDesc,
                  time: 'Just now'
                };
                setNotifications([dummyNotif, ...notifications]);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-900 transition-all text-xs font-bold font-mono tracking-wider cursor-pointer uppercase"
            >
              <Bell className="w-4 h-4" />
              Test Push Alert
            </button>
          </div>

        </div>
      </div>

      {/* SUB TABS NAVIGATION */}
      <div id="creator-tabs-navigation" className="flex overflow-x-auto border-b border-slate-900 pb-1 scrollbar-hide gap-1.5">
        {[
          { id: 'overview', label: 'Console Hub', icon: LayoutDashboard },
          { id: 'analytics', label: 'Funnel & Analytics', icon: BarChart },
          { id: 'referrals', label: 'Referral Directory', icon: Users },
          { id: 'resources', label: 'Content Center', icon: Sparkles },
          { id: 'community', label: 'Ambassador Room', icon: MessageSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-mono text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* NOTIFICATION LIVE TICKER (Compact top banner) */}
      <AnimatePresence>
        {notifications.length > 0 && (
          <div id="notification-ticker" className="bg-slate-950 border border-slate-900 rounded-xl p-3.5 flex items-center justify-between gap-4 overflow-hidden relative">
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-blue-600 to-cyan-500" />
            <div className="flex items-center gap-3 truncate">
              <div className="w-7 h-7 rounded-lg bg-blue-950/40 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Bell className="w-3.5 h-3.5 text-blue-400 animate-bounce" />
              </div>
              <div className="truncate">
                <span className="text-[10px] text-slate-500 font-mono block uppercase tracking-wider leading-none">Live Ambassador Event • {notifications[0].time}</span>
                <span className="text-xs font-bold text-white leading-tight">{notifications[0].title}: </span>
                <span className="text-xs text-slate-300 leading-tight">{notifications[0].description}</span>
              </div>
            </div>
            <button 
              onClick={() => setNotifications(notifications.slice(1))}
              className="text-slate-500 hover:text-slate-300 p-1 rounded-md hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </AnimatePresence>

      {/* CORE SCREENS ROUTING */}
      {activeTab === 'overview' && (
        <div id="overview-screen" className="space-y-8 animate-fade-in">
          
          {/* STATS BENTO GRID */}
          <div id="overview-bento-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* TIER LEVEL CARD */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-blue-900/30 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Current Status</span>
                <Award className={`w-5 h-5 ${currentLevel.name === 'Starter' ? 'text-slate-400' : 'text-blue-400'}`} />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-mono">Creator Class:</span>
                <span className={`text-2xl font-black uppercase tracking-wider block mt-1 ${currentLevel.name === 'Starter' ? 'text-slate-300' : 'text-white'}`}>
                  {currentLevel.name}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">{currentLevel.revenueShare}% Recurring Revenue Share</span>
              </div>
              <div className="pt-3 border-t border-slate-900/60 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-500 uppercase">Leaderboard Ranking</span>
                <span className="text-blue-400 font-bold">#{leaderboardPosition} Global</span>
              </div>
            </div>

            {/* TOTAL / ACTIVE REFERRALS */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-blue-900/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Referrals Track</span>
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-mono">Active / Total:</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-white font-mono">{activeReferralsCount}</span>
                  <span className="text-slate-500 font-mono">/</span>
                  <span className="text-lg font-bold text-slate-400 font-mono">{totalReferralsCount}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Conversion Rate: {conversionRate}%</span>
              </div>
              <div className="pt-3 border-t border-slate-900/60 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-500 uppercase">Estimated CTR</span>
                <span className="text-cyan-400 font-bold">{ctrValue}</span>
              </div>
            </div>

            {/* MONTHLY RECURRING REVENUE GENERATED */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-blue-900/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">MRR Pipeline</span>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-mono">MRR Generated:</span>
                <span className="text-3xl font-black text-white font-mono block mt-1">
                  €{totalMonthlyRevenueGenerated.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">Estimated Share: €{estimatedMonthlyRewards.toFixed(2)} / mo</span>
              </div>
              <div className="pt-3 border-t border-slate-900/60 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-500 uppercase">ARR Equivalent</span>
                <span className="text-emerald-400 font-bold">€{(totalMonthlyRevenueGenerated * 12).toLocaleString()}</span>
              </div>
            </div>

            {/* LIFETIME COMMISSION PAYOUTS */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-blue-900/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Rewards Retrospective</span>
                <DollarSign className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-mono">Lifetime Payouts:</span>
                <span className="text-3xl font-black text-white font-mono block mt-1">
                  €{lifetimeRewards.toFixed(2)}
                </span>
                <span className="text-[10px] text-indigo-400 font-mono mt-0.5 block">Next Scheduled: 15th July</span>
              </div>
              <div className="pt-3 border-t border-slate-900/60 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-500 uppercase">Creator Score</span>
                <span className="text-indigo-400 font-bold">{creatorScore} Pts</span>
              </div>
            </div>

          </div>

          {/* REFERRAL LINK PANEL & QR CODE */}
          <div id="referral-link-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* PERSONAL LINK CONFIG */}
            <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-900 bg-slate-950 space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Your Unique Referral Engine</h3>
                  <p className="text-xs text-slate-400">Share your custom referral link or code across your trading communities.</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-500">
                  <Globe className="w-4 h-4" />
                </div>
              </div>

              {/* Link Input Widget */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center bg-black border border-slate-900 rounded-xl px-3.5 py-3">
                    <span className="text-xs font-mono text-slate-500 pr-0.5 select-none">alphaquant.ai/ref/</span>
                    {isEditingSlug ? (
                      <input
                        type="text"
                        value={slugInputValue}
                        onChange={(e) => setSlugInputValue(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                        className="flex-1 bg-transparent text-xs text-white font-mono outline-none border-b border-blue-500/50 pb-0.5"
                        placeholder="customslug"
                        autoFocus
                      />
                    ) : (
                      <span className="text-xs text-blue-400 font-mono font-semibold">{referralSlug}</span>
                    )}
                  </div>
                  
                  {isEditingSlug ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          if (slugInputValue.trim()) {
                            setReferralSlug(slugInputValue);
                          }
                          setIsEditingSlug(false);
                        }}
                        className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSlugInputValue(referralSlug);
                          setIsEditingSlug(false);
                        }}
                        className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 hover:bg-red-650 hover:text-white transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingSlug(true)}
                      className="px-3 py-3 border border-slate-850 hover:border-slate-700 bg-slate-900/40 text-slate-300 hover:text-white text-xs font-mono rounded-xl transition-all cursor-pointer"
                    >
                      Customize
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    onClick={handleCopyLink}
                    className={`w-full flex items-center justify-center gap-2 py-3 border rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      copiedLink 
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                        : 'bg-blue-600 hover:bg-blue-500 border-transparent text-white shadow-lg'
                    }`}
                  >
                    {copiedLink ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? 'Link Copied!' : 'Copy Invitation Link'}
                  </button>
                  <button
                    onClick={() => setShowQrCodeModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-300 hover:text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    Reveal QR Code
                  </button>
                </div>
              </div>

              {/* Social Channels Share Actions */}
              <div className="pt-4 border-t border-slate-900/60 space-y-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold block">One-Click Community Sharing</span>
                <div className="grid grid-cols-5 gap-2.5">
                  {[
                    { label: 'Twitter', icon: '🐦', url: `https://twitter.com/intent/tweet?text=Transform+your+trading+with+institutional+AI.+Run+market+structure+audits,+analyze+macro+stances,+and+receive+automated+risk-reward+sheets.+Claim+free+trial:+&url=https://${referralLink}` },
                    { label: 'LinkedIn', icon: '💼', url: `https://www.linkedin.com/sharing/share-offsite/?url=https://${referralLink}` },
                    { label: 'Instagram', icon: '📸', alert: 'Copy link and place it in your Instagram bio to route social clicks.' },
                    { label: 'TikTok', icon: '🎵', alert: 'Use link in bio of your TikTok profile. Download video templates from our Content Center.' },
                    { label: 'Email', icon: '✉️', url: `mailto:?subject=Professional+Market+Intelligence+Terminal&body=Hey!+I've+been+using+AlphaQuant's+institutional+AI+to+audit+trading+setups+and+structure.+You+can+register+via+my+Ambassador+link+to+secure+a+free+trial:+https://${referralLink}` }
                  ].map((soc, idx) => {
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (soc.url) {
                            window.open(soc.url, '_blank');
                          } else {
                            alert(soc.alert);
                          }
                        }}
                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-900 bg-slate-900/20 hover:bg-slate-900 hover:border-slate-800 transition-all cursor-pointer group"
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform mb-1">{soc.icon}</span>
                        <span className="text-[9px] font-mono text-slate-400 group-hover:text-white transition-colors">{soc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* LEVEL UP ROADMAP & REVENUE SHARE */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 space-y-4 flex flex-col justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Ambassador Progression</h3>
                <p className="text-xs text-slate-400">Add active referrals to scale your recurring rev-share percentage.</p>
              </div>

              {/* Progress Slider Display */}
              <div className="space-y-3 py-2">
                <div className="flex justify-between items-baseline text-xs font-mono">
                  <span className="text-slate-400">Current active: <b className="text-white">{activeReferralsCount}</b></span>
                  {nextLevel ? (
                    <span className="text-slate-500">{referralsForNextLevel} needed for <b className="text-blue-400">{nextLevel.name}</b></span>
                  ) : (
                    <span className="text-amber-400 font-bold">Highest Level Reached!</span>
                  )}
                </div>

                {/* Simulated slider line */}
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden relative border border-slate-900">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-1000"
                    style={{ width: `${progressToNextLevel}%` }}
                  />
                </div>

                <div className="flex justify-between text-[9px] font-mono text-slate-500">
                  <span>{currentLevel.name} ({currentLevel.requiredActive})</span>
                  {nextLevel && <span>{nextLevel.name} ({nextLevel.requiredActive})</span>}
                </div>
              </div>

              {/* Reward list highlight */}
              <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 font-mono uppercase">
                  <Zap className="w-3.5 h-3.5 animate-pulse" />
                  Active RevShare Level
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Current Share:</span>
                  <span className="text-white font-mono font-bold">{currentLevel.revenueShare}% Recurring</span>
                </div>
                {nextLevel && (
                  <div className="flex justify-between text-xs pt-1.5 border-t border-slate-950/60">
                    <span className="text-slate-500">Next Tier ({nextLevel.name}):</span>
                    <span className="text-slate-400 font-mono font-semibold">{nextLevel.revenueShare}% Recurring</span>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* ACTIVE REWARDS PROGRESS TRACK */}
          <div id="rewards-roadmap" className="p-6 rounded-2xl border border-slate-900 bg-slate-950 space-y-5">
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Unlockable Creator Benefits</h3>
              <p className="text-xs text-slate-400">Unlock custom utility boosts, personal onboarding desks, or higher payouts relative to your referred community.</p>
            </div>

            {/* Horizontal Timeline Track */}
            <div className="relative pt-4 overflow-x-auto scrollbar-hide pb-2">
              
              {/* Central horizontal slider axis */}
              <div className="absolute top-11 left-4 right-4 h-1 bg-slate-900 pointer-events-none" />
              <div 
                className="absolute top-11 left-4 h-1 bg-blue-600 pointer-events-none transition-all duration-1000" 
                style={{ 
                  width: `${
                    activeReferralsCount >= 200 ? '98%' :
                    activeReferralsCount >= 100 ? '80%' :
                    activeReferralsCount >= 50 ? '64%' :
                    activeReferralsCount >= 30 ? '48%' :
                    activeReferralsCount >= 20 ? '32%' :
                    activeReferralsCount >= 10 ? '16%' :
                    activeReferralsCount >= 5 ? '8%' : '2%'
                  }` 
                }} 
              />

              <div className="flex justify-between min-w-[900px] relative z-10 px-2">
                {rewardsList.map((reward, index) => {
                  const isUnlocked = activeReferralsCount >= reward.referralsNeeded;
                  return (
                    <div key={index} className="flex flex-col items-center text-center space-y-2.5 w-28 shrink-0">
                      
                      {/* Referrals flag */}
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${isUnlocked ? 'bg-blue-950 text-blue-400 border border-blue-500/20' : 'bg-slate-900 text-slate-500'}`}>
                        {reward.referralsNeeded} Active
                      </span>

                      {/* Icon point */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isUnlocked 
                          ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]' 
                          : 'bg-black border-2 border-slate-800 text-slate-600'
                      }`}>
                        {isUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </div>

                      {/* Info label */}
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold block text-white leading-snug">{reward.perk}</span>
                        <span className="text-[9px] block text-slate-500 leading-tight max-w-[100px] mx-auto">{reward.title}</span>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* CREATOR CHALLENGES & LEADERBOARD MODULE */}
          <div id="creator-engagement-module" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* WEEKLY CHALLENGES PANE */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Active Creator Missions</h3>
                  <p className="text-xs text-slate-400 font-mono text-slate-400">Earn direct multipliers and custom badges this week.</p>
                </div>
                <div className="px-2 py-1 rounded bg-blue-950 text-blue-400 border border-blue-500/20 text-[10px] font-mono uppercase font-bold">
                  Weekly resets
                </div>
              </div>

              <div className="space-y-4">
                {challenges.map((c) => {
                  return (
                    <div key={c.id} className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 space-y-3 hover:border-slate-800 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Mission: {c.type}</span>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">{c.title}</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{c.objective}</p>
                        </div>
                        {c.isCompleted ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/20 flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                        ) : (
                          <button
                            onClick={() => handleProgressChallenge(c.id)}
                            className="text-[10px] font-mono font-bold text-blue-400 hover:text-white bg-blue-950/40 hover:bg-blue-600 border border-blue-500/10 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer uppercase shrink-0"
                          >
                            Execute Log
                          </button>
                        )}
                      </div>

                      {/* Progress bar info */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-500">
                          <span>Progress: {c.progress}/{c.totalNeeded}</span>
                          <span>Reward: <b className="text-amber-400 font-bold">{c.reward}</b></span>
                        </div>
                        <div className="w-full bg-black h-1.5 rounded-full overflow-hidden border border-slate-900">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${(c.progress / c.totalNeeded) * 100}%` }}
                          />
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

            {/* GLOBAL LEADERBOARD PANE */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Ambassador Leaderboard</h3>
                  <p className="text-xs text-slate-400">Compete with top creators for active bonus payouts.</p>
                </div>
                <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
              </div>

              {/* Leaderboard Table List */}
              <div className="space-y-2.5">
                {[
                  { rank: 1, name: 'alexgerbier', referrals: 520, mrr: 24500, score: 7120, badge: 'Ambassador', flag: '🔥' },
                  { rank: 2, name: 'fx_titan_london', referrals: 312, mrr: 15800, score: 4890, badge: 'Elite', flag: '⭐' },
                  { rank: 3, name: 'trader_jennifer', referrals: 180, mrr: 9400, score: 2980, badge: 'Elite', flag: '👑' },
                  { rank: 4, name: 'coin_pioneer', referrals: 84, mrr: 4500, score: 1420, badge: 'Partner' },
                  { rank: 5, name: 'scalp_ninja', referrals: 42, mrr: 2100, score: 980, badge: 'Creator' }
                ].map((user) => {
                  return (
                    <div 
                      key={user.rank} 
                      className="p-3 rounded-xl border border-slate-900/80 bg-slate-900/10 flex items-center justify-between gap-4 hover:border-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className={`w-5 h-5 rounded-full font-mono text-xs font-black flex items-center justify-center shrink-0 ${
                          user.rank === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          user.rank === 2 ? 'bg-slate-300/10 text-slate-300 border border-slate-300/20' :
                          user.rank === 3 ? 'bg-amber-700/10 text-amber-700 border border-amber-700/20' :
                          'text-slate-500'
                        }`}>
                          {user.rank}
                        </span>
                        <div className="truncate">
                          <span className="text-xs font-extrabold text-white block truncate font-mono">
                            {user.name} {user.flag && <span className="ml-0.5">{user.flag}</span>}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-wider">{user.badge}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-slate-200 font-mono block">{user.referrals} Active Refs</span>
                        <span className="text-[10px] text-emerald-400 font-mono block">€{user.mrr.toLocaleString()} MRR</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Personal Rank Footer */}
              <div className="pt-3.5 border-t border-slate-900 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 uppercase">Your Ranking position</span>
                <span className="text-blue-400 font-bold">#{leaderboardPosition} Global ({activeReferralsCount} Refs)</span>
              </div>

            </div>

          </div>

        </div>
      )}

      {activeTab === 'analytics' && (
        <div id="analytics-screen" className="space-y-8 animate-fade-in">
          
          {/* TRAFFIC METRICS BAR */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950 font-mono">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Total Traffic Clicks</span>
              <span className="text-2xl font-bold text-white block mt-1">{clickCount.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-400 mt-1 block">↑ 14.5% vs last week</span>
            </div>
            <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950 font-mono">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Click Through CTR</span>
              <span className="text-2xl font-bold text-cyan-400 block mt-1">{ctrValue}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Benchmark target: 8.0%</span>
            </div>
            <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950 font-mono">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Total Trial Signups</span>
              <span className="text-2xl font-bold text-blue-400 block mt-1">{referrals.filter(r => r.status === 'Trial').length} Accounts</span>
              <span className="text-[10px] text-blue-400 mt-1 block">Active funnel progression</span>
            </div>
            <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950 font-mono">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Average Revenue Per Ref</span>
              <span className="text-2xl font-bold text-emerald-400 block mt-1">€112.50</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Calculated ARPR index</span>
            </div>
          </div>

          {/* INTERACTIVE TRAFFIC CHART */}
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Click & Conversion Timelines</h3>
                <p className="text-xs text-slate-400">Track active impressions, clicks and trial registrations over time.</p>
              </div>
              <div className="flex gap-2 text-[10px] font-mono uppercase">
                <span className="px-2.5 py-1 rounded bg-blue-950 text-blue-400 border border-blue-500/20 font-bold">Impressions</span>
                <span className="px-2.5 py-1 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/10">Registrations</span>
              </div>
            </div>

            {/* Custom Interactive SVG Line Chart */}
            <div className="h-64 relative border border-slate-900 bg-black/30 rounded-xl p-4 overflow-hidden">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="area-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="area-cyan" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="10" x2="100" y2="10" stroke="#1e293b" strokeWidth="0.1" strokeDasharray="1" />
                <line x1="0" y1="20" x2="100" y2="20" stroke="#1e293b" strokeWidth="0.1" strokeDasharray="1" />
                <line x1="0" y1="30" x2="100" y2="30" stroke="#1e293b" strokeWidth="0.1" strokeDasharray="1" />

                {/* Area and Line for Impressions (Blue) */}
                <path
                  d="M 0,35 Q 15,25 30,28 T 60,15 T 85,18 T 100,8 L 100,40 L 0,40 Z"
                  fill="url(#area-blue)"
                />
                <path
                  d="M 0,35 Q 15,25 30,28 T 60,15 T 85,18 T 100,8"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="0.8"
                />

                {/* Area and Line for Registrations (Cyan) */}
                <path
                  d="M 0,38 Q 15,35 30,36 T 60,28 T 85,30 T 100,20 L 100,40 L 0,40 Z"
                  fill="url(#area-cyan)"
                />
                <path
                  d="M 0,38 Q 15,35 30,36 T 60,28 T 85,30 T 100,20"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="0.5"
                />
              </svg>

              {/* Chart Overlay Label Coordinates */}
              <div className="absolute top-2 left-4 text-[9px] font-mono text-slate-500 uppercase tracking-widest">July Performance Timeline</div>
              <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[8px] font-mono text-slate-500">
                <span>01 Jul</span>
                <span>02 Jul</span>
                <span>03 Jul</span>
                <span>04 Jul</span>
                <span>05 Jul</span>
                <span>Today</span>
              </div>
            </div>

          </div>

          {/* CONVERSION FUNNEL VISUALIZATION */}
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Conversion Funnel Breakdown</h3>
              <p className="text-xs text-slate-400">Map structural falloffs from direct referral impressions down to subscription upgrades.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              {/* STAGE 1 */}
              <div className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 space-y-2 relative">
                <div className="absolute top-0 right-0 w-8 h-8 rounded-bl-xl bg-blue-950/40 border-l border-b border-slate-900 text-[10px] font-mono text-slate-500 flex items-center justify-center font-bold">100%</div>
                <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold">Stage 1</span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Impressions / Clicks</h4>
                <p className="text-xl font-mono font-bold text-blue-400">4,280 Clicks</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">Unique traffic hits routed via your custom referral slug tracking widgets.</p>
              </div>

              {/* STAGE 2 */}
              <div className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 space-y-2 relative">
                <div className="absolute top-0 right-0 w-8 h-8 rounded-bl-xl bg-cyan-950/40 border-l border-b border-slate-900 text-[10px] font-mono text-cyan-400 flex items-center justify-center font-bold">14.2%</div>
                <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold">Stage 2</span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Registrations</h4>
                <p className="text-xl font-mono font-bold text-cyan-400">120 Accounts</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">Traders who successfully completed onboarding and connected active credentials.</p>
              </div>

              {/* STAGE 3 */}
              <div className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 space-y-2 relative">
                <div className="absolute top-0 right-0 w-8 h-8 rounded-bl-xl bg-emerald-950/40 border-l border-b border-slate-900 text-[10px] font-mono text-emerald-400 flex items-center justify-center font-bold">3.8%</div>
                <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold">Stage 3</span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Referrals</h4>
                <p className="text-xl font-mono font-bold text-emerald-400">{activeReferralsCount} Upgraded</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">Converted accounts currently retaining active Pro or Elite licences.</p>
              </div>

            </div>
          </div>

        </div>
      )}

      {activeTab === 'referrals' && (
        <div id="referrals-screen" className="space-y-6 animate-fade-in">
          
          {/* CONTROL BAR - Search, filters */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between bg-slate-950 border border-slate-900 p-4 rounded-xl">
            
            {/* Search inputs */}
            <div className="flex-1 flex items-center gap-2.5 bg-black border border-slate-900 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder="Search referral name, code, or user profile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-xs text-white outline-none placeholder-slate-600 font-mono"
              />
            </div>

            {/* Status Selector */}
            <div className="flex gap-2.5 flex-wrap">
              <div className="flex items-center gap-2 bg-black border border-slate-900 rounded-lg px-3 py-1.5 text-xs font-mono">
                <span className="text-[10px] text-slate-500 uppercase">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-transparent text-white outline-none cursor-pointer font-bold text-[10px] uppercase tracking-wider"
                >
                  <option value="All" className="bg-slate-950">All Statuses</option>
                  <option value="Active" className="bg-slate-950">Active</option>
                  <option value="Trial" className="bg-slate-950">Trial</option>
                  <option value="Cancelled" className="bg-slate-950">Cancelled</option>
                </select>
              </div>

              {/* Plan Selector */}
              <div className="flex items-center gap-2 bg-black border border-slate-900 rounded-lg px-3 py-1.5 text-xs font-mono">
                <span className="text-[10px] text-slate-500 uppercase">Licence:</span>
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value as any)}
                  className="bg-transparent text-white outline-none cursor-pointer font-bold text-[10px] uppercase tracking-wider"
                >
                  <option value="All" className="bg-slate-950">All Licenses</option>
                  <option value="Elite" className="bg-slate-950">Elite</option>
                  <option value="Pro" className="bg-slate-950">Pro</option>
                  <option value="Free" className="bg-slate-950">Free</option>
                </select>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 bg-black border border-slate-900 rounded-lg px-3 py-1.5 text-xs font-mono">
                <span className="text-[10px] text-slate-500 uppercase">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-white outline-none cursor-pointer font-bold text-[10px] uppercase tracking-wider"
                >
                  <option value="date" className="bg-slate-950">Join Date</option>
                  <option value="revenue" className="bg-slate-950">Revenue</option>
                  <option value="name" className="bg-slate-950">Alphabetic</option>
                </select>
              </div>
            </div>

          </div>

          {/* REFERRAL LEDGER TABLE */}
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 overflow-hidden shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Referral Registry Ledger</span>
              <span className="text-xs text-slate-400 font-mono font-bold">Showing {filteredReferrals.length} accounts</span>
            </div>

            {/* Scrollable table container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-900 text-[10px] text-slate-500 uppercase font-mono tracking-widest pb-3">
                    <th className="pb-3 font-semibold">User Reference</th>
                    <th className="pb-3 font-semibold">Joined Date</th>
                    <th className="pb-3 font-semibold">Selected License</th>
                    <th className="pb-3 font-semibold">State / Status</th>
                    <th className="pb-3 font-semibold text-right">MRR Yield</th>
                    <th className="pb-3 font-semibold text-right">Total Contributed</th>
                    <th className="pb-3 font-semibold text-right">Commissions (30%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60 font-mono">
                  {filteredReferrals.length > 0 ? (
                    filteredReferrals.map((ref) => {
                      return (
                        <tr key={ref.id} className="hover:bg-slate-900/10 transition-colors">
                          <td className="py-4">
                            <span className="font-extrabold text-white block">{ref.name}</span>
                            <span className="text-[9px] text-slate-500 block">ID: {ref.id}</span>
                          </td>
                          <td className="py-4 text-slate-400">{ref.dateJoined}</td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                              ref.plan === 'Elite' ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500/20' :
                              ref.plan === 'Pro' ? 'bg-blue-950/40 text-blue-400 border-blue-500/20' :
                              'bg-slate-900 text-slate-500 border-transparent'
                            }`}>
                              {ref.plan}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
                              ref.status === 'Active' ? 'text-emerald-400' :
                              ref.status === 'Trial' ? 'text-cyan-400' :
                              'text-red-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                ref.status === 'Active' ? 'bg-emerald-500' :
                                ref.status === 'Trial' ? 'bg-cyan-400' :
                                'bg-red-500'
                              }`} />
                              {ref.status}
                            </span>
                          </td>
                          <td className="py-4 text-right text-slate-300">
                            €{ref.status === 'Active' ? ref.monthlyRevenue : 0}
                          </td>
                          <td className="py-4 text-right text-slate-300 font-bold">
                            €{ref.lifetimeRevenue}
                          </td>
                          <td className="py-4 text-right text-emerald-400 font-bold">
                            €{(ref.lifetimeRevenue * 0.30).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                        No referrals found matching the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {activeTab === 'resources' && (
        <div id="resources-screen" className="space-y-8 animate-fade-in">
          
          {/* WEEKLY CONTENT IDEAS AI GENERATOR */}
          <div id="ai-generator-panel" className="p-6 rounded-2xl border border-slate-900 bg-slate-950 space-y-6 relative overflow-hidden">
            <div id="generator-blur-corner" className="absolute w-80 h-80 bg-blue-500/5 rounded-full blur-[90px] -bottom-24 -left-24 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-4 border-b border-slate-900/60 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3 h-3 animate-spin-slow" />
                    Custom weekly content strategist
                  </span>
                  {aiModelUsed && (
                    <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider bg-slate-900/60 border border-slate-850 px-2 py-0.5 rounded">
                      Model: {aiModelUsed} {aiIsSimulated && '(Fallback)'}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Weekly Social Content Ideas Generator</h3>
                <p className="text-xs text-slate-400">Instantly generate high-converting video scripts, hook angles, and tweets custom-aligned for AlphaQuant.</p>
              </div>

              {/* Selector for niche */}
              <div className="flex items-center gap-2 bg-black border border-slate-900 rounded-xl px-4 py-2.5 text-xs font-mono shrink-0">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Focus Asset Niche:</span>
                <select
                  value={focusMarket}
                  onChange={(e) => setFocusMarket(e.target.value)}
                  className="bg-transparent text-white outline-none cursor-pointer font-bold text-[10px] uppercase tracking-wider"
                  disabled={isGeneratingIdeas}
                >
                  <option value="Crypto (BTC/ETH Focus)" className="bg-slate-950">Crypto (BTC/ETH)</option>
                  <option value="Forex (EUR/USD, Gold)" className="bg-slate-950">Forex & Commodities</option>
                  <option value="Stocks & Indices" className="bg-slate-950">Equities & Indexes</option>
                  <option value="Institutional Psychology" className="bg-slate-950">Trader Psychology</option>
                </select>
              </div>
            </div>

            {/* Loader indicator */}
            {isGeneratingIdeas ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="w-10 h-10 text-blue-400 animate-spin" />
                <div className="text-center">
                  <span className="text-xs font-mono text-blue-400 block uppercase font-bold animate-pulse">Running Gemini content strategists...</span>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">Generating 50 personalized hooks, scripts and tweets aligned with AlphaQuant V3 parameters.</p>
                </div>
              </div>
            ) : aiIdeas ? (
              <div className="space-y-6">
                
                {/* Platform select tabs */}
                <div className="flex flex-wrap gap-2 pb-2">
                  {[
                    { id: 'tiktok', label: 'TikTok Clips', icon: '🎵' },
                    { id: 'reels', label: 'Reels Highlights', icon: '📸' },
                    { id: 'shorts', label: 'YouTube Shorts', icon: '📹' },
                    { id: 'x', label: 'X Threads', icon: '🐦' },
                    { id: 'linkedin', label: 'LinkedIn Insights', icon: '💼' }
                  ].map((p) => {
                    return (
                      <button
                        key={p.id}
                        onClick={() => setActiveIdeaPlatform(p.id as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-mono border font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                          activeIdeaPlatform === p.id
                            ? 'bg-blue-600 border-transparent text-white shadow-lg'
                            : 'bg-slate-900/30 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        <span className="mr-1.5">{p.icon}</span>
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                {/* Ideas list display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(aiIdeas[activeIdeaPlatform] || []).slice(0, 10).map((idea: any, idx: number) => {
                    return (
                      <div 
                        key={idx} 
                        className="p-5 rounded-xl border border-slate-900 bg-slate-900/10 space-y-4 relative overflow-hidden flex flex-col justify-between hover:border-slate-800 transition-colors"
                      >
                        <div className="absolute top-0 right-0 w-8 h-8 rounded-bl-xl bg-slate-950 border-l border-b border-slate-900/60 font-mono text-[9px] text-slate-500 flex items-center justify-center font-bold">#{idx + 1}</div>
                        
                        <div className="space-y-2">
                          {idea.hook && (
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">The Hook:</span>
                              <p className="text-xs text-white font-extrabold leading-relaxed">"{idea.hook}"</p>
                            </div>
                          )}

                          {idea.title && (
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest block font-bold">Topic headline:</span>
                              <p className="text-xs text-white font-extrabold leading-relaxed">{idea.title}</p>
                            </div>
                          )}

                          {idea.body && (
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Visual structure & Body:</span>
                              <p className="text-[11px] text-slate-300 leading-relaxed font-mono">{idea.body}</p>
                            </div>
                          )}

                          {idea.text && (
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">Post Copy:</span>
                              <p className="text-[11px] text-slate-200 leading-relaxed font-mono">{idea.text}</p>
                            </div>
                          )}

                          {idea.cta && (
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Call to action:</span>
                              <p className="text-[10px] text-slate-400 leading-relaxed italic">{idea.cta}</p>
                            </div>
                          )}

                          {idea.hashtags && (
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Suggested tags:</span>
                              <p className="text-[10px] text-blue-400 font-mono leading-relaxed">{idea.hashtags}</p>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-900/60 flex justify-end">
                          <button
                            onClick={() => {
                              const textToCopy = idea.text || `Hook: ${idea.hook || ''}\nBody: ${idea.body || ''}\nCTA: ${idea.cta || ''}`;
                              navigator.clipboard.writeText(textToCopy);
                              alert('Idea script copied to clipboard successfully!');
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-850 hover:border-slate-700 bg-slate-900/50 text-slate-400 hover:text-white text-[10px] font-mono transition-all cursor-pointer uppercase"
                          >
                            <Copy className="w-3 h-3" />
                            Copy Idea Script
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            ) : null}

          </div>

          {/* BRAND ASSET AND SCREENSHOT DOWNLOADS */}
          <div id="brand-asset-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* DOWNLOADABLE GRAPHIC ASSETS */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Brand Assets & Logos</h3>
                <p className="text-xs text-slate-400">Download high-definition AlphaQuant logos, mockups, wallpapers, and vectors.</p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { name: 'AlphaQuant_Logo_Suite.zip', size: '12.4 MB', type: 'Zip Archive' },
                  { name: 'Dark_Terminal_Mockups.fig', size: '24.8 MB', type: 'Figma File' },
                  { name: 'AI_Analysis_Walkthrough.mp4', size: '48.5 MB', type: 'Video Clip' },
                  { name: 'Risk_Lab_Explanations.pdf', size: '4.2 MB', type: 'PDF Document' }
                ].map((as, idx) => {
                  return (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-900 bg-slate-900/20 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold font-mono text-white block">{as.name}</span>
                        <span className="text-[9px] text-slate-500 font-mono block">{as.type} • {as.size}</span>
                      </div>
                      <button
                        onClick={() => alert(`Initiating download for asset template: ${as.name}. Keep publishing!`)}
                        className="p-2 border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PRE-WRITTEN TEMPLATES & HOOKS */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Recommended Copywriting Angles</h3>
                <p className="text-xs text-slate-400 font-mono text-slate-400">High-converting headlines matching Notion and Stripe partners styles.</p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { title: '"Why I thrown away standard charts..."', use: 'Best for Twitter / threads', angle: 'Positions AlphaQuant V3 as an elite decision-support system over retail indicator noise.' },
                  { title: '"The math behind blowing trading accounts"', use: 'Best for long-form LinkedIn', angle: 'Walks through risk management calculations, leading readers to our automated Risk Lab.' },
                  { title: '"I let an AI inspect BTC order flow..."', use: 'Best for Instagram / TikTok', angle: 'Visually captures high-timeframe BOS shift alignments.' }
                ].map((t, idx) => {
                  return (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-900 bg-slate-900/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t.title}</h4>
                        <span className="text-[8px] bg-slate-950 text-slate-400 border border-slate-850 px-1.5 py-0.5 rounded font-mono uppercase">{t.use}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{t.angle}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(t.title);
                          alert('Title angle copied!');
                        }}
                        className="text-[9px] font-mono text-blue-400 hover:text-white transition-colors cursor-pointer uppercase flex items-center gap-1 font-bold pt-1"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        Copy Headline
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {activeTab === 'community' && (
        <div id="community-screen" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* PRIVATE CREATOR CHAT - Col 2 */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-900 bg-slate-950 flex flex-col justify-between h-[520px]">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-900/60">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Ambassador Private Chat</h3>
                  <p className="text-xs text-slate-400">Share video concepts, trade reviews, and cross-promote content in real time.</p>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-950/20 border border-emerald-500/20 px-2.5 py-1 rounded text-[10px] font-mono font-bold text-emerald-400 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  {chatMessages.length + 4} Creators active
                </div>
              </div>

              {/* Message loop */}
              <div className="space-y-3.5 overflow-y-auto max-h-[340px] pr-2">
                {chatMessages.map((msg) => {
                  return (
                    <div key={msg.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${msg.avatarColor} shrink-0 font-mono uppercase`}>
                        {msg.username.slice(0, 2)}
                      </div>
                      <div className="space-y-1 flex-1 bg-slate-900/20 border border-slate-900 p-3 rounded-xl max-w-[85%]">
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="text-xs font-bold text-slate-200 block font-mono">
                            {msg.username} 
                            <span className="ml-1.5 text-[8px] bg-blue-950 text-blue-400 border border-blue-500/10 px-1.5 py-0.5 rounded uppercase font-extrabold tracking-wider">{msg.tier}</span>
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">{msg.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-mono">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Input bar */}
            <form onSubmit={handleSendChatMessage} className="pt-4 border-t border-slate-900 flex gap-2">
              <input
                type="text"
                placeholder="Type your ambassador message..."
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value)}
                className="flex-1 bg-black border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-white outline-none placeholder-slate-600 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>

          {/* EVENTS & WEBINARS - Col 1 */}
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 space-y-5 h-[520px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">News & Masterclasses</h3>
                <p className="text-xs text-slate-400 font-mono text-slate-400">Join elite growth lectures led by lead developers.</p>
              </div>

              {/* Webinar Event list */}
              <div className="space-y-3">
                {[
                  { title: 'Scaling SaaS Referral Channels', date: '08 Jul, 18:00 UTC', type: 'Masterclass', host: 'Josh (Ambassador Lead)' },
                  { title: 'AI Backtesting: Vision X Demo', date: '12 Jul, 16:30 UTC', type: 'Product Live', host: 'Lead Developer' },
                  { title: 'Converting High Net Worth Clients', date: '19 Jul, 19:00 UTC', type: 'Expert Lecture', host: 'VIP Desk Lead' }
                ].map((ev, idx) => {
                  return (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-900 bg-slate-900/10 space-y-2 hover:border-slate-800 transition-colors">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[8px] bg-blue-950 text-blue-400 border border-blue-500/10 px-1.5 py-0.5 rounded font-mono uppercase font-bold">{ev.type}</span>
                        <span className="text-[9px] font-mono text-slate-500">{ev.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{ev.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono block">Host: {ev.host}</span>
                      <button
                        onClick={() => alert(`You have registered for the masterclass: "${ev.title}". Check your private calendar!`)}
                        className="text-[9px] font-mono font-bold text-blue-400 hover:text-white transition-colors cursor-pointer uppercase block"
                      >
                        Register Seat
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feature request submissions */}
            <div className="pt-4 border-t border-slate-900 space-y-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold block">Suggest Marketing Resources</span>
              <p className="text-[10px] text-slate-400 leading-relaxed font-mono">Need specific screenshots, vectors, or mock accounts? Submit a supervisor request.</p>
              <button
                onClick={() => {
                  const input = prompt('What marketing resource or screenshot assets do you need?');
                  if (input) {
                    alert('Request submitted! Our media team will deploy resources shortly.');
                  }
                }}
                className="w-full py-2.5 border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-300 hover:text-white rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer"
              >
                Submit Asset Proposal
              </button>
            </div>

          </div>

        </div>
      )}

      {/* QR CODE MODAL POPUP */}
      {showQrCodeModal && (
        <div id="qrcode-modal" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl max-w-sm w-full space-y-6 relative text-center">
            
            <button 
              onClick={() => setShowQrCodeModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white bg-slate-900 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 pt-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">QR Code Generator</h4>
              <p className="text-xs text-slate-400 font-mono">Scan to access the AlphaQuant institutional terminal</p>
            </div>

            {/* Svg container */}
            <div className="w-48 h-48 mx-auto bg-black border border-slate-900 p-4 rounded-2xl flex items-center justify-center shadow-inner relative">
              <div className="absolute inset-0 bg-blue-500/5 rounded-2xl animate-pulse" />
              {renderQRCodeSvg()}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-slate-400 select-all block">https://{referralLink}</span>
              <button
                onClick={() => {
                  alert('Vector SVG QR Code exported successfully to assets! Go viral!');
                  setShowQrCodeModal(false);
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer"
              >
                Export Vector Graphic
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
