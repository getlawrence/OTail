import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './layout'
import Sampling from './smapling/page'
import OtelConfig2 from './config2/page'
import OtelConfig from './config/page'
import Agents from './agents/page'
import { ThemeProvider } from "@/hooks/use-theme"

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <Router>
        <Layout>
          <Routes>
            <Route path="/sampling" element={<Sampling />} />
            <Route path="/otel-config" element={<OtelConfig />} />
            <Route path="/otel-config2" element={<OtelConfig2 />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/" element={<Navigate to="/sampling" replace />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App
