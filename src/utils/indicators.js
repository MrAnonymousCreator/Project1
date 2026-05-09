class TechnicalIndicators {
  static calculateSMA(data, period) {
    if (data.length < period) {
      throw new Error(`Not enough data points for SMA calculation. Need ${period}, have ${data.length}`);
    }

    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  static calculateEMA(data, period) {
    if (data.length < period) {
      throw new Error(`Not enough data points for EMA calculation. Need ${period}, have ${data.length}`);
    }

    const multiplier = 2 / (period + 1);
    const ema = [];
    
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[i];
    }
    ema.push(sum / period);

    for (let i = period; i < data.length; i++) {
      const currentEMA = (data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
      ema.push(currentEMA);
    }
    
    return ema;
  }

  static detectGoldenCross(prices, shortPeriod = 50, longPeriod = 200) {
    if (prices.length < Math.max(shortPeriod, longPeriod) + 1) {
      return { detected: false, reason: 'Insufficient data' };
    }

    const closes = prices.map(p => p.close);
    const shortMA = this.calculateSMA(closes, shortPeriod);
    const longMA = this.calculateSMA(closes, longPeriod);

    const shortMALength = shortMA.length;
    const longMALength = longMA.length;

    const lastShortMA = shortMA[shortMALength - 1];
    const lastLongMA = longMA[longMALength - 1];
    const prevShortMA = shortMA[shortMALength - 2];
    const prevLongMA = longMA[longMALength - 2];

    const wasBelow = prevShortMA <= prevLongMA;
    const isAbove = lastShortMA > lastLongMA;

    if (wasBelow && isAbove) {
      const crossoverStrength = ((lastShortMA - lastLongMA) / lastLongMA) * 100;
      
      return {
        detected: true,
        timestamp: prices[prices.length - 1].timestamp,
        price: prices[prices.length - 1].close,
        shortMA: lastShortMA,
        longMA: lastLongMA,
        crossoverStrength: crossoverStrength,
        shortPeriod,
        longPeriod,
      };
    }

    return { detected: false };
  }

  static detectDeathCross(prices, shortPeriod = 50, longPeriod = 200) {
    if (prices.length < Math.max(shortPeriod, longPeriod) + 1) {
      return { detected: false, reason: 'Insufficient data' };
    }

    const closes = prices.map(p => p.close);
    const shortMA = this.calculateSMA(closes, shortPeriod);
    const longMA = this.calculateSMA(closes, longPeriod);

    const shortMALength = shortMA.length;
    const longMALength = longMA.length;

    const lastShortMA = shortMA[shortMALength - 1];
    const lastLongMA = longMA[longMALength - 1];
    const prevShortMA = shortMA[shortMALength - 2];
    const prevLongMA = longMA[longMALength - 2];

    const wasAbove = prevShortMA >= prevLongMA;
    const isBelow = lastShortMA < lastLongMA;

    if (wasAbove && isBelow) {
      const crossoverStrength = ((lastLongMA - lastShortMA) / lastLongMA) * 100;
      
      return {
        detected: true,
        timestamp: prices[prices.length - 1].timestamp,
        price: prices[prices.length - 1].close,
        shortMA: lastShortMA,
        longMA: lastLongMA,
        crossoverStrength: crossoverStrength,
        shortPeriod,
        longPeriod,
      };
    }

    return { detected: false };
  }
}

module.exports = TechnicalIndicators;
