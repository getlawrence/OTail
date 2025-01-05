import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BooleanTagPolicy } from '@/types/policy';
import { Combobox } from '@/components/ui/combobox';
import { getOtelAttributes } from '@/utils/otel-attributes';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoCircledIcon } from '@radix-ui/react-icons';

interface BooleanTagPolicyEditorProps {
  policy: BooleanTagPolicy;
  onUpdate: (policy: BooleanTagPolicy) => void;
}

export const BooleanTagPolicyEditor: React.FC<BooleanTagPolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  const otelAttributes = React.useMemo(() => getOtelAttributes(), []);

  return (
    <div className="policy-editor">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="key">Attribute Key</Label>
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
            id="key"
            value={policy.key}
            onChange={(value) => onUpdate({
              ...policy,
              key: value
            })}
            options={otelAttributes}
            placeholder="Select or type an attribute key"
            allowCustomValue
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Value</Label>
          <Select
            value={policy.value.toString()}
            onValueChange={(value) => onUpdate({
              ...policy,
              value: value === 'true'
            })}
          >
            <SelectTrigger id="value">
              <SelectValue placeholder="Select a value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}; 