import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { ComponentSchema } from './componentSchemas';

interface DynamicFormProps {
  schema: ComponentSchema;
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

export const DynamicForm = ({ schema, values, onChange }: DynamicFormProps) => {
  const renderField = (fieldName: string, field: ComponentSchema['fields'][string]) => {
    const value = values[fieldName] ?? field.default;

    switch (field.type) {
      case 'string':
        return (
          <div key={fieldName} className="space-y-2">
            <label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              value={value || ''}
              onChange={(e) => onChange(fieldName, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        );

      case 'number':
        return (
          <div key={fieldName} className="space-y-2">
            <label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type="number"
              value={value || ''}
              onChange={(e) => onChange(fieldName, Number(e.target.value))}
              placeholder={field.placeholder}
            />
          </div>
        );

      case 'boolean':
        return (
          <div key={fieldName} className="flex items-center justify-between">
            <label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Switch
              checked={value || false}
              onCheckedChange={(checked) => onChange(fieldName, checked)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(schema.fields).map(([fieldName, field]) =>
        renderField(fieldName, field)
      )}
    </div>
  );
};
