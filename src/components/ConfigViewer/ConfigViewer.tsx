import React, { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { TailSamplingConfig } from '../../types/ConfigTypes';
import { generateYamlConfig } from '../../utils/configGenerator';
import { parseYamlConfig } from '../../utils/configParser';
import { useTheme } from '../../context/ThemeContext';
import { useMode } from '../../context/ModeContext';
import { makeDecision } from '../../utils/policyEvaluator';
import { Decision } from '../../types/TraceTypes';
import './ConfigViewer.css';
import { buildPolicy } from '../../utils/policyBuilder';

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
  const { mode } = useMode();
  const [simulationData, setSimulationData] = useState('{\n  \n}');
  const [finalDecision, SetfinalDecision] = useState<Decision>(Decision.NotSampled);
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
      const decision = makeDecision(parsedData, config.policies.map(buildPolicy));
      onEvaluationResults?.(decision.policyDecisions);
      SetfinalDecision(decision.finalDecision);
    } catch (error) {
      console.error('Invalid trace data:', error);
    }
  };

  return (
    <div className="config-viewer">
      <div className="config-viewer-header">
        <div className="header-content">
          <h2>
            {mode === 'Test' ? (
              <>
                Decision: <span className={finalDecision === Decision.Sampled ? 'sampled' : 'not-sampled'}>
                  {Decision[finalDecision]}
                </span>
              </>
            ) : (
              'Configuration'
            )}
          </h2>
          <div className="header-actions">
            {mode === 'Test' && (
              <button
                className="simulate-button"
                onClick={runSimulation}
              >
                Run Simulation
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="editor-container">
        <Editor
          height="calc(100vh - 200px)"
          defaultLanguage={mode === 'Test' ? 'json' : 'yaml'}
          value={mode === 'Test' ? simulationData : yamlConfig}
          onChange={mode === 'Test' ? handleSimulationDataChange : handleEditorChange}
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