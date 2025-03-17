import React, { useState, useEffect } from 'react';
import Tour from 'reactour';
import { useLocation } from 'react-router-dom';
import './OTailWalkthrough.css';

interface Step {
  selector: string;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  action?: () => void;
}

const policyBuilderSteps: Step[] = [
  {
    selector: '.pinned-recipes',
    content: 'Welcome to OTail! This is the Policy Builder, where you can create and manage sampling policies for your OpenTelemetry data. Start by exploring our pinned recipes for common sampling scenarios.',
    position: 'bottom',
  },
  {
    selector: '.policy-actions',
    content: 'Click here to create a new policy or manage your existing recipes. This is where you\'ll start building your sampling configuration.',
    position: 'right',
  },
  {
    selector: '.policy-builder',
    content: 'The Policy Builder lets you create and edit sampling rules. You can add multiple rules to create complex sampling strategies.',
    position: 'left',
  },
  {
    selector: '.config-viewer',
    content: 'View and edit your configuration in YAML format. This gives you full control over your sampling rules.',
    position: 'right',
  },
  {
    selector: '.mode-toggle',
    content: 'Switch between Edit and Test modes. In Test mode, you can validate your sampling rules against real OpenTelemetry data.',
    position: 'bottom',
  },
];

const canvasSteps: Step[] = [
  {
    selector: '.canvas-container',
    content: 'Welcome to the Canvas view! Here you can visualize and debug your sampling policies in real-time.',
    position: 'center',
  },
  {
    selector: '.yaml-toggle',
    content: 'Toggle between the visual canvas and YAML editor. The YAML editor gives you direct control over your configuration.',
    position: 'bottom',
  },
  {
    selector: '.monaco-editor',
    content: 'Edit your YAML configuration directly. Changes will be reflected in the canvas view in real-time.',
    position: 'right',
  },
  {
    selector: '.send-button',
    content: 'Once you\'re happy with your configuration, send it to your OpenTelemetry agent to start sampling your traces.',
    position: 'left',
  },
];

export const OTailWalkthrough: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if this is the user's first visit
    const hasSeenWalkthrough = localStorage.getItem('hasSeenWalkthrough');
    if (!hasSeenWalkthrough) {
      // Add a longer delay to ensure all components are mounted and rendered
      const timer = setTimeout(() => {
        setIsOpen(true);
        // Set the flag after showing the tour
        localStorage.setItem('hasSeenWalkthrough', 'true');
      }, 2000); // Increased delay to 2 seconds

      return () => clearTimeout(timer);
    }
  }, [location.pathname]); // Add location.pathname as a dependency

  const steps = location.pathname === '/canvas' ? canvasSteps : policyBuilderSteps;

  return (
    <Tour
      steps={steps}
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
      className="otail-walkthrough"
    />
  );
}; 