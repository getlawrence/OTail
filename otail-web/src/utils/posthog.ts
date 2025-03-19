import posthog from 'posthog-js'
const { PROD, VITE_POSTHOG_KEY, VITE_POSTHOG_HOST, VITE_FORCE_POSTHOG } = import.meta.env

export function initPosthog() {
    if (PROD || VITE_FORCE_POSTHOG === 'true') {
        posthog.init(VITE_POSTHOG_KEY, {
            api_host: VITE_POSTHOG_HOST || 'https://app.posthog.com',
            // Enable debug mode in development
            loaded: (posthog) => {
                if (import.meta.env.DEV) posthog.debug()
                // Check if analytics are disabled
                const analyticsEnabled = localStorage.getItem('analytics-enabled')
                if (analyticsEnabled === 'false') {
                    posthog.opt_out_capturing()
                }
            }
        })
    }
}

// Utility function to track events
export function trackEvent(eventName: string, properties?: Record<string, any>) {
    const analyticsEnabled = localStorage.getItem('analytics-enabled')
    if ((PROD || VITE_FORCE_POSTHOG) && analyticsEnabled !== 'false') {
        posthog.capture(eventName, properties)
    }
}

// Utility function to identify users
export function identifyUser(distinctId: string, properties?: Record<string, any>) {
    const analyticsEnabled = localStorage.getItem('analytics-enabled')
    if ((PROD || VITE_FORCE_POSTHOG) && analyticsEnabled !== 'false') {
        posthog.identify(distinctId, properties)
    }
}

// Utility function to toggle analytics
export function toggleAnalytics(enabled: boolean) {
    localStorage.setItem('analytics-enabled', enabled.toString())
    if (enabled) {
        posthog.opt_in_capturing()
    } else {
        posthog.opt_out_capturing()
    }
}

// Utility function to check if analytics are enabled
export function isAnalyticsEnabled(): boolean {
    return localStorage.getItem('analytics-enabled') !== 'false'
}
