import React from 'react';
import { useAppStore, useUserStore } from '../store';

const BottomNav: React.FC = () => {
  const { currentView, setCurrentView } = useAppStore();
  const { user } = useUserStore();

  const isActive = (page: string) => {
    if (typeof currentView === 'string') {
      return currentView === page;
    }
    return false;
  };

  const navItems = [
    {
      id: 'chat' as const,
      label: '对话',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
    {
      id: 'discover' as const,
      label: '广场',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      id: 'notifications' as const,
      label: '通知',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
    },
    {
      id: 'profile' as const,
      label: '我的',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl border-t border-white/10" />
      <div className="relative flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-200 active:scale-[0.95] ${
              isActive(item.id) ? 'text-primary' : 'text-[#666666] hover:text-[#888888]'
            }`}
            aria-current={isActive(item.id) ? 'page' : undefined}
          >
            <div
              className={`relative transition-all duration-200 ${
                isActive(item.id) ? 'scale-110' : ''
              }`}
            >
              {item.icon}
              {isActive(item.id) && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </div>
            <span
              className={`text-xs font-medium transition-all duration-200 ${
                isActive(item.id) ? 'opacity-100' : 'opacity-70'
              }`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
