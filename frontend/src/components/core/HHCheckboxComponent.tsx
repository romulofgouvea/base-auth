import React from 'react';

interface HHCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const HHCheckbox = React.forwardRef<HTMLInputElement, HHCheckboxProps>(
  ({ label, id, className = '', ...props }, ref) => {
    return (
      <div className="flex items-center">
        <input
          id={id}
          type="checkbox"
          ref={ref}
          className={`h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded transition-colors duration-300 ${className}`}
          {...props}
        />
        <label htmlFor={id} className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          {label}
        </label>
      </div>
    );
  }
);

HHCheckbox.displayName = 'HHCheckbox';
