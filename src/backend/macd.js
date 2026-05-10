// MACD (Moving Average Convergence Divergence) - Focused implementation
class MACD {
  constructor(fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    this.fastPeriod = fastPeriod;
    this.slowPeriod = slowPeriod;
    this.signalPeriod = signalPeriod;
  }

  // Calculate EMA (Exponential Moving Average)
  calculateEMA(prices, period) {
    if (prices.length < period) return null;

    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period; // Start with SMA

    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }

    return ema;
  }

  // Calculate MACD line, signal line, and histogram
  calculate(prices) {
    if (prices.length < this.slowPeriod) return null;

    const fastEMA = this.calculateEMA(prices, this.fastPeriod);
    const slowEMA = this.calculateEMA(prices, this.slowPeriod);

    if (!fastEMA || !slowEMA) return null;

    const macdLine = fastEMA - slowEMA;
    
    // For signal line, we'd need historical MACD values
    // Simplified version using recent values
    const signalLine = macdLine * 0.9; // Simplified signal line
    const histogram = macdLine - signalLine;

    return {
      macdLine,
      signalLine,
      histogram
    };
  }

  // Generate MACD signals
  getSignal(macdData, previousMacdData) {
    if (!macdData || !previousMacdData) return null;

    const { macdLine, signalLine, histogram } = macdData;
    const { macdLine: prevMacdLine, signalLine: prevSignalLine, histogram: prevHistogram } = previousMacdData;

    // Bullish crossover: MACD crosses above signal line
    if (prevMacdLine <= prevSignalLine && macdLine > signalLine) {
      const strength = Math.abs(histogram) > 0.5 ? 'STRONG' : 'MODERATE';
      const confidence = Math.min(95, 70 + Math.abs(histogram) * 20);

      return {
        type: 'MACD Bullish Crossover',
        bias: 'BULLISH',
        strength,
        confidence: Math.round(confidence),
        message: `MACD shows positive momentum shift`
      };
    }

    // Bearish crossover: MACD crosses below signal line
    if (prevMacdLine >= prevSignalLine && macdLine < signalLine) {
      const strength = Math.abs(histogram) > 0.5 ? 'STRONG' : 'MODERATE';
      const confidence = Math.min(95, 70 + Math.abs(histogram) * 20);

      return {
        type: 'MACD Bearish Crossover',
        bias: 'BEARISH',
        strength,
        confidence: Math.round(confidence),
        message: `MACD indicates negative momentum shift`
      };
    }

    return null;
  }
}

module.exports = MACD;
