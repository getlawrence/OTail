import { useState, useEffect, createContext, useContext } from 'react';
import { configSetsApi } from '@/api/configSets';
import type { ConfigSet } from '@/types/configSet';

interface ActiveConfigSetContextType {
  activeConfigSet: ConfigSet | null;
  activeConfigSetId: string | null;
  setActive: (id: string) => Promise<void>;
  clearActive: () => void;
  updateActiveConfig: (config: any) => Promise<void>;
}

const ActiveConfigSetContext = createContext<ActiveConfigSetContextType | null>(null);

export function ActiveConfigSetProvider({ children }: { children: React.ReactNode }) {
  const [activeConfigSetId, setActiveConfigSetId] = useState<string | null>(null);
  const [activeConfigSet, setActiveConfigSet] = useState<ConfigSet | null>(null);

  // Load active config set ID from localStorage on mount
  useEffect(() => {
    const storedId = localStorage.getItem('activeConfigSetId');
    if (storedId) {
      setActiveConfigSetId(storedId);
    }
  }, []);

  // Fetch config set data whenever ID changes
  useEffect(() => {
    if (activeConfigSetId) {
      configSetsApi.get(activeConfigSetId)
        .then(setActiveConfigSet)
        .catch(() => {
          setActiveConfigSetId(null);
          setActiveConfigSet(null);
          localStorage.removeItem('activeConfigSetId');
        });
    } else {
      setActiveConfigSet(null);
    }
  }, [activeConfigSetId]);

  const setActive = async (id: string) => {
    try {
      const configSet = await configSetsApi.get(id);
      setActiveConfigSetId(id);
      setActiveConfigSet(configSet);
      localStorage.setItem('activeConfigSetId', id);
    } catch (error) {
      setActiveConfigSetId(null);
      setActiveConfigSet(null);
      localStorage.removeItem('activeConfigSetId');
      throw error;
    }
  };

  const clearActive = () => {
    setActiveConfigSetId(null);
    setActiveConfigSet(null);
    localStorage.removeItem('activeConfigSetId');
  };

  const updateActiveConfig = async (config: any) => {
    if (!activeConfigSetId) return;

    try {
      await configSetsApi.update({
        id: activeConfigSetId,
        configuration: config,
      });
      // Refresh the config set data after update
      const updated = await configSetsApi.get(activeConfigSetId);
      setActiveConfigSet(updated);
    } catch (error) {
      throw error;
    }
  };

  return (
    <ActiveConfigSetContext.Provider
      value={{
        activeConfigSet,
        activeConfigSetId,
        setActive,
        clearActive,
        updateActiveConfig,
      }}
    >
      {children}
    </ActiveConfigSetContext.Provider>
  );
}

export function useActiveConfigSet() {
  const context = useContext(ActiveConfigSetContext);
  if (!context) {
    throw new Error('useActiveConfigSet must be used within an ActiveConfigSetProvider');
  }
  return context;
} 