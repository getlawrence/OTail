import * as Sentry from "@sentry/react";
import { analyticsManager } from './analytics';
import { config } from '@/config';

// Register Sentry callback
analyticsManager.onToggle((enabled) => {
    if (config.PROD) {
        if (enabled) {
            Sentry.init({
                dsn: config.sentryDsn,
                tracesSampleRate: 1.0,
                environment: config.MODE,
            });
        } else {
            Sentry.close();
        }
    }
});

export function initSentry() {
    if (config.PROD && analyticsManager.isEnabled()) {
        Sentry.init({
            dsn: config.sentryDsn,
            tracesSampleRate: 1.0,
            environment: config.MODE,
        });
    }
}

// Utility function to toggle Sentry
export function toggleSentry(enabled: boolean) {
    if (enabled) {
        Sentry.init({
            dsn: config.sentryDsn,
            tracesSampleRate: 1.0,
            environment: config.MODE,
        });
    } else {
        Sentry.close();
    }
} 