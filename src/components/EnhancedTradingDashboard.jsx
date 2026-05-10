'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Activity, Bell, Search, 
  DollarSign, Percent, Clock, AlertTriangle,
  BarChart3, LineChart, Zap, Target, Eye, Sparkles
} from 'lucide-react';

// Import Socket.IO client dynamically
const io = typeof window !== 'undefined' && window.io ? window.io : null;

const EnhancedTradingDashboard = () => {
  const [signals, setSignals] = useState([]);
  const [marketSentiment, setMarketSentiment] = useState('NEUTRAL');
  const [sentimentScore, setSentimentScore] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [liveFeed, setLiveFeed] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING...');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState(null);

  // Socket.IO connection
  useEffect(() => {
    if (!io) {
      // Socket.IO not available, use mock data
      setConnectionStatus('DEMO MODE');
      setIsLoading(false);
      return;
    }

    const socket = io();
    
    socket.on('connect', () => {
      console.log('Connected to trading signals server');
      setConnectionStatus('CONNECTED');
      setIsLoading(false);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from trading signals server');
      setConnectionStatus('DISCONNECTED');
      setIsLoading(true);
    });

    socket.on('market-sentiment', (data) => {
      setMarketSentiment(data.sentiment);
      setSentimentScore(data.sentimentScore || 0);
    });

    socket.on('signal', (data) => {
      addLiveFeedItem(data.message, 'signal');
      updateSignalsFromBackend(data.message);
    });

    socket.on('alert', (data) => {
      addLiveFeedItem(data.message, 'alert');
    });

    socket.on('milestone', (data) => {
      addLiveFeedItem(data.message, 'milestone');
    });

    socket.on('alert-count', (data) => {
      setActiveAlerts(data.count);
    });

    return () => socket.disconnect();
  }, []);

  const addLiveFeedItem = (message, type) => {
    setLiveFeed(prev => [
      { message, type, timestamp: new Date() },
      ...prev.slice(0, 19)
    ]);
    setLastUpdated(new Date());
  };

  const updateSignalsFromBackend = (message) => {
    const newSignal = {
      id: Date.now() + Math.random(),
      coin: extractCoinFromMessage(message),
      type: extractSignalType(message),
      message: message,
      price: extractPriceFromMessage(message),
      change24h: generateRandomChange(),
      confidence: Math.floor(Math.random() * 30) + 70,
      status: 'ACTIVE',
      timestamp: new Date()
    };
    
    setSignals(prev => {
      const existing = prev.filter(s => s.coin !== newSignal.coin);
      return [newSignal, ...existing.slice(0, 11)];
    });
  };

  const extractCoinFromMessage = (message) => {
    const coins = ['BTC', 'ETH', 'SOL', 'DOGE', 'AVAX', 'LINK'];
    const foundCoin = coins.find(coin => message.toUpperCase().includes(coin));
    return foundCoin || 'BTC';
  };

  const extractSignalType = (message) => {
    if (message.includes('Golden Cross')) return 'Golden Cross';
    if (message.includes('Death Cross')) return 'Death Cross';
    if (message.includes('RSI Oversold')) return 'RSI Oversold';
    if (message.includes('RSI Overbought')) return 'RSI Overbought';
    if (message.includes('MACD')) return 'MACD Cross';
    if (message.includes('Volume Spike')) return 'Volume Spike';
    if (message.includes('Breakout')) return 'Breakout';
    return 'Signal';
  };

  const extractPriceFromMessage = (message) => {
    const priceMatch = message.match(/\$[\d,]+\.?\d*/);
    return priceMatch ? priceMatch[0] : `$${(Math.random() * 50000 + 20000).toFixed(2)}`;
  };

  const generateRandomChange = () => {
    const change = (Math.random() - 0.5) * 10;
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  // Initialize with sample trading data
  useEffect(() => {
    const initialSignals = [
      {
        id: 1,
        coin: 'BTC',
        type: 'Golden Cross',
        message: 'BTC Golden Cross detected - Strong bullish momentum',
        price: '$43,250.00',
        change24h: '+2.34%',
        confidence: 85,
        status: 'ACTIVE',
        timestamp: new Date(Date.now() - 300000)
      },
      {
        id: 2,
        coin: 'SOL',
        type: 'RSI Oversold',
        message: 'SOL RSI Oversold - Potential reversal opportunity',
        price: '$105.50',
        change24h: '-1.23%',
        confidence: 92,
        status: 'ACTIVE',
        timestamp: new Date(Date.now() - 600000)
      },
      {
        id: 3,
        coin: 'DOGE',
        type: 'Volume Spike',
        message: 'DOGE Volume Spike - Unusual activity detected',
        price: '$0.0854',
        change24h: '+5.67%',
        confidence: 78,
        status: 'ACTIVE',
        timestamp: new Date(Date.now() - 900000)
      },
      {
        id: 4,
        coin: 'AVAX',
        type: 'Breakout',
        message: 'AVAX Breakout - Resistance level broken',
        price: '$36.75',
        change24h: '+3.21%',
        confidence: 88,
        status: 'ACTIVE',
        timestamp: new Date(Date.now() - 1200000)
      }
    ];
    setSignals(initialSignals);

    // Add mock live feed data for demo mode
    const mockLiveFeed = [
      { message: 'BTC Golden Cross detected on 4H timeframe', type: 'signal', timestamp: new Date(Date.now() - 1200000) },
      { message: 'SOL showing strong bullish divergence', type: 'signal', timestamp: new Date(Date.now() - 1800000) },
      { message: 'Market sentiment shifted to BULLISH', type: 'milestone', timestamp: new Date(Date.now() - 2400000) },
      { message: 'DOGE volume spike detected - 3x average volume', type: 'alert', timestamp: new Date(Date.now() - 3000000) },
      { message: 'ETH resistance breakout confirmed', type: 'signal', timestamp: new Date(Date.now() - 3600000) }
    ];
    setLiveFeed(mockLiveFeed);
    setActiveAlerts(3);
    setMarketSentiment('BULLISH');
    setSentimentScore(25.5);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
      'COMPLETED': 'bg-zinc-500/20 text-zinc-400 border-zinc-500/50',
      'FAILED': 'bg-red-500/20 text-red-400 border-red-500/50'
    };
    return colors[status] || 'bg-zinc-500/20 text-zinc-400 border-zinc-500/50';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-emerald-400';
    if (confidence >= 60) return 'text-amber-400';
    return 'text-zinc-400';
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment.includes('BULLISH')) return 'text-emerald-400';
    if (sentiment.includes('BEARISH')) return 'text-red-400';
    return 'text-zinc-400';
  };

  const getCoinIcon = (coin) => {
    const icons = {
      'BTC': '₿',
      'ETH': 'Ξ',
      'SOL': '◎',
      'DOGE': 'Ð',
      'AVAX': '⛰️',
      'LINK': '🔗'
    };
    return icons[coin] || '📊';
  };

  const filteredSignals = signals.filter(signal => 
    signal.coin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    signal.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSignalClick = (signal) => {
    setSelectedSignal(signal);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Crypto-inspired animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" opacity="0.03"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Modern Crypto Header */}
      <header className="relative border-b border-gray-800/50 bg-black/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div className="ml-4">
                    <h1 className="text-3xl font-bold text-white">Core7Tracker</h1>
                    <p className="text-gray-400 text-sm">AI Trading Signals</p>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center gap-4 flex-1 ml-8">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search coins, signals..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-gray-900/50 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 backdrop-blur-sm transition-all"
                    />
                  </div>

                  {/* Timeframe Selector */}
                  <div className="flex items-center gap-2 bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="bg-transparent text-gray-300 text-sm focus:outline-none border-none"
                    >
                      <option value="1m">1m</option>
                      <option value="5m">5m</option>
                      <option value="15m">15m</option>
                      <option value="1h">1h</option>
                      <option value="4h">4h</option>
                      <option value="1d">1d</option>
                    </select>
                  </div>

                  {/* Status Indicators */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${
                        connectionStatus === 'CONNECTED' ? 'bg-emerald-500' : 
                        connectionStatus === 'CONNECTING' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      <span className={`text-xs font-medium ${
                        connectionStatus === 'CONNECTED' ? 'text-emerald-400' : 
                        connectionStatus === 'CONNECTING' ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {connectionStatus}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-white">{activeAlerts}</span>
                      <span className="text-xs text-gray-500">Alerts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Hero Section with Market Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Market Overview</h2>
              <p className="text-gray-400">Real-time crypto trading signals and analysis</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                connectionStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-red-500'
              }`} />
              <span>{connectionStatus}</span>
            </div>
          </div>

          {/* Market Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Market Sentiment Card */}
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-gray-800 rounded-xl p-6 backdrop-blur-sm hover:border-gray-700 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-400">Market Sentiment</span>
                </div>
              </div>
              <div className={`text-3xl font-bold ${getSentimentColor(marketSentiment)} mb-2`}>
                {marketSentiment.replace('_', ' ')}
              </div>
              <div className="text-xs text-gray-500">
                Score: {sentimentScore >= 0 ? '+' : ''}{sentimentScore.toFixed(1)}%
              </div>
              <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${getSentimentColor(marketSentiment)}`} 
                     style={{ width: `${Math.max(0, Math.min(100, sentimentScore + 50))}%` }} />
              </div>
            </div>

            {/* Active Signals Card */}
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-gray-800 rounded-xl p-6 backdrop-blur-sm hover:border-gray-700 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-400">Active Signals</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{signals.length}</div>
              <div className="text-xs text-gray-500">
                {signals.filter(s => s.status === 'ACTIVE').length} active • {signals.filter(s => s.confidence >= 80).length} high confidence
              </div>
              <div className="mt-4 flex gap-1">
                {signals.slice(0, 4).map((signal, index) => (
                  <div key={index} className={`w-2 h-2 rounded-full ${
                    signal.confidence >= 80 ? 'bg-emerald-400' : 
                    signal.confidence >= 60 ? 'bg-amber-400' : 'bg-gray-400'
                  }`} />
                ))}
              </div>
            </div>

            {/* Win Rate Card */}
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-gray-800 rounded-xl p-6 backdrop-blur-sm hover:border-gray-700 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-400">Win Rate</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-emerald-400 mb-2">87.3%</div>
              <div className="text-xs text-emerald-400">
                +2.4% today • 156/179 signals
              </div>
              <div className="mt-4 flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-400">Above average</span>
              </div>
            </div>

            {/* Portfolio Value Card */}
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-gray-800 rounded-xl p-6 backdrop-blur-sm hover:border-gray-700 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-400">24h Volume</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-2">$2.4M</div>
              <div className="text-xs text-emerald-400">
                +12.8% from yesterday
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-400">High activity</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Signals Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Trading Signals</h2>
              <p className="text-gray-400">AI-powered cryptocurrency trading opportunities</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {filteredSignals.length} active signals
              </div>
              <button className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors text-sm font-medium">
                View All Signals
              </button>
            </div>
          </div>

          {/* Signal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSignals.map((signal) => (
              <div
                key={signal.id}
                onClick={() => handleSignalClick(signal)}
                className={`bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-gray-800 rounded-xl p-6 backdrop-blur-sm hover:border-gray-700 transition-all cursor-pointer ${
                  selectedSignal?.id === signal.id ? 'ring-2 ring-emerald-500/50' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                      signal.coin === 'BTC' ? 'bg-orange-500/20 text-orange-400' :
                      signal.coin === 'ETH' ? 'bg-blue-500/20 text-blue-400' :
                      signal.coin === 'SOL' ? 'bg-purple-500/20 text-purple-400' :
                      signal.coin === 'DOGE' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {getCoinIcon(signal.coin)}
                    </div>
                    <div>
                      <div className="text-white font-bold">{signal.coin}</div>
                      <div className="text-xs text-gray-400">{signal.type}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(signal.status)}`}>
                    {signal.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-white">{signal.price}</div>
                    <div className={`inline-flex items-center gap-1 text-sm font-medium ${
                      signal.change24h.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {signal.change24h.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{signal.change24h}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Confidence</span>
                      <div className="text-white font-bold">{signal.confidence}%</div>
                    </div>
                    <div className="w-20 bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${getConfidenceColor(signal.confidence)}`}
                        style={{ width: `${signal.confidence}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-xs text-gray-300 leading-relaxed">{signal.message}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{signal.timestamp.toLocaleTimeString()}</span>
                    <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-gray-800 rounded-xl backdrop-blur-sm">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-3">
                <Activity className="w-5 h-5 text-emerald-400" />
                Live Activity
              </h2>
              <p className="text-xs text-gray-500 mt-1">Real-time trading signals and events</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {liveFeed.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-lg text-gray-400">
                  <Activity className="w-5 h-5" />
                  <span className="text-sm">Monitoring for signals...</span>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {liveFeed.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:bg-gray-800/50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      item.type === 'signal' ? 'bg-emerald-500' :
                      item.type === 'alert' ? 'bg-red-500' :
                      item.type === 'milestone' ? 'bg-amber-500' :
                      'bg-gray-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className={`text-sm leading-relaxed ${
                            item.type === 'signal' ? 'text-emerald-400' :
                            item.type === 'alert' ? 'text-red-400' :
                            item.type === 'milestone' ? 'text-amber-400' :
                            'text-gray-400'
                          }`}>
                            {item.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {item.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          item.type === 'signal' ? 'bg-emerald-500/20 text-emerald-400' :
                          item.type === 'alert' ? 'bg-red-500/20 text-red-400' :
                          item.type === 'milestone' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {item.type}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-xs">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-red-500'
            } animate-pulse`} />
            <span>Core7Tracker AI Trading System</span>
          </div>
          <div>
            Last updated: {lastUpdated.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTradingDashboard;
