import React from 'react';
import { Search, Shield, Coins, Wallet, Globe, UserCheck, Settings, Sparkles, RefreshCw, Radio } from 'lucide-react';
import { Coin, User, AdminConfig } from '../types';
import { Language, translations } from '../translations';

interface NavbarProps {
  coins: Coin[];
  selectedCoin: Coin;
  onSelectCoin: (coin: Coin) => void;
  user: User;
  adminConfig?: AdminConfig;
  lang: Language;
  onToggleLang: () => void;
  onOpenWallet: () => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onOpenStaking: () => void;
  onSyncDexScreener?: () => void;
  isSyncingDex?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  coins,
  selectedCoin,
  onSelectCoin,
  user,
  adminConfig,
  lang,
  onToggleLang,
  onOpenWallet,
  onOpenProfile,
  onOpenAdmin,
  onOpenStaking,
  onSyncDexScreener,
  isSyncingDex = false,
}) => {
  const t = translations[lang];

  const brandTitle = adminConfig?.siteTitle || t.appName;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-cyan-500/20 text-slate-100 px-4 py-3 shadow-[0_4px_30px_rgba(6,182,212,0.1)]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Dedicated Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onSelectCoin(coins[0])}>
          <div className="relative flex items-center justify-center min-w-[2.5rem] h-10 px-2 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-indigo-600 shadow-[0_0_20px_rgba(6,182,212,0.5)] text-slate-950 font-black text-sm tracking-tight ring-1 ring-cyan-400/50 group-hover:scale-105 transition-transform uppercase">
            <span>{adminConfig?.coinSymbol || selectedCoin?.symbol || 'DEX'}</span>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[8px] font-bold text-slate-950">
              ✓
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-extrabold text-lg text-white tracking-wide">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300">
                {brandTitle || 'Crypto DEX Portal'}
              </span>
              <span className="px-2 py-0.5 text-[9px] uppercase font-mono tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 rounded-full font-bold">
                OFFICIAL PORTAL
              </span>
            </div>
            <p className="text-[11px] text-cyan-400/80 font-mono hidden sm:block">
              {selectedCoin?.name ? `${selectedCoin.name} ($${selectedCoin.symbol}) Hub` : 'Dynamic DexScreener Auto-Portal'}
            </p>
          </div>
        </div>

        {/* DexScreener Live Sync Badge & Quick Sync Trigger */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-xs">
          <Radio className={`w-3.5 h-3.5 ${selectedCoin?.dexScreenerUrl ? 'text-emerald-400 animate-ping' : 'text-amber-400'}`} />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-mono">DEX Link Status:</span>
            <span className="text-[11px] font-bold text-cyan-300 font-mono flex items-center gap-1">
              {selectedCoin?.dexScreenerUrl ? `Synced: ${selectedCoin.pairAddress ? `${selectedCoin.pairAddress.slice(0, 6)}...${selectedCoin.pairAddress.slice(-4)}` : 'Active'}` : 'No Link Synced'}
            </span>
          </div>
          {onSyncDexScreener && (
            <button
              onClick={() => onSyncDexScreener()}
              disabled={isSyncingDex}
              className="ml-2 p-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition flex items-center gap-1 font-mono text-[11px]"
              title="Sync DexScreener Link Now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDex ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Sync</span>
            </button>
          )}
        </div>

        {/* Right Controls: Points, Wallet, Profile, Language & Admin */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Staking / Points Pill */}
          <button
            onClick={onOpenStaking}
            className="group relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-500/30 hover:border-amber-400 text-amber-300 font-semibold text-xs transition shadow-[0_0_15px_rgba(245,158,11,0.1)]"
          >
            <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
            <div className="flex items-center gap-1">
              <span className="font-mono text-sm font-extrabold text-amber-300">
                {(user.points + user.stakedPoints).toLocaleString()}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-amber-400/80">PTS</span>
            </div>
            <Sparkles className="w-3 h-3 text-amber-400 opacity-70 group-hover:opacity-100" />
          </button>

          {/* Web3 Wallet Connect */}
          <button
            onClick={onOpenWallet}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              user.walletAddress
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 border-cyan-400/50 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>
              {user.walletAddress
                ? `${user.walletAddress.slice(0, 4)}...${user.walletAddress.slice(-4)}`
                : t.connectWallet}
            </span>
          </button>

          {/* Language Indicator */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>English</span>
          </div>

          {/* User Profile */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition"
            title="User Profile"
          >
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">{user.username}</span>
          </button>

          {/* Admin Control */}
          <button
            onClick={onOpenAdmin}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
            title={t.adminPanel}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
