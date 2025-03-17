import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { X } from "lucide-react";

export interface Step {
  selector: string;
  content: string;
  position: 'top' | 'right' | 'bottom' | 'left' | 'center';
}

interface CustomTourProps {
  steps: Step[];
  isOpen: boolean;
  onRequestClose: () => void;
  accentColor?: string;
  rounded?: number;
  showNavigation?: boolean;
  showButtons?: boolean;
  showCloseButton?: boolean;
  showNumber?: boolean;
  showNavigationNumber?: boolean;
  disableDotsNavigation?: boolean;
  disableInteraction?: boolean;
}

interface Sizes {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  x: number;
  y: number;
}

const initialState: Sizes = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0,
  x: 0,
  y: 0,
};

export const Tour: React.FC<CustomTourProps> = ({
  steps,
  isOpen,
  onRequestClose,
  accentColor = '#2563eb',
  rounded = 8,
  showNavigation = true,
  showButtons = true,
  showCloseButton = true,
  showNumber = true,
  disableDotsNavigation = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [sizes, setSizes] = useState<Sizes>(initialState);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const observerRef = useRef<ResizeObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);

  const updateSizes = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setSizes({
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
      x: rect.x,
      y: rect.y,
    });
  }, []);

  const setupObservers = useCallback((element: HTMLElement) => {
    // Clean up existing observers
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    if (mutationObserverRef.current) {
      mutationObserverRef.current.disconnect();
    }

    // Setup resize observer
    observerRef.current = new ResizeObserver(() => {
      updateSizes(element);
    });
    observerRef.current.observe(element);

    // Setup mutation observer
    mutationObserverRef.current = new MutationObserver(() => {
      updateSizes(element);
    });
    mutationObserverRef.current.observe(element, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  }, [updateSizes]);

  const findAndSetupElement = useCallback((step: number) => {
    if (!steps[step]) return false;
    const element = document.querySelector(steps[step].selector) as HTMLElement;
    if (element) {
      setupObservers(element);
      updateSizes(element);
      return true;
    }
    return false;
  }, [steps, setupObservers, updateSizes]);

  useEffect(() => {
    if (isOpen && steps.length > 0) {
      const found = findAndSetupElement(currentStep);
      if (!found) {
        console.warn(`Element not found for selector: ${steps[currentStep].selector}`);
        onRequestClose();
        return;
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }
    };
  }, [currentStep, isOpen, steps, findAndSetupElement, onRequestClose]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setIsTransitioning(true);
      const nextStep = currentStep + 1;
      const found = findAndSetupElement(nextStep);
      if (found) {
        setCurrentStep(nextStep);
      } else {
        console.warn(`Element not found for next step selector: ${steps[nextStep].selector}`);
        onRequestClose();
      }
      setTimeout(() => setIsTransitioning(false), 300);
    } else {
      onRequestClose();
    }
  }, [currentStep, steps, findAndSetupElement, onRequestClose]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setIsTransitioning(true);
      const prevStep = currentStep - 1;
      const found = findAndSetupElement(prevStep);
      if (found) {
        setCurrentStep(prevStep);
      } else {
        console.warn(`Element not found for previous step selector: ${steps[prevStep].selector}`);
        onRequestClose();
      }
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [currentStep, steps, findAndSetupElement, onRequestClose]);

  const handleDotClick = useCallback((index: number) => {
    setIsTransitioning(true);
    const found = findAndSetupElement(index);
    if (found) {
      setCurrentStep(index);
    } else {
      console.warn(`Element not found for dot navigation selector: ${steps[index].selector}`);
      onRequestClose();
    }
    setTimeout(() => setIsTransitioning(false), 300);
  }, [steps, findAndSetupElement, onRequestClose]);

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  if (!currentStepData) return null;

  const tooltipPosition = calculateTooltipPosition(sizes, currentStepData.position);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 pointer-events-none">
      <div
        className="fixed pointer-events-none z-[10000] border-2 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] transition-all duration-300"
        style={{
          top: sizes.top,
          left: sizes.left,
          width: sizes.width,
          height: sizes.height,
          borderRadius: rounded,
          borderColor: accentColor,
        }}
      />
      <Card
        className="fixed z-[10001] pointer-events-auto max-w-[300px] min-w-[250px] transition-all duration-300"
        style={{
          ...tooltipPosition,
          opacity: isTransitioning ? 0 : 1,
        }}
      >
        <CardContent className="p-4">
          {showCloseButton && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={onRequestClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {showNumber && (
            <div className="text-sm font-medium mb-2 text-primary">
              {currentStep + 1} / {steps.length}
            </div>
          )}
          <div className="text-sm text-foreground leading-relaxed">
            {currentStepData.content}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 p-4 pt-0">
          {showButtons && (
            <div className="flex justify-between gap-2 w-full">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex-1"
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          )}
          {showNavigation && !disableDotsNavigation && (
            <div className="flex justify-center gap-1.5">
              {steps.map((_, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  className={`w-1.5 h-1.5 p-0 rounded-full transition-all duration-200 hover:scale-125 ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  } ${index === currentStep ? 'scale-125' : ''}`}
                  onClick={() => handleDotClick(index)}
                />
              ))}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

function calculateTooltipPosition(
  sizes: Sizes,
  position: Step['position']
): React.CSSProperties {
  const padding = 20;
  const tooltipWidth = 300;
  const tooltipHeight = 150;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Calculate base position
  let top = 0;
  let left = 0;

  switch (position) {
    case 'top':
      top = sizes.top - tooltipHeight - padding;
      left = sizes.left + (sizes.width - tooltipWidth) / 2;
      break;
    case 'right':
      top = sizes.top + (sizes.height - tooltipHeight) / 2;
      left = sizes.right + padding;
      break;
    case 'bottom':
      top = sizes.bottom + padding;
      left = sizes.left + (sizes.width - tooltipWidth) / 2;
      break;
    case 'left':
      top = sizes.top + (sizes.height - tooltipHeight) / 2;
      left = sizes.left - tooltipWidth - padding;
      break;
    case 'center':
      top = sizes.top + (sizes.height - tooltipHeight) / 2;
      left = sizes.left + (sizes.width - tooltipWidth) / 2;
      break;
  }

  // Ensure tooltip stays within viewport bounds
  if (left < padding) {
    left = padding;
  } else if (left + tooltipWidth > viewportWidth - padding) {
    left = viewportWidth - tooltipWidth - padding;
  }

  if (top < padding) {
    top = padding;
  } else if (top + tooltipHeight > viewportHeight - padding) {
    top = viewportHeight - tooltipHeight - padding;
  }

  return {
    top,
    left,
  };
} 