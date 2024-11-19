import React from 'react';
import classNames from 'classnames';
import './Input.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helpText?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  error, 
  helpText, 
  options, 
  className, 
  onChange,
  value,
  ...props 
}) => {
  return (
    <div className="form-field">
      {label && <label className="form-label">{label}</label>}
      <select
        className={classNames('form-input', 'form-select', className, { error })}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div className="error-message">{error}</div>}
      {helpText && <div className="help-text">{helpText}</div>}
    </div>
  );
}; 