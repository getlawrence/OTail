import React, { useState } from 'react';
import { Policy, PolicyType } from '../../types/PolicyTypes';
import { TailSamplingConfig } from '../../types/ConfigTypes';
import { PolicyList } from '../PolicyList/PolicyList';
import { ConfigViewer } from '../ConfigViewer/ConfigViewer';
import { createNewPolicy } from '../../utils/policyUtils';
import { AddPolicyButton } from '../common/AddPolicyButton';
import './ConfigEditor.css';

export const ConfigEditor: React.FC = () => {
  const [config, setConfig] = useState<TailSamplingConfig>({
    policies: [],
    decisionWait: 10,
    numTraces: 100,
  });

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
      <div className="config-editor-left">
        <div className="config-settings">
          <h2>General Settings</h2>
          <div className="settings-grid">
            <div className="form-field">
              <label htmlFor="decisionWait">Decision Wait (seconds)</label>
              <input
                id="decisionWait"
                type="number"
                min="1"
                value={config.decisionWait}
                onChange={(e) => handleConfigSettingsChange('decisionWait', Number(e.target.value))}
              />
            </div>
            <div className="form-field">
              <label htmlFor="numTraces">Number of Traces</label>
              <input
                id="numTraces"
                type="number"
                min="1"
                value={config.numTraces}
                onChange={(e) => handleConfigSettingsChange('numTraces', Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="policies-section">
          <div className="policies-header">
            <h2>Sampling Policies</h2>
            <AddPolicyButton onSelectPolicy={handleAddPolicy} />
          </div>

          <PolicyList
            policies={config.policies}
            onUpdatePolicy={handleUpdatePolicy}
            onRemovePolicy={handleRemovePolicy}
          />
        </div>
      </div>

      <div className="config-editor-right">
        <ConfigViewer config={config} onConfigChange={setConfig} />
      </div>
    </div>
  );
}; 