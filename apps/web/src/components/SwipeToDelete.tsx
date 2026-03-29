import React, { useState, useRef, ReactNode } from 'react';

interface SwipeToDeleteProps {
  onDelete: () => void;
  children: ReactNode;
  deleteText?: string;
  threshold?: number;
  disabled?: boolean;
}

export const SwipeToDelete: React.FC<SwipeToDeleteProps> = ({
  onDelete,
  children,
  deleteText = '删除',
  threshold = 100,
  disabled = false,
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || disabled) return;
    
    currentX.current = e.touches[0].clientX;
    const diff = startX.current - currentX.current;
    
    if (diff > 0) {
      e.preventDefault();
      const clampedDiff = Math.min(diff, threshold * 1.5);
      setTranslateX(-clampedDiff);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);
    
    const diff = startX.current - currentX.current;
    
    if (diff >= threshold) {
      setTranslateX(-threshold * 1.2);
      setTimeout(() => {
        onDelete();
        setTranslateX(0);
      }, 200);
    } else {
      setTranslateX(0);
    }
  };

  const deleteWidth = Math.min(Math.abs(translateX), threshold);
  const deleteOpacity = Math.min(Math.abs(translateX) / threshold, 1);

  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute inset-0 flex items-center justify-end bg-red-500"
        style={{
          opacity: deleteOpacity,
          paddingRight: deleteWidth * 0.3,
        }}
      >
        <span className="text-white font-medium px-4">{deleteText}</span>
      </div>
      <div
        className="relative transition-transform duration-200 ease-out"
        style={{
          transform: `translateX(${translateX}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};
