'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ConfigViewer } from '@/components/simulation/config-viewer'
import { SimulationViewer } from '@/components/simulation/simulation-viewer'
import { PolicyBuilder } from '@/components/policy/policy-builder'
import { RecipeManager } from '@/components/recipes/recipe-manager'
import { Policy, Recipe } from '../types/policy'
import { useConfigState } from '@/hooks/use-config'

type Mode = 'Edit' | 'Test'

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
