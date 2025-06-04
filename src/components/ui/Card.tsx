import React from 'react';

interface CardProps {
  title?: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ 
  title, 
  icon, 
  className = '', 
  children, 
  footer 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-shadow duration-300 hover:shadow-md ${className}`}>
      {(title || icon) && (
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          {title && <h3 className="font-medium text-gray-800">{title}</h3>}
          {icon && <div className="text-gray-500">{icon}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">{footer}</div>}
    </div>
  );
};

export default Card;