import React from 'react';
import { User } from '../types';
import { USER_RANKS } from '../mockData';
import { Language, translations } from '../translations';
import { X, UserCheck, Award, Wallet, History, Coins, Shield } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  lang: Language;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  lang,
}) => {
  if (!isOpen) return null;

  const t = translations[lang];

  const totalPoints = user.points + user.stakedPoints;
  const currentRankInfo =
    [...USER_RANKS].reverse().find((r) => totalPoints >= r.minPoints) || USER_RANKS[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Card Header */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-5 mb-5">
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cyan-500/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-white">{user.username}</h3>
              <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-bold ${currentRankInfo.badgeColor}`}>
                {currentRankInfo.icon} {currentRankInfo.title}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{user.email}</p>
          </div>
        </div>

        {/* Total Points Overview */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-400 uppercase font-semibold">Available Points</span>
            <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
              {user.points.toLocaleString()} <span className="text-xs text-slate-400">PTS</span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4">
            <span className="text-xs text-amber-400 uppercase font-semibold">Staked Points</span>
            <div className="text-2xl font-mono font-extrabold text-amber-300 mt-1">
              {user.stakedPoints.toLocaleString()} <span className="text-xs text-slate-400">PTS</span>
            </div>
          </div>
        </div>

        {/* Wallet Address Status */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-1">
            <Wallet className="w-4 h-4 text-indigo-400" />
            <span>Connected Web3 Wallet</span>
          </div>
          <div className="font-mono text-xs text-slate-400 select-all break-all">
            {user.walletAddress ? user.walletAddress : 'No wallet connected yet.'}
          </div>
        </div>

        {/* Point History Log */}
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-white mb-3">
            <History className="w-4 h-4 text-cyan-400" />
            <span>Points Ledger & Activity History</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {user.pointHistory.map((ph) => (
              <div
                key={ph.id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200">{ph.description}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{ph.timestamp}</div>
                </div>

                <div className="font-mono font-extrabold text-amber-400 text-sm">
                  +{ph.points} PTS
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
