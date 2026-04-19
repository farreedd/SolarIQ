import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TopNavLayout from './components/UI/TopNavLayout'
import SidebarLayout from './components/UI/SidebarLayout'
import Home        from './pages/Home'
import Overview    from './pages/Overview'
import Analytics   from './pages/Analytics'
import Visualizer  from './pages/Visualizer'
import Training    from './pages/Training'
import AIInsights  from './pages/AIInsights'
import Forecasting from './pages/Forecasting'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<TopNavLayout />}>
          <Route path="/"         element={<Home />} />
          <Route path="/training" element={<Training />} />
        </Route>
        <Route element={<SidebarLayout />}>
          <Route path="/overview"    element={<Overview />} />
          <Route path="/analytics"   element={<Analytics />} />
          <Route path="/visualizer"  element={<Visualizer />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/forecasting" element={<Forecasting />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
