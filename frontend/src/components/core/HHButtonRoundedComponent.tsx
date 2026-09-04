import React from 'react';

interface HHButtonRoundedProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  badgeCount?: number;
  icon: React.ReactNode;
}

export const HHButtonRounded: React.FC<HHButtonRoundedProps> = ({
  badgeCount = 0,
  icon,
  className = '',
  ...props
}) => {
  return (
    <button
      {...props}
      className={`p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary relative ${className}`}
    >
      {icon}
      {badgeCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900">
          {badgeCount}
        </span>
      )}
    </button>
  );
};
