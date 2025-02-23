'use client'

import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pin, PinOff, Plus } from 'lucide-react';
import { Recipe } from '@/types/policy';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useRecipes } from '@/contexts/recipes-context';

interface PinnedRecipesProps {
  onSelect: (recipe: Recipe) => void;
}

export const PinnedRecipes: FC<PinnedRecipesProps> = ({ onSelect }) => {
  const { pinnedRecipes, unpinRecipe, isPredefinedRecipe } = useRecipes();

  const handleUnpin = (recipe: Recipe, e: React.MouseEvent) => {
    e.stopPropagation();
    unpinRecipe(recipe.id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {pinnedRecipes.map((recipe) => (
        <Card 
          key={recipe.id}
          className="p-4 hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium truncate">{recipe.name}</h4>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={(e) => handleUnpin(recipe, e)}
                  >
                    <PinOff className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Unpin Recipe</TooltipContent>
              </Tooltip>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => onSelect(recipe)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{recipe.policies.length} {recipe.policies.length === 1 ? 'policy' : 'policies'}</span>
            {isPredefinedRecipe(recipe.id) && (
              <span className="flex items-center gap-1">
                <Pin className="h-3 w-3" />
                Predefined
              </span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
