import React, { useState } from 'react';
import { Coin, RoadmapItem, PartnerItem, AdminConfig } from '../types';
import { Language } from '../translations';
import { INITIAL_ROADMAP, INITIAL_PARTNERS } from '../mockData';
import { FileText, Compass, ShieldCheck, Zap, Globe, Layers, ChevronRight, CheckCircle2, Clock, Sparkles, X, Download } from 'lucide-react';

interface WhitepaperSectionProps {
  coin: Coin;
  adminConfig?: AdminConfig;
  lang: Language;
}

export const WhitepaperSection: React.FC<WhitepaperSectionProps> = ({ coin, adminConfig, lang }) => {
  const [isWhitepaperModalOpen, setIsWhitepaperModalOpen] = useState(false);
  const tokenName = coin.name || 'Token';
  const tokenSymbol = coin.symbol || 'TOKEN';

  const displayTotalSupply = adminConfig?.totalSupplyOverride || coin.totalSupply || 100000000;
  const displayCircSupply = adminConfig?.circulatingSupplyOverride || coin.circulatingSupply || 50000000;
  const displayApy = adminConfig?.stakingApyPercent || 18.5;
  const displayDexPair = adminConfig?.dexPairNameOverride || coin.dexPairName || `${coin.dexName || 'DEX'} ${coin.nativeSymbol || 'SOL'}/${tokenSymbol}`;

  return (
    <section className="space-y-6 my-8">
      {/* High-Tech VFX Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-slate-900/80 p-6 md:p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>{tokenName} Vision & Project Paper</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-indigo-300">
              Project Purpose, Future Roadmap & Partnerships
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {tokenName} ({tokenSymbol}) is a dedicated decentralized Web3 token powering instant global travel bookings, zero-fee cashback rewards, staking yields, and cross-chain liquidity.
            </p>
          </div>

          <button
            onClick={() => setIsWhitepaperModalOpen(true)}
            className="group relative inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] transition-all transform hover:-translate-y-0.5"
          >
            <FileText className="w-4 h-4 text-slate-950" />
            <span>Read Full Whitepaper</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Grid: Purpose & Key Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1 */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] group">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white mb-2">
            1. Global Travel & Web3 Payments
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Direct integration with international travel aggregators enabling instant ${tokenSymbol} hotel and flight reservations without banking fees.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-purple-500/40 transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] group">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white mb-2">
            2. Staking Vault & Point Yields
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Stake points and ${tokenSymbol} tokens in our secure vault to earn APY yield bonuses, unlock VIP ambassador badges, and govern pool allocations.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/40 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white mb-2">
            3. CertiK Audit & Node Transparency
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            CertiK audited smart contract logic backed by ultra-low 18ms latency validator and RPC node IP monitoring for full transparency.
          </p>
        </div>
      </div>

      {/* Strategic Roadmap */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-6">
          <Compass className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">
            Ecosystem Roadmap & Development Phases
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {INITIAL_ROADMAP.map((item, idx) => {
            const displayTitle = item.title.replace(/TripToCoin/g, tokenName);
            const rawBullets = item.items;
            const displayItems = rawBullets.map((bullet) =>
              bullet
                .replace(/TripToCoin/g, tokenName)
                .replace(/\$TTC/g, `$${tokenSymbol}`)
                .replace(/\bTTC\b/g, tokenSymbol)
            );

            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border relative overflow-hidden transition-all ${
                  item.status === 'completed'
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : item.status === 'in_progress'
                    ? 'border-cyan-500/40 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                    : 'border-slate-800 bg-slate-950/40'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                    {item.phase} — {item.period}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      item.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : item.status === 'in_progress'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                    {item.status === 'in_progress' && <Clock className="w-3 h-3" />}
                    <span>
                      {item.status === 'completed'
                        ? 'Completed'
                        : item.status === 'in_progress'
                        ? 'In Progress'
                        : 'Upcoming'}
                    </span>
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-3">
                  {displayTitle}
                </h4>

                <ul className="space-y-2">
                  {displayItems.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-cyan-400 font-bold mt-0.5">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strategic Partners */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">
              Strategic Partnerships & Integrations
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {INITIAL_PARTNERS.length} Network Alliances
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {INITIAL_PARTNERS.map((partner) => {
            const rawDesc = partner.description;
            const displayDesc = rawDesc
              .replace(/TripToCoin/g, tokenName)
              .replace(/\$TTC/g, `$${tokenSymbol}`)
              .replace(/\bTTC\b/g, tokenSymbol);

            return (
              <div
                key={partner.id}
                className="p-4 rounded-2xl border border-slate-800 bg-slate-950/50 hover:border-purple-500/30 transition-all flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-xl flex items-center justify-center shrink-0">
                  {partner.logo}
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-white truncate">{partner.name}</h4>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        partner.status === 'Active Partner'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : partner.status === 'In Discussion'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}
                    >
                      {partner.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono">{partner.category}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {displayDesc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WHITEPAPER FULL MODAL READER */}
      {isWhitepaperModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-[0_0_50px_rgba(6,182,212,0.2)] relative max-h-[85vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setIsWhitepaperModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-extrabold text-white">
                  {tokenName} (${tokenSymbol}) Official Whitepaper
                </h3>
                <p className="text-xs text-cyan-400 font-mono">Version 2.4 • Updated July 2026 • Verified Token Standard</p>
              </div>
            </div>

            {/* Whitepaper Document Content */}
            <div className="space-y-6 text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>1. Abstract & Core Vision</span>
                </h4>
                <p>
                  {tokenName} (${tokenSymbol}) bridges global travel commerce with decentralized Web3 finance. Built natively on decentralized blockchain protocols, {tokenSymbol} enables sub-second booking settlements, zero bank intermediary surcharges, and liquid staking rewards.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white text-sm text-cyan-400">
                  2. Tokenomics & Allocation Table
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Total Supply</span>
                    <span className="text-sm font-bold text-cyan-300">{displayTotalSupply.toLocaleString()} {tokenSymbol}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Circulating</span>
                    <span className="text-sm font-bold text-emerald-300">{displayCircSupply.toLocaleString()} {tokenSymbol}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Staking Yield</span>
                    <span className="text-sm font-bold text-purple-300">{displayApy}% APY</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Dex Pair</span>
                    <span className="text-sm font-bold text-amber-300">{displayDexPair}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm text-cyan-400">
                  3. Security Architecture & DexScreener Verification
                </h4>
                <p>
                  All smart contract functions are audited with multi-sig timelocks. Live price metrics, liquidity, buy/sell depth, and chart candles are synced directly from DexScreener DEX endpoints.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm text-cyan-400">
                  4. Official Contract Address
                </h4>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 break-all">
                  {coin.contractAddresses[0]?.chainName || 'Token Address'}: {coin.contractAddresses[0]?.address || coin.pairAddress || 'Contact Admin'}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-5">
              <span className="text-[11px] text-slate-500">{tokenName} Foundation © 2026</span>
              <button
                onClick={() => setIsWhitepaperModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
