import { useState, useEffect, createContext, useContext } from 'react';
import { configSetsApi } from '@/api/configSets';
import type { ConfigSet } from '@/types/configSet';

interface ActiveConfigSetContextType {
  activeConfigSet: ConfigSet | null;
  hasUnsavedChanges: boolean;
  setActive: (id: string) => Promise<void>;
  clearActive: () => void;
  updateActiveConfig: (config: any) => void;
  saveActiveConfig: () => Promise<void>;
}

const ActiveConfigSetContext = createContext<ActiveConfigSetContextType | null>(null);

export function ActiveConfigSetProvider({ children }: { children: React.ReactNode }) {
  const [activeConfigSet, setActiveConfigSet] = useState<ConfigSet | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load active config set from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('activeConfigSet');
    if (stored) {
      try {
        const configSet = JSON.parse(stored);
        setActiveConfigSet(configSet);
      } catch (error) {
        console.error('Failed to parse stored active config set:', error);
        localStorage.removeItem('activeConfigSet');
      }
    }
  }, []);

  const setActive = async (id: string) => {
    try {
      // Immediately set a partial active state
      setActiveConfigSet({
        id,
        name: 'Loading...',
        configuration: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
      });
      
      // Get the full config set data
      const configSet = await configSetsApi.get(id);
      
      // Update with complete data
      setActiveConfigSet(configSet);
      localStorage.setItem('activeConfigSet', JSON.stringify(configSet));
      setHasUnsavedChanges(false);
    } catch (error) {
      // If there's an error, clear the active state
      setActiveConfigSet(null);
      localStorage.removeItem('activeConfigSet');
      throw error;
    }
  };

  const clearActive = () => {
    setActiveConfigSet(null);
    setHasUnsavedChanges(false);
    localStorage.removeItem('activeConfigSet');
  };

  const updateActiveConfig = (config: any) => {
    if (activeConfigSet) {
      setActiveConfigSet({
        ...activeConfigSet,
        configuration: config,
      });
      setHasUnsavedChanges(true);
    }
  };

  const saveActiveConfig = async () => {
    if (!activeConfigSet) return;

    try {
      await configSetsApi.update({
        id: activeConfigSet.id,
        configuration: activeConfigSet.configuration,
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      throw error;
    }
  };

  return (
    <ActiveConfigSetContext.Provider
      value={{
        activeConfigSet,
        hasUnsavedChanges,
        setActive,
        clearActive,
        updateActiveConfig,
        saveActiveConfig,
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