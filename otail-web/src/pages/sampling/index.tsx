'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfigViewer } from '@/components/simulation/config-viewer'
import { SimulationViewer } from '@/components/simulation/simulation-viewer'
import { PolicyBuilder } from '@/components/policy/policy-builder'
import { RecipeDialog } from '@/components/recipes/recipe-dialog'
import { PinnedRecipes } from '@/components/policy/popular-policies';
import { Policy, PolicyType, Recipe } from '@/types/policy'
import { useConfigState } from '@/hooks/use-config-state';
import { trackSampling } from '@/utils/analytics';
import { Pencil, PlayCircle, Plus } from "lucide-react";
import { RecipesProvider } from '@/contexts/recipes-context';
import { ConfigSetActions } from '@/components/config/ConfigSetActions';

type Mode = 'Edit' | 'Test'

const PolicyActions = ({
  currentPolicies,
  onApplyRecipe
}: {
  currentPolicies: Policy[];
  onApplyRecipe: (recipe: Recipe) => void;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handlePolicyAction = () => {
    setDialogOpen(true);
    trackSampling.policyAction('manage_recipes');
  };

  return (
    <>
      <div className="h-full">
        <Card
          onClick={handlePolicyAction}
          className="h-full rounded-xl border-dashed bg-card text-card-foreground shadow p-4 hover:bg-accent/50 transition-colors flex items-center justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
        </Card>
      </div>
      <RecipeDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        currentPolicies={currentPolicies}
        onApplyRecipe={(recipe) => {
          onApplyRecipe(recipe);
          trackSampling.policyAction('apply_recipe');
          setDialogOpen(false);
        }}
      />
    </>
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
    importPolicies,
    updatePolicies,
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

  const handleConfigImport = (configuration: any) => {
    if (Array.isArray(configuration.policies)) {
      updatePolicies(configuration.policies);
      trackSampling.policyBuilderAction('import_config_set', '');
    }
  };

  return (
    <RecipesProvider>
      <div className="h-full flex flex-col">
        <div className="mb-6 shrink-0">
          <h3 className="text-sm font-medium mb-3">Pinned Recipes</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 h-full pinned-recipes">
              <div className="h-full">
                <PinnedRecipes onSelect={handlePopularPolicySelect} />
              </div>
            </div>
            <div className="md:col-span-1 h-full policy-actions">
              <div className="h-full">
                <PolicyActions
                  currentPolicies={policies}
                  onApplyRecipe={handleRecipeSelect}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 flex-1">
          {/* Left Panel - Policy Editor */}
          <div className="flex flex-col h-full min-h-0">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-full overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b bg-muted/5">
                <div>
                  <h2 className="text-lg font-medium">Policy Builder</h2>
                  <p className="text-sm text-muted-foreground">Configure your sampling policies</p>
                </div>
                <ConfigSetActions
                  type="policy"
                  getCurrentState={() => ({ policies })}
                  onImport={handleConfigImport}
                />
              </div>
              <div className="p-6 h-full overflow-auto policy-builder">
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
              <div className="flex items-center justify-between p-4 border-b bg-muted/5">
                <div>
                  <h2 className="text-lg font-medium">
                    {mode === 'Edit' ? 'YAML Configuration' : 'Validate Sampling Rules with OTEL Data'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {mode === 'Edit'
                      ? 'Edit your configuration in YAML format'
                      : 'Test and validate your sampling rules'
                    }
                  </p>
                </div>
                <div className="mode-toggle">
                  <ModeToggle mode={mode} onToggleMode={toggleMode} />
                </div>
              </div>
              <div className="p-4 h-full overflow-auto config-viewer">
                {mode === 'Edit' ? (
                  <ConfigViewer
                    policies={policies}
                    onChange={handleViewerChange}
                  />
                ) : (
                  <SimulationViewer
                    finalDecision={finalDecision}
                    onChange={handleViewerChange}
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
