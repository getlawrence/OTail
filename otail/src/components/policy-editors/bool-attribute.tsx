import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select,  SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BooleanTagPolicy } from '@/types/policy';

interface BooleanTagPolicyEditorProps {
  policy: BooleanTagPolicy;
  onUpdate: (policy: BooleanTagPolicy) => void;
}

export const BooleanTagPolicyEditor: React.FC<BooleanTagPolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  return (
    <div className="policy-editor">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="key">Attribute Key</Label>
          <Input
            id="key"
            value={policy.key}
            onChange={(e) => onUpdate({
              ...policy,
              key: e.target.value
            })}
            placeholder="Enter attribute key"
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