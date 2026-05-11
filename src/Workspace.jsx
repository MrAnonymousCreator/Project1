import React, { useState } from 'react';
import { TrendingUp, Clock, Target, BarChart3 } from 'lucide-react';
import Chart from './components/Chart';

const Workspace = () => {
  const [selectedCoin, setSelectedCoin] = useState('');
  const [timeframe, setTimeframe] = useState('1h');
  const [strategy, setStrategy] = useState('');
  const [isTracking, setIsTracking] = useState(false);

  const presetOptions = [
    { icon: TrendingUp, label: 'BTC momentum', coin: 'BTC', strategy: 'momentum' },
    { icon: Clock, label: 'ETH swing setup', coin: 'ETH', strategy: 'swing' },
    { icon: Target, label: 'SOL volatility', coin: 'SOL', strategy: 'volatility' },
    { icon: BarChart3, label: 'Meme coin watchlist', coin: 'DOGE', strategy: 'watchlist' }
  ];

  const startTracking = () => {
    if (selectedCoin && strategy) {
      setIsTracking(true);
      // Will trigger sidebar tracking and main content
    }
  };

  if (isTracking) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Active Tracking</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-semibold text-sm">
                  BTC
                </div>
                <div>
                  <div className="font-medium text-gray-900">{selectedCoin} — {strategy}</div>
                  <div className="text-sm text-gray-500">{timeframe} timeframe</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Market Summary */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Summary</h3>
              <p className="text-gray-700 leading-relaxed">
                {selectedCoin} remains stable today. Momentum is slowly improving, but volume remains below average.
              </p>
            </div>

            {/* Key Signals */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Signals</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-gray-700">RSI recovering from oversold</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-gray-700">Buying pressure increasing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-gray-700">Resistance near $64.2k</span>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Chart</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <Chart 
                  data={[43000, 43200, 42800, 43500, 43100, 43800, 42500, 44000, 43700, 44200]}
                  color="#10b981"
                  height={200}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Core7</h1>
          <p className="text-lg text-gray-600">What would you like to track today?</p>
        </div>

        {/* Preset Options */}
        <div className="space-y-3">
          {presetOptions.map((preset, index) => {
            const Icon = preset.icon;
            return (
              <button
                key={index}
                onClick={() => {
                  setSelectedCoin(preset.coin);
                  setStrategy(preset.strategy);
                }}
                className={`w-full p-4 rounded-xl border border-gray-200 flex items-center gap-4 transition-all hover:border-gray-300 hover:bg-gray-50 ${
                  selectedCoin === preset.coin && strategy === preset.strategy
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  preset.coin === 'BTC' ? 'bg-orange-100 text-orange-600' :
                  preset.coin === 'ETH' ? 'bg-blue-100 text-blue-600' :
                  preset.coin === 'SOL' ? 'bg-purple-100 text-purple-600' :
                  'bg-amber-100 text-amber-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{preset.label}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Coin</label>
            <input
              type="text"
              value={selectedCoin}
              onChange={(e) => setSelectedCoin(e.target.value.toUpperCase())}
              placeholder="BTC, ETH, SOL..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Strategy</label>
            <input
              type="text"
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              placeholder="momentum, swing, volatility..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="5m">5 minutes</option>
              <option value="15m">15 minutes</option>
              <option value="1h">1 hour</option>
              <option value="4h">4 hours</option>
              <option value="1d">1 day</option>
            </select>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={startTracking}
          disabled={!selectedCoin || !strategy}
          className="w-full py-3 px-4 bg-emerald-500 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-emerald-600 transition-colors"
        >
          Start Tracking
        </button>
      </div>
    </div>
  );
};

export default Workspace;
