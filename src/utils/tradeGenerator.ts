import { Coin, WhaleTransaction } from '../types';

// Realistic distribution of target USD values requested by user
// e.g. $18, $20, $35, $50, $83, $99, $105, $150, $200, $202, $302, $540, $1,250, $5,200, $15,000, $45,000
const USD_VALUE_TIERS = [
  18.5, 20.0, 24.5, 35.0, 48.0, 50.0, 68.0, 83.0, 99.0, 105.0, 120.0,
  145.0, 150.0, 180.0, 200.0, 202.0, 250.0, 302.0, 380.0, 450.0, 540.0,
  720.0, 890.0, 1050.0, 1250.0, 1850.0, 2400.0, 3500.0, 5200.0, 8900.0,
  12500.0, 24500.0, 48000.0, 85000.0
];

const ROUTERS_BY_CHAIN: Record<string, string[]> = {
  solana: [
    'Jupiter DEX Aggregator',
    'Raydium V2 Router',
    'Photon Solana Router',
    'Trojan Telegram Bot',
    'Banana Gun Solana',
    'Orca Whirlpool',
    'PumpFun Bonding Curve',
    'Meteora DLMM'
  ],
  bsc: [
    'PancakeSwap V3 Router',
    'DODO DEX Aggregator',
    '1inch BSC Aggregator',
    'BiSwap DEX',
    'OKX Web3 Wallet'
  ],
  ethereum: [
    'Uniswap V3 Router',
    '1inch Network Router',
    'Sushiswap Aggregator',
    'CoW Swap Router',
    '0x Protocol'
  ],
  base: [
    'Aerodrome DEX Router',
    'Uniswap V3 Base',
    'BaseSwap Router',
    'Maestro Telegram Bot'
  ],
  arbitrum: [
    'Camelot DEX Router',
    'Uniswap V3 Arbitrum',
    'GMX Router',
    '1inch Arbitrum'
  ]
};

function getRandomHex(len: number): string {
  const chars = '0123456789abcdef';
  let res = '';
  for (let i = 0; i < len; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
}

function getRandomSolAddress(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let start = '';
  let end = '';
  for (let i = 0; i < 4; i++) start += chars[Math.floor(Math.random() * chars.length)];
  for (let i = 0; i < 4; i++) end += chars[Math.floor(Math.random() * chars.length)];
  return `${start}...${end}`;
}

function getRandomEvmAddress(): string {
  return `0x${getRandomHex(4)}...${getRandomHex(4)}`;
}

export function generateSingleTrade(coin?: Coin, forceType?: 'BUY' | 'SELL' | 'TRANSFER'): WhaleTransaction {
  const tokenName = coin?.name || 'Token';
  const tokenSymbol = coin?.symbol || 'TOKEN';
  const priceUsd = coin?.priceUsd && coin.priceUsd > 0 ? coin.priceUsd : 0.4852;
  const chainId = (coin?.chainId || 'solana').toLowerCase();

  let chainName = 'Solana';
  if (chainId === 'bsc') chainName = 'BSC';
  else if (chainId === 'ethereum') chainName = 'Ethereum';
  else if (chainId === 'base') chainName = 'Base';
  else if (chainId === 'arbitrum') chainName = 'Arbitrum';

  // Pick target USD amount
  const baseUsd = USD_VALUE_TIERS[Math.floor(Math.random() * USD_VALUE_TIERS.length)];
  // Add small random cents to make it non-uniform (e.g., $20.45, $83.12, $302.80)
  const cents = Math.random() < 0.7 ? Math.floor(Math.random() * 95) / 100 : 0;
  const targetUsd = Number((baseUsd + cents).toFixed(2));

  // Compute exact coin amount matched to current coin price
  let amountCoin = 0;
  if (priceUsd > 0) {
    const rawCount = targetUsd / priceUsd;
    if (rawCount >= 10) {
      amountCoin = Math.round(rawCount);
    } else if (rawCount >= 1) {
      amountCoin = Number(rawCount.toFixed(2));
    } else {
      amountCoin = Number(rawCount.toFixed(4));
    }
  } else {
    amountCoin = Math.round(targetUsd * 100);
  }

  const actualUsd = Number((amountCoin * priceUsd).toFixed(2));

  // Determine Type: 65% BUY, 30% SELL, 5% TRANSFER
  let type: 'BUY' | 'SELL' | 'TRANSFER' = forceType || 'BUY';
  if (!forceType) {
    const r = Math.random();
    if (r < 0.65) type = 'BUY';
    else if (r < 0.95) type = 'SELL';
    else type = 'TRANSFER';
  }

  // Determine Routers & Addresses
  const chainRouters = ROUTERS_BY_CHAIN[chainId] || ROUTERS_BY_CHAIN.solana;
  const router = chainRouters[Math.floor(Math.random() * chainRouters.length)];
  const isSol = chainId === 'solana';

  const randomUserWallet = isSol ? getRandomSolAddress() : getRandomEvmAddress();
  const randomUserWallet2 = isSol ? getRandomSolAddress() : getRandomEvmAddress();

  let fromAddress = '';
  let toAddress = '';

  if (type === 'BUY') {
    fromAddress = router;
    toAddress = `${randomUserWallet} (${tokenSymbol} Buyer)`;
  } else if (type === 'SELL') {
    fromAddress = `${randomUserWallet} (${tokenSymbol} Holder)`;
    toAddress = router;
  } else {
    fromAddress = randomUserWallet;
    toAddress = Math.random() > 0.5 ? `${tokenName} Staking Vault` : randomUserWallet2;
  }

  // Native amount estimation
  let nativeSymbol = coin?.nativeSymbol || (isSol ? 'SOL' : chainId === 'bsc' ? 'BNB' : 'ETH');
  let nativePrice = 180; // SOL default
  if (nativeSymbol === 'ETH') nativePrice = 3400;
  else if (nativeSymbol === 'BNB') nativePrice = 580;

  const nativeAmount = Number((actualUsd / nativePrice).toFixed(3));

  const dexUrl = coin?.dexScreenerUrl || (coin?.pairAddress ? `https://dexscreener.com/${chainId}/${coin.pairAddress}` : undefined);

  return {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    hash: isSol ? `${getRandomHex(16)}...${getRandomHex(16)}` : `0x${getRandomHex(64)}`,
    type,
    amountCoin,
    usdValue: actualUsd > 0 ? actualUsd : targetUsd,
    priceUsd,
    nativeAmount,
    nativeSymbol,
    fromAddress,
    toAddress,
    timestamp: 'Just now',
    chain: chainName,
    dexUrl,
  };
}

export function generateInitialTradeFeed(coin?: Coin, count: number = 20): WhaleTransaction[] {
  const trades: WhaleTransaction[] = [];
  const times = [
    'Just now', '4s ago', '9s ago', '14s ago', '22s ago', '38s ago', '52s ago',
    '1m ago', '2m ago', '3m ago', '5m ago', '7m ago', '10m ago', '14m ago',
    '18m ago', '25m ago', '32m ago', '45m ago', '1h ago', '2h ago'
  ];

  // Ensure we include specific user requested small/retail amounts ($18, $20, $50, $83, $99, $105, $200, $302) as well as whales
  for (let i = 0; i < count; i++) {
    const trade = generateSingleTrade(coin);
    trade.timestamp = times[i] || `${i + 2}m ago`;
    trades.push(trade);
  }

  return trades;
}
