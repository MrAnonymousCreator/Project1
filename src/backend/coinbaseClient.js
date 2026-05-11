// Coinbase WebSocket Client - Real-time market data
const WebSocket = require('ws');

class CoinbaseClient {
  constructor() {
    this.ws = null;
    this.symbols = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'DOGE-USD', 'AVAX-USD', 'LINK-USD'];
    this.callbacks = {};
    this.reconnectInterval = 5000;
    this.isConnecting = false;
    this.fallbackMode = false;
    this.fallbackInterval = null;
  }

  // Connect to Coinbase WebSocket
  connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    console.log('🔌 Connecting to Coinbase Advanced Trade WebSocket...');

    const wsUrl = 'wss://advanced-trade-ws.coinbase.com';

    this.ws = new WebSocket(wsUrl);

    this.ws.on('open', () => {
      console.log('✅ Connected to Coinbase WebSocket');
      this.isConnecting = false;
      this.subscribeToTickers();
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
      console.log('🔄 Coinbase WebSocket blocked, switching to fallback mode');
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

  // Subscribe to ticker updates
  subscribeToTickers() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const subscribeMessage = {
        event: 'subscribe',
        product_ids: this.symbols,
        channel: 'ticker',
        api_key: null // Add API key if needed for Advanced Trade API
      };
      
      this.ws.send(JSON.stringify(subscribeMessage));
      console.log('📡 Subscribed to Coinbase Advanced Trade tickers');
    }
  }

  // Handle incoming WebSocket messages
  handleMessage(data) {
    if (data.type === 'ticker') {
      const ticker = data;
      const symbol = ticker.product_id;
      
      const marketData = {
        symbol: symbol.replace('-USD', ''),
        price: parseFloat(ticker.price),
        change: parseFloat(ticker.price_24h || 0),
        volume: parseFloat(ticker.volume_24h || 0),
        high: parseFloat(ticker.high_24h || ticker.price),
        low: parseFloat(ticker.low_24h || ticker.price),
        open: parseFloat(ticker.open_24h || ticker.price),
        timestamp: new Date(ticker.time || Date.now())
      };

      // Emit to all callbacks
      Object.values(this.callbacks).forEach(callback => {
        callback(marketData);
      });
    }
  }

  // Subscribe to market data updates
  onMarketData(callback) {
    const id = Date.now() + Math.random();
    this.callbacks[id] = callback;
    return id;
  }

  // Unsubscribe from market data updates
  offMarketData(id) {
    delete this.callbacks[id];
  }

  // Reconnect to WebSocket
  reconnect() {
    setTimeout(() => {
      if (!this.fallbackMode) {
        this.connect();
      }
    }, this.reconnectInterval);
  }

  // Get current price via REST API
  async getCurrentPrice(symbol) {
    try {
      const response = await fetch(`https://api.coinbase.com/v2/prices/${symbol}-USD/spot`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data?.message || 'Unknown error'}`);
      }

      return parseFloat(data.data.amount);
    } catch (error) {
      console.error(`❌ Error fetching ${symbol} price from Coinbase:`, error);
      return this.getMockPrice(symbol);
    }
  }

  // Get klines data for technical analysis
  async getKlines(symbol, interval = '1h', limit = 100) {
    try {
      // Use Coinbase Advanced Trade API for candles
      const granularity = interval === '1h' ? 3600 : 86400; // 1 hour or 1 day
      const response = await fetch(`https://api.exchange.coinbase.com/products/${symbol}-USD/candles?granularity=${granularity}`);
      const data = await response.json();
      
      // Check if Coinbase returned an error object instead of array data
      if (!data || !Array.isArray(data)) {
        console.error('❌ Coinbase API Error:', data);
        console.log('🔄 Using fallback mock data for', symbol);
        return this.generateMockKlines(symbol, limit);
      }
      
      // Coinbase returns [timestamp, low, high, open, close, volume] format
      return data.slice(-limit).map(candle => ({
        timestamp: candle[0] * 1000, // Convert to milliseconds
        open: parseFloat(candle[3]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[1]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5])
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
      'BTC': 43000,
      'ETH': 2200,
      'SOL': 105,
      'DOGE': 0.085,
      'AVAX': 36,
      'LINK': 14
    };
    return prices[symbol] || 100;
  }

  // Start fallback mode when Coinbase is blocked
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
    const symbols = ['BTC', 'ETH', 'SOL', 'DOGE', 'AVAX', 'LINK'];
    
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

module.exports = CoinbaseClient;
