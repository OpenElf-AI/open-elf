import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  hint,
  required = false,
  className,
  children,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="flex items-center gap-1 text-sm font-medium text-white">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {children}
      
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
      
      {!error && hint && (
        <p className="text-sm text-[#666666]">{hint}</p>
      )}
    </div>
  );
};

interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  error?: boolean;
  className?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  error = false,
  className,
  ...props
}) => {
  return (
    <input
      className={cn(
        'w-full bg-[#1A1A1A] border rounded-xl px-4 py-3.5 text-white placeholder-[#666666] focus:outline-none transition-all duration-200 min-h-[44px]',
        error
          ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
          : 'border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 hover:border-white/20',
        className
      )}
      {...props}
    />
  );
};

interface FormTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  error?: boolean;
  className?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  error = false,
  className,
  ...props
}) => {
  return (
    <textarea
      className={cn(
        'w-full bg-[#1A1A1A] border rounded-xl px-4 py-3.5 text-white placeholder-[#666666] focus:outline-none transition-all duration-200 resize-none min-h-[100px]',
        error
          ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
          : 'border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 hover:border-white/20',
        className
      )}
      {...props}
    />
  );
};

interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  error?: boolean;
  className?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  error = false,
  className,
  ...props
}) => {
  return (
    <select
      className={cn(
        'w-full bg-[#1A1A1A] border rounded-xl px-4 py-3.5 text-white focus:outline-none transition-all duration-200 min-h-[44px] cursor-pointer',
        error
          ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
          : 'border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 hover:border-white/20',
        className
      )}
      {...props}
    />
  );
};

export default FormField;
