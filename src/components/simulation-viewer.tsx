'use client'

import { FC } from 'react'
import { Editor } from '@monaco-editor/react';
import { Decision } from '@/types/trace';

interface SimulationViewerProps {
  value: string;
  onChange: (value: string) => void;
  finalDecision: Decision;
}

export const SimulationViewer: FC<SimulationViewerProps> = ({
  value,
  onChange,
  finalDecision
}) => {
  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    onChange(value);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="rounded-lg p-5 shadow-custom h-[calc(100vh-240px)] lg:h-[300px] md:h-[250px] md:p-3 w-full max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Decision: {Decision[finalDecision]} </h2>
        <Editor
          className='p-2 rounded-md bg-bg-secondary'
          height="100%"
          defaultLanguage="json"
          value={value}
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
    </div>
  );
};
