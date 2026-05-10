// Signal Engine - Orchestrates all indicators and emits signals
const RSI = require('./rsi');
const MACD = require('./macd');
const VolumeSpike = require('./volume');
const BinanceClient = require('./binanceClient');

class SignalEngine {
  constructor() {
    this.binanceClient = new BinanceClient();
    this.rsi = new RSI(14);
    this.macd = new MACD();
    this.volumeSpike = new VolumeSpike(2.0, 20);
    
    this.priceHistory = {}; // symbol -> [prices]
    this.volumeHistory = {}; // symbol -> [volumes]
    this.macdHistory = {}; // symbol -> [macd data]
    this.activeSignals = new Map(); // symbol -> signal
    this.signalCallbacks = [];
    
    this.cooldownPeriod = 5 * 60 * 1000; // 5 minutes between same signal type
    this.lastSignals = new Map(); // symbol -> { type, timestamp }
  }

  // Start the signal engine
  start() {
    console.log('🚀 Starting Signal Engine...');
    
    // Connect to Binance WebSocket
    this.binanceClient.connect();
    
    // Subscribe to market data
    this.binanceClient.subscribe((marketData) => {
      this.processMarketData(marketData);
    });

    // Load historical data for indicators
    this.loadHistoricalData();
  }

  // Load historical data for technical indicators
  async loadHistoricalData() {
    console.log('📊 Loading historical data...');
    
    const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'DOGEUSDT', 'AVAXUSDT', 'LINKUSDT'];
    
    for (const symbol of symbols) {
      try {
        const klines = await this.binanceClient.getKlines(symbol, '1h', 100);
        
        this.priceHistory[symbol] = klines.map(k => k.close);
        this.volumeHistory[symbol] = klines.map(k => k.volume);
        
        // Initialize MACD history
        this.macdHistory[symbol] = [];
        for (let i = 0; i < klines.length; i++) {
          const prices = klines.slice(0, i + 1).map(k => k.close);
          const macdData = this.macd.calculate(prices);
          if (macdData) {
            this.macdHistory[symbol].push(macdData);
          }
        }
        
        console.log(`✅ Loaded ${klines.length} data points for ${symbol}`);
      } catch (error) {
        console.error(`❌ Error loading data for ${symbol}:`, error);
      }
    }
  }

  // Process incoming market data
  processMarketData(marketData) {
    const { symbol, price, volume } = marketData;
    
    // Update price and volume history
    if (!this.priceHistory[symbol]) {
      this.priceHistory[symbol] = [];
      this.volumeHistory[symbol] = [];
    }
    
    this.priceHistory[symbol].push(price);
    this.volumeHistory[symbol].push(volume);
    
    // Keep only recent data (last 200 points)
    if (this.priceHistory[symbol].length > 200) {
      this.priceHistory[symbol] = this.priceHistory[symbol].slice(-200);
      this.volumeHistory[symbol] = this.volumeHistory[symbol].slice(-200);
    }
    
    // Generate signals
    this.generateSignals(symbol, marketData);
  }

  // Generate signals for a symbol
  generateSignals(symbol, marketData) {
    const signals = [];
    
    // RSI Signal
    const rsiValue = this.rsi.calculate(this.priceHistory[symbol]);
    const rsiSignal = this.rsi.getSignal(rsiValue);
    if (rsiSignal && this.canEmitSignal(symbol, 'RSI')) {
      signals.push({
        ...rsiSignal,
        symbol,
        price: marketData.price,
        change: marketData.change,
        timestamp: Date.now()
      });
    }
    
    // MACD Signal
    const currentMacd = this.macd.calculate(this.priceHistory[symbol]);
    const previousMacd = this.macdHistory[symbol]?.slice(-2)[0];
    
    if (currentMacd && previousMacd) {
      const macdSignal = this.macd.getSignal(currentMacd, previousMacd);
      if (macdSignal && this.canEmitSignal(symbol, 'MACD')) {
        signals.push({
          ...macdSignal,
          symbol,
          price: marketData.price,
          change: marketData.change,
          timestamp: Date.now()
        });
      }
    }
    
    // Update MACD history
    if (currentMacd) {
      this.macdHistory[symbol] = this.macdHistory[symbol] || [];
      this.macdHistory[symbol].push(currentMacd);
      if (this.macdHistory[symbol].length > 100) {
        this.macdHistory[symbol] = this.macdHistory[symbol].slice(-100);
      }
    }
    
    // Volume Spike Signal
    const volumeSignal = this.volumeSpike.getSignal(marketData.volume, this.volumeHistory[symbol]);
    if (volumeSignal && this.canEmitSignal(symbol, 'Volume')) {
      signals.push({
        ...volumeSignal,
        symbol,
        price: marketData.price,
        change: marketData.change,
        timestamp: Date.now()
      });
    }
    
    // Emit signals
    signals.forEach(signal => {
      this.emitSignal(signal);
    });
  }

  // Check if we can emit a signal (cooldown period)
  canEmitSignal(symbol, signalType) {
    const key = `${symbol}_${signalType}`;
    const lastSignal = this.lastSignals.get(key);
    
    if (!lastSignal) return true;
    
    const timeSinceLastSignal = Date.now() - lastSignal.timestamp;
    return timeSinceLastSignal > this.cooldownPeriod;
  }

  // Emit a signal to all subscribers
  emitSignal(signal) {
    console.log(`📈 Signal: ${signal.symbol} - ${signal.type} (${signal.bias})`);
    
    // Update last signal time
    const key = `${signal.symbol}_${signal.type.split(' ')[0]}`;
    this.lastSignals.set(key, { type: signal.type, timestamp: Date.now() });
    
    // Update active signals
    this.activeSignals.set(signal.symbol, signal);
    
    // Notify all callbacks
    this.signalCallbacks.forEach(callback => {
      try {
        callback(signal);
      } catch (error) {
        console.error('❌ Error in signal callback:', error);
      }
    });
  }

  // Subscribe to signal updates
  onSignal(callback) {
    this.signalCallbacks.push(callback);
  }

  // Get current active signals
  getActiveSignals() {
    return Array.from(this.activeSignals.values());
  }

  // Stop the signal engine
  stop() {
    console.log('🛑 Stopping Signal Engine...');
    this.binanceClient.disconnect();
    this.signalCallbacks = [];
    this.activeSignals.clear();
  }
}

module.exports = SignalEngine;
