import { AssetWorkspace } from './components/AssetWorkspace'
import { assets } from './lib/market-data'

export default function App() {
  return <AssetWorkspace asset={assets[0]} />
}
