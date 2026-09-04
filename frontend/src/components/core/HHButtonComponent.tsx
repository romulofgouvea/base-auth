import React from 'react';

export interface HHButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: 'primary' | 'warn' | 'error' | 'default';
  variant?: 'solid' | 'outline' | 'icon' | 'ghost';
  isRounded?: boolean;
  isFullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const HHButton: React.FC<HHButtonProps> = ({
  color = 'default',
  variant = 'solid',
  isRounded = false,
  isFullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const roundedClasses = variant === 'icon' ? 'p-1 rounded' : (isRounded ? 'rounded-full px-6 py-2' : 'rounded-lg px-4 py-2');

  let colorClasses = '';

  if (variant === 'solid') {
    switch (color) {
      case 'primary':
        colorClasses = 'bg-brand-primary text-white hover:bg-brand-secondary focus-visible:ring-brand-primary border border-transparent';
        break;
      case 'warn':
        colorClasses = 'bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500 border border-transparent';
        break;
      case 'error':
        colorClasses = 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500 border border-transparent';
        break;
      case 'default':
        colorClasses = 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:ring-gray-400 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 border border-transparent';
        break;
    }
  } else if (variant === 'outline') {
    switch (color) {
      case 'primary':
        colorClasses = 'bg-transparent text-brand-primary border border-brand-primary hover:bg-brand-primary hover:text-white focus-visible:ring-brand-primary';
        break;
      case 'warn':
        colorClasses = 'bg-transparent text-amber-500 border border-amber-500 hover:bg-amber-500 hover:text-white focus-visible:ring-amber-500';
        break;
      case 'error':
        colorClasses = 'bg-transparent text-red-500 border border-red-500 hover:bg-red-500 hover:text-white focus-visible:ring-red-500';
        break;
      case 'default':
        colorClasses = 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus-visible:ring-brand-primary dark:bg-transparent dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800';
        break;
    }
  } else if (variant === 'icon') {
    switch (color) {
      case 'primary':
        colorClasses = 'bg-transparent text-brand-primary hover:text-brand-secondary focus-visible:ring-brand-primary border-transparent';
        break;
      case 'warn':
        colorClasses = 'bg-transparent text-amber-500 hover:text-amber-600 focus-visible:ring-amber-500 border-transparent';
        break;
      case 'error':
        colorClasses = 'bg-transparent text-red-500 hover:text-red-700 focus-visible:ring-red-500 border-transparent';
        break;
      case 'default':
        colorClasses = 'bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus-visible:ring-gray-400 border-transparent';
        break;
    }
  } else if (variant === 'ghost') {
    switch (color) {
      case 'primary':
        colorClasses = 'bg-transparent text-brand-primary hover:bg-brand-primary/10 hover:text-brand-secondary focus-visible:ring-brand-primary border-transparent';
        break;
      case 'warn':
        colorClasses = 'bg-transparent text-amber-500 hover:bg-amber-500/10 hover:text-amber-600 focus-visible:ring-amber-500 border-transparent';
        break;
      case 'error':
        colorClasses = 'bg-transparent text-red-500 hover:bg-red-500/10 hover:text-red-700 focus-visible:ring-red-500 border-transparent';
        break;
      case 'default':
        colorClasses = 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 focus-visible:ring-gray-400 border-transparent';
        break;
    }
  }

  const finalDisabled = disabled || isLoading;

  return (
    <button
      className={`${baseClasses} ${roundedClasses} ${colorClasses} ${isFullWidth ? 'w-full' : ''} ${className}`}
      disabled={finalDisabled}
      {...props}
    >
      {isLoading && (
        <svg className={`animate-spin ${children ? '-ml-1 mr-2' : ''} h-4 w-4 text-current`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span className={children ? 'mr-2' : ''}>{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className={children ? 'ml-2' : ''}>{rightIcon}</span>}
    </button>
  );
};
