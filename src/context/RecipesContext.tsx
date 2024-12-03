import React, { createContext, useContext, useState, useEffect } from 'react';
import { Policy, Recipe } from '../types/PolicyTypes';

interface RecipesContextType {
  recipes: Recipe[];
  addRecipe: (name: string, policies: Policy[]) => void;
  removeRecipe: (id: string) => void;
  importRecipe: (recipe: Recipe) => void;
}

const RecipesContext = createContext<RecipesContextType | undefined>(undefined);

export const RecipesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('recipes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  }, [recipes]);

  const addRecipe = (name: string, policies: Policy[]) => {
    const newRecipe: Recipe = {
      id: Date.now().toString(),
      name,
      policies,
      createdAt: new Date().toISOString(),
    };
    setRecipes([...recipes, newRecipe]);
  };

  const removeRecipe = (id: string) => {
    setRecipes(recipes.filter(set => set.id !== id));
  };

  const importRecipe = (recipe: Recipe) => {
    setRecipes([...recipes, { ...recipe, id: Date.now().toString() }]);
  };

  return (
    <RecipesContext.Provider value={{ recipes, addRecipe, removeRecipe, importRecipe }}>
      {children}
    </RecipesContext.Provider>
  );
};

export const useRecipes = () => {
  const context = useContext(RecipesContext);
  if (!context) {
    throw new Error('useRecipes must be used within a RecipesProvider');
  }
  return context;
};
