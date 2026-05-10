const axios = require('axios');

class BinanceProvider {
  constructor() {
    this.baseUrl = 'https://api.binance.com/api/v3';
    this.rateLimits = {
      requestsPerSecond: 10,
      requestsPerMinute: 1200
    };
    this.lastRequestTime = 0;
    this.requestQueue = [];
  }

  async fetchWithRetry(fn, retries = 3, operation = 'operation') {
    for (let i = 0; i < retries; i++) {
      try {
        // Rate limiting: ensure we don't exceed Binance limits
        await this.rateLimit();
        return await fn();
      } catch (err) {
        if (i === retries - 1) {
          console.error(`Error fetching ${operation} from Binance after ${retries} retries:`, err.message);
          if (err.response?.status === 429) {
            console.log('Rate limit exceeded, waiting longer...');
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
          return null;
        }
        console.log(`Retry ${i + 1}/${retries} for ${operation} (Binance)...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 1000 / this.rateLimits.requestsPerSecond; // 100ms for 10 requests per second

    if (timeSinceLastRequest < minInterval) {
      await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest));
    }
    
    this.lastRequestTime = Date.now();
  }

  async getKlines(symbol, interval = '1h', limit = 500) {
    return this.fetchWithRetry(async () => {
      const response = await axios.get(`${this.baseUrl}/klines`, {
        params: {
          symbol: symbol,
          interval: interval,
          limit: limit
        }
      });

      if (!response.data || response.data.length === 0) {
        return null;
      }

      // Convert Binance klines format to our standard format
      // Binance returns: [timestamp, open, high, low, close, volume, closeTime, quoteAssetVolume, numberOfTrades, takerBuyBaseVolume, takerBuyQuoteVolume, ignore]
      return response.data.map(item => ({
        timestamp: item[0],
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
        volume: parseFloat(item[5])
      }));
    }, 3, `klines data for ${symbol}`);
  }

  async getCurrentPrice(symbol) {
    return this.fetchWithRetry(async () => {
      const response = await axios.get(`${this.baseUrl}/ticker/price`, {
        params: {
          symbol: symbol
        }
      });

      if (!response.data || !response.data.price) {
        return null;
      }

      return parseFloat(response.data.price);
    }, 3, `price for ${symbol}`);
  }

  async get24hrTicker(symbol) {
    return this.fetchWithRetry(async () => {
      const response = await axios.get(`${this.baseUrl}/ticker/24hr`, {
        params: {
          symbol: symbol
        }
      });

      if (!response.data) {
        return null;
      }

      return {
        symbol: response.data.symbol,
        price: parseFloat(response.data.lastPrice),
        change: parseFloat(response.data.priceChange),
        changePercent: parseFloat(response.data.priceChangePercent),
        volume: parseFloat(response.data.volume),
        quoteVolume: parseFloat(response.data.quoteVolume),
        openTime: response.data.openTime,
        closeTime: response.data.closeTime,
        count: response.data.count
      };
    }, 3, `24hr ticker for ${symbol}`);
  }

  async getMarketData(symbols) {
    const tickers = [];
    
    for (const symbol of symbols) {
      const ticker = await this.get24hrTicker(symbol);
      if (ticker) {
        tickers.push(ticker);
      }
    }

    // Convert to object format for compatibility
    const result = {};
    tickers.forEach(ticker => {
      result[ticker.symbol] = {
        price: ticker.price,
        change: ticker.change,
        changePercent: ticker.changePercent,
        volume: ticker.volume,
        quoteVolume: ticker.quoteVolume
      };
    });

    return result;
  }

  async getExchangeInfo() {
    return this.fetchWithRetry(async () => {
      const response = await axios.get(`${this.baseUrl}/exchangeInfo`);
      return response.data;
    }, 3, 'exchange info');
  }

  async getServerTime() {
    return this.fetchWithRetry(async () => {
      const response = await axios.get(`${this.baseUrl}/time`);
      return response.data.serverTime;
    }, 3, 'server time');
  }

  // Method to get supported symbols
  getSupportedSymbols() {
    return [
      'BTCUSDT',
      'ETHUSDT', 
      'SOLUSDT',
      'DOGEUSDT',
      'AVAXUSDT',
      'LINKUSDT',
      'BNBUSDT',
      'ADAUSDT',
      'DOTUSDT',
      'MATICUSDT'
    ];
  }

  // Health check method
  async healthCheck() {
    try {
      const serverTime = await this.getServerTime();
      return { 
        status: 'ok', 
        serverTime: serverTime,
        provider: 'Binance'
      };
    } catch (error) {
      return { 
        status: 'error', 
        error: error.message,
        provider: 'Binance'
      };
    }
  }
}

module.exports = BinanceProvider;
