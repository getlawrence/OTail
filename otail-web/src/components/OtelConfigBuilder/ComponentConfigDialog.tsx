import { Node } from 'reactflow';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { PolicyBuilder } from '../policy-builder';
import { usePolicyConfig } from '@/hooks/use-config';
import { useState } from 'react';
import { ReceiverConfig, ProcessorConfig } from './types';
import { componentSchemas, ComponentType } from './componentSchemas';
import { DynamicForm } from './DynamicForm';

interface ComponentConfigDialogProps {
  node: Node;
  onClose: () => void;
  onConfigUpdate: (nodeId: string, config: ReceiverConfig | ProcessorConfig) => void;
}

export const ComponentConfigDialog = ({
  node,
  onClose,
  onConfigUpdate
}: ComponentConfigDialogProps) => {
  const {
    state,
    handleAddPolicy,
    handleUpdatePolicy,
    handleRemovePolicy,
  } = usePolicyConfig(node.data.config.policies);

  const [config, setConfig] = useState<Record<string, any>>(node.data.config || {});
  const [pipelineName, setPipelineName] = useState(node.data.pipelineName || 'default');

  const componentType = node.data.label.toLowerCase() as ComponentType;
  const schema = componentSchemas[componentType];

  const handleFieldChange = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateConfig = () => {
    if (!pipelineName.trim()) {
      return false;
    }

    if (schema) {
      for (const [fieldName, field] of Object.entries(schema.fields)) {
        if (field.required && !config[fieldName]) {
          return false;
        }
      }
    }

    return true;
  };

  const handleSave = () => {
    if (!validateConfig()) {
      return;
    }

    const updatedConfig = { ...config };

    if (node.data.label === 'tail_sampling') {
      updatedConfig.policies = state.config.policies;
    }

    onConfigUpdate(node.id, updatedConfig);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure {node.data.label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Pipeline Name</label>
            <input
              type="text"
              value={pipelineName}
              onChange={(e) => setPipelineName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter pipeline name"
            />
          </div>

          {schema && (
            <DynamicForm
              schema={schema}
              values={config}
              onChange={handleFieldChange}
            />
          )}

          {node.data.label === "tail_sampling" && (
            <PolicyBuilder
              policies={state.config.policies}
              addPolicy={handleAddPolicy}
              updatePolicy={handleUpdatePolicy}
              removePolicy={handleRemovePolicy}
            />
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};