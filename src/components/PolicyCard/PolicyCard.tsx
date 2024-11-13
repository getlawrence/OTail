import React from 'react';
import { Policy } from '../../types/PolicyTypes';
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
import { StringTagPolicyEditor } from '../PolicyEditors/StringTagPolicyEditor';
import { TraceStatePolicyEditor } from '../PolicyEditors/TraceStatePolicyEditor';
import './PolicyCard.css';

interface PolicyCardProps {
  policy: Policy;
  onUpdate: (policy: Policy) => void;
  onRemove: () => void;
}

export const PolicyCard: React.FC<PolicyCardProps> = ({
  policy,
  onUpdate,
  onRemove,
}) => {
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
      case 'boolean_tag':
        return <BooleanTagPolicyEditor policy={policy} onUpdate={onUpdate} />;
      case 'composite':
        return <CompositePolicyEditor policy={policy} onUpdate={onUpdate} />;
      case 'numeric_tag':
        return <NumericTagPolicyEditor policy={policy} onUpdate={onUpdate} />;
      case 'ottl':
        return <OttlPolicyEditor policy={policy} onUpdate={onUpdate} />;
      case 'span_count':
        return <SpanCountPolicyEditor policy={policy} onUpdate={onUpdate} />;
      case 'string_tag':
        return <StringTagPolicyEditor policy={policy} onUpdate={onUpdate} />;
      case 'trace_state':
        return <TraceStatePolicyEditor policy={policy} onUpdate={onUpdate} />;
      default:
        return <div>Unknown policy type: {(policy as Policy).type}</div>;
    }
  };

  return (
    <div className="policy-card">
      <div className="policy-card-header">
        <div className="policy-card-title">
          <input
            type="text"
            className="policy-name-input"
            value={policy.name}
            onChange={(e) => onUpdate({ ...policy, name: e.target.value })}
            placeholder="Policy Name"
          />
          <div className="policy-type-badge">{policy.type}</div>
        </div>
        <div className="policy-card-actions">
          <label className="enable-toggle">
            <input
              type="checkbox"
              checked={policy.enabled}
              onChange={(e) => onUpdate({ ...policy, enabled: e.target.checked })}
            />
            Enabled
          </label>
          <button 
            className="remove-policy-button"
            onClick={onRemove}
            aria-label="Remove policy"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="policy-card-content">
        {renderPolicyEditor()}
      </div>
    </div>
  );
}; 