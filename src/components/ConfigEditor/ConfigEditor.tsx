import React, { useState } from 'react';
import { Policy, PolicyType } from '../../types/PolicyTypes';
import { TailSamplingConfig } from '../../types/ConfigTypes';
import { PolicyList } from '../PolicyList/PolicyList';
import { ConfigViewer } from '../ConfigViewer/ConfigViewer';
import { createNewPolicy } from '../../utils/policyUtils';
import { AddPolicyButton } from '../common/AddPolicyButton';
import { PolicySetsMenu } from '../PolicySets/PolicySetsMenu';
import { usePolicySets } from '../../context/PolicySetsContext';
import { EditableTitle } from '../common/EditableTitle';
import { Input } from '../common/Input';
import './ConfigEditor.css';
import { EvaluationResult } from '../../types/TraceTypes';

export const ConfigEditor: React.FC = () => {
  const [config, setConfig] = useState<TailSamplingConfig>({
    policies: [],
    decisionWait: 10,
    numTraces: 100,
  });
  const [policySetName, setPolicySetName] = useState('');
  const [evaluationResults, setEvaluationResults] = useState<Record<string, EvaluationResult>>();
  const { addPolicySet } = usePolicySets();

  const handleSavePolicySet = () => {
    if (policySetName.trim()) {
      addPolicySet(policySetName, config.policies);
      setPolicySetName(''); // Clear the input after saving
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

  const handleConfigSettingsChange = (
    field: keyof Pick<TailSamplingConfig, 'decisionWait' | 'numTraces'>,
    value: number
  ) => {
    setConfig(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="config-editor">
      <PolicySetsMenu onImportPolicies={handleImportPolicies} />
      <div className="config-settings">
        <div className="settings-header">
          <div className="header-content">
            <EditableTitle
              value={policySetName}
              onChange={setPolicySetName}
              placeholder="Enter policy set name"
            />
            <button 
              className="save-policy-button"
              onClick={handleSavePolicySet}
              disabled={!policySetName.trim()}
            >
              Save Policy Set
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h2>General Settings</h2>
          <p className="settings-description">
            Configure the general sampling settings that apply to all policies.
          </p>
          <div className="settings-grid">
            <Input
              label="Decision Wait"
              type="number"
              min="1"
              value={config.decisionWait}
              onChange={(e) => handleConfigSettingsChange('decisionWait', Number(e.target.value))}
              helpText="Time to wait for a trace to be completed (in seconds)"
            />
            <Input
              label="Number of Traces"
              type="number"
              min="1"
              value={config.numTraces}
              onChange={(e) => handleConfigSettingsChange('numTraces', Number(e.target.value))}
              helpText="Number of traces kept in memory"
            />
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