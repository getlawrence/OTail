import React, { useState } from 'react';
import './EditableTitle.css';

interface EditableTitleProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export const EditableTitle: React.FC<EditableTitleProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  return isEditing ? (
    <input
      type="text"
      className="policy-name-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      autoFocus
    />
  ) : (
    <span 
      className="policy-name-text"
      onClick={handleClick}
    >
      {value || placeholder}
    </span>
  );
}; 