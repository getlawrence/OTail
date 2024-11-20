import React from 'react';
import { Editor } from '@monaco-editor/react';
import { TailSamplingConfig } from '../../types/ConfigTypes';
import { generateYamlConfig } from '../../utils/configGenerator';
import { parseYamlConfig } from '../../utils/configParser';
import { useTheme } from '../../context/ThemeContext';
import './ConfigViewer.css';

interface ConfigViewerProps {
  config: TailSamplingConfig;
  onConfigChange: (config: TailSamplingConfig) => void;
}

export const ConfigViewer: React.FC<ConfigViewerProps> = ({ config, onConfigChange }) => {
  const { theme } = useTheme();
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

  return (
    <div className="config-viewer">
      <div className="config-viewer-header">
        <h2>Configuration</h2>
      </div>
      <Editor
        height="calc(100vh - 200px)"
        defaultLanguage="yaml"
        value={yamlConfig}
        onChange={handleEditorChange}
        theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
};