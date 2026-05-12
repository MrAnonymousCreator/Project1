// TwelveData Client - Real-time market data
const WebSocket = require('ws');

class TwelveDataClient {
  constructor() {
    this.ws = null;
    this.symbols = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'DOGE/USD', 'AVAX/USD', 'LINK/USD'];
    this.callbacks = {};
    this.reconnectInterval = 5000;
    this.isConnecting = false;
    this.fallbackMode = false;
    this.fallbackInterval = null;
    this.apiKey = '31d3ac11306f4b978c40dcb91a572e62';
  }

  // Connect to TwelveData WebSocket
  connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    console.log('🔌 Connecting to TwelveData WebSocket...');

    const wsUrl = `wss://ws.twelvedata.com/v1/quotes/price?apikey=${this.apiKey}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.on('open', () => {
      console.log('✅ Connected to TwelveData WebSocket');
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
      console.log('🔄 TwelveData WebSocket blocked, switching to fallback mode');
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
        action: 'subscribe',
        params: {
          symbols: this.symbols
        }
      };
      
      this.ws.send(JSON.stringify(subscribeMessage));
      console.log('📡 Subscribed to TwelveData tickers');
    }
  }

  // Handle incoming WebSocket messages
  handleMessage(data) {
    if (data.event === 'price') {
      const ticker = data;
      const symbol = ticker.symbol;
      
      const marketData = {
        symbol: symbol.replace('/USD', ''),
        price: parseFloat(ticker.price),
        change: parseFloat(ticker.change || 0),
        volume: parseFloat(ticker.volume || 0),
        high: parseFloat(ticker.day_high || ticker.price),
        low: parseFloat(ticker.day_low || ticker.price),
        open: parseFloat(ticker.day_open || ticker.price),
        timestamp: new Date(ticker.timestamp || Date.now())
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
      const response = await fetch(`https://api.twelvedata.com/price?symbol=${symbol}&apikey=${this.apiKey}`);
      const data = await response.json();
      
      if (!response.ok || data.status !== 'ok') {
        throw new Error(`HTTP ${response.status}: ${data?.message || 'Unknown error'}`);
      }

      return parseFloat(data.price);
    } catch (error) {
      console.error(`❌ Error fetching ${symbol} price from TwelveData:`, error);
      return this.getMockPrice(symbol);
    }
  }

  // Get klines data for technical analysis
  async getKlines(symbol, interval = '1h', limit = 100) {
    try {
      // Map intervals to TwelveData format
      const intervalMap = {
        '1h': '1h',
        '4h': '4h',
        '1d': '1day'
      };
      
      const twelveInterval = intervalMap[interval] || '1h';
      const response = await fetch(`https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${twelveInterval}&outputsize=${limit}&apikey=${this.apiKey}`);
      const data = await response.json();
      
      // Check if TwelveData returned an error
      if (!response.ok || data.status !== 'ok') {
        console.error('❌ TwelveData API Error:', data);
        console.log('🔄 Using fallback mock data for', symbol);
        return this.generateMockKlines(symbol, limit);
      }
      
      // TwelveData returns array of values
      return data.values.map(candle => ({
        timestamp: new Date(candle.datetime).getTime(),
        open: parseFloat(candle.open),
        high: parseFloat(candle.high),
        low: parseFloat(candle.low),
        close: parseFloat(candle.close),
        volume: parseFloat(candle.volume || 0)
      })).slice(-limit);
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

  // Start fallback mode when TwelveData is blocked
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

module.exports = TwelveDataClient;
