import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { User, AdminConfig } from '../types';
import { USER_RANKS } from '../mockData';
import { Language, translations } from '../translations';
import { Coins, Sparkles, Award, ArrowUpRight, ArrowDownLeft, Gift, ShieldCheck, Wallet, RefreshCw, Radio } from 'lucide-react';

interface PointsStakingCardProps {
  user: User;
  adminConfig: AdminConfig;
  lang: Language;
  coinPrice?: number;
  onUpdateUser: (updatedUser: User) => void;
  onOpenWallet: () => void;
}

export const PointsStakingCard: React.FC<PointsStakingCardProps> = ({
  user,
  adminConfig,
  lang,
  coinPrice = 0.115,
  onUpdateUser,
  onOpenWallet,
}) => {
  const t = translations.en;
  const tokenName = adminConfig.coinName || 'Token';
  const tokenSymbol = adminConfig.coinSymbol || 'TOKEN';

  const [stakeAsset, setStakeAsset] = useState<'tokens' | 'points'>('tokens');
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake');
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Find current rank info
  const totalUserPoints = user.points + user.stakedPoints;
  const currentRankInfo =
    [...USER_RANKS].reverse().find((r) => totalUserPoints >= r.minPoints) || USER_RANKS[0];

  // Next rank info
  const nextRankInfo = USER_RANKS.find((r) => r.minPoints > totalUserPoints);
  const pointsToNextRank = nextRankInfo ? nextRankInfo.minPoints - totalUserPoints : 0;
  const progressPercent = nextRankInfo
    ? Math.min(100, Math.floor((totalUserPoints / nextRankInfo.minPoints) * 100))
    : 100;

  // Holding & Staked Token Balances
  const holdingsTtc = user.ttcTokenBalance ?? 18500;
  const stakedTtc = user.stakedTtcTokens ?? 5000;

  const handleStakeAction = async () => {
    const num = Math.floor(Number(stakeAmount));
    if (isNaN(num) || num <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (stakeAsset === 'tokens') {
        const res = await fetch('/api/user/stake-ttc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: num, action: activeTab }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage({ type: 'error', text: data.error || 'Token staking failed.' });
        } else {
          onUpdateUser(data.user);
          setStakeAmount('');
          setMessage({ type: 'success', text: data.message });
          if (activeTab === 'stake') {
            confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
          }
        }
      } else {
        const res = await fetch('/api/user/stake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: num, action: activeTab }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage({ type: 'error', text: data.error || 'Staking failed.' });
        } else {
          onUpdateUser(data.user);
          setStakeAmount('');
          setMessage({ type: 'success', text: data.message });
          if (activeTab === 'stake') {
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
          }
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network request failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDaily = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/user/claim-daily', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        onUpdateUser(data.user);
        setMessage({ type: 'success', text: data.message });
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Claim failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Claim request failed' });
    } finally {
      setLoading(false);
    }
  };

  const setPercentAmount = (pct: number) => {
    let maxVal = 0;
    if (stakeAsset === 'tokens') {
      maxVal = activeTab === 'stake' ? holdingsTtc : stakedTtc;
    } else {
      maxVal = activeTab === 'stake' ? user.points : user.stakedPoints;
    }
    setStakeAmount(Math.floor((maxVal * pct) / 100).toString());
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-amber-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10">
            <Coins className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-wide">
              {adminConfig.coinName ? `${adminConfig.coinName} Staking Vault` : t.pointsVault}
            </h2>
            <p className="text-xs text-amber-300/80 font-medium">
              Earn {adminConfig.stakingApyPercent}% APY Staking Yields on ${tokenSymbol} Tokens & Points Rewards
            </p>
          </div>
        </div>

        {/* Action Controls: Wallet Sync Banner & Claim Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenWallet}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-500/10 transition shadow-md cursor-pointer"
          >
            <Wallet className="w-4 h-4 text-cyan-400" />
            <span>
              {user.walletAddress
                ? `${user.walletChain === 'ethereum' ? 'EVM' : 'Solana'}: ${user.walletAddress.slice(0, 4)}...${user.walletAddress.slice(-4)}`
                : 'Connect Wallet (Sol/ETH)'}
            </span>
          </button>

          <button
            onClick={handleClaimDaily}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Gift className="w-4 h-4" />
            <span>{t.claimNow}</span>
          </button>
        </div>
      </div>

      {/* OPEN ON-CHAIN TOKEN HOLDINGS & STAKED BALANCE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* OPEN SHOW: Already Held $TTC Tokens on Chain */}
        <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-4 flex flex-col justify-between relative shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>${tokenSymbol} Token Holdings</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-500/30">
              {user.walletChain === 'ethereum' ? 'Ethereum EVM' : 'Solana SPL'}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-300">
              {holdingsTtc.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-cyan-400 font-bold">{tokenSymbol}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center justify-between">
            <span>≈ ${(holdingsTtc * coinPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
            <button
              onClick={onOpenWallet}
              className="text-[10px] text-cyan-400 hover:text-cyan-200 underline font-bold transition flex items-center gap-1 cursor-pointer"
              title="Verify or Scan a different wallet address"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>Verify Wallet</span>
            </button>
          </div>
        </div>

        {/* Staked $TTC Tokens */}
        <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between relative shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Staked ${tokenSymbol} Tokens
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
              {adminConfig.stakingApyPercent}% APY
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
              {stakedTtc.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-amber-400 font-bold">{tokenSymbol}</span>
          </div>
          <div className="text-[10px] text-amber-400/80 font-mono mt-1">
            Generating daily APY returns
          </div>
        </div>

        {/* Available Reward Points */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {t.availableBalance}
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
              {user.points.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-slate-400">PTS</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            Earned from claims & comments
          </div>
        </div>

        {/* Staked Points & User Rank */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t.yourRank}
            </span>
            <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${currentRankInfo.badgeColor}`}>
              {currentRankInfo.icon} {currentRankInfo.title}
            </span>
          </div>

          <div className="mt-2">
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span>{t.rankProgress}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Staking Input Form */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-inner">
        {/* Asset Type Selector: $TTC Tokens vs PTS Points */}
        <div className="flex items-center gap-2 mb-4 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              setStakeAsset('tokens');
              setStakeAmount('');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-2 ${
              stakeAsset === 'tokens'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>💎</span>
            <span>${tokenSymbol} Tokens Staking</span>
          </button>
          <button
            onClick={() => {
              setStakeAsset('points');
              setStakeAmount('');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-2 ${
              stakeAsset === 'points'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⭐</span>
            <span>PTS Points Staking</span>
          </button>
        </div>

        {/* Action Toggle: Stake vs Unstake */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => {
              setActiveTab('stake');
              setStakeAmount('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition ${
              activeTab === 'stake'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{t.stakeNow} ({stakeAsset === 'tokens' ? tokenSymbol : 'PTS'})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('unstake');
              setStakeAmount('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition ${
              activeTab === 'unstake'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>{t.unstakeNow} ({stakeAsset === 'tokens' ? tokenSymbol : 'PTS'})</span>
          </button>
        </div>

        {/* Input Field & Preset Percent Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder={
                stakeAsset === 'tokens'
                  ? `Enter $${tokenSymbol} token quantity...`
                  : t.enterPoints
              }
              className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 outline-none transition"
            />
            <span className="absolute right-3 top-2.5 text-xs font-mono font-bold text-amber-400">
              {stakeAsset === 'tokens' ? tokenSymbol : 'PTS'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => setPercentAmount(pct)}
                className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-bold transition flex-1 sm:flex-none cursor-pointer"
              >
                {pct}%
              </button>
            ))}
          </div>

          <button
            onClick={handleStakeAction}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
          >
            {loading
              ? 'Processing...'
              : activeTab === 'stake'
              ? `${t.stakeNow} (${stakeAsset === 'tokens' ? tokenSymbol : 'PTS'})`
              : `${t.unstakeNow} (${stakeAsset === 'tokens' ? tokenSymbol : 'PTS'})`}
          </button>
        </div>

        {/* Feedback Message */}
        {message && (
          <div
            className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}
          >
            <span>{message.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{message.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};
