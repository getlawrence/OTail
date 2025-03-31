import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pipeline } from '@/types/deployment';

interface PipelineSelectorProps {
  pipelines: Pipeline[];
  selectedPipelineId?: string;
  onSelect: (pipelineId: string | undefined) => void;
  level: 'deployment' | 'agent-group' | 'agent';
}

export function PipelineSelector({
  pipelines,
  selectedPipelineId,
  onSelect,
  level,
}: PipelineSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId);
  const INHERIT_VALUE = '__inherit__';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Pipeline Configuration</h4>
          <p className="text-sm text-muted-foreground">
            {level === 'deployment' && 'Configuration applied to all agents in this deployment'}
            {level === 'agent-group' && 'Configuration applied to all agents in this group'}
            {level === 'agent' && 'Configuration specific to this agent'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
        >
          {selectedPipeline ? 'Change Pipeline' : 'Select Pipeline'}
        </Button>
      </div>

      {selectedPipeline && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{selectedPipeline.name}</Badge>
          <p className="text-sm text-muted-foreground">
            {selectedPipeline.description || 'No description'}
          </p>
        </div>
      )}

      <Select
        open={isOpen}
        onOpenChange={setIsOpen}
        value={selectedPipelineId || INHERIT_VALUE}
        onValueChange={(value) => {
          onSelect(value === INHERIT_VALUE ? undefined : value);
          setIsOpen(false);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a pipeline configuration" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={INHERIT_VALUE}>No pipeline (inherit from parent)</SelectItem>
          {pipelines.map((pipeline) => (
            <SelectItem key={pipeline.id} value={pipeline.id}>
              <div className="flex flex-col">
                <span>{pipeline.name}</span>
                <span className="text-xs text-muted-foreground">
                  {pipeline.description || 'No description'}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 