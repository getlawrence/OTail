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
import { Badge } from "@/components/ui/badge"
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

  return (
    <Card className="h-full shadow-custom">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Sampling Decision:</CardTitle>
          <Badge 
            variant="outline" 
            className={cn(
              "px-4 py-1 text-sm font-medium",
              finalDecision === Decision.Sampled 
                ? "border-green-500/50 bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-500" 
                : "border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
            )}
          >
            {Decision[finalDecision]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-4rem)]">
        <Editor
          height="100%"
          defaultValue={value || JSON.stringify(defaultTrace, null, 2)}
          defaultLanguage="json"
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
  );
};
