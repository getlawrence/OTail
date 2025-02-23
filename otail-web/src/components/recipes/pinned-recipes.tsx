import { FC } from 'react';
import { Recipe } from '@/types/policy';
import { Button } from '@/components/ui/button';
import { Pin, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinnedRecipesProps {
  recipes: Recipe[];
  onApplyRecipe: (recipe: Recipe) => void;
  onUnpinRecipe: (recipe: Recipe) => void;
  onAddNewClick: () => void;
}

export const PinnedRecipes: FC<PinnedRecipesProps> = ({
  recipes,
  onApplyRecipe,
  onUnpinRecipe,
  onAddNewClick,
}) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center mb-3 px-2">
        <Pin className="h-4 w-4 mr-2 text-muted-foreground" />
        <h3 className="text-sm font-medium">Pinned Recipes</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 px-2">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="group flex-none relative bg-card hover:bg-accent rounded-lg border p-3 min-w-[200px] max-w-[250px]"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <h4 className="font-medium truncate pr-6">{recipe.name}</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                  onClick={() => onUnpinRecipe(recipe)}
                >
                  <Pin className="h-3 w-3 fill-current" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                {recipe.policies?.length || 0} policies
              </div>
              <Button
                variant="secondary"
                className="w-full mt-1"
                size="sm"
                onClick={() => onApplyRecipe(recipe)}
              >
                Apply
              </Button>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          className={cn(
            "flex-none min-w-[200px] h-[104px] border-dashed",
            !recipes.length && "w-full"
          )}
          onClick={onAddNewClick}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Recipe
        </Button>
      </div>
    </div>
  );
};
