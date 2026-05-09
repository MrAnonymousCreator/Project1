const axios = require('axios');
const cron = require('node-cron');
const CoreIndicators = require('./utils/coreIndicators');
const SignalStateManager = require('./utils/signalStateManager');
const PerformanceEngine = require('./performance/performanceEngine');

class Core7Tracker {
  constructor() {
    this.symbols = ['BTCUSDT', 'SOLUSDT', 'DOGEUSDT', 'AVAXUSDT', 'LINKUSDT'];
    this.activeSignals = new Map();
    this.signalHistory = [];
    this.baseUrl = 'https://api.binance.com';
    this.cooldownPeriod = 30 * 60 * 1000; // 30 minutes
    this.signalStateManager = new SignalStateManager();
    this.priceHistory = new Map(); // symbol -> [prices]
    this.marketStates = new Map(); // symbol -> current market state
    this.performanceEngine = new PerformanceEngine();
    
    // Core 7 signals only
    this.core7Signals = [
      'Golden Cross', 'Death Cross', 'RSI Oversold', 'RSI Overbought',
      'MACD Bullish Crossover', 'MACD Bearish Crossover', 
      'Resistance Breakout', 'Support Breakdown', 'Volume Spike', 
      'Bollinger Band Squeeze', 'Break & Retest (Support)', 'Break & Retest (Resistance)'
    ];
    
    // Smart filter to prevent duplicate signals
    this.lastSignalTimes = new Map(); // signalType -> timestamp
    this.lastGlobalSignalTime = new Map(); // symbol -> timestamp (global cooldown)
    this.lastEventTime = new Map(); // symbol -> timestamp (event cooldown)
    this.currentMarketEvent = new Map(); // symbol -> event data (grouping)
    
    // Smart update tracking to reduce spam
    this.lastUpdateLog = new Map(); // signalKey -> last logged value
    
    // Trade lifecycle state machine
    this.tradeStates = new Map(); // symbol -> trade state
    this.tradeSetups = new Map(); // symbol -> setup data
  }

