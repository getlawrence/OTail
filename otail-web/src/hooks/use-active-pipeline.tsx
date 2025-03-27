import { useState, useEffect, createContext, useContext } from 'react';
import { pipelinesApi } from '@/api/pipelines';
import type { Pipeline } from '@/types/pipeline';

interface ActivePipelineContextType {
  activePipeline: Pipeline | null;
  activePipelineId: string | null;
  setActive: (id: string) => Promise<void>;
  clearActive: () => void;
  updateActiveConfig: (config: any) => Promise<void>;
}

const ActivePipelineContext = createContext<ActivePipelineContextType | null>(null);

export function ActivePipelineProvider({ children }: { children: React.ReactNode }) {
  const [activePipelineId, setActivePipelineId] = useState<string | null>(null);
  const [activePipeline, setActivePipeline] = useState<Pipeline | null>(null);

  // Load active pipeline ID from localStorage on mount
  useEffect(() => {
    const storedId = localStorage.getItem('activePipelineId');
    if (storedId) {
      setActivePipelineId(storedId);
    }
  }, []);

  // Fetch pipeline data whenever ID changes
  useEffect(() => {
    if (activePipelineId) {
      pipelinesApi.get(activePipelineId)
        .then(setActivePipeline)
        .catch(() => {
          setActivePipelineId(null);
          setActivePipeline(null);
          localStorage.removeItem('activePipelineId');
        });
    } else {
      setActivePipeline(null);
    }
  }, [activePipelineId]);

  const setActive = async (id: string) => {
    try {
      const pipeline = await pipelinesApi.get(id);
      setActivePipelineId(id);
      setActivePipeline(pipeline);
      localStorage.setItem('activePipelineId', id);
    } catch (error) {
      setActivePipelineId(null);
      setActivePipeline(null);
      localStorage.removeItem('activePipelineId');
      throw error;
    }
  };

  const clearActive = () => {
    setActivePipelineId(null);
    setActivePipeline(null);
    localStorage.removeItem('activePipelineId');
  };

  const updateActiveConfig = async (config: any) => {
    if (!activePipelineId) return;

    try {
      const updated = await pipelinesApi.update({
        id: activePipelineId,
        configuration: config,
      });
      setActivePipeline(updated);
    } catch (error) {
      console.error('Failed to update active pipeline:', error);
      throw error;
    }
  };

  return (
    <ActivePipelineContext.Provider
      value={{
        activePipeline,
        activePipelineId,
        setActive,
        clearActive,
        updateActiveConfig,
      }}
    >
      {children}
    </ActivePipelineContext.Provider>
  );
}

export function useActivePipeline() {
  const context = useContext(ActivePipelineContext);
  if (!context) {
    throw new Error('useActivePipeline must be used within an ActivePipelineProvider');
  }
  return context;
} 