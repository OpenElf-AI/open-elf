import React from 'react';
import { useAppStore } from '../store';

export const GlobalLoading: React.FC = () => {
  const { isLoading } = useAppStore();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-white text-base">加载中...</p>
      </div>
    </div>
  );
};
