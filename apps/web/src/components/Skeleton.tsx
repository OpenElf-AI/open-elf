import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'shimmer' | 'none';
}

const SkeletonShimmer = () => (
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]">
    <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  </div>
);

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  animation = 'shimmer',
}) => {
  const baseClasses = 'relative overflow-hidden bg-[#1A1A1A]';
  
  const animationClasses = {
    pulse: 'animate-pulse',
    shimmer: '',
    none: '',
  };

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  };

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'text' && !height) {
    style.height = '1em';
  }

  return (
    <div className={cn(baseClasses, animationClasses[animation], variantClasses[variant], className)} style={style}>
      {animation === 'shimmer' && <SkeletonShimmer />}
    </div>
  );
};

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className,
  lastLineWidth = '70%',
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} variant="text" width={index === lines - 1 ? lastLineWidth : '100%'} />
      ))}
    </div>
  );
};

interface SkeletonAgentCardProps {
  className?: string;
  index?: number;
}

export const SkeletonAgentCard: React.FC<SkeletonAgentCardProps> = ({ className, index = 0 }) => {
  const delay = index * 50;
  
  return (
    <div 
      className={cn('bg-[#121212] border border-white/5 rounded-2xl p-4 animate-fadeIn', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <Skeleton variant="circular" width={64} height={64} />
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton variant="text" width="40%" height={20} />
            <Skeleton variant="rounded" width={50} height={20} />
          </div>
          <SkeletonText lines={2} lastLineWidth="80%" />
          <div className="flex items-center gap-3">
            <Skeleton variant="text" width={60} height={14} />
            <Skeleton variant="circular" width={4} height={4} />
            <Skeleton variant="text" width={80} height={14} />
          </div>
        </div>
      </div>
    </div>
  );
};

interface SkeletonConversationCardProps {
  className?: string;
  index?: number;
}

export const SkeletonConversationCard: React.FC<SkeletonConversationCardProps> = ({ className, index = 0 }) => {
  const delay = index * 50;
  
  return (
    <div 
      className={cn('bg-[#121212] rounded-2xl p-4 animate-fadeIn', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <Skeleton variant="circular" width={64} height={64} />
        <div className="flex-1 min-w-0 pt-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton variant="text" width="35%" height={22} />
            <Skeleton variant="rounded" width={70} height={20} />
          </div>
          <Skeleton variant="text" width="90%" height={18} />
        </div>
      </div>
    </div>
  );
};

interface SkeletonProfileAgentCardProps {
  className?: string;
  index?: number;
}

export const SkeletonProfileAgentCard: React.FC<SkeletonProfileAgentCardProps> = ({ className, index = 0 }) => {
  const delay = index * 50;
  
  return (
    <div 
      className={cn('bg-[#121212] rounded-2xl p-4 border border-white/5 animate-fadeIn', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <Skeleton variant="circular" width={56} height={56} />
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton variant="text" width="45%" height={18} />
            <Skeleton variant="rounded" width={55} height={18} />
          </div>
          <SkeletonText lines={2} lastLineWidth="75%" />
          <div className="flex items-center gap-3">
            <Skeleton variant="text" width={55} height={14} />
            <Skeleton variant="circular" width={4} height={4} />
            <Skeleton variant="text" width={70} height={14} />
          </div>
        </div>
      </div>
    </div>
  );
};

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className }) => {
  return (
    <div className={cn('bg-[#121212] border border-white/5 rounded-2xl p-5', className)}>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1">
          <SkeletonText lines={2} lastLineWidth="50%" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
};

interface SkeletonListProps {
  count?: number;
  className?: string;
  type?: 'default' | 'agents' | 'conversations' | 'profile-agents';
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ 
  count = 5, 
  className, 
  type = 'default' 
}) => {
  const CardComponent = type === 'agents' 
    ? SkeletonAgentCard 
    : type === 'conversations' 
    ? SkeletonConversationCard 
    : type === 'profile-agents'
    ? SkeletonProfileAgentCard
    : SkeletonCard;

  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <CardComponent key={index} index={index} />
      ))}
    </div>
  );
};

interface SkeletonChatProps {
  className?: string;
}

export const SkeletonChat: React.FC<SkeletonChatProps> = ({ className }) => {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex gap-3">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1">
            <Skeleton variant="rounded" width="60%" height={20} className="mb-2" />
            <SkeletonText lines={2} lastLineWidth="40%" />
          </div>
        </div>
      ))}
    </div>
  );
};

interface SkeletonPageHeaderProps {
  className?: string;
  showBackButton?: boolean;
  showActionButton?: boolean;
}

export const SkeletonPageHeader: React.FC<SkeletonPageHeaderProps> = ({ 
  className,
  showBackButton = true,
  showActionButton = true,
}) => {
  return (
    <div className={cn('flex items-center justify-between mb-6', className)}>
      <div className="flex items-center gap-4">
        {showBackButton && <Skeleton variant="circular" width={36} height={36} />}
        <Skeleton variant="text" width={100} height={24} />
      </div>
      {showActionButton && <Skeleton variant="rounded" width={80} height={36} />}
    </div>
  );
};
