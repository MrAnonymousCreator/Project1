import React, { useState } from 'react';

const MarketCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day

  // Generate sample calendar data
  const generateCalendarData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const bias = Math.random() > 0.5 ? 'bullish' : 'bearish';
      const volatility = Math.random() * 100;
      const confidence = 60 + Math.random() * 40;
      
      data.push({
        date,
        bias,
        volatility,
        confidence,
        events: Math.random() > 0.7 ? [
          Math.random() > 0.5 ? 'Fed announcement' : 'CPI data release',
          Math.random() > 0.5 ? 'ETF inflow detected' : 'Large volume spike'
        ] : [],
        summary: bias === 'bullish' 
          ? 'Momentum improving' 
          : volatility > 70 
            ? 'High uncertainty after CPI release'
            : 'Market consolidating'
      });
    }
    
    return data;
  };

  const calendarData = generateCalendarData();

  const getTileColor = (day) => {
    if (!day) return 'bg-gray-50';
    
    const data = calendarData.find(d => 
      d.date.getDate() === day.getDate() && 
      d.date.getMonth() === day.getMonth() &&
      d.date.getFullYear() === day.getFullYear()
    );
    
    if (!data) return 'bg-white hover:bg-gray-50';
    
    if (data.bias === 'bullish') {
      return data.confidence > 80 ? 'bg-green-100 hover:bg-green-200' : 'bg-green-50 hover:bg-green-100';
    } else {
      return data.confidence > 80 ? 'bg-red-100 hover:bg-red-200' : 'bg-red-50 hover:bg-red-100';
    }
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i));
    }
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs font-medium text-gray-500 text-center py-2">
            {day}
          </div>
        ))}
        
        {days.map((day, index) => {
          const dayData = calendarData.find(d => 
            day && d.date.getDate() === day.getDate() && 
            d.date.getMonth() === day.getMonth() &&
            d.date.getFullYear() === day.getFullYear()
          );
          
          return (
            <div
              key={index}
              onClick={() => day && setSelectedDate(day)}
              className={`aspect-square p-2 rounded-lg cursor-pointer transition-colors ${getTileColor(day)}`}
            >
              {day && (
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {day.getDate()}
                  </div>
                  {dayData && (
                    <div className="mt-1">
                      <div className={`w-1 h-1 rounded-full mx-auto ${
                        dayData.bias === 'bullish' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const getSelectedDayData = () => {
    return calendarData.find(d => 
      d.date.getDate() === selectedDate.getDate() && 
      d.date.getMonth() === selectedDate.getMonth() &&
      d.date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const selectedDayData = getSelectedDayData();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Market Calendar</h1>
          <p className="text-gray-600">Market memory and rhythm tracking</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() - 1);
              setSelectedDate(newDate);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7 7" />
            </svg>
          </button>

          <div className="text-center">
            <h2 className="text-xl font-light text-gray-900">
              {formatMonth(selectedDate)}
            </h2>
          </div>

          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() + 1);
              setSelectedDate(newDate);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          {renderMonthView()}
        </div>

        {/* Selected Day Details */}
        {selectedDayData && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-light text-gray-900 mb-2">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedDayData.bias === 'bullish' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedDayData.bias === 'bullish' ? 'Light Green' : 'Soft Red'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedDayData.summary}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Confidence</div>
                <div className="text-2xl font-light text-gray-900">
                  {selectedDayData.confidence.toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Events */}
            {selectedDayData.events && selectedDayData.events.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Key Events</h4>
                <div className="space-y-2">
                  {selectedDayData.events.map((event, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{event}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Context */}
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-gray-500 mb-1">Volatility</div>
                <div className="font-medium text-gray-900">
                  {selectedDayData.volatility.toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Momentum</div>
                <div className={`font-medium ${
                  selectedDayData.bias === 'bullish' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedDayData.bias === 'bullish' ? 'Improving' : 'Weakening'}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Market Mood</div>
                <div className="font-medium text-gray-900">
                  {selectedDayData.volatility > 70 ? 'Uncertain' : 'Stable'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketCalendar;
