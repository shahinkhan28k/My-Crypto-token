import React from 'react';
import { Language } from '../translations';
import { Flame } from 'lucide-react';

interface AnnouncementBarProps {
  bannerEn: string;
  bannerBn: string;
  lang: Language;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ bannerEn }) => {
  const displayText = bannerEn || '⚡ No DexScreener link connected. Enter a DexScreener pair/token link in Admin Panel or top bar to auto-generate token details, contract addresses & live chart!';

  return (
    <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border-b border-amber-500/30 py-2 px-4 text-xs text-amber-200 font-semibold flex items-center justify-center gap-2">
      <Flame className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
      <span className="text-center">{displayText}</span>
    </div>
  );
};
