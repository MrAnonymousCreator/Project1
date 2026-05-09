import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(url = 'http://localhost:3001') {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(url, {
      transports: ['websocket'],
      upgrade: false
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to trading signals server');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from trading signals server');
    });

    this.socket.on('error', (error) => {
      console.error('🔌 Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Market data events
  onMarketSentiment(callback) {
    this.addEventListener('market-sentiment', callback);
  }

  onCoinUpdate(callback) {
    this.addEventListener('coin-update', callback);
  }

  onSignal(callback) {
    this.addEventListener('signal', callback);
  }

  onMilestone(callback) {
    this.addEventListener('milestone', callback);
  }

  onPerformanceUpdate(callback) {
    this.addEventListener('performance-update', callback);
  }

  onAlert(callback) {
    this.addEventListener('alert', callback);
  }

  // Helper method to manage event listeners
  addEventListener(event, callback) {
    if (!this.socket) {
      console.warn('Socket not connected. Call connect() first.');
      return;
    }

    // Remove existing listener for this event if it exists
    if (this.listeners.has(event)) {
      this.socket.off(event, this.listeners.get(event));
    }

    // Add new listener
    this.socket.on(event, callback);
    this.listeners.set(event, callback);
  }

  // Remove specific event listener
  removeEventListener(event) {
    if (this.socket && this.listeners.has(event)) {
      this.socket.off(event, this.listeners.get(event));
      this.listeners.delete(event);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callback, event) => {
        this.socket.off(event, callback);
      });
      this.listeners.clear();
    }
  }

  // Get connection status
  isConnected() {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
