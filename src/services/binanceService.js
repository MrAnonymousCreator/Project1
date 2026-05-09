const axios = require('axios');
const config = require('../config');

class BinanceService {
  constructor() {
    this.baseUrl = config.binance.baseUrl;
  }

  async getKlines(symbol, interval = '1h', limit = 500) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v3/klines`, {
        params: {
          symbol,
          interval,
          limit,
        },
      });
      
      return response.data.map(kline => ({
        timestamp: parseInt(kline[0]),
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
      }));
    } catch (error) {
      console.error(`Error fetching klines for ${symbol}:`, error.message);
      throw error;
    }
  }

  async getCurrentPrice(symbol) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v3/ticker/price`, {
        params: { symbol },
      });
      
      return parseFloat(response.data.price);
    } catch (error) {
      console.error(`Error fetching current price for ${symbol}:`, error.message);
      throw error;
    }
  }

  async get24hrStats(symbol) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v3/ticker/24hr`, {
        params: { symbol },
      });
      
      return {
        symbol: response.data.symbol,
        priceChange: parseFloat(response.data.priceChange),
        priceChangePercent: parseFloat(response.data.priceChangePercent),
        currentPrice: parseFloat(response.data.lastPrice),
        volume: parseFloat(response.data.volume),
        high24h: parseFloat(response.data.highPrice),
        low24h: parseFloat(response.data.lowPrice),
      };
    } catch (error) {
      console.error(`Error fetching 24hr stats for ${symbol}:`, error.message);
      throw error;
    }
  }
}

module.exports = new BinanceService();
