import React, { createContext, useContext, useState, useEffect } from 'react';
import { Policy, PolicySet } from '../types/PolicyTypes';

interface PolicySetsContextType {
  policySets: PolicySet[];
  addPolicySet: (name: string, policies: Policy[]) => void;
  removePolicySet: (id: string) => void;
  importPolicySet: (policySet: PolicySet) => void;
}

const PolicySetsContext = createContext<PolicySetsContextType | undefined>(undefined);

export const PolicySetsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [policySets, setPolicySets] = useState<PolicySet[]>(() => {
    const saved = localStorage.getItem('policySets');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('policySets', JSON.stringify(policySets));
  }, [policySets]);

  const addPolicySet = (name: string, policies: Policy[]) => {
    const newPolicySet: PolicySet = {
      id: Date.now().toString(),
      name,
      policies,
      createdAt: new Date().toISOString(),
    };
    setPolicySets([...policySets, newPolicySet]);
  };

  const removePolicySet = (id: string) => {
    setPolicySets(policySets.filter(set => set.id !== id));
  };

  const importPolicySet = (policySet: PolicySet) => {
    setPolicySets([...policySets, { ...policySet, id: Date.now().toString() }]);
  };

  return (
    <PolicySetsContext.Provider value={{ policySets, addPolicySet, removePolicySet, importPolicySet }}>
      {children}
    </PolicySetsContext.Provider>
  );
};

export const usePolicySets = () => {
  const context = useContext(PolicySetsContext);
  if (!context) {
    throw new Error('usePolicySets must be used within a PolicySetsProvider');
  }
  return context;
};
