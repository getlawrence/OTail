import React from 'react';
import { OttlPolicy } from '../../types/PolicyTypes';
import { Editor } from '@monaco-editor/react';

interface OttlPolicyEditorProps {
  policy: OttlPolicy;
  onUpdate: (policy: OttlPolicy) => void;
}

export const OttlPolicyEditor: React.FC<OttlPolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  return (
    <div className="policy-editor">
      <label className="form-label">OTTL Expression</label>
      <div className="ottl-editor">
        <Editor
          height="200px"
          defaultLanguage="plaintext"
          value={policy.expression}
          onChange={(value) => onUpdate({
            ...policy,
            expression: value || ''
          })}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            theme: 'vs-light',
          }}
        />
      </div>
    </div>
  );
}; 