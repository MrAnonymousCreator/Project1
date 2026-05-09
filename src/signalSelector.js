const readline = require('readline');

class SignalSelector {
  constructor() {
    this.signalCategories = {
      'basic': {
        name: '📊 Basic Signals (Core 7)',
        signals: ['Golden Cross', 'Death Cross', 'RSI Oversold', 'RSI Overbought', 'MACD Bullish Crossover', 'MACD Bearish Crossover', 'Resistance Breakout', 'Support Breakdown', 'Volume Spike', 'Bollinger Band Squeeze', 'Break & Retest (Support)', 'Break & Retest (Resistance)'],
        description: 'Core 7 signals for reliable trading'
      },
      'trend': {
        name: '📈 Trend Signals (1-10)',
        signals: ['Golden Cross', 'Death Cross', 'MA Crossover', 'Price > 200 MA', 'Price < 200 MA', 'Higher highs/lows', 'Lower highs/lows', 'Trendline break', 'Trendline retest', 'Parabolic trend'],
        description: 'Trend-following signals for directional moves'
      },
      'momentum': {
        name: '⚡ Momentum Signals (11-20)',
        signals: ['RSI Overbought', 'RSI Oversold', 'RSI Bullish Divergence', 'RSI Bearish Divergence', 'MACD Bullish Crossover', 'MACD Bearish Crossover', 'MACD Divergence', 'Stochastic Overbought', 'Stochastic Oversold', 'Momentum breakout'],
        description: 'Momentum indicators for entry timing'
      },
      'volume': {
        name: '📊 Volume Signals (21-30)',
        signals: ['Volume Spike', 'Low Volume Pullback', 'Volume Bullish Divergence', 'Volume Bearish Divergence', 'Accumulation', 'Distribution', 'OBV Breakout', 'Volume climax', 'Dry-up', 'Rising/falling volume'],
        description: 'Volume-based signals for smart money flow'
      },
      'candles': {
        name: '🕯️ Candle Signals (31-40)',
        signals: ['Doji', 'Hammer', 'Shooting star', 'Bullish engulfing', 'Bearish engulfing', 'Morning star', 'Evening star', 'Inside bar', 'Outside bar', 'Spinning top'],
        description: 'Candlestick patterns for reversal signals'
      },
      'patterns': {
        name: '📐 Pattern Signals (41-50)',
        signals: ['Head & shoulders', 'Inverse H&S', 'Double top', 'Triple top', 'Double bottom', 'Triple bottom', 'Ascending triangle', 'Descending triangle', 'Symmetrical triangle', 'Rectangle'],
        description: 'Chart patterns for major moves'
      },
      'breakouts': {
        name: '🚀 Breakout Signals (51-60)',
        signals: ['Resistance breakout', 'Support breakdown', 'Fakeout', 'Break & retest', 'Range breakout', 'Gaps', 'Failed breakdown'],
        description: 'Breakout signals for explosive moves'
      },
      'volatility': {
        name: '📉 Volatility Signals (61-70)',
        signals: ['Bollinger squeeze', 'Bollinger breakout', 'Band touches', 'ATR expansion', 'ATR contraction', 'Volatility breakout', 'Volatility divergence', 'Keltner breakout'],
        description: 'Volatility indicators for squeeze plays'
      },
      'smart': {
        name: '🧠 Smart Money Signals (71-80)',
        signals: ['Break of structure', 'Change of character', 'Order block', 'Liquidity grab', 'Stop hunt', 'Fair value gap', 'Imbalance', 'Premium/discount zones'],
        description: 'Smart money concepts for institutional moves'
      },
      'indicator': {
        name: '⚙️ Indicator Signals (81-90)',
        signals: ['Fibonacci levels', 'Pivot bounce', 'VWAP bounce', 'VWAP breakout', 'Ichimoku signals', 'Cloud positioning'],
        description: 'Technical indicator-based signals'
      },
      'hybrid': {
        name: '🌍 Hybrid Signals (91-100)',
        signals: ['Confluence', 'Multi-timeframe', 'News breakout', 'Earnings reaction', 'Sector rotation', 'Correlation breakdown', 'Session breakout'],
        description: 'Hybrid approaches for high-probability setups'
      }
    };
  }

  // Interactive signal selection
  async selectSignals() {
    console.log('\n🎯 SIGNAL SELECTION');
    console.log('='.repeat(60));
    
    const categories = Object.keys(this.signalCategories);
    
    // Display categories
    categories.forEach((category, index) => {
      const cat = this.signalCategories[category];
      console.log(`${index + 1}. ${cat.name}`);
      console.log(`   ${cat.description}`);
      console.log(`   Signals: ${cat.signals.length} total`);
      console.log('');
    });
    
    console.log(`${categories.length + 1}. 📊 ALL SIGNALS (100 total)`);
    console.log('   All available signals');
    console.log('');
    
    // Get user choice
    const choice = await this.getUserChoice('Select signal category (1-' + (categories.length + 1) + '): ');
    
    if (choice === categories.length + 1) {
      return 'all';
    }
    
    const selectedCategory = categories[choice - 1];
    if (selectedCategory) {
      console.log(`\n✅ Selected: ${this.signalCategories[selectedCategory].name}`);
      return selectedCategory;
    }
    
    return 'basic'; // default
  }

  // Quick selection for common choices
  quickSelect(choice) {
    const validChoices = {
      'basic': 'basic',
      'trend': 'trend', 
      'momentum': 'momentum',
      'volume': 'volume',
      'all': 'all',
      'active': 'active'
    };
    
    const selected = validChoices[choice.toLowerCase()];
    if (selected) {
      console.log(`\n✅ Quick selected: ${this.signalCategories[selected].name}`);
      return selected;
    }
    
    console.log('\n❌ Invalid choice. Using basic signals.');
    return 'basic';
  }

  // Get user input
  getUserChoice(prompt) {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question(prompt, (answer) => {
        rl.close();
        const choice = parseInt(answer);
        resolve(choice);
      });
    });
  }

  // Display available signals in a category
  displayCategorySignals(category) {
    if (category === 'all') {
      console.log('\n📊 ALL SIGNALS ENABLED');
      console.log('Total: 100 signals across all categories');
      return;
    }

    const cat = this.signalCategories[category];
    if (!cat) {
      console.log('\n❌ Invalid category');
      return;
    }

    console.log(`\n${cat.name}`);
    console.log('-'.repeat(50));
    console.log(`Description: ${cat.description}`);
    console.log(`Total signals: ${cat.signals.length}`);
    console.log('\nSignals:');
    
    cat.signals.forEach((signal, index) => {
      console.log(`${index + 1}. ${signal}`);
    });
  }

  // List all categories
  listCategories() {
    console.log('\n📋 AVAILABLE SIGNAL CATEGORIES');
    console.log('='.repeat(60));
    
    Object.entries(this.signalCategories).forEach(([key, category]) => {
      console.log(`🔹 ${key}: ${category.name}`);
      console.log(`   ${category.description}`);
      console.log(`   Signals: ${category.signals.length}`);
      console.log('');
    });
    
    console.log('🔹 all: All signals (100 total)');
    console.log('\nUsage:');
    console.log('  node src/core7Tracker.js --signals=basic');
    console.log('  node src/core7Tracker.js --signals=volume');
    console.log('  node src/core7Tracker.js --signals=all');
    console.log('  node src/core7Tracker.js --list');
  }
}

module.exports = SignalSelector;
