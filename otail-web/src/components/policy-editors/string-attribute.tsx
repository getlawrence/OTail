import React from 'react';
import { StringAttributePolicy } from '@/types/policy'
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Switch } from '../ui/switch';
import { Combobox } from '../ui/combobox';
import { getOtelAttributes } from '@/utils/otel-attributes';

interface StringAttributePolicyEditorProps {
  policy: StringAttributePolicy;
  onUpdate: (policy: StringAttributePolicy) => void;
}

export const StringAttributePolicyEditor: React.FC<StringAttributePolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  const updateField = <K extends keyof StringAttributePolicy>(
    field: K,
    value: StringAttributePolicy[K]
  ) => {
    onUpdate({ ...policy, [field]: value });
  };

  const otelAttributes = React.useMemo(() => getOtelAttributes(), []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="attributeKey">Attribute Key</Label>
          <Tooltip>
            <TooltipTrigger>
              <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Select from standard OpenTelemetry attributes or enter a custom key</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Combobox
          id="attributeKey"
          value={policy.key}
          onChange={(value) => updateField('key', value)}
          options={otelAttributes}
          placeholder="Select or type an attribute key"
          allowCustomValue
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="attributeValue">Attribute Value</Label>
          <Tooltip>
            <TooltipTrigger>
              <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>The value of the attribute to match against (e.g., GET, POST)</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Input
          id="attributeValue"
          value={policy.values.join(', ')}
          onChange={(e) => updateField('values', e.target.value.split(', '))}
          placeholder="e.g., GET, POST"
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="regexToggle">Regular Expression Matching</Label>
            <Tooltip>
              <TooltipTrigger>
                <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Enable to use regex patterns instead of exact matching</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Switch
            id="regexToggle"
            checked={policy.enabledRegexMatching}
            onCheckedChange={(checked) => {
              updateField('enabledRegexMatching', checked);
              if (checked && !policy.cacheMaxSize) {
                updateField('cacheMaxSize', 10000);
              }
            }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {policy.enabledRegexMatching ? 'Using regex pattern matching' : 'Using exact string matching'}
        </p>
      </div>

      {
        policy.enabledRegexMatching && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="cacheSize">Cache Size</Label>
              <Tooltip>
                <TooltipTrigger>
                  <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Maximum number of regex patterns to cache for better performance</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="cacheSize"
              type="number"
              min="1000"
              value={policy.cacheMaxSize}
              onChange={(e) => updateField('cacheMaxSize', Number(e.target.value))}
              placeholder="Enter cache size (default: 10000)"
              className="w-full"
            />
          </div>
        )
      }

    </div>
  );
};