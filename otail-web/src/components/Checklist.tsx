import React, { useState, useEffect } from 'react';
import { useChecklist } from '@/contexts/ChecklistContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Minimize2, Maximize2, Trophy } from 'lucide-react';
import Confetti from './Confetti';

const steps = [
    {
        title: 'Create a new project',
        description: 'Start by creating a new project to manage your sampling policies',
    },
    {
        title: 'Add a sampling policy',
        description: 'Configure your sampling rules to control which traces are collected',
    },
    {
        title: 'Switch to test mode',
        description: 'Validate your sampling rules with real OpenTelemetry data',
    }
];

export const Checklist: React.FC = () => {
    const { currentStep, isMinimized, isPermanentlyHidden, toggleMinimize, completedSteps } = useChecklist();
    const [showConfetti, setShowConfetti] = useState(false);
    const [_, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const progress = (completedSteps.size / steps.length) * 100;
    const remainingSteps = steps.length - completedSteps.size;

    // Update window size on resize
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Show confetti immediately when all steps are completed
    useEffect(() => {
        if (completedSteps.size === steps.length) {
            setShowConfetti(true);
        }
    }, [completedSteps.size]);

    // Don't render anything if permanently hidden
    if (isPermanentlyHidden) {
        return null;
    }

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
                    <span>{completedSteps.size}/{steps.length}</span>
                </div>
            </div>
        );
    }

    return (
        <>
            {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
            <Card className="w-full p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5">
                        <Trophy className="h-4 w-4 text-primary" />
                        <h3 className="text-base font-semibold">Getting Started</h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMinimize}
                        className="h-8 w-8 p-0"
                    >
                        <Minimize2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="space-y-4">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`flex items-start space-x-3 ${
                                index === currentStep ? 'text-primary' : ''
                            }`}
                        >
                            {completedSteps.has(index) ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                            ) : (
                                <Circle className="h-5 w-5 mt-0.5" />
                            )}
                            <div>
                                <p className="font-medium">{step.title}</p>
                                <p className="text-sm text-muted-foreground">
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