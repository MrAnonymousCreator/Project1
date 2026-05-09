class TradeManager {
  constructor() {
    this.activeTrades = new Map();
    this.tradeHistory = [];
    this.stats = {
      totalTrades: 0,
      wins: 0,
      losses: 0,
      expired: 0,
      totalPnL: 0,
    };
    
    // Signal-specific targets and stops (realistic expectations)
    this.signalParameters = {
      'Golden Cross': { target: 0.8, stop: 0.3, maxDuration: 120 }, // 2 hours
      'Death Cross': { target: 0.6, stop: 0.3, maxDuration: 120 },
      'RSI Oversold': { target: 0.5, stop: 0.2, maxDuration: 60 },  // 1 hour
      'RSI Overbought': { target: 0.5, stop: 0.2, maxDuration: 60 },
      'MACD Bullish Crossover': { target: 0.6, stop: 0.3, maxDuration: 90 },
      'MACD Bearish Crossover': { target: 0.6, stop: 0.3, maxDuration: 90 },
      'Resistance Breakout': { target: 0.7, stop: 0.3, maxDuration: 60 },
      'Support Breakdown': { target: 0.7, stop: 0.3, maxDuration: 60 },
      'Volume Spike': { target: 0.4, stop: 0.2, maxDuration: 45 },
      'Bollinger Band Squeeze': { target: 0.9, stop: 0.3, maxDuration: 90 },
      'Break & Retest (Support)': { target: 0.6, stop: 0.2, maxDuration: 60 },
      'Break & Retest (Resistance)': { target: 0.6, stop: 0.2, maxDuration: 60 },
    };
  }

  canOpenTrade(symbol, signalType) {
    // Limit to 1 active trade per symbol
    const activeTradesForSymbol = Array.from(this.activeTrades.values())
      .filter(trade => trade.symbol === symbol);
    
    return activeTradesForSymbol.length === 0;
  }

  openTrade(symbol, signalType, entryPrice, entryTime) {
    if (!this.canOpenTrade(symbol, signalType)) {
      console.log(`⏰ Cannot open trade for ${symbol} - already has active trade`);
      return null;
    }

    const params = this.signalParameters[signalType] || { target: 0.5, stop: 0.2, maxDuration: 60 };
    
    const trade = {
      id: `${symbol}_${signalType}_${Date.now()}`,
      symbol,
      signalType,
      entryPrice,
      entryTime,
      targetPrice: entryPrice * (1 + params.target / 100),
      stopLossPrice: entryPrice * (1 - params.stop / 100),
      maxDuration: params.maxDuration * 60 * 1000, // Convert to milliseconds
      status: 'active',
      currentPrice: entryPrice,
      highestPrice: entryPrice,
      lowestPrice: entryPrice,
    };

    this.activeTrades.set(trade.id, trade);
    
    console.log(`\n📈 SIMULATED TRADE OPENED`);
    console.log(`🎯 ${signalType} - ${symbol}`);
    console.log(`💰 Entry: $${entryPrice.toFixed(4)}`);
    console.log(`🎯 Target: $${trade.targetPrice.toFixed(4)} (+${params.target}%)`);
    console.log(`🛑 Stop: $${trade.stopLossPrice.toFixed(4)} (-${params.stop}%)`);
    console.log(`⏰ Max duration: ${params.maxDuration} minutes\n`);

    return trade;
  }

  async checkTrades(getCurrentPrice) {
    const now = Date.now();
    const tradesToClose = [];

    for (const [tradeId, trade] of this.activeTrades) {
      const currentPrice = await getCurrentPrice(trade.symbol);
      if (!currentPrice) continue;

      trade.currentPrice = currentPrice;
      trade.highestPrice = Math.max(trade.highestPrice, currentPrice);
      trade.lowestPrice = Math.min(trade.lowestPrice, currentPrice);

      // Check if target hit
      if (currentPrice >= trade.targetPrice) {
        trade.status = 'win';
        trade.exitPrice = currentPrice;
        trade.exitTime = now;
        trade.exitReason = 'Target hit';
        tradesToClose.push(trade);
      }
      // Check if stop loss hit
      else if (currentPrice <= trade.stopLossPrice) {
        trade.status = 'loss';
        trade.exitPrice = currentPrice;
        trade.exitTime = now;
        trade.exitReason = 'Stop loss hit';
        tradesToClose.push(trade);
      }
      // Check if time expired
      else if (now - trade.entryTime >= trade.maxDuration) {
        trade.status = 'expired';
        trade.exitPrice = currentPrice;
        trade.exitTime = now;
        trade.exitReason = 'Time expired';
        tradesToClose.push(trade);
      }
    }

    // Close completed trades
    for (const trade of tradesToClose) {
      this.closeTrade(trade);
    }

    return tradesToClose;
  }

  closeTrade(trade) {
    const pnl = ((trade.exitPrice - trade.entryPrice) / trade.entryPrice) * 100;
    trade.pnl = pnl;
    trade.duration = (trade.exitTime - trade.entryTime) / 1000 / 60; // in minutes

    // Update stats
    this.stats.totalTrades++;
    if (trade.status === 'win') this.stats.wins++;
    else if (trade.status === 'loss') this.stats.losses++;
    else this.stats.expired++;
    this.stats.totalPnL += pnl;

    // Move to history
    this.tradeHistory.push(trade);
    this.activeTrades.delete(trade.id);

    // Print result
    const statusEmoji = trade.status === 'win' ? '✅' : trade.status === 'loss' ? '❌' : '⏱️';
    console.log(`\n${statusEmoji} TRADE CLOSED: ${trade.signalType} - ${trade.symbol}`);
    console.log(`💰 Entry: $${trade.entryPrice.toFixed(4)} | Exit: $${trade.exitPrice.toFixed(4)}`);
    console.log(`📊 PnL: ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}%`);
    console.log(`⏰ Duration: ${trade.duration.toFixed(1)} min | Reason: ${trade.exitReason}\n`);
  }

  getStats() {
    const winRate = this.stats.totalTrades > 0 ? (this.stats.wins / this.stats.totalTrades) * 100 : 0;
    
    return {
      ...this.stats,
      winRate: winRate.toFixed(1),
      activeTrades: this.activeTrades.size,
    };
  }

  printStats() {
    const stats = this.getStats();
    
    console.log('📊 SIMULATION STATS');
    console.log('='.repeat(40));
    console.log(`📈 Total Trades: ${stats.totalTrades}`);
    console.log(`✅ Wins: ${stats.wins}`);
    console.log(`❌ Losses: ${stats.losses}`);
    console.log(`⏱️ Expired: ${stats.expired}`);
    console.log(`🎯 Win Rate: ${stats.winRate}%`);
    console.log(`💰 Total PnL: ${stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}%`);
    console.log(`🔄 Active Trades: ${stats.activeTrades}`);
    console.log('='.repeat(40));
  }

  printActiveTrades() {
    if (this.activeTrades.size === 0) return;

    console.log('🔄 ACTIVE TRADES');
    console.log('='.repeat(40));
    
    for (const [tradeId, trade] of this.activeTrades) {
      const currentPnL = ((trade.currentPrice - trade.entryPrice) / trade.entryPrice) * 100;
      const timeElapsed = (Date.now() - trade.entryTime) / 1000 / 60;
      
      console.log(`📈 ${trade.signalType} - ${trade.symbol}`);
      console.log(`💰 Entry: $${trade.entryPrice.toFixed(4)} | Current: $${trade.currentPrice.toFixed(4)}`);
      console.log(`📊 PnL: ${currentPnL >= 0 ? '+' : ''}${currentPnL.toFixed(2)}%`);
      console.log(`⏰ Time: ${timeElapsed.toFixed(0)} min | Target: $${trade.targetPrice.toFixed(4)}`);
      console.log('');
    }
  }

  getRecentTrades(count = 5) {
    return this.tradeHistory.slice(-count).reverse();
  }
}

module.exports = TradeManager;
