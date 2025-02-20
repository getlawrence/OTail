'use client'

import React from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlwaysSamplePolicyEditor, AndPolicyEditor, BooleanTagPolicyEditor, CompositePolicyEditor, LatencyPolicyEditor, NumericTagPolicyEditor, OttlPolicyEditor, ProbabilisticPolicyEditor, RateLimitingPolicyEditor, SpanCountPolicyEditor, StringAttributePolicyEditor, TraceStatePolicyEditor } from "./policy-editors";
import { StatusCodePolicyEditor } from "./policy-editors/status-code";
import { Policy } from "@/types/policy";
import { Decision } from "@/types/trace";
import { cn } from "@/lib/utils"
import { EditableText } from "@/components/ui/editable-text"
import { DecisionBadge } from "@/components/shared/decision-badge"

interface PolicyCardProps {
  policy: Policy;
  onUpdate: (policy: Policy) => void;
  onRemove: () => void;
  nested?: boolean;
  samplingDecision?: Decision;
}

export const PolicyCard: React.FC<PolicyCardProps> = ({ policy, onUpdate, onRemove, samplingDecision, nested }) => {
  const [isOpen, setIsOpen] = React.useState(true);
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

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 p-4">
        <ChevronDown
          onClick={() => setIsOpen(!isOpen)}
          className={cn("h-3.5 w-3.5 transition-transform duration-200 hover:bg-foreground/10 rounded", {
            "transform rotate-180": !isOpen
          })}
          strokeWidth={1.5}
        />
        <EditableText
          value={policy.name}
          onChange={(value) => onUpdate({ ...policy, name: value })}
          className="font-medium"
          inputClassName="px-0 py-0"
        />
        {samplingDecision !== undefined ? (
          <DecisionBadge
            decision={samplingDecision}
            className="text-xs justify-self-end"
          />
        ) : (
          <div />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <MoreVertical className="h-3.5 w-3.5 hover:bg-foreground/10 rounded" strokeWidth={1.5} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={onRemove} className="text-destructive text-xs">
              Remove Policy
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isOpen && (
        <div className="px-4 pb-4">
          {renderPolicyEditor()}
        </div>
      )}
    </div>
  );
};
