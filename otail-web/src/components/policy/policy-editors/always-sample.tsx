import { AlwaysSamplePolicy } from '@/types/policy';
import React from 'react';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoCircledIcon } from '@radix-ui/react-icons';

interface AlwaysSamplePolicyEditorProps {
  policy: AlwaysSamplePolicy;
  onUpdate: (policy: AlwaysSamplePolicy) => void;
}

export const AlwaysSamplePolicyEditor: React.FC<AlwaysSamplePolicyEditorProps> = ({
}) => {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2">
        <Label>Always Sample Policy</Label>
        <Tooltip>
          <TooltipTrigger>
            <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>
              This policy will sample 100% of spans that match any other conditions in your sampling rules.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};