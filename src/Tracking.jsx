import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Building, DollarSign } from 'lucide-react';

const Tracking = () => {
  const [activeTab, setActiveTab] = useState('wallets');

  // Sample tracking data
  const trackingData = {
    wallets: [
      {
        name: '0x2938...8f73',
        type: 'Smart Money',
        change: '+2.3%',
        holdings: 'BTC, ETH, SOL',
        activity: 'Increased SOL exposure by 45%',
        lastUpdate: '2 hours ago'
      },
      {
        name: 'Ark Invest',
        type: 'Institutional',
        change: '+5.7%',
        holdings: 'BTC, ETH',
        activity: 'Added 1,250 BTC position',
        lastUpdate: '6 hours ago'
      },
      {
        name: 'Grayscale Trust',
        type: 'ETF',
        change: '+1.2%',
        holdings: 'BTC',
        activity: 'Net inflow of $42M this week',
        lastUpdate: '1 day ago'
      }
    ],
    institutions: [
      {
        name: 'BlackRock',
        type: 'Asset Manager',
        aum: '$9.2T',
        flows: '+$127M (weekly)',
        focus: 'Bitcoin, Ethereum',
        sentiment: 'Bullish on crypto'
      },
      {
        name: 'Fidelity',
        type: 'Asset Manager', 
        aum: '$4.8T',
        flows: '+$89M (weekly)',
        focus: 'Core crypto assets',
        sentiment: 'Cautiously optimistic'
      }
    ],
    themes: [
      {
        name: 'AI Tokens',
        trend: 'Strengthening',
        keyMovers: ['AGIX', 'FET', 'OCEAN'],
        narrative: 'AI ecosystem tokens seeing renewed interest after OpenAI announcements',
        confidence: 'High'
      },
      {
        name: 'Layer 2',
        trend: 'Expanding',
        keyMovers: ['ARB', 'OP', 'MATIC'],
        narrative: 'Ethereum L2s gaining TVL as users seek lower fees',
        confidence: 'Medium'
      },
      {
        name: 'ETF Flows',
        trend: 'Positive',
        keyMovers: ['IBIT', 'FBTC', 'BITO'],
        narrative: 'Spot Bitcoin ETFs seeing consistent institutional inflows',
        confidence: 'High'
      }
    ]
  };

  const renderWallets = () => (
    <div className="space-y-4">
      {trackingData.wallets.map((wallet, index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{wallet.name}</div>
                <div className="text-sm text-gray-500">{wallet.type}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-medium ${
                wallet.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {wallet.change}
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Holdings:</span>
              <span className="text-gray-900">{wallet.holdings}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Activity:</span>
              <span className="text-gray-900">{wallet.activity}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="text-gray-600">Updated:</span>
              <span className="text-gray-900">{wallet.lastUpdate}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderInstitutions = () => (
    <div className="space-y-4">
      {trackingData.institutions.map((institution, index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{institution.name}</div>
                <div className="text-sm text-gray-500">{institution.type}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-medium text-gray-900">{institution.aum}</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Weekly Flows:</span>
              <span className={`font-medium ${
                institution.flows.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {institution.flows}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Focus:</span>
              <span className="text-gray-900">{institution.focus}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="text-gray-600">Sentiment:</span>
              <span className="text-gray-900">{institution.sentiment}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderThemes = () => (
    <div className="space-y-4">
      {trackingData.themes.map((theme, index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                theme.trend === 'Strengthening' ? 'bg-emerald-100' :
                theme.trend === 'Expanding' ? 'bg-blue-100' :
                'bg-gray-100'
              }`}>
                {theme.trend === 'Strengthening' && <TrendingUp className="w-5 h-5 text-emerald-600" />}
                {theme.trend === 'Expanding' && <TrendingUp className="w-5 h-5 text-blue-600" />}
                {theme.trend === 'Positive' && <TrendingUp className="w-5 h-5 text-emerald-600" />}
              </div>
              <div>
                <div className="font-medium text-gray-900">{theme.name}</div>
                <div className="text-sm text-gray-500">{theme.confidence} confidence</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm text-gray-700 mb-2">
              Key Movers: {theme.keyMovers.join(', ')}
            </div>
            
            <div className="text-sm text-gray-600 leading-relaxed">
              {theme.narrative}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Tracking</h1>
          <p className="text-gray-600">Market behavior and institutional flows</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {[
            { id: 'wallets', label: 'Wallets', icon: Wallet },
            { id: 'institutions', label: 'Institutions', icon: Building },
            { id: 'themes', label: 'Themes', icon: DollarSign }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-gray-900 border-gray-900'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          {activeTab === 'wallets' && renderWallets()}
          {activeTab === 'institutions' && renderInstitutions()}
          {activeTab === 'themes' && renderThemes()}
        </div>
      </div>
    </div>
  );
};

export default Tracking;
