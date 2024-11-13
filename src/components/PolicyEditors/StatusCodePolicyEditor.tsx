import React from 'react';
import { StatusCodePolicy } from '../../types/PolicyTypes';

interface StatusCodePolicyEditorProps {
  policy: StatusCodePolicy;
  onUpdate: (policy: StatusCodePolicy) => void;
}

export const StatusCodePolicyEditor: React.FC<StatusCodePolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  const statusCodes = ['ERROR', 'OK', 'UNSET'];

  return (
    <div className="policy-editor">
      <div className="form-field">
        <label className="form-label">Status Codes</label>
        <div className="checkbox-group">
          {statusCodes.map((code) => (
            <label key={code} className="checkbox-label">
              <input
                type="checkbox"
                checked={policy.statusCodes.includes(code)}
                onChange={(e) => {
                  const newStatusCodes = e.target.checked
                    ? [...policy.statusCodes, code]
                    : policy.statusCodes.filter((sc) => sc !== code);
                  onUpdate({
                    ...policy,
                    statusCodes: newStatusCodes,
                  });
                }}
              />
              {code}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}; 