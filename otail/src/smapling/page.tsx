'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ConfigViewer } from '../components/config-viewer'
import { SimulationViewer } from '../components/simulation-viewer'
import { PolicyBuilder } from '../components/policy-builder'
import { RecipeManager } from '../components/recipe-manager'
import { TailSamplingConfig } from '../types/tailsampling'
import { Policy, PolicyType, Recipe } from '../types/policy'
import { createNewPolicy } from '../lib/policy/utils'
import { Decision } from '../types/trace'
import { parseYamlConfig } from '../lib/config/parser'
import { makeDecision } from '../lib/policy/evaluator'
import { buildPolicy } from '../lib/policy/builder'

type Mode = 'Edit' | 'Test';

interface ConfigState {
  config: TailSamplingConfig;
  simulationData: string;
  mode: Mode;
  finalDecision: Decision;
  evaluationResults?: Record<string, Decision>;
}

const useConfigState = () => {
  const [state, setState] = useState<ConfigState>({
    config: { policies: [] },
    simulationData: '',
    mode: 'Edit',
    finalDecision: Decision.NotSampled,
    evaluationResults: undefined,
  });

  const toggleMode = useCallback(() => {
    setState(prev => ({ ...prev, mode: prev.mode === 'Edit' ? 'Test' : 'Edit' }));
  }, []);

  const updatePolicies = useCallback((newPolicies: Policy[]) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, policies: newPolicies },
    }));
  }, []);

  const handleAddPolicy = useCallback((type: PolicyType) => {
    setState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        policies: [...prev.config.policies, createNewPolicy(type)],
      },
    }));
  }, []);

  const handleUpdatePolicy = useCallback((index: number, updatedPolicy: Policy) => {
    setState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        policies: prev.config.policies.map((policy, i) =>
          i === index ? updatedPolicy : policy
        ),
      },
    }));
  }, []);

  const handleRemovePolicy = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        policies: prev.config.policies.filter((_, i) => i !== index),
      },
    }));
  }, []);

  const handleViewerChange = useCallback((value: string) => {
    if (state.mode === 'Test') {
      try {
        const parsedData = JSON.parse(value);
        const decision = makeDecision(parsedData, state.config.policies.map(buildPolicy));
        setState(prev => ({
          ...prev,
          evaluationResults: decision.policyDecisions,
          finalDecision: decision.finalDecision,
        }));
      } catch (error) {
        console.error('Invalid trace data:', error);
      }
    } else {
      try {
        const parsedConfig = parseYamlConfig(value);
        if (parsedConfig.policies && Array.isArray(parsedConfig.policies)) {
          setState(prev => ({ ...prev, config: parsedConfig }));
        }
      } catch (error) {
        console.error('Failed to parse YAML:', error);
      }
    }
  }, [state.mode, state.config.policies]);

  return {
    state,
    toggleMode,
    updatePolicies,
    handleAddPolicy,
    handleUpdatePolicy,
    handleRemovePolicy,
    handleViewerChange,
  };
};

const Header = ({ mode, onToggleMode, onApplyRecipe, currentPolicies }: {
  mode: Mode;
  onToggleMode: () => void;
  onApplyRecipe: (recipe: any) => void;
  currentPolicies: Policy[]
}) => (
  <div className="flex justify-between items-center p-4 border-b">
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='default' className="mr-4">Manage Recipes</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recipe Manager</DialogTitle>
        </DialogHeader>
        <RecipeManager
          currentPolicies={currentPolicies}
          onApplyRecipe={onApplyRecipe}
        />
      </DialogContent>
    </Dialog>
    <Button variant="secondary" onClick={onToggleMode} className="px-4 py-2">
      Switch to {mode === 'Edit' ? 'Test' : 'Edit'} Mode
    </Button>
  </div>
);

const ConfigEditor = () => {
  const {
    state,
    toggleMode,
    updatePolicies,
    handleAddPolicy,
    handleUpdatePolicy,
    handleRemovePolicy,
    handleViewerChange,
  } = useConfigState();

  const [loading, setLoading] = useState(false);

  const handleToggleMode = () => {
    setLoading(true);
    toggleMode();
    setLoading(false);
  };

  useEffect(() => {
    // Optional: Add any side effects or cleanup here
  }, [state.mode]);

  return (
    <div className="flex flex-col h-screen">
      <Header
        mode={state.mode}
        onToggleMode={handleToggleMode}
        onApplyRecipe={(recipe: Recipe) => {
          setLoading(true);
          updatePolicies(recipe.policies);
          setLoading(false);
        }}
        currentPolicies={state.config.policies}
      />

      {loading && <div className="loading-indicator">Loading...</div>}

      <div className="flex flex-1 overflow-hidden transition-all duration-300">
        <div className="flex-1 p-4 border-r">
          <PolicyBuilder
            policies={state.config.policies}
            addPolicy={handleAddPolicy}
            updatePolicy={handleUpdatePolicy}
            removePolicy={handleRemovePolicy}
            evaluationResult={state.evaluationResults}
          />
        </div>
        <div className="flex-1 p-4">
          {state.mode === 'Edit' ? (
            <ConfigViewer
              config={state.config}
              onChange={handleViewerChange}
            />
          ) : (
            <SimulationViewer
              value={state.simulationData}
              onChange={handleViewerChange}
              finalDecision={state.finalDecision}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigEditor;
