import * as Sentry from "@sentry/react";
import { analyticsManager } from './analytics';
const { PROD, VITE_SENTRY_DSN } = import.meta.env

// Register Sentry callback
analyticsManager.onToggle((enabled) => {
    if (PROD) {
        if (enabled) {
            Sentry.init({
                dsn: VITE_SENTRY_DSN,
                tracesSampleRate: 1.0,
                environment: import.meta.env.MODE,
            });
        } else {
            Sentry.close();
        }
    }
});

export function initSentry() {
    if (PROD && analyticsManager.isEnabled()) {
        Sentry.init({
            dsn: VITE_SENTRY_DSN,
            tracesSampleRate: 1.0,
            environment: import.meta.env.MODE,
        });
    }
}

// Utility function to toggle Sentry
export function toggleSentry(enabled: boolean) {
    if (enabled) {
        Sentry.init({
            dsn: VITE_SENTRY_DSN,
            tracesSampleRate: 1.0,
            environment: import.meta.env.MODE,
        });
    } else {
        Sentry.close();
    }
} 