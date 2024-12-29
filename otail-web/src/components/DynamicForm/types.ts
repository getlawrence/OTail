export interface SchemaField {
  type: 'string' | 'number' | 'boolean' | 'object';
  label: string;
  required?: boolean;
  default?: any;
  placeholder?: string;
  fields?: Record<string, SchemaField>;
}

export interface DynamicFormProps {
  schema: Record<string, SchemaField>;
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}