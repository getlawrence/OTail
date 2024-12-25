import * as conventions from '@opentelemetry/semantic-conventions';

export interface AttributeOption {
  label: string;
  value: string;
}

// Function to clean up the attribute name for display
export function cleanAttributeName(name: string): string {
  // Remove the ATTR_ prefix
  let cleaned = name.replace(/^ATTR_/, '');
  // Convert from SCREAMING_SNAKE_CASE to Title Case with Spaces
  cleaned = cleaned.toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return cleaned;
}

// Get all available OpenTelemetry attributes
export function getOtelAttributes(): AttributeOption[] {
  return Object.keys(conventions)
    .filter(key => key.startsWith('ATTR_'))
    .map(key => ({
      label: cleanAttributeName(key),
      value: (conventions as any)[key]
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

// Function to check if a value matches any OpenTelemetry attribute
export function isOtelAttribute(value: string): boolean {
  return Object.values(conventions)
    .some(attrValue => typeof attrValue === 'string' && attrValue === value);
}
