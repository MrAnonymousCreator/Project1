import React from 'react'
import ReactDOM from 'react-dom/client'
import Landing from './Landing.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <Landing />
  </ErrorBoundary>,
)
