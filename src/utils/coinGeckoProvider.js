const axios = require('axios');

class CoinGeckoProvider {
  constructor() {
    this.baseUrl = 'https://api.coingecko.com/api/v3';
    this.symbolMap = {
      'BTCUSDT': 'bitcoin',
      'SOLUSDT': 'solana', 
      'DOGEUSDT': 'dogecoin',
      'AVAXUSDT': 'avalanche-2',
      'LINKUSDT': 'chainlink'
    };
  }

  async fetchWithRetry(fn, retries = 3, operation = 'operation') {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        if (i === retries - 1) {
          console.error(`Error fetching ${operation} from CoinGecko after ${retries} retries:`, err.message);
          return null;
        }
        console.log(`Retry ${i + 1}/${retries} for ${operation} (CoinGecko)...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  async getKlines(symbol, interval = '1h', limit = 500) {
    // CoinGecko doesn't have klines like Binance, so we'll use market charts
    const coinId = this.symbolMap[symbol];
    if (!coinId) {
      console.error(`Unknown symbol: ${symbol}`);
      return null;
    }

    return this.fetchWithRetry(async () => {
      // Get OHLC data from CoinGecko
      const days = Math.min(limit / 24, 180); // Convert hours to days, max 180 days
      const response = await axios.get(`${this.baseUrl}/coins/${coinId}/ohlc`, {
        params: {
          vs_currency: 'usd',
          days: days
        }
      });

      if (!response.data || response.data.length === 0) {
        return null;
      }

      // Convert CoinGecko format to match Binance format
      // CoinGecko returns: [timestamp, open, high, low, close]
      return response.data.map((item, index) => ({
        timestamp: item[0],
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
        volume: 0, // CoinGecko OHLC doesn't include volume, we'll fetch separately if needed
      }));
    }, 3, `OHLC data for ${symbol}`);
  }

  async getCurrentPrice(symbol) {
    const coinId = this.symbolMap[symbol];
    if (!coinId) {
      console.error(`Unknown symbol: ${symbol}`);
      return null;
    }

    return this.fetchWithRetry(async () => {
      const response = await axios.get(`${this.baseUrl}/simple/price`, {
        params: {
          ids: coinId,
          vs_currencies: 'usd',
          include_24hr_change: true
        }
      });

      if (!response.data || !response.data[coinId]) {
        return null;
      }

      return parseFloat(response.data[coinId].usd);
    }, 3, `price for ${symbol}`);
  }

  async getMarketData(symbols) {
    const coinIds = symbols.map(symbol => this.symbolMap[symbol]).filter(Boolean);
    
    return this.fetchWithRetry(async () => {
      const response = await axios.get(`${this.baseUrl}/simple/price`, {
        params: {
          ids: coinIds.join(','),
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_24hr_vol: true
        }
      });

      return response.data || {};
    }, 3, 'market data');
  }
}

module.exports = CoinGeckoProvider;
