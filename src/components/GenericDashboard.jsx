'use client';

import { useState, useEffect } from 'react';
import { 
  Home, BarChart3, Users, Settings, 
  Bell, Search, Menu, X, TrendingUp, TrendingDown,
  Activity, DollarSign, Percent, Clock
} from 'lucide-react';

export default function GenericDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [signals, setSignals] = useState([]);
  const [marketSentiment, setMarketSentiment] = useState('NEUTRAL');
  const [sentimentScore, setSentimentScore] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [liveFeed, setLiveFeed] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING...');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Socket.IO connection
  useEffect(() => {
    const socket = io();
    
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

  // Initialize with trading-specific data
  useEffect(() => {
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

  const tradingStats = [
    { label: "Active Signals", value: signals.length.toString(), change: "+12.4%", color: "text-emerald-400", icon: TrendingUp },
    { label: "Market Sentiment", value: marketSentiment.replace('_', ' '), change: `${sentimentScore >= 0 ? '+' : ''}${sentimentScore.toFixed(1)}%`, color: "text-emerald-400", icon: Activity },
    { label: "Active Alerts", value: activeAlerts.toString(), change: "+3.2%", color: "text-amber-400", icon: Bell },
    { label: "Last Update", value: lastUpdated.toLocaleTimeString(), change: "Live", color: "text-zinc-400", icon: Clock },
  ];

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
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-zinc-900 border-r border-zinc-800 transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center gap-3 border-b border-zinc-800">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center text-2xl">
            📈
          </div>
          {sidebarOpen && <span className="font-semibold text-2xl tracking-tight">Trading</span>}
        </div>

        <div className="flex-1 px-3 py-6">
          <nav className="space-y-1">
            {[
              { icon: Home, label: "Dashboard", active: true },
              { icon: BarChart3, label: "Analytics" },
              { icon: Users, label: "Signals" },
              { icon: Settings, label: "Settings" },
            ].map((item) => (
              <a
                key={item.label}
                href="#"
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
                  item.active 
                    ? 'bg-zinc-800 text-white' 
                    : 'hover:bg-zinc-800/50 text-zinc-400 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </a>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 bg-zinc-700 rounded-full" />
            {sidebarOpen && (
              <div>
                <p className="font-medium text-sm">Core7Tracker</p>
                <p className="text-xs text-zinc-500">Live System</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Navigation */}
        <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-zinc-800 rounded-xl"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <div className="relative w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                placeholder="Search signals, coins, or events..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-zinc-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-3 hover:bg-zinc-800 rounded-2xl relative">
              <Bell size={20} />
              {activeAlerts > 0 && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-zinc-800">
              <div className="text-right">
                <p className="text-sm font-medium">Core7Tracker</p>
                <p className="text-xs text-zinc-500">Status: {connectionStatus}</p>
              </div>
              <div className={`w-9 h-9 rounded-full ${
                connectionStatus === 'CONNECTED' ? 'bg-emerald-500' : 
                connectionStatus === 'CONNECTING' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-4xl font-semibold tracking-tighter">Trading Dashboard</h1>
              <p className="text-zinc-400 mt-1">Real-time market intelligence and signal tracking</p>
            </div>
            <button className="bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:bg-zinc-100 transition">
              Export Data
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {tradingStats.map((stat, i) => (
              <div key={i} className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <stat.icon className="w-5 h-5 text-zinc-400" />
                  <p className="text-zinc-400 text-sm">{stat.label}</p>
                </div>
                <p className="text-4xl font-semibold tracking-tighter">{stat.value}</p>
                <p className={`text-sm mt-2 ${stat.color}`}>
                  {stat.change}
                </p>
              </div>
            ))}
          </div>

          {/* Signals Table */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl overflow-hidden mb-10">
            <div className="px-8 py-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Active Signals</h2>
              <p className="text-sm text-zinc-400">
                Real-time trading signals
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Coin</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">24h Change</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Signal</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {signals.map((signal, index) => (
                    <tr key={index} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-lg">
                            {signal.symbol}
                          </div>
                          <span className="font-mono font-semibold">{signal.coin}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xl font-semibold">{signal.price}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          signal.change24h.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {signal.change24h.startsWith('+') ? '↑' : '↓'} {signal.change24h}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-zinc-300">{signal.signal}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 rounded-xl text-xs font-medium border ${getStatusColor(signal.status)}`}>
                          {signal.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Feed & Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Feed */}
            <div className="lg:col-span-1 bg-zinc-900/70 border border-zinc-800 rounded-3xl overflow-hidden">
              <div className="px-8 py-6 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Live Feed</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-emerald-400">LIVE</span>
                </div>
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

            {/* Chart Placeholder */}
            <div className="lg:col-span-2 bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 h-96 flex items-center justify-center">
              <div className="text-center text-zinc-500">
                <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Market Analysis Chart</p>
                <p className="text-sm mt-1">Price trends and signal patterns</p>
                <p className="text-xs text-zinc-400 mt-2">Integration with Chart.js or Recharts available</p>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center text-xs text-zinc-500">
            Real-time data from Core7Tracker backend • Socket.IO connection • Market intelligence powered by AI
          </div>
        </div>
      </div>
    </div>
  );
}
