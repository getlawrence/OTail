import { useCallback, useState } from 'react';
import { Decision } from '@/types/trace';

interface EvaluationState {
    evaluationResults?: Record<string, Decision>;
    finalDecision: Decision;
}

export const useEvaluation = () => {
    const [state, setState] = useState<EvaluationState>({
        finalDecision: Decision.NotSampled,
        evaluationResults: undefined,
    });

    const updateEvaluationResults = useCallback(
        (evaluationResults: Record<string, Decision>, finalDecision: Decision) => {
            setState({
                evaluationResults,
                finalDecision,
            });
        },
        []
    );

    return {
        evaluationResults: state.evaluationResults,
        finalDecision: state.finalDecision,
        updateEvaluationResults,
    };
};
