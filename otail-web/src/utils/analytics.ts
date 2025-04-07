import { trackEvent } from './posthog'

// Auth Events
export const trackAuth = {
  login: (success: boolean) => trackEvent('auth_login', { success }),
  register: (success: boolean) => trackEvent('auth_register', { success }),
  logout: () => trackEvent('auth_logout')
}

// Recipe Events
export const trackRecipe = {
  create: (name: string) => trackEvent('recipe_created', { name }),
  delete: (name: string) => trackEvent('recipe_deleted', { name }),
  apply: (name: string) => trackEvent('recipe_applied', { name }),
  pin: (name: string) => trackEvent('recipe_pinned', { name }),
  unpin: (name: string) => trackEvent('recipe_unpinned', { name })
}

// Policy Events
export const trackPolicy = {
  create: (policyType: string) => trackEvent('policy_created', { type: policyType }),
  update: (policyType: string) => trackEvent('policy_updated', { type: policyType }),
  delete: (policyType: string) => trackEvent('policy_deleted', { type: policyType }),
  evaluation: (policyType: string, decision: string) =>
    trackEvent('policy_evaluated', { type: policyType, decision })
}

// Configuration Events
export const trackConfig = {
  update: (componentType: string) => trackEvent('config_updated', { component: componentType }),
  save: () => trackEvent('config_saved'),
  load: () => trackEvent('config_loaded')
}

// Simulation Events
export const trackSimulation = {
  start: () => trackEvent('simulation_started'),
  complete: (success: boolean) => trackEvent('simulation_completed', { success }),
  error: (errorType: string) => trackEvent('simulation_error', { error: errorType })
}

// Navigation Events
export const trackNavigation = {
  pageView: (page: string) => trackEvent('page_view', { page }),
  tabChange: (from: string, to: string) => trackEvent('tab_change', { from, to })
}

// Sampling Page Events
export const trackSampling = {
  modeChange: (from: string, to: string) =>
    trackEvent('sampling_mode_changed', { from, to }),
  policyAction: (action: string) =>
    trackEvent('sampling_policy_action', { action }),
  configChange: (changeType: string) =>
    trackEvent('sampling_config_changed', { type: changeType }),
  simulationRun: () => trackEvent('sampling_simulation_run'),
  policyBuilderAction: (
    action: 'add' | 'update' | 'remove' | 'add_popular_recipe' | 'add_recipe' | 'import_config_set' | 'save_config',
    policyType: string
  ) => trackEvent('sampling_policy_builder_action', { action, policyType })
}

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