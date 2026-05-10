import React from 'react';
import io from 'socket.io-client';
import './index.css';

const TradingDashboard = () => {
  const [signals, setSignals] = React.useState([]);
  const [marketSentiment, setMarketSentiment] = React.useState('NEUTRAL');
  const [sentimentScore, setSentimentScore] = React.useState(0);
  const [activeAlerts, setActiveAlerts] = React.useState(0);
  const [liveFeed, setLiveFeed] = React.useState([]);
  const [connectionStatus, setConnectionStatus] = React.useState('CONNECTING...');
  const [lastUpdated, setLastUpdated] = React.useState(new Date());
  const [notifications, setNotifications] = React.useState([]);

  // Sound notification
  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore errors
    } catch (error) {
      // Ignore audio errors
    }
  };

  // Push notification
  const showPushNotification = (signal) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${signal.coin} - ${signal.type}`, {
        body: signal.message,
        icon: '/favicon.ico',
        tag: 'trading-signal'
      });
    }
  };

  // Show notification (sound + push)
  const showNotification = (signal) => {
    // Play sound
    playNotificationSound();
    
    // Show push notification
    showPushNotification(signal);
    
    // Add to in-app notifications
    const notification = {
      id: Date.now(),
      ...signal,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Request notification permission on mount
  React.useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  React.useEffect(() => {
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
      addLiveFeedItem(data.message || data.type, 'signal');
      updateSignalsFromBackend(data);
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

  const updateSignalsFromBackend = (signalData) => {
    // Handle real signal data from backend
    const newSignal = {
      id: signalData.timestamp || Date.now() + Math.random(),
      coin: signalData.symbol || 'BTC',
      type: signalData.type || 'Signal',
      message: signalData.message || 'New trading signal',
      price: `$${signalData.price?.toFixed(2) || '0.00'}`,
      change24h: signalData.change ? `${signalData.change >= 0 ? '+' : ''}${signalData.change.toFixed(2)}%` : '+0.00%',
      confidence: signalData.confidence || 75,
      bias: signalData.bias || 'NEUTRAL',
      strength: signalData.strength || 'MODERATE',
      status: 'ACTIVE',
      timestamp: new Date(signalData.timestamp || Date.now())
    };
    
    setSignals(prev => {
      // Remove existing signal for same coin, add new one
      const existing = prev.filter(s => s.coin !== newSignal.coin);
      return [newSignal, ...existing.slice(0, 11)];
    });
    
    // Show notification for new signal
    showNotification(newSignal);
  };

  const extractCoinFromMessage = (message) => {
    const coins = ['BTC', 'ETH', 'SOL', 'DOGE', 'AVAX', 'LINK'];
    const foundCoin = coins.find(coin => message.toUpperCase().includes(coin));
    return foundCoin || 'BTC';
  };

  const extractSignalType = (message) => {
    if (message.includes('Golden Cross')) return 'Golden Cross';
    if (message.includes('RSI Oversold')) return 'RSI Oversold';
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

  // Initialize with sample data
  React.useEffect(() => {
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
      }
    ];
    setSignals(initialSignals);
    setActiveAlerts(3);
    setMarketSentiment('BULLISH');
    setSentimentScore(25.5);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl animate-pulse max-w-sm"
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                notification.bias === 'BULLISH' ? 'bg-emerald-400' : 
                notification.bias === 'BEARISH' ? 'bg-red-400' : 'bg-gray-400'
              }`} />
              <div className="flex-1">
                <div className="font-bold text-white">{notification.coin} - {notification.type}</div>
                <div className="text-sm text-gray-400">{notification.message}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {notification.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-2">Core7Tracker</h1>
              <p className="text-gray-400 text-sm sm:text-base">AI Trading Signals Dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-red-500'
              } animate-pulse`} />
              <span className="text-sm text-gray-400">{connectionStatus}</span>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Market Sentiment</h3>
            <div className={`text-xl sm:text-2xl font-bold ${
              marketSentiment === 'BULLISH' ? 'text-emerald-400' : 
              marketSentiment === 'BEARISH' ? 'text-red-400' : 'text-gray-400'
            }`}>
              {marketSentiment}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Score: {sentimentScore >= 0 ? '+' : ''}{sentimentScore.toFixed(1)}
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Active Signals</h3>
            <div className="text-xl sm:text-2xl font-bold text-white">{signals.length}</div>
            <div className="text-xs text-gray-500 mt-1">Live trading</div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Alerts</h3>
            <div className="text-xl sm:text-2xl font-bold text-amber-400">{activeAlerts}</div>
            <div className="text-xs text-gray-500 mt-1">Need attention</div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Last Update</h3>
            <div className="text-lg sm:text-xl font-bold text-white">
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-gray-500 mt-1">Real-time</div>
          </div>
        </div>

        {/* Trading Signals */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">Trading Signals</h2>
          </div>
          
          <div className="p-4 sm:p-6">
            {signals.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="inline-flex items-center gap-3 px-4 py-3 bg-gray-800 rounded-lg text-gray-400 mb-4">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  <span className="text-sm">Waiting for signals...</span>
                </div>
                <p className="text-xs text-gray-500">Connect to Binance for real-time data</p>
              </div>
            ) : (
              <div className="space-y-3">
                {signals.map((signal, index) => (
                  <div
                    key={signal.id || index}
                    className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Left side - Coin and Signal */}
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                          signal.coin === 'BTC' ? 'bg-orange-500/20 text-orange-400' :
                          signal.coin === 'ETH' ? 'bg-blue-500/20 text-blue-400' :
                          signal.coin === 'SOL' ? 'bg-purple-500/20 text-purple-400' :
                          signal.coin === 'DOGE' ? 'bg-amber-500/20 text-amber-400' :
                          signal.coin === 'AVAX' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {signal.coin.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-bold text-lg">{signal.coin}</div>
                          <div className="text-sm text-gray-400">{signal.type}</div>
                        </div>
                      </div>

                      {/* Center - Price and Change */}
                      <div className="text-center sm:text-left">
                        <div className="text-white font-bold text-lg">{signal.price}</div>
                        <div className={`text-sm font-medium ${
                          signal.change24h.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {signal.change24h}
                        </div>
                      </div>

                      {/* Right side - Badge and Confidence */}
                      <div className="flex flex-col sm:items-end gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getBiasColor(signal.bias)}`}>
                          {signal.bias}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Confidence</span>
                          <span className="text-sm font-bold text-white">{signal.confidence}%</span>
                        </div>
                        {signal.strength && (
                          <div className={`text-xs font-medium ${getStrengthColor(signal.strength)}`}>
                            {signal.strength}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-sm text-gray-300">{signal.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Activity Feed */}
        {liveFeed.length > 0 && (
          <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Live Activity</h2>
            </div>
            
            <div className="p-4 sm:p-6 max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {liveFeed.slice(0, 10).map((item, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                      item.type === 'signal' ? 'bg-emerald-400' :
                      item.type === 'alert' ? 'bg-red-400' :
                      'bg-gray-400'
                    }`} />
                    <div className="flex-1">
                      <p className="text-gray-300">{item.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingDashboard;
