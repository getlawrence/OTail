import { useCallback, useState } from 'react';

export const useSimulation = () => {
    const [simulationData, setSimulationData] = useState('');

    const updateSimulationData = useCallback((data: string) => {
        setSimulationData(data);
    }, []);

    return {
        simulationData,
        updateSimulationData,
    };
};
