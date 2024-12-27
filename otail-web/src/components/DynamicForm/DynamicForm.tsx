import React from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
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
  value,
  onChange,
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
