const axios = require('axios');
const cron = require('node-cron');
const CoreIndicators = require('../utils/coreIndicators');
const TradeManager = require('./tradeManager');

class Core7Simulator {
  constructor() {
    this.symbols = ['BTCUSDT', 'SOLUSDT', 'DOGEUSDT', 'AVAXUSDT', 'LINKUSDT'];
    this.tradeManager = new TradeManager();
    this.baseUrl = 'https://api.binance.com';
    this.cooldownPeriod = 30 * 60 * 1000; // 30 minutes
    this.signalHistory = [];
  }

  async getKlines(symbol, interval = '1h', limit = 500) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v3/klines`, {
        params: { symbol, interval, limit }
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
      console.error('Error fetching klines:', error.message);
      return [];
    }
  }

  async getCurrentPrice(symbol) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v3/ticker/price`, {
        params: { symbol }
      });
      return parseFloat(response.data.price);
    } catch (error) {
      console.error('Error fetching price:', error.message);
      return null;
    }
  }

  createSignalKey(symbol, signalType, details) {
    return `${symbol}_${signalType}_${details.type || 'default'}`;
  }

  isInCooldown(signalKey) {
    const lastSignal = this.signalHistory
      .filter(s => s.key === signalKey)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    
    if (!lastSignal) return false;
    return (Date.now() - lastSignal.timestamp) < this.cooldownPeriod;
  }

  async openSimulatedTrade(symbol, signalType, signalData) {
    const signalKey = this.createSignalKey(symbol, signalType, signalData);
    
    if (this.isInCooldown(signalKey)) {
      console.log(`⏰ ${signalType} in cooldown period for ${symbol}`);
      return;
    }

    const currentPrice = await this.getCurrentPrice(symbol);
    if (!currentPrice) return;

    // Store signal in history
    this.signalHistory.push({
      key: signalKey,
      symbol,
      signalType,
      timestamp: Date.now(),
      entryPrice: currentPrice,
    });

    // Open simulated trade
    const trade = this.tradeManager.openTrade(symbol, signalType, currentPrice, Date.now());
    
    if (trade) {
      // Print signal details
      console.log(`🚨 ${signalType} DETECTED!`);
      console.log(`📊 ${symbol} at $${currentPrice.toFixed(4)}`);
      console.log(`⏰ ${new Date().toLocaleString()}`);
      
      if (signalData.shortMA && signalData.longMA) {
        console.log(`📈 50 MA: ${signalData.shortMA.toFixed(2)} | 200 MA: ${signalData.longMA.toFixed(2)}`);
      }
      if (signalData.rsi) {
        console.log(`📊 RSI: ${signalData.rsi.toFixed(2)}`);
      }
      if (signalData.macd && signalData.signal) {
        console.log(`📈 MACD: ${signalData.macd.toFixed(4)} | Signal: ${signalData.signal.toFixed(4)}`);
      }
      if (signalData.volume && signalData.avgVolume) {
        console.log(`📊 Volume: ${signalData.volume.toLocaleString()} (avg: ${signalData.avgVolume.toLocaleString()})`);
      }
      if (signalData.resistance) {
        console.log(`📈 Resistance: $${signalData.resistance.toFixed(2)}`);
      }
      if (signalData.support) {
        console.log(`📉 Support: $${signalData.support.toFixed(2)}`);
      }
    }
  }

  async checkSignals() {
    for (const symbol of this.symbols) {
      const klines = await this.getKlines(symbol, '1h', 500);
      if (klines.length < 200) continue;

      const currentPrice = await this.getCurrentPrice(symbol);
      if (!currentPrice) continue;

      console.log(`💰 ${symbol}: $${currentPrice.toFixed(4)} | Active trades: ${this.tradeManager.activeTrades.size}`);

      // Check all 7 signals
      const signals = [];

      // 1. Golden Cross / Death Cross
      const goldenCross = CoreIndicators.detectGoldenCross(klines);
      if (goldenCross.detected) {
        signals.push({ type: 'Golden Cross', data: goldenCross });
      }

      const deathCross = CoreIndicators.detectDeathCross(klines);
      if (deathCross.detected) {
        signals.push({ type: 'Death Cross', data: deathCross });
      }

      // 2. RSI Overbought/Oversold
      const rsiSignal = CoreIndicators.detectRSIExtremes(klines);
      if (rsiSignal.detected) {
        signals.push({ type: rsiSignal.type, data: rsiSignal });
      } else if (rsiSignal.rsi) {
        if (rsiSignal.rsi < 30) {
          console.log(`${symbol} RSI Oversold — potential buy signal`);
        }
        if (rsiSignal.rsi > 70) {
          console.log(`${symbol} RSI Overbought — potential sell signal`);
        }
      }

      // 3. MACD Crossover
      const macdSignal = CoreIndicators.detectMACDCrossover(klines);
      if (macdSignal.detected) {
        signals.push({ type: macdSignal.type, data: macdSignal });
      }

      // 4. Support/Resistance Breakout
      const breakoutSignal = CoreIndicators.detectSupportResistanceBreakout(klines);
      if (breakoutSignal.detected) {
        signals.push({ type: breakoutSignal.type, data: breakoutSignal });
      }

      // 5. Volume Spike
      const volumeSignal = CoreIndicators.detectVolumeSpike(klines);
      if (volumeSignal.detected) {
        signals.push({ type: volumeSignal.type, data: volumeSignal });
      }

      // 6. Bollinger Band Squeeze
      const bollingerSignal = CoreIndicators.detectBollingerSqueeze(klines);
      if (bollingerSignal.detected) {
        signals.push({ type: bollingerSignal.type, data: bollingerSignal });
      }

      // 7. Break & Retest
      const retestSignal = CoreIndicators.detectBreakAndRetest(klines);
      if (retestSignal.detected) {
        signals.push({ type: retestSignal.type, data: retestSignal });
      }

      // Open simulated trades for detected signals
      for (const signal of signals) {
        await this.openSimulatedTrade(symbol, signal.type, signal.data);
      }
    }

    // Check active trades for closures
    await this.tradeManager.checkTrades(this.getCurrentPrice.bind(this));
  }

  printDashboard() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TRADING SIMULATION DASHBOARD');
    console.log('='.repeat(60));
    
    const stats = this.tradeManager.getStats();
    console.log(`📈 Trades: ${stats.totalTrades} | ✅ Wins: ${stats.wins} | ❌ Losses: ${stats.losses} | ⏱️ Expired: ${stats.expired}`);
    console.log(`🎯 Win Rate: ${stats.winRate}% | 💰 PnL: ${stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}%`);
    console.log(`🔄 Active Trades: ${stats.activeTrades}`);
    
    // Show recent trades
    const recentTrades = this.tradeManager.getRecentTrades(3);
    if (recentTrades.length > 0) {
      console.log('\n📋 Recent Trades:');
      for (const trade of recentTrades) {
        const statusEmoji = trade.status === 'win' ? '✅' : trade.status === 'loss' ? '❌' : '⏱️';
        console.log(`  ${statusEmoji} ${trade.signalType} ${trade.symbol}: ${trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}%`);
      }
    }
    
    console.log('='.repeat(60) + '\n');
  }

  start() {
    console.log('🎯 Core 7 Trading Simulator Started');
    console.log('📊 Monitoring: BTCUSDT, SOLUSDT, DOGEUSDT, AVAXUSDT, LINKUSDT');
    console.log('⚡ Signals: Golden/Death Cross, RSI, MACD, Breakouts, Volume, Bollinger, Retest');
    console.log('🎮 Mode: SIMULATION (no real trading)');
    console.log('🔄 Check interval: Every minute\n');

    // Check signals every minute
    cron.schedule('* * * * *', async () => {
      await this.checkSignals();
    });

    // Update dashboard every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      this.printDashboard();
      this.tradeManager.printActiveTrades();
    });

    // Initial check and dashboard
    this.checkSignals().then(() => {
      setTimeout(() => this.printDashboard(), 2000);
    });
  }
}

const simulator = new Core7Simulator();
simulator.start();
