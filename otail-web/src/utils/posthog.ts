import posthog from 'posthog-js'
import { analyticsManager } from './analytics'
const { PROD, VITE_POSTHOG_KEY, VITE_POSTHOG_HOST, VITE_FORCE_POSTHOG } = import.meta.env

// Register PostHog callback
analyticsManager.onToggle((enabled) => {
    if (PROD || VITE_FORCE_POSTHOG === 'true') {
        if (enabled) {
            posthog.opt_in_capturing();
        } else {
            posthog.opt_out_capturing();
        }
    }
});

export function initPosthog() {
    if (PROD || VITE_FORCE_POSTHOG === 'true') {
        posthog.init(VITE_POSTHOG_KEY, {
            api_host: VITE_POSTHOG_HOST || 'https://app.posthog.com',
            // Enable debug mode in development
            loaded: (posthog) => {
                if (import.meta.env.DEV) posthog.debug()
                // Check if analytics are disabled
                if (!analyticsManager.isEnabled()) {
                    posthog.opt_out_capturing()
                }
            }
        })
    }
}

// Utility function to track events
export function trackEvent(eventName: string, properties?: Record<string, any>) {
    if ((PROD || VITE_FORCE_POSTHOG) && analyticsManager.isEnabled()) {
        posthog.capture(eventName, properties)
    }
}

// Utility function to identify users
export function identifyUser(distinctId: string, properties?: Record<string, any>) {
    if ((PROD || VITE_FORCE_POSTHOG) && analyticsManager.isEnabled()) {
        posthog.identify(distinctId, properties)
    }
}