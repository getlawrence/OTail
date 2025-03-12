import { trackEvent } from '@/utils/posthog';

// Canvas Component Events
export const trackCanvas = {
  // Section interactions
  section: {
    toggleFullScreen: (sectionType: string, isFullScreen: boolean) => 
      trackEvent('canvas_section_fullscreen_toggled', { section: sectionType, isFullScreen }),
    toggleCollapse: (sectionType: string, isCollapsed: boolean) => 
      trackEvent('canvas_section_collapse_toggled', { section: sectionType, isCollapsed })
  },
  
  // Component interactions
  component: {
    add: (componentType: string, componentName: string, sectionType: string) => 
      trackEvent('canvas_component_added', { type: componentType, name: componentName, section: sectionType }),
    remove: (componentType: string, componentName: string) => 
      trackEvent('canvas_component_removed', { type: componentType, name: componentName }),
    configure: (componentType: string, componentName: string) => 
      trackEvent('canvas_component_configured', { type: componentType, name: componentName }),
    drag: (componentType: string, componentName: string, fromSection?: string, toSection?: string) => 
      trackEvent('canvas_component_dragged', { type: componentType, name: componentName, fromSection, toSection })
  },
  
  // Connection interactions
  connection: {
    create: (sourceType: string, sourceName: string, targetType: string, targetName: string) => 
      trackEvent('canvas_connection_created', { sourceType, sourceName, targetType, targetName }),
    remove: (sourceType: string, sourceName: string, targetType: string, targetName: string) => 
      trackEvent('canvas_connection_removed', { sourceType, sourceName, targetType, targetName })
  },
  
  // Configuration interactions
  config: {
    generate: (componentCount: number, connectionCount: number) => 
      trackEvent('canvas_config_generated', { componentCount, connectionCount }),
    import: (success: boolean, errorType?: string) => 
      trackEvent('canvas_config_imported', { success, errorType }),
    export: (format: string) => 
      trackEvent('canvas_config_exported', { format })
  },
  
  // Sidebar interactions
  sidebar: {
    toggleExpand: (isExpanded: boolean) => 
      trackEvent('canvas_sidebar_toggled', { isExpanded }),
    selectComponentType: (componentType: string) => 
      trackEvent('canvas_sidebar_component_type_selected', { componentType }),
    search: (searchTerm: string, resultsCount: number) => 
      trackEvent('canvas_sidebar_searched', { searchTerm, resultsCount })
  }
};
