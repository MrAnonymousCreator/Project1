import React, { useState, useEffect } from 'react';
import socketService from './services/socketService';

function App() {
  const [signals, setSignals] = useState([]);
  const [marketSentiment, setMarketSentiment] = useState('NEUTRAL');
  const [sentimentScore, setSentimentScore] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [liveFeed, setLiveFeed] = useState([]);
  const [performance, setPerformance] = useState({
    winRate: 0,
    avgPeak: 0,
    avgDip: 0,
    totalSignals: 0
  });
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING...');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    // Connect to Socket.IO server
    const socket = socketService.connect();
    
    socket.on('connect', () => {
      console.log('Connected to trading signals server');
      setConnectionStatus('CONNECTED');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from trading signals server');
      setConnectionStatus('DISCONNECTED');
    });

    socket.on('market-sentiment', (data) => {
      setMarketSentiment(data.sentiment);
      setSentimentScore(data.sentimentScore || 0);
    });

    socket.on('signal', (data) => {
      addLiveFeedItem(data.message, 'signal');
    });

    socket.on('milestone', (data) => {
      addLiveFeedItem(data.message, 'milestone');
    });

    socket.on('alert', (data) => {
      addLiveFeedItem(data.message, 'alert');
    });

    socket.on('performance-update', (data) => {
      addLiveFeedItem(data.message, 'milestone');
    });

    socket.on('alert-count', (data) => {
      setActiveAlerts(data.count);
    });

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, []);

  // Add item to live feed
  const addLiveFeedItem = (message, type) => {
    setLiveFeed(prev => [
      { message, type, timestamp: new Date() },
      ...prev.slice(0, 19) // Keep only last 20 items
    ]);
    setLastUpdated(new Date());
  };

  // Initialize with mock data that will be replaced by real backend data
  useEffect(() => {
    // Initial mock data - will be replaced by real signals from backend
    setSignals([
      {
        coin: 'BTCUSDT',
        symbol: '₿',
        price: '$43,250.00',
        change24h: '+2.34%',
        signal: 'Golden Cross',
        status: 'Bullish'
      },
      {
        coin: 'SOLUSDT',
        symbol: '◎',
        price: '$105.50',
        change24h: '-1.23%',
        signal: 'RSI Oversold',
        status: 'Buy Zone'
      },
      {
        coin: 'DOGEUSDT',
        symbol: 'Ð',
        price: '$0.0854',
        change24h: '+5.67%',
        signal: 'MACD Cross',
        status: 'Momentum'
      },
      {
        coin: 'AVAXUSDT',
        symbol: '⛰️',
        price: '$36.75',
        change24h: '+3.21%',
        signal: 'Breakout',
        status: 'Strong'
      },
      {
        coin: 'LINKUSDT',
        symbol: '🔗',
        price: '$14.25',
        change24h: '-0.89%',
        signal: 'Volume Spike',
        status: 'Watch'
      }
    ]);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'Bullish': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      'Buy Zone': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      'Momentum': 'bg-violet-500/10 text-violet-400 border-violet-500/30',
      'Strong': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      'Watch': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    };
    return colors[status] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30';
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment.includes('BULLISH')) return 'text-emerald-400';
    if (sentiment.includes('BEARISH')) return 'text-red-400';
    return 'text-zinc-400';
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center text-2xl">
              📈
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tighter">Core Signals</h1>
              <p className="text-zinc-500 text-sm -mt-1">Live Market Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2">
              <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                connectionStatus === 'CONNECTED' ? 'bg-emerald-500' : 
                connectionStatus === 'CONNECTING' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className={`text-sm font-medium ${
                connectionStatus === 'CONNECTED' ? 'text-emerald-400' : 
                connectionStatus === 'CONNECTING' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {connectionStatus}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Market Sentiment */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-8 mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Market Sentiment</h2>
              <div className="flex items-center gap-6">
                <span className={`text-3xl font-bold ${getSentimentColor(marketSentiment)}`}>
                  {marketSentiment.replace('_', ' ')}
                </span>
                <span className="text-zinc-400">
                  Score: {sentimentScore >= 0 ? '+' : ''}{sentimentScore.toFixed(2)}%
                </span>
                <span className="text-zinc-400">
                  Active Alerts: {activeAlerts}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-500">Last Updated</p>
              <p className="text-lg font-medium">{lastUpdated.toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-8 hover:border-zinc-700 transition-colors">
            <p className="text-zinc-400 text-sm mb-3">Signals Today</p>
            <h2 className="text-5xl font-semibold tracking-tighter">{performance.totalSignals}</h2>
          </div>
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-8 hover:border-zinc-700 transition-colors">
            <p className="text-zinc-400 text-sm mb-3">Win Rate</p>
            <h2 className="text-5xl font-semibold tracking-tighter text-emerald-400">{performance.winRate.toFixed(0)}%</h2>
          </div>
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-8 hover:border-zinc-700 transition-colors">
            <p className="text-zinc-400 text-sm mb-3">Avg Peak</p>
            <h2 className="text-5xl font-semibold tracking-tighter text-emerald-400">+{performance.avgPeak.toFixed(1)}%</h2>
          </div>
        </div>

        {/* Live Signals Table */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl overflow-hidden mb-10">
          <div className="px-8 py-6 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Active Signals</h2>
            <p className="text-sm text-zinc-400">
              Real-time data from backend
            </p>
          </div>

          <div className="divide-y divide-zinc-800">
            {signals.map((item) => (
              <div
                key={item.coin}
                className="px-8 py-7 flex flex-col md:flex-row md:items-center gap-6 hover:bg-zinc-800/50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4 w-full md:w-72">
                  <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110">
                    {item.symbol}
                  </div>
                  <div>
                    <div className="font-mono text-xl font-bold">{item.coin}</div>
                    <div className="text-sm text-zinc-500">{item.signal}</div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="text-3xl font-semibold tabular-nums">{item.price}</div>
                  <div className={`text-sm font-medium ${item.change24h.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.change24h.startsWith('+') ? '↑' : '↓'} {item.change24h}
                  </div>
                </div>

                <div>
                  <span className={`inline-block px-6 py-2.5 rounded-2xl text-sm font-medium border ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Feed */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl overflow-hidden">
          <div className="px-8 py-6 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Live Feed</h2>
            <p className="text-sm text-zinc-400">
              Real-time events from backend
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {liveFeed.length === 0 ? (
              <div className="p-20 text-center text-zinc-400">
                Waiting for real-time events from backend...
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {liveFeed.map((item, index) => (
                  <div key={index} className="px-8 py-4 hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <span className="text-xs text-zinc-500 mt-1">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                      <div className={`text-sm ${
                        item.type === 'alert' ? 'text-red-400' :
                        item.type === 'milestone' ? 'text-amber-400' :
                        'text-emerald-400'
                      }`}>
                        {item.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 text-center text-xs text-zinc-500">
          Real-time data from Core7Tracker backend • Socket.IO connection
        </div>
      </div>
    </div>
  );
}

export default App;
