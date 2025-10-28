/**
 * Button Component
 * Reusable button component
 */

import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
  icon: Icon,
}) => {
  const baseClasses = 'px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-sm hover:shadow-md';
  
  const variantClasses = {
    primary: 'bg-black text-white hover:bg-gray-800 active:bg-gray-900',
    secondary: 'bg-gray-100 text-black hover:bg-gray-200 active:bg-gray-300 border border-gray-200',
    success: 'bg-black text-white hover:bg-gray-800 active:bg-gray-900',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700',
    outline: 'border-2 border-black text-black hover:bg-gray-50 active:bg-gray-100',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {Icon && <Icon className="flex-shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

export default Button;
