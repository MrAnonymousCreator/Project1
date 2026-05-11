import { CoinbaseClient } from './coinbaseClient';
import { SignalEngine } from './signalEngine';

// Export backend services for the new UI
export { CoinbaseClient, SignalEngine };

// Initialize services
const coinbaseClient = new CoinbaseClient();
const signalEngine = new SignalEngine();

// Start real-time data streaming
coinbaseClient.connect();
signalEngine.startPeriodicAnalysis();
