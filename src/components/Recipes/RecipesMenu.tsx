import React, { useState } from 'react';
import { useRecipes } from '../../context/RecipesContext';
import './RecipesMenu.css';
import { Policy } from '../../types/PolicyTypes';

interface RecipesMenuProps {
  onImportPolicies: (policies: Policy[]) => void;
}

export const RecipesMenu: React.FC<RecipesMenuProps> = ({ onImportPolicies }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { recipes, removeRecipe } = useRecipes();

  return (
    <div className={`policy-sets-menu ${isExpanded ? 'expanded' : ''}`}>
      <button 
        className={`toggle-button ${isExpanded ? 'hidden' : ''}`}
        onClick={() => setIsExpanded(true)}
        aria-label="Expand menu"
      >
        <span className="arrow">→</span>
      </button>
      
      <div className="menu-content">
        {isExpanded && (
          <button 
            className="close-button"
            onClick={() => setIsExpanded(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
        <div className="menu-header">
          <h3>Saved Recipes</h3>
        </div>
        <div className="policy-sets-list">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="policy-set-item">
              <h4 className="policy-set-name">{recipe.name}</h4>
              <span className="policy-count">
                {recipe.policies.length} {recipe.policies.length === 1 ? 'policy' : 'policies'}
              </span>
              <div className="policy-set-actions">
                <button
                  className="import-button"
                  onClick={() => onImportPolicies(recipe.policies)}
                >
                  +
                </button>
                <button
                  className="set-remove-button"
                  onClick={() => removeRecipe(recipe.id)}
                  aria-label="Remove recipe"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
