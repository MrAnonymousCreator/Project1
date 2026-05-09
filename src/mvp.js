const axios = require('axios');
const cron = require('node-cron');

class RSITracker {
  constructor() {
    this.symbol = 'BTCUSDT';
    this.rsiPeriod = 14;
    this.oversoldThreshold = 30;
    this.priceHistory = [];
    this.activeSignals = new Map();
    this.baseUrl = 'https://api.binance.com';
  }

  async getCurrentPrice() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v3/ticker/price`, {
        params: { symbol: this.symbol }
      });
      return parseFloat(response.data.price);
    } catch (error) {
      console.error('Error fetching price:', error.message);
      return null;
    }
  }

  async getKlines(limit = 50) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v3/klines`, {
        params: {
          symbol: this.symbol,
          interval: '1m',
          limit
        }
      });
      
      return response.data.map(kline => ({
        timestamp: parseInt(kline[0]),
        close: parseFloat(kline[4])
      }));
    } catch (error) {
      console.error('Error fetching klines:', error.message);
      return [];
    }
  }

  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;

    const gains = [];
    const losses = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    }

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return rsi;
  }

  async checkRSI() {
    const klines = await this.getKlines(50);
    if (klines.length < 15) return;

    const closes = klines.map(k => k.close);
    const rsi = this.calculateRSI(closes, this.rsiPeriod);
    const currentPrice = await this.getCurrentPrice();

    if (rsi === null || currentPrice === null) return;

    console.log(`💰 ${this.symbol}: $${currentPrice.toFixed(2)} | RSI: ${rsi.toFixed(2)}`);

    if (rsi < this.oversoldThreshold && !this.activeSignals.has(this.symbol)) {
      console.log(`\n🚨 RSI OVERSOLD SIGNAL!`);
      console.log(`📊 ${this.symbol} at $${currentPrice.toFixed(2)} | RSI: ${rsi.toFixed(2)}`);
      
      this.activeSignals.set(this.symbol, {
        entryPrice: currentPrice,
        entryTime: new Date(),
        peakPrice: currentPrice,
        rsi: rsi
      });

      setTimeout(() => this.closeSignal(this.symbol), 60 * 60 * 1000);
    }
  }

  async trackPeak() {
    if (!this.activeSignals.has(this.symbol)) return;

    const currentPrice = await this.getCurrentPrice();
    if (currentPrice === null) return;

    const signal = this.activeSignals.get(this.symbol);
    if (currentPrice > signal.peakPrice) {
      signal.peakPrice = currentPrice;
      const peakGain = ((signal.peakPrice - signal.entryPrice) / signal.entryPrice) * 100;
      console.log(`📈 New peak: $${signal.peakPrice.toFixed(2)} (+${peakGain.toFixed(2)}%)`);
    }
  }

  closeSignal(symbol) {
    if (!this.activeSignals.has(symbol)) return;

    const signal = this.activeSignals.get(symbol);
    const entryGain = ((signal.peakPrice - signal.entryPrice) / signal.entryPrice) * 100;
    
    console.log(`\n⏰ SIGNAL CLOSED (1 hour)`);
    console.log(`📊 ${symbol}`);
    console.log(`💰 Entry: $${signal.entryPrice.toFixed(2)}`);
    console.log(`📈 Peak: $${signal.peakPrice.toFixed(2)} (+${entryGain.toFixed(2)}%)`);
    console.log(`⏰ Entry time: ${signal.entryTime.toLocaleString()}`);
    console.log(`⏰ Close time: ${new Date().toLocaleString()}`);
    console.log(`📈 RSI at entry: ${signal.rsi.toFixed(2)}\n`);

    this.activeSignals.delete(symbol);
  }

  start() {
    console.log('🎯 RSI Oversold Tracker Started');
    console.log('📊 Monitoring: BTCUSDT');
    console.log('⚡ RSI Period: 14 | Oversold: < 30');
    console.log('⏰ Tracking duration: 1 hour\n');

    cron.schedule('* * * * *', async () => {
      await this.checkRSI();
      await this.trackPeak();
    });

    this.checkRSI();
  }
}

const tracker = new RSITracker();
tracker.start();
