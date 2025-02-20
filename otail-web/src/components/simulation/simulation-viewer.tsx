'use client'

import { FC } from 'react'
import { Editor } from '@monaco-editor/react';
import { Decision, defaultTrace } from '@/types/trace';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DecisionBadge } from "@/components/shared/decision-badge"
import { Button } from "../ui/button"
import { PlayCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/use-theme"



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
  const { theme } = useTheme();
  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      onChange(value);
    }
  };

  const handleRunSimulation = () => {
    onChange(value || JSON.stringify(defaultTrace, null, 2));
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
            value={value || JSON.stringify(defaultTrace, null, 2)}
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
