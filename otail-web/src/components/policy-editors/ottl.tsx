import React from 'react';
import { OttlPolicy } from '@/types/policy';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface OttlPolicyEditorProps {
  policy: OttlPolicy;
  onUpdate: (policy: OttlPolicy) => void;
}

export const OttlPolicyEditor: React.FC<OttlPolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  // Helper function to update span conditions
  const handleSpanConditionUpdate = (value: string) => {
    const conditions = value.split('\n').map(line => line.trim()).filter(line => line !== '');
    onUpdate({
      ...policy,
      spanConditions: conditions,
    });
  };

  // Helper function to update span event conditions
  const handleSpanEventConditionUpdate = (value: string) => {
    const conditions = value.split('\n').map(line => line.trim()).filter(line => line !== '');
    onUpdate({
      ...policy,
      spanEventConditions: conditions,
    });
  };

  return (
    <div className='space-y-4'>
      <div className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label>Error Mode</Label>
          <Select
            value={policy.errorMode || 'ignore'}
            onValueChange={(value) => onUpdate({
              ...policy,
              errorMode: value,
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ignore">Ignore</SelectItem>
              <SelectItem value="propagate">Propagate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Span Conditions</Label>
          <Textarea
            value={(policy.spanConditions || []).join('\n')}
            onChange={(e) => handleSpanConditionUpdate(e.target.value)}
            placeholder="Enter conditions (one per line)"
            className="min-h-[150px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Span Event Conditions</Label>
          <Textarea
            value={(policy.spanEventConditions || []).join('\n')}
            onChange={(e) => handleSpanEventConditionUpdate(e.target.value)}
            placeholder="Enter conditions (one per line)"
            className="min-h-[150px]"
          />
        </div>
      </div>
    </div>
  );
};