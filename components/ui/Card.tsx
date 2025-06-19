import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
}

// Si className incluye un color de fondo (bg-), no aplicar bg-white
const Card: React.FC<CardProps> = ({ title, children, className = '', titleClassName = '', bodyClassName = '' }) => {
  const hasBg = /bg-\w+(-\d+)?/.test(className);
  return (
    <div className={`${hasBg ? '' : 'bg-white'} shadow-lg rounded-xl overflow-hidden ${className}`}>
      {title && (
        <div className={`px-6 py-4 border-b border-gray-200 ${titleClassName}`}>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
