const express = require('express');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
const SignalEngine = require('./src/backend/signalEngine');

const app = express();
const server = http.createServer(app);

// Initialize signal engine
const signalEngine = new SignalEngine();

// Serve static files from dist directory (built React app)
app.use(express.static(path.join(__dirname, 'dist')));

// Serve Socket.IO client
app.use('/socket.io', express.static(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist')));

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/signals', (req, res) => {
  res.json({ signals: signalEngine.getActiveSignals() });
});

// Serve React app for all other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🟢 Client connected to trading dashboard');
  
  // Send initial data
  socket.emit('initial-data', {
    timestamp: new Date().toISOString(),
    message: 'Connected to trading dashboard',
    activeSignals: signalEngine.getActiveSignals()
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected from dashboard');
  });
});

// Subscribe to real signals from the engine
signalEngine.onSignal((signal) => {
  // Emit real signal to all connected clients
  io.emit('signal', {
    ...signal,
    timestamp: new Date(signal.timestamp).toISOString()
  });
  
  // Update market sentiment based on signals
  const activeSignals = signalEngine.getActiveSignals();
  const bullishCount = activeSignals.filter(s => s.bias === 'BULLISH').length;
  const bearishCount = activeSignals.filter(s => s.bias === 'BEARISH').length;
  
  let sentiment = 'NEUTRAL';
  let sentimentScore = 0;
  
  if (bullishCount > bearishCount) {
    sentiment = 'BULLISH';
    sentimentScore = (bullishCount - bearishCount) * 10;
  } else if (bearishCount > bullishCount) {
    sentiment = 'BEARISH';
    sentimentScore = (bearishCount - bullishCount) * -10;
  }
  
  io.emit('market-sentiment', {
    sentiment,
    sentimentScore,
    timestamp: new Date().toISOString()
  });
  
  // Update alert count
  io.emit('alert-count', {
    count: activeSignals.length,
    timestamp: new Date().toISOString()
  });
});

// Start the signal engine
signalEngine.start();

// Start server
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
