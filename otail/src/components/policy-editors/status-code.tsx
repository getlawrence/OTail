import React from 'react';
import { StatusCodePolicy } from '@/types/policy'
import { StatusCode } from '@/types/trace'
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface StatusCodePolicyEditorProps {
  policy: StatusCodePolicy;
  onUpdate: (policy: StatusCodePolicy) => void;
}

export const StatusCodePolicyEditor: React.FC<StatusCodePolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  const statusCodes: StatusCode[] = ['OK', 'ERROR', 'UNSET'];

  return (
    <div className="p-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Status Codes</h3>
          <p className="text-sm text-muted-foreground">
            Select which status codes should trigger this policy.
          </p>
        </div>
        <div className="grid gap-4">
          {statusCodes.map((code) => (
            <div key={code} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${code}`}
                checked={policy.statusCodes.includes(code)}
                onCheckedChange={(checked) => {
                  const newStatusCodes = checked
                    ? [...policy.statusCodes, code]
                    : policy.statusCodes.filter((sc) => sc !== code);
                  onUpdate({
                    ...policy,
                    statusCodes: newStatusCodes,
                  });
                }}
              />
              <Label
                htmlFor={`status-${code}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {code}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};