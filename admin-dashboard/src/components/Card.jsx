/**
 * Card Component
 * Reusable card component for displaying content
 */

import React from 'react';

const Card = ({ title, children, className = '', actions, icon: Icon }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      {title && (
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {Icon && <Icon className="text-black" size={20} />}
            <h2 className="text-lg font-bold text-black tracking-tight">{title}</h2>
          </div>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
