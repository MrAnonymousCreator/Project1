import React, { useState, useEffect } from 'react';
import TradingDashboard from './components/TradingDashboard';
import socketService from './services/socketService';

function App() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to Socket.IO server
    const socket = socketService.connect();
    
    setConnected(socketService.isConnected());

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Connection Status */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-2 ${
          connected 
            ? 'bg-green-900/20 text-green-400 border border-green-700' 
            : 'bg-red-900/20 text-red-400 border border-red-700'
        }`}>
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
          <span>{connected ? 'CONNECTED' : 'DISCONNECTED'}</span>
        </div>
      </div>

      {/* Main Dashboard */}
      <TradingDashboard />

      {/* Global Styles */}
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background: #111827;
          color: #f9fafb;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }

        /* Animations */
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(34, 197, 94, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.8);
          }
        }

        @keyframes pulse-red {
          0%, 100% {
            box-shadow: 0 0 5px rgba(239, 68, 68, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.8);
          }
        }

        .glow-green {
          animation: pulse-glow 2s infinite;
        }

        .glow-red {
          animation: pulse-red 2s infinite;
        }

        /* Trading terminal aesthetic */
        .terminal-text {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          font-size: 0.875rem;
          line-height: 1.25rem;
        }

        /* Card hover effects */
        .trading-card {
          transition: all 0.2s ease;
          border: 1px solid rgba(75, 85, 99, 0.6);
        }

        .trading-card:hover {
          border-color: rgba(34, 197, 94, 0.5);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        /* Status indicators */
        .status-online {
          background: linear-gradient(45deg, #10b981, #059669);
        }

        .status-offline {
          background: linear-gradient(45deg, #ef4444, #dc2626);
        }

        .status-warning {
          background: linear-gradient(45deg, #f59e0b, #d97706);
        }
      `}</style>
    </div>
  );
}

export default App;
