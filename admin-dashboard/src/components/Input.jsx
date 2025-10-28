/**
 * Input Component
 * Reusable input component
 */

import React from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = '',
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-black mb-2">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all ${
          error ? 'border-rose-500' : 'border-gray-200'
        } disabled:bg-gray-50 disabled:cursor-not-allowed text-black placeholder-gray-400 font-medium`}
      />
      {error && <p className="text-sm text-rose-500 mt-1 font-medium">{error}</p>}
    </div>
  );
};

export default Input;
