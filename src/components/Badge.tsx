import React from 'react';

interface BadgeProps {
  text: string;
  variant?: 'blue' | 'green' | 'gray';
  size?: 'sm' | 'md';
}

const Badge: React.FC<BadgeProps> = ({ 
  text, 
  variant = 'gray',
  size = 'sm'
}) => {
  const baseClasses = "rounded-full font-medium";
  
  const variantClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700", 
    gray: "bg-gray-50 text-gray-600"
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm"
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {text}
    </span>
  );
};

export default Badge;