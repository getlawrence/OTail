'use client'

import { FC, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Pin } from 'lucide-react';
import { Policy, Recipe } from '@/types/policy'
import { useRecipes } from '@/contexts/recipes-context';
import { trackRecipe } from '../../utils/analytics';

interface RecipeManagerProps {
  currentPolicies: Policy[]
  onApplyRecipe: (recipe: Recipe) => void
}

export const RecipeManager: FC<RecipeManagerProps> = ({ currentPolicies, onApplyRecipe }) => {
  const [newRecipeName, setNewRecipeName] = useState('')
  const { recipes, saveRecipe, deleteRecipe, pinRecipe, pinnedRecipes } = useRecipes();

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
      trackRecipe.create(newRecipeName);
    }
  }

  const handleApplyRecipe = (recipe: Recipe) => {
    onApplyRecipe(recipe);
    trackRecipe.apply(recipe.name);
  }

  const isPinned = (recipe: Recipe) => {
    return pinnedRecipes.some(r => r.id === recipe.id);
  };

  const handlePinRecipe = (recipe: Recipe) => {
    pinRecipe(recipe);
    trackRecipe.pin(recipe.name);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          value={newRecipeName}
          onChange={(e) => setNewRecipeName(e.target.value)}
          placeholder="New recipe name"
        />
        <Button onClick={handleSaveRecipe}>Save Current</Button>
      </div>
      <ScrollArea className="h-[300px]">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="flex justify-between items-center p-2 border-b">
            <span>{recipe.name}</span>
            <div>
              {!isPinned(recipe) && (
                <Button 
                  variant="outline" 
                  size="icon"
                  className="mr-2"
                  onClick={() => handlePinRecipe(recipe)}
                >
                  <Pin className="h-4 w-4" />
                </Button>
              )}
              <Button variant="outline" onClick={() => handleApplyRecipe(recipe)} className="mr-2">
                Apply
              </Button>
              <Button variant="destructive" onClick={() => deleteRecipe(recipe.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}
