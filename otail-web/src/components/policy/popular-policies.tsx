'use client'

import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Recipe } from '@/types/policy';
import { PREDEFINED_RECIPES } from '@/data/predefined-recipes';

interface PopularPoliciesProps {
  onSelect: (recipe: Recipe) => void;
}

export const PopularPolicies: FC<PopularPoliciesProps> = ({ onSelect }) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-3">Popular Recipes</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {PREDEFINED_RECIPES.map((recipe) => (
          <Card 
            key={recipe.id}
            className="p-4 hover:bg-accent cursor-pointer transition-colors"
            onClick={() => onSelect(recipe)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{recipe.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {recipe.policies.length} {recipe.policies.length === 1 ? 'policy' : 'policies'}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
