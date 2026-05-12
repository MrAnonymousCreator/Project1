import { TwelveDataClient } from './twelvedataClient';
import { SignalEngine } from './signalEngine';

// Export backend services for new UI
export { TwelveDataClient, SignalEngine };

// Initialize services
const twelvedataClient = new TwelveDataClient();
const signalEngine = new SignalEngine();

// Start real-time data streaming
twelvedataClient.connect();
signalEngine.startPeriodicAnalysis();
