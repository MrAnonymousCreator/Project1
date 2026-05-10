import React from 'react';

const Sparkline = ({ data, color = '#10b981', height = 40, width = 80 }) => {
  if (!data || data.length < 2) {
    return (
      <div 
        className="flex items-center justify-center"
        style={{ width, height }}
      >
        <div className="w-full h-px bg-gray-700"></div>
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const lastValue = data[data.length - 1];
  const isPositive = lastValue >= data[0];

  return (
    <div className="relative" style={{ width, height }}>
      <svg
        width={width}
        height={height}
        className="overflow-visible"
      >
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div 
        className={`absolute text-xs font-medium ${
          isPositive ? 'text-emerald-400' : 'text-red-400'
        }`}
        style={{ 
          right: '0', 
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      >
        {lastValue >= 0 ? '+' : ''}{lastValue.toFixed(1)}%
      </div>
    </div>
  );
};

export default Sparkline;
