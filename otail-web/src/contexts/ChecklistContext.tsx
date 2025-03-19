import React, { createContext, useContext, useState, useEffect } from 'react';

interface ChecklistContextType {
    currentStep: number;
    isMinimized: boolean;
    isPermanentlyHidden: boolean;
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
    const [isPermanentlyHidden, setIsPermanentlyHidden] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    // Load saved state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            try {
                const { completedSteps: savedCompletedSteps, isPermanentlyHidden: savedHidden } = JSON.parse(savedState);
                setCompletedSteps(new Set(savedCompletedSteps));
                setIsPermanentlyHidden(savedHidden);
            } catch (error) {
                console.error('Failed to load checklist state:', error);
            }
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        const stateToSave = {
            completedSteps: Array.from(completedSteps),
            isPermanentlyHidden,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, [completedSteps, isPermanentlyHidden]);

    const toggleMinimize = () => setIsMinimized(prev => !prev);
    const goToNextStep = () => setCurrentStep(prev => Math.min(prev + 1, 2));
    const goToPreviousStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    useEffect(() => {
        const handleProjectCreated = () => {
            setCompletedSteps(prev => new Set([...prev, 0]));
            goToNextStep();
        };

        const handlePolicyAdded = () => {
            setCompletedSteps(prev => new Set([...prev, 1]));
            goToNextStep();
        };

        const handleTestModeActivated = () => {
            setCompletedSteps(prev => new Set([...prev, 2]));
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
                isPermanentlyHidden,
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