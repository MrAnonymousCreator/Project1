import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [stats, setStats] = useState({
    trades: 0,
    winRate: 0,
    pnl: 0,
    active: 0
  });
  
  const [activeTrades, setActiveTrades] = useState([]);
  const [recentResults, setRecentResults] = useState([]);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Mock data for now - will connect to real data later
      setStats({
        trades: 12,
        winRate: 58,
        pnl: 2.1,
        active: 5
      });
      
      setActiveTrades([
        {
          symbol: 'BTCUSDT',
          signalType: 'Bollinger Squeeze',
          entryPrice: 78900,
          currentPrice: 78880,
          targetPrice: 79600,
          stopPrice: 78600,
          timeElapsed: 3,
          pnl: -0.05
        },
        {
          symbol: 'SOLUSDT',
          signalType: 'Break & Retest',
          entryPrice: 84.07,
          currentPrice: 84.15,
          targetPrice: 84.80,
          stopPrice: 83.60,
          timeElapsed: 8,
          pnl: 0.09
        },
        {
          symbol: 'DOGEUSDT',
          signalType: 'Bollinger Squeeze',
          entryPrice: 0.1105,
          currentPrice: 0.1108,
          targetPrice: 0.1115,
          stopPrice: 0.1102,
          timeElapsed: 12,
          pnl: 0.27
        }
      ]);
      
      setRecentResults([
        { symbol: 'BTC', pnl: 0.4, time: 12, status: 'win' },
        { symbol: 'SOL', pnl: -0.3, time: 8, status: 'loss' },
        { symbol: 'DOGE', pnl: 0.1, time: 60, status: 'expired' },
        { symbol: 'AVAX', pnl: 0.6, time: 25, status: 'win' },
        { symbol: 'LINK', pnl: -0.2, time: 15, status: 'loss' }
      ]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price) => {
    if (price < 1) return price.toFixed(4);
    return price.toLocaleString();
  };

  const formatPnl = (pnl) => {
    const sign = pnl >= 0 ? '+' : '';
    return `${sign}${pnl.toFixed(2)}%`;
  };

  return (
    <div className="dashboard">
      {/* TOP BAR */}
      <div className="top-bar">
        <div className="stat-item">
          <div className="stat-label">Trades</div>
          <div className="stat-value">{stats.trades}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Win Rate</div>
          <div className="stat-value">{stats.winRate}%</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">PnL</div>
          <div className={`stat-value ${stats.pnl >= 0 ? 'positive' : 'negative'}`}>
            {formatPnl(stats.pnl)}
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Active</div>
          <div className="stat-value">{stats.active}</div>
        </div>
      </div>

      {/* ACTIVE TRADES */}
      <div className="section">
        <div className="section-header">📈 ACTIVE TRADES</div>
        <div className="trades-grid">
          {activeTrades.map((trade, index) => (
            <div key={index} className="trade-card">
              <div className="trade-header">
                <span className="symbol">{trade.symbol}</span>
                <span className="signal-type">{trade.signalType}</span>
              </div>
              
              <div className="trade-prices">
                <div className="price-row">
                  <span>Entry:</span>
                  <span>${formatPrice(trade.entryPrice)}</span>
                </div>
                <div className="price-row">
                  <span>Now:</span>
                  <span className={trade.pnl >= 0 ? 'positive' : 'negative'}>
                    ${formatPrice(trade.currentPrice)}
                  </span>
                </div>
              </div>
              
              <div className={`trade-pnl ${trade.pnl >= 0 ? 'positive' : 'negative'}`}>
                {formatPnl(trade.pnl)} ⏱️ {trade.timeElapsed}min
              </div>
              
              <div className="trade-targets">
                <div className="target-row">
                  <span>Target:</span>
                  <span>${formatPrice(trade.targetPrice)}</span>
                </div>
                <div className="target-row">
                  <span>Stop:</span>
                  <span>${formatPrice(trade.stopPrice)}</span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${trade.pnl >= 0 ? 'positive' : 'negative'}`}
                  style={{ 
                    width: `${Math.min(Math.abs(trade.pnl) * 10, 100)}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT RESULTS */}
      <div className="section">
        <div className="section-header">📜 RECENT RESULTS</div>
        <div className="results-list">
          {recentResults.map((result, index) => (
            <div key={index} className="result-item">
              <span className="result-status">
                {result.status === 'win' ? '✅' : result.status === 'loss' ? '❌' : '⏱️'}
              </span>
              <span className="result-symbol">{result.symbol}</span>
              <span className={`result-pnl ${result.status === 'win' ? 'positive' : result.status === 'loss' ? 'negative' : 'neutral'}`}>
                {formatPnl(result.pnl)}
              </span>
              <span className="result-time">({result.time} min)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
