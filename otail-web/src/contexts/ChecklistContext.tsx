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

const STORAGE_KEY = 'otail_checklist_state';

export const useChecklist = () => {
    const context = useContext(ChecklistContext);
    if (!context) {
        throw new Error('useChecklist must be used within a ChecklistProvider');
    }
    return context;
};

export const ChecklistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isMinimized, setIsMinimized] = useState(false);
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
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Failed to save checklist state:', error);
        }
    }, [completedSteps]);

    const toggleMinimize = () => setIsMinimized(prev => !prev);
    const goToNextStep = () => setCurrentStep(prev => Math.min(prev + 1, 2));
    const goToPreviousStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    useEffect(() => {
        const handleProjectCreated = () => {
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

        window.addEventListener('projectCreated', handleProjectCreated);
        window.addEventListener('policyAdded', handlePolicyAdded);
        window.addEventListener('testModeActivated', handleTestModeActivated);

        return () => {
            window.removeEventListener('projectCreated', handleProjectCreated);
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