import React from 'react';

const MarketSentiment = ({ data }) => {
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'STRONG_BULLISH':
      case 'BULLISH':
        return 'text-green-400 bg-green-900/20 border-green-700';
      case 'SLIGHTLY_BULLISH':
        return 'text-green-300 bg-green-800/20 border-green-600';
      case 'STRONG_BEARISH':
      case 'BEARISH':
        return 'text-red-400 bg-red-900/20 border-red-700';
      case 'SLIGHTLY_BEARISH':
        return 'text-red-300 bg-red-800/20 border-red-600';
      default:
        return 'text-gray-400 bg-gray-800/20 border-gray-600';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'STRONG_BULLISH':
      case 'BULLISH':
        return '🟢';
      case 'SLIGHTLY_BULLISH':
        return '🟡';
      case 'STRONG_BEARISH':
      case 'BEARISH':
        return '🔴';
      case 'SLIGHTLY_BEARISH':
        return '🟠';
      default:
        return '⚪';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-white">Market Sentiment</h2>
          <div className={`px-4 py-2 rounded-full border ${getSentimentColor(data.sentiment)} flex items-center space-x-2`}>
            <span className="text-lg">{getSentimentIcon(data.sentiment)}</span>
            <span className="font-semibold">{data.sentiment.replace('_', ' ')}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-sm">
          <div className="text-center">
            <div className="text-gray-400">Score</div>
            <div className={`font-mono font-semibold ${data.sentimentScore >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {data.sentimentScore >= 0 ? '+' : ''}{data.sentimentScore.toFixed(2)}%
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-gray-400">Active Alerts</div>
            <div className="font-mono font-semibold text-yellow-400">{data.activeAlerts}</div>
          </div>
          
          <div className="text-center">
            <div className="text-gray-400">BTC Dominance</div>
            <div className="font-mono font-semibold text-blue-400">{data.btcDominance.toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketSentiment;
