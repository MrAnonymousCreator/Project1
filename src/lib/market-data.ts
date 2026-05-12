// Market data service for TwelveData integration
const TwelveDataClient = require('../backend/twelvedataClient') as any;

export type Asset = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume: number;
  sparkline: number[];
  about: string;
};

class MarketDataService {
  private twelvedataClient: TwelveDataClient;
  private callbacks: Map<string, Function> = new Map();

  constructor() {
    this.twelvedataClient = new TwelveDataClient();
  }

  // Initialize the service
  initialize() {
    console.log('🚀 Initializing Market Data Service with TwelveData...');
    
    // Subscribe to market data
    this.twelvedataClient.onMarketData((marketData: any) => {
      this.processMarketData(marketData);
    });
    
    // Connect to TwelveData WebSocket
    this.twelvedataClient.connect();
  }

  // Process incoming market data
  private processMarketData(data: any) {
    // Emit to all callbacks
    this.callbacks.forEach(callback => callback(data));
  }

  // Subscribe to market data updates
  subscribe(callback: Function): string {
    const id = Date.now().toString() + Math.random().toString();
    this.callbacks.set(id, callback);
    return id;
  }

  // Unsubscribe from market data updates
  unsubscribe(id: string) {
    this.callbacks.delete(id);
  }

  // Get current price
  async getCurrentPrice(symbol: string): Promise<number> {
    return await this.twelvedataClient.getCurrentPrice(symbol);
  }

  // Get klines data
  async getKlines(symbol: string, interval: string = '1h', limit: number = 100): Promise<any[]> {
    return await this.twelvedataClient.getKlines(symbol, interval, limit);
  }

  // Disconnect service
  disconnect() {
    this.twelvedataClient.disconnect();
  }
}

function gen(seed: number, base: number, vol: number, n = 60): number[] {
  let s = seed;
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280 - 0.5;
    v = v * (1 + r * vol);
    out.push(v);
  }
  return out;
}

export const assets: Asset[] = [
  {
    id: "btc", symbol: "BTC", name: "Bitcoin", price: 71248.32, change24h: 2.14,
    marketCap: 1_402_000_000_000, volume: 28_400_000_000,
    sparkline: gen(11, 68000, 0.012),
    about: "The original peer-to-peer digital currency. A scarce, decentralized store of value.",
  },
  {
    id: "eth", symbol: "ETH", name: "Ethereum", price: 3812.05, change24h: 1.42,
    marketCap: 458_200_000_000, volume: 14_800_000_000,
    sparkline: gen(23, 3650, 0.014),
    about: "A programmable settlement layer powering smart contracts and decentralized applications.",
  },
  {
    id: "sol", symbol: "SOL", name: "Solana", price: 184.21, change24h: -0.86,
    marketCap: 84_300_000_000, volume: 3_100_000_000,
    sparkline: gen(31, 190, 0.02),
    about: "A high-throughput blockchain optimized for low-latency consumer applications.",
  },
  {
    id: "ada", symbol: "ADA", name: "Cardano", price: 0.612, change24h: 0.34,
    marketCap: 21_700_000_000, volume: 540_000_000,
    sparkline: gen(47, 0.6, 0.018),
    about: "A research-driven proof-of-stake network focused on sustainability and formal methods.",
  },
  {
    id: "link", symbol: "LINK", name: "Chainlink", price: 18.94, change24h: 3.21,
    marketCap: 11_200_000_000, volume: 480_000_000,
    sparkline: gen(53, 18, 0.022),
    about: "Decentralized oracle infrastructure connecting smart contracts to real-world data.",
  },
  {
    id: "matic", symbol: "MATIC", name: "Polygon", price: 0.748, change24h: -1.92,
    marketCap: 7_300_000_000, volume: 320_000_000,
    sparkline: gen(67, 0.78, 0.02),
    about: "An Ethereum scaling ecosystem of zero-knowledge rollups and sidechains.",
  },
  {
    id: "dot", symbol: "DOT", name: "Polkadot", price: 7.21, change24h: 0.92,
    marketCap: 9_800_000_000, volume: 210_000_000,
    sparkline: gen(73, 7, 0.018),
    about: "A multi-chain protocol enabling interoperability between specialized blockchains.",
  },
  {
    id: "avax", symbol: "AVAX", name: "Avalanche", price: 36.58, change24h: 1.78,
    marketCap: 14_100_000_000, volume: 410_000_000,
    sparkline: gen(89, 35, 0.021),
    about: "A platform of customizable subnets with sub-second finality.",
  },
  {
    id: "bch", symbol: "BCH", name: "Bitcoin Cash", price: 421.10, change24h: 0.42,
    marketCap: 8_300_000_000, volume: 190_000_000,
    sparkline: gen(97, 415, 0.016),
    about: "A Bitcoin fork prioritizing larger blocks and lower transaction fees.",
  },
  {
    id: "tao", symbol: "TAO", name: "Bittensor", price: 412.87, change24h: 4.12,
    marketCap: 3_100_000_000, volume: 180_000_000,
    sparkline: gen(101, 400, 0.025),
    about: "A decentralized network coordinating machine intelligence as a market.",
  },
];

