const binanceService = require('../services/binanceService');
const TechnicalIndicators = require('../utils/indicators');
const config = require('../config');

class GoldenCrossSignal {
  constructor() {
    this.name = 'Golden Cross';
    this.category = 'Trend';
    this.description = '50-day moving average crosses above 200-day moving average';
  }

  async check(symbol) {
    try {
      const klines = await binanceService.getKlines(symbol, '1d', 250);
      
      const result = TechnicalIndicators.detectGoldenCross(
        klines,
        config.indicators.shortMAPeriod,
        config.indicators.longMAPeriod
      );

      if (result.detected) {
        const currentPrice = await binanceService.getCurrentPrice(symbol);
        const stats = await binanceService.get24hrStats(symbol);

        return {
          signal: this.name,
          symbol,
          category: this.category,
          detected: true,
          timestamp: result.timestamp,
          price: currentPrice,
          shortMA: result.shortMA,
          longMA: result.longMA,
          crossoverStrength: result.crossoverStrength,
          marketData: {
            priceChange24h: stats.priceChange,
            priceChangePercent24h: stats.priceChangePercent,
            volume24h: stats.volume,
            high24h: stats.high24h,
            low24h: stats.low24h,
          },
          message: `🚀 GOLDEN CROSS DETECTED for ${symbol}!
💰 Current Price: $${currentPrice.toFixed(2)}
📈 50 MA: ${result.shortMA.toFixed(2)}
📊 200 MA: ${result.longMA.toFixed(2)}
⚡ Crossover Strength: ${result.crossoverStrength.toFixed(2)}%
📊 24h Change: ${stats.priceChangePercent.toFixed(2)}%
📊 Volume: ${stats.volume.toLocaleString()}`,
        };
      }

      return {
        signal: this.name,
        symbol,
        detected: false,
      };
    } catch (error) {
      console.error(`Error checking Golden Cross for ${symbol}:`, error.message);
      return {
        signal: this.name,
        symbol,
        detected: false,
        error: error.message,
      };
    }
  }
}

module.exports = new GoldenCrossSignal();
