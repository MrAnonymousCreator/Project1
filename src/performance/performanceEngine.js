class PerformanceEngine {
  constructor() {
    this.signalStats = new Map(); // signalType -> stats
    this.activeSignals = new Map(); // signalKey -> performance data
  }

  // Initialize signal tracking
  startTracking(signalKey, signalType, entryPrice, entryTime) {
    const performanceData = {
      signalType,
      entryPrice,
      entryTime,
      currentPeak: entryPrice,
      peakTime: entryTime,
      currentPrice: entryPrice,
      timeToPeak: 0,
      maxPeak: 0, // percentage
      maxDip: 0, // percentage
      status: 'active'
    };

    this.activeSignals.set(signalKey, performanceData);
    return performanceData;
  }

  // Real-time peak tracking with dynamic updates
  updateTracking(signalKey, currentPrice, currentTime) {
    const data = this.activeSignals.get(signalKey);
    if (!data) return;

    data.currentPrice = currentPrice;

    // Update peak dynamically
    if (currentPrice > data.currentPeak) {
      data.currentPeak = currentPrice;
      data.peakTime = currentTime;
      data.timeToPeak = (currentTime - data.entryTime) / 1000 / 60; // in minutes
      
      // Calculate peak percentage
      const peakPercentage = ((currentPrice - data.entryPrice) / data.entryPrice) * 100;
      data.maxPeak = Math.max(data.maxPeak, peakPercentage);
    }

    // Calculate dip percentage
    const dipPercentage = ((data.entryPrice - currentPrice) / data.entryPrice) * 100;
    data.maxDip = Math.max(data.maxDip, dipPercentage);
  }

  // Close signal and record final data
  closeTracking(signalKey, closePrice, closeTime) {
    const data = this.activeSignals.get(signalKey);
    if (!data) return;

    data.closePrice = closePrice;
    data.closeTime = closeTime;
    data.status = 'closed';

    // Calculate final metrics
    const closePercentage = ((closePrice - data.entryPrice) / data.entryPrice) * 100;
    data.closePercentage = closePercentage;

    // Determine success (positive close)
    data.success = closePercentage > 0;

    // Store in aggregated stats
    this.recordSignalStats(data);

    // Remove from active tracking
    this.activeSignals.delete(signalKey);

    return data;
  }

  // Record aggregated statistics per signal type
  recordSignalStats(signalData) {
    const signalType = signalData.signalType;
    
    if (!this.signalStats.has(signalType)) {
      this.signalStats.set(signalType, {
        totalSignals: 0,
        successfulSignals: 0,
        totalPeakPercentage: 0,
        totalClosePercentage: 0,
        totalTimeToPeak: 0,
        maxPeak: 0,
        minPeak: Infinity,
        maxClose: -Infinity,
        minClose: Infinity,
        timeToPeakDistribution: {
          '0-10min': 0,
          '10-20min': 0,
          '20-30min': 0,
          '30+min': 0
        }
      });
    }

    const stats = this.signalStats.get(signalType);
    
    // Update counters
    stats.totalSignals++;
    if (signalData.success) {
      stats.successfulSignals++;
    }

    // Update aggregations
    stats.totalPeakPercentage += signalData.maxPeak;
    stats.totalClosePercentage += signalData.closePercentage;
    stats.totalTimeToPeak += signalData.timeToPeak;

    // Update time-to-peak distribution
    if (signalData.timeToPeak <= 10) {
      stats.timeToPeakDistribution['0-10min']++;
    } else if (signalData.timeToPeak <= 20) {
      stats.timeToPeakDistribution['10-20min']++;
    } else if (signalData.timeToPeak <= 30) {
      stats.timeToPeakDistribution['20-30min']++;
    } else {
      stats.timeToPeakDistribution['30+min']++;
    }

    // Update min/max
    stats.maxPeak = Math.max(stats.maxPeak, signalData.maxPeak);
    stats.minPeak = Math.min(stats.minPeak, signalData.maxPeak);
    stats.maxClose = Math.max(stats.maxClose, signalData.closePercentage);
    stats.minClose = Math.min(stats.minClose, signalData.closePercentage);
  }

  // Get performance stats for a signal type
  getSignalStats(signalType, limit = 30) {
    const stats = this.signalStats.get(signalType);
    if (!stats || stats.totalSignals === 0) {
      return {
        signalType,
        totalSignals: 0,
        avgPeak: 0,
        avgClose: 0,
        avgTimeToPeak: 0,
        successRate: 0,
        note: 'No data available'
      };
    }

    const avgPeak = stats.totalPeakPercentage / stats.totalSignals;
    const avgClose = stats.totalClosePercentage / stats.totalSignals;
    const avgTimeToPeak = stats.totalTimeToPeak / stats.totalSignals;
    const successRate = (stats.successfulSignals / stats.totalSignals) * 100;

    // Calculate time-to-peak distribution percentages
    const dist = stats.timeToPeakDistribution;
    const total = Object.values(dist).reduce((a, b) => a + b, 0);
    const distPercents = {
      '0-10min': ((dist['0-10min'] / total) * 100).toFixed(0),
      '10-20min': ((dist['10-20min'] / total) * 100).toFixed(0),
      '20-30min': ((dist['20-30min'] / total) * 100).toFixed(0),
      '30+min': ((dist['30+min'] / total) * 100).toFixed(0)
    };

    return {
      signalType,
      totalSignals: stats.totalSignals,
      avgPeak: avgPeak.toFixed(1),
      avgClose: avgClose.toFixed(1),
      avgTimeToPeak: avgTimeToPeak.toFixed(0),
      successRate: successRate.toFixed(0),
      maxPeak: stats.maxPeak.toFixed(1),
      minPeak: stats.minPeak === Infinity ? 0 : stats.minPeak.toFixed(1),
      maxClose: stats.maxClose.toFixed(1),
      minClose: stats.minClose === Infinity ? 0 : stats.minClose.toFixed(1),
      timeToPeakDistribution: distPercents
    };
  }

  // Get all signal stats
  getAllSignalStats() {
    const allStats = [];
    for (const signalType of this.signalStats.keys()) {
      allStats.push(this.getSignalStats(signalType));
    }
    return allStats;
  }

  // Print performance summary
  printPerformanceSummary() {
    const allStats = this.getAllSignalStats();
    
    if (allStats.length === 0) {
      console.log('\n📊 PERFORMANCE ENGINE - WAITING FOR DATA');
      console.log('⏳ First signals need to complete (1-hour window)');
      console.log('📈 Historical averages will appear here\n');
      return;
    }

    console.log('\n📈 PERFORMANCE ENGINE - HISTORICAL AVERAGES');
    console.log('='.repeat(60));
    
    for (const stats of allStats) {
      if (stats.totalSignals === 0) continue;
      
      console.log(`\n🎯 ${stats.signalType} (Last ${stats.totalSignals} signals)`);
      console.log(`📊 Avg Peak: +${stats.avgPeak}%`);
      console.log(`💰 Avg Close: +${stats.avgClose}%`);
      console.log(`⏱️ Avg Time to Peak: ${stats.avgTimeToPeak} min`);
      console.log(`🎯 Success Rate: ${stats.successRate}%`);
      
      if (stats.maxPeak > 0) {
        console.log(`📈 Range: ${stats.minPeak}% to ${stats.maxPeak}%`);
      }
      
      // Show time-to-peak distribution
      if (stats.timeToPeakDistribution) {
        console.log(`⏱️ Peak Distribution: 0-10min: ${stats.timeToPeakDistribution['0-10min']}%, 10-20min: ${stats.timeToPeakDistribution['10-20min']}%, 20-30min: ${stats.timeToPeakDistribution['20-30min']}%, 30+min: ${stats.timeToPeakDistribution['30+min']}%`);
      }
    }
    
    console.log('\n⚠️  Historical averages - not guarantees');
    console.log('='.repeat(60) + '\n');
  }

  // Print active signal performance (cleaned for users)
  printActivePerformance() {
    if (this.activeSignals.size === 0) {
      return;
    }

    console.log('\n🔄 ACTIVE ALERTS');
    console.log('='.repeat(50));
    
    for (const [signalKey, data] of this.activeSignals) {
      const currentGain = ((data.currentPrice - data.entryPrice) / data.entryPrice) * 100;
      const timeElapsed = (Date.now() - data.entryTime) / 1000 / 60;
      
      // Extract symbol and type from signalType
      const symbol = signalKey.split('_')[0];
      const alertType = data.signalType;
      
      console.log(`\n📊 ${symbol} - ${alertType}`);
      console.log(`� Performance: ${currentGain >= 0 ? '+' : ''}${currentGain.toFixed(2)}%`);
      console.log(`⏱️ Time: ${timeElapsed.toFixed(0)} min elapsed`);
      console.log(`🔄 Status: ACTIVE`);
    }
    
    console.log('='.repeat(50) + '\n');
  }

  // Get active signals count
  getActiveSignalsCount() {
    return this.activeSignals.size;
  }

  // Clean up old data (optional)
  cleanup() {
    // Could implement cleanup logic for old stats if needed
  }
}

module.exports = PerformanceEngine;
