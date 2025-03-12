export interface SchemaField {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'enum' | 'multiselect';
  label: string;
  required?: boolean;
  default?: any;
  placeholder?: string;
  fields?: Record<string, SchemaField>;
  itemType?: 'string' | 'number' | 'boolean' | 'object';
  options?: string[];
}

export interface DynamicFormProps {
  schema: Record<string, SchemaField>;
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}