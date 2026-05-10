// RSI (Relative Strength Index) - Simple, focused implementation
class RSI {
  constructor(period = 14) {
    this.period = period;
    this.prices = [];
  }

  // Calculate RSI from price array
  calculate(prices) {
    if (prices.length < this.period + 1) return null;

    const gains = [];
    const losses = [];

    // Calculate price changes
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    // Calculate average gains and losses
    let avgGain = gains.slice(0, this.period).reduce((a, b) => a + b, 0) / this.period;
    let avgLoss = losses.slice(0, this.period).reduce((a, b) => a + b, 0) / this.period;

    // Calculate RSI
    for (let i = this.period; i < gains.length; i++) {
      avgGain = (avgGain * (this.period - 1) + gains[i]) / this.period;
      avgLoss = (avgLoss * (this.period - 1) + losses[i]) / this.period;
    }

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return rsi;
  }

  // Generate RSI signals
  getSignal(rsi) {
    if (rsi === null) return null;

    if (rsi <= 30) {
      return {
        type: 'RSI Oversold',
        bias: 'BULLISH',
        strength: 'STRONG',
        confidence: Math.round((30 - rsi) * 3 + 70), // 70-100% confidence
        message: `RSI Oversold at ${rsi.toFixed(1)} - Potential reversal opportunity`
      };
    }

    if (rsi >= 70) {
      return {
        type: 'RSI Overbought',
        bias: 'BEARISH',
        strength: 'STRONG',
        confidence: Math.round((rsi - 70) * 3 + 70), // 70-100% confidence
        message: `RSI Overbought at ${rsi.toFixed(1)} - Potential pullback ahead`
      };
    }

    return null;
  }
}

module.exports = RSI;
