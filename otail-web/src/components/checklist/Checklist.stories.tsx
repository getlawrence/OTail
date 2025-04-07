import type { Meta, StoryObj } from '@storybook/react';
import { Checklist, ChecklistStep } from './Checklist';
import { ChecklistContext } from '@/contexts/ChecklistContext';
import React, { useState } from 'react';

// Custom provider for stories that allows setting initial state
const StoryChecklistProvider: React.FC<{
  children: React.ReactNode;
  initialMinimized?: boolean;
  initialCompletedSteps?: Set<number>;
}> = ({ children, initialMinimized = false, initialCompletedSteps = new Set() }) => {
  const [isMinimized, setIsMinimized] = useState(initialMinimized);
  const [completedSteps, setCompletedSteps] = useState(initialCompletedSteps);
  const [currentStep, setCurrentStep] = useState(0);

  const toggleMinimize = () => setIsMinimized(prev => !prev);
  const goToNextStep = () => setCurrentStep(prev => Math.min(prev + 1, 2));
  const goToPreviousStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  return (
    <ChecklistContext.Provider
      value={{
        currentStep,
        isMinimized,
        toggleMinimize,
        goToNextStep,
        goToPreviousStep,
        completedSteps,
      }}
    >
      {children}
    </ChecklistContext.Provider>
  );
};

const meta: Meta<typeof Checklist> = {
  title: 'Components/Checklist',
  component: Checklist,
  decorators: [
    (Story) => (
      <StoryChecklistProvider>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <Story />
        </div>
      </StoryChecklistProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
    chromatic: { 
      viewports: [320, 768, 1024],
      pauseAnimationAtEnd: true 
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checklist>;

export const Default: Story = {
  args: {
    currentPath: '/',
    onStepClick: (step: ChecklistStep) => {
      console.log('Step clicked:', step);
    },
  },
};

export const Minimized: Story = {
  args: {
    currentPath: '/',
    onStepClick: (step: ChecklistStep) => {
      console.log('Step clicked:', step);
    },
  },
  decorators: [
    (Story) => (
      <StoryChecklistProvider initialMinimized={true}>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <Story />
        </div>
      </StoryChecklistProvider>
    ),
  ],
};

export const WithCompletedSteps: Story = {
  args: {
    currentPath: '/',
    onStepClick: (step: ChecklistStep) => {
      console.log('Step clicked:', step);
    },
  },
  decorators: [
    (Story) => (
      <StoryChecklistProvider initialCompletedSteps={new Set([0, 1])}>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <Story />
        </div>
      </StoryChecklistProvider>
    ),
  ],
};

export const AllStepsCompleted: Story = {
  args: {
    currentPath: '/',
    onStepClick: (step: ChecklistStep) => {
      console.log('Step clicked:', step);
    },
  },
  decorators: [
    (Story) => (
      <StoryChecklistProvider initialCompletedSteps={new Set([0, 1, 2])}>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <Story />
        </div>
      </StoryChecklistProvider>
    ),
  ],
}; 