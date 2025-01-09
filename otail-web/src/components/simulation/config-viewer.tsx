'use client'

import { FC } from 'react'
import { Editor } from '@monaco-editor/react';
import { TailSamplingConfig } from '@/types/tailsampling';
import { generateYamlConfig } from '@/lib/config/generator';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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
    <Card className="h-full shadow-custom">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Configuration</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-4rem)]">
        <Editor
          height="100%"
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
      </CardContent>
    </Card>
  )
}