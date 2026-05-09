const cron = require('node-cron');
const config = require('../config');
const goldenCrossSignal = require('../signals/goldenCross');

class AlertEngine {
  constructor() {
    this.isRunning = false;
    this.cronJob = null;
    this.cooldownPeriods = new Map();
    this.lastAlerts = new Map();
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️  Alert engine is already running');
      return;
    }

    const cronExpression = `*/${config.alerts.intervalMinutes} * * * *`;
    
    this.cronJob = cron.schedule(cronExpression, async () => {
      await this.runAlertCheck();
    }, {
      scheduled: false,
    });

    this.cronJob.start();
    this.isRunning = true;
    
    console.log(`🚀 Alert engine started! Checking for signals every ${config.alerts.intervalMinutes} minutes`);
    console.log(`📊 Monitoring pairs: ${config.trading.pairs.join(', ')}`);
    
    this.runAlertCheck();
  }

  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.isRunning = false;
      console.log('🛑 Alert engine stopped');
    }
  }

  async runAlertCheck() {
    console.log(`\n🔍 Running alert check at ${new Date().toISOString()}`);
    
    const signals = [goldenCrossSignal];
    const results = [];

    for (const pair of config.trading.pairs) {
      for (const signal of signals) {
        try {
          const result = await signal.check(pair);
          results.push(result);
          
          if (result.detected) {
            await this.handleAlert(result);
          }
        } catch (error) {
          console.error(`❌ Error checking ${signal.name} for ${pair}:`, error.message);
        }
      }
    }

    const detectedSignals = results.filter(r => r.detected);
    if (detectedSignals.length === 0) {
      console.log('✅ No signals detected in this cycle');
    }
  }

  async handleAlert(alertData) {
    const alertKey = `${alertData.symbol}_${alertData.signal}`;
    const now = Date.now();
    
    if (this.lastAlerts.has(alertKey)) {
      const lastAlertTime = this.lastAlerts.get(alertKey);
      const timeSinceLastAlert = now - lastAlertTime;
      const cooldownMs = 30 * 60 * 1000;
      
      if (timeSinceLastAlert < cooldownMs) {
        console.log(`⏰ ${alertData.symbol} ${alertData.signal} is in cooldown period`);
        return;
      }
    }

    this.lastAlerts.set(alertKey, now);
    this.sendAlert(alertData);
  }

  sendAlert(alertData) {
    console.log('\n' + '='.repeat(80));
    console.log('🚨 TRADING SIGNAL ALERT 🚨');
    console.log('='.repeat(80));
    console.log(alertData.message);
    console.log('='.repeat(80));
    console.log(`⏰ Time: ${new Date(alertData.timestamp).toLocaleString()}`);
    console.log('='.repeat(80) + '\n');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      interval: config.alerts.intervalMinutes,
      pairs: config.trading.pairs,
      lastAlerts: Array.from(this.lastAlerts.entries()).map(([key, time]) => ({
        signal: key,
        lastAlert: new Date(time).toISOString(),
      })),
    };
  }
}

module.exports = new AlertEngine();
