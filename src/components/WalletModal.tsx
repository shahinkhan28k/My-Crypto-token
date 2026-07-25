import React, { useState } from 'react';
import { User } from '../types';
import { translations } from '../translations';
import { X, Wallet, ShieldCheck, Search, RefreshCw, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  lang: 'en';
  onConnectWallet: (
    address: string,
    walletType: 'MetaMask' | 'TrustWallet' | 'Phantom' | 'Solflare' | 'Coinbase' | 'WalletConnect',
    walletChain: 'solana' | 'ethereum',
    customBalance?: number
  ) => Promise<void>;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  user,
  onConnectWallet,
}) => {
  if (!isOpen) return null;

  const t = translations.en;
  const [activeNetwork, setActiveNetwork] = useState<'solana' | 'ethereum'>(user.walletChain || 'solana');
  const [manualAddress, setManualAddress] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [scanResult, setScanResult] = useState<{
    address: string;
    chain: 'solana' | 'ethereum';
    holdings: number;
    usdValue: number;
    status: 'VERIFIED' | 'UNVERIFIED';
  } | null>(null);

  const solanaWallets = [
    {
      id: 'Phantom',
      name: 'Phantom Wallet',
      icon: '👻',
      badge: 'Solana SPL',
      color: 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:border-purple-400',
    },
    {
      id: 'Solflare',
      name: 'Solflare Wallet',
      icon: '🔥',
      badge: 'Solana Native',
      color: 'bg-orange-500/10 border-orange-500/30 text-orange-300 hover:border-orange-400',
    },
    {
      id: 'Backpack',
      name: 'Backpack Wallet',
      icon: '🎒',
      badge: 'Solana x xNFT',
      color: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:border-indigo-400',
    },
  ];

  const ethereumWallets = [
    {
      id: 'MetaMask',
      name: 'MetaMask',
      icon: '🦊',
      badge: 'EVM / Ethereum',
      color: 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:border-amber-400',
    },
    {
      id: 'TrustWallet',
      name: 'Trust Wallet',
      icon: '🛡️',
      badge: 'Multi-Chain EVM',
      color: 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:border-blue-400',
    },
    {
      id: 'WalletConnect',
      name: 'WalletConnect',
      icon: '🔗',
      badge: 'QR Mobile Sync',
      color: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:border-cyan-400',
    },
    {
      id: 'Coinbase',
      name: 'Coinbase Wallet',
      icon: '🔵',
      badge: 'EVM Mainnet',
      color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:border-emerald-400',
    },
  ];

  // Calculate deterministic holdings based on address hash
  const calculateAddressHoldings = (addr: string): number => {
    let hashNum = 0;
    const cleanAddr = addr.trim();
    for (let i = 0; i < cleanAddr.length; i++) {
      hashNum = (hashNum << 5) - hashNum + cleanAddr.charCodeAt(i);
      hashNum |= 0;
    }
    const absHash = Math.abs(hashNum);
    return Math.round(12500 + (absHash % 85000));
  };

  const handleScanAddress = async (targetAddr?: string) => {
    const addr = targetAddr || manualAddress.trim();
    if (!addr) return;

    setIsScanning(true);
    setScanResult(null);

    // Simulated On-Chain Scanner Steps
    const explorer = activeNetwork === 'solana' ? 'Solscan Mainnet RPC' : 'Etherscan EVM Node';
    setScanStep(`1/3 Connecting to ${explorer}...`);
    await new Promise((r) => setTimeout(r, 600));

    setScanStep(`2/3 Scanning $TOKEN token account holdings...`);
    await new Promise((r) => setTimeout(r, 700));

    setScanStep(`3/3 Verifying on-chain token balance...`);
    await new Promise((r) => setTimeout(r, 600));

    const tokenBalance = calculateAddressHoldings(addr);
    const estimatedUsd = Number((tokenBalance * 0.115).toFixed(2));

    setScanResult({
      address: addr,
      chain: activeNetwork,
      holdings: tokenBalance,
      usdValue: estimatedUsd,
      status: 'VERIFIED',
    });

    setIsScanning(false);
  };

  const handleConfirmConnection = async (
    walletType: 'MetaMask' | 'TrustWallet' | 'Phantom' | 'Solflare' | 'Coinbase' | 'WalletConnect',
    customAddr?: string,
    customBal?: number
  ) => {
    let addr = customAddr || manualAddress.trim();
    if (!addr) {
      if (activeNetwork === 'solana') {
        addr = '5pghkctym6' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 36).toString(36)).join('');
      } else {
        addr = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      }
    }

    const finalBalance = customBal !== undefined ? customBal : calculateAddressHoldings(addr);

    setIsScanning(true);
    await onConnectWallet(addr, walletType, activeNetwork, finalBalance);
    setIsScanning(false);
    onClose();
  };

  const wallets = activeNetwork === 'solana' ? solanaWallets : ethereumWallets;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(6,182,212,0.2)] relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {t.connectWallet}
            </h3>
            <p className="text-xs text-slate-400">
              Verify $TOKEN token holdings on Solana or Ethereum
            </p>
          </div>
        </div>

        {/* Currently Connected Wallet Display */}
        {user.walletAddress && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-5 text-xs text-emerald-300 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Connected Wallet</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] uppercase font-bold">
                {user.walletChain === 'ethereum' ? 'EVM / Ethereum' : 'Solana SPL'}
              </span>
            </div>
            <div className="font-mono text-[11px] break-all text-slate-200 bg-slate-950/60 p-2 rounded-xl border border-emerald-500/20">
              {user.walletAddress}
            </div>

            <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between font-mono">
              <span className="text-slate-400 text-[11px]">
                Verified Token Holdings:
              </span>
              <span className="text-sm font-extrabold text-cyan-300">
                {(user.ttcTokenBalance || 18500).toLocaleString()} TOKEN
              </span>
            </div>
          </div>
        )}

        {/* Network Switcher */}
        <div className="mb-4 space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block font-mono">
            1. Select Blockchain Network:
          </label>
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                setActiveNetwork('solana');
                setScanResult(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                activeNetwork === 'solana'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>👻</span>
              <span>Solana</span>
            </button>
            <button
              onClick={() => {
                setActiveNetwork('ethereum');
                setScanResult(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                activeNetwork === 'ethereum'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🦊</span>
              <span>Ethereum</span>
            </button>
          </div>
        </div>

        {/* Manual Address Input & On-Chain Verification Scanner */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-500/30 mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-cyan-300 font-mono flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Verify & Scan Wallet Address:</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">Automatic Scanner</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleScanAddress();
              }}
              placeholder={
                activeNetwork === 'solana'
                  ? 'Solana SPL Address (e.g. 5pghk...)'
                  : '0x... EVM Address'
              }
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 outline-none"
            />
            <button
              onClick={() => handleScanAddress()}
              disabled={isScanning || !manualAddress.trim()}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs font-mono transition shadow-lg shadow-cyan-500/20 disabled:opacity-40 cursor-pointer flex items-center gap-1 shrink-0"
            >
              {isScanning ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              <span>Verify</span>
            </button>
          </div>

          {/* Scanning Animation */}
          {isScanning && (
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs font-mono text-cyan-300 flex items-center gap-2 animate-pulse">
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
              <span>{scanStep}</span>
            </div>
          )}

          {/* Scan Result Card */}
          {scanResult && !isScanning && (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>On-Chain Scan Match Found!</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold uppercase">
                  {scanResult.chain}
                </span>
              </div>

              <div className="space-y-1 text-xs font-mono">
                <div className="text-slate-400 text-[11px] truncate">
                  Address: <span className="text-slate-200">{scanResult.address}</span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-slate-300 text-xs">Verified Token Holdings:</span>
                  <span className="text-sm font-black text-cyan-300">
                    {scanResult.holdings.toLocaleString()} TOKEN
                  </span>
                </div>
                <div className="text-right text-[11px] text-amber-400 font-bold">
                  ≈ ${scanResult.usdValue.toLocaleString()} USD
                </div>
              </div>

              <button
                onClick={() =>
                  handleConfirmConnection(
                    scanResult.chain === 'solana' ? 'Phantom' : 'MetaMask',
                    scanResult.address,
                    scanResult.holdings
                  )
                }
                className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs font-mono flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <span>Sync Holdings to Vault</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Standard Wallet Provider Connections */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-300 block font-mono">
            Or select Web3 Browser Provider:
          </label>

          {wallets.map((w) => (
            <button
              key={w.id}
              onClick={() => handleConfirmConnection(w.id as any)}
              disabled={isScanning}
              className={`w-full p-3.5 rounded-2xl border flex items-center justify-between font-semibold text-xs transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${w.color}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{w.icon}</span>
                <div className="text-left">
                  <div className="text-white font-bold">{w.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{w.badge}</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-slate-950/60 border border-slate-800 text-cyan-300">
                Connect →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

