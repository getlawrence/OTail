'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Recipe } from '@/types/policy';
import { PREDEFINED_RECIPES } from '@/data/predefined-recipes';
import { trackRecipe } from '@/utils/analytics';

const RECIPES_KEY = 'recipes';
const PINNED_RECIPES_KEY = 'pinned_recipes';
const UNPINNED_PREDEFINED_KEY = 'unpinned_predefined';

interface RecipesContextType {
  recipes: Recipe[];
  pinnedRecipes: Recipe[];
  saveRecipe: (recipe: Recipe) => void;
  deleteRecipe: (recipeId: string) => void;
  pinRecipe: (recipe: Recipe) => void;
  unpinRecipe: (recipeId: string) => void;
  isPredefinedRecipe: (recipeId: string) => boolean;
}

const RecipesContext = createContext<RecipesContextType | undefined>(undefined);

export const RecipesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pinnedRecipes, setPinnedRecipes] = useState<Recipe[]>([]);
  const [unpinnedPredefinedIds, setUnpinnedPredefinedIds] = useState<string[]>([]);

  // Load all recipes on mount
  useEffect(() => {
    const savedRecipes = JSON.parse(localStorage.getItem(RECIPES_KEY) || '[]');
    const savedPinnedRecipes = JSON.parse(localStorage.getItem(PINNED_RECIPES_KEY) || '[]');
    const unpinnedIds = JSON.parse(localStorage.getItem(UNPINNED_PREDEFINED_KEY) || '[]');
    
    setRecipes(savedRecipes);
    setUnpinnedPredefinedIds(unpinnedIds);

    // Filter out unpinned predefined recipes
    const filteredPredefined = PREDEFINED_RECIPES.filter(r => !unpinnedIds.includes(r.id));
    const allPinnedRecipes = [...filteredPredefined, ...savedPinnedRecipes];
    setPinnedRecipes(allPinnedRecipes);
  }, []);

  const saveRecipe = (recipe: Recipe) => {
    const updatedRecipes = [...recipes, recipe];
    setRecipes(updatedRecipes);
    localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipes));
    trackRecipe.create(recipe.name);
  };

  const deleteRecipe = (recipeId: string) => {
    const updatedRecipes = recipes.filter(r => r.id !== recipeId);
    const recipe = recipes.find(r => r.id === recipeId);
    setRecipes(updatedRecipes);
    localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipes));
    if (recipe) {
      trackRecipe.delete(recipe.name);
    }
  };

  const pinRecipe = (recipe: Recipe) => {
    setPinnedRecipes(prev => {
      const isAlreadyPinned = prev.some(r => r.id === recipe.id);
      if (isAlreadyPinned) return prev;

      const updatedRecipes = [...prev, recipe];
      
      // Only save custom recipes to localStorage
      const customRecipes = updatedRecipes.filter(
        r => !PREDEFINED_RECIPES.some(pr => pr.id === r.id)
      );
      localStorage.setItem(PINNED_RECIPES_KEY, JSON.stringify(customRecipes));

      // If it's a predefined recipe, remove it from unpinned list
      if (isPredefinedRecipe(recipe.id)) {
        const updatedUnpinned = unpinnedPredefinedIds.filter(id => id !== recipe.id);
        setUnpinnedPredefinedIds(updatedUnpinned);
        localStorage.setItem(UNPINNED_PREDEFINED_KEY, JSON.stringify(updatedUnpinned));
      }

      trackRecipe.pin(recipe.name);
      return updatedRecipes;
    });
  };

  const unpinRecipe = (recipeId: string) => {
    setPinnedRecipes(prev => {
      const recipe = prev.find(r => r.id === recipeId);
      if (!recipe) return prev;

      const updatedRecipes = prev.filter(r => r.id !== recipeId);
      
      if (isPredefinedRecipe(recipeId)) {
        // For predefined recipes, add to unpinned list
        const updatedUnpinned = [...unpinnedPredefinedIds, recipeId];
        setUnpinnedPredefinedIds(updatedUnpinned);
        localStorage.setItem(UNPINNED_PREDEFINED_KEY, JSON.stringify(updatedUnpinned));
      } else {
        // For custom recipes, update pinned recipes storage
        const customRecipes = updatedRecipes.filter(
          r => !PREDEFINED_RECIPES.some(pr => pr.id === r.id)
        );
        localStorage.setItem(PINNED_RECIPES_KEY, JSON.stringify(customRecipes));
      }

      trackRecipe.unpin(recipe.name);
      return updatedRecipes;
    });
  };

  const isPredefinedRecipe = (recipeId: string) => 
    PREDEFINED_RECIPES.some(r => r.id === recipeId);

  const value = {
    recipes,
    pinnedRecipes,
    saveRecipe,
    deleteRecipe,
    pinRecipe,
    unpinRecipe,
    isPredefinedRecipe,
  };

  return (
    <RecipesContext.Provider value={value}>
      {children}
    </RecipesContext.Provider>
  );
};

export const useRecipes = () => {
  const context = useContext(RecipesContext);
  if (context === undefined) {
    throw new Error('useRecipes must be used within a RecipesProvider');
  }
  return context;
};
