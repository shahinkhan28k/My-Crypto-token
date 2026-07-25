export type Sentiment = 'bullish' | 'bearish' | 'neutral';
export type UserRole = 'user' | 'admin';

export interface IpAddressNode {
  ip: string;
  label: string;
  region: string;
  status: 'active' | 'syncing' | 'maintenance';
  pingMs: number;
  type: 'RPC Node' | 'Validator' | 'P2P Gateway' | 'IPFS Gateway';
}

export interface ContractAddress {
  chain: string;
  chainName: string;
  address: string;
  explorerUrl: string;
  icon: string;
}

export interface Coin {
  id: string;
  name: string;
  symbol: string;
  description: string;
  descriptionBn?: string;
  logoUrl: string;
  priceUsd: number;
  priceBtc: number;
  priceNative?: number;
  nativeSymbol?: string;
  marketCapUsd: number;
  volume24hUsd: number;
  volume6hUsd?: number;
  volume1hUsd?: number;
  volume5mUsd?: number;
  priceChange5m?: number;
  priceChange1h: number;
  priceChange6h?: number;
  priceChange24h: number;
  priceChange7d: number;
  circulatingSupply: number;
  totalSupply: number;
  allTimeHighUsd: number;
  holdersCount: number;
  liquidityUsd?: number;
  buys24h?: number;
  sells24h?: number;
  bullishPercentage?: number;
  dexScreenerUrl?: string;
  pairAddress?: string;
  chainId?: string;
  dexName?: string;
  dexPairName?: string;
  lastSyncedAt?: string;
  contractAddresses: ContractAddress[];
  ipAddresses: IpAddressNode[];
  auditStatus: 'Audited (CertiK)' | 'Audited (Hacken)' | 'In Audit' | 'Verified';
  websiteUrl: string;
  whitepaperUrl: string;
  githubUrl: string;
  telegramUrl: string;
  twitterUrl: string;
}

export interface RoadmapItem {
  phase: string;
  title: string;
  titleBn: string;
  period: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  items: string[];
  itemsBn: string[];
}

export interface PartnerItem {
  id: string;
  name: string;
  category: string;
  logo: string;
  status: 'Active Partner' | 'In Discussion' | 'Target Roadmap';
  description: string;
  descriptionBn: string;
}

export interface PricePoint {
  timestamp: string;
  timeLabel: string;
  price: number;
  volume: number;
  high: number;
  low: number;
}

export interface WhaleTransaction {
  id: string;
  hash: string;
  type: 'BUY' | 'SELL' | 'TRANSFER';
  amountCoin: number;
  usdValue: number;
  priceUsd?: number;
  nativeAmount?: number;
  nativeSymbol?: string;
  fromAddress: string;
  toAddress: string;
  timestamp: string;
  chain: string;
  dexUrl?: string;
}

export interface PointRecord {
  id: string;
  type: 'STAKE_EARN' | 'DAILY_BONUS' | 'COMMENT_REWARD' | 'UPVOTE_REWARD' | 'STAKE_ACTION';
  points: number;
  description: string;
  timestamp: string;
}

export interface UserRankInfo {
  title: string;
  titleBn: string;
  icon: string;
  badgeColor: string;
  minPoints: number;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  walletAddress: string | null;
  walletType?: 'MetaMask' | 'TrustWallet' | 'Phantom' | 'Solflare' | 'Coinbase' | 'WalletConnect' | null;
  walletChain?: 'solana' | 'ethereum' | null;
  ttcTokenBalance?: number;
  stakedTtcTokens?: number;
  points: number;
  stakedPoints: number;
  rank: string;
  role: UserRole;
  avatarUrl: string;
  createdAt: string;
  pointHistory: PointRecord[];
  lastDailyClaim?: string;
}

export interface CommentReply {
  id: string;
  commentId: string;
  userId: string;
  username: string;
  userRank: string;
  userPoints: number;
  text: string;
  timestamp: string;
}

export interface CommentItem {
  id: string;
  coinId: string;
  userId: string;
  username: string;
  userRank: string;
  userPoints: number;
  text: string;
  sentiment: Sentiment;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  pinned: boolean;
  timestamp: string;
  replies: CommentReply[];
}

export interface AdminConfig {
  siteTitle?: string;
  siteTitleBn?: string;
  coinName?: string;
  coinSymbol?: string;
  dexScreenerUrl: string;
  stakingApyPercent: number;
  dailyClaimPoints: number;
  commentRewardPoints: number;
  announcementBanner: string;
  announcementBannerBn: string;
  allowComments: boolean;
  autoSyncDexScreener: boolean;
  totalSupplyOverride?: number;
  circulatingSupplyOverride?: number;
  dexPairNameOverride?: string;
}
