'use client'

import { FC } from 'react'
import { Editor } from '@monaco-editor/react';
import { TailSamplingConfig } from '@/types/tailsampling';
import { generateYamlConfig } from '@/lib/config/generator';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/hooks/use-theme';

interface ConfigViewerProps {
  config: TailSamplingConfig;
  onChange: (value: string) => void;
}

export const ConfigViewer: FC<ConfigViewerProps> = ({ config, onChange }) => {
  const { theme } = useTheme();

  const editorValue = generateYamlConfig(config);

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    onChange(value);
  };

  return (
    <Card className="h-full shadow-custom">
      <CardContent className="p-0 h-[calc(100%-4rem)]">
        <Editor
          height="100%"
          defaultLanguage="yaml"
          value={editorValue}
          onChange={handleEditorChange}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
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