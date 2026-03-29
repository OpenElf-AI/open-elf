import React, { useState, useEffect, useRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
  className?: string;
  formatValue?: (value: number) => string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  from,
  to,
  duration = 1000,
  className,
  formatValue = (v) => v.toString(),
}) => {
  const [count, setCount] = useState(from);
  const startTimeRef = useRef<number>();
  const frameRef = useRef<number>();

  useEffect(() => {
    startTimeRef.current = performance.now();
    
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) return;
      
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(from + (to - from) * easeOutQuart);
      
      setCount(currentValue);
      
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    
    frameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [from, to, duration]);

  return <span className={className}>{formatValue(count)}</span>;
};

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  threshold?: number;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  className,
  threshold = 0.1,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay, threshold]);

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-500',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className
      )}
    >
      {children}
    </div>
  );
};

interface StaggerProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
  itemClassName?: string;
}

export const Stagger: React.FC<StaggerProps> = ({
  children,
  staggerDelay = 100,
  className,
  itemClassName,
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <FadeIn key={index} delay={index * staggerDelay} className={itemClassName}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
};

interface BounceProps {
  children: React.ReactNode;
  trigger?: boolean;
  className?: string;
  onComplete?: () => void;
}

export const Bounce: React.FC<BounceProps> = ({
  children,
  trigger = true,
  className,
  onComplete,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onComplete?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  return (
    <div
      className={cn(
        isAnimating ? 'animate-bounceIn' : '',
        className
      )}
    >
      {children}
    </div>
  );
};

interface ShakeProps {
  children: React.ReactNode;
  trigger?: boolean;
  className?: string;
}

export const Shake: React.FC<ShakeProps> = ({
  children,
  trigger = false,
  className,
}) => {
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div className={cn(isShaking ? 'animate-shake' : '', className)}>
      {children}
    </div>
  );
};

interface PulseProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  active = true,
  className,
}) => {
  return (
    <div className={cn(active ? 'animate-pulse-soft' : '', className)}>
      {children}
    </div>
  );
};

interface ScaleInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  className,
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        'transition-all duration-300',
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        className
      )}
    >
      {children}
    </div>
  );
};

interface HeartbeatProps {
  children: React.ReactNode;
  trigger?: boolean;
  className?: string;
}

export const Heartbeat: React.FC<HeartbeatProps> = ({
  children,
  trigger = false,
  className,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div className={cn(isAnimating ? 'animate-heartBeat' : '', className)}>
      {children}
    </div>
  );
};

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
  delay?: number;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'right',
  className,
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const directionClasses = {
    left: 'translate-x-[-20px]',
    right: 'translate-x-[20px]',
    up: 'translate-y-[-20px]',
    down: 'translate-y-[20px]',
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        'transition-all duration-300',
        isVisible
          ? 'opacity-100 translate-x-0 translate-y-0'
          : `opacity-0 ${directionClasses[direction]}`,
        className
      )}
    >
      {children}
    </div>
  );
};

export default {
  AnimatedCounter,
  FadeIn,
  Stagger,
  Bounce,
  Shake,
  Pulse,
  ScaleIn,
  Heartbeat,
  SlideIn,
};
