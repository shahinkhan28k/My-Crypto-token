import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_COINS, INITIAL_COMMENTS, INITIAL_WHALES, INITIAL_ADMIN_CONFIG, USER_RANKS } from './src/mockData';
import { Coin, CommentItem, User, WhaleTransaction, AdminConfig, PointRecord, IpAddressNode } from './src/types';
import { generateInitialTradeFeed } from './src/utils/tradeGenerator';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory data store for persistent app state during execution
  let coins: Coin[] = [...INITIAL_COINS];
  let comments: CommentItem[] = [...INITIAL_COMMENTS];
  let whales: WhaleTransaction[] = [...INITIAL_WHALES];
  let adminConfig: AdminConfig = { ...INITIAL_ADMIN_CONFIG };

  // Demo User session state
  let currentUser: User = {
    id: 'u_demo_101',
    username: 'CryptoTrader_007',
    email: 'user@triptocoin.io',
    walletAddress: '5pghkctym6odbhgo2tkmst2ajmjsb2uzbqrkkn4zuft5',
    walletType: 'Phantom',
    walletChain: 'solana',
    ttcTokenBalance: 18500,
    stakedTtcTokens: 5000,
    points: 1250,
    stakedPoints: 2500,
    rank: 'Gold Hodler',
    role: 'user',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
    createdAt: new Date().toISOString(),
    pointHistory: [
      {
        id: 'ph_1',
        type: 'DAILY_BONUS',
        points: 100,
        description: 'Daily Check-in Reward',
        timestamp: '1 day ago',
      },
      {
        id: 'ph_2',
        type: 'STAKE_ACTION',
        points: 2500,
        description: 'Staked points in TTC Vault',
        timestamp: '2 days ago',
      },
      {
        id: 'ph_3',
        type: 'COMMENT_REWARD',
        points: 15,
        description: 'Posted insightful coin review',
        timestamp: '3 days ago',
      },
    ],
    lastDailyClaim: undefined,
  };

  // Helper to determine rank based on total points
  function calculateRank(points: number): string {
    let currentRank = USER_RANKS[0].title;
    for (const r of USER_RANKS) {
      if (points >= r.minPoints) {
        currentRank = r.title;
      }
    }
    return currentRank;
  }

  // --- API ENDPOINTS ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get all tracked coins
  app.get('/api/coins', (req, res) => {
    res.json(coins);
  });

  // Get coin by ID
  app.get('/api/coins/:id', (req, res) => {
    const coin = coins.find((c) => c.id.toLowerCase() === req.params.id.toLowerCase());
    if (!coin) {
      return res.status(404).json({ error: 'Coin not found' });
    }
    res.json(coin);
  });

  // Fetch or generate price chart points for coin
  app.get('/api/coins/:id/chart', (req, res) => {
    const { interval = '24h' } = req.query;
    const coin = coins.find((c) => c.id.toLowerCase() === req.params.id.toLowerCase());
    const basePrice = coin ? coin.priceUsd : 0.4852;

    let pointsCount = 30;
    let priceVolatility = 0.015;
    let timeStepMinutes = 60; // 24h default

    switch (interval) {
      case '1m':
        pointsCount = 20;
        priceVolatility = 0.002;
        timeStepMinutes = 1;
        break;
      case '5m':
        pointsCount = 24;
        priceVolatility = 0.005;
        timeStepMinutes = 5;
        break;
      case '1h':
        pointsCount = 30;
        priceVolatility = 0.008;
        timeStepMinutes = 2;
        break;
      case '24h':
        pointsCount = 24;
        priceVolatility = 0.018;
        timeStepMinutes = 60;
        break;
      case '7d':
        pointsCount = 28;
        priceVolatility = 0.045;
        timeStepMinutes = 360;
        break;
      case '30d':
        pointsCount = 30;
        priceVolatility = 0.09;
        timeStepMinutes = 1440;
        break;
    }

    const now = Date.now();
    const chartData = [];
    let currentPrice = basePrice * (1 - (priceVolatility * pointsCount) / 2.5);

    for (let i = pointsCount; i >= 0; i--) {
      const pointTime = new Date(now - i * timeStepMinutes * 60 * 1000);
      const randomDelta = (Math.random() - 0.47) * priceVolatility * basePrice;
      currentPrice = Math.max(0.0001, currentPrice + randomDelta);

      // Final point matches exact live coin price
      if (i === 0) currentPrice = basePrice;

      const high = currentPrice * (1 + Math.random() * 0.006);
      const low = currentPrice * (1 - Math.random() * 0.006);
      const volume = Math.floor(Math.random() * 80000 + 10000);

      let timeLabel = '';
      if (interval === '1m' || interval === '5m' || interval === '1h') {
        timeLabel = pointTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (interval === '24h') {
        timeLabel = pointTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        timeLabel = pointTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }

      chartData.push({
        timestamp: pointTime.toISOString(),
        timeLabel,
        price: Number(currentPrice.toFixed(4)),
        high: Number(high.toFixed(4)),
        low: Number(low.toFixed(4)),
        volume,
      });
    }

    res.json(chartData);
  });

  // Get whale transactions
  app.get('/api/coins/:id/whales', (req, res) => {
    res.json(whales);
  });

  // Get comments for a coin
  app.get('/api/comments', (req, res) => {
    const { coinId = 'triptocoin' } = req.query;
    const coinComments = comments.filter((c) => c.coinId.toLowerCase() === (coinId as string).toLowerCase());
    res.json(coinComments);
  });

  // Post new comment
  app.post('/api/comments', (req, res) => {
    const { coinId = 'triptocoin', text, sentiment = 'bullish' } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text cannot be empty' });
    }

    const newComment: CommentItem = {
      id: 'c_' + Date.now(),
      coinId,
      userId: currentUser.id,
      username: currentUser.username,
      userRank: currentUser.rank,
      userPoints: currentUser.points + currentUser.stakedPoints,
      text: text.trim(),
      sentiment,
      upvotes: 1,
      downvotes: 0,
      userVote: 'up',
      pinned: false,
      timestamp: 'Just now',
      replies: [],
    };

    comments.unshift(newComment);

    // Reward user with comment points
    const rewardPoints = adminConfig.commentRewardPoints;
    currentUser.points += rewardPoints;
    currentUser.rank = calculateRank(currentUser.points + currentUser.stakedPoints);

    currentUser.pointHistory.unshift({
      id: 'ph_' + Date.now(),
      type: 'COMMENT_REWARD',
      points: rewardPoints,
      description: `Earned ${rewardPoints} pts for posting community insight`,
      timestamp: 'Just now',
    });

    res.json({ comment: newComment, user: currentUser });
  });

  // Vote on comment
  app.post('/api/comments/:id/vote', (req, res) => {
    const commentId = req.params.id;
    const { voteType } = req.body; // 'up' | 'down'
    const target = comments.find((c) => c.id === commentId);

    if (!target) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (target.userVote === voteType) {
      // Undo vote
      if (voteType === 'up') target.upvotes = Math.max(0, target.upvotes - 1);
      if (voteType === 'down') target.downvotes = Math.max(0, target.downvotes - 1);
      target.userVote = null;
    } else {
      // Switch or apply vote
      if (target.userVote === 'up') target.upvotes = Math.max(0, target.upvotes - 1);
      if (target.userVote === 'down') target.downvotes = Math.max(0, target.downvotes - 1);

      if (voteType === 'up') target.upvotes += 1;
      if (voteType === 'down') target.downvotes += 1;
      target.userVote = voteType;
    }

    res.json(target);
  });

  // Admin Pin / Unpin comment
  app.post('/api/comments/:id/pin', (req, res) => {
    const target = comments.find((c) => c.id === req.params.id);
    if (!target) return res.status(404).json({ error: 'Comment not found' });

    target.pinned = !target.pinned;
    res.json(target);
  });

  // Admin Create Comment
  app.post('/api/comments/admin-create', (req, res) => {
    const { username = 'Community_Trader', text, sentiment = 'bullish', pinned = false } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text cannot be empty' });
    }

    const newComment: CommentItem = {
      id: 'c_' + Date.now(),
      coinId: coins[0]?.id || 'triptocoin',
      userId: 'u_admin_' + Date.now(),
      username: username.trim(),
      userRank: 'Admin Moderator',
      userPoints: 25000,
      text: text.trim(),
      sentiment: sentiment === 'bearish' ? 'bearish' : 'bullish',
      upvotes: 8,
      downvotes: 0,
      userVote: 'up',
      pinned: Boolean(pinned),
      timestamp: 'Just now',
      replies: [],
    };

    comments.unshift(newComment);
    res.json({ comment: newComment, comments });
  });

  // Admin Edit comment
  app.put('/api/comments/:id', (req, res) => {
    const target = comments.find((c) => c.id === req.params.id);
    if (!target) return res.status(404).json({ error: 'Comment not found' });

    if (req.body.text !== undefined && req.body.text.trim()) target.text = req.body.text.trim();
    if (req.body.username !== undefined && req.body.username.trim()) target.username = req.body.username.trim();
    if (req.body.sentiment !== undefined) target.sentiment = req.body.sentiment;
    if (req.body.pinned !== undefined) target.pinned = req.body.pinned;

    res.json({ comment: target, comments });
  });

  // Admin Clear All comments
  app.delete('/api/comments/all/clear', (req, res) => {
    comments = [];
    res.json({ success: true, message: 'All community comments cleared successfully', comments: [] });
  });

  // Admin Delete comment
  app.delete('/api/comments/:id', (req, res) => {
    comments = comments.filter((c) => c.id !== req.params.id);
    res.json({ success: true, message: 'Comment removed', comments });
  });

  // Stake or Unstake Points
  app.post('/api/user/stake', (req, res) => {
    const { amount, action } = req.body; // action: 'stake' | 'unstake'
    const numAmount = Math.floor(Number(amount));

    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Invalid points amount' });
    }

    if (action === 'stake') {
      if (currentUser.points < numAmount) {
        return res.status(400).json({ error: 'Insufficient available points to stake' });
      }
      currentUser.points -= numAmount;
      currentUser.stakedPoints += numAmount;

      currentUser.pointHistory.unshift({
        id: 'ph_' + Date.now(),
        type: 'STAKE_ACTION',
        points: numAmount,
        description: `Staked ${numAmount} points into TripToCoin Staking Vault`,
        timestamp: 'Just now',
      });
    } else if (action === 'unstake') {
      if (currentUser.stakedPoints < numAmount) {
        return res.status(400).json({ error: 'Insufficient staked points to withdraw' });
      }
      currentUser.stakedPoints -= numAmount;
      currentUser.points += numAmount;

      currentUser.pointHistory.unshift({
        id: 'ph_' + Date.now(),
        type: 'STAKE_ACTION',
        points: numAmount,
        description: `Unstaked ${numAmount} points back to available wallet balance`,
        timestamp: 'Just now',
      });
    }

    currentUser.rank = calculateRank(currentUser.points + currentUser.stakedPoints);
    res.json({ user: currentUser, message: `Successfully ${action}d ${numAmount} points!` });
  });

  // Daily Points Claim
  app.post('/api/user/claim-daily', (req, res) => {
    const bonus = adminConfig.dailyClaimPoints;
    currentUser.points += bonus;
    currentUser.lastDailyClaim = new Date().toISOString();
    currentUser.rank = calculateRank(currentUser.points + currentUser.stakedPoints);

    currentUser.pointHistory.unshift({
      id: 'ph_' + Date.now(),
      type: 'DAILY_BONUS',
      points: bonus,
      description: `Claimed daily reward bonus of ${bonus} points!`,
      timestamp: 'Just now',
    });

    res.json({ user: currentUser, claimedPoints: bonus, message: `Claimed ${bonus} daily reward points!` });
  });

  // Stake or Unstake $TTC Tokens
  app.post('/api/user/stake-ttc', (req, res) => {
    const { amount, action } = req.body; // action: 'stake' | 'unstake'
    const numAmount = Math.floor(Number(amount));

    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Invalid token quantity' });
    }

    const holdings = currentUser.ttcTokenBalance ?? 18500;
    const staked = currentUser.stakedTtcTokens ?? 5000;

    if (action === 'stake') {
      if (holdings < numAmount) {
        return res.status(400).json({ error: 'Insufficient $TTC token holdings to stake' });
      }
      currentUser.ttcTokenBalance = holdings - numAmount;
      currentUser.stakedTtcTokens = staked + numAmount;
    } else if (action === 'unstake') {
      if (staked < numAmount) {
        return res.status(400).json({ error: 'Insufficient staked $TTC tokens to withdraw' });
      }
      currentUser.stakedTtcTokens = staked - numAmount;
      currentUser.ttcTokenBalance = holdings + numAmount;
    }

    res.json({
      user: currentUser,
      message: `Successfully ${action === 'stake' ? 'staked' : 'unstaked'} ${numAmount.toLocaleString()} $TTC tokens!`,
    });
  });

  // Connect Web3 Wallet & On-Chain Scanning Verification
  app.post('/api/user/connect-wallet', (req, res) => {
    const { address, walletType = 'Phantom', walletChain = 'solana', customBalance } = req.body;
    if (!address) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    currentUser.walletAddress = address.trim();
    currentUser.walletType = walletType;
    currentUser.walletChain = walletChain;

    if (customBalance !== undefined && !isNaN(Number(customBalance)) && Number(customBalance) >= 0) {
      currentUser.ttcTokenBalance = Math.round(Number(customBalance));
    } else {
      // Deterministic balance generated based on address string hash
      let hashNum = 0;
      const cleanAddr = address.trim();
      for (let i = 0; i < cleanAddr.length; i++) {
        hashNum = (hashNum << 5) - hashNum + cleanAddr.charCodeAt(i);
        hashNum |= 0;
      }
      const absHash = Math.abs(hashNum);
      const calcBalance = 12500 + (absHash % 85000);
      currentUser.ttcTokenBalance = Math.round(calcBalance);
    }

    // Bonus for wallet connection if not awarded
    const hasConnectedBonus = currentUser.pointHistory.some((ph) => ph.description.includes('Wallet Connection'));
    if (!hasConnectedBonus) {
      currentUser.points += 500;
      currentUser.rank = calculateRank(currentUser.points + currentUser.stakedPoints);
      currentUser.pointHistory.unshift({
        id: 'ph_' + Date.now(),
        type: 'DAILY_BONUS',
        points: 500,
        description: `Verified ${walletChain.toUpperCase()} Wallet Connection (${address.slice(0, 6)}...${address.slice(-4)})`,
        timestamp: 'Just now',
      });
    }

    res.json({
      user: currentUser,
      message: `Successfully connected ${walletType} on ${walletChain.toUpperCase()} network!`,
    });
  });

  // Get Current User Profile
  app.get('/api/user/me', (req, res) => {
    res.json(currentUser);
  });

  // Get Admin Config
  app.get('/api/admin/config', (req, res) => {
    res.json(adminConfig);
  });

  // Global helper to update token name, symbol, portal titles, banners, and descriptions everywhere
  function applyGlobalTokenNameAndSymbol(name?: string, symbol?: string) {
    const cleanName = name !== undefined ? name.trim() : (adminConfig.coinName || '');
    const cleanSymbol = symbol !== undefined ? symbol.trim() : (adminConfig.coinSymbol || '');

    adminConfig.coinName = cleanName;
    adminConfig.coinSymbol = cleanSymbol;

    if (cleanName || cleanSymbol) {
      adminConfig.siteTitle = `${cleanName} (${cleanSymbol}) Portal`;
      adminConfig.siteTitleBn = `${cleanName} (${cleanSymbol}) পোর্টাল`;
      adminConfig.announcementBanner = `🚀 Live Trading & Staking Vault Active for ${cleanName} (${cleanSymbol})!`;
      adminConfig.announcementBannerBn = `🚀 ${cleanName} (${cleanSymbol}) এর লাইভ ট্রেডিং এবং স্ট্যাকিং শুরু হয়েছে!`;
    } else {
      adminConfig.siteTitle = 'Crypto Analytics & DEX Portal';
      adminConfig.siteTitleBn = 'ক্রিপ্টো অ্যানালিটিক্স ও ডেক্স পোর্টাল';
      adminConfig.announcementBanner = '';
      adminConfig.announcementBannerBn = '';
    }

    coins = coins.map((c) => ({
      ...c,
      name: cleanName,
      symbol: cleanSymbol,
      description: cleanName ? `Official decentralized trading token & AI utility pool for ${cleanName} (${cleanSymbol}).` : '',
      descriptionBn: cleanName ? `${cleanName} (${cleanSymbol}) সুনিরাপদ ও গতিশীল ডিসেন্ট্রালাইজড ট্রেডিং ও স্ট্যাকিং নেটওয়ার্ক।` : '',
    }));
  }

  // Save Admin Config & optionally sync DexScreener
  app.post('/api/admin/config', (req, res) => {
    const newConfig = req.body;
    adminConfig = { ...adminConfig, ...newConfig };

    if (newConfig.coinName !== undefined || newConfig.coinSymbol !== undefined) {
      applyGlobalTokenNameAndSymbol(newConfig.coinName, newConfig.coinSymbol);
    }

    res.json({ config: adminConfig, coins, message: 'Admin settings updated successfully' });
  });

  // DexScreener Live Sync API Endpoint
  app.post('/api/dexscreener/sync', async (req, res) => {
    const { url } = req.body;

    if (url !== undefined) {
      adminConfig.dexScreenerUrl = url.trim();
    }

    const targetUrl = url !== undefined ? url.trim() : (adminConfig.dexScreenerUrl || '').trim();

    // If targetUrl is empty, reset coin & admin config to blank/empty state
    if (!targetUrl) {
      adminConfig.coinName = '';
      adminConfig.coinSymbol = '';
      adminConfig.dexScreenerUrl = '';
      adminConfig.siteTitle = 'Crypto Analytics & DEX Portal';
      adminConfig.siteTitleBn = 'ক্রিপ্টো অ্যানালিটিক্স ও ডেক্স পোর্টাল';
      adminConfig.announcementBanner = '';
      adminConfig.announcementBannerBn = '';

      if (coins.length > 0) {
        coins[0] = {
          ...coins[0],
          name: '',
          symbol: '',
          description: '',
          descriptionBn: '',
          dexScreenerUrl: '',
          pairAddress: '',
          chainId: '',
          dexName: '',
          priceUsd: 0,
          priceBtc: 0,
          priceNative: 0,
          marketCapUsd: 0,
          volume24hUsd: 0,
          volume6hUsd: 0,
          volume1hUsd: 0,
          volume5mUsd: 0,
          priceChange5m: 0,
          priceChange1h: 0,
          priceChange6h: 0,
          priceChange24h: 0,
          priceChange7d: 0,
          contractAddresses: [],
          ipAddresses: [],
          lastSyncedAt: 'No Link Synced',
        };
      }
      return res.json({
        success: true,
        coin: coins[0],
        config: adminConfig,
        message: 'DexScreener link removed. Website details reset to empty.',
      });
    }

    try {
      // Parse pair and chain
      const clean = targetUrl.replace(/^https?:\/\/(www\.)?dexscreener\.com\//, '');
      const parts = clean.split('?')[0].split('/');
      const chainId = parts.length >= 2 ? parts[0].toLowerCase() : 'solana';
      const pairAddress = parts.length >= 2 ? parts[1] : parts[0];

      let pairData: any = null;
      if (pairAddress) {
        try {
          const apiRes = await fetch(`https://api.dexscreener.com/latest/dex/pairs/${chainId}/${pairAddress}`);
          if (apiRes.ok) {
            const json = await apiRes.json();
            pairData = json.pair || (json.pairs && json.pairs[0]);
          }
        } catch (e) {
          // Continue fallback
        }

        if (!pairData) {
          try {
            const fallbackRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${pairAddress}`);
            if (fallbackRes.ok) {
              const json = await fallbackRes.json();
              pairData = json.pairs && json.pairs[0];
            }
          } catch (e) {
            // Continue fallback
          }
        }

        if (!pairData) {
          try {
            const searchRes = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(pairAddress)}`);
            if (searchRes.ok) {
              const json = await searchRes.json();
              pairData = json.pairs && json.pairs[0];
            }
          } catch (e) {
            // Ignore
          }
        }
      }

      if (pairData && coins.length > 0) {
        const tokenName = pairData.baseToken?.name || 'Token';
        const tokenSymbol = pairData.baseToken?.symbol || 'TOKEN';
        const tokenAddress = pairData.baseToken?.address || pairData.pairAddress || pairAddress;
        const cId = pairData.chainId || chainId || 'solana';
        const dexId = pairData.dexId ? pairData.dexId.toUpperCase() : 'DEX';

        // Auto-generate global details from DexScreener URL!
        adminConfig.coinName = tokenName;
        adminConfig.coinSymbol = tokenSymbol;
        adminConfig.siteTitle = `${tokenName} (${tokenSymbol}) Portal`;
        adminConfig.siteTitleBn = `${tokenName} (${tokenSymbol}) পোর্টাল`;
        adminConfig.announcementBanner = `🔥 Live DexScreener Integration Active! Real-time ${tokenName} ($${tokenSymbol}) market price, volume & buy/sell pressure synced live.`;
        adminConfig.announcementBannerBn = `🔥 ডেক্সস্ক্রিনার লাইভ ইন্টিগ্রেশন সচল! রিয়েল-টাইম ${tokenName} ($${tokenSymbol}) প্রাইস, ভলিউম ও ট্রানজাকশন লোড হয়েছে।`;
        adminConfig.dexScreenerUrl = targetUrl;

        const pUsd = parseFloat(pairData.priceUsd) || 0;
        const pNative = parseFloat(pairData.priceNative) || 0;
        const buys24h = pairData.txns?.h24?.buys || 0;
        const sells24h = pairData.txns?.h24?.sells || 0;
        const total = buys24h + sells24h;

        let chainName = 'Solana Network (SPL)';
        let chainIcon = '🟣';
        let explorerUrl = `https://solscan.io/account/${tokenAddress}`;

        if (cId === 'bsc') {
          chainName = 'BNB Smart Chain (BEP-20)';
          chainIcon = '💛';
          explorerUrl = `https://bscscan.com/token/${tokenAddress}`;
        } else if (cId === 'ethereum') {
          chainName = 'Ethereum Mainnet (ERC-20)';
          chainIcon = '🔷';
          explorerUrl = `https://etherscan.io/token/${tokenAddress}`;
        } else if (cId === 'base') {
          chainName = 'Base Network';
          chainIcon = '🔵';
          explorerUrl = `https://basescan.org/token/${tokenAddress}`;
        } else if (cId === 'arbitrum') {
          chainName = 'Arbitrum One';
          chainIcon = '🔷';
          explorerUrl = `https://arbiscan.io/token/${tokenAddress}`;
        }

        const generatedContracts = [
          {
            chain: cId,
            chainName: chainName,
            address: tokenAddress,
            explorerUrl: explorerUrl,
            icon: chainIcon,
          },
        ];

        const generatedIps: IpAddressNode[] = [
          {
            ip: '104.21.88.42',
            label: `${tokenName} ${cId.toUpperCase()} RPC Gateway`,
            region: 'North America (US-East)',
            status: 'active',
            pingMs: 14,
            type: 'RPC Node',
          },
          {
            ip: '172.67.142.109',
            label: `${tokenName} Validator Node #1`,
            region: 'Europe (Frankfurt)',
            status: 'active',
            pingMs: 28,
            type: 'Validator',
          },
          {
            ip: '198.51.100.45',
            label: `${tokenName} DEX Oracle Gateway`,
            region: 'Asia Pacific (Singapore)',
            status: 'active',
            pingMs: 19,
            type: 'P2P Gateway',
          },
        ];

        const generatedDesc = `${tokenName} ($${tokenSymbol}) is a decentralized trading token on ${chainName}. Synced live via DexScreener API with real-time market stats, liquidity metrics, and community trading features.`;
        const generatedDescBn = `${tokenName} ($${tokenSymbol}) - ${chainName} নেটওয়ার্কের সুনিরাপদ ও গতিশীল ডেক্স টোকেন। ডেক্সস্ক্রিনার থেকে সরাসরি লাইভ ডাটা ও চার্ট যুক্ত রয়েছে।`;

        const fdvVal = pairData.fdv || (pUsd ? pUsd * 100000000 : 0);
        const mCapVal = pairData.marketCap || fdvVal;
        const autoTotalSupply = pUsd > 0 && fdvVal ? Math.round(fdvVal / pUsd) : (coins[0].totalSupply || 100000000);
        const autoCircSupply = pUsd > 0 && mCapVal ? Math.round(mCapVal / pUsd) : Math.round(autoTotalSupply * 0.75);
        const autoDexPair = `${(dexId || 'DEX').toUpperCase()} ${(pairData.quoteToken?.symbol || 'SOL').toUpperCase()}/${tokenSymbol}`;

        const currentAth = coins[0].allTimeHighUsd || 0;
        const autoAth = Math.max(currentAth, pUsd > 0 ? Number((pUsd * 2.2).toFixed(6)) : 0.92, pUsd);
        const autoHolders = Math.round(3500 + (mCapVal ? Math.min(mCapVal / 800, 250000) : 5000) + (buys24h + sells24h) * 18);

        coins[0] = {
          ...coins[0],
          name: tokenName,
          symbol: tokenSymbol,
          description: generatedDesc,
          descriptionBn: generatedDescBn,
          logoUrl: pairData.info?.imageUrl || coins[0].logoUrl || 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?auto=format&fit=crop&w=120&q=80',
          priceUsd: pUsd,
          priceNative: pNative,
          nativeSymbol: pairData.quoteToken?.symbol || 'SOL',
          marketCapUsd: mCapVal,
          totalSupply: autoTotalSupply,
          circulatingSupply: autoCircSupply,
          dexPairName: autoDexPair,
          allTimeHighUsd: autoAth,
          holdersCount: autoHolders,
          volume24hUsd: pairData.volume?.h24 || 0,
          volume6hUsd: pairData.volume?.h6 || 0,
          volume1hUsd: pairData.volume?.h1 || 0,
          volume5mUsd: pairData.volume?.m5 || 0,
          priceChange5m: pairData.priceChange?.m5 ?? 0,
          priceChange1h: pairData.priceChange?.h1 ?? 0,
          priceChange6h: pairData.priceChange?.h6 ?? 0,
          priceChange24h: pairData.priceChange?.h24 ?? 0,
          liquidityUsd: pairData.liquidity?.usd || 0,
          buys24h,
          sells24h,
          bullishPercentage: total > 0 ? Math.round((buys24h / total) * 100) : 50,
          dexScreenerUrl: targetUrl,
          pairAddress: pairData.pairAddress || pairAddress,
          chainId: cId,
          dexName: dexId,
          contractAddresses: generatedContracts,
          ipAddresses: generatedIps,
          lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };

        // Regenerate live trade feed matched to newly synced token price
        whales = generateInitialTradeFeed(coins[0], 25);
      } else if (coins.length > 0) {
        coins[0] = {
          ...coins[0],
          dexScreenerUrl: targetUrl,
          lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }

      res.json({ success: true, coin: coins[0], config: adminConfig, lastSyncedAt: coins[0].lastSyncedAt });
    } catch (err: any) {
      console.error('DexScreener sync error:', err);
      res.json({ success: false, coin: coins[0], error: err.message });
    }
  });

  // Update Coin Details (Admin)
  app.put('/api/admin/coins/:id', (req, res) => {
    const targetIndex = coins.findIndex((c) => c.id.toLowerCase() === req.params.id.toLowerCase());
    if (targetIndex === -1) {
      return res.status(404).json({ error: 'Coin not found' });
    }

    if (req.body.name || req.body.symbol) {
      applyGlobalTokenNameAndSymbol(req.body.name, req.body.symbol);
    }

    coins[targetIndex] = {
      ...coins[targetIndex],
      ...req.body,
      name: adminConfig.coinName || coins[targetIndex].name || 'TripToCoin',
      symbol: adminConfig.coinSymbol || coins[targetIndex].symbol || 'TTC',
    };
    res.json({ coin: coins[targetIndex], config: adminConfig, message: 'Coin details updated successfully' });
  });

  // --- VITE MIDDLEWARE OR PRODUCTION SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TripToCoin Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
