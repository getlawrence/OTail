import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ConfigurationProfile } from '@/types/deployment';

interface ConfigurationProfileFormProps {
  onSubmit: (data: Partial<ConfigurationProfile>) => void;
  onCancel: () => void;
}

export function ConfigurationProfileForm({ onSubmit, onCancel }: ConfigurationProfileFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    configuration: {
      receivers: {
        otlp: {
          protocols: {
            grpc: {},
            http: {},
          },
        },
      },
      processors: {
        batch: {},
      },
      exporters: {
        otlp: {
          endpoint: 'localhost:4317',
        },
      },
      service: {
        pipelines: {
          traces: {
            receivers: ['otlp'],
            processors: ['batch'],
            exporters: ['otlp'],
          },
          metrics: {
            receivers: ['otlp'],
            processors: ['batch'],
            exporters: ['otlp'],
          },
          logs: {
            receivers: ['otlp'],
            processors: ['batch'],
            exporters: ['otlp'],
          },
        },
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      return;
    }

    onSubmit(formData);
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
          placeholder="Enter configuration profile name"
          required
        />
        <p className="text-sm text-muted-foreground">
          A unique name for your configuration profile
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
          placeholder="Enter configuration profile description"
          className="resize-none"
        />
        <p className="text-sm text-muted-foreground">
          A brief description of your configuration profile
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Default Configuration
        </label>
        <div className="p-4 bg-muted rounded-lg">
          <pre className="text-sm overflow-auto">
            {JSON.stringify(formData.configuration, null, 2)}
          </pre>
        </div>
        <p className="text-sm text-muted-foreground">
          This is a default OpenTelemetry configuration. You can edit it later.
        </p>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Profile</Button>
      </div>
    </form>
  );
} 