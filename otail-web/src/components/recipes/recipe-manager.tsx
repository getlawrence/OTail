'use client'

import { FC, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Pin } from 'lucide-react';
import { Policy, Recipe } from '@/types/policy'
import { useRecipes } from '@/contexts/recipes-context';
import { trackRecipe } from '../../utils/analytics';
import { PinnedRecipes } from './pinned-recipes'

interface RecipeManagerProps {
  currentPolicies: Policy[]
  onApplyRecipe: (recipe: Recipe) => void
}

export const RecipeManager: FC<RecipeManagerProps> = ({ currentPolicies, onApplyRecipe }) => {
  const [newRecipeName, setNewRecipeName] = useState('')
  const [showNewRecipeInput, setShowNewRecipeInput] = useState(false)
  const { recipes, saveRecipe, deleteRecipe, pinRecipe, unpinRecipe, pinnedRecipes } = useRecipes();

  const handleSaveRecipe = () => {
    if (newRecipeName) {
      const newRecipe: Recipe = { 
        id: Date.now().toString(), 
        createdAt: new Date().toISOString(), 
        name: newRecipeName, 
        policies: currentPolicies 
      }
      saveRecipe(newRecipe);
      setNewRecipeName('');
      setShowNewRecipeInput(false);
      trackRecipe.create(newRecipeName);
    }
  }

  const handleApplyRecipe = (recipe: Recipe) => {
    onApplyRecipe(recipe);
    trackRecipe.apply(recipe.name);
  }

  const handlePinRecipe = (recipe: Recipe) => {
    pinRecipe(recipe);
    trackRecipe.pin(recipe.name);
  };

  const handleUnpinRecipe = (recipe: Recipe) => {
    unpinRecipe(recipe.id);
    trackRecipe.unpin(recipe.name);
  };

  return (
    <div className="space-y-6">
      <PinnedRecipes
        recipes={pinnedRecipes}
        onApplyRecipe={handleApplyRecipe}
        onUnpinRecipe={handleUnpinRecipe}
        onAddNewClick={() => setShowNewRecipeInput(true)}
      />
      
      {showNewRecipeInput && (
        <div className="flex space-x-2 px-2">
          <Input
            value={newRecipeName}
            onChange={(e) => setNewRecipeName(e.target.value)}
            placeholder="New recipe name"
            autoFocus
          />
          <Button onClick={handleSaveRecipe}>Save</Button>
          <Button variant="ghost" onClick={() => setShowNewRecipeInput(false)}>Cancel</Button>
        </div>
      )}

      <div className="px-2">
        <div className="flex items-center mb-3">
          <h3 className="text-sm font-medium">All Recipes</h3>
        </div>
        <ScrollArea className="h-[300px] pr-4">
          {recipes.filter(r => !pinnedRecipes.some(p => p.id === r.id)).map((recipe) => (
            <div key={recipe.id} className="flex justify-between items-center p-3 border rounded-lg mb-2 group hover:bg-accent">
              <span className="font-medium">{recipe.name}</span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handlePinRecipe(recipe)}
                >
                  <Pin className="h-4 w-4" />
                </Button>
                <Button variant="secondary" onClick={() => handleApplyRecipe(recipe)} size="sm">
                  Apply
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteRecipe(recipe.id)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  )
}
