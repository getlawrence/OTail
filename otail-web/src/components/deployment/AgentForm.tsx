import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Agent } from '@/types/deployment';
import type { Pipeline } from '@/types/deployment';
import { PipelineSelector } from '@/components/pipeline/PipelineSelector';

interface AgentFormProps {
  onSubmit: (data: Partial<Agent>) => void;
  onCancel: () => void;
  pipelines: Pipeline[];
  agent?: Agent;
}

export function AgentForm({ onSubmit, onCancel, pipelines, agent }: AgentFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pipelineId: undefined as string | undefined,
  });

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        description: agent.description || '',
        pipelineId: agent.pipelineId,
      });
    }
  }, [agent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      return;
    }

    onSubmit({
      ...formData,
      id: agent?.id,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter agent name"
          required
        />
        <p className="text-sm text-muted-foreground">
          A unique name for your agent
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter agent description"
          className="resize-none"
        />
        <p className="text-sm text-muted-foreground">
          A brief description of your agent
        </p>
      </div>

      <PipelineSelector
        pipelines={pipelines}
        selectedPipelineId={formData.pipelineId}
        onSelect={(pipelineId) => setFormData(prev => ({ ...prev, pipelineId }))}
        level="agent"
      />

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{agent ? 'Update' : 'Create'} Agent</Button>
      </div>
    </form>
  );
} 