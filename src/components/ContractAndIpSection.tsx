import React, { useState } from 'react';
import { Coin } from '../types';
import { Language, translations } from '../translations';
import { Copy, Check, Server, Shield, ExternalLink, Activity, Network } from 'lucide-react';

interface ContractAndIpSectionProps {
  coin: Coin;
  lang: Language;
}

export const ContractAndIpSection: React.FC<ContractAndIpSectionProps> = ({ coin, lang }) => {
  const t = translations[lang];
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Smart Contract Addresses Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{t.contractAddresses}</h3>
                <p className="text-xs text-slate-400">Verified multi-chain smart contracts</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {coin.contractAddresses.length} Chains
            </span>
          </div>

          <div className="space-y-3">
            {coin.contractAddresses.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400 font-mono">
                No contract addresses synced. Paste a DexScreener link to auto-detect token contract.
              </div>
            ) : (
              coin.contractAddresses.map((c, idx) => {
                const copyId = `contract_${idx}`;
                const isCopied = copiedKey === copyId;

                return (
                  <div
                    key={c.chain + idx}
                    className="bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3 transition"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-200">
                        <span>{c.icon}</span>
                        <span>{c.chainName}</span>
                      </div>
                      {c.explorerUrl && (
                        <a
                          href={c.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                        >
                          <span>Explorer</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                      <span className="font-mono text-xs text-slate-300 break-all select-all flex-1">
                        {c.address}
                      </span>
                      <button
                        onClick={() => copyToClipboard(c.address, copyId)}
                        className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                          isCopied
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>{t.copyAddress}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Official Blockchain IP Addresses & Node Monitor Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{t.ipNodes}</h3>
                <p className="text-xs text-slate-400">Official RPC, Validator & Gateway Server IPs</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Ping
            </span>
          </div>

          <div className="space-y-3">
            {coin.ipAddresses.map((ipNode, idx) => {
              const copyId = `ip_${idx}`;
              const isCopied = copiedKey === copyId;

              return (
                <div
                  key={ipNode.ip + idx}
                  className="bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3 transition"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <Server className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-xs text-slate-200">{ipNode.label}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded font-mono">
                        {ipNode.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="text-slate-400">{ipNode.region}</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {ipNode.pingMs}ms
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2 flex-1 font-mono text-xs text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="select-all font-semibold text-cyan-300">{ipNode.ip}</span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(ipNode.ip, copyId)}
                      className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                        isCopied
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy IP</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
