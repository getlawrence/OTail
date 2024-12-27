import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { ComponentSchema, SchemaField } from './componentSchemas';
import { Card } from '../ui/card';

interface DynamicFormProps {
  schema: ComponentSchema;
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

export const DynamicForm = ({ schema, values, onChange, errors = {} }: DynamicFormProps) => {
  const validateField = (field: SchemaField, value: any, path: string[]): string | null => {
    const fieldPath = path.join('.');
    
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

  const renderField = (
    fieldName: string,
    field: SchemaField,
    path: string[] = []
  ) => {
    const fullPath = [...path, fieldName];
    const fieldPath = fullPath.join('.');
    
    const getValue = (path: string[]) => {
      return path.reduce((obj, key) => {
        if (obj === undefined || obj === null) return undefined;
        return obj[key];
      }, values);
    };

    const value = getValue(fullPath) ?? field.default;
    const error = errors[fieldPath];

    const fieldWrapper = (children: React.ReactNode) => (
      <div key={fieldPath} className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
        {children}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );

    switch (field.type) {
      case 'object':
        if (!field.fields) return null;
        return fieldWrapper(
          <Card className="p-4">
            <div className="space-y-4">
              {Object.entries(field.fields).map(([subFieldName, subField]) =>
                renderField(subFieldName, subField, fullPath)
              )}
            </div>
          </Card>
        );

      case 'string':
        return fieldWrapper(
          <Input
            value={value || ''}
            onChange={(e) => {
              const newValue = e.target.value;
              onChange(fieldPath, newValue);
            }}
            placeholder={field.placeholder}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'number':
        return fieldWrapper(
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => {
              const newValue = e.target.value ? Number(e.target.value) : undefined;
              onChange(fieldPath, newValue);
            }}
            placeholder={field.placeholder}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'boolean':
        return (
          <div key={fieldPath} className="flex items-center justify-between">
            <label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Switch
              checked={value || false}
              onCheckedChange={(checked) => onChange(fieldPath, checked)}
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
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
