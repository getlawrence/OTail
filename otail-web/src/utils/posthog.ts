import posthog from 'posthog-js'
import { analyticsManager } from './analytics'
import { config } from '@/config'

// Register PostHog callback
analyticsManager.onToggle((enabled) => {
    if (config.PROD || config.forcePosthog) {
        if (enabled) {
            posthog.opt_in_capturing();
        } else {
            posthog.opt_out_capturing();
        }
    }
});

export function initPosthog() {
    if (config.PROD || config.forcePosthog) {
        posthog.init(config.posthogKey, {
            api_host: config.posthogHost || 'https://app.posthog.com',
            // Enable debug mode in development
            loaded: (posthog) => {
                if (config.DEV) posthog.debug()
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
    if ((config.PROD || config.forcePosthog) && analyticsManager.isEnabled()) {
        posthog.capture(eventName, properties)
    }
}

// Utility function to identify users
export function identifyUser(distinctId: string, properties?: Record<string, any>) {
    if ((config.PROD || config.forcePosthog) && analyticsManager.isEnabled()) {
        posthog.identify(distinctId, properties)
    }
}