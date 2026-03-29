import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className, ...props }) => (
  <div className={cn('bg-card rounded-2xl shadow-elevation', className)} {...props} />
);

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader: React.FC<CardHeaderProps> = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-2 p-6', className)} {...props} />
);

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle: React.FC<CardTitleProps> = ({ className, ...props }) => (
  <h3 className={cn('text-title font-medium', className)} {...props} />
);

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription: React.FC<CardDescriptionProps> = ({ className, ...props }) => (
  <p className={cn('text-caption text-muted-foreground', className)} {...props} />
);

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent: React.FC<CardContentProps> = ({ className, ...props }) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
);

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter: React.FC<CardFooterProps> = ({ className, ...props }) => (
  <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
);
