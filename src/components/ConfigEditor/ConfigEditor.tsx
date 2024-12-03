import React, { useState } from 'react';
import { Policy, PolicyType } from '../../types/PolicyTypes';
import { TailSamplingConfig } from '../../types/ConfigTypes';
import { PolicyList } from '../PolicyList/PolicyList';
import { ConfigViewer } from '../ConfigViewer/ConfigViewer';
import { createNewPolicy } from '../../utils/policyUtils';
import { AddPolicyButton } from '../common/AddPolicyButton';
import { RecipesMenu } from '../Recipes/RecipesMenu';
import { useRecipes } from '../../context/RecipesContext';
import { EditableTitle } from '../common/EditableTitle';
import './ConfigEditor.css';
import { Decision } from '../../types/TraceTypes';

export const ConfigEditor: React.FC = () => {
  const [config, setConfig] = useState<TailSamplingConfig>({
    policies: [],
  });
  const [recipeName, setRecipeName] = useState('');
  const [evaluationResults, setEvaluationResults] = useState<Record<string, Decision>>();
  const { addRecipe } = useRecipes();

  const handleSaveRecipe = () => {
    if (recipeName.trim()) {
      addRecipe(recipeName, config.policies);
      setRecipeName(''); // Clear the input after saving
    }
  };

  const handleImportPolicies = (policies: Policy[]) => {
    setConfig(prev => ({
      ...prev,
      policies: [...prev.policies, ...policies],
    }));
  };

  const handleAddPolicy = (type: PolicyType) => {
    setConfig(prev => ({
      ...prev,
      policies: [...prev.policies, createNewPolicy(type)],
    }));
  };

  const handleUpdatePolicy = (index: number, updatedPolicy: Policy) => {
    setConfig(prev => ({
      ...prev,
      policies: prev.policies.map((policy, i) => 
        i === index ? updatedPolicy : policy
      ),
    }));
  };

  const handleRemovePolicy = (index: number) => {
    setConfig(prev => ({
      ...prev,
      policies: prev.policies.filter((_, i) => i !== index),
    }));
  };
  

  return (
    <div className="config-editor">
      <RecipesMenu onImportPolicies={handleImportPolicies} />
      <div className="config-settings">
        <div className="settings-header">
          <div className="header-content">
            <EditableTitle
              value={recipeName}
              onChange={setRecipeName}
              placeholder="Enter recipe name"
            />
            <button 
              className="save-policy-button"
              onClick={handleSaveRecipe}
              disabled={!recipeName.trim()}
            >
              Save Recipe
            </button>
          </div>
        </div>
        <div className="settings-section policies-section">
          <div className="policies-header">
            <h2>Sampling Policies</h2>
            <AddPolicyButton onSelectPolicy={handleAddPolicy} />
          </div>
          <p className="settings-description">
            Add and configure sampling policies to determine which traces to sample.
          </p>
          <PolicyList
            policies={config.policies}
            onUpdatePolicy={handleUpdatePolicy}
            onRemovePolicy={handleRemovePolicy}
            evaluationResult={evaluationResults}
          />
        </div>
      </div>

      <ConfigViewer 
        config={config} 
        onConfigChange={setConfig}
        onEvaluationResults={setEvaluationResults}
      />
    </div>
  );
}; 