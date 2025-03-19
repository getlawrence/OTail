import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './layout'
import Sampling from './pages/sampling'
import { CanvasPage } from './pages/canvas'
import Config from './pages/config/ConfigSets'
import Agents from './pages/agents'
import Login from './pages/auth/login'
import Register from './pages/auth/register'
import Organization from './pages/organization'
import Dashboard from './pages/Dashboard'
import { ThemeProvider } from "@/hooks/use-theme"
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import { Toaster } from "@/components/ui/toaster"
import { MobileWarning } from '@/components/MobileWarning'
import { ActiveConfigSetProvider } from '@/hooks/use-active-config-set'
import { ChecklistProvider } from '@/contexts/ChecklistContext'

const noAuthRequired = import.meta.env.VITE_NO_AUTH_REQUIRED === 'true'

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <Router>
        <AuthProvider>
          <ActiveConfigSetProvider>
            <ChecklistProvider>
              <MobileWarning />
              <Routes>
                <Route path="/login" element={
                  <div className="h-screen w-screen flex items-center justify-center">
                    <Login />
                  </div>
                } />
                <Route path="/register" element={
                  <div className="h-screen w-screen flex items-center justify-center">
                    <Register />
                  </div>
                } />
                {noAuthRequired ? (
                  <Route element={<Layout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/sampling" element={<Sampling />} />
                    <Route path="/canvas" element={<CanvasPage />} />
                    <Route path="/config" element={<Config />} />
                  </Route>
                ) : (
                  <Route element={<RequireAuth><Layout /></RequireAuth>}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/sampling" element={<Sampling />} />
                    <Route path="/canvas" element={<CanvasPage />} />
                    <Route path="/agents" element={<Agents />} />
                    <Route path="/organization" element={<Organization />} />
                    <Route path="/config" element={<Config />} />
                  </Route>
                )}
              </Routes>
              <Toaster />
            </ChecklistProvider>
          </ActiveConfigSetProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App
