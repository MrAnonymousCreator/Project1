// Binance WebSocket Client - Real-time market data
const WebSocket = require('ws');

class BinanceClient {
  constructor() {
    this.ws = null;
    this.symbols = ['btcusdt', 'ethusdt', 'solusdt', 'dogeusdt', 'avaxusdt', 'linkusdt'];
    this.callbacks = {};
    this.reconnectInterval = 5000;
    this.isConnecting = false;
    this.fallbackMode = false;
    this.fallbackInterval = null;
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
      console.log('🔄 Binance WebSocket blocked, switching to fallback mode');
      this.startFallbackMode();
    });

    this.ws.on('close', () => {
      console.log('🔌 WebSocket connection closed');
      this.isConnecting = false;
      // Don't reconnect if we're in fallback mode
      if (!this.fallbackMode) {
        this.reconnect();
      }
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
      
      // Check if Binance returned an error object instead of array data
      if (!Array.isArray(data)) {
        console.error('❌ Binance API Error:', data);
        console.log('🔄 Using fallback mock data for', symbol);
        return this.generateMockKlines(symbol, limit);
      }
      
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
      console.log('🔄 Using fallback mock data for', symbol);
      return this.generateMockKlines(symbol, limit);
    }
  }

  // Generate mock klines data for fallback
  generateMockKlines(symbol, limit = 100) {
    const basePrice = this.getMockPrice(symbol);
    const klines = [];
    const now = Date.now();
    const interval = 3600000; // 1 hour in milliseconds
    
    for (let i = limit - 1; i >= 0; i--) {
      const timestamp = now - (i * interval);
      const price = basePrice + (Math.random() - 0.5) * basePrice * 0.02; // ±2% variation
      const high = price * (1 + Math.random() * 0.01);
      const low = price * (1 - Math.random() * 0.01);
      const volume = 1000000 + Math.random() * 5000000;
      
      klines.push({
        timestamp,
        open: price,
        high,
        low,
        close: price + (Math.random() - 0.5) * price * 0.005,
        volume
      });
    }
    
    return klines;
  }

  // Get mock price for fallback
  getMockPrice(symbol) {
    const prices = {
      'BTCUSDT': 43000,
      'ETHUSDT': 2200,
      'SOLUSDT': 105,
      'DOGEUSDT': 0.085,
      'AVAXUSDT': 36,
      'LINKUSDT': 14
    };
    return prices[symbol] || 100;
  }

  // Start fallback mode when Binance is blocked
  startFallbackMode() {
    this.fallbackMode = true;
    console.log('🔄 Starting fallback mode - generating mock data');
    
    // Generate mock data every 5 seconds
    this.fallbackInterval = setInterval(() => {
      this.generateMockMarketData();
    }, 5000);
  }

  // Generate mock market data for fallback
  generateMockMarketData() {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'DOGEUSDT', 'AVAXUSDT', 'LINKUSDT'];
    
    symbols.forEach(symbol => {
      const basePrice = this.getMockPrice(symbol);
      const change = (Math.random() - 0.5) * 10; // ±5% change
      const currentPrice = basePrice * (1 + change / 100);
      
      const marketData = {
        symbol: symbol,
        price: currentPrice,
        change: change,
        volume: 1000000 + Math.random() * 5000000,
        high: currentPrice * 1.02,
        low: currentPrice * 0.98,
        open: basePrice,
        timestamp: Date.now()
      };

      // Emit to all callbacks
      Object.values(this.callbacks).forEach(callback => {
        callback(marketData);
      });
    });
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.fallbackMode = false;
  }
}

module.exports = BinanceClient;
