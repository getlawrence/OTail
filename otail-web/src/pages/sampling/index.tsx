'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfigViewer } from '@/components/simulation/config-viewer'
import { SimulationViewer } from '@/components/simulation/simulation-viewer'
import { PolicyBuilder } from '@/components/policy/policy-builder'
import { RecipeManager } from '@/components/recipes/recipe-manager'
import { Policy, PolicyType } from '@/types/policy'
import { useConfigState } from '@/hooks/use-config'
import { trackSampling } from '@/utils/analytics';

type Mode = 'Edit' | 'Test'

const PolicyActions = ({
  currentPolicies,
  onApplyRecipe
}: {
  currentPolicies: Policy[];
  onApplyRecipe: (recipe: any) => void;
}) => {
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);

  const handlePolicyAction = (action: string) => {
    trackSampling.policyAction(action);
    if (action === 'import_recipe' || action === 'save_recipe') {
      setRecipeDialogOpen(true);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={recipeDialogOpen} onOpenChange={setRecipeDialogOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <span>Actions</span>
              <span className="opacity-70">↓</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DialogTrigger asChild>
              <DropdownMenuItem onClick={() => handlePolicyAction('import_recipe')}>
                <span className="mr-2">📥</span>
                Import Recipe
              </DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuSeparator />
            <DialogTrigger asChild>
              <DropdownMenuItem onClick={() => handlePolicyAction('save_recipe')}>
                <span className="mr-2">💾</span>
                Save as Recipe
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recipe Manager</DialogTitle>
          </DialogHeader>
          <RecipeManager
            currentPolicies={currentPolicies}
            onApplyRecipe={(recipe) => {
              onApplyRecipe(recipe);
              trackSampling.policyAction('apply_recipe');
              setRecipeDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ModeToggle = ({ mode, onToggleMode }: { mode: Mode; onToggleMode: () => void }) => {
  const handleModeChange = (newMode: Mode) => {
    if (mode !== newMode) {
      trackSampling.modeChange(mode, newMode);
      onToggleMode();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={mode === 'Edit' ? 'default' : 'outline'}
        size="sm"
        onClick={() => mode === 'Test' && handleModeChange('Edit')}
        className="px-3"
      >
        Edit
      </Button>
      <Button
        variant={mode === 'Test' ? 'default' : 'outline'}
        size="sm"
        onClick={() => mode === 'Edit' && handleModeChange('Test')}
        className="px-3"
      >
        Test
      </Button>
    </div>
  );
};

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

  // Enhanced handlers with tracking
  const handlePolicyAdd = (policy: PolicyType) => {
    handleAddPolicy(policy);
    trackSampling.policyBuilderAction('add', policy);
  };

  const handlePolicyUpdate = (index: number, updatedPolicy: Policy) => {
    handleUpdatePolicy(index, updatedPolicy);
    trackSampling.policyBuilderAction('update', updatedPolicy.type);
  };

  const handlePolicyRemove = (index: number, policy: Policy) => {
    handleRemovePolicy(index);
    trackSampling.policyBuilderAction('remove', policy.type);
  };

  const handleConfigChange = (config: any) => {
    handleViewerChange(config);
    if ('simulationData' in config) {
      trackSampling.simulationRun(
        config.finalDecision !== undefined,
        config.simulationData?.length || 0
      );
    } else {
      trackSampling.configChange('config_updated');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Policy Builder</h1>
        <div className="flex items-center gap-4">
          <PolicyActions
            currentPolicies={state.config.policies}
            onApplyRecipe={updatePolicies}
          />
          <ModeToggle mode={state.mode} onToggleMode={toggleMode} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 flex-1">
        {/* Left Panel - Policy Editor */}
        <div className="flex flex-col h-full min-h-0">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-full overflow-hidden">
            <div className="p-6 h-full overflow-auto">
              <PolicyBuilder
                policies={state.config.policies}
                addPolicy={handlePolicyAdd}
                updatePolicy={handlePolicyUpdate}
                removePolicy={handlePolicyRemove}
                evaluationResult={state.evaluationResults}
              />
            </div>
          </div>
        </div>

        {/* Right Panel - Configuration/Simulation */}
        <div className="flex flex-col h-full min-h-0">
          {state.mode === 'Edit' ? (
            <ConfigViewer
              config={state.config}
              onChange={handleConfigChange}
            />
          ) : (
            <SimulationViewer
              value={state.simulationData}
              onChange={handleConfigChange}
              finalDecision={state.finalDecision || 0}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigEditor;
