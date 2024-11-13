import React, { useState, useRef, useEffect } from 'react';
import { PolicyType } from '../../types/PolicyTypes';
import './AddPolicyButton.css';

interface AddPolicyButtonProps {
  onSelectPolicy: (type: PolicyType) => void;
}

export const AddPolicyButton: React.FC<AddPolicyButtonProps> = ({ onSelectPolicy }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const policyTypes: { type: PolicyType; label: string }[] = [
    { type: 'numeric_attribute', label: 'Numeric Attribute' },
    { type: 'probabilistic', label: 'Probabilistic' },
    { type: 'rate_limiting', label: 'Rate Limiting' },
    { type: 'status_code', label: 'Status Code' },
    { type: 'string_attribute', label: 'String Attribute' },
    { type: 'latency', label: 'Latency' },
    { type: 'always_sample', label: 'Always Sample' },
    { type: 'boolean_attribute', label: 'Boolean Tag' },
    { type: 'composite', label: 'Composite' },
    { type: 'ottl_condition', label: 'ottl_condition' },
    { type: 'span_count', label: 'Span Count' },
    { type: 'string_attribute', label: 'String Tag' },
    { type: 'trace_state', label: 'Trace State' }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPolicy = (type: PolicyType) => {
    onSelectPolicy(type);
    setIsOpen(false);
  };

  return (
    <div className="add-policy-button-container" ref={dropdownRef}>
      <button 
        className="add-policy-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        Add Policy
      </button>
      {isOpen && (
        <div className="policy-dropdown">
          {policyTypes.map(({ type, label }) => (
            <button
              key={type}
              className="policy-dropdown-item"
              onClick={() => handleSelectPolicy(type)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 