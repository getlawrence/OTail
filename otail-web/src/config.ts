export const config = {
    noBackend: import.meta.env.VITE_NO_BACKEND === 'true',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    opampEndpoint: import.meta.env.VITE_OPAMP_ENDPOINT || 'ws://localhost:4320/v1/opamp',
    posthogKey: import.meta.env.VITE_POSTHOG_KEY,
    posthogHost: import.meta.env.VITE_POSTHOG_HOST,
    forcePosthog: import.meta.env.VITE_FORCE_POSTHOG === 'true',
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
    PROD: import.meta.env.PROD,
    DEV: import.meta.env.DEV,
    MODE: import.meta.env.MODE,
} as const; 