import React, { useState } from 'react';
import { Policy } from '../../types/PolicyTypes';
import classNames from 'classnames';
import { ProbabilisticPolicyEditor } from '../PolicyEditors/ProbabilisticPolicyEditor';
import { RateLimitingPolicyEditor } from '../PolicyEditors/RateLimitingPolicyEditor';
import { StatusCodePolicyEditor } from '../PolicyEditors/StatusCodePolicyEditor';
import { StringAttributePolicyEditor } from '../PolicyEditors/StringAttributePolicyEditor';
import { LatencyPolicyEditor } from '../PolicyEditors/LatencyPolicyEditor';
import { AlwaysSamplePolicyEditor } from '../PolicyEditors/AlwaysSamplePolicyEditor';
import { BooleanTagPolicyEditor } from '../PolicyEditors/BooleanTagPolicyEditor';
import { CompositePolicyEditor } from '../PolicyEditors/CompositePolicyEditor';
import { NumericTagPolicyEditor } from '../PolicyEditors/NumericAttributePolicyEditor';
import { OttlPolicyEditor } from '../PolicyEditors/OttlPolicyEditor';
import { SpanCountPolicyEditor } from '../PolicyEditors/SpanCountPolicyEditor';
import { TraceStatePolicyEditor } from '../PolicyEditors/TraceStatePolicyEditor';
import './PolicyCard.css';
import { AndPolicyEditor } from '../PolicyEditors/AndPolicyEditor';

interface PolicyCardProps {
  policy: Policy;
  onUpdate: (policy: Policy) => void;
  onRemove: () => void;
  nested?: boolean;
}

export const PolicyCard: React.FC<PolicyCardProps> = ({
  policy,
  onUpdate,
  onRemove,
  nested = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleHeaderClick = (e: React.MouseEvent) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLButtonElement ||
      e.target instanceof HTMLLabelElement
    ) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  const renderPolicyDescription = () => {
    switch (policy.type) {
      case 'probabilistic':
        return 'Samples traces based on a percentage probability.';
      case 'rate_limiting':
        return 'Limits the number of sampled spans per second.';
      case 'status_code':
        return 'Samples traces based on their status codes.';
      case 'latency':
        return 'Samples traces that exceed a specified latency threshold.';
      case 'always_sample':
        return 'Always samples all traces that match this policy.';
      case 'composite':
        return `Combines multiple policies using ${policy.operator.toUpperCase()} logic.`;
      default:
        return null;
    }
  };

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
    <div className={classNames('policy-card', { 'nested-policy': nested })}>
      <div className="policy-card-header" onClick={handleHeaderClick}>
        <div className="policy-card-title">
          <span className={classNames('collapse-icon', { expanded: isExpanded })}>
            ▶
          </span>
          <input
            type="text"
            className="policy-name-input"
            value={policy.name}
            onChange={(e) => onUpdate({ ...policy, name: e.target.value })}
            placeholder="Policy Name"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="policy-type-badge">{policy.type}</div>
        </div>
        <div className="policy-card-actions">
          <button 
            className="remove-policy-button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Remove policy"
          >
            Remove
          </button>
        </div>
      </div>
      <div className={classNames('policy-card-content', { collapsed: !isExpanded })}>
        {renderPolicyDescription() && (
          <div className="policy-description">
            {renderPolicyDescription()}
          </div>
        )}
        {renderPolicyEditor()}
      </div>
    </div>
  );
}; 