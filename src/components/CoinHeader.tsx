import React from 'react';
import { Coin } from '../types';
import { Language, translations } from '../translations';
import { ExternalLink, FileText, ShieldCheck, Send, Twitter, Github, TrendingUp, TrendingDown, Radio, Flame, Sparkles } from 'lucide-react';

interface CoinHeaderProps {
  coin: Coin;
  lang: Language;
}

export const CoinHeader: React.FC<CoinHeaderProps> = ({ coin, lang }) => {
  const t = translations[lang];

  const formatPrice = (val: number) => {
    if (val === 0) return '$0.00';
    if (val < 0.0001) return `$${val.toFixed(8)}`;
    if (val < 0.01) return `$${val.toFixed(6)}`;
    if (val < 1) return `$${val.toFixed(4)}`;
    return `$${val.toLocaleString()}`;
  };

  const isUp24h = coin.priceChange24h >= 0;
  const isUp1h = coin.priceChange1h >= 0;
  const isUp5m = (coin.priceChange5m ?? 0) >= 0;
  const bullishPct = coin.bullishPercentage ?? 75;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-slate-900/80 p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-xl">
      {/* Background VFX Ambient Aura */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Token Branding & Details */}
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="relative shrink-0">
            <img
              src={coin.logoUrl}
              alt={coin.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)]"
            />
            <div className="absolute -bottom-2 -right-2 p-1 rounded-full bg-slate-950 border border-cyan-400 text-[10px] text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {coin.name || 'Unlinked Token (Connect DexScreener Link)'}
              </h1>
              {coin.symbol ? (
                <span className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 font-mono text-xs font-bold uppercase tracking-wider">
                  ${coin.symbol}
                </span>
              ) : null}
              <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {coin.auditStatus}
              </span>
              {coin.dexScreenerUrl && (
                <a
                  href={coin.dexScreenerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs px-3 py-1 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/30 transition font-mono font-bold"
                >
                  <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>DexScreener Live</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {coin.description || 'No DexScreener link connected. Paste a DexScreener pair or token URL in the top bar or Admin Panel to auto-generate token name, symbol, description, contract addresses, and live chart metrics.'}
            </p>

            {/* Bullish vs Bearish Market Pressure Meter */}
            <div className="pt-1 flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <Flame className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span>{bullishPct}% Bullish Sentiment</span>
              </div>
              <div className="w-32 h-2 rounded-full bg-slate-800 overflow-hidden flex border border-slate-700">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-500"
                  style={{ width: `${bullishPct}%` }}
                />
                <div
                  className="bg-rose-500 h-full transition-all duration-500"
                  style={{ width: `${100 - bullishPct}%` }}
                />
              </div>
              {coin.lastSyncedAt && (
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  Synced: {coin.lastSyncedAt}
                </span>
              )}
            </div>

            {/* Social & Contract Links */}
            <div className="pt-2 flex items-center gap-3 flex-wrap text-xs">
              {coin.websiteUrl && (
                <a
                  href={coin.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-300 hover:text-cyan-300 font-medium transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t.officialWebsite}</span>
                </a>
              )}
              {coin.telegramUrl && (
                <a
                  href={coin.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition"
                  title="Telegram Community"
                >
                  <Send className="w-3.5 h-3.5" />
                </a>
              )}
              {coin.twitterUrl && (
                <a
                  href={coin.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition"
                  title="Twitter / X"
                >
                  <Twitter className="w-3.5 h-3.5" />
                </a>
              )}
              {coin.githubUrl && (
                <a
                  href={coin.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition"
                  title="GitHub Core Repository"
                >
                  <Github className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Live Price & VFX Stat Gauges */}
        <div className="flex flex-col lg:items-end justify-between border-t lg:border-t-0 border-slate-800 pt-5 lg:pt-0">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${coin.dexScreenerUrl ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`} />
            <span>{coin.dexScreenerUrl ? 'DexScreener Real-Time Price' : 'DexScreener Unsynced (No Link)'}</span>
          </div>

          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-3xl sm:text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300 tracking-tight">
              {coin.dexScreenerUrl ? formatPrice(coin.priceUsd) : '$ ---'}
            </span>
            {coin.dexScreenerUrl && coin.priceNative !== undefined && coin.priceNative > 0 && (
              <span className="text-xs sm:text-sm font-mono text-cyan-400/90 font-bold">
                ({coin.priceNative} {coin.nativeSymbol || 'SOL'})
              </span>
            )}
          </div>

          {/* 5m, 1h, 24h, 7d Changes */}
          {coin.dexScreenerUrl ? (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              {coin.priceChange5m !== undefined && (
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
                    isUp5m
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 font-sans">5m:</span>
                  {isUp5m ? '+' : ''}
                  {coin.priceChange5m}%
                </div>
              )}

              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
                  isUp1h
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                <span className="text-[10px] text-slate-400 font-sans">1h:</span>
                {isUp1h ? '+' : ''}
                {coin.priceChange1h}%
              </div>

              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-mono font-bold ${
                  isUp24h
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-400/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                }`}
              >
                {isUp24h ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span className="text-[10px] text-slate-300 font-sans">24h:</span>
                {isUp24h ? '+' : ''}
                {coin.priceChange24h}%
              </div>
            </div>
          ) : (
            <p className="mt-3 text-xs font-mono text-slate-400">
              Provide a DexScreener link in the Admin panel to load live chart & price stats
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
