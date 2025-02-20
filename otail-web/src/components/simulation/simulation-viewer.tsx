'use client'

import { FC, useState } from 'react'
import { Editor } from '@monaco-editor/react';
import { Decision, defaultTrace } from '@/types/trace';
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { DecisionBadge } from "@/components/shared/decision-badge"
import { Button } from "../ui/button"
import { PlayCircle } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"
import { trackSampling } from '@/utils/analytics';



interface SimulationViewerProps {
  onChange: (value: string) => void;
  finalDecision: Decision;
}

export const SimulationViewer: FC<SimulationViewerProps> = ({
  onChange,
  finalDecision
}) => {

  const { theme } = useTheme();
  const [editorContent, setEditorContent] = useState(JSON.stringify(defaultTrace, null, 2));

  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      trackSampling.simulationRun();
      setEditorContent(value);
      onChange(value);
    }
  };

  const handleRunSimulation = () => {
    trackSampling.simulationRun();
    onChange(editorContent);
  };

  return (
    <Card className="h-full shadow-custom">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <DecisionBadge decision={finalDecision} />
          <Button
            onClick={handleRunSimulation}
            size="sm"
            variant="outline"
            className="gap-2 h-6"
          >
            <PlayCircle className="h-4 w-4" />
            Run
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col gap-4 h-full">
          <Editor
            height="calc(100vh - 300px)"
            value={editorContent}
            defaultLanguage="json"
            onChange={handleEditorChange}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              lineNumbers: "on",
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
