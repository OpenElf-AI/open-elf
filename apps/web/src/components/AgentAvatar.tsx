import React from 'react';
import { LazyImage } from './LazyImage';

interface AgentAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  src?: string;
  alt?: string;
  className?: string;
}

const AgentAvatar: React.FC<AgentAvatarProps> = ({ 
  size = 'md', 
  src, 
  alt = '智能体头像',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const defaultPlaceholder = (
    <div className="w-full h-full bg-gradient-to-br from-[#1677FF] to-[#0958d9] flex items-center justify-center">
      <svg className="w-1/2 h-1/2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    </div>
  );

  if (src) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
        <LazyImage
          src={src}
          alt={alt}
          placeholder={defaultPlaceholder}
          errorPlaceholder={defaultPlaceholder}
          effect="blur"
          className="w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full ${className}`}>
      {defaultPlaceholder}
    </div>
  );
};

export default AgentAvatar;
