# Trading Signal Alert System

A rule-based trading alert app that monitors cryptocurrency markets for technical analysis signals.

## 🚀 Phase 1 Features

- **Golden Cross Detection**: Monitors for 50-day MA crossing above 200-day MA
- **Real-time Alerts**: Checks signals every 5 minutes
- **Crypto Focus**: Supports major trading pairs (BTC, ETH, ADA)
- **Console Notifications**: Clear alert formatting in terminal

## 🛠️ Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your settings in `.env` (optional)

## 🚀 Quick Start

```bash
npm start
```

The system will:
- Connect to Binance API
- Monitor configured trading pairs
- Check for Golden Cross signals every 5 minutes
- Send console alerts when signals are detected

## 📊 Configuration

Edit `.env` to customize:

- `ALERT_INTERVAL_MINUTES`: Alert check frequency (default: 5)
- `TRADING_PAIRS`: Comma-separated list of pairs to monitor
- `SHORT_MA_PERIOD`: Short moving average period (default: 50)
- `LONG_MA_PERIOD`: Long moving average period (default: 200)

## 🎯 Current Signals

- **Golden Cross**: Bullish trend reversal signal
- **Death Cross**: Bearish trend reversal signal (coming soon)

## 🔧 Development

```bash
npm run dev  # Run with nodemon for auto-restart
npm test     # Run tests
```

## 📈 Roadmap

### Phase 2 ✅
- [x] Add RSI signal
- [x] Basic alerts

### Phase 3 🔄
- [ ] Add filters (market cap/volume)
- [ ] Add presets

### Phase 4 📋
- [ ] React dashboard
- [ ] Signal toggles

### Phase 5 🔥
- [ ] Premium system
- [ ] Strategy builder

### Phase 6 🤖
- [ ] AI explanations
- [ ] AI suggestions

## 🚨 Alert Format

When a signal is detected, you'll see:

```
🚨 TRADING SIGNAL ALERT 🚨
================================================================================
🚀 GOLDEN CROSS DETECTED for BTCUSDT!
💰 Current Price: $45,234.56
📈 50 MA: 44,890.12
📊 200 MA: 44,567.89
⚡ Crossover Strength: 0.73%
📊 24h Change: +2.45%
📊 Volume: 1,234,567
================================================================================
```

## 🛡️ Safety Features

- **Cooldown System**: Prevents alert spam (30-minute cooldown per signal)
- **Error Handling**: Robust error handling for API failures
- **Graceful Shutdown**: Clean shutdown on Ctrl+C

## 📝 License

MIT License - see LICENSE file for details
