import React, { useState } from 'react';
import { Coin, CommentItem, AdminConfig, Sentiment } from '../types';
import { Language, translations } from '../translations';
import { X, Settings, ShieldCheck, Pin, Trash2, Save, Radio, RefreshCw, Sparkles, Check, Plus, Edit2 } from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  coin: Coin;
  comments: CommentItem[];
  adminConfig: AdminConfig;
  lang: Language;
  onSaveConfig: (newConfig: Partial<AdminConfig>) => Promise<void>;
  onUpdateCoin: (coinId: string, updatedCoin: Partial<Coin>) => Promise<void>;
  onPinComment: (commentId: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onAdminCreateComment?: (data: { username: string; text: string; sentiment: Sentiment; pinned: boolean }) => Promise<void>;
  onEditComment?: (commentId: string, updated: { username?: string; text?: string; sentiment?: Sentiment; pinned?: boolean }) => Promise<void>;
  onClearAllComments?: () => Promise<void>;
  onSyncDexScreener?: (url?: string) => Promise<void>;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  coin,
  comments,
  adminConfig,
  lang,
  onSaveConfig,
  onUpdateCoin,
  onPinComment,
  onDeleteComment,
  onAdminCreateComment,
  onEditComment,
  onClearAllComments,
  onSyncDexScreener,
}) => {
  if (!isOpen) return null;

  const t = translations[lang];

  const [unlocked, setUnlocked] = useState<boolean>(true);
  const [passcode, setPasscode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dex' | 'coin' | 'comments' | 'settings'>('dex');

  // Form states for DexScreener Sync
  const [dexUrlInput, setDexUrlInput] = useState<string>(
    coin.dexScreenerUrl || adminConfig.dexScreenerUrl || ''
  );
  const [syncingDex, setSyncingDex] = useState<boolean>(false);

  // Form states for Coin Edit & Global Brand
  const [coinName, setCoinName] = useState<string>(adminConfig.coinName || coin.name || '');
  const [coinSymbol, setCoinSymbol] = useState<string>(adminConfig.coinSymbol || coin.symbol || '');
  const [coinDesc, setCoinDesc] = useState<string>(coin.description || '');
  const [coinDescBn, setCoinDescBn] = useState<string>(coin.descriptionBn || '');

  // Form states for Admin Config & Tokenomics
  const [siteTitle, setSiteTitle] = useState<string>(adminConfig.siteTitle || 'Crypto Analytics & DEX Portal');
  const [siteTitleBn, setSiteTitleBn] = useState<string>(adminConfig.siteTitleBn || 'ক্রিপ্টো অ্যানালিটিক্স ও ডেক্স পোর্টাল');
  const [announcementEn, setAnnouncementEn] = useState<string>(adminConfig.announcementBanner || '');
  const [announcementBn, setAnnouncementBn] = useState<string>(adminConfig.announcementBannerBn || '');
  const [apy, setApy] = useState<number>(adminConfig.stakingApyPercent || 18.5);

  const [totalSupplyInput, setTotalSupplyInput] = useState<string>(
    adminConfig.totalSupplyOverride
      ? String(adminConfig.totalSupplyOverride)
      : coin.totalSupply
      ? String(coin.totalSupply)
      : '100000000'
  );
  const [circulatingSupplyInput, setCirculatingSupplyInput] = useState<string>(
    adminConfig.circulatingSupplyOverride
      ? String(adminConfig.circulatingSupplyOverride)
      : coin.circulatingSupply
      ? String(coin.circulatingSupply)
      : '50000000'
  );
  const [dexPairNameInput, setDexPairNameInput] = useState<string>(
    adminConfig.dexPairNameOverride ||
      coin.dexPairName ||
      `${coin.dexName || 'DEX'} ${coin.nativeSymbol || 'SOL'}/${coin.symbol || 'TOKEN'}`
  );

  const [saving, setSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form states for Comment Management
  const [showAddComment, setShowAddComment] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('Admin_Official');
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [newCommentSentiment, setNewCommentSentiment] = useState<Sentiment>('bullish');
  const [newCommentPinned, setNewCommentPinned] = useState<boolean>(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState<string>('');
  const [editText, setEditText] = useState<string>('');
  const [editSentiment, setEditSentiment] = useState<Sentiment>('bullish');

  React.useEffect(() => {
    const activeN = coin.name || adminConfig.coinName || '';
    const activeS = coin.symbol || adminConfig.coinSymbol || '';
    setCoinName(activeN);
    setCoinSymbol(activeS);
    setCoinDesc(coin.description || (activeN ? `Official decentralized trading token for ${activeN} (${activeS}).` : ''));
    setCoinDescBn(coin.descriptionBn || (activeN ? `${activeN} (${activeS}) সুনিরাপদ ও গতিশীল ডেক্স টোকেন।` : ''));
    setSiteTitle(adminConfig.siteTitle || (activeN ? `${activeN} (${activeS}) Portal` : 'Crypto Analytics & DEX Portal'));
    setSiteTitleBn(adminConfig.siteTitleBn || (activeN ? `${activeN} (${activeS}) পোর্টাল` : 'ক্রিপ্টো অ্যানালিটিক্স ও ডেক্স পোর্টাল'));
    setAnnouncementEn(adminConfig.announcementBanner || (activeN ? `🚀 Live Trading Active for ${activeN} (${activeS})!` : ''));
    setAnnouncementBn(adminConfig.announcementBannerBn || (activeN ? `🚀 ${activeN} (${activeS}) এর লাইভ ট্রেডিং শুরু হয়েছে!` : ''));
    if (coin.totalSupply) setTotalSupplyInput(String(coin.totalSupply));
    if (coin.circulatingSupply) setCirculatingSupplyInput(String(coin.circulatingSupply));
    if (coin.dexPairName) setDexPairNameInput(coin.dexPairName);
  }, [coin.name, coin.symbol, coin.description, coin.descriptionBn, coin.totalSupply, coin.circulatingSupply, coin.dexPairName, adminConfig.coinName, adminConfig.coinSymbol, adminConfig.siteTitle, adminConfig.siteTitleBn, adminConfig.announcementBanner, adminConfig.announcementBannerBn]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'admin123' || passcode === 'admin') {
      setUnlocked(true);
    } else {
      alert('Invalid admin key. Default key is: admin123');
    }
  };

  const handleDexSync = async () => {
    if (!onSyncDexScreener) return;
    setSyncingDex(true);
    const trimmed = dexUrlInput.trim();
    try {
      const syncRes: any = await onSyncDexScreener(trimmed);
      let activeName = coinName;
      let activeSymbol = coinSymbol;

      if (syncRes && syncRes.coin) {
        if (syncRes.coin.name) {
          activeName = syncRes.coin.name;
          setCoinName(syncRes.coin.name);
        }
        if (syncRes.coin.symbol) {
          activeSymbol = syncRes.coin.symbol;
          setCoinSymbol(syncRes.coin.symbol);
        }
        if (syncRes.coin.totalSupply) {
          setTotalSupplyInput(String(syncRes.coin.totalSupply));
        }
        if (syncRes.coin.circulatingSupply) {
          setCirculatingSupplyInput(String(syncRes.coin.circulatingSupply));
        }
        if (syncRes.coin.dexPairName) {
          setDexPairNameInput(syncRes.coin.dexPairName);
        }
      }

      await onSaveConfig({
        dexScreenerUrl: trimmed,
        coinName: activeName,
        coinSymbol: activeSymbol,
      });

      await onUpdateCoin(coin.id, {
        name: activeName,
        symbol: activeSymbol,
        dexScreenerUrl: trimmed,
      });

      if (!trimmed) {
        setStatusMessage(`লিংক ফাঁকা সেভ হয়েছে। কয়েনের নাম (${activeName}) সেভ আছে।`);
      } else {
        setStatusMessage(`DexScreener API থেকে কয়েনের নাম (${activeName}), সিম্বল ($${activeSymbol}) ও টোকেনমিক্স অটোমেটিক আপডেট হয়েছে!`);
      }
    } catch (err: any) {
      setStatusMessage('Error syncing DexScreener: ' + err.message);
    } finally {
      setSyncingDex(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleSaveCoin = async () => {
    setSaving(true);
    const numTotal = Number(totalSupplyInput.replace(/,/g, '')) || coin.totalSupply || 100000000;
    const numCirc = Number(circulatingSupplyInput.replace(/,/g, '')) || coin.circulatingSupply || 50000000;

    await onSaveConfig({
      coinName: coinName,
      coinSymbol: coinSymbol,
      totalSupplyOverride: numTotal,
      circulatingSupplyOverride: numCirc,
      dexPairNameOverride: dexPairNameInput,
      stakingApyPercent: Number(apy),
    });
    await onUpdateCoin(coin.id, {
      name: coinName,
      symbol: coinSymbol,
      description: coinDesc,
      descriptionBn: coinDescBn,
      dexScreenerUrl: dexUrlInput,
      totalSupply: numTotal,
      circulatingSupply: numCirc,
      dexPairName: dexPairNameInput,
    });
    setSaving(false);
    setStatusMessage(`কয়েনের নাম, টোকেনমিক্স ও বিবরণ সফলভাবে আপডেট করা হয়েছে!`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    const numTotal = Number(totalSupplyInput.replace(/,/g, '')) || coin.totalSupply || 100000000;
    const numCirc = Number(circulatingSupplyInput.replace(/,/g, '')) || coin.circulatingSupply || 50000000;

    await onSaveConfig({
      siteTitle,
      siteTitleBn,
      coinName,
      coinSymbol,
      announcementBanner: announcementEn,
      announcementBannerBn: announcementBn,
      stakingApyPercent: Number(apy),
      dexScreenerUrl: dexUrlInput,
      totalSupplyOverride: numTotal,
      circulatingSupplyOverride: numCirc,
      dexPairNameOverride: dexPairNameInput,
    });
    await onUpdateCoin(coin.id, {
      name: coinName,
      symbol: coinSymbol,
      description: coinDesc,
      descriptionBn: coinDescBn,
      dexScreenerUrl: dexUrlInput,
      totalSupply: numTotal,
      circulatingSupply: numCirc,
      dexPairName: dexPairNameInput,
    });
    setSaving(false);
    setStatusMessage('Global brand settings & Tokenomics saved successfully!');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 max-w-2xl w-full shadow-[0_0_50px_rgba(6,182,212,0.2)] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-5 mb-5">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{t.adminTitle}</h3>
            <p className="text-xs text-slate-400">DexScreener API Link Sync, TripToCoin Details & Community Moderation</p>
          </div>
        </div>

        {!unlocked ? (
          <form onSubmit={handleUnlock} className="space-y-4 py-8 max-w-sm mx-auto text-center">
            <ShieldCheck className="w-12 h-12 text-cyan-400 mx-auto" />
            <h4 className="text-lg font-bold text-white">Enter Admin Access Passcode</h4>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter key (default: admin123)"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm font-mono text-white text-center outline-none"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider"
            >
              Unlock Dashboard
            </button>
          </form>
        ) : (
          <div>
            {/* Admin Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-5 overflow-x-auto">
              <button
                onClick={() => setActiveTab('dex')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'dex'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>DexScreener Live Sync</span>
              </button>
              <button
                onClick={() => setActiveTab('coin')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  activeTab === 'coin'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Token Info & Node IPs
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  activeTab === 'comments'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Community Comments ({comments.length})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  activeTab === 'settings'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                System Settings
              </button>
            </div>

            {statusMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* TAB 0: DEXSCREENER SYNC */}
            {activeTab === 'dex' && (
              <div className="space-y-4">
                {/* Live Tracking Token Name & Symbol System */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-teal-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wider">
                      <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span>Website Live Coin Name & Symbol System</span>
                    </div>
                    <span className="text-[10px] font-mono bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-500/30 font-bold">
                      Global Live Sync
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    এখানে কয়েনের নাম ও সিম্বল পরিবর্তন করলে সম্পূর্ণ ওয়েবসাইটে (হেডার, টিকিট, কনট্রাক্ট অ্যাড্রেস, হোয়াইটপেপার, স্ট্যাকিং ইত্যাদি) সাথে সাথে পরিবর্তিত নাম ও সিম্বল কার্যকর হবে এবং কখনো আগের নামে ফেরত যাবে না।
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                        Coin Full Name (কয়েনের নাম):
                      </label>
                      <input
                        type="text"
                        value={coinName}
                        onChange={(e) => setCoinName(e.target.value)}
                        placeholder="e.g. TripToCoin"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                        Coin Symbol (সিম্বল):
                      </label>
                      <input
                        type="text"
                        value={coinSymbol}
                        onChange={(e) => setCoinSymbol(e.target.value)}
                        placeholder="e.g. TTC"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-300 uppercase outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>DexScreener Pair / Token Link Configuration</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    লিংক ফাঁকা রেখে স্ক্যান বা সেভ করলে ওয়েবসাইটে কোনো কযেনের চার্ট বা প্রাইস দেখাবে না। যখনই কোনো DexScreener pair বা token লিংক বসিয়ে স্ক্যান করবেন, ওয়েবসাইটে সেই লিংক অনুযায়ী লাইভ কয়েন লোড হবে।
                  </p>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-bold text-slate-300 block">
                        DexScreener Link:
                      </label>
                      {dexUrlInput && (
                        <button
                          type="button"
                          onClick={() => setDexUrlInput('')}
                          className="text-[11px] font-mono text-rose-400 hover:text-rose-300 font-bold underline"
                        >
                          Clear Link (ফাঁকা করুন)
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={dexUrlInput}
                      onChange={(e) => setDexUrlInput(e.target.value)}
                      placeholder="e.g. https://dexscreener.com/solana/5pghkctym6odbhgo2tkmst2ajmjsb2uzbqrkkn4zuft5 (Or leave empty to hide)"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-300 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={handleDexSync}
                      disabled={syncingDex}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncingDex ? 'animate-spin' : ''}`} />
                      <span>{syncingDex ? 'Processing Sync...' : 'Save Name & DexScreener Sync'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setDexUrlInput('');
                        setTimeout(() => handleDexSync(), 50);
                      }}
                      disabled={syncingDex}
                      className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-rose-500/30 transition"
                    >
                      <span>Reset & Hide Coin (লিংক সরান)</span>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
                  <div className="text-white font-bold mb-1">Current Synced State:</div>
                  <div>• Status: {coin.dexScreenerUrl ? 'Live DexScreener Link Synced ✅' : 'No Link Synced (Website View Hidden) ❌'}</div>
                  <div>• DexScreener Link: {coin.dexScreenerUrl || '(None - Empty)'}</div>
                  <div>• Token: {coin.name} (${coin.symbol})</div>
                  <div>• Price USD: ${coin.priceUsd}</div>
                  <div>• Market Cap: ${coin.marketCapUsd ? coin.marketCapUsd.toLocaleString() : '0'}</div>
                  <div>• Last Synced: {coin.lastSyncedAt || 'Unsynced'}</div>
                </div>
              </div>
            )}

            {/* TAB 1: COIN EDIT */}
            {activeTab === 'coin' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Coin Name</label>
                    <input
                      type="text"
                      value={coinName}
                      onChange={(e) => setCoinName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Symbol</label>
                    <input
                      type="text"
                      value={coinSymbol}
                      onChange={(e) => setCoinSymbol(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Description (English)</label>
                  <textarea
                    value={coinDesc}
                    onChange={(e) => setCoinDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Description (Bangla - বাংলা বিবরণ)
                  </label>
                  <textarea
                    value={coinDescBn}
                    onChange={(e) => setCoinDescBn(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>

                {/* Whitepaper Tokenomics & Allocation Customization Box */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Whitepaper Tokenomics Customization (টোকেন সাপ্লাই ও ডেক্স পেয়ার)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    এখানে টোটাল সাপ্লাই, সার্কুলেটিং সাপ্লাই, স্ট্যাকিং পার্সেন্টেজ (APY %) এবং ডেক্স পেয়ার লিখে দিলে হোয়াইটপেপার ও ওয়েবসাইটে সরাসরি ম্যানুয়ালি আপডেট হয়ে যাবে। (ডেক্সস্ক্রিনার লিংক স্ক্যান করলেও এগুলো অটোমেটিক গণিত হয়ে বসবে)।
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                        Total Supply (টোটাল সাপ্লাই):
                      </label>
                      <input
                        type="text"
                        value={totalSupplyInput}
                        onChange={(e) => setTotalSupplyInput(e.target.value)}
                        placeholder="e.g. 100,000,000"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs font-mono text-cyan-300 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                        Circulating Supply (সার্কুলেটিং সাপ্লাই):
                      </label>
                      <input
                        type="text"
                        value={circulatingSupplyInput}
                        onChange={(e) => setCirculatingSupplyInput(e.target.value)}
                        placeholder="e.g. 50,000,000"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs font-mono text-emerald-300 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                        Staking Yield APY % (স্ট্যাকিং পার্সেন্টেজ):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={apy}
                        onChange={(e) => setApy(Number(e.target.value))}
                        placeholder="e.g. 18.5"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs font-mono text-purple-300 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                        Dex Pair Name & Network (ডেক্স পেয়ার):
                      </label>
                      <input
                        type="text"
                        value={dexPairNameInput}
                        onChange={(e) => setDexPairNameInput(e.target.value)}
                        placeholder="e.g. RAYDIUM SOL/TTC"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs font-mono text-amber-300 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-cyan-400 block mb-1">Active Contract Addresses & Node IPs:</span>
                  {coin.contractAddresses.map((c, i) => (
                    <div key={i} className="font-mono text-[11px] text-slate-400 truncate">
                      • {c.chainName}: {c.address}
                    </div>
                  ))}
                  {coin.ipAddresses.map((ip, i) => (
                    <div key={i} className="font-mono text-[11px] text-slate-400 truncate">
                      • IP Node: {ip.ip} ({ip.label})
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSaveCoin}
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Token Details'}</span>
                </button>
              </div>
            )}

            {/* TAB 2: COMMENT MODERATION & MANAGEMENT */}
            {activeTab === 'comments' && (
              <div className="space-y-4">
                {/* Header Actions */}
                <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">Community Comments ({comments.length})</span>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded border border-cyan-500/30">
                      কমিউনিটি কমেন্টস
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddComment(!showAddComment)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{showAddComment ? 'Hide Form' : 'Add Comment (নতুন কমেন্ট)'}</span>
                    </button>
                    {comments.length > 0 && (
                      <button
                        onClick={async () => {
                          if (window.confirm('আপনি কি নিশ্চিত যে সমস্ত কমেন্ট ক্লিন (মুছে ফেলতে) চান?')) {
                            if (onClearAllComments) await onClearAllComments();
                            setStatusMessage('সমস্ত কমেন্ট সফলভাবে ক্লিন করা হয়েছে!');
                            setTimeout(() => setStatusMessage(null), 3000);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear All (সব কমেন্ট ক্লিন করুন)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Add Comment Form */}
                {showAddComment && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newCommentText.trim()) return;
                      if (onAdminCreateComment) {
                        await onAdminCreateComment({
                          username: newUsername.trim() || 'Community_Trader',
                          text: newCommentText.trim(),
                          sentiment: newCommentSentiment,
                          pinned: newCommentPinned,
                        });
                        setNewCommentText('');
                        setShowAddComment(false);
                        setStatusMessage('নতুন কমেন্ট সফলভাবে পোস্ট করা হয়েছে!');
                        setTimeout(() => setStatusMessage(null), 3000);
                      }
                    }}
                    className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-3"
                  >
                    <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Create Custom Comment (নতুন কমেন্ট পোস্ট করুন)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">Username (ইউজারনেম)</label>
                        <input
                          type="text"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder="e.g. WhaleTrader_99"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">Sentiment (সেন্টিমেন্ট)</label>
                        <select
                          value={newCommentSentiment}
                          onChange={(e) => setNewCommentSentiment(e.target.value as Sentiment)}
                          className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                        >
                          <option value="bullish">Bullish 🚀 (বুলিশ)</option>
                          <option value="bearish">Bearish 📉 (বেয়ারিশ)</option>
                        </select>
                      </div>
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={newCommentPinned}
                            onChange={(e) => setNewCommentPinned(e.target.checked)}
                            className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                          />
                          <span>Pin Comment 📌 (পিন করুন)</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Comment Text (কমেন্ট বার্তা)</label>
                      <textarea
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="অ্যাডমিন মেসেজ বা টেস্ট কমেন্ট লিখুন..."
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl p-2.5 text-xs text-white outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition"
                    >
                      Post Comment (কমেন্ট তৈরি করুন)
                    </button>
                  </form>
                )}

                {/* Comment List */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-900">
                      কোনো কমেন্ট নেই। উপরে &quot;Add Comment&quot; বাটনে ক্লিক করে নতুন কমেন্ট যোগ করতে পারেন।
                    </div>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-xs space-y-2">
                        {editingId === c.id ? (
                          /* Inline Edit Mode */
                          <div className="space-y-2.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1">Username:</label>
                                <input
                                  type="text"
                                  value={editUsername}
                                  onChange={(e) => setEditUsername(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1">Sentiment:</label>
                                <select
                                  value={editSentiment}
                                  onChange={(e) => setEditSentiment(e.target.value as Sentiment)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white"
                                >
                                  <option value="bullish">Bullish 🚀</option>
                                  <option value="bearish">Bearish 📉</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-1">Comment Text:</label>
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={2}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
                              />
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                              >
                                Cancel (বাতিল)
                              </button>
                              <button
                                onClick={async () => {
                                  if (onEditComment) {
                                    await onEditComment(c.id, {
                                      username: editUsername,
                                      text: editText,
                                      sentiment: editSentiment,
                                    });
                                    setEditingId(null);
                                    setStatusMessage('কমেন্ট এডিট সেভ হয়েছে!');
                                    setTimeout(() => setStatusMessage(null), 3000);
                                  }
                                }}
                                className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
                              >
                                Save Changes (সেভ করুন)
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* View Mode */
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{c.username}</span>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    c.sentiment === 'bullish'
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  }`}
                                >
                                  {c.sentiment === 'bullish' ? '🚀 Bullish' : '📉 Bearish'}
                                </span>
                                {c.pinned && (
                                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 font-bold flex items-center gap-0.5">
                                    <Pin className="w-3 h-3 text-amber-400" />
                                    Pinned
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => onPinComment(c.id)}
                                  className={`p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition ${
                                    c.pinned ? 'text-amber-400 font-bold' : 'text-slate-400'
                                  }`}
                                  title="Pin / Unpin Comment"
                                >
                                  <Pin className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingId(c.id);
                                    setEditUsername(c.username);
                                    setEditText(c.text);
                                    setEditSentiment(c.sentiment);
                                  }}
                                  className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition"
                                  title="Edit Comment (এডিট করুন)"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteComment(c.id)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                                  title="Delete Comment (ডিলিট করুন)"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="text-slate-300 text-xs leading-relaxed">{c.text}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: SYSTEM CONFIG */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-xs text-cyan-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-cyan-300">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>Global Website & Token Brand Customization</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    এখানে Website Portal Title, Token Name (যেমন: TripToCoin) এবং Token Symbol (যেমন: TTC) পরিবর্তন করলে সম্পূর্ণ ওয়েবসাইটের সমস্ত টাইটেল, লোগো ট্যাগ, স্ট্যাকিং ভল্ট, ও হোয়াইটপেপারে অটোমেটিক পরিবর্তন হয়ে যাবে।
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-cyan-300 block mb-1">
                      Website Portal Title (ওয়েবসাইট পোর্টাল টাইটেল)
                    </label>
                    <input
                      type="text"
                      value={siteTitle}
                      onChange={(e) => {
                        setSiteTitle(e.target.value);
                        setSiteTitleBn(e.target.value);
                      }}
                      placeholder="e.g. TripToCoin Portal"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs font-mono text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-cyan-300 block mb-1">
                      Token Name (টোকেনের সম্পূর্ণ নাম)
                    </label>
                    <input
                      type="text"
                      value={coinName}
                      onChange={(e) => setCoinName(e.target.value)}
                      placeholder="e.g. TripToCoin"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs font-mono text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-cyan-300 block mb-1">
                    Token Symbol / Ticker (টোকেন সিম্বল, যেমন TTC বা $TTC)
                  </label>
                  <input
                    type="text"
                    value={coinSymbol}
                    onChange={(e) => setCoinSymbol(e.target.value)}
                    placeholder="e.g. TTC"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs font-mono text-white uppercase outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Announcement Banner Notice
                  </label>
                  <input
                    type="text"
                    value={announcementEn}
                    onChange={(e) => {
                      setAnnouncementEn(e.target.value);
                      setAnnouncementBn(e.target.value);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Staking Rate APY %</label>
                  <input
                    type="number"
                    value={apy}
                    onChange={(e) => setApy(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white outline-none"
                  />
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>{saving ? 'Saving...' : 'Save Global Brand Config'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
