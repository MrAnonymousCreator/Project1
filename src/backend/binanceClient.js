// Binance WebSocket Client - Real-time market data
const WebSocket = require('ws');

class BinanceClient {
  constructor() {
    this.ws = null;
    this.symbols = ['btcusdt', 'ethusdt', 'solusdt', 'dogeusdt', 'avaxusdt', 'linkusdt'];
    this.callbacks = {};
    this.reconnectInterval = 5000;
    this.isConnecting = false;
  }

  // Connect to Binance WebSocket
  connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    console.log('🔌 Connecting to Binance WebSocket...');

    const streams = this.symbols.map(symbol => `${symbol}@ticker`).join('/');
    const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.on('open', () => {
      console.log('✅ Connected to Binance WebSocket');
      this.isConnecting = false;
    });

    this.ws.on('message', (data) => {
      try {
        const parsed = JSON.parse(data);
        this.handleMessage(parsed);
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
      }
    });

    this.ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      this.isConnecting = false;
    });

    this.ws.on('close', () => {
      console.log('🔌 WebSocket connection closed');
      this.isConnecting = false;
      this.reconnect();
    });
  }

  // Handle incoming WebSocket messages
  handleMessage(data) {
    if (data.stream) {
      const symbol = data.stream.split('@')[0].toUpperCase();
      const ticker = data.data;

      const marketData = {
        symbol: symbol,
        price: parseFloat(ticker.c), // Current price
        change: parseFloat(ticker.p), // Price change percentage
        volume: parseFloat(ticker.v), // 24h volume
        high: parseFloat(ticker.h), // 24h high
        low: parseFloat(ticker.l), // 24h low
        open: parseFloat(ticker.o), // 24h open
        timestamp: parseInt(ticker.E) // Event time
      };

      // Emit to all callbacks
      Object.values(this.callbacks).forEach(callback => {
        callback(marketData);
      });
    }
  }

  // Reconnect on connection loss
  reconnect() {
    setTimeout(() => {
      console.log('🔄 Attempting to reconnect...');
      this.connect();
    }, this.reconnectInterval);
  }

  // Subscribe to market data updates
  subscribe(callback) {
    const id = Date.now().toString();
    this.callbacks[id] = callback;
    return id;
  }

  // Unsubscribe from updates
  unsubscribe(id) {
    delete this.callbacks[id];
  }

  // Get current price via REST API (fallback)
  async getCurrentPrice(symbol) {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.error(`❌ Error fetching price for ${symbol}:`, error);
      return null;
    }
  }

  // Get klines data for technical analysis
  async getKlines(symbol, interval = '1h', limit = 100) {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
      const data = await response.json();
      
      return data.map(kline => ({
        timestamp: parseInt(kline[0]),
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5])
      }));
    } catch (error) {
      console.error(`❌ Error fetching klines for ${symbol}:`, error);
      return [];
    }
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

module.exports = BinanceClient;
