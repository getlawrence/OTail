import { AlwaysSamplePolicy } from '@/types/policy';
import React from 'react';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Info } from "lucide-react"

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
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-4 w-4 p-0 hover:bg-transparent">
              <Info className="h-4 w-4 text-muted-foreground" />
            </Button>
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