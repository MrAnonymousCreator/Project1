class CoreIndicators {
  static calculateSMA(data, period) {
    if (data.length < period) return [];
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  static calculateEMA(data, period) {
    if (data.length < period) return [];
    const multiplier = 2 / (period + 1);
    const ema = [];
    
    let sum = 0;
    for (let i = 0; i < period; i++) sum += data[i];
    ema.push(sum / period);

    for (let i = period; i < data.length; i++) {
      const currentEMA = (data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
      ema.push(currentEMA);
    }
    return ema;
  }

  static calculateRSI(prices, period = 14) {
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
    return 100 - (100 / (1 + rs));
  }

  static calculateMACD(prices, fast = 12, slow = 26, signal = 9) {
    if (prices.length < slow) return { macd: [], signal: [], histogram: [] };
    
    const fastEMA = this.calculateEMA(prices, fast);
    const slowEMA = this.calculateEMA(prices, slow);
    
    const macd = [];
    const startIndex = slow - fast;
    for (let i = 0; i < fastEMA.length - startIndex; i++) {
      macd.push(fastEMA[i + startIndex] - slowEMA[i]);
    }
    
    const signalLine = this.calculateEMA(macd, signal);
    const histogram = macd.slice(signalLine.length).map((val, i) => val - signalLine[i]);
    
    return { macd, signal: signalLine, histogram };
  }

  static calculateBollingerBands(prices, period = 20, stdDev = 2) {
    if (prices.length < period) return { upper: [], middle: [], lower: [] };
    
    const sma = this.calculateSMA(prices, period);
    const bands = { upper: [], middle: sma, lower: [] };
    
    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = sma[i - period + 1];
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const std = Math.sqrt(variance);
      
      bands.upper.push(mean + stdDev * std);
      bands.lower.push(mean - stdDev * std);
    }
    
    return bands;
  }

  static detectGoldenCross(prices, shortPeriod = 50, longPeriod = 200) {
    if (prices.length < Math.max(shortPeriod, longPeriod) + 1) {
      return { detected: false, reason: 'Insufficient data' };
    }

    const closes = prices.map(p => p.close || p);
    const shortMA = this.calculateSMA(closes, shortPeriod);
    const longMA = this.calculateSMA(closes, longPeriod);

    const lastShortMA = shortMA[shortMA.length - 1];
    const lastLongMA = longMA[longMA.length - 1];
    const prevShortMA = shortMA[shortMA.length - 2];
    const prevLongMA = longMA[longMA.length - 2];

    const wasBelow = prevShortMA <= prevLongMA;
    const isAbove = lastShortMA > lastLongMA;

    if (wasBelow && isAbove) {
      return {
        detected: true,
        type: 'Golden Cross',
        timestamp: prices[prices.length - 1].timestamp || Date.now(),
        price: prices[prices.length - 1].close || prices[prices.length - 1],
        shortMA: lastShortMA,
        longMA: lastLongMA,
        crossoverStrength: ((lastShortMA - lastLongMA) / lastLongMA) * 100,
      };
    }

    return { detected: false };
  }

  static detectDeathCross(prices, shortPeriod = 50, longPeriod = 200) {
    if (prices.length < Math.max(shortPeriod, longPeriod) + 1) {
      return { detected: false, reason: 'Insufficient data' };
    }

    const closes = prices.map(p => p.close || p);
    const shortMA = this.calculateSMA(closes, shortPeriod);
    const longMA = this.calculateSMA(closes, longPeriod);

    const lastShortMA = shortMA[shortMA.length - 1];
    const lastLongMA = longMA[longMA.length - 1];
    const prevShortMA = shortMA[shortMA.length - 2];
    const prevLongMA = longMA[longMA.length - 2];

    const wasAbove = prevShortMA >= prevLongMA;
    const isBelow = lastShortMA < lastLongMA;

    if (wasAbove && isBelow) {
      return {
        detected: true,
        type: 'Death Cross',
        timestamp: prices[prices.length - 1].timestamp || Date.now(),
        price: prices[prices.length - 1].close || prices[prices.length - 1],
        shortMA: lastShortMA,
        longMA: lastLongMA,
        crossoverStrength: ((lastLongMA - lastShortMA) / lastLongMA) * 100,
      };
    }

    return { detected: false };
  }

  static detectRSIExtremes(prices, period = 14, oversold = 30, overbought = 70) {
    if (prices.length < period + 2) return { detected: false };

    const closes = prices.map(p => p.close || p);
    const currentRSI = this.calculateRSI(closes, period);
    
    if (currentRSI === null) return { detected: false };

    // Get previous RSI for edge detection
    const prevCloses = closes.slice(0, -1);
    const prevRSI = this.calculateRSI(prevCloses, period);
    
    if (prevRSI === null) return { detected: false, rsi: currentRSI };

    const lastPrice = prices[prices.length - 1];
    
    // Edge triggering: only signal on cross INTO extreme zone
    if (prevRSI >= oversold && currentRSI < oversold) {
      return {
        detected: true,
        type: 'RSI Oversold',
        timestamp: lastPrice.timestamp || Date.now(),
        price: lastPrice.close || lastPrice,
        rsi: currentRSI,
        threshold: oversold,
        crossedFrom: prevRSI,
      };
    }

    if (prevRSI <= overbought && currentRSI > overbought) {
      return {
        detected: true,
        type: 'RSI Overbought',
        timestamp: lastPrice.timestamp || Date.now(),
        price: lastPrice.close || lastPrice,
        rsi: currentRSI,
        threshold: overbought,
        crossedFrom: prevRSI,
      };
    }

    return { detected: false, rsi: currentRSI };
  }

  static detectMACDCrossover(prices, fast = 12, slow = 26, signal = 9) {
    const macdData = this.calculateMACD(prices.map(p => p.close || p), fast, slow, signal);
    
    if (macdData.macd.length < signal + 1) {
      return { detected: false, reason: 'Insufficient MACD data' };
    }

    const lastMACD = macdData.macd[macdData.macd.length - 1];
    const lastSignal = macdData.signal[macdData.signal.length - 1];
    const prevMACD = macdData.macd[macdData.macd.length - 2];
    const prevSignal = macdData.signal[macdData.signal.length - 2];

    const wasBelow = prevMACD <= prevSignal;
    const isAbove = lastMACD > lastSignal;

    if (wasBelow && isAbove) {
      return {
        detected: true,
        type: 'MACD Bullish Crossover',
        timestamp: prices[prices.length - 1].timestamp || Date.now(),
        price: prices[prices.length - 1].close || prices[prices.length - 1],
        macd: lastMACD,
        signal: lastSignal,
      };
    }

    const wasAbove = prevMACD >= prevSignal;
    const isBelow = lastMACD < lastSignal;

    if (wasAbove && isBelow) {
      return {
        detected: true,
        type: 'MACD Bearish Crossover',
        timestamp: prices[prices.length - 1].timestamp || Date.now(),
        price: prices[prices.length - 1].close || prices[prices.length - 1],
        macd: lastMACD,
        signal: lastSignal,
      };
    }

    return { detected: false };
  }

  static detectVolumeSpike(klines, period = 20, multiplier = 2) {
    if (klines.length < period + 1) return { detected: false };

    const volumes = klines.map(k => k.volume);
    const avgVolume = volumes.slice(-period - 1, -1).reduce((a, b) => a + b, 0) / period;
    const currentVolume = volumes[volumes.length - 1];

    if (currentVolume > avgVolume * multiplier) {
      return {
        detected: true,
        type: 'Volume Spike',
        timestamp: klines[klines.length - 1].timestamp,
        price: klines[klines.length - 1].close,
        volume: currentVolume,
        avgVolume: avgVolume,
        spikeMultiplier: currentVolume / avgVolume,
      };
    }

    return { detected: false };
  }

  static detectBollingerSqueeze(klines, period = 20, threshold = 0.1) {
    if (klines.length < period + 1) return { detected: false };

    const closes = klines.map(k => k.close);
    const bands = this.calculateBollingerBands(closes, period);
    
    if (bands.upper.length < 2) return { detected: false };

    const currentWidth = bands.upper[bands.upper.length - 1] - bands.lower[bands.lower.length - 1];
    const prevWidth = bands.upper[bands.upper.length - 2] - bands.lower[bands.lower.length - 2];
    const avgWidth = currentWidth / bands.middle[bands.middle.length - 1];

    if (avgWidth < threshold) {
      return {
        detected: true,
        type: 'Bollinger Band Squeeze',
        timestamp: klines[klines.length - 1].timestamp,
        price: klines[klines.length - 1].close,
        bandWidth: currentWidth,
        squeezeRatio: avgWidth,
        upperBand: bands.upper[bands.upper.length - 1],
        lowerBand: bands.lower[bands.lower.length - 1],
      };
    }

    return { detected: false };
  }

  static detectSupportResistanceBreakout(klines, lookback = 20) {
    if (klines.length < lookback * 2) return { detected: false };

    const closes = klines.map(k => k.close);
    const highs = klines.map(k => k.high);
    const lows = klines.map(k => k.low);
    
    const recentHighs = highs.slice(-lookback);
    const recentLows = lows.slice(-lookback);
    
    const resistance = Math.max(...recentHighs);
    const support = Math.min(...recentLows);
    
    const currentPrice = closes[closes.length - 1];
    const prevPrice = closes[closes.length - 2];

    if (prevPrice <= resistance && currentPrice > resistance) {
      return {
        detected: true,
        type: 'Resistance Breakout',
        timestamp: klines[klines.length - 1].timestamp,
        price: currentPrice,
        resistance: resistance,
        breakoutStrength: ((currentPrice - resistance) / resistance) * 100,
      };
    }

    if (prevPrice >= support && currentPrice < support) {
      return {
        detected: true,
        type: 'Support Breakdown',
        timestamp: klines[klines.length - 1].timestamp,
        price: currentPrice,
        support: support,
        breakdownStrength: ((support - currentPrice) / support) * 100,
      };
    }

    return { detected: false };
  }

  static detectBreakAndRetest(klines, lookback = 20) {
    if (klines.length < lookback * 3) return { detected: false };

    const closes = klines.map(k => k.close);
    const highs = klines.map(k => k.high);
    const lows = klines.map(k => k.low);
    
    const currentPrice = closes[closes.length - 1];
    const recentPeriod = klines.slice(-lookback);
    const olderPeriod = klines.slice(-lookback * 2, -lookback);
    
    const recentHigh = Math.max(...recentPeriod.map(k => k.high));
    const recentLow = Math.min(...recentPeriod.map(k => k.low));
    const olderHigh = Math.max(...olderPeriod.map(k => k.high));
    const olderLow = Math.min(...olderPeriod.map(k => k.low));
    
    const resistanceBreak = olderHigh < recentHigh;
    const supportBreak = olderLow > recentLow;
    
    if (resistanceBreak && currentPrice >= recentHigh * 0.98 && currentPrice <= recentHigh * 1.02) {
      return {
        detected: true,
        type: 'Break & Retest (Resistance)',
        timestamp: klines[klines.length - 1].timestamp,
        price: currentPrice,
        breakoutLevel: recentHigh,
        retestZone: `${(recentHigh * 0.98).toFixed(2)} - ${(recentHigh * 1.02).toFixed(2)}`,
      };
    }

    if (supportBreak && currentPrice >= recentLow * 0.98 && currentPrice <= recentLow * 1.02) {
      return {
        detected: true,
        type: 'Break & Retest (Support)',
        timestamp: klines[klines.length - 1].timestamp,
        price: currentPrice,
        breakdownLevel: recentLow,
        retestZone: `${(recentLow * 0.98).toFixed(2)} - ${(recentLow * 1.02).toFixed(2)}`,
      };
    }

    return { detected: false };
  }
}

module.exports = CoreIndicators;
