import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Target, BarChart3, Calendar } from 'lucide-react';
import Chart from './components/Chart';
import { io } from 'socket.io-client';

const Workspace = () => {
  const [selectedCoin, setSelectedCoin] = useState('');
  const [timeframe, setTimeframe] = useState('1h');
  const [strategy, setStrategy] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(5); // seconds
  const [liveData, setLiveData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(0);
  const [marketSignals, setMarketSignals] = useState([]);

  const presetOptions = [
    { icon: TrendingUp, label: 'BTC momentum', coin: 'BTC', strategy: 'momentum' },
    { icon: Clock, label: 'ETH swing setup', coin: 'ETH', strategy: 'swing' },
    { icon: Target, label: 'SOL volatility', coin: 'SOL', strategy: 'volatility' },
    { icon: BarChart3, label: 'Meme coin watchlist', coin: 'DOGE', strategy: 'watchlist' }
  ];

  // Connect to live data
  useEffect(() => {
    const socket = io();
    
    socket.on('connect', () => {
      console.log('Connected to live market data');
    });

    socket.on('market-data', (data) => {
      if (data.symbol === selectedCoin) {
        setCurrentPrice(data.price);
        setPriceChange(data.change);
        setLiveData(prev => [...prev.slice(-99), data.price]);
      }
    });

    socket.on('signal', (signal) => {
      if (signal.symbol === selectedCoin) {
        setMarketSignals(prev => [...prev.slice(-4), signal]);
      }
    });

    return () => socket.disconnect();
  }, [selectedCoin]);

  // Auto-update based on interval
  useEffect(() => {
    if (!isTracking) return;
    
    const interval = setInterval(() => {
      // Request fresh data
      fetch(`/api/market-data/${selectedCoin}`)
        .then(res => res.json())
        .then(data => {
          setCurrentPrice(data.price);
          setPriceChange(data.change);
          setLiveData(prev => [...prev.slice(-99), data.price]);
        })
        .catch(err => console.error('Error fetching data:', err));
    }, updateInterval * 1000);

    return () => clearInterval(interval);
  }, [isTracking, selectedCoin, updateInterval]);

  const startTracking = () => {
    if (selectedCoin && strategy) {
      setIsTracking(true);
      // Initialize with empty arrays for live data
      setLiveData([]);
      setMarketSignals([]);
    }
  };

  if (isTracking) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex">
        {/* Apple Stocks-style Sidebar */}
        <div className="w-72 border-r border-gray-100 bg-gray-50">
          {/* Global Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search coins..."
                className="w-full px-4 py-3 pr-10 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
              <div className="absolute right-3 top-3.5 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-2">
              <a
                href="/workspace"
                className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-gray-50 transition-colors"
              >
                <BarChart3 className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Workspace</span>
              </a>
              <a
                href="/calendar"
                className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-gray-50 transition-colors"
              >
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Calendar</span>
              </a>
            </div>
          </div>

          {/* Watchlist */}
          <div className="p-4">
            <div className="text-xs font-medium text-gray-500 mb-4 uppercase tracking-wider">Watchlist</div>
            <div className="space-y-2">
              {['BTC', 'ETH', 'SOL', 'DOGE', 'AVAX'].map((coin) => (
                <button
                  key={coin}
                  onClick={() => setSelectedCoin(coin)}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    selectedCoin === coin 
                      ? 'bg-white border border-gray-300 shadow-sm' 
                      : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        coin === 'BTC' ? 'bg-orange-100 text-orange-600' :
                        coin === 'ETH' ? 'bg-blue-100 text-blue-600' :
                        coin === 'SOL' ? 'bg-purple-100 text-purple-600' :
                        coin === 'DOGE' ? 'bg-amber-100 text-amber-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {coin.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{coin}</div>
                        <div className="text-xs text-gray-500">
                          ${coin === 'BTC' ? '43,291' : 
                            coin === 'ETH' ? '2,180' : 
                            coin === 'SOL' ? '105.50' : 
                            coin === 'DOGE' ? '0.085' : '18.42'}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      {coin === 'BTC' ? '+2.1%' : 
                        coin === 'ETH' ? '+1.8%' : 
                        coin === 'SOL' ? '-1.2%' : 
                        coin === 'DOGE' ? '+5.7%' : 
                        '+0.9%'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Panel */}
        <div className="flex-1 flex flex-col">
          {/* News Ticker */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-2 overflow-hidden">
            <div className="flex items-center gap-8 animate-scroll">
              <span className="text-sm text-gray-600 whitespace-nowrap">
                ETF inflows rise for BTC →
              </span>
              <span className="text-sm text-gray-600 whitespace-nowrap">
                Fed signals possible rate pause →
              </span>
              <span className="text-sm text-gray-600 whitespace-nowrap">
                ETH volume increasing →
              </span>
            </div>
          </div>

          {/* Token Overview */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-light text-gray-900">
                  {selectedCoin === 'BTC' ? 'Bitcoin' : 
                   selectedCoin === 'ETH' ? 'Ethereum' : 
                   selectedCoin === 'SOL' ? 'Solana' : 
                   selectedCoin === 'DOGE' ? 'Dogecoin' : 'Avalanche'}
                </h1>
                <div className="text-sm text-gray-500">
                  {selectedCoin}/USD
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-light ${
                  priceChange >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  ${currentPrice?.toFixed(2) || '---'}
                </div>
                <div className={`text-lg ${
                  priceChange >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange?.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Timeframe Selector */}
            <div className="flex gap-2">
              {['1H', '4H', '1D', '1W'].map((tf) => (
                <button
                  key={tf}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeframe === tf
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setTimeframe(tf.toLowerCase())}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Chart and Alerts */}
          <div className="flex-1 px-8 py-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Chart */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <Chart 
                  data={liveData}
                  color={priceChange >= 0 ? '#10b981' : '#ef4444'}
                  height={300}
                />
              </div>

              {/* Market Interpretation */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-700 mb-4">Market Interpretation</div>
                
                {/* Order Flow Analysis */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600">Order Flow</span>
                    <span className={`font-medium ${
                      Math.random() > 0.5 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {Math.random() > 0.5 ? 'Buying Pressure' : 'Selling Pressure'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {Math.random() > 0.5 
                      ? 'Heavy buying entered the market, but sellers absorbed most of the pressure. Low-conviction selling suggests weakness.'
                      : 'Heavy selling entered the market, but buyers absorbed much of the pressure. The drop appears low-conviction with weakening sell participation.'}
                  </div>
                </div>

                {/* Buy/Sell Aggression */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600">Aggression</span>
                    <span className={`font-medium ${
                      Math.random() > 0.5 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {Math.random() > 0.5 ? 'Buyers' : 'Sellers'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {Math.random() > 0.5 
                      ? 'Buyers showing strong conviction with sustained pressure. Sellers appear exhausted despite price weakness.'
                      : 'Sellers showing aggressive behavior with weak conviction. Buyers struggling to absorb selling pressure.'}
                  </div>
                </div>

                {/* Volume Quality */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600">Volume Quality</span>
                    <span className={`font-medium ${
                      Math.random() > 0.5 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {Math.random() > 0.5 ? 'Strong' : 'Weak'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {Math.random() > 0.5 
                      ? 'Price rising on strong volume with broad participation. Indicates healthy market conviction.'
                      : 'Price falling on weak volume with narrow participation. Suggests lack of market confidence.'}
                  </div>
                </div>

                {/* Market Behavior */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600">Volume Delta</span>
                    <span className={`font-medium ${
                      Math.random() > 0.5 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {Math.random() > 0.5 ? '+' : ''}{(Math.random() * 200 - 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {Math.random() > 0.5 
                      ? 'Above-average volume with net buying pressure suggests institutional accumulation.'
                      : 'Below-average volume with net selling suggests distribution or uncertainty.'}
                  </div>
                </div>

                {/* Market Mood */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600">Market Mood</span>
                    <span className={`font-medium ${
                      Math.random() > 0.5 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {Math.random() > 0.5 ? 'Calm' : 'Anxious'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {Math.random() > 0.5 
                      ? 'Low volatility with steady accumulation suggests healthy market environment.'
                      : 'High volatility with erratic movements indicates uncertainty and risk aversion.'}
                  </div>
                </div>

                {/* Volatility State */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600">Volatility</span>
                    <span className={`font-medium ${
                      Math.random() > 0.7 ? 'text-red-600' : 'text-emerald-600'
                    }`}>
                      {Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Moderate' : 'Low'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {Math.random() > 0.7 
                      ? 'Market experiencing compression phase with sharp directional moves. Increased risk of reversals.'
                      : Math.random() > 0.4 
                        ? 'Market in range-bound phase with moderate volatility. Suitable for swing trading.'
                        : 'Market in expansion phase with low volatility. Trend-following strategies performing well.'}
                  </div>
                </div>

                {/* Key Levels */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600">Key Levels</span>
                    <span className="font-medium text-gray-900">
                      ${selectedCoin === 'BTC' ? '44,500' : 
                        selectedCoin === 'ETH' ? '2,250' : '110.00'} (Support)
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {priceChange >= 0 
                      ? 'Price approaching resistance with increasing volume. Watch for potential breakout if buyers maintain pressure.'
                      : 'Price testing support with decreasing volume. Watch for potential breakdown if sellers intensify.'}
                  </div>
                </div>

                {/* Market Narrative */}
                <div className="text-sm text-gray-700 leading-relaxed">
                  <p>
                    {Math.random() > 0.5 
                      ? `The move appears supported by strong participation, suggesting conviction behind the ${priceChange >= 0 ? 'rally' : 'recovery'}.`
                      : `The move shows weakening participation with low conviction, indicating potential for further ${priceChange >= 0 ? 'weakness' : 'stabilization'}.`
                    }
                  </p>
                  <p>
                    {Math.random() > 0.5 
                      ? `The move appears supported by strong participation, suggesting conviction behind the ${priceChange >= 0 ? 'rally' : 'recovery'}.`
                      : `The move shows weakening participation with low conviction, indicating potential for further ${priceChange >= 0 ? 'weakness' : 'stabilization'}.`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center p-12">
      <div className="max-w-lg w-full space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-4 tracking-tight">Core7</h1>
          <p className="text-xl text-gray-600 font-light">What would you like to track today?</p>
        </div>

        {/* Preset Options */}
        <div className="space-y-4">
          {presetOptions.map((preset, index) => {
            const Icon = preset.icon;
            return (
              <button
                key={index}
                onClick={() => {
                  setSelectedCoin(preset.coin);
                  setStrategy(preset.strategy);
                }}
                className={`w-full p-6 rounded-2xl border border-gray-200 flex items-center gap-4 transition-all hover:border-gray-300 hover:bg-white ${
                  selectedCoin === preset.coin && strategy === preset.strategy
                    ? 'border-gray-900 bg-gray-50 shadow-sm'
                    : 'bg-white'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  preset.coin === 'BTC' ? 'bg-orange-50 text-orange-600' :
                  preset.coin === 'ETH' ? 'bg-blue-50 text-blue-600' :
                  preset.coin === 'SOL' ? 'bg-purple-50 text-purple-600' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-left flex-1">
                  <div className="text-lg font-medium text-gray-900">{preset.label}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Selection */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Coin</label>
            <input
              type="text"
              value={selectedCoin}
              onChange={(e) => setSelectedCoin(e.target.value.toUpperCase())}
              placeholder="BTC, ETH, SOL..."
              className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Strategy</label>
            <input
              type="text"
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              placeholder="momentum, swing, volatility..."
              className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white"
            >
              <option value="5m">5 minutes</option>
              <option value="15m">15 minutes</option>
              <option value="1h">1 hour</option>
              <option value="4h">4 hours</option>
              <option value="1d">1 day</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Update Interval</label>
            <select
              value={updateInterval}
              onChange={(e) => setUpdateInterval(parseInt(e.target.value))}
              className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white"
            >
              <option value={1}>1 second</option>
              <option value={5}>5 seconds</option>
              <option value={10}>10 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
            </select>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={startTracking}
          disabled={!selectedCoin || !strategy}
          className="w-full py-4 px-6 bg-gray-900 text-white rounded-xl font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors text-lg"
        >
          Start Tracking
        </button>
      </div>
    </div>
  );
};

export default Workspace;
