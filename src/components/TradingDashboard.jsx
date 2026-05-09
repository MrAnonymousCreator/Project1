import React, { useState, useEffect } from 'react';
import MarketSentiment from './MarketSentiment';
import CoinCards from './CoinCards';
import LiveFeed from './LiveFeed';
import SignalPerformance from './SignalPerformance';

const TradingDashboard = () => {
  const [marketData, setMarketData] = useState({
    sentiment: 'FLAT',
    sentimentScore: 0,
    activeAlerts: 0,
    btcDominance: 0
  });

  const [coins, setCoins] = useState([
    { symbol: 'BTCUSDT', price: 0, rsi: 50, trend: 'NEUTRAL', signal: 'NONE', change24h: 0 },
    { symbol: 'SOLUSDT', price: 0, rsi: 50, trend: 'NEUTRAL', signal: 'NONE', change24h: 0 },
    { symbol: 'DOGEUSDT', price: 0, rsi: 50, trend: 'NEUTRAL', signal: 'NONE', change24h: 0 },
    { symbol: 'AVAXUSDT', price: 0, rsi: 50, trend: 'NEUTRAL', signal: 'NONE', change24h: 0 },
    { symbol: 'LINKUSDT', price: 0, rsi: 50, trend: 'NEUTRAL', signal: 'NONE', change24h: 0 }
  ]);

  const [liveFeed, setLiveFeed] = useState([]);
  const [performance, setPerformance] = useState({
    winRate: 0,
    avgPeak: 0,
    avgDip: 0,
    totalSignals: 0
  });

  // Mock data updates (replace with Socket.IO later)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate market data updates
      setMarketData(prev => ({
        ...prev,
        sentiment: ['BEARISH', 'BULLISH', 'FLAT', 'SLIGHTLY_BULLISH', 'SLIGHTLY_BEARISH'][Math.floor(Math.random() * 5)],
        sentimentScore: (Math.random() - 0.5) * 2,
        activeAlerts: Math.floor(Math.random() * 10),
        btcDominance: 45 + Math.random() * 10
      }));

      // Simulate coin updates
      setCoins(prev => prev.map(coin => ({
        ...coin,
        price: coin.price + (Math.random() - 0.5) * 100,
        rsi: Math.max(0, Math.min(100, coin.rsi + (Math.random() - 0.5) * 5)),
        trend: ['BULLISH', 'BEARISH', 'NEUTRAL'][Math.floor(Math.random() * 3)],
        signal: ['RSI Oversold', 'Golden Cross', 'Volume Spike', 'NONE'][Math.floor(Math.random() * 4)],
        change24h: (Math.random() - 0.5) * 10
      })));

      // Simulate live feed events
      const events = [
        '📈 BTC breakout detected',
        '📉 AVAX bearish momentum',
        '⚠️ DOGE hit -3.5% dip',
        '🚨 SOL RSI Overbought',
        '💪 LINK Golden Cross confirmed'
      ];
      
      setLiveFeed(prev => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          event: events[Math.floor(Math.random() * events.length)],
          type: ['alert', 'milestone', 'signal'][Math.floor(Math.random() * 3)]
        },
        ...prev.slice(0, 19) // Keep last 20 events
      ]);

      // Simulate performance updates
      setPerformance(prev => ({
        ...prev,
        winRate: 55 + Math.random() * 20,
        avgPeak: 1.0 + Math.random() * 2,
        avgDip: -0.5 - Math.random() * 2,
        totalSignals: prev.totalSignals + Math.floor(Math.random() * 3)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Market Sentiment Bar */}
        <MarketSentiment data={marketData} />

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coin Cards - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <CoinCards coins={coins} />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <SignalPerformance data={performance} />
            <LiveFeed feed={liveFeed} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;
