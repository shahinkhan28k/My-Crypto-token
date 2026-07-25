import React, { useState, useEffect } from 'react';
import { Coin } from '../types';
import { Language } from '../translations';
import { LineChart, Radio, ExternalLink, Maximize2, Minimize2, Eye, Sparkles } from 'lucide-react';

interface PriceChartProps {
  coin: Coin;
  lang?: Language;
}

export const PriceChart: React.FC<PriceChartProps> = ({ coin }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showTradesInfo, setShowTradesInfo] = useState(false);

  const hasLink = Boolean(coin.dexScreenerUrl && coin.dexScreenerUrl.trim() !== '');
  const baseUrl = coin.dexScreenerUrl || '';
  
  // Clean DexScreener URL based on settings
  const dexEmbedUrl = showTradesInfo
    ? `${baseUrl}?embed=1&theme=dark&trades=1&info=1`
    : `${baseUrl}?embed=1&theme=dark&trades=0&info=0`;

  // Handle ESC key to exit full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  if (!hasLink) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center space-y-4 shadow-xl backdrop-blur-xl my-4">
        <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
          <LineChart className="w-8 h-8 opacity-60" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-xl font-bold text-white">কোনো DexScreener কয়েন লিংক যুক্ত নেই</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Admin Dashboard (DexScreener Live Sync) অপশনে গিয়ে যেকোনো DexScreener pair/token লিংক স্ক্যান ও সেভ করুন। লিংক দেওয়ার সাথে সাথেই এখানে সেই কয়েনের লাইভ চার্ট দেখাবে।
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-slate-900/80 p-5 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-xl">
        {/* Chart Top Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <LineChart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Live DexScreener Price Chart
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>${coin.symbol || 'TTC'} / USD</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Candlestick Chart View • DexScreener Sync
              </p>
            </div>
          </div>

          {/* Action Toolbar Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Toggle Candles Only vs Full Info */}
            <button
              onClick={() => setShowTradesInfo(!showTradesInfo)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition ${
                !showTradesInfo
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Toggle between Candles Only and Full DexScreener Controls"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{!showTradesInfo ? 'Candles Only (Clean)' : 'Show Txns & Info'}</span>
            </button>

            {/* Full Screen Button */}
            <button
              onClick={() => setIsFullScreen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-mono text-xs font-black hover:brightness-110 transition shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <Maximize2 className="w-3.5 h-3.5 text-slate-950" />
              <span>Full Screen</span>
            </button>

            {/* Open in DexScreener Link */}
            <a
              href={baseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 font-mono text-xs font-bold transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>DexScreener</span>
            </a>
          </div>
        </div>

        {/* DexScreener Interactive Embed Container (Candles Only) */}
        <div className="w-full h-[540px] rounded-2xl overflow-hidden border border-cyan-500/30 bg-slate-950 relative shadow-2xl">
          <iframe
            src={dexEmbedUrl}
            title="DexScreener Live Candlestick Price Chart"
            className="w-full h-full border-0"
            allow="clipboard-write"
          />
        </div>
      </div>

      {/* Full Screen Viewport Modal Overlay */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col p-4 sm:p-6 animate-fadeIn">
          {/* Full Screen Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-cyan-500/30 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span>${coin.symbol || 'TTC'} Candlestick Chart — Full Screen Mode</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono uppercase">
                    Live
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Press ESC or click exit to close full view
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTradesInfo(!showTradesInfo)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-mono text-xs font-bold"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>{!showTradesInfo ? 'Candles Only' : 'Show All'}</span>
              </button>

              <button
                onClick={() => setIsFullScreen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-mono text-xs font-bold transition"
              >
                <Minimize2 className="w-4 h-4" />
                <span>Exit Full Screen</span>
              </button>
            </div>
          </div>

          {/* Full Screen Chart Iframe Container */}
          <div className="flex-1 w-full rounded-2xl overflow-hidden border border-cyan-500/40 bg-slate-950 relative shadow-[0_0_50px_rgba(6,182,212,0.2)]">
            <iframe
              src={dexEmbedUrl}
              title="DexScreener Full Screen Candlestick Chart"
              className="w-full h-full border-0"
              allow="clipboard-write"
            />
          </div>
        </div>
      )}
    </>
  );
};