  async fetchWithRetry(fn, retries = 3, operation = 'operation') {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        if (i === retries - 1) {
          console.error(`Error fetching ${operation} after ${retries} retries:`, err.message);
          return null;
        }
        console.log(`Retry ${i + 1}/${retries} for ${operation}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  async getKlines(symbol, interval = '1h', limit = 500) {
    return this.fetchWithRetry(async () => {
      const response = await axios.get(`${this.baseUrl}/api/v3/klines`, {
        params: {
          symbol,
          interval,
          limit
        }
      });
      return response.data.map(kline => ({
        timestamp: parseInt(kline[0]),
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
      }));
    }, 3, `klines for ${symbol}`);
  }

  async getCurrentPrice(symbol) {
    return this.fetchWithRetry(async () => {
      const response = await axios.get(`${this.baseUrl}/api/v3/ticker/price`, {
        params: { symbol }
      });
      return parseFloat(response.data.price);
    }, 3, `price for ${symbol}`);
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

  async trackSignal(symbol, signalType, signalData) {
    const signalKey = this.createSignalKey(symbol, signalType, signalData);
    
    if (this.isInCooldown(signalKey)) {
      console.log(`⏰ ${signalType} in cooldown period for ${symbol}`);
      return;
    }

    // Global cooldown: block ALL signals on symbol for 3 minutes
    const now = Date.now();
    const lastGlobalSignal = this.lastGlobalSignalTime.get(symbol);
    if (lastGlobalSignal && (now - lastGlobalSignal) < 3 * 60 * 1000) {
      console.log(`🚫 ${symbol} in global cooldown (3 mins) - all signals blocked`);
      return;
    }
    this.lastGlobalSignalTime.set(symbol, now);

    // Smart filter: ignore duplicate signals within 10 minutes (symbol-specific)
    const duplicateKey = `${symbol}-${signalType}`;
    const lastTime = this.lastSignalTimes.get(duplicateKey);
    if (lastTime && (now - lastTime) < 10 * 60 * 1000) {
      console.log(`🚫 ${signalType} filtered (duplicate within 10 mins on ${symbol})`);
      return;
    }
    this.lastSignalTimes.set(duplicateKey, now);

    const currentPrice = await this.getCurrentPrice(symbol);
    if (!currentPrice) return;

    // Start performance tracking
    const performanceData = this.performanceEngine.startTracking(
      signalKey, 
      signalType, 
      currentPrice, 
      Date.now()
    );

    const signal = {
      key: signalKey,
      type: signalType,
      ...signalData,
      entryPrice: currentPrice,
      entryTime: new Date(),
      startTime: Date.now(),
      duration: 60 * 60 * 1000, // 1 hour
      peakPrice: currentPrice,
      lowestPrice: currentPrice,
      maxPeak: 0, // Track max percentage gain
      maxDip: 0, // Track max percentage loss
      status: 'active'
    };

    this.activeSignals.set(signalKey, signal);
    this.signalHistory.push({ ...signal, timestamp: Date.now() });

    console.log(`\n🚨 ${signalType} DETECTED!`);
    console.log(`📊 ${symbol} at $${currentPrice.toFixed(2)}`);
    console.log(`⏰ ${new Date().toLocaleString()}`);
    
    // Enhanced alerts for different signal types
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
    if (signalData.spikeRatio) {
      console.log(`🚀 Volume Spike: ${signalData.spikeRatio}x average`);
    }
    if (signalData.buyRatio) {
      console.log(`📈 Accumulation: ${signalData.buyRatio}% buying volume`);
    }
    if (signalData.sellRatio) {
      console.log(`📉 Distribution: ${signalData.sellRatio}% selling volume`);
    }
    if (signalData.strength) {
      console.log(`⚡ Divergence Strength: ${signalData.strength.toFixed(1)}`);
    }
    if (signalData.breakoutStrength) {
      console.log(`💥 OBV Breakout: ${signalData.breakoutStrength}% strength`);
    }
    if (signalData.pullbackPercent) {
      console.log(`📉 Low Volume Pullback: ${signalData.pullbackPercent}% on low volume`);
    }
    if (signalData.resistance) {
      console.log(`📈 Resistance: $${signalData.resistance.toFixed(2)}`);
    }
    if (signalData.support) {
      console.log(`📉 Support: $${signalData.support.toFixed(2)}`);
    }

    // Signal closure is now handled by expiry logic in trackPerformance
  }

  async trackPerformance() {
    const now = Date.now();
    const signalsToClose = [];

    for (const [signalKey, signal] of this.activeSignals) {
      const symbol = signalKey.split('_')[0];
      const currentPrice = await this.getCurrentPrice(symbol);
      if (!currentPrice) continue;

      // Check for early exit (0.3% drop before 0.3% gain)
      const currentGain = ((currentPrice - signal.entryPrice) / signal.entryPrice) * 100;
      const currentLoss = ((signal.entryPrice - currentPrice) / signal.entryPrice) * 100;
      
      if (signal.maxPeak >= 0.3 && currentLoss > 0.3) {
        // Early exit: failed after showing some promise
        signal.exitPrice = currentPrice;
        signal.exitTime = now;
        signal.earlyExit = true;
        signal.exitReason = 'Failed after initial gain';
        signalsToClose.push(signalKey);
      } else if (currentLoss > 0.5) {
        // Early exit: immediate failure
        signal.exitPrice = currentPrice;
        signal.exitTime = now;
        signal.earlyExit = true;
        signal.exitReason = 'Immediate failure';
        signalsToClose.push(signalKey);
      } else if (now - signal.startTime >= signal.duration) {
        // Normal expiry: 1-hour window complete
        signal.exitPrice = currentPrice;
        signal.exitTime = now;
        signal.earlyExit = false;
        signalsToClose.push(signalKey);
      }

      // Update performance engine with real-time tracking
      this.performanceEngine.updateTracking(signalKey, currentPrice, Date.now());
      
      // Track peak performance (internal only - log major milestones)
      if (currentPrice > signal.peakPrice) {
        signal.peakPrice = currentPrice;
        const peakGain = ((signal.peakPrice - signal.entryPrice) / signal.entryPrice) * 100;
        signal.maxPeak = Math.max(signal.maxPeak, peakGain);
        
        // Log major milestones only
        if (peakGain >= 1.0) {
          console.log(`🎯 MILESTONE: ${signal.symbol} hit +${peakGain.toFixed(1)}% peak!`);
        }
      }
      
      // Track dip performance (internal only - log major milestones)
      if (currentPrice < signal.lowestPrice) {
        signal.lowestPrice = currentPrice;
        const dipLoss = ((signal.entryPrice - signal.lowestPrice) / signal.entryPrice) * 100;
        signal.maxDip = Math.max(signal.maxDip, dipLoss);
        
        // Log major milestones only
        if (dipLoss >= 1.0) {
          console.log(`⚠️ MILESTONE: ${signal.symbol} hit -${dipLoss.toFixed(1)}% dip!`);
        }
      }
    }

    // Close expired signals
    for (const signalKey of signalsToClose) {
      this.closeSignal(signalKey);
    }
  }

  closeSignal(signalKey) {
    const signal = this.activeSignals.get(signalKey);
    if (!signal || signal.completed) return;

    const symbol = signalKey.split('_')[0];
    const entryGain = ((signal.peakPrice - signal.entryPrice) / signal.entryPrice) * 100;
    const closeGain = ((signal.exitPrice - signal.entryPrice) / signal.entryPrice) * 100;

    // Improved result classification with bias vs outcome consistency
    let result;
    let biasCorrect = false;
    
    // Check if outcome matches initial bias
    if (signal.bias) {
      if (signal.bias === 'BULLISH' && closeGain > 0) {
        biasCorrect = true;
      } else if (signal.bias === 'BEARISH' && closeGain < 0) {
        biasCorrect = true;
      } else if (signal.bias === 'NEUTRAL') {
        biasCorrect = true; // Neutral is always correct
      }
    }
    
    if (signal.earlyExit) {
      result = biasCorrect ? 'EARLY EXIT (CORRECT DIRECTION)' : 'EARLY EXIT (WRONG DIRECTION)';
    } else if (signal.maxPeak >= 0.5) {
      result = biasCorrect ? 'STRONG (CORRECT DIRECTION)' : 'STRONG (WRONG DIRECTION)';
    } else if (signal.maxPeak >= 0.2) {
      result = biasCorrect ? 'WEAK (CORRECT DIRECTION)' : 'WEAK (WRONG DIRECTION)';
    } else {
      result = biasCorrect ? 'FAILED (CORRECT DIRECTION)' : 'FAILED (WRONG DIRECTION)';
    }

    // Close performance tracking and record final data
    const performanceData = this.performanceEngine.closeTracking(
      signalKey, 
      signal.exitPrice, 
      signal.exitTime
    );

    console.log(`\n📊 SIGNAL COMPLETE`);
    console.log(`📈 ${signal.setup?.bias || 'UNKNOWN'} ${signal.setup?.strength || 'UNKNOWN'} — ${symbol}`);
    console.log(`💰 Entry: $${signal.entryPrice.toFixed(4)} → Close: $${signal.exitPrice.toFixed(4)} (${closeGain >= 0 ? '+' : ''}${closeGain.toFixed(2)}%)`);
    console.log(`📈 Max Peak: +${signal.maxPeak.toFixed(2)}%`);
    console.log(`📉 Max Dip: -${signal.maxDip.toFixed(2)}%`);
    console.log(`⏱️ Time to Peak: ${signal.timeToPeak.toFixed(0)} min`);
    console.log(`🎯 Initial Bias: ${signal.setup?.bias || 'NEUTRAL'}`);
    
    if (signal.earlyExit) {
      console.log(`⚠️ Exit Reason: ${signal.exitReason}`);
    }
    
    console.log(`\n📊 Result: ${result}\n`);

    // Mark as completed and remove
    signal.completed = true;
    this.activeSignals.delete(signalKey);
    
    // Reset trade state to IDLE
    this.setTradeState(symbol, 'IDLE');
    this.tradeSetups.delete(symbol);
  }

  updateMarketState(symbol, currentPrice) {
    // Update price history (keep last 10 prices for trend analysis)
    const history = this.priceHistory.get(symbol) || [];
    history.push(currentPrice);
    if (history.length > 10) history.shift();
    this.priceHistory.set(symbol, history);

    // Calculate recent movement (compare current to price from 10 updates ago)
    if (history.length >= 10) {
      const oldPrice = history[0];
      const recentMove = ((currentPrice - oldPrice) / oldPrice) * 100;
      
      // Apply minimum movement filter
      if (Math.abs(recentMove) < 0.4) return; // Ignore small movements
      
      let marketState;
      let reason = '';
      
      // Define Bull/Bear based on price movement only
      if (recentMove <= -0.4) {
        marketState = 'BEARISH';
        reason = `-${recentMove.toFixed(2)}% move`;
      } else if (recentMove >= 0.4) {
        marketState = 'BULLISH';
        reason = `+${recentMove.toFixed(2)}% move`;
      } else {
        marketState = 'NEUTRAL';
        reason = `${recentMove.toFixed(2)}% move`;
      }
      
      const previousState = this.marketStates.get(symbol);
      
      // Only print when state changes and movement is significant
      if (previousState !== marketState && Math.abs(recentMove) >= 0.4) {
        console.log(`📊 MARKET: ${marketState}`);
        
        // Add simple reason logic
        let detailedReason = reason;
        
        // Check for post-squeeze breakdown
        if (marketState === 'BEARISH') {
          const squeezeSignal = this.activeSignals.get(`${symbol}_Bollinger_detected`);
          if (squeezeSignal) {
            detailedReason = `Post-squeeze breakdown (${reason})`;
          }
        }
        
        // Check for post-breakout rally
        if (marketState === 'BULLISH') {
          const breakoutSignal = this.activeSignals.get(`${symbol}_Breakout_detected`);
          if (breakoutSignal) {
            detailedReason = `Post-breakout rally (${reason})`;
          }
        }
        
        console.log(`Reason: ${detailedReason} on ${symbol}`);
        this.marketStates.set(symbol, marketState);
      }
    }
  }

  // Market summary analysis (price-based, not signal-based)
  printMarketSummary() {
    // Count active signals by strength
    let strongSignals = 0;
    let weakSignals = 0;
    let activeSignals = 0;
    
    // Analyze active signals
    for (const [key, signal] of this.activeSignals) {
      activeSignals++;
      
      // Check current performance for strength classification
      if (signal.maxPeak >= 0.5) {
        strongSignals++;
      } else if (signal.maxPeak >= 0.2) {
        weakSignals++;
      }
    }
    
    // Analyze market states (price-based logic)
    let bullishMarkets = 0;
    let bearishMarkets = 0;
    let neutralMarkets = 0;
    
    for (const [symbol, state] of this.marketStates) {
      if (state === 'BULLISH') bullishMarkets++;
      else if (state === 'BEARISH') bearishMarkets++;
      else neutralMarkets++;
    }
    
    // Improved market sentiment with smoothing and weighted scoring
    let marketDirection = 'FLAT';
    let marketScore = 0;
    let totalMoves = 0;
    
    // Calculate weighted market score from multiple factors
    for (const [symbol, history] of this.priceHistory) {
      if (history.length >= 3) {
        // Recent moves (last 2 periods)
        const move1 = ((history[history.length - 1] - history[history.length - 2]) / history[history.length - 2]) * 100;
        const move2 = ((history[history.length - 2] - history[history.length - 3]) / history[history.length - 3]) * 100;
        
        // Weight recent moves more heavily
        const weightedMove = (move1 * 2 + move2 * 1) / 3;
        
        // Add to market score
        marketScore += weightedMove;
        totalMoves++;
      }
    }
    
    // Smooth the market score
    const avgScore = totalMoves > 0 ? marketScore / totalMoves : 0;
    
    // Determine market direction with higher thresholds for stability
    if (avgScore >= 0.8) {
      marketDirection = 'STRONG_BULLISH';
    } else if (avgScore >= 0.4) {
      marketDirection = 'BULLISH';
    } else if (avgScore >= 0.15) {
      marketDirection = 'SLIGHTLY_BULLISH';
    } else if (avgScore <= -0.8) {
      marketDirection = 'STRONG_BEARISH';
    } else if (avgScore <= -0.4) {
      marketDirection = 'BEARISH';
    } else if (avgScore <= -0.15) {
      marketDirection = 'SLIGHTLY_BEARISH';
    } else {
      marketDirection = 'FLAT';
    }
    
    // Add move percentage to display
    const moveDisplay = avgScore >= 0 ? `+${avgScore.toFixed(2)}%` : `${avgScore.toFixed(2)}%`;
    
    // Calculate average confluence score
    let totalConfluence = 0;
    let eventCount = 0;
    for (const [key, signal] of this.activeSignals) {
      if (signal.signals) {
        totalConfluence += signal.signals.length;
        eventCount++;
      }
    }
    const avgConfluence = eventCount > 0 ? (totalConfluence / eventCount).toFixed(1) : 0;

    console.log('\n📊 MARKET SUMMARY (Price-Based)');
    console.log('='.repeat(50));
    console.log(`📈 Bullish markets: ${bullishMarkets}`);
    console.log(`📉 Bearish markets: ${bearishMarkets}`);
    console.log(`➖ Neutral markets: ${neutralMarkets}`);
    console.log(`💪 Strong signals: ${strongSignals}`);
    console.log(`⚡ Weak signals: ${weakSignals}`);
    console.log(`🔄 Active signals: ${activeSignals}`);
    console.log(`💡 Avg confluence: ${avgConfluence}`);
    console.log(`\n→ MARKET: ${marketDirection} (${moveDisplay})`);
    console.log('='.repeat(50) + '\n');
  }

  // Group related signals into market events
  groupSignalsIntoEvent(symbol, signals) {
    // Check if we already have an active event for this symbol
    const existingEvent = this.currentMarketEvent.get(symbol);
    
    if (existingEvent) {
      // Add to existing event
      existingEvent.signals.push(...signals);
      return existingEvent;
    }
    
    // Create new event
    const event = {
      symbol,
      timestamp: Date.now(),
      signals: [...signals],
      confluence: signals.length
    };
    
    this.currentMarketEvent.set(symbol, event);
    return event;
  }

  // Build user alert with interpretation layer
  buildUserAlert(symbol, signals, currentPrice) {
    // Signal bias classification
    const bullishSignals = ['Golden Cross', 'MACD Bullish Crossover', 'Resistance Breakout', 'Break & Retest (Support)', 'Support Breakdown'];
    const bearishSignals = ['Death Cross', 'MACD Bearish Crossover', 'Support Breakdown', 'Break & Retest (Resistance)', 'Resistance Breakout'];
    
    let bullish = 0;
    let bearish = 0;
    
    for (const signal of signals) {
      if (bullishSignals.includes(signal.type)) bullish++;
      if (bearishSignals.includes(signal.type)) bearish++;
    }
    
    // Determine bias
    let bias = 'NEUTRAL';
    if (bullish > bearish) bias = 'BULLISH';
    else if (bearish > bullish) bias = 'BEARISH';
    
    // Convert confluence to strength
    let strength = 'WEAK';
    if (signals.length >= 4) strength = 'STRONG';
    else if (signals.length === 3) strength = 'MODERATE';
    
    // Generate human-readable reason
    const reason = this.generateReason(signals, bias);
    
    return {
      symbol,
      bias,
      strength,
      reason,
      price: currentPrice,
      confluence: signals.length
    };
  }

  // Generate human-readable reasons from signal combinations
  generateReason(signals, bias) {
    const signalTypes = signals.map(s => s.type);
    
    // Overheated momentum scenarios
    if (signalTypes.includes('RSI Overbought') && signalTypes.includes('Volume Spike')) {
      return 'Momentum overheated with strong selling pressure';
    }
    
    if (signalTypes.includes('RSI Oversold') && signalTypes.includes('Volume Spike')) {
      return 'Momentum oversold with strong buying pressure';
    }
    
    // Breakout scenarios
    if (signalTypes.includes('Resistance Breakout') && signalTypes.includes('Volume Spike')) {
      return 'Price breaking out with strong buying pressure';
    }
    
    if (signalTypes.includes('Support Breakdown') && signalTypes.includes('Volume Spike')) {
      return 'Price breaking down with strong selling pressure';
    }
    
    // Squeeze scenarios
    if (signalTypes.includes('Bollinger Band Squeeze') && signalTypes.includes('Volume Spike')) {
      return 'Low volatility breakout with strong volume';
    }
    
    if (signalTypes.includes('Bollinger Band Squeeze')) {
      return 'Low volatility, breakout likely soon';
    }
    
    // Trend scenarios
    if (signalTypes.includes('Golden Cross') && signalTypes.includes('MACD Bullish Crossover')) {
      return 'Strong bullish trend confirmation';
    }
    
    if (signalTypes.includes('Death Cross') && signalTypes.includes('MACD Bearish Crossover')) {
      return 'Strong bearish trend confirmation';
    }
    
    // Retest scenarios
    if (signalTypes.includes('Break & Retest (Support)') && signalTypes.includes('Volume Spike')) {
      return 'Support retest with strong buying interest';
    }
    
    if (signalTypes.includes('Break & Retest (Resistance)') && signalTypes.includes('Volume Spike')) {
      return 'Resistance retest with strong selling pressure';
    }
    
    // Default based on bias
    if (bias === 'BULLISH') return 'Multiple bullish signals aligning';
    if (bias === 'BEARISH') return 'Multiple bearish signals aligning';
    return 'Mixed signals, watch for direction';
  }

  // Track market event instead of individual signals
  async trackMarketEvent(symbol, marketEvent) {
    // Event cooldown: block new events for 5 minutes
    const now = Date.now();
    const lastEvent = this.lastEventTime.get(symbol);
    if (lastEvent && (now - lastEvent) < 5 * 60 * 1000) {
      return; // Silent cooldown - no debug messages
    }
    this.lastEventTime.set(symbol, now);

    // Market context filtering: ignore weak signals in strong trends
    const marketState = this.marketStates.get(symbol);
    const weakSignals = ['RSI Overbought', 'RSI Oversold'];
    
    // Filter out weak signals in strong trends
    let filteredSignals = marketEvent.signals;
    if (marketState === 'BULLISH') {
      filteredSignals = marketEvent.signals.filter(s => !weakSignals.includes(s.type));
    } else if (marketState === 'BEARISH') {
      filteredSignals = marketEvent.signals.filter(s => !weakSignals.includes(s.type));
    }

    if (filteredSignals.length === 0) {
      return; // Silent filtering
    }

    const currentPrice = await this.getCurrentPrice(symbol);
    if (!currentPrice) return;

    // Build user alert
    const alert = this.buildUserAlert(symbol, filteredSignals, currentPrice);
    
    // Filter weak alerts (do nothing filter)
    if (alert.strength === 'WEAK' && alert.bias === 'NEUTRAL') {
      return; // Don't alert on weak neutral events
    }

    // Start performance tracking for the event
    const eventKey = `${symbol}_EVENT_${Date.now()}`;
    const performanceData = this.performanceEngine.startTracking(
      eventKey, 
      `${alert.bias} ${alert.strength} Event`, 
      currentPrice, 
      Date.now()
    );

    // Store event data
    const eventSignal = {
      key: eventKey,
      type: `${alert.bias} ${alert.strength} Event`,
      symbol,
      entryPrice: currentPrice,
      entryTime: new Date(),
      startTime: Date.now(),
      duration: 60 * 60 * 1000, // 1 hour
      peakPrice: currentPrice,
      lowestPrice: currentPrice,
      maxPeak: 0,
      maxDip: 0,
      status: 'active',
      signals: filteredSignals,
      bias: alert.bias,
      strength: alert.strength
    };

    this.activeSignals.set(eventKey, eventSignal);
    this.signalHistory.push({ ...eventSignal, timestamp: Date.now() });

    // Print clean user alert
    this.printUserAlert(alert);
  }

  // Print clean user alert
  printUserAlert(alert) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`\n[${timestamp}] 🚨 ALERT – ${alert.symbol}`);
    console.log(`[${timestamp}] 📉 Bias: ${alert.bias}`);
    console.log(`[${timestamp}] 💪 Strength: ${alert.strength}`);
    console.log(`[${timestamp}] 🧠 Reason: ${alert.reason}`);
    console.log(`[${timestamp}] ⏱️ Timeframe: 1 hour`);
    console.log(`[${timestamp}] 💰 Price: $${alert.price.toFixed(2)}`);
    
    // Add expectation based on bias
    if (alert.bias === 'BULLISH') {
      console.log(`[${timestamp}] 👉 Expect upward continuation or bounce`);
    } else if (alert.bias === 'BEARISH') {
      console.log(`[${timestamp}] 👉 Expect pullback or rejection`);
    } else {
      console.log(`[${timestamp}] 👉 Watch for directional breakout`);
    }
    
    console.log('');
  }

  // Trade lifecycle state management
  getTradeState(symbol) {
    return this.tradeStates.get(symbol) || 'IDLE';
  }

  setTradeState(symbol, state, data = {}) {
    this.tradeStates.set(symbol, state);
    console.log(`🔄 ${symbol}: ${state}${Object.keys(data).length > 0 ? ` (${JSON.stringify(data)})` : ''}`);
  }

  // Check for setup conditions
  checkSetupConditions(symbol, signals) {
    const currentState = this.getTradeState(symbol);
    
    if (currentState !== 'IDLE') {
      return false; // Only setup from IDLE
    }

    // Setup conditions: volatility compression + signal alignment
    const hasSqueeze = signals.some(s => s.type.includes('Bollinger Band Squeeze'));
    const hasVolume = signals.some(s => s.type.includes('Volume Spike'));
    const hasDirectionalSignal = signals.some(s => 
      s.type.includes('Golden Cross') || s.type.includes('Death Cross') ||
      s.type.includes('MACD') || s.type.includes('Breakout') || 
      s.type.includes('Breakdown') || s.type.includes('Retest')
    );

    if (hasSqueeze && (hasVolume || hasDirectionalSignal)) {
      // Create setup
      const setup = {
        timestamp: Date.now(),
        signals: signals,
        bias: this.calculateBias(signals),
        strength: this.calculateStrength(signals)
      };
      
      this.tradeSetups.set(symbol, setup);
      this.setTradeState(symbol, 'SETUP', { bias: setup.bias, strength: setup.strength });
      
      console.log(`\n📋 [SETUP] ${symbol} - ${setup.bias} ${setup.strength}`);
      console.log(`📊 Conditions: ${signals.map(s => s.type).join(', ')}`);
      
      return true;
    }
    
    return false;
  }

  // Check for entry confirmation
  checkEntryConfirmation(symbol, currentPrice) {
    const currentState = this.getTradeState(symbol);
    const setup = this.tradeSetups.get(symbol);
    
    if (currentState !== 'SETUP' || !setup) {
      return false;
    }

    // Entry confirmation: price movement + time
    const timeSinceSetup = Date.now() - setup.timestamp;
    const priceMovement = Math.abs(currentPrice - setup.entryPrice) / setup.entryPrice * 100;
    
    // Confirm entry if price moves >0.3% or setup is >10 min old
    if (priceMovement > 0.3 || timeSinceSetup > 10 * 60 * 1000) {
      this.setTradeState(symbol, 'ENTRY', { price: currentPrice });
      
      console.log(`\n🚨 [ENTRY] ${setup.bias} ${setup.strength} ${symbol} at $${currentPrice.toFixed(2)}`);
      
      // Start tracking as active trade
      this.startActiveTrade(symbol, setup, currentPrice);
      
      return true;
    }
    
    return false;
  }

  // Start active trade tracking
  startActiveTrade(symbol, setup, entryPrice) {
    const tradeKey = `${symbol}_TRADE_${Date.now()}`;
    
    const trade = {
      key: tradeKey,
      symbol,
      setup,
      entryPrice,
      entryTime: Date.now(),
      peakPrice: entryPrice,
      lowestPrice: entryPrice,
      maxPeak: 0,
      maxDip: 0,
      status: 'ACTIVE',
      completed: false
    };
    
    this.activeSignals.set(tradeKey, trade);
    this.setTradeState(symbol, 'ACTIVE', { key: tradeKey });
  }

  // Calculate bias from signals
  calculateBias(signals) {
    const bullishSignals = ['Golden Cross', 'MACD Bullish Crossover', 'Resistance Breakout', 'Break & Retest (Support)'];
    const bearishSignals = ['Death Cross', 'MACD Bearish Crossover', 'Support Breakdown', 'Break & Retest (Resistance)'];
    
    let bullish = 0, bearish = 0;
    
    for (const signal of signals) {
      if (bullishSignals.includes(signal.type)) bullish++;
      if (bearishSignals.includes(signal.type)) bearish++;
    }
    
    if (bullish > bearish) return 'BULLISH';
    if (bearish > bullish) return 'BEARISH';
    return 'NEUTRAL';
  }

  // Calculate strength from signals
  calculateStrength(signals) {
    if (signals.length >= 4) return 'STRONG';
    if (signals.length >= 3) return 'MODERATE';
    return 'WEAK';
  }

  // Core 7 signals only - no filtering needed
  // All signals are Core 7 by design

  async checkCore7Signals() {
    for (const symbol of this.symbols) {
      const klines = await this.getKlines(symbol, '1h', 500);
      if (klines.length < 200) continue;

      const currentPrice = await this.getCurrentPrice(symbol);
      if (!currentPrice) continue;
      
      // Update market state
      this.updateMarketState(symbol, currentPrice);

      // Check all signals first
      const signals = [];

      // 1. Golden Cross / Death Cross
      const goldenCross = CoreIndicators.detectGoldenCross(klines);
      if (this.signalStateManager.shouldTriggerComplexSignal(symbol, 'GoldenCross', goldenCross)) {
        signals.push({ type: 'Golden Cross', data: goldenCross });
      }

      const deathCross = CoreIndicators.detectDeathCross(klines);
      if (this.signalStateManager.shouldTriggerComplexSignal(symbol, 'DeathCross', deathCross)) {
        signals.push({ type: 'Death Cross', data: deathCross });
      }

      // 2. RSI Overbought/Oversold
      const rsiSignal = CoreIndicators.detectRSIExtremes(klines);
      if (this.signalStateManager.shouldTriggerComplexSignal(symbol, 'RSI', rsiSignal)) {
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
      if (this.signalStateManager.shouldTriggerComplexSignal(symbol, 'MACD', macdSignal)) {
        signals.push({ type: macdSignal.type, data: macdSignal });
      }

      // 4. Support/Resistance Breakout
      const breakoutSignal = CoreIndicators.detectSupportResistanceBreakout(klines);
      if (this.signalStateManager.shouldTriggerComplexSignal(symbol, 'Breakout', breakoutSignal)) {
        signals.push({ type: breakoutSignal.type, data: breakoutSignal });
      }

      // 5. Volume Spike
      const volumeSignal = CoreIndicators.detectVolumeSpike(klines);
      if (this.signalStateManager.shouldTriggerComplexSignal(symbol, 'Volume', volumeSignal)) {
        signals.push({ type: volumeSignal.type, data: volumeSignal });
      }

      // 6. Bollinger Band Squeeze
      const bollingerSignal = CoreIndicators.detectBollingerSqueeze(klines);
      if (this.signalStateManager.shouldTriggerComplexSignal(symbol, 'Bollinger', bollingerSignal)) {
        signals.push({ type: bollingerSignal.type, data: bollingerSignal });
      }

      // 7. Break & Retest
      const retestSignal = CoreIndicators.detectBreakAndRetest(klines);
      if (this.signalStateManager.shouldTriggerComplexSignal(symbol, 'Retest', retestSignal)) {
        signals.push({ type: retestSignal.type, data: retestSignal });
      }

      // Filter to Core 7 signals only
      const filteredSignals = signals.filter(signal => 
        this.core7Signals.includes(signal.type)
      );

      // Use trade lifecycle instead of immediate alerts
      if (filteredSignals.length > 0) {
        // Check for setup conditions first
        const setupCreated = this.checkSetupConditions(symbol, filteredSignals);
        
        if (setupCreated) {
          // Store setup entry price for confirmation
          const setup = this.tradeSetups.get(symbol);
          if (setup) {
            setup.entryPrice = currentPrice;
          }
        } else {
          // Check for entry confirmation if we have a setup
          this.checkEntryConfirmation(symbol, currentPrice);
        }
      }

      // Only print summary once per cycle (after all symbols processed)
      if (symbol === this.symbols[this.symbols.length - 1]) {
        const activeCount = this.activeSignals.size;
        if (activeCount > 0) {
          console.log(`📊 Monitoring ${activeCount} active alert${activeCount === 1 ? '' : 's'}`);
        }
      }

      // RSI is now only included in events - no standalone alerts
    }

    await this.trackPerformance();
    
    // Print performance summary and market analysis every 5 minutes
    const now = Date.now();
    if (!this.lastPerformancePrint || now - this.lastPerformancePrint > 5 * 60 * 1000) {
      this.performanceEngine.printPerformanceSummary();
      this.performanceEngine.printActivePerformance();
      this.printMarketSummary();
      this.lastPerformancePrint = now;
    }
  }

  setSignalFilter(filterType) {
    if (this.signalFilters[filterType]) {
      this.activeFilter = filterType;
      console.log(`🔍 Signal filter set to: ${filterType}`);
      console.log(`📊 Active signals: ${this.signalFilters[filterType].join(', ')}`);
    }
  }

  start() {
    console.log('🎯 Core 7 Signals Tracker Started');
    console.log('📊 Monitoring: BTCUSDT, SOLUSDT, DOGEUSDT, AVAXUSDT, LINKUSDT');
    console.log('⚡ Signals: Golden/Death Cross, RSI, MACD, Breakouts, Volume, Bollinger, Retest');
    console.log('⏰ Performance tracking: 1 hour');
    console.log('🔄 Check interval: Every minute\n');

    cron.schedule('* * * * *', async () => {
      await this.checkCore7Signals();
    });

    this.checkCore7Signals();
  }

  getStats() {
    return {
      activeSignals: this.activeSignals.size,
      totalSignals: this.signalHistory.length,
      recentSignals: this.signalHistory.slice(-10).map(s => ({
        type: s.type,
        time: new Date(s.timestamp).toLocaleString(),
        entryPrice: s.entryPrice
      }))
    };
  }
}

// Start tracker with Core 7 signals
const tracker = new Core7Tracker();
tracker.start();

// Export for external access
module.exports = Core7Tracker;
