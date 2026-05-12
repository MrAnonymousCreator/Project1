// Signal Engine - Orchestrates all indicators and emits signals
const TwelveDataClient = require('./twelvedataClient');
const RSI = require('./rsi');
const MACD = require('./macd');
const VolumeSpike = require('./volume');

class SignalEngine {
  constructor() {
    this.twelvedataClient = new TwelveDataClient();
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
    console.log('🚀 Starting Signal Engine with TwelveData...');
    
    // Subscribe to market data
    this.twelvedataClient.onMarketData((marketData) => {
      this.processMarketData(marketData);
    });
    
    // Connect to TwelveData WebSocket
    this.twelvedataClient.connect();
    
    // Start periodic analysis
    this.startPeriodicAnalysis();
  }

  // Load historical data for technical indicators
  async loadHistoricalData() {
    console.log('📊 Loading historical data...');
    
    const symbols = ['BTC', 'ETH', 'SOL', 'DOGE', 'AVAX', 'LINK'];
    
    for (const symbol of symbols) {
      try {
        const klines = await this.twelvedataClient.getKlines(symbol, '1h', 100);
        
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
        console.error(`❌ Error loading historical data for ${symbol}:`, error);
      }
    }
  }

  // Start periodic analysis
  startPeriodicAnalysis() {
    console.log('⏰ Starting periodic analysis...');
    
    // Load historical data first
    this.loadHistoricalData().then(() => {
      // Run analysis every 30 seconds
      this.analysisInterval = setInterval(() => {
        this.runAnalysis();
      }, 30000);
      
      // Run initial analysis
      this.runAnalysis();
    });
  }

  // Run analysis on all symbols
  runAnalysis() {
    const symbols = Object.keys(this.priceHistory);
    
    for (const symbol of symbols) {
      this.analyzeSymbol(symbol);
    }
  }

  // Analyze a single symbol
  analyzeSymbol(symbol) {
    const prices = this.priceHistory[symbol];
    const volumes = this.volumeHistory[symbol];
    
    if (!prices || prices.length < 20) return; // Need enough data for analysis
    
    // RSI analysis
    const rsiValue = this.rsi.calculate(prices);
    const rsiSignal = this.rsi.getSignal(rsiValue);
    
    if (rsiSignal) {
      const signal = {
        symbol: symbol.replace('-USD', ''),
        type: rsiSignal.type,
        bias: rsiSignal.bias,
        strength: rsiSignal.strength,
        confidence: rsiSignal.confidence,
        message: rsiSignal.message,
        price: prices[prices.length - 1],
        change: this.calculateChange(prices),
        timestamp: Date.now()
      };
      
      this.emitSignal(signal);
    }
    
    // MACD analysis
    if (this.macdHistory[symbol] && this.macdHistory[symbol].length >= 2) {
      const currentMacd = this.macdHistory[symbol][this.macdHistory[symbol].length - 1];
      const previousMacd = this.macdHistory[symbol][this.macdHistory[symbol].length - 2];
      
      const macdSignal = this.macd.getSignal(currentMacd, previousMacd);
      
      if (macdSignal) {
        const signal = {
          symbol: symbol.replace('-USD', ''),
          type: macdSignal.type,
          bias: macdSignal.bias,
          strength: macdSignal.strength,
          confidence: macdSignal.confidence,
          message: macdSignal.message,
          price: prices[prices.length - 1],
          change: this.calculateChange(prices),
          timestamp: Date.now()
        };
        
        this.emitSignal(signal);
      }
    }
    
    // Volume analysis
    if (volumes && volumes.length >= 20) {
      const currentVolume = volumes[volumes.length - 1];
      const volumeSignal = this.volumeSpike.getSignal(currentVolume, volumes);
      
      if (volumeSignal) {
        const signal = {
          symbol: symbol.replace('-USD', ''),
          type: volumeSignal.type,
          bias: volumeSignal.bias,
          strength: volumeSignal.strength,
          confidence: volumeSignal.confidence,
          message: volumeSignal.message,
          price: prices[prices.length - 1],
          change: this.calculateChange(prices),
          timestamp: Date.now()
        };
        
        this.emitSignal(signal);
      }
    }
  }

  // Calculate price change percentage
  calculateChange(prices) {
    if (prices.length < 2) return 0;
    const current = prices[prices.length - 1];
    const previous = prices[prices.length - 2];
    return ((current - previous) / previous) * 100;
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
    
    // Add sparkline data to signal
    signal.sparkline = this.generateSparklineData(signal.symbol);
    
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

  // Generate sparkline data for visual movement
  generateSparklineData(symbol) {
    const history = this.priceHistory[symbol];
    if (!history || history.length < 10) {
      return Array.from({ length: 10 }, () => (Math.random() - 0.5) * 2);
    }
    
    // Get last 10 points and normalize to percentage changes
    const recent = history.slice(-10);
    const basePrice = recent[0];
    
    return recent.map(price => ((price - basePrice) / basePrice) * 100);
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
    
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }
    
    this.coinbaseClient.disconnect();
  }
}

module.exports = SignalEngine;
