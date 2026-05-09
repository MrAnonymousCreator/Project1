const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Core7Tracker = require('./src/core7Tracker');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Initialize Core7Tracker
const tracker = new Core7Tracker();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected to trading signals');

  // Send initial data
  socket.emit('initial-data', {
    timestamp: new Date().toISOString(),
    message: 'Connected to trading signals server'
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected');
  });
});

// Override console.log to emit socket events for real-time updates
const originalConsoleLog = console.log;
console.log = (...args) => {
  // Call original console.log
  originalConsoleLog.apply(console, args);

  // Parse and emit relevant events
  const message = args.join(' ');
  
  // Market sentiment updates
  if (message.includes('MARKET:')) {
    const sentimentMatch = message.match(/MARKET:\s*(\w+)/);
    if (sentimentMatch) {
      io.emit('market-sentiment', {
        sentiment: sentimentMatch[1],
        timestamp: new Date().toISOString()
      });
    }
  }

  // Signal alerts
  if (message.includes('ALERT') || message.includes('DETECTED')) {
    io.emit('signal', {
      message: message,
      timestamp: new Date().toISOString()
    });
  }

  // Milestone events
  if (message.includes('MILESTONE')) {
    io.emit('milestone', {
      message: message,
      timestamp: new Date().toISOString()
    });
  }

  // Performance updates
  if (message.includes('SIGNAL COMPLETE')) {
    io.emit('performance-update', {
      message: message,
      timestamp: new Date().toISOString()
    });
  }

  // Active alerts count
  if (message.includes('Monitoring') && message.includes('active alerts')) {
    const match = message.match(/Monitoring (\d+) active alerts/);
    if (match) {
      io.emit('alert-count', {
        count: parseInt(match[1]),
        timestamp: new Date().toISOString()
      });
    }
  }
};

// Start the tracker
tracker.start();

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Trading signals server running on port ${PORT}`);
  console.log(`🔗 Socket.IO server ready for connections`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down trading signals server...');
  tracker.stop();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
