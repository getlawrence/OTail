import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ConfigSet } from '@/types/configSet';
import Editor from '@monaco-editor/react';
import yaml from 'js-yaml';
import { Eye, EyeOff } from 'lucide-react';

interface ConfigSetFormProps {
  initialData?: ConfigSet;
  onSubmit: (data: Partial<ConfigSet>) => Promise<void>;
  onCancel: () => void;
}

export function ConfigSetForm({ initialData, onSubmit, onCancel }: ConfigSetFormProps) {
  const [formData, setFormData] = useState<Partial<ConfigSet>>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    configuration: initialData?.configuration || {},
    tags: initialData?.tags || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showYaml, setShowYaml] = useState(false);

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

  const getYamlValue = () => {
    try {
      return yaml.dump(formData, {
        indent: 2,
        lineWidth: -1,
      });
    } catch (error) {
      console.error('Error converting to YAML:', error);
      return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowYaml(!showYaml)}
          className="flex items-center gap-2"
        >
          {showYaml ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showYaml ? 'Hide YAML' : 'Show YAML'}
        </Button>
      </div>

      {showYaml ? (
        <div className="h-[400px] border rounded-md overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="yaml"
            value={getYamlValue()}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              fontSize: 14,
              lineNumbers: 'on',
            }}
          />
        </div>
      ) : (
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
      )}
    </div>
  );
} 