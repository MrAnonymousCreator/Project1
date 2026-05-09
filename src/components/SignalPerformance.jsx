import React from 'react';

const SignalPerformance = ({ data }) => {
  const getWinRateColor = (winRate) => {
    if (winRate >= 65) return 'text-green-400';
    if (winRate >= 55) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceIcon = (value, isPositive = true) => {
    if (isPositive) {
      if (value >= 1.5) return '🚀';
      if (value >= 1.0) return '📈';
      return '📊';
    } else {
      if (value <= -1.5) return '📉';
      if (value <= -1.0) return '⚠️';
      return '📊';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4">Signal Performance</h3>
      
      <div className="space-y-4">
        {/* Win Rate */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Win Rate</span>
            <span className={`text-2xl font-bold font-mono ${getWinRateColor(data.winRate)}`}>
              {data.winRate.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                data.winRate >= 65 ? 'bg-green-400' :
                data.winRate >= 55 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${Math.min(100, data.winRate)}%` }}
            ></div>
          </div>
        </div>

        {/* Average Performance */}
        <div className="grid grid-cols-2 gap-3">
          {/* Average Peak */}
          <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-xs">Avg Peak</div>
                <div className="text-green-400 font-bold font-mono text-lg">
                  +{data.avgPeak.toFixed(1)}%
                </div>
              </div>
              <div className="text-2xl">
                {getPerformanceIcon(data.avgPeak, true)}
              </div>
            </div>
          </div>

          {/* Average Dip */}
          <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-xs">Avg Dip</div>
                <div className="text-red-400 font-bold font-mono text-lg">
                  {data.avgDip.toFixed(1)}%
                </div>
              </div>
              <div className="text-2xl">
                {getPerformanceIcon(data.avgDip, false)}
              </div>
            </div>
          </div>
        </div>

        {/* Total Signals */}
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-xs">Total Signals</div>
              <div className="text-white font-bold font-mono text-lg">
                {data.totalSignals}
              </div>
            </div>
            <div className="text-blue-400 text-xs bg-blue-900/20 px-2 py-1 rounded border border-blue-700">
              All Time
            </div>
          </div>
        </div>

        {/* Performance Rating */}
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
          <div className="text-center">
            <div className="text-gray-400 text-xs mb-1">Performance Rating</div>
            <div className="flex items-center justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-lg ${
                    star <= Math.floor(data.winRate / 20)
                      ? 'text-yellow-400'
                      : 'text-gray-600'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {data.winRate >= 65 ? 'Excellent' :
               data.winRate >= 55 ? 'Good' :
               data.winRate >= 45 ? 'Average' : 'Poor'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalPerformance;
