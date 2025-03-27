import React, { createContext, useContext, useState, useEffect } from 'react';

interface ChecklistContextType {
    currentStep: number;
    isMinimized: boolean;
    toggleMinimize: () => void;
    goToNextStep: () => void;
    goToPreviousStep: () => void;
    completedSteps: Set<number>;
}

const ChecklistContext = createContext<ChecklistContextType | undefined>(undefined);

const STORAGE_KEY = 'checklist_state';

export const useChecklist = () => {
    const context = useContext(ChecklistContext);
    if (!context) {
        throw new Error('useChecklist must be used within a ChecklistProvider');
    }
    return context;
};

export const ChecklistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isMinimized, setIsMinimized] = useState(() => {
        // Initialize from localStorage on component mount
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (savedState) {
                const { isMinimized: savedMinimized } = JSON.parse(savedState);
                return savedMinimized;
            }
        } catch (error) {
            console.error('Failed to load checklist state:', error);
        }
        return false;
    });
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(() => {
        // Initialize from localStorage on component mount
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (savedState) {
                const { completedSteps: savedSteps } = JSON.parse(savedState);
                return new Set(savedSteps);
            }
        } catch (error) {
            console.error('Failed to load checklist state:', error);
        }
        return new Set();
    });

    // Save state to localStorage whenever it changes
    useEffect(() => {
        try {
            const stateToSave = {
                completedSteps: Array.from(completedSteps),
                isMinimized,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Failed to save checklist state:', error);
        }
    }, [completedSteps, isMinimized]);

    const toggleMinimize = () => setIsMinimized((prev: boolean) => !prev);
    const goToNextStep = () => setCurrentStep(prev => Math.min(prev + 1, 2));
    const goToPreviousStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    useEffect(() => {
        const handlePipelineCreated = () => {
            setCompletedSteps(prev => {
                const newSet = new Set([...prev, 0]);
                return newSet;
            });
            goToNextStep();
        };

        const handlePolicyAdded = () => {
            setCompletedSteps(prev => {
                const newSet = new Set([...prev, 1]);
                return newSet;
            });
            goToNextStep();
        };

        const handleTestModeActivated = () => {
            setCompletedSteps(prev => {
                const newSet = new Set([...prev, 2]);
                return newSet;
            });
            goToNextStep();
        };

        window.addEventListener('pipelineCreated', handlePipelineCreated);
        window.addEventListener('policyAdded', handlePolicyAdded);
        window.addEventListener('testModeActivated', handleTestModeActivated);

        return () => {
            window.removeEventListener('pipelineCreated', handlePipelineCreated);
            window.removeEventListener('policyAdded', handlePolicyAdded);
            window.removeEventListener('testModeActivated', handleTestModeActivated);
        };
    }, []);

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