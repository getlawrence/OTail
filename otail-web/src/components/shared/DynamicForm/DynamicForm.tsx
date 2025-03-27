import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ChevronDown, ChevronRight, GripVertical, Upload } from "lucide-react";
import { SchemaField, DynamicFormProps } from "./types";
import type { DropResult, DroppableProvided, DraggableProvided } from "react-beautiful-dnd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

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
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={14} className="text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{field.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
    {children}
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

const GroupField = ({
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
  const [isCollapsed, setIsCollapsed] = useState<boolean>(Boolean(field.group?.defaultCollapsed));

  if (!field.fields) return null;
  const path = fieldPath.split('.');

  const content = (
    <Card className="p-4">
      <div className="space-y-4">
        {Object.entries(field.fields).map(([subFieldName, subField], index) => (
          <React.Fragment key={index}>
            {renderField(subFieldName, subField, path)}
          </React.Fragment>
        ))}
      </div>
    </Card>
  );

  if (!field.group?.collapsible) {
    return (
      <FieldWrapper fieldPath={fieldPath} field={field} error={errors[fieldPath]}>
        {content}
      </FieldWrapper>
    );
  }

  return (
    <FieldWrapper fieldPath={fieldPath} field={field} error={errors[fieldPath]}>
      <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
        <CollapsibleTrigger className="flex items-center gap-2 w-full text-sm font-medium text-muted-foreground hover:text-foreground">
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          {field.label}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          {content}
        </CollapsibleContent>
      </Collapsible>
    </FieldWrapper>
  );
};

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
      <Card className="p-4 border-l-4 border-l-primary/20 bg-muted/5">
        <div className="space-y-4">
          {Object.entries(field.fields).map(([subFieldName, subField], index) => (
            <React.Fragment key={index}>
              {renderField(subFieldName, subField, path)}
            </React.Fragment>
          ))}
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
}) => {
  const options = field.options?.map(option => 
    typeof option === 'string' ? { label: option, value: option } : option
  ) || [];

  return (
    <FieldWrapper fieldPath={fieldPath} field={field} error={error}>
      <Select
        value={value || ''}
        onValueChange={(value) => onChange(fieldPath, value)}
      >
        <SelectTrigger className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
};

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
  const options = field.multiselect?.options.map(option => 
    typeof option === 'string' ? { label: option, value: option } : option
  ) || [];

  const toggleValue = (optionValue: string) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];
    onChange(fieldPath, newValues);
  };

  return (
    <FieldWrapper fieldPath={fieldPath} field={field} error={error}>
      <Card className="p-3">
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${fieldPath}-${option.value}`}
                checked={selectedValues.includes(option.value)}
                onCheckedChange={() => toggleValue(option.value)}
              />
              <label
                htmlFor={`${fieldPath}-${option.value}`}
                className="text-sm cursor-pointer"
              >
                {option.label}
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
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [bulkInput, setBulkInput] = useState('');

  const addItem = () => {
    if (field.array?.maxItems && items.length >= field.array.maxItems) {
      return;
    }
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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    onChange(fieldPath, newItems);
  };

  const handleBulkAdd = () => {
    if (!bulkInput.trim()) return;

    const newItems = [...items];
    const values = bulkInput.split('\n').map(line => line.trim()).filter(Boolean);
    
    values.forEach(value => {
      if (field.array?.maxItems && newItems.length >= field.array.maxItems) {
        return;
      }
      newItems.push(value);
    });

    onChange(fieldPath, newItems);
    setBulkInput('');
  };

  const renderItem = (item: any, index: number) => {
    if (field.array?.itemType === 'object' && field.array.fields) {
      return (
        <Card className="p-3 border-l-4 border-l-primary/20 bg-muted/5">
          <div className="space-y-3">
            {Object.entries(field.array.fields).map(([subFieldName, subField]) => (
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
      );
    }

    return (
      <div>
        {field.array?.itemType === 'string' && (
          <Input
            value={item || ''}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder={field.placeholder}
          />
        )}
        {field.array?.itemType === 'number' && (
          <Input
            type="number"
            value={item || ''}
            onChange={(e) => updateItem(index, e.target.value ? Number(e.target.value) : null)}
            placeholder={field.placeholder}
          />
        )}
      </div>
    );
  };

  return (
    <FieldWrapper fieldPath={fieldPath} field={field} error={error}>
      <Card className="p-4">
        <div className="space-y-4">
          {field.array?.preview && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {items.length} items
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
              >
                {isPreviewMode ? 'Edit' : 'Preview'}
              </Button>
            </div>
          )}

          {isPreviewMode ? (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="text-sm p-2 bg-muted rounded border-l-4 border-l-primary/20">
                  {JSON.stringify(item)}
                </div>
              ))}
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId={fieldPath}>
                {(provided: DroppableProvided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {items.map((item, index) => (
                      <Draggable key={index} draggableId={`${fieldPath}-${index}`} index={index}>
                        {(provided: DraggableProvided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center gap-2 group"
                          >
                            <div {...provided.dragHandleProps} className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                              <GripVertical size={16} className="text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              {renderItem(item, index)}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                              className="h-8 w-8 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {field.array?.bulkAdd && (
            <div className="space-y-2">
              <Textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="Enter values (one per line)"
                className="h-24"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkAdd}
                className="w-full"
              >
                <Upload size={16} className="mr-2" />
                Bulk Add
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={addItem}
            className="w-full mt-2"
            disabled={Boolean(field.array?.maxItems && items.length >= field.array.maxItems)}
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateField = (field: SchemaField, value: any, path: string): string | null => {
    if (field.required && (value === undefined || value === null || value === '')) {
      return `${field.label} is required`;
    }

    if (field.validation) {
      if (field.validation.pattern && typeof value === 'string') {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          return `${field.label} does not match the required pattern`;
        }
      }

      if (field.validation.min !== undefined && typeof value === 'number') {
        if (value < field.validation.min) {
          return `${field.label} must be at least ${field.validation.min}`;
        }
      }

      if (field.validation.max !== undefined && typeof value === 'number') {
        if (value > field.validation.max) {
          return `${field.label} must be at most ${field.validation.max}`;
        }
      }

      if (field.validation.custom) {
        const error = field.validation.custom(value);
        if (error) return error;
      }
    }

    return null;
  };

  const handleFieldChange = (field: string, value: any) => {
    onChange(field, value);

    // Validate field
    const fieldSchema = schema[field];
    if (fieldSchema) {
      const error = validateField(fieldSchema, value, field);
      setValidationErrors(prev => ({
        ...prev,
        [field]: error || ''
      }));
    }
  };

  const renderField = (
    fieldName: string,
    field: SchemaField,
    path: string[] = []
  ): React.ReactNode => {
    const fullPath = [...path, fieldName];
    const fieldPath = fullPath.join('.');
    const value = getValue(fullPath, values) ?? field.default;
    const error = errors[fieldPath] || validationErrors[fieldPath];

    // Check dependencies
    if (field.dependencies) {
      const shouldShow = field.dependencies.every(dep => {
        const depValue = getValue(dep.field.split('.'), values);
        switch (dep.operator) {
          case 'equals':
            return depValue === dep.value;
          case 'notEquals':
            return depValue !== dep.value;
          case 'contains':
            return Array.isArray(depValue) && depValue.includes(dep.value);
          case 'notContains':
            return Array.isArray(depValue) && !depValue.includes(dep.value);
          default:
            return true;
        }
      });

      if (!shouldShow) return null;
    }

    const props = {
      fieldPath,
      field,
      value,
      onChange: handleFieldChange,
      error,
    };

    switch (field.type) {
      case 'group':
        return (
          <GroupField
            {...props}
            errors={errors}
            renderField={renderField}
          />
        );
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
      {Object.entries(schema).map(([fieldName, field], index) => (
        <React.Fragment key={index}>
          {renderField(fieldName, field)}
        </React.Fragment>
      ))}
    </div>
  );
};
