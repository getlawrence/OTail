import React, { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { TailSamplingConfig } from '../../types/ConfigTypes';
import { generateYamlConfig } from '../../utils/configGenerator';
import { parseYamlConfig } from '../../utils/configParser';
import { useTheme } from '../../context/ThemeContext';
import { evaluatePolicy } from '../../utils/policyEvaluator';
import { Decision } from '../../types/TraceTypes';
import './ConfigViewer.css';

interface ConfigViewerProps {
  config: TailSamplingConfig;
  onConfigChange: (config: TailSamplingConfig) => void;
  onEvaluationResults?: (results: Record<string, Decision>) => void;
}

export const ConfigViewer: React.FC<ConfigViewerProps> = ({ 
  config, 
  onConfigChange,
  onEvaluationResults 
}) => {
  const { theme } = useTheme();
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [simulationData, setSimulationData] = useState('{\n  \n}');
  const yamlConfig = generateYamlConfig(config);

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    
    try {
      const parsedConfig = parseYamlConfig(value);
      if (parsedConfig.policies && Array.isArray(parsedConfig.policies)) {
        onConfigChange(parsedConfig);
      }
    } catch (error) {
      console.error('Failed to parse YAML:', error);
    }
  };

  const handleSimulationDataChange = (value: string | undefined) => {
    if (!value) return;
    setSimulationData(value);
  };

  const runSimulation = () => {
    try {
      const parsedData = JSON.parse(simulationData);
      const results: Record<string, Decision> = {};
      
      config.policies.forEach(policy => {
        results[policy.name] = evaluatePolicy(policy, parsedData);
      });
      
      onEvaluationResults?.(results);
    } catch (error) {
      console.error('Invalid trace data:', error);
    }
  };

  return (
    <div className="config-viewer">
      <div className="config-viewer-header">
        <div className="header-content">
          <h2>{isSimulationMode ? 'Test Configuration' : 'Configuration'}</h2>
          <div className="header-actions">
            {isSimulationMode && (
              <button 
                className="simulate-button"
                onClick={runSimulation}
              >
                Run Simulation
              </button>
            )}
            <button 
              className={`mode-toggle ${isSimulationMode ? 'active' : ''}`}
              onClick={() => setIsSimulationMode(!isSimulationMode)}
            >
              {isSimulationMode ? 'View Config' : 'Test Config'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="editor-container">
        <Editor
          height="calc(100vh - 200px)"
          defaultLanguage={isSimulationMode ? 'json' : 'yaml'}
          value={isSimulationMode ? simulationData : yamlConfig}
          onChange={isSimulationMode ? handleSimulationDataChange : handleEditorChange}
          theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
    </div>
  );
};