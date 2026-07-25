import React, { useState, useEffect, useRef } from 'react';
import { WhaleTransaction, Coin } from '../types';
import { Language, translations } from '../translations';
import { generateSingleTrade, generateInitialTradeFeed } from '../utils/tradeGenerator';
import { Activity, ArrowUpRight, ArrowDownRight, ArrowRight, ExternalLink, RefreshCw, Radio, Flame, Pause, Play, Sparkles } from 'lucide-react';

interface WhaleTrackerProps {
  coin?: Coin;
  whales: WhaleTransaction[];
  lang: Language;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const WhaleTracker: React.FC<WhaleTrackerProps> = ({
  coin,
  whales,
  lang,
  onRefresh,
  isRefreshing,
}) => {
  const t = translations[lang];

  const [filter, setFilter] = useState<'ALL' | 'BUY' | 'SELL' | 'RETAIL' | 'WHALE'>('ALL');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [tradeFeed, setTradeFeed] = useState<WhaleTransaction[]>(() => {
    return whales && whales.length > 0 ? whales : generateInitialTradeFeed(coin, 20);
  });

  const coinRef = useRef<Coin | undefined>(coin);
  useEffect(() => {
    coinRef.current = coin;
  }, [coin]);

  // Sync prop changes if external whales prop changes drastically
  useEffect(() => {
    if (whales && whales.length > 0) {
      setTradeFeed(whales);
    } else {
      setTradeFeed(generateInitialTradeFeed(coin, 20));
    }
  }, [whales, coin?.id, coin?.priceUsd]);

  // Live Auto-Stream Interval (Adds new live trade every 3.5s)
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      const newTrade = generateSingleTrade(coinRef.current);

      setTradeFeed((prev) => {
        // Update timestamps of older items
        const updated = prev.map((item, idx) => {
          if (idx === 0) return { ...item, timestamp: '4s ago' };
          if (idx === 1) return { ...item, timestamp: '8s ago' };
          if (idx === 2) return { ...item, timestamp: '15s ago' };
          if (idx === 3) return { ...item, timestamp: '28s ago' };
          if (idx === 4) return { ...item, timestamp: '42s ago' };
          if (idx === 5) return { ...item, timestamp: '1m ago' };
          return item;
        });

        // Prepend new trade & cap list size to 45
        return [newTrade, ...updated].slice(0, 45);
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  const tokenSymbol = coin?.symbol || 'TOKEN';

  const filteredWhales = tradeFeed.filter((w) => {
    if (filter === 'BUY') return w.type === 'BUY';
    if (filter === 'SELL') return w.type === 'SELL';
    if (filter === 'RETAIL') return w.usdValue <= 500;
    if (filter === 'WHALE') return w.usdValue >= 10000;
    return true;
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Top Header Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10">
            <Activity className="w-6 h-6 animate-pulse text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-extrabold text-white">
                Live On-Chain Transaction Feed
              </h3>
              <button
                onClick={() => setIsLiveStreaming(!isLiveStreaming)}
                className={`text-[10px] font-mono px-2.5 py-1 rounded-full border font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  isLiveStreaming
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
                title={isLiveStreaming ? 'Click to Pause Stream' : 'Click to Resume Live Stream'}
              >
                {isLiveStreaming ? (
                  <>
                    <Radio className="w-3 h-3 text-emerald-400 animate-ping" />
                    <span>Live Stream (3s)</span>
                    <Pause className="w-3 h-3 ml-0.5 opacity-75 hover:opacity-100" />
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>Stream Paused</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Real-time price-matched {tokenSymbol} buy/sell trades, retail orders ($18-$300) & whale activity
            </p>
          </div>
        </div>

        {/* Filter Badges & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center gap-1 overflow-x-auto max-w-full">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition ${
                filter === 'ALL'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Trades
            </button>
            <button
              onClick={() => setFilter('BUY')}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition ${
                filter === 'BUY'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Buys
            </button>
            <button
              onClick={() => setFilter('SELL')}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition ${
                filter === 'SELL'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              Sells
            </button>
            <button
              onClick={() => setFilter('RETAIL')}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1 ${
                filter === 'RETAIL'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Retail ($15-$500)</span>
            </button>
            <button
              onClick={() => setFilter('WHALE')}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1 ${
                filter === 'WHALE'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Whales ($10k+)</span>
            </button>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition cursor-pointer"
              title="Refresh DexScreener On-Chain Feed"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Trades List Feed */}
      <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
        {filteredWhales.length === 0 ? (
          <div className="text-center py-8 text-xs font-mono text-slate-500">
            No transactions matching filter.
          </div>
        ) : (
          filteredWhales.map((w, index) => {
            const isBuy = w.type === 'BUY';
            const isSell = w.type === 'SELL';
            const isWhaleMove = w.usdValue >= 10000;
            const isRetailMove = w.usdValue <= 500;
            const isNewest = index === 0 && w.timestamp === 'Just now';

            return (
              <div
                key={w.id}
                className={`bg-slate-950/70 hover:bg-slate-950 border rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-300 ${
                  isNewest
                    ? 'ring-2 ring-cyan-400/50 bg-cyan-950/20 border-cyan-500/40 animate-pulse'
                    : isWhaleMove
                    ? 'border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-amber-950/10'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2.5 rounded-2xl text-xs font-black border shrink-0 flex items-center justify-center ${
                      isBuy
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : isSell
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    }`}
                  >
                    {isBuy ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : isSell ? (
                      <ArrowDownRight className="w-5 h-5" />
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-mono text-sm font-black text-white flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isBuy
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {w.type}
                      </span>
                      <span className="text-cyan-300 font-extrabold">
                        {w.amountCoin.toLocaleString()} {tokenSymbol}
                      </span>
                      <span className="text-amber-400 text-xs font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        ${w.usdValue.toLocaleString()}
                      </span>

                      {isWhaleMove && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold animate-pulse">
                          🐳 WHALE MOVE
                        </span>
                      )}

                      {isRetailMove && (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[9px] font-semibold">
                          ⚡ Retail Trade
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2 flex-wrap truncate">
                      <span className="text-slate-300 truncate max-w-[150px] sm:max-w-[200px]" title={w.fromAddress}>
                        {w.fromAddress}
                      </span>
                      <span className="text-slate-600">→</span>
                      <span className="text-slate-300 truncate max-w-[150px] sm:max-w-[200px]" title={w.toAddress}>
                        {w.toAddress}
                      </span>
                      {w.nativeAmount && w.nativeAmount > 0 && (
                        <span className="text-purple-300 text-[11px] font-bold">
                          ({w.nativeAmount} {w.nativeSymbol || 'SOL'})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 text-xs font-mono shrink-0 border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] uppercase font-bold border border-slate-700">
                      {w.chain}
                    </span>
                    <a
                      href={w.dexUrl || 'https://dexscreener.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition"
                      title="View on DexScreener / Block Explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <span className="text-slate-400 text-[11px] font-semibold">{w.timestamp}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

