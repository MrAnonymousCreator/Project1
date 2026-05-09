require('dotenv').config();

module.exports = {
  binance: {
    baseUrl: process.env.BINANCE_API_BASE_URL || 'https://api.binance.com',
  },
  alerts: {
    intervalMinutes: parseInt(process.env.ALERT_INTERVAL_MINUTES) || 5,
  },
  trading: {
    pairs: (process.env.TRADING_PAIRS || 'BTCUSDT,ETHUSDT').split(','),
  },
  indicators: {
    shortMAPeriod: parseInt(process.env.SHORT_MA_PERIOD) || 50,
    longMAPeriod: parseInt(process.env.LONG_MA_PERIOD) || 200,
  },
};
