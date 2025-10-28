/**
 * Select Component
 * Reusable select dropdown component
 */

import React from 'react';

const Select = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  error,
  placeholder = 'Select an option',
  className = '',
  children, // Support for children prop
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-black mb-2">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all ${
          error ? 'border-rose-500' : 'border-gray-200'
        } disabled:bg-gray-50 disabled:cursor-not-allowed text-black font-medium`}
      >
        {!children && <option value="">{placeholder}</option>}
        {/* Support both options prop and children */}
        {options && Array.isArray(options) ? (
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        ) : (
          children
        )}
      </select>
      {error && <p className="text-sm text-rose-500 mt-1 font-medium">{error}</p>}
    </div>
  );
};

export default Select;
