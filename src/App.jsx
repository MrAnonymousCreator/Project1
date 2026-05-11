import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './Landing.jsx';
import Workspace from './Workspace.jsx';
import MarketCalendar from './MarketCalendar.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import './index.css';

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/workspace/:coin" element={<Workspace />} />
          <Route path="/calendar" element={<MarketCalendar />} />
          <Route path="/tracking" element={<Tracking />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

  // Helper function to get bias color
  const getBiasColor = (bias) => {
    switch(bias) {
      case 'BULLISH': return 'bg-emerald-500 text-white';
      case 'BEARISH': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Generate AI explanation for signal
  const generateAIExplanation = (signal) => {
    const explanations = {
      'RSI Oversold': `${signal.coin} appears oversold after recent selling pressure. This could indicate a potential reversal opportunity as the asset may be undervalued.`,
      'RSI Overbought': `${signal.coin} seems overbought after recent buying activity. This suggests the asset may be overvalued and could see a pullback soon.`,
      'MACD Bullish Crossover': `${signal.coin} shows positive momentum as the MACD line crossed above the signal line. This typically indicates upward price movement.`,
      'MACD Bearish Crossover': `${signal.coin} is showing negative momentum with the MACD line crossing below the signal line. This often precedes downward price movement.`,
      'Volume Spike': `${signal.coin} is experiencing unusual trading volume, which could signal significant market movement or institutional activity.`
    };
    
    return explanations[signal.type] || `${signal.coin} is showing ${signal.type.toLowerCase()} patterns that traders should monitor closely.`;
  };

  // Initialize with fallback data
  const initializeFallbackData = () => {
    const fallbackSignals = [
      {
        id: 'demo-1',
        coin: 'BTC',
        type: 'RSI Oversold',
        message: '28.5 RSI suggests oversold conditions',
        price: '$43,250.00',
        change24h: '+2.4%',
        confidence: 85,
        bias: 'BULLISH',
        strength: 'STRONG',
        status: 'ACTIVE',
        timestamp: new Date(Date.now() - 900000),
        sparkline: Array.from({ length: 10 }, () => (Math.random() - 0.5) * 3)
      },
      {
        id: 'demo-2',
        coin: 'ETH',
        type: 'MACD Bullish Crossover',
        message: 'MACD shows positive momentum shift',
        price: '$2,180.50',
        change24h: '+1.8%',
        confidence: 78,
        bias: 'BULLISH',
        strength: 'MODERATE',
        status: 'ACTIVE',
        timestamp: new Date(Date.now() - 600000),
        sparkline: Array.from({ length: 10 }, () => (Math.random() - 0.5) * 2)
      }
    ];

    setSignals(fallbackSignals);
    setMarketSentiment('BULLISH');
    setSentimentScore(15.2);
    setActiveAlerts(2);
    setDemoMode(true);
    setLoading(false);
  };

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

  // Safe socket connection with timeout and fallback
  React.useEffect(() => {
    let socket = null;
    let connectionTimeout = null;

    const connectToServer = () => {
      try {
        socket = io();
        
        // Set connection timeout
        connectionTimeout = setTimeout(() => {
          console.log('⏰ Connection timeout, switching to demo mode');
          setConnectionError('Connection timeout');
          initializeFallbackData();
        }, 8000); // 8 second timeout

        socket.on('connect', () => {
          console.log('✅ Connected to trading signals server');
          setConnectionStatus('CONNECTED');
          setLoading(false);
          setDemoMode(false);
          setConnectionError(null);
          
          if (connectionTimeout) {
            clearTimeout(connectionTimeout);
            connectionTimeout = null;
          }
        });

        socket.on('disconnect', () => {
          console.log('🔌 Disconnected from trading signals server');
          setConnectionStatus('DISCONNECTED');
        });

        socket.on('connect_error', (error) => {
          console.error('❌ Connection error:', error);
          setConnectionError('Connection failed');
          initializeFallbackData();
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

        socket.on('initial-data', (data) => {
          if (data.signals && data.signals.length > 0) {
            setSignals(data.signals);
          }
        });

      } catch (error) {
        console.error('❌ Socket initialization error:', error);
        setConnectionError('Socket initialization failed');
        initializeFallbackData();
      }
    };

    connectToServer();

    return () => {
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      if (socket) {
        socket.disconnect();
      }
    };
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
    
    // Set new signal ID for animation
    setNewSignalId(newSignal.id);
    
    // Clear animation ID after animation completes
    setTimeout(() => setNewSignalId(null), 1000);
    
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

  // Loading state fallback
  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-gray-300 border-t-gray-400 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900">Core7</h2>
          <p className="text-gray-600 text-lg">Connecting to market feed...</p>
          {connectionError && (
            <p className="text-amber-600 text-sm mt-3">{connectionError}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Demo mode indicator */}
      {demoMode && (
        <div className="fixed top-4 left-4 z-50">
          <div className="bg-amber-100 border border-amber-300 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
            <span className="text-amber-700 text-sm font-medium">Demo Mode</span>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications?.map((notification) => (
          <div
            key={notification.id}
            className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 shadow-xl animate-pulse max-w-sm border border-gray-800/30"
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${getBiasColor(notification.bias)}`} />
              <div className="flex-1">
                <div className="font-bold text-white">{notification.coin} - {notification.type}</div>
                <div className="text-sm text-gray-400">{notification.message}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {notification.timestamp?.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-2">Core7</h1>
              <p className="text-gray-400">AI Trading Intelligence</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-red-500'
              } animate-pulse`} />
              <span className="text-sm text-gray-400">{connectionStatus}</span>
            </div>
          </div>
        </header>

        {/* AI Summary Hero */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-8 border border-gray-200">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-400/10 rounded-full mb-4">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 font-medium">Live Analysis</span>
            </div>
            
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {marketSentiment === 'BULLISH' ? 'Bullish momentum detected' :
               marketSentiment === 'BEARISH' ? 'Bearish pressure building' :
               'Market consolidating'}
            </div>
            
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              {signals?.length > 0 ? (
                <>
                  {signals.slice(0, 3).map((signal, index) => (
                    <span key={signal?.id} className="block mb-2">
                      {signal?.coin} showing {signal?.type?.toLowerCase()} with {signal?.confidence}% confidence
                      {index < signals.slice(0, 3).length - 1 && <span className="text-gray-500"> • </span>}
                    </span>
                  ))}
                  {signals.length > 3 && (
                    <span className="text-gray-500"> +{signals.length - 3} more signals</span>
                  )}
                </>
              ) : (
                <span className="text-gray-400">Monitoring market conditions...</span>
              )}
            </p>
            
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">{signals.length}</div>
                <div className="text-sm text-gray-400">Active signals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">{activeAlerts}</div>
                <div className="text-sm text-gray-400">Alerts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{sentimentScore >= 0 ? '+' : ''}{sentimentScore.toFixed(0)}</div>
                <div className="text-sm text-gray-400">Sentiment score</div>
              </div>
            </div>
          </div>

        {/* Signal Feed */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Live Signal Feed</h2>
            <p className="text-gray-500 text-sm">Click any signal for AI analysis</p>
          </div>
          
          {!signals || signals.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-gray-100 rounded-xl text-gray-500 mb-4">
                <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Monitoring market conditions...</span>
              </div>
              <p className="text-sm text-gray-400">AI analysis ready when signals appear</p>
            </div>
          ) : (
            <div className="space-y-3">
              {signals.map((signal, index) => (
                <div
                  key={signal.id || index}
                  className={`bg-white border border-gray-200 rounded-xl p-5 cursor-pointer transition-all hover:shadow-md hover:border-gray-300 ${
                    signal.id === newSignalId ? 'ring-2 ring-emerald-400/20' : ''
                  } ${expandedSignal === signal.id ? 'bg-gray-50' : ''}`}
                  onClick={() => setExpandedSignal(expandedSignal === signal.id ? null : signal.id)}
                >
                    <div className="flex items-center justify-between">
                      {/* Left side - Coin and Signal */}
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-semibold ${
                          signal.coin === 'BTC' ? 'bg-orange-100 text-orange-600' :
                          signal.coin === 'ETH' ? 'bg-blue-100 text-blue-600' :
                          signal.coin === 'SOL' ? 'bg-purple-100 text-purple-600' :
                          signal.coin === 'DOGE' ? 'bg-amber-100 text-amber-600' :
                          signal.coin === 'AVAX' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {signal.coin}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-lg">{signal.coin}</div>
                          <div className="text-sm text-gray-500">{signal.type}</div>
                        </div>
                      </div>

                      {/* Right side - Badge and Confidence */}
                      <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 rounded-full text-sm font-medium ${getBiasColor(signal.bias)}`}>
                          {signal.bias}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 text-lg">{signal.confidence}%</div>
                          <div className="text-xs text-gray-500">confidence</div>
                        </div>
                        <div className={`w-2 h-2 rounded-full transition-transform text-gray-400 ${
                          expandedSignal === signal.id ? 'rotate-90' : ''
                        }`} />
                      </div>
                    </div>

                    {/* Expanded AI Analysis */}
                    {expandedSignal === signal.id && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                              AI Analysis
                            </h4>
                            <p className="text-gray-700 leading-relaxed">
                              {generateAIExplanation(signal)}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6 text-sm">
                            <div>
                              <span className="text-gray-500">Current Price:</span>
                              <span className="font-medium text-gray-900 ml-2">{signal.price}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">24h Change:</span>
                              <span className={`font-medium ml-2 ${signal.change24h.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                                {signal.change24h}
                              </span>
                            </div>
                          </div>
                          
                          {signal.sparkline && (
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                Price Movement
                              </h4>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <Sparkline 
                                  data={signal.sparkline}
                                  color={signal.bias === 'BULLISH' ? '#10b981' : '#ef4444'}
                                  width={240}
                                  height={50}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
