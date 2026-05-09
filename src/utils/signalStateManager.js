class SignalStateManager {
  constructor() {
    this.signalStates = new Map(); // symbol_signalType -> state
  }

  getSignalKey(symbol, signalType) {
    return `${symbol}_${signalType}`;
  }

  shouldTriggerSignal(symbol, signalType, currentState) {
    const signalKey = this.getSignalKey(symbol, signalType);
    const previousState = this.signalStates.get(signalKey);

    // Edge detection: trigger only when state changes from false to true
    const shouldTrigger = currentState && !previousState;

    // Update state
    this.signalStates.set(signalKey, currentState);

    return shouldTrigger;
  }

  // For complex signals with multiple states
  shouldTriggerComplexSignal(symbol, signalType, signalData) {
    const signalKey = this.getSignalKey(symbol, signalType);
    const previousState = this.signalStates.get(signalKey);

    // Check if signal is currently detected
    const isDetected = signalData.detected;
    
    // Create a hash for detected signals
    const currentState = isDetected ? this.createSignalHash(signalData) : false;
    
    // Trigger only when going from not-detected to detected
    const shouldTrigger = isDetected && previousState !== currentState;

    // Update state
    this.signalStates.set(signalKey, currentState);

    return shouldTrigger;
  }

  createSignalHash(signalData) {
    // Create a simple hash for signal comparison
    if (signalData.type && signalData.type !== 'undefined') {
      return signalData.type; // For signals with sub-types (RSI, MACD, etc.)
    }
    return 'detected'; // For simple boolean signals
  }

  clearSignalState(symbol, signalType) {
    const signalKey = this.getSignalKey(symbol, signalType);
    this.signalStates.delete(signalKey);
  }

  clearAllStates() {
    this.signalStates.clear();
  }

  getSignalState(symbol, signalType) {
    const signalKey = this.getSignalKey(symbol, signalType);
    return this.signalStates.get(signalKey);
  }

  printActiveStates() {
    console.log('📊 Active Signal States:');
    for (const [key, state] of this.signalStates) {
      console.log(`  ${key}: ${state}`);
    }
  }
}

module.exports = SignalStateManager;
