import React, { useState } from 'react';
import { usePolicySets } from '../../context/PolicySetsContext';
import './PolicySetsMenu.css';
import { Policy } from '../../types/PolicyTypes';

interface PolicySetsMenuProps {
  onImportPolicies: (policies: Policy[]) => void;
}

export const PolicySetsMenu: React.FC<PolicySetsMenuProps> = ({ onImportPolicies }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { policySets, removePolicySet } = usePolicySets();

  return (
    <div className={`policy-sets-menu ${isExpanded ? 'expanded' : ''}`}>
      <button 
        className={`toggle-button ${isExpanded ? 'hidden' : ''}`}
        onClick={() => setIsExpanded(true)}
        aria-label="Expand menu"
      >
        <span className="arrow">→</span>
      </button>
      
      <div className="menu-content">
        {isExpanded && (
          <button 
            className="close-button"
            onClick={() => setIsExpanded(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
        <div className="menu-header">
          <h3>Saved Policy Sets</h3>
        </div>
        <div className="policy-sets-list">
          {policySets.map((set) => (
            <div key={set.id} className="policy-set-item">
              <div className="policy-set-info">
                <h4>{set.name}</h4>
                <span className="policy-count">
                  {set.policies.length} {set.policies.length === 1 ? 'policy' : 'policies'}
                </span>
              </div>
              <div className="policy-set-actions">
                <button
                  className="import-button"
                  onClick={() => onImportPolicies(set.policies)}
                >
                  +
                </button>
                <button
                  className="set-remove-button"
                  onClick={() => removePolicySet(set.id)}
                  aria-label="Remove policy set"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
