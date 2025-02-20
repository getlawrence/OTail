import { useCallback, useEffect, useState } from 'react';
import { Recipe } from '@/types/policy';
import { PREDEFINED_RECIPES } from '@/data/predefined-recipes';

const PINNED_RECIPES_KEY = 'pinned_recipes';
const UNPINNED_PREDEFINED_KEY = 'unpinned_predefined';

export const usePinnedRecipes = () => {
  const [pinnedRecipes, setPinnedRecipes] = useState<Recipe[]>([]);
  const [unpinnedPredefinedIds, setUnpinnedPredefinedIds] = useState<string[]>([]);

  // Load pinned recipes and unpinned predefined recipes on mount
  useEffect(() => {
    const savedPinnedRecipes = JSON.parse(localStorage.getItem(PINNED_RECIPES_KEY) || '[]');
    const unpinnedIds = JSON.parse(localStorage.getItem(UNPINNED_PREDEFINED_KEY) || '[]');
    setUnpinnedPredefinedIds(unpinnedIds);

    // Filter out unpinned predefined recipes
    const filteredPredefined = PREDEFINED_RECIPES.filter(r => !unpinnedIds.includes(r.id));
    const allPinnedRecipes = [...filteredPredefined, ...savedPinnedRecipes];
    setPinnedRecipes(allPinnedRecipes);
  }, []);

  const pinRecipe = useCallback((recipe: Recipe) => {
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

      return updatedRecipes;
    });
  }, [unpinnedPredefinedIds]);

  const unpinRecipe = useCallback((recipeId: string) => {
    setPinnedRecipes(prev => {
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

      return updatedRecipes;
    });
  }, [unpinnedPredefinedIds]);

  const isPredefinedRecipe = useCallback((recipeId: string) => 
    PREDEFINED_RECIPES.some(r => r.id === recipeId), 
  []);

  return {
    pinnedRecipes,
    pinRecipe,
    unpinRecipe,
    isPredefinedRecipe
  };
};
