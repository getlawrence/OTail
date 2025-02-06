import posthog from 'posthog-js'
const { VITE_POSTHOG_KEY, VITE_POSTHOG_HOST, VITE_FORCE_POSTHOG } = import.meta.env

export function initPosthog() {
    // Only initialize in production
    if (import.meta.env.PROD || VITE_FORCE_POSTHOG) {
        posthog.init(VITE_POSTHOG_KEY, {
            api_host: VITE_POSTHOG_HOST || 'https://app.posthog.com',
            // Enable debug mode in development
            loaded: (posthog) => {
                if (import.meta.env.DEV) posthog.debug()
            }
        })
    }
}

// Utility function to track events
export function trackEvent(eventName: string, properties?: Record<string, any>) {
    if (import.meta.env.PROD || VITE_FORCE_POSTHOG) {
        posthog.capture(eventName, properties)
    }
}

// Utility function to identify users
export function identifyUser(distinctId: string, properties?: Record<string, any>) {
    if (import.meta.env.PROD || VITE_FORCE_POSTHOG) {
        posthog.identify(distinctId, properties)
    }
}
