import React from 'react';
import { PolicyType } from '../../types/PolicyTypes';

interface SubPolicySelectProps {
    onSelect: (policy: PolicyType) => void;
}

export const SubPolicySelect: React.FC<SubPolicySelectProps> = ({ onSelect }) => {
    return <select
        onChange={(e) => onSelect(e.target.value as PolicyType)}
        value=""
        className="form-input"
    >
        <option value="" disabled>Add Sub Policy</option>
        <option value="numeric_attribute">Numeric Attribute</option>
        <option value="probabilistic">Probabilistic</option>
        <option value="rate_limiting">Rate Limiting</option>
        <option value="status_code">Status Code</option>
        <option value="string_attribute">String Attribute</option>
        <option value="latency">Latency</option>
        <option value="always_sample">Always Sample</option>
        <option value="boolean_attribute">Boolean Attribute</option>
        <option value="ottl_condition">OTTL Condition</option>
        <option value="span_count">Span Count</option>
        <option value="trace_state">Trace State</option>
    </select>
}