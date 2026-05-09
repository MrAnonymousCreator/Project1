const express = require('express');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');

const app = express();

// Serve static files (the mini dashboard)
app.use(express.static(__dirname));

// Serve React app files with correct MIME types
app.use('/src', express.static(path.join(__dirname, 'src'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jsx')) {
      res.setHeader('Content-Type', 'text/javascript');
    }
  }
}));

// Serve mini dashboard as main route
app.get('/', (req, res) => {
  res.send('Trading Dashboard Running');
});

// Serve mini dashboard on a separate route
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'mini-dashboard.html'));
});

// Create server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Import Core7Tracker
const Core7Tracker = require('./src/core7Tracker');

// Initialize Core7Tracker
const tracker = new Core7Tracker();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(' Client connected to dashboard');
  
  // Send initial data
  socket.emit('initial-data', {
    timestamp: new Date().toISOString(),
    message: 'Connected to trading dashboard'
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log(' Client disconnected from dashboard');
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

// Start tracker
tracker.start();

// Start server
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down dashboard server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