export type TickerItem = { tag: string; text: string };

export const news: TickerItem[] = [
  { tag: "Momentum", text: "BTC participation remains stable during the US session" },
  { tag: "Momentum", text: "ETH momentum improving gradually as flows return to L2s" },
  { tag: "Volume", text: "SOL volatility cooling near resistance" },
  { tag: "Risk", text: "Selling pressure weakening across large-cap assets" },
  { tag: "Regulation", text: "EU finalizes MiCA implementation guidance" },
  { tag: "DeFi", text: "Stablecoin supply expands for the seventh straight week" },
  { tag: "Volume", text: "Spot ETF inflows resume at a measured pace" },
  { tag: "Momentum", text: "LINK leads sector breadth without parabolic extension" },
  { tag: "Risk", text: "Treasury yields ease, risk assets steady into the close" },
];

export type Signal = {
  time: string;
  signal: string;
  value: string;
  tone: "positive" | "negative" | "neutral";
  context: string;
};

export const signals: Signal[] = [
  {
    time: "14:02",
    signal: "RSI",
    value: "31",
    tone: "neutral",
    context:
      "RSI entered oversold territory while participation remained moderate. Similar conditions historically led to short-term stabilization rather than immediate reversal.",
  },
  {
    time: "13:48",
    signal: "MACD",
    value: "Bullish crossover",
    tone: "positive",
    context:
      "Short-term momentum crossed above its signal line on light volume. The setup is constructive but not yet confirmed by broader participation.",
  },
  {
    time: "13:30",
    signal: "Volume",
    value: "Expanding",
    tone: "positive",
    context:
      "Cumulative volume is trending above its 20-period average. Expansion during a steady price advance often precedes continuation rather than exhaustion.",
  },
  {
    time: "12:55",
    signal: "Open Interest",
    value: "Increasing",
    tone: "neutral",
    context:
      "Perpetual open interest is rising alongside spot. The market is taking on directional exposure without aggressive funding extremes.",
  },
  {
    time: "12:10",
    signal: "Funding",
    value: "+0.008%",
    tone: "neutral",
    context:
      "Funding remains close to neutral. Positioning is balanced, with neither side paying meaningfully to hold exposure.",
  },
  {
    time: "11:42",
    signal: "Realized Vol",
    value: "Cooling",
    tone: "positive",
    context:
      "Realized volatility is compressing into prior support. Quieter regimes have historically preceded directional resolutions later in the week.",
  },
];

export type Story = {
  title: string;
  source: string;
  minutes: number;
  excerpt: string;
  body: string;
};

export const stories: Story[] = [
  {
    title: "ETF flows return at a measured pace",
    source: "Markets Desk",
    minutes: 4,
    excerpt:
      "Spot product inflows resumed this week, though the cadence remains restrained compared to the spring peak.",
    body: "Allocators continue to add exposure incrementally rather than in bursts. The pattern points to portfolio rebalancing rather than speculative positioning, and aligns with the steadier intraday tape observed since late last month.",
  },
  {
    title: "Layer-2 activity quietly hits a new high",
    source: "On-Chain Notes",
    minutes: 6,
    excerpt:
      "Aggregate L2 transactions touched a fresh monthly high, led by consumer-oriented chains.",
    body: "Daily active addresses across major rollups rose without a corresponding fee spike, suggesting organic usage rather than incentive-driven activity. Settlement costs on the base layer remained muted.",
  },
  {
    title: "Stablecoin supply expands for a seventh week",
    source: "Liquidity Watch",
    minutes: 3,
    excerpt:
      "Net stablecoin issuance continued, a quiet but persistent tailwind for risk assets.",
    body: "The expansion has been led by USD-denominated tokens on high-throughput networks. Historically, sustained issuance through low-volatility regimes has coincided with broader market participation rather than concentrated rallies.",
  },
];

export type CalendarDay = { date: number; tone: "positive" | "negative" | "neutral"; change: number };

export function buildCalendar(seed = 7): CalendarDay[] {
  let s = seed;
  const days: CalendarDay[] = [];
  for (let i = 1; i <= 30; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280 - 0.5;
    const change = +(r * 6).toFixed(2);
    const tone: CalendarDay["tone"] =
      change > 0.6 ? "positive" : change < -0.6 ? "negative" : "neutral";
    days.push({ date: i, tone, change });
  }
  return days;
}

export function formatPrice(n: number): string {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(2);
  return n.toFixed(4);
}

export function formatBig(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}
