import React from 'react';
import { Coin } from '../types';
import { TrendingUp, TrendingDown, Radio, Activity, Zap } from 'lucide-react';

interface HeaderTickerProps {
  coins: Coin[];
  onSelectCoin: (coin: Coin) => void;
}

export const HeaderTicker: React.FC<HeaderTickerProps> = ({ coins }) => {
  const coin = coins[0];
  if (!coin) return null;

  const isPositive = coin.priceChange24h >= 0;

  return (
    <div className="bg-slate-950/90 border-b border-cyan-500/20 py-1.5 px-4 text-xs overflow-hidden select-none backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar font-mono">
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span className="font-bold text-cyan-300 uppercase tracking-widest text-[10px]">
            TRIPTOCOIN LIVE FEED
          </span>
        </div>

        <div className="flex items-center gap-6 shrink-0 text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[10px]">PAIR:</span>
            <span className="font-bold text-white">{coin.dexScreenerUrl ? `${coin.symbol || 'TTC'}/${coin.nativeSymbol || 'SOL'}` : '---/---'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[10px]">PRICE USD:</span>
            <span className="font-bold text-cyan-300">
              {coin.dexScreenerUrl ? `$${coin.priceUsd < 0.01 ? coin.priceUsd.toFixed(6) : coin.priceUsd.toFixed(4)}` : '$ ---'}
            </span>
          </div>

          {coin.dexScreenerUrl && coin.priceNative !== undefined && coin.priceNative > 0 && (
            <div className="flex items-center gap-1.5 hidden sm:flex">
              <span className="text-slate-500 text-[10px]">SOL NATIVE:</span>
              <span className="font-bold text-cyan-300">{coin.priceNative} SOL</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[10px]">24H CHANGE:</span>
            {coin.dexScreenerUrl ? (
              <span
                className={`flex items-center font-bold ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5 inline" /> : <TrendingDown className="w-3 h-3 mr-0.5 inline" />}
                {isPositive ? '+' : ''}
                {coin.priceChange24h}%
              </span>
            ) : (
              <span className="font-bold text-slate-500">---</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 hidden md:flex">
            <span className="text-slate-500 text-[10px]">24H VOL:</span>
            <span className="font-bold text-slate-200">
              {coin.dexScreenerUrl ? `$${(coin.volume24hUsd / 1000000).toFixed(2)}M` : '$ ---'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 hidden lg:flex">
            <span className="text-slate-500 text-[10px]">LIQUIDITY:</span>
            <span className="font-bold text-purple-300">
              {coin.dexScreenerUrl ? `$${((coin.liquidityUsd || 0) / 1000000).toFixed(2)}M` : '$ ---'}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 shrink-0 text-[10px] text-cyan-400 bg-cyan-500/10 border border-cyan-400/30 px-2 py-0.5 rounded-full font-bold">
          <Zap className="w-3 h-3 text-cyan-400" />
          <span>DexScreener Real-Time Engine</span>
        </div>
      </div>
    </div>
  );
};
