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
import type { Deployment } from '@/types/deployment';

interface DeploymentFormProps {
  onSubmit: (data: Partial<Deployment>) => void;
  onCancel: () => void;
  deployment?: Deployment;
}

export function DeploymentForm({ onSubmit, onCancel, deployment }: DeploymentFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    environment: 'development',
  });

  useEffect(() => {
    if (deployment) {
      setFormData({
        name: deployment.name,
        description: deployment.description || '',
        environment: deployment.environment,
      });
    }
  }, [deployment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      return;
    }

    onSubmit({
      ...formData,
      id: deployment?.id,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, environment: value }));
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
          placeholder="Enter deployment name"
          required
        />
        <p className="text-sm text-muted-foreground">
          A unique name for your deployment
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
          placeholder="Enter deployment description"
          className="resize-none"
        />
        <p className="text-sm text-muted-foreground">
          A brief description of your deployment
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="environment" className="text-sm font-medium">
          Environment
        </label>
        <Select onValueChange={handleSelectChange} value={formData.environment}>
          <SelectTrigger>
            <SelectValue placeholder="Select environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="development">Development</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
            <SelectItem value="production">Production</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          The environment this deployment is for
        </p>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{deployment ? 'Update' : 'Create'} Deployment</Button>
      </div>
    </form>
  );
} 