'use client'

import { useState, useEffect, FC } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Policy, Recipe } from '@/types/policy'
import { trackRecipe } from '../../utils/analytics';

interface RecipeManagerProps {
  currentPolicies: Policy[]
  onApplyRecipe: (recipe: any) => void
}

export const RecipeManager: FC<RecipeManagerProps> = ({ currentPolicies, onApplyRecipe }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [newRecipeName, setNewRecipeName] = useState('')

  useEffect(() => {
    const savedRecipes = JSON.parse(localStorage.getItem('recipes') || '[]')
    setRecipes(savedRecipes)
  }, [])

  const saveRecipe = () => {
    if (newRecipeName) {
      const newRecipe: Recipe = { id: Date.now().toString(), createdAt: new Date().toISOString(), name: newRecipeName, policies: currentPolicies }
      const updatedRecipes = [...recipes, newRecipe]
      setRecipes(updatedRecipes)
      localStorage.setItem('recipes', JSON.stringify(updatedRecipes))
      setNewRecipeName('')
      trackRecipe.create(newRecipeName);
    }
  }

  const deleteRecipe = (index: number) => {
    const recipe = recipes[index];
    const updatedRecipes = recipes.filter((_, i) => i !== index)
    setRecipes(updatedRecipes)
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes))
    trackRecipe.delete(recipe.name);
  }

  const handleApplyRecipe = (recipe: Recipe) => {
    onApplyRecipe(recipe);
    trackRecipe.apply(recipe.name);
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          value={newRecipeName}
          onChange={(e) => setNewRecipeName(e.target.value)}
          placeholder="New recipe name"
        />
        <Button onClick={saveRecipe}>Save Current</Button>
      </div>
      <ScrollArea className="h-[300px]">
        {recipes.map((recipe, index) => (
          <div key={index} className="flex justify-between items-center p-2 border-b">
            <span>{recipe.name}</span>
            <div>
              <Button variant="outline" onClick={() => handleApplyRecipe(recipe)} className="mr-2">
                Apply
              </Button>
              <Button variant="destructive" onClick={() => deleteRecipe(index)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}
