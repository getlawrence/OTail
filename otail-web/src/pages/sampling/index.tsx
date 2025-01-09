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
import { Policy, Recipe } from '@/types/policy'
import { useConfigState } from '@/hooks/use-config'

type Mode = 'Edit' | 'Test'

const PolicyActions = ({
  currentPolicies,
  onApplyRecipe
}: {
  currentPolicies: Policy[];
  onApplyRecipe: (recipe: any) => void;
}) => {
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
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
              <DropdownMenuItem>
                <span className="mr-2">📥</span>
                Import Recipe
              </DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuSeparator />
            <DialogTrigger asChild>
              <DropdownMenuItem>
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
              setRecipeDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ModeToggle = ({ mode, onToggleMode }: { mode: Mode; onToggleMode: () => void }) => (
  <div className="flex items-center space-x-2">
    <Button
      variant={mode === 'Edit' ? 'default' : 'outline'}
      size="sm"
      onClick={() => mode === 'Test' && onToggleMode()}
      className="px-3"
    >
      Edit
    </Button>
    <Button
      variant={mode === 'Test' ? 'default' : 'outline'}
      size="sm"
      onClick={() => mode === 'Edit' && onToggleMode()}
      className="px-3"
    >
      Test
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
                addPolicy={handleAddPolicy}
                updatePolicy={handleUpdatePolicy}
                removePolicy={handleRemovePolicy}
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
              onChange={handleViewerChange}
            />
          ) : (
            <SimulationViewer
              value={state.simulationData}
              onChange={handleViewerChange}
              finalDecision={state.finalDecision || 0}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigEditor;
