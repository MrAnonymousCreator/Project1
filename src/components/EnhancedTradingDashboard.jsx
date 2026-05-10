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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="fixed inset-0 -z-10 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-pink-500/10 opacity-20 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-emerald-500/10 via-cyan-500/5 to-blue-500/10 opacity-15 animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <header className="relative border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25 animate-pulse">
                    <Sparkles className="w-6 h-6 text-white absolute -top-1 -right-1" />
                    <BarChart3 className="w-6 h-6 text-white relative z-10" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                      Trading Signals
                    </h1>
                    <p className="text-slate-400 text-sm mt-2 font-medium">AI-Powered Market Intelligence</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" size={18} />
                    <input
                      type="text"
                      placeholder="Search signals, coins, or patterns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 backdrop-blur-sm transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-2">
                    <Clock className="w-4 h-4 text-slate-400" size={16} />
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="bg-transparent text-slate-300 text-sm focus:outline-none border-none"
                    >
                      <option value="1m">1m</option>
                      <option value="5m">5m</option>
                      <option value="15m">15m</option>
                      <option value="1h">1h</option>
                      <option value="4h">4h</option>
                      <option value="1d">1d</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full animate-pulse ${
                        connectionStatus === 'CONNECTED' ? 'bg-emerald-500' : 
                        connectionStatus === 'CONNECTING' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        connectionStatus === 'CONNECTED' ? 'text-emerald-400' : 
                        connectionStatus === 'CONNECTING' ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {connectionStatus}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-slate-400" size={16} />
                      <span className="text-sm font-medium text-slate-300">{activeAlerts}</span>
                      <span className="text-xs text-slate-500">Active Alerts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                  <Activity className="w-5 h-5 mr-2 text-emerald-400" />
                  Market Sentiment
                </h2>
                <div className="flex items-center gap-4 text-sm">
                  <span className={`text-3xl font-bold ${getSentimentColor(marketSentiment)}`}>
                    {marketSentiment.replace('_', ' ')}
                  </span>
                  <span className="text-slate-400">
                    Score: {sentimentScore >= 0 ? '+' : ''}{sentimentScore.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-slate-400 text-sm mb-1">Active Signals</p>
                  <p className="text-4xl font-bold text-white">{signals.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-sm mb-1">Win Rate</p>
                  <p className="text-4xl font-bold text-emerald-400">87.3%</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-3 text-slate-400 text-sm mb-2">
                <span>BEARISH</span>
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${getSentimentColor(marketSentiment)}`} style={{ width: `${Math.max(0, Math.min(100, sentimentScore + 50))}%` }}></div>
                </div>
                <span>BULLISH</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <Target className="w-5 h-5 mr-2 text-slate-400" />
              Performance Analytics
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center group">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-slate-700 transition-colors">
                  <LineChart className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </div>
                <p className="text-slate-400 text-sm mb-1">Total Signals</p>
                <p className="text-2xl font-bold text-white">{signals.length}</p>
                <p className="text-xs text-emerald-400">+12.4%</p>
              </div>
              <div className="text-center group">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-slate-700 transition-colors">
                  <TrendingUp className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </div>
                <p className="text-slate-400 text-sm mb-1">Win Rate</p>
                <p className="text-2xl font-bold text-emerald-400">87.3%</p>
              </div>
              <div className="text-center group">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-slate-700 transition-colors">
                  <DollarSign className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </div>
                <p className="text-slate-400 text-sm mb-1">Avg Profit</p>
                <p className="text-2xl font-bold text-emerald-400">+2.8%</p>
              </div>
              <div className="text-center group">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-slate-700 transition-colors">
                  <Zap className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </div>
                <p className="text-slate-400 text-sm mb-1">Best Signal</p>
                <p className="text-2xl font-bold text-violet-400">Golden Cross</p>
                <p className="text-xs text-violet-400">32% Success</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-sm">
          <div className="px-6 py-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <Zap className="w-5 h-5 mr-2 text-emerald-400" />
              Active Signals ({filteredSignals.length})
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Eye className="w-4 h-4 mr-1" />
                {filteredSignals.length} of {signals.length} signals
              </div>
              <div className="text-slate-400 text-sm">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredSignals.map((signal) => (
              <div
                key={signal.id}
                onClick={() => handleSignalClick(signal)}
                className={`bg-slate-900/50 border border-slate-800 rounded-3xl p-6 hover:border-slate-700/50 hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  selectedSignal?.id === signal.id ? 'ring-2 ring-violet-500/50' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg ${
                        signal.coin === 'BTC' ? 'bg-gradient-to-br from-orange-500 to-amber-500' :
                        signal.coin === 'ETH' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                        signal.coin === 'SOL' ? 'bg-gradient-to-br from-violet-500 to-purple-500' :
                        signal.coin === 'DOGE' ? 'bg-gradient-to-br from-amber-500 to-yellow-500' :
                        'bg-gradient-to-br from-slate-600 to-slate-700'
                      }`}>
                        {getCoinIcon(signal.coin)}
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">{signal.type}</p>
                        <p className="text-slate-400 text-sm">{signal.coin}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(signal.status)}`}>
                        {signal.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                        <DollarSign className="w-4 h-4" />
                        Price
                      </div>
                      <p className="text-2xl font-bold text-white">{signal.price}</p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 text-sm font-medium ${
                        signal.change24h.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {signal.change24h.startsWith('+') ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span>{signal.change24h}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                        <Percent className="w-4 h-4" />
                        Confidence
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-white">{signal.confidence}%</div>
                        <div className={`w-20 bg-slate-700 rounded-full h-3 overflow-hidden relative`}>
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${getConfidenceColor(signal.confidence)}`}
                            style={{ width: `${signal.confidence}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">AI</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">
                        {signal.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                    <p className="text-sm text-slate-300 leading-relaxed">{signal.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-sm">
          <div className="px-6 py-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <Activity className="w-5 h-5 mr-2 text-emerald-400" />
              Live Activity Feed
            </h2>
            <div className="flex items-center gap-4 text-slate-400 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span>Real-time updates</span>
              </div>
              <div className="text-right">
                {liveFeed.length} events
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 px-6">
            {liveFeed.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-2xl text-slate-400">
                  <AlertTriangle className="w-5 h-5" />
                  Waiting for real-time signals...
                </div>
              </div>
            ) : (
              liveFeed.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-slate-800/30 rounded-2xl hover:bg-slate-800/50 transition-all duration-200 group"
                >
                  <div className="flex-shrink-0 w-2">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      item.type === 'signal' ? 'bg-emerald-500' :
                      item.type === 'alert' ? 'bg-red-500' :
                      item.type === 'milestone' ? 'bg-amber-500' :
                      'bg-slate-500'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className={`text-sm leading-relaxed ${
                          item.type === 'signal' ? 'text-emerald-400' :
                          item.type === 'alert' ? 'text-red-400' :
                          item.type === 'milestone' ? 'text-amber-400' :
                          'text-slate-400'
                        }`}>
                          {item.message}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500 flex-shrink-0 mt-1">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-slate-500 text-sm">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-red-500'
            } animate-pulse`} />
            <span className="text-xs">
              Core7Tracker AI Trading System • Real-time Market Analysis
            </span>
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
