import React from 'react';
import { Editor } from '@monaco-editor/react';
import { TailSamplingConfig } from '../../types/ConfigTypes';
import { generateYamlConfig } from '../../utils/configGenerator';
import './ConfigViewer.css';

interface ConfigViewerProps {
  config: TailSamplingConfig;
}

export const ConfigViewer: React.FC<ConfigViewerProps> = ({ config }) => {
  const yamlConfig = generateYamlConfig(config);

  return (
    <div className="config-viewer">
      <div className="config-viewer-header">
        <h2>Generated Configuration</h2>
      </div>
      <Editor
        height="calc(100vh - 200px)"
        defaultLanguage="yaml"
        value={yamlConfig}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          theme: 'vs-light',
        }}
      />
    </div>
  );
}; 