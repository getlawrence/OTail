const ANALYTICS_ENABLED_KEY = 'analytics-enabled';

type AnalyticsCallback = (enabled: boolean) => void;

class AnalyticsManager {
    private callbacks: AnalyticsCallback[] = [];
    private enabled: boolean;

    constructor() {
        this.enabled = localStorage.getItem(ANALYTICS_ENABLED_KEY) !== 'false';
    }

    onToggle(callback: AnalyticsCallback) {
        this.callbacks.push(callback);
        // Notify new callback of current state
        callback(this.enabled);
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
        localStorage.setItem(ANALYTICS_ENABLED_KEY, enabled.toString());
        this.callbacks.forEach(callback => callback(enabled));
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}

// Export a singleton instance
export const analyticsManager = new AnalyticsManager();

// For backward compatibility
export function isAnalyticsEnabled(): boolean {
    return analyticsManager.isEnabled();
}

export function setAnalyticsEnabled(enabled: boolean): void {
    analyticsManager.setEnabled(enabled);
}

export function getAnalyticsEnabled(): boolean {
    return analyticsManager.isEnabled();
}

// Utility function to toggle analytics
export function toggleAnalytics(enabled: boolean) {
    analyticsManager.setEnabled(enabled);
}