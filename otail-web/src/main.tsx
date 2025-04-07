import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Analytics } from "@vercel/analytics/react"
import { initPosthog } from './utils/posthog'
import { initSentry } from './utils/sentry'

// Initialize PostHog
initPosthog()

// Initialize Sentry
initSentry()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Analytics />
    <App />
  </StrictMode>,
)
