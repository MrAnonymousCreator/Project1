import React from 'react';
import { ArrowRight } from 'lucide-react';
import Workspace from './Workspace.jsx';

const Landing = () => {
  const [showWorkspace, setShowWorkspace] = React.useState(false);

  if (showWorkspace) {
    return <Workspace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <div className="min-h-screen flex flex-col justify-center items-center px-8">
        <div className="max-w-4xl w-full text-center space-y-12">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6 tracking-tight leading-tight">
            Spend less time staring at charts.
          </h1>

          {/* Subtext */}
          <p className="text-xl md:text-2xl text-gray-600 font-light mb-12 max-w-3xl mx-auto leading-relaxed">
            Readable crypto summaries, calm signals, and organized market tracking.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => setShowWorkspace(true)}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-medium hover:bg-gray-800 transition-all text-lg"
          >
            Open Workspace
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Preview Image */}
          <div className="mt-16 mb-16">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm max-w-4xl mx-auto">
              <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                <div className="text-center space-y-4">
                  <div className="w-16 h-1 bg-gray-300 rounded-full mx-auto"></div>
                  <p className="text-sm">Workspace Preview</p>
                  <p className="text-xs text-gray-400">Calm interface • Live data • Organized tracking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why it exists section */}
      <div className="bg-white py-24 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-light text-gray-900 mb-8 tracking-tight">
            Why it exists
          </h2>
          
          <p className="text-lg text-gray-700 font-light leading-relaxed max-w-3xl mx-auto mb-16">
            Most trading platforms overwhelm you with noise.
            <br className="hidden md:block" />
            This workspace focuses on clarity instead:
            <br className="hidden md:block" />
            fewer signals, readable summaries, and calm tracking.
          </p>

          {/* Feature blocks */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Organized Tracking</h3>
              <p className="text-gray-600">Focused market threads instead of random signals</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Readable Summaries</h3>
              <p className="text-gray-600">Natural language market analysis</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Low-Noise Signals</h3>
              <p className="text-gray-600">Only meaningful market insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600">
              <span className="inline-block px-3 py-1 bg-gray-200 rounded-full text-xs font-medium mb-2">Beta</span>
              © 2024 Core7
            </div>
            
            <div className="flex space-x-6 text-sm text-gray-600">
              <a href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-gray-900 transition-colors">Terms</a>
              <a href="/contact" className="hover:text-gray-900 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
