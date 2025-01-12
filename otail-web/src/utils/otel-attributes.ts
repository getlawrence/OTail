import * as stableConventions from '@opentelemetry/semantic-conventions';
import * as incubatingConventions from '@opentelemetry/semantic-conventions/incubating';

export interface AttributeOption {
  label: string;
  value: string;
  isIncubating?: boolean;
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
export function getOtelAttributes(includeIncubating: boolean = true): AttributeOption[] {
  const stableAttrs = Object.keys(stableConventions)
    .filter(key => key.startsWith('ATTR_'))
    .map(key => ({
      label: cleanAttributeName(key),
      value: (stableConventions as any)[key],
      isIncubating: false
    }));

  if (!includeIncubating) {
    return stableAttrs.sort((a, b) => a.label.localeCompare(b.label));
  }

  const incubatingAttrs = Object.keys(incubatingConventions)
    .filter(key => key.startsWith('ATTR_'))
    .map(key => ({
      label: cleanAttributeName(key),
      value: (incubatingConventions as any)[key],
      isIncubating: true
    }));

  return [...stableAttrs, ...incubatingAttrs]
    .sort((a, b) => a.label.localeCompare(b.label));
}

// Function to check if a value matches any OpenTelemetry attribute
export function isOtelAttribute(value: string, includeIncubating: boolean = false): boolean {
  const isStableAttr = Object.values(stableConventions)
    .some(attrValue => typeof attrValue === 'string' && attrValue === value);
  
  if (!includeIncubating || isStableAttr) {
    return isStableAttr;
  }

  return Object.values(incubatingConventions)
    .some(attrValue => typeof attrValue === 'string' && attrValue === value);
}
