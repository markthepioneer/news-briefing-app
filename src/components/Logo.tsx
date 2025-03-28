import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'medium',
  color = 'dark'
}) => {
  // Size classes based on the size prop
  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl'
  };
  
  // Color classes based on the color prop
  const colorClasses = {
    light: 'text-white',
    dark: 'text-indigo-600'
  };
  
  return (
    <div className={`font-bold ${sizeClasses[size]} ${colorClasses[color]} flex items-center`}>
      <span className="mr-1">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className={size === 'small' ? 'h-5 w-5' : size === 'medium' ? 'h-6 w-6' : 'h-7 w-7'}
        >
          <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
          <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z" clipRule="evenodd" />
          <path d="M2.25 18a.75.75 0 000 1.5h19.5a.75.75 0 000-1.5H2.25z" />
        </svg>
      </span>
      <span>BriefMe</span>
    </div>
  );
};
