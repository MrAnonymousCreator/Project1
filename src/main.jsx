import React from 'react'
import ReactDOM from 'react-dom/client'
import Workspace from './Workspace.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <Workspace />
  </ErrorBoundary>,
)
