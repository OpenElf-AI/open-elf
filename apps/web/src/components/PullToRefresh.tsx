import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  disabled?: boolean;
  pullThreshold?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  disabled = false,
  pullThreshold = 80,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    const container = containerRef.current;
    if (!container) return;
    
    if (container.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;
    
    if (distance > 0) {
      e.preventDefault();
      const clampedDistance = Math.min(distance * 0.5, pullThreshold * 1.5);
      setPullDistance(clampedDistance);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    setIsPulling(false);
    
    if (pullDistance >= pullThreshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  const getRefreshIcon = () => {
    const progress = Math.min(pullDistance / pullThreshold, 1);
    const rotation = progress * 360;
    
    if (isRefreshing) {
      return (
        <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      );
    }
    
    return (
      <svg
        className="w-6 h-6 text-primary transition-transform duration-200"
        style={{ transform: `rotate(${rotation}deg)` }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    );
  };

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{
          height: Math.max(pullDistance, 0),
          opacity: pullDistance > 10 ? 1 : 0,
        }}
      >
        {getRefreshIcon()}
      </div>
      {children}
    </div>
  );
};
