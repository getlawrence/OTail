import React, { useState } from 'react';
import { useChecklist } from '@/contexts/ChecklistContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Minimize2, Maximize2, Trophy } from 'lucide-react';
import Confetti from './Confetti';

export interface ChecklistStep {
    title: string;
    description: string;
    path: string;
    targetComponent: string;
}

export interface ChecklistProps {
    onStepClick?: (step: ChecklistStep) => void;
    currentPath?: string;
}

const defaultSteps: ChecklistStep[] = [
    {
        title: 'Create a new pipeline',
        description: 'Start by creating a new pipeline to manage your sampling policies',
        path: '/',
        targetComponent: 'new-pipeline-button'
    },
    {
        title: 'Add a sampling policy',
        description: 'Configure your sampling rules to control which traces are collected',
        path: '/sampling',
        targetComponent: 'add-policy-button'
    },
    {
        title: 'Switch to test mode',
        description: 'Validate your sampling rules with real OpenTelemetry data',
        path: '/sampling',
        targetComponent: 'test-mode-button'
    }
];

export const Checklist: React.FC<ChecklistProps> = ({ 
    onStepClick,
    currentPath = '/'
}) => {
    const { currentStep, isMinimized, toggleMinimize, completedSteps } = useChecklist();
    const [showConfetti, setShowConfetti] = useState(false);

    const progress = (completedSteps.size / defaultSteps.length) * 100;
    const remainingSteps = defaultSteps.length - completedSteps.size;

    const highlightComponent = (componentId: string) => {
        const targetElement = document.getElementById(componentId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetElement.classList.add('highlight-component');
            setTimeout(() => {
                targetElement.classList.remove('highlight-component');
            }, 3000);
        }
    };

    const handleStepClick = (step: ChecklistStep) => {
        if (onStepClick) {
            onStepClick(step);
        } else if (currentPath !== step.path) {
            // Default navigation behavior if no onStepClick provided
            window.location.href = step.path;
        } else {
            highlightComponent(step.targetComponent);
        }
    };

    if (isMinimized) {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Getting Started</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMinimize}
                        className="h-8 w-8 p-0"
                    >
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                        {remainingSteps === 0 
                            ? "🎉 All steps completed!" 
                            : `${remainingSteps} step${remainingSteps === 1 ? '' : 's'} remaining`}
                    </span>
                    <span>{completedSteps.size}/{defaultSteps.length}</span>
                </div>
            </div>
        );
    }

    return (
        <>
            {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
            <Card className="w-full p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5 text-primary" />
                        <h3 className="text-sm font-semibold">Getting Started</h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMinimize}
                        className="h-6 w-6 p-0"
                    >
                        <Minimize2 className="h-3.5 w-3.5" />
                    </Button>
                </div>

                <div className="space-y-2">
                    {defaultSteps.map((step, index) => (
                        <div
                            key={index}
                            onClick={() => handleStepClick(step)}
                            className={`flex items-start space-x-2 cursor-pointer hover:bg-muted/50 p-1.5 rounded-lg transition-colors ${
                                index === currentStep ? 'text-primary' : ''
                            }`}
                        >
                            {completedSteps.has(index) ? (
                                <CheckCircle2 className="h-7 w-7 text-green-500 mt-0.5" />
                            ) : (
                                <Circle className="h-7 w-7 mt-0.5" />
                            )}
                            <div>
                                <p className="text-sm font-medium">{step.title}</p>
                                <p className="text-xs text-muted-foreground">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </>
    );
};

export default Checklist; 