import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type EmptyStateType = 
  | 'agents' 
  | 'my-agents' 
  | 'conversations' 
  | 'favorites' 
  | 'notifications'
  | 'orders'
  | 'search'
  | 'generic';

interface EmptyStateProps {
  type: EmptyStateType;
  className?: string;
  onAction?: () => void;
  customTitle?: string;
  customDescription?: string;
  customActionText?: string;
  customIcon?: React.ReactNode;
}

const emptyStateConfigs: Record<EmptyStateType, {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
}> = {
  agents: {
    icon: <div className="text-6xl">🤖</div>,
    title: '暂无智能体',
    description: '稍后再来看看吧，或者去创建一个',
    actionText: '去发现',
  },
  'my-agents': {
    icon: <div className="text-6xl">🤖</div>,
    title: '还没有智能体',
    description: '创建你的第一个智能体，开始 AI 之旅',
    actionText: '创建智能体',
  },
  conversations: {
    icon: <div className="text-6xl">💬</div>,
    title: '还没有对话',
    description: '去发现页面找到喜欢的智能体开始聊天',
    actionText: '去发现',
  },
  favorites: {
    icon: <div className="text-6xl">❤️</div>,
    title: '还没有收藏',
    description: '收藏你喜欢的智能体，方便下次找到',
    actionText: '去发现',
  },
  notifications: {
    icon: <div className="text-6xl">🔔</div>,
    title: '暂无通知',
    description: '有新消息时会在这里显示',
  },
  orders: {
    icon: <div className="text-6xl">📦</div>,
    title: '暂无订单',
    description: '购买智能体后订单会在这里显示',
    actionText: '去广场',
  },
  search: {
    icon: <div className="text-6xl">🔍</div>,
    title: '没有找到结果',
    description: '试试其他关键词吧',
  },
  generic: {
    icon: <div className="text-6xl">📭</div>,
    title: '这里空空的',
    description: '稍后再来看看吧',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  className,
  onAction,
  customTitle,
  customDescription,
  customActionText,
  customIcon,
}) => {
  const config = emptyStateConfigs[type];
  
  const title = customTitle || config.title;
  const description = customDescription || config.description;
  const actionText = customActionText || config.actionText;
  const icon = customIcon || config.icon;

  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 text-center animate-fadeIn',
      className
    )}>
      <div className="mb-5">
        {icon}
      </div>
      
      <h3 className="text-white font-semibold text-xl mb-2">
        {title}
      </h3>
      
      <p className="text-[#888888] text-sm mb-6 leading-relaxed max-w-xs">
        {description}
      </p>
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="min-h-[44px] bg-gradient-to-r from-primary to-[#4096ff] text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all duration-300 hover:from-[#0958d9] hover:to-primary active:scale-[0.97] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
