import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ConfigSet, ConfigSetType, ComponentType } from '@/types/configSet';

interface ConfigSetFormProps {
  initialData?: ConfigSet;
  onSubmit: (data: Partial<ConfigSet>) => Promise<void>;
  onCancel: () => void;
}

export function ConfigSetForm({ initialData, onSubmit, onCancel }: ConfigSetFormProps) {
  const [formData, setFormData] = useState<Partial<ConfigSet>>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    type: initialData?.type || 'component',
    componentType: initialData?.componentType,
    configuration: initialData?.configuration || {},
    tags: initialData?.tags || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map((tag) => tag.trim()).filter(Boolean);
    setFormData((prev) => ({ ...prev, tags }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value: ConfigSetType) =>
            setFormData((prev) => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Full Configuration</SelectItem>
            <SelectItem value="component">Component Configuration</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.type === 'component' && (
        <div className="space-y-2">
          <Label htmlFor="componentType">Component Type</Label>
          <Select
            value={formData.componentType}
            onValueChange={(value: ComponentType) =>
              setFormData((prev) => ({ ...prev, componentType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select component type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tail_sampling">Tail Sampling</SelectItem>
              <SelectItem value="pipeline">Pipeline</SelectItem>
              <SelectItem value="collector">Collector</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags?.join(', ')}
          onChange={(e) => handleTagsChange(e.target.value)}
          placeholder="tag1, tag2, tag3"
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
} 