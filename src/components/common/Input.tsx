import React from 'react';
import classNames from 'classnames';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  helpText, 
  className, 
  ...props 
}) => {
  return (
    <div className="form-field">
      {label && <label className="form-label">{label}</label>}
      <input
        className={classNames('form-input', className, { error })}
        {...props}
      />
      {error && <div className="error-message">{error}</div>}
      {helpText && <div className="help-text">{helpText}</div>}
    </div>
  );
}; 