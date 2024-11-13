import React from 'react';
import classNames from 'classnames';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="form-field">
      {label && <label className="form-label">{label}</label>}
      <input
        className={classNames('form-input', className, { 'input-error': error })}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}; 