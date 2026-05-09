const alertEngine = require('./services/alertEngine');

console.log('🎯 Trading Signal Alert System');
console.log('================================');
console.log('📊 Phase 1: Crypto + Golden Cross Alerts');
console.log('⚡ Real-time trading signals powered by Binance API');
console.log('');

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  alertEngine.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  alertEngine.stop();
  process.exit(0);
});

alertEngine.start();

console.log('\n💡 Commands:');
console.log('   Press Ctrl+C to stop the alert engine');
console.log('   Check console for real-time trading signals');
console.log('');
