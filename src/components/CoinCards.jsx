import React from 'react';

const CoinCards = ({ coins }) => {
  const getTrendColor = (trend) => {
    switch (trend) {
      case 'BULLISH':
        return 'text-green-400';
      case 'BEARISH':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getSignalColor = (signal) => {
    if (signal.includes('Oversold') || signal.includes('Golden Cross') || signal.includes('Bullish')) {
      return 'text-green-400 bg-green-900/20 border-green-700';
    }
    if (signal.includes('Overbought') || signal.includes('Death Cross') || signal.includes('Bearish')) {
      return 'text-red-400 bg-red-900/20 border-red-700';
    }
    return 'text-gray-400 bg-gray-800/20 border-gray-600';
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getRSIColor = (rsi) => {
    if (rsi < 30) return 'text-red-400';
    if (rsi > 70) return 'text-green-400';
    return 'text-gray-400';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4">Market Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coins.map((coin) => (
          <div key={coin.symbol} className="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
            {/* Coin Symbol and Price */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-bold text-white text-lg">{coin.symbol}</div>
                <div className="text-2xl font-mono text-white">
                  ${coin.price.toFixed(2)}
                </div>
              </div>
              <div className={`text-sm font-mono ${getChangeColor(coin.change24h)}`}>
                {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
              </div>
            </div>

            {/* Technical Indicators */}
            <div className="space-y-2 text-sm">
              {/* RSI */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">RSI:</span>
                <span className={`font-mono font-semibold ${getRSIColor(coin.rsi)}`}>
                  {coin.rsi.toFixed(0)}
                </span>
              </div>

              {/* Trend */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Trend:</span>
                <span className={`font-semibold ${getTrendColor(coin.trend)}`}>
                  {coin.trend}
                </span>
              </div>

              {/* Signal */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Signal:</span>
                <div className={`px-2 py-1 rounded text-xs font-semibold border ${getSignalColor(coin.signal)}`}>
                  {coin.signal}
                </div>
              </div>
            </div>

            {/* Visual Indicator */}
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">Status</div>
                <div className="flex items-center space-x-1">
                  {coin.signal !== 'NONE' && (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  )}
                  <div className={`w-2 h-2 rounded-full ${
                    coin.trend === 'BULLISH' ? 'bg-green-400' :
                    coin.trend === 'BEARISH' ? 'bg-red-400' : 'bg-gray-400'
                  }`}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoinCards;
