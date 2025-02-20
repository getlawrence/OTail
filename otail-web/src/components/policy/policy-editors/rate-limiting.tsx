import React from 'react';
import { RateLimitingPolicy } from '@/types/policy'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from "lucide-react"


interface RateLimitingPolicyEditorProps {
  policy: RateLimitingPolicy;
  onUpdate: (policy: RateLimitingPolicy) => void;
}

export const RateLimitingPolicyEditor: React.FC<RateLimitingPolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <div className='flex items-center gap-2'>
          <Label htmlFor="spansPerSecond">Spans per second</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-4 w-4 p-0 hover:bg-transparent">
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Number of spans per second</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-4">
          <Input
            type="number"
            min="0"
            value={policy.spansPerSecond}
            onChange={(e) => onUpdate({
              ...policy,
              spansPerSecond: Number(e.target.value)
            })}
            placeholder="Enter spans per second"
          />
        </div>
      </div>
    </div>
  );
}; 