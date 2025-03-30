import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AgentGroup } from '@/types/deployment';
import type { Pipeline } from '@/types/pipeline';

interface AgentGroupFormProps {
  onSubmit: (data: Partial<AgentGroup>) => void;
  onCancel: () => void;
  pipelines: Pipeline[];
  agentGroup?: AgentGroup;
}

export function AgentGroupForm({ onSubmit, onCancel, pipelines, agentGroup }: AgentGroupFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    role: '',
    pipelineId: '',
  });

  useEffect(() => {
    if (agentGroup) {
      setFormData({
        name: agentGroup.name,
        description: agentGroup.description || '',
        role: agentGroup.role,
        pipelineId: agentGroup.pipelineId,
      });
    }
  }, [agentGroup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.role || !formData.pipelineId) {
      return;
    }

    onSubmit({
      ...formData,
      id: agentGroup?.id,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          placeholder="Enter agent group name"
          required
        />
        <p className="text-sm text-muted-foreground">
          A unique name for your agent group
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
          placeholder="Enter agent group description"
          className="resize-none"
        />
        <p className="text-sm text-muted-foreground">
          A brief description of your agent group
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="role" className="text-sm font-medium">
          Role
        </label>
        <Select onValueChange={(value) => handleSelectChange('role', value)} value={formData.role}>
          <SelectTrigger>
            <SelectValue placeholder="Select agent role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sidecar">Sidecar</SelectItem>
            <SelectItem value="gateway">Gateway</SelectItem>
            <SelectItem value="collector">Collector</SelectItem>
            <SelectItem value="processor">Processor</SelectItem>
            <SelectItem value="exporter">Exporter</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          The role of the agents in this group
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="configProfileId" className="text-sm font-medium">
          Configuration Set
        </label>
        <Select onValueChange={(value) => handleSelectChange('pipelineId', value)} value={formData.pipelineId}>
          <SelectTrigger>
            <SelectValue placeholder="Select pipeline" />
          </SelectTrigger>
          <SelectContent>
            {pipelines.map((pipeline) => (
              <SelectItem key={pipeline.id} value={pipeline.id}>
                {pipeline.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          The configuration set to apply to all agents in this group
        </p>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{agentGroup ? 'Update' : 'Create'} Agent Group</Button>
      </div>
    </form>
  );
} 