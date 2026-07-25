import React, { useState, useEffect, useCallback } from 'react';
import { Coin, CommentItem, User, WhaleTransaction, AdminConfig, Sentiment } from './types';
import { INITIAL_COINS, INITIAL_COMMENTS, INITIAL_WHALES, INITIAL_ADMIN_CONFIG } from './mockData';
import { Language, translations } from './translations';
import { Navbar } from './components/Navbar';
import { HeaderTicker } from './components/HeaderTicker';
import { AnnouncementBar } from './components/AnnouncementBar';
import { CoinHeader } from './components/CoinHeader';
import { ContractAndIpSection } from './components/ContractAndIpSection';
import { PriceChart } from './components/PriceChart';
import { MarketStatsGrid } from './components/MarketStatsGrid';
import { WhaleTracker } from './components/WhaleTracker';
import { PointsStakingCard } from './components/PointsStakingCard';
import { WhitepaperSection } from './components/WhitepaperSection';
import { CommunityComments } from './components/CommunityComments';
import { WalletModal } from './components/WalletModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AdminPanelModal } from './components/AdminPanelModal';

export default function App() {
  const [lang] = useState<Language>('en');
  const [coins, setCoins] = useState<Coin[]>(INITIAL_COINS);
  const [selectedCoin, setSelectedCoin] = useState<Coin>(INITIAL_COINS[0]);
  const [comments, setComments] = useState<CommentItem[]>(INITIAL_COMMENTS);
  const [whales, setWhales] = useState<WhaleTransaction[]>(INITIAL_WHALES);
  const [adminConfig, setAdminConfig] = useState<AdminConfig>(INITIAL_ADMIN_CONFIG);
  const [isSyncingDex, setIsSyncingDex] = useState<boolean>(false);

  // User session state
  const [user, setUser] = useState<User>({
    id: 'u_demo_101',
    username: 'CryptoTrader_007',
    email: 'user@triptocoin.io',
    walletAddress: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
    walletType: 'MetaMask',
    points: 1250,
    stakedPoints: 2500,
    rank: 'Gold Hodler',
    role: 'user',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
    createdAt: new Date().toISOString(),
    pointHistory: [
      {
        id: 'ph_1',
        type: 'DAILY_BONUS',
        points: 100,
        description: 'Daily Check-in Reward',
        timestamp: '1 day ago',
      },
      {
        id: 'ph_2',
        type: 'STAKE_ACTION',
        points: 2500,
        description: 'Staked points in TTC Vault',
        timestamp: '2 days ago',
      },
    ],
  });

  // Modal Open Controls
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Sync DexScreener handler
  const handleSyncDexScreener = useCallback(async (customUrl?: string) => {
    setIsSyncingDex(true);
    try {
      const payload = customUrl !== undefined ? { url: customUrl } : {};
      const res = await fetch('/api/dexscreener/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.coin) {
          setCoins([data.coin]);
          setSelectedCoin(data.coin);
        }
        if (data.config) {
          setAdminConfig(data.config);
        }
        return data;
      }
    } catch (err) {
      console.warn('DexScreener sync fallback to local mock state', err);
    } finally {
      setIsSyncingDex(false);
    }
  }, []);

  // Initial backend API sync & 30s live ticker interval
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCoins, resComments, resWhales, resConfig, resUser] = await Promise.all([
          fetch('/api/coins'),
          fetch(`/api/comments?coinId=${selectedCoin.id}`),
          fetch(`/api/coins/${selectedCoin.id}/whales`),
          fetch('/api/admin/config'),
          fetch('/api/user/me'),
        ]);

        if (resCoins.ok) {
          const data = await resCoins.json();
          setCoins(data);
          if (data[0]) setSelectedCoin(data[0]);
        }
        if (resComments.ok) setComments(await resComments.json());
        if (resWhales.ok) setWhales(await resWhales.json());
        if (resConfig.ok) setAdminConfig(await resConfig.json());
        if (resUser.ok) setUser(await resUser.json());
      } catch (err) {
        console.warn('API connection fallback to local state', err);
      }
    };

    fetchData();

    // Auto-refresh DexScreener price data every 30s
    const timer = setInterval(() => {
      handleSyncDexScreener();
    }, 30000);

    return () => clearInterval(timer);
  }, [handleSyncDexScreener]);

  useEffect(() => {
    const name = selectedCoin?.name || adminConfig?.coinName || 'TripToCoin';
    const symbol = selectedCoin?.symbol || adminConfig?.coinSymbol || 'TTC';
    const portal = adminConfig?.siteTitle || `${name} (${symbol}) Portal`;
    document.title = `${name} ($${symbol}) - ${portal}`;
  }, [selectedCoin?.name, selectedCoin?.symbol, adminConfig?.siteTitle, adminConfig?.coinName, adminConfig?.coinSymbol]);

  // Handlers
  const handleToggleLang = () => {
    // English only mode
  };

  const handlePostComment = async (text: string, sentiment: Sentiment) => {
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coinId: selectedCoin.id, text, sentiment }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [data.comment, ...prev]);
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  const handleVoteComment = async (commentId: string, voteType: 'up' | 'down') => {
    try {
      const res = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });
      if (res.ok) {
        const updated = await res.json();
        setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
      }
    } catch (err) {
      console.error('Failed to vote', err);
    }
  };

  const handleConnectWallet = async (
    address: string,
    walletType: any,
    walletChain: any,
    customBalance?: number
  ) => {
    try {
      const res = await fetch('/api/user/connect-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, walletType, walletChain, customBalance }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to connect wallet', err);
    }
  };

  const handleSaveConfig = async (newConfig: Partial<AdminConfig>) => {
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      if (res.ok) {
        const data = await res.json();
        setAdminConfig(data.config);
        if (data.coins) {
          setCoins(data.coins);
          if (data.coins[0]) {
            setSelectedCoin(data.coins[0]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to save admin config', err);
    }
  };

  const handleUpdateCoin = async (coinId: string, updatedCoin: Partial<Coin>) => {
    try {
      const res = await fetch(`/api/admin/coins/${coinId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCoin),
      });
      if (res.ok) {
        const data = await res.json();
        setCoins((prev) => prev.map((c) => (c.id === coinId ? data.coin : c)));
        if (selectedCoin.id === coinId) {
          setSelectedCoin(data.coin);
        }
        if (data.config) {
          setAdminConfig(data.config);
        }
      }
    } catch (err) {
      console.error('Failed to update coin', err);
    }
  };

  const handlePinComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}/pin`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
      }
    } catch (err) {
      console.error('Failed to pin comment', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  const handleAdminCreateComment = async (data: { username: string; text: string; sentiment: Sentiment; pinned: boolean }) => {
    try {
      const res = await fetch('/api/comments/admin-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.comments) setComments(result.comments);
      }
    } catch (err) {
      console.error('Failed to create admin comment', err);
    }
  };

  const handleEditComment = async (commentId: string, updated: { username?: string; text?: string; sentiment?: Sentiment; pinned?: boolean }) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.comments) setComments(result.comments);
      }
    } catch (err) {
      console.error('Failed to edit comment', err);
    }
  };

  const handleClearAllComments = async () => {
    try {
      const res = await fetch('/api/comments/all/clear', { method: 'DELETE' });
      if (res.ok) {
        setComments([]);
      }
    } catch (err) {
      console.error('Failed to clear comments', err);
    }
  };

  const scrollToStaking = () => {
    const el = document.getElementById('staking-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Banner & Ticker */}
      <AnnouncementBar
        bannerEn={adminConfig.announcementBanner}
        bannerBn={adminConfig.announcementBannerBn}
        lang={lang}
      />
      <HeaderTicker coins={coins} onSelectCoin={setSelectedCoin} />

      {/* Main Navbar */}
      <Navbar
        coins={coins}
        selectedCoin={selectedCoin}
        onSelectCoin={setSelectedCoin}
        user={user}
        adminConfig={adminConfig}
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenWallet={() => setIsWalletModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenStaking={scrollToStaking}
        onSyncDexScreener={handleSyncDexScreener}
        isSyncingDex={isSyncingDex}
      />

      {/* Primary Dashboard Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Token Header Banner */}
        <CoinHeader coin={selectedCoin} lang={lang} />

        {/* Market Stats Grid */}
        <MarketStatsGrid coin={selectedCoin} adminConfig={adminConfig} lang={lang} />

        {/* Interactive Price Chart (DexScreener Embed & VFX Area Chart) */}
        <PriceChart coin={selectedCoin} lang={lang} />

        {/* Contract Addresses & IP Node Monitor */}
        <ContractAndIpSection coin={selectedCoin} lang={lang} />

        {/* Project Purpose, Roadmap & Strategic Partnerships */}
        <WhitepaperSection coin={selectedCoin} adminConfig={adminConfig} lang={lang} />

        {/* Point & Token Staking System */}
        <div id="staking-section">
          <PointsStakingCard
            user={user}
            adminConfig={adminConfig}
            lang={lang}
            coinPrice={selectedCoin?.priceUsd}
            onUpdateUser={setUser}
            onOpenWallet={() => setIsWalletModalOpen(true)}
          />
        </div>

        {/* Live DexScreener Trades & Whale Movements */}
        <WhaleTracker
          coin={selectedCoin}
          whales={whales}
          lang={lang}
          onRefresh={handleSyncDexScreener}
          isRefreshing={isSyncingDex}
        />

        {/* Community Discussion & Comments */}
        <CommunityComments
          coin={selectedCoin}
          comments={comments}
          user={user}
          lang={lang}
          onPostComment={handlePostComment}
          onVoteComment={handleVoteComment}
        />
      </main>

      {/* Modals */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        user={user}
        lang={lang}
        onConnectWallet={handleConnectWallet}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        lang={lang}
      />

      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        coin={selectedCoin}
        comments={comments}
        adminConfig={adminConfig}
        lang={lang}
        onSaveConfig={handleSaveConfig}
        onUpdateCoin={handleUpdateCoin}
        onPinComment={handlePinComment}
        onDeleteComment={handleDeleteComment}
        onAdminCreateComment={handleAdminCreateComment}
        onEditComment={handleEditComment}
        onClearAllComments={handleClearAllComments}
        onSyncDexScreener={handleSyncDexScreener}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 px-4 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-cyan-300 text-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{adminConfig.siteTitle || 'TripToCoin Portal'}</span>
          </div>
          <p className="max-w-xl text-slate-400">
            DexScreener Live Synced Analytics, Solana SPL Smart Contracts, Multi-Node RPC Verification, Project Whitepaper & Gamified Point Staking.
          </p>
          <div className="text-[11px] text-slate-600 font-mono">
            © {new Date().getFullYear()} TripToCoin Foundation. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
