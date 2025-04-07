import { Node } from 'reactflow';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PolicyBuilder } from '@/components/policy/policy-builder';
import { usePolicyState } from '@/hooks/use-policy-state';
import { useState } from 'react';
import { ReceiverConfig, ProcessorConfig } from '../types';
import { componentSchemas } from './componentSchemas';
import { DynamicForm } from '@/components/shared/DynamicForm';
import { createNewPolicy } from '@/lib/policy/utils';

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
    policies,
    addPolicy: handleAddPolicy,
    updatePolicy: handleUpdatePolicy,
    removePolicy: handleRemovePolicy,
  } = usePolicyState(node.data.config?.policies || []);

  const [config, setConfig] = useState<Record<string, any>>(node.data.config || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [componentName] = node.data.label.toLowerCase().split('/');
  const componentType = node.data.type;
  const schema = componentSchemas[componentType][componentName];
  const isTailSampling = componentType === 'tail_sampling';

  const handleFieldChange = (field: string, value: any) => {
    setConfig(prev => {
      // Handle nested fields
      const fieldPath = field.split('.');
      const newConfig = { ...prev };

      let current = newConfig;
      for (let i = 0; i < fieldPath.length - 1; i++) {
        const key = fieldPath[i];
        if (!current[key] || typeof current[key] !== 'object') {
          current[key] = {};
        }
        current = current[key];
      }
      current[fieldPath[fieldPath.length - 1]] = value;

      return newConfig;
    });

    // Clear error when field is changed
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateField = (field: any, value: any, path: string[] = []): string | null => {
    if (field.required && (value === undefined || value === null || value === '')) {
      return `${field.label} is required`;
    }

    if (field.type === 'object' && field.fields) {
      for (const [subFieldName, subField] of Object.entries(field.fields)) {
        const subValue = value?.[subFieldName];
        const error = validateField(subField, subValue, [...path, subFieldName]);
        if (error) return error;
      }
    }

    return null;
  };

  const validateConfig = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (schema) {
      for (const [fieldName, field] of Object.entries(schema.fields)) {
        const error = validateField(field, config[fieldName], [fieldName]);
        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (validateConfig()) {
      const updatedConfig = {
        ...config,
      };

      if (isTailSampling) {
        updatedConfig.policies = policies;
      }

      onConfigUpdate(node.id, updatedConfig);
      onClose();
    }
  };
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure {node.data.label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {schema && (
            <DynamicForm
              schema={{ ...schema.fields }}
              values={config}
              onChange={handleFieldChange}
              errors={errors}
            />
          )}

          {isTailSampling && (
            <PolicyBuilder
              policies={policies}
              addPolicy={(type) => handleAddPolicy(createNewPolicy(type))}
              updatePolicy={handleUpdatePolicy}
              removePolicy={handleRemovePolicy}
            />
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};