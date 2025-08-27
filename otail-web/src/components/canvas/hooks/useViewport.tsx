import { useState, useEffect, useCallback } from 'react';
import { LAYOUT_CONFIG } from '../constants';

interface ViewportInfo {
  width: number;
  height: number;
  availableWidth: number;
  availableHeight: number;
  layoutStrategy: 'horizontal' | 'vertical' | 'grid';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
}

export function useViewport(): ViewportInfo {
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const sidebarWidth = LAYOUT_CONFIG.SIDEBAR_WIDTH;
    const headerHeight = LAYOUT_CONFIG.HEADER_HEIGHT;
    const margin = LAYOUT_CONFIG.MARGIN;
    
    const availableWidth = width - sidebarWidth - (margin * 2);
    const availableHeight = height - headerHeight - (margin * 2);
    
    // Always use vertical layout for row-based pipeline design
    const layoutStrategy: 'horizontal' | 'vertical' | 'grid' = 'vertical';
    
    return {
      width,
      height,
      availableWidth,
      availableHeight,
      layoutStrategy,
      isMobile: width < LAYOUT_CONFIG.BREAKPOINTS.TABLET,
      isTablet: width >= LAYOUT_CONFIG.BREAKPOINTS.TABLET && width < LAYOUT_CONFIG.BREAKPOINTS.DESKTOP,
      isDesktop: width >= LAYOUT_CONFIG.BREAKPOINTS.DESKTOP && width < LAYOUT_CONFIG.BREAKPOINTS.WIDE,
      isWide: width >= LAYOUT_CONFIG.BREAKPOINTS.WIDE
    };
  });

  const updateViewportInfo = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const sidebarWidth = LAYOUT_CONFIG.SIDEBAR_WIDTH;
    const headerHeight = LAYOUT_CONFIG.HEADER_HEIGHT;
    const margin = LAYOUT_CONFIG.MARGIN;
    
    const availableWidth = width - sidebarWidth - (margin * 2);
    const availableHeight = height - headerHeight - (margin * 2);
    
    // Always use vertical layout for row-based pipeline design
    const layoutStrategy: 'horizontal' | 'vertical' | 'grid' = 'vertical';
    
    setViewportInfo({
      width,
      height,
      availableWidth,
      availableHeight,
      layoutStrategy,
      isMobile: width < LAYOUT_CONFIG.BREAKPOINTS.TABLET,
      isTablet: width >= LAYOUT_CONFIG.BREAKPOINTS.TABLET && width < LAYOUT_CONFIG.BREAKPOINTS.DESKTOP,
      isDesktop: width >= LAYOUT_CONFIG.BREAKPOINTS.DESKTOP && width < LAYOUT_CONFIG.BREAKPOINTS.WIDE,
      isWide: width >= LAYOUT_CONFIG.BREAKPOINTS.WIDE
    });
  }, []);

  useEffect(() => {
    // Debounce resize events
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateViewportInfo, 100);
    };

    window.addEventListener('resize', handleResize);
    
    // Also listen for orientation changes on mobile
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timeoutId);
    };
  }, [updateViewportInfo]);

  return viewportInfo;
}
