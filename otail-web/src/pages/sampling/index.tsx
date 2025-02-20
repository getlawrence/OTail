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
import { PinnedRecipes } from '@/components/policy/popular-policies';
import { Policy, PolicyType, Recipe } from '@/types/policy'
import { useConfigState } from '@/hooks/use-config-state';
import { trackSampling } from '@/utils/analytics';
import { Pencil, PlayCircle } from "lucide-react";
import { RecipesProvider } from '@/contexts/recipes-context';

type Mode = 'Edit' | 'Test'

const PolicyActions = ({
  currentPolicies,
  onApplyRecipe
}: {
  currentPolicies: Policy[];
  onApplyRecipe: (recipe: Recipe) => void;
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {mode === 'Edit' ? (
            <Pencil className="h-4 w-4" />
          ) : (
            <PlayCircle className="h-4 w-4" />
          )}
          {mode} Mode
          <span className="opacity-70">↓</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleModeChange('Edit')} className="gap-2">
          <Pencil className="h-4 w-4" />
          Edit Mode
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleModeChange('Test')} className="gap-2">
          <PlayCircle className="h-4 w-4" />
          Test Mode
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ConfigEditor = () => {
  const {
    policies,
    mode,
    evaluationResults,
    finalDecision,
    toggleMode,
    handleAddPolicy,
    handleUpdatePolicy,
    handleRemovePolicy,
    handleViewerChange,
    importPolicies
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

  const handlePopularPolicySelect = (recipe: Recipe) => {
    importPolicies(recipe.policies);
    trackSampling.policyBuilderAction('add_popular_recipe', recipe.name);
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    importPolicies(recipe.policies);
    trackSampling.policyBuilderAction('add_recipe', recipe.name);
  };

  const handleConfigChange = (config: any) => {
    try {
      handleViewerChange(config);
      
      // Only track simulation runs when we have simulation data
      if (mode === 'Test') {
        trackSampling.simulationRun(true, 1);
      }
    } catch (error) {
      console.error('Error in config change:', error);
      if (mode === 'Test') {
        trackSampling.simulationRun(false, 0);
      }
    }
  };

  return (
    <RecipesProvider>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex-1">
            <PinnedRecipes onSelect={handlePopularPolicySelect} />
          </div>
          <PolicyActions
            currentPolicies={policies}
            onApplyRecipe={handleRecipeSelect}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 flex-1">
          {/* Left Panel - Policy Editor */}
          <div className="flex flex-col h-full min-h-0">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-full overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-medium">Policy Builder</h2>
              </div>
              <div className="p-6 h-full overflow-auto">
                <PolicyBuilder
                  policies={policies}
                  addPolicy={handlePolicyAdd}
                  updatePolicy={handlePolicyUpdate}
                  removePolicy={handlePolicyRemove}
                  evaluationResult={evaluationResults}
                />
              </div>
            </div>
          </div>

          {/* Right Panel - Configuration/Simulation */}
          <div className="flex flex-col h-full min-h-0">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-full overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-medium">
                  {mode === 'Edit' ? 'Yaml Editor' : 'Test Sampling Rules'}
                </h2>
                <ModeToggle mode={mode} onToggleMode={toggleMode} />
              </div>
              <div className="p-4 h-full overflow-auto">
                {mode === 'Edit' ? (
                  <ConfigViewer 
                    policies={policies}
                    onChange={handleConfigChange}
                  />
                ) : (
                  <SimulationViewer
                    onChange={handleConfigChange}
                    finalDecision={finalDecision}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </RecipesProvider>
  );
};

export default ConfigEditor;
