import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Tour, Step } from './Tour';

const TOUR_STORAGE_KEY = 'otail_tours_shown';

const policyBuilderSteps: Step[] = [
  {
    selector: '.policy-builder',
    content: 'Welcome to OTail! This is where you create and manage sampling policies. The Policy Builder lets you create and edit sampling rules to build complex sampling strategies.',
    position: 'right',
  },
  {
    selector: '.config-viewer',
    content: 'View and edit your configuration in YAML format. This gives you full control over your sampling rules.',
    position: 'left',
  },
  {
    selector: '.mode-toggle',
    content: 'Switch between Edit and Test modes. In Test mode, you can validate your sampling rules against real OpenTelemetry data.',
    position: 'bottom',
  },
  {
    selector: '.pinned-recipes',
    content: 'Need inspiration? Explore our pinned recipes for common sampling scenarios.',
    position: 'bottom',
  },
  {
    selector: '.policy-actions',
    content: 'Click here to create new recipes or manage your existing recipes.',
    position: 'bottom',
  }
];

export const OTailWalkthrough: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const location = useLocation();

  const checkIfMobile = () => {
    return window.innerWidth <= 768; // Standard mobile breakpoint
  };
  
  useEffect(() => {
    // Get the list of tours that have been shown
    const shownTours = JSON.parse(localStorage.getItem(TOUR_STORAGE_KEY) || '[]');

    // If this tour hasn't been shown yet, wait for components to be ready
    if (!shownTours.includes('policy-builder')) {
      // Add a small delay to ensure components are mounted
      const timer = setTimeout(() => {
        setIsReady(true);
        setIsOpen(true);
        // Mark this tour as shown
        localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify([...shownTours, 'policy-builder']));
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  // Don't render anything if not ready or on mobile
  if (!isReady || checkIfMobile()) {
    return null;
  }

  return (
    <Tour
      steps={policyBuilderSteps}
      isOpen={isOpen}
      onRequestClose={() => setIsOpen(false)}
      accentColor="#2563eb"
      rounded={8}
      showNavigation={true}
      showButtons={true}
      showCloseButton={true}
      showNumber={true}
      showNavigationNumber={true}
      disableDotsNavigation={false}
      disableInteraction={false}
    />
  );
}; 