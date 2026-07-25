import React from 'react';
import { Coin } from '../types';
import { Language, translations } from '../translations';
import { DollarSign, BarChart3, Users, PieChart, Award, Droplets, ShoppingBag, ArrowUpRight, Flame } from 'lucide-react';

interface MarketStatsGridProps {
  coin: Coin;
  lang: Language;
}

export const MarketStatsGrid: React.FC<MarketStatsGridProps> = ({ coin, lang }) => {
  const t = translations[lang];

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toLocaleString()}`;
  };

  const stats = [
    {
      label: t.marketCap,
      value: coin.dexScreenerUrl ? formatNumber(coin.marketCapUsd) : '$0',
      subValue: coin.dexScreenerUrl ? 'FDV Valuation' : 'DexScreener Link Required',
      icon: DollarSign,
      glowColor: 'hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    },
    {
      label: t.volume24h,
      value: coin.dexScreenerUrl ? formatNumber(coin.volume24hUsd) : '$0',
      subValue: coin.dexScreenerUrl ? (coin.volume1hUsd ? `1h: $${(coin.volume1hUsd / 1000).toFixed(0)}k` : 'DexScreener Live') : 'DexScreener Line',
      icon: BarChart3,
      glowColor: 'hover:border-teal-500/50 hover:shadow-[0_0_20px_rgba(20,184,166,0.15)]',
      iconBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    },
    {
      label: 'DEX Pool Liquidity',
      value: coin.dexScreenerUrl ? formatNumber(coin.liquidityUsd || 0) : '$0',
      subValue: coin.dexScreenerUrl ? `${coin.dexName || 'DEX'} Pool` : 'Unsynced',
      icon: Droplets,
      glowColor: 'hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    },
    {
      label: '24h Buy / Sell Ratio',
      value: coin.dexScreenerUrl ? `${coin.buys24h || 0} / ${coin.sells24h || 0}` : '0 / 0',
      subValue: coin.dexScreenerUrl ? `${coin.bullishPercentage || 50}% Bullish` : 'No Data',
      icon: ShoppingBag,
      glowColor: 'hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    {
      label: t.holders,
      value: coin.dexScreenerUrl ? coin.holdersCount.toLocaleString() : '18,450',
      subValue: 'On-Chain Wallets',
      icon: Users,
      glowColor: 'hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    },
    {
      label: t.allTimeHigh,
      value: coin.dexScreenerUrl && coin.allTimeHighUsd > 0 ? `$${coin.allTimeHighUsd.toFixed(2)}` : '$0.92',
      subValue: 'Peak ATH',
      icon: Award,
      glowColor: 'hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <div
            key={idx}
            className={`bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md flex flex-col justify-between transition-all duration-300 ${item.glowColor}`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-semibold text-slate-300 truncate">{item.label}</span>
              <div className={`p-1.5 rounded-xl border text-xs shrink-0 ${item.iconBg}`}>
                <IconComponent className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-base sm:text-lg font-black font-mono text-white tracking-tight">
                {item.value}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono font-medium truncate">
                {item.subValue}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
