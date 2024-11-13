import React, { createContext, useContext, useState } from 'react';
import { TailSamplingConfig } from '../types/ConfigTypes';
import { Policy } from '../types/PolicyTypes';

interface ConfigContextType {
  config: TailSamplingConfig;
  updateConfig: (config: TailSamplingConfig) => void;
  addPolicy: (policy: Policy) => void;
  removePolicy: (index: number) => void;
  updatePolicy: (index: number, policy: Policy) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<TailSamplingConfig>({
    policies: [],
    decisionWait: 10,
    numTraces: 100,
  });

  const updateConfig = (newConfig: TailSamplingConfig) => setConfig(newConfig);
  
  const addPolicy = (policy: Policy) => {
    setConfig(prev => ({
      ...prev,
      policies: [...prev.policies, policy],
    }));
  };

  const removePolicy = (index: number) => {
    setConfig(prev => ({
      ...prev,
      policies: prev.policies.filter((_, i) => i !== index),
    }));
  };

  const updatePolicy = (index: number, policy: Policy) => {
    setConfig(prev => ({
      ...prev,
      policies: prev.policies.map((p, i) => i === index ? policy : p),
    }));
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig, addPolicy, removePolicy, updatePolicy }}>
      {children}
    </ConfigContext.Provider>
  );
}; 