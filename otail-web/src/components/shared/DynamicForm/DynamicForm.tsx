import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { SchemaField, DynamicFormProps } from "./types";

// Field-specific components
const FieldWrapper = ({
  fieldPath,
  field,
  error,
  children,
}: {
  fieldPath: string;
  field: SchemaField;
  error?: string;
  children: React.ReactNode;
}) => (
  <div key={fieldPath} className="space-y-2">
    <div className="flex justify-between">
      <label className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
    </div>
    {children}
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

const ObjectField = ({
  fieldPath,
  field,
  errors,
  renderField,
}: {
  fieldPath: string;
  field: SchemaField;
  value: any;
  onChange: (path: string, value: any) => void;
  errors: Record<string, string>;
  renderField: (name: string, field: SchemaField, path: string[]) => React.ReactNode;
}) => {
  if (!field.fields) return null;
  const path = fieldPath.split('.');

  return (
    <FieldWrapper fieldPath={fieldPath} field={field} error={errors[fieldPath]}>
      <Card className="p-4">
        <div className="space-y-4">
          {Object.entries(field.fields).map(([subFieldName, subField], index) =>
            <React.Fragment key={index}>
              {renderField(subFieldName, subField, path)}
            </React.Fragment>
          )}
        </div>
      </Card>
    </FieldWrapper>
  );
};

const StringField = ({
  fieldPath,
  field,
  value,
  onChange,
  error,
}: {
  fieldPath: string;
  field: SchemaField;
  value: any;
  onChange: (path: string, value: any) => void;
  error?: string;
}) => (
  <FieldWrapper fieldPath={fieldPath} field={field} error={error}>
    <Input
      value={value || ''}
      onChange={(e) => onChange(fieldPath, e.target.value)}
      placeholder={field.placeholder}
      className={error ? 'border-red-500' : ''}
    />
  </FieldWrapper>
);

const NumberField = ({
  fieldPath,
  field,
  value,
  onChange,
  error,
}: {
  fieldPath: string;
  field: SchemaField;
  value: any;
  onChange: (path: string, value: any) => void;
  error?: string;
}) => (
  <FieldWrapper fieldPath={fieldPath} field={field} error={error}>
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
  </FieldWrapper>
);

const BooleanField = ({
  fieldPath,
  field,
  value,
  onChange,
  error,
}: {
  fieldPath: string;
  field: SchemaField;
  value: any;
  onChange: (path: string, value: any) => void;
  error?: string;
}) => (
  <div key={fieldPath} className="flex items-center justify-between">
    <label className="text-sm font-medium">
      {field.label}
      {field.required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <Switch
      checked={value || false}
      onCheckedChange={(checked) => onChange(fieldPath, checked)}
    />
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
);

const EnumField = ({
  fieldPath,
  field,
  value,
  onChange,
  error,
}: {
  fieldPath: string;
  field: SchemaField;
  value: any;
  onChange: (path: string, value: any) => void;
  error?: string;
}) => (
  <FieldWrapper fieldPath={fieldPath} field={field} error={error}>
    <Select
      value={value || ''}
      onValueChange={(value) => onChange(fieldPath, value)}
    >
      <SelectTrigger className={error ? 'border-red-500' : ''}>
        <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
      </SelectTrigger>
      <SelectContent>
        {field.options?.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </FieldWrapper>
);

const MultiSelectField = ({
  fieldPath,
  field,
  value,
  onChange,
  error,
}: {
  fieldPath: string;
  field: SchemaField;
  value: any;
  onChange: (path: string, value: any) => void;
  error?: string;
}) => {
  const selectedValues = Array.isArray(value) ? value : [];

  const toggleValue = (option: string) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option];
    onChange(fieldPath, newValues);
  };

  return (
    <FieldWrapper fieldPath={fieldPath} field={field} error={error}>
      <Card className="p-3">
        <div className="space-y-2">
          {field.options?.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`${fieldPath}-${option}`}
                checked={selectedValues.includes(option)}
                onCheckedChange={() => toggleValue(option)}
              />
              <label
                htmlFor={`${fieldPath}-${option}`}
                className="text-sm cursor-pointer"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      </Card>
    </FieldWrapper>
  );
};

const ArrayField = ({
  fieldPath,
  field,
  value,
  onChange,
  error,
  renderField,
}: {
  fieldPath: string;
  field: SchemaField;
  value: any;
  onChange: (path: string, value: any) => void;
  error?: string;
  renderField: (name: string, field: SchemaField, path: string[]) => React.ReactNode;
}) => {
  const items = Array.isArray(value) ? value : [];

  const addItem = () => {
    const newItems = [...items, null];
    onChange(fieldPath, newItems);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(fieldPath, newItems);
  };

  const updateItem = (index: number, newValue: any) => {
    const newItems = [...items];
    newItems[index] = newValue;
    onChange(fieldPath, newItems);
  };

  // We don't need this function as we're directly using field.itemType
  // But keeping the comment for future reference if needed

  return (
    <FieldWrapper fieldPath={fieldPath} field={field} error={error}>
      <Card className="p-4">
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1">
                {field.itemType === 'object' && field.fields ? (
                  <Card className="p-3">
                    <div className="space-y-3">
                      {Object.entries(field.fields).map(([subFieldName, subField]) => (
                        <div key={subFieldName}>
                          {renderField(
                            subFieldName,
                            subField,
                            [`${fieldPath}`, `${index}`]
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                ) : (
                  <div>
                    {field.itemType === 'string' && (
                      <Input
                        value={item || ''}
                        onChange={(e) => updateItem(index, e.target.value)}
                        placeholder={field.placeholder}
                      />
                    )}
                    {field.itemType === 'number' && (
                      <Input
                        type="number"
                        value={item || ''}
                        onChange={(e) => updateItem(index, e.target.value ? Number(e.target.value) : null)}
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                className="h-8 w-8 text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addItem}
            className="w-full mt-2"
          >
            <Plus size={16} className="mr-1" />
            Add Item
          </Button>
        </div>
      </Card>
    </FieldWrapper>
  );
};

// Value helper
const getValue = (path: string[], values: any) => {
  return path.reduce((obj, key) => {
    if (obj === undefined || obj === null) return undefined;
    return obj[key];
  }, values);
};

export const DynamicForm = ({ schema, values, onChange, errors = {} }: DynamicFormProps) => {
  const renderField = (
    fieldName: string,
    field: SchemaField,
    path: string[] = []
  ): React.ReactNode => {
    const fullPath = [...path, fieldName];
    const fieldPath = fullPath.join('.');
    const value = getValue(fullPath, values) ?? field.default;
    const error = errors[fieldPath];

    const props = {
      fieldPath,
      field,
      value,
      onChange,
      error,
    };

    switch (field.type) {
      case 'object':
        return (
          <ObjectField
            {...props}
            errors={errors}
            renderField={renderField}
          />
        );
      case 'string':
        return <StringField {...props} />;
      case 'number':
        return <NumberField {...props} />;
      case 'boolean':
        return <BooleanField {...props} />;
      case 'enum':
        return <EnumField {...props} />;
      case 'multiselect':
        return <MultiSelectField {...props} />;
      case 'array':
        return (
          <ArrayField
            {...props}
            renderField={renderField}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(schema).map(([fieldName, field], index) =>
        <React.Fragment key={index}>
          {renderField(fieldName, field)}
        </React.Fragment>
      )}
    </div>
  );
};
