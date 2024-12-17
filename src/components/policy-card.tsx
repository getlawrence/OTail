'use client'

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlwaysSamplePolicyEditor } from './policy-editors/always-sample'
import { Policy } from '@/types/policy'
import { ProbabilisticPolicyEditor } from './policy-editors/probabilistic'
import { StatusCodePolicyEditor } from './policy-editors/status-code'
import { StringAttributePolicyEditor } from './policy-editors/string-attribute'
import { LatencyPolicyEditor } from './policy-editors/latency'
import { BooleanTagPolicyEditor } from './policy-editors/bool-attribute'
import { CompositePolicyEditor } from './policy-editors/composite'
import { OttlPolicyEditor } from './policy-editors/ottl'
import { SpanCountPolicyEditor } from './policy-editors/span-count'
import { NumericTagPolicyEditor } from './policy-editors/numeric-attribute'
import { TraceStatePolicyEditor } from './policy-editors/trace-state'
import { RateLimitingPolicyEditor } from './policy-editors/rate-limiting'
import { AndPolicyEditor } from './policy-editors/and'
import { Input } from "@/components/ui/input"
import { Decision } from "@/types/trace"
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PolicyCardProps {
  policy: Policy;
  onUpdate: (policy: Policy) => void;
  onRemove: () => void;
  nested?: boolean;
  samplingDecision?: Decision;
}

export const PolicyCard: React.FC<PolicyCardProps> = ({ policy, onUpdate, onRemove, samplingDecision }) => {
  const renderPolicyEditor = () => {
    switch (policy.type) {
      case 'probabilistic':
        return <ProbabilisticPolicyEditor policy={policy} onUpdate={onUpdate} />;
      case 'rate_limiting':
        return <RateLimitingPolicyEditor policy={policy} onUpdate={onUpdate} />;
      case 'status_code':
        return <StatusCodePolicyEditor policy={policy} onUpdate={onUpdate} />;
      case 'string_attribute':
        return <StringAttributePolicyEditor policy={policy} onUpdate={onUpdate} />;
      case 'latency':
        return <LatencyPolicyEditor policy={policy} onUpdate={onUpdate} />;
      case 'always_sample':
        return <AlwaysSamplePolicyEditor policy={policy} onUpdate={onUpdate} />;
      case 'boolean_attribute':
        return <BooleanTagPolicyEditor policy={policy} onUpdate={onUpdate} />;
      case 'composite':
        return <CompositePolicyEditor policy={policy} onUpdate={onUpdate} />;
      case 'numeric_attribute':
        return <NumericTagPolicyEditor policy={policy} onUpdate={onUpdate} />;
      case 'ottl_condition':
        return <OttlPolicyEditor policy={policy} onUpdate={onUpdate} />;
      case 'span_count':
        return <SpanCountPolicyEditor policy={policy} onUpdate={onUpdate} />;
      case 'trace_state':
        return <TraceStatePolicyEditor policy={policy} onUpdate={onUpdate} />;
      case 'and':
        return <AndPolicyEditor policy={policy} onUpdate={onUpdate} />;
      default:
        return <div>Unknown policy type: {(policy as Policy).type}</div>;
    }
  };

  const samplingDecisionClass = samplingDecision === undefined 
    ? ''
    : samplingDecision === Decision.Sampled 
      ? 'border-success' 
      : 'border-destructive';

  return (
    <Card className={cn("transition-colors", samplingDecisionClass)}>
      <CardHeader className="space-y-1">
        <Badge variant="outline" className="w-fit">{policy.type}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input 
          value={policy.name} 
          onChange={(e) => onUpdate({ ...policy, name: e.target.value })}
          className="focus-visible:ring-2"
        />
        {renderPolicyEditor()}
      </CardContent>
      <CardFooter>
        <Button 
          variant="destructive"
          className="hover:bg-destructive/90 transition-colors"
          onClick={onRemove}
        >
          Remove
        </Button>
      </CardFooter>
    </Card>
  )
}

