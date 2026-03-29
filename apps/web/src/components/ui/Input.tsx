import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input: React.FC<InputProps> = ({ className, error, ...props }) => (
  <div className="w-full">
    <input
      className={cn(
        'flex h-12 w-full border-0 border-b border-border bg-transparent px-0 py-2 text-body placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-0 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-red-500 focus:border-red-500',
        className
      )}
      {...props}
    />
    {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
  </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  maxLength?: number;
  currentLength?: number;
}

export const Textarea: React.FC<TextareaProps> = ({
  className,
  error,
  maxLength,
  currentLength,
  ...props
}) => (
  <div className="w-full">
    <textarea
      className={cn(
        'flex min-h-[100px] w-full border-0 border-b border-border bg-transparent px-0 py-2 text-body placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-0 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
        error && 'border-red-500 focus:border-red-500',
        className
      )}
      {...props}
    />
    <div className="flex justify-between mt-2">
      {error && <p className="text-sm text-red-500">{error}</p>}
      {maxLength !== undefined && (
        <p
          className={cn(
            'text-caption',
            currentLength && currentLength > maxLength ? 'text-red-500' : 'text-muted-foreground'
          )}
        >
          {currentLength || 0}/{maxLength}
        </p>
      )}
    </div>
  </div>
);
