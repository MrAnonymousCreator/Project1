import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { routeTree } from './routeTree.gen'
import { router } from './router'

import './styles.css'

// Import the main UI components
import { AssetWorkspace } from './components/AssetWorkspace'
import { MarketCalendar } from './components/MarketCalendar'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter router={router}>
        <div>
          <AssetWorkspace />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </React.StrictMode>,
)
