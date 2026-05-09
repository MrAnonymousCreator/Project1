// RSI + Volume Indicators for expanded signal detection

class RSIVolumeIndicators {
  
  // Calculate RSI with custom period
  static calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= period; i++) {
      const change = prices[prices.length - i] - prices[prices.length - i - 1];
      if (change >= 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  // RSI Divergence (Bullish/Bearish)
  static detectRSIDivergence(klines) {
    if (klines.length < 50) return { detected: false };
    
    const prices = klines.map(k => k.close);
    const rsiValues = [];
    
    // Calculate RSI for each point
    for (let i = 34; i < prices.length; i++) {
      const rsi = this.calculateRSI(prices.slice(0, i + 1));
      if (rsi !== null) rsiValues.push(rsi);
    }
    
    if (rsiValues.length < 20) return { detected: false };
    
    // Find recent highs and lows
    const recentPrices = prices.slice(-20);
    const recentRSI = rsiValues.slice(-20);
    
    const priceHighs = [];
    const rsiHighs = [];
    const priceLows = [];
    const rsiLows = [];
    
    for (let i = 1; i < recentPrices.length - 1; i++) {
      // Higher high
      if (recentPrices[i] > recentPrices[i-1] && recentPrices[i] > recentPrices[i+1]) {
        priceHighs.push({ price: recentPrices[i], rsi: recentRSI[i], index: i });
      }
      // Lower low
      if (recentPrices[i] < recentPrices[i-1] && recentPrices[i] < recentPrices[i+1]) {
        priceLows.push({ price: recentPrices[i], rsi: recentRSI[i], index: i });
      }
    }
    
    // Check for bearish divergence (price higher high, RSI lower high)
    let bearishDivergence = null;
    if (priceHighs.length >= 2) {
      const lastHigh = priceHighs[priceHighs.length - 1];
      const prevHigh = priceHighs[priceHighs.length - 2];
      
      if (lastHigh.price > prevHigh.price && lastHigh.rsi < prevHigh.rsi) {
        bearishDivergence = {
          detected: true,
          type: 'RSI Bearish Divergence',
          strength: Math.abs(lastHigh.rsi - prevHigh.rsi),
          price: lastHigh.price,
          rsi: lastHigh.rsi
        };
      }
    }
    
    // Check for bullish divergence (price lower low, RSI higher low)
    let bullishDivergence = null;
    if (priceLows.length >= 2) {
      const lastLow = priceLows[priceLows.length - 1];
      const prevLow = priceLows[priceLows.length - 2];
      
      if (lastLow.price < prevLow.price && lastLow.rsi > prevLow.rsi) {
        bullishDivergence = {
          detected: true,
          type: 'RSI Bullish Divergence',
          strength: Math.abs(lastLow.rsi - prevLow.rsi),
          price: lastLow.price,
          rsi: lastLow.rsi
        };
      }
    }
    
    // Return the stronger divergence
    if (bearishDivergence && bullishDivergence) {
      return bearishDivergence.strength > bullishDivergence.strength ? bearishDivergence : bullishDivergence;
    }
    return bearishDivergence || bullishDivergence || { detected: false };
  }

  // Volume Spike Detection
  static detectVolumeSpike(klines, multiplier = 2.0) {
    if (klines.length < 20) return { detected: false };
    
    const volumes = klines.map(k => k.volume);
    const recentVolume = volumes[volumes.length - 1];
    const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    
    const spikeRatio = recentVolume / avgVolume;
    
    if (spikeRatio >= multiplier) {
      return {
        detected: true,
        type: 'Volume Spike',
        spikeRatio: spikeRatio.toFixed(2),
        currentVolume: recentVolume,
        avgVolume: avgVolume,
        price: klines[klines.length - 1].close
      };
    }
    
    return { detected: false };
  }

  // Low Volume Pullback
  static detectLowVolumePullback(klines) {
    if (klines.length < 20) return { detected: false };
    
    const volumes = klines.map(k => k.volume);
    const prices = klines.map(k => k.close);
    
    const recentVolume = volumes[volumes.length - 1];
    const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    
    // Check if volume is significantly lower than average
    if (recentVolume < avgVolume * 0.5) {
      // Check if price is pulling back from recent high
      const recentPrices = prices.slice(-10);
      const recentHigh = Math.max(...recentPrices.slice(0, -1));
      const currentPrice = prices[prices.length - 1];
      
      if (currentPrice < recentHigh * 0.98) { // 2% pullback
        return {
          detected: true,
          type: 'Low Volume Pullback',
          volumeRatio: (recentVolume / avgVolume).toFixed(2),
          pullbackPercent: ((recentHigh - currentPrice) / recentHigh * 100).toFixed(2),
          price: currentPrice
        };
      }
    }
    
    return { detected: false };
  }

  // Volume Divergence
  static detectVolumeDivergence(klines) {
    if (klines.length < 30) return { detected: false };
    
    const prices = klines.map(k => k.close);
    const volumes = klines.map(k => k.volume);
    
    const recentPrices = prices.slice(-15);
    const recentVolumes = volumes.slice(-15);
    
    // Find trend in price
    let priceTrend = 0;
    for (let i = 1; i < recentPrices.length; i++) {
      priceTrend += recentPrices[i] - recentPrices[i-1];
    }
    
    // Find trend in volume
    let volumeTrend = 0;
    for (let i = 1; i < recentVolumes.length; i++) {
      volumeTrend += recentVolumes[i] - recentVolumes[i-1];
    }
    
    // Detect divergence
    if (Math.abs(priceTrend) > 0.01 && Math.abs(volumeTrend) > 1000) {
      const priceUp = priceTrend > 0;
      const volumeUp = volumeTrend > 0;
      
      if (priceUp && !volumeUp) {
        return {
          detected: true,
          type: 'Volume Bearish Divergence',
          price: prices[prices.length - 1],
          priceTrend: 'up',
          volumeTrend: 'down'
        };
      } else if (!priceUp && volumeUp) {
        return {
          detected: true,
          type: 'Volume Bullish Divergence',
          price: prices[prices.length - 1],
          priceTrend: 'down',
          volumeTrend: 'up'
        };
      }
    }
    
    return { detected: false };
  }

  // Accumulation Detection
  static detectAccumulation(klines) {
    if (klines.length < 20) return { detected: false };
    
    const recent = klines.slice(-10);
    let greenVolume = 0;
    let redVolume = 0;
    
    for (const candle of recent) {
      if (candle.close > candle.open) {
        greenVolume += candle.volume;
      } else {
        redVolume += candle.volume;
      }
    }
    
    const totalVolume = greenVolume + redVolume;
    const buyRatio = greenVolume / totalVolume;
    
    // Check for accumulation (more buying volume)
    if (buyRatio > 0.6 && totalVolume > 0) {
      return {
        detected: true,
        type: 'Accumulation',
        buyRatio: (buyRatio * 100).toFixed(1),
        totalVolume: totalVolume,
        price: klines[klines.length - 1].close
      };
    }
    
    return { detected: false };
  }

  // Distribution Detection
  static detectDistribution(klines) {
    if (klines.length < 20) return { detected: false };
    
    const recent = klines.slice(-10);
    let greenVolume = 0;
    let redVolume = 0;
    
    for (const candle of recent) {
      if (candle.close > candle.open) {
        greenVolume += candle.volume;
      } else {
        redVolume += candle.volume;
      }
    }
    
    const totalVolume = greenVolume + redVolume;
    const sellRatio = redVolume / totalVolume;
    
    // Check for distribution (more selling volume)
    if (sellRatio > 0.6 && totalVolume > 0) {
      return {
        detected: true,
        type: 'Distribution',
        sellRatio: (sellRatio * 100).toFixed(1),
        totalVolume: totalVolume,
        price: klines[klines.length - 1].close
      };
    }
    
    return { detected: false };
  }

  // On-Balance Volume (OBV) Breakout
  static detectOBVBreakout(klines) {
    if (klines.length < 20) return { detected: false };
    
    let obv = 0;
    const obvValues = [];
    
    for (let i = 1; i < klines.length; i++) {
      if (klines[i].close > klines[i-1].close) {
        obv += klines[i].volume;
      } else if (klines[i].close < klines[i-1].close) {
        obv -= klines[i].volume;
      }
      obvValues.push(obv);
    }
    
    if (obvValues.length < 10) return { detected: false };
    
    // Check for OBV breakout
    const recentOBV = obvValues.slice(-5);
    const avgOBV = obvValues.slice(-20).reduce((a, b) => a + b, 0) / 20;
    
    const currentOBV = recentOBV[recentOBV.length - 1];
    const breakoutStrength = (currentOBV - avgOBV) / Math.abs(avgOBV) * 100;
    
    if (breakoutStrength > 10) { // 10% breakout
      return {
        detected: true,
        type: 'OBV Breakout',
        breakoutStrength: breakoutStrength.toFixed(1),
        currentOBV: currentOBV,
        avgOBV: avgOBV,
        price: klines[klines.length - 1].close
      };
    }
    
    return { detected: false };
  }
}

module.exports = RSIVolumeIndicators;
