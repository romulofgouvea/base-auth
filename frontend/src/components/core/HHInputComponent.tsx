import React, { useState } from 'react';

interface HHInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | string[];
  errors?: { context?: string; message: string }[];
  hint?: string;
}

export const HHInput: React.FC<HHInputProps> = ({
  label,
  error: externalError,
  hint,
  id,
  type = 'text',
  className = '',
  minLength = 5,
  maxLength = 255,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [internalError, setInternalError] = useState('');

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const errorList: string[] = [];
  if (externalError) {
    if (Array.isArray(externalError)) {
      errorList.push(...externalError);
    } else {
      errorList.push(externalError);
    }
  }
  if (props.errors && (props.name || id)) {
    const contextName = props.name || id;
    const contextErrors = props.errors
      .filter((err) => err.context === contextName)
      .map((err) => err.message);
    errorList.push(...contextErrors);
  }
  if (internalError) {
    errorList.push(internalError);
  }

  const hasError = errorList.length > 0;

  return (
    <div className={`mb-4 ${className}`}>
      <label
        className={`block text-sm font-medium mb-1 ${props.disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}
        htmlFor={id}
      >
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          minLength={minLength}
          maxLength={maxLength}
          min={type === 'number' ? (props.min ?? 0) : undefined}
          className={`w-full px-4 py-2.5 border rounded-xl outline-none transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-md focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary ${hasError ? 'border-red-500 hover:border-red-600' : (props.disabled ? 'border-gray-200 dark:border-gray-700' : 'border-gray-300 dark:border-gray-600 hover:border-brand-primary/50')
            } ${props.disabled ? 'bg-gray-50 cursor-not-allowed text-gray-400 dark:bg-gray-800/50 dark:text-gray-500' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'}`}
          onInvalid={(e) => {
            e.preventDefault();
            const target = e.target as HTMLInputElement;
            setInternalError(target.validationMessage);
            props.onInvalid?.(e);
          }}
          onChange={(e) => {
            const target = e.target as HTMLInputElement;
            target.setCustomValidity('');
            setInternalError('');
            props.onChange?.(e);
          }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            )}
          </button>
        )}
      </div>
      {hint && !hasError && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</p>}
      {hasError && (
        <ul className="text-red-500 text-sm mt-1 list-disc pl-5">
          {errorList.map((err, idx) => (
            <li key={idx}>{err}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
