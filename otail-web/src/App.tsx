import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './layout'
import Sampling from './pages/sampling'
import OtelConfig from './pages/config'
import Agents from './pages/agents'
import { ThemeProvider } from "@/hooks/use-theme"

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <Router>
        <Layout>
          <Routes>
            <Route path="/sampling" element={<Sampling />} />
            <Route path="/otel-config" element={<OtelConfig />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/" element={<Navigate to="/sampling" replace />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App
