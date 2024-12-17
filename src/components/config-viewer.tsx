'use client'

import { FC } from 'react'
import { Editor } from '@monaco-editor/react';
import { TailSamplingConfig } from '@/types/tailsampling';
import { generateYamlConfig } from '@/lib/config/generator';

interface ConfigViewerProps {
  config: TailSamplingConfig;
  onChange: (value: string) => void;
}

export const ConfigViewer: FC<ConfigViewerProps> = ({ config, onChange }) => {
  const editorValue = generateYamlConfig(config);

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    onChange(value);
  };

  return (
    <div className="rounded-lg p-5 shadow-custom h-[calc(100vh-140px)] lg:h-[400px] md:h-[300px] md:p-3 w-full max-w-5xl mx-auto">
      <Editor
        className='p-2 rounded-md bg-bg-secondary'
        height="calc(100vh - 200px)"
        defaultLanguage="yaml"
        value={editorValue}
        onChange={handleEditorChange}
        theme='vs-dark'
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  )
}