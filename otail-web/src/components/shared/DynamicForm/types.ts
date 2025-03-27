export interface SchemaField {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'enum' | 'multiselect' | 'group';
  label: string;
  description?: string;
  required?: boolean;
  default?: any;
  placeholder?: string;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    custom?: (value: any) => string | null;
  };
  dependencies?: Array<{
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'notContains';
    value: any;
  }>;
  group?: {
    collapsible?: boolean;
    defaultCollapsed?: boolean;
  };
  array?: {
    itemType: 'string' | 'number' | 'object';
    fields?: Record<string, SchemaField>;
    preview?: boolean;
    maxItems?: number;
    minItems?: number;
    bulkAdd?: boolean;
  };
  fields?: Record<string, SchemaField>;
  options?: string[] | Array<{ label: string; value: string }>;
  multiselect?: {
    options: string[] | Array<{ label: string; value: string }>;
  };
  itemType?: 'string' | 'number' | 'object';
}

export interface DynamicFormProps {
  schema: Record<string, SchemaField>;
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}