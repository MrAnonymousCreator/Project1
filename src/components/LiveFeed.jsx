import React, { useEffect, useRef } from 'react';

const LiveFeed = ({ feed }) => {
  const feedEndRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom when new items arrive
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feed]);

  const getEventIcon = (type) => {
    switch (type) {
      case 'alert':
        return '🚨';
      case 'milestone':
        return '⚠️';
      case 'signal':
        return '📈';
      default:
        return '📊';
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'alert':
        return 'border-red-700 bg-red-900/10';
      case 'milestone':
        return 'border-yellow-700 bg-yellow-900/10';
      case 'signal':
        return 'border-green-700 bg-green-900/10';
      default:
        return 'border-gray-700 bg-gray-900/10';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Live Feed</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">LIVE</span>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
        {feed.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">📡</div>
            <div>Waiting for signals...</div>
          </div>
        ) : (
          feed.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border ${getEventColor(item.type)} transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-lg flex-shrink-0">
                  {getEventIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium break-words">
                    {item.event}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {item.timestamp}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={feedEndRef} />
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
      `}</style>
    </div>
  );
};

export default LiveFeed;
