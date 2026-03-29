import React, { useState, useRef, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholder?: React.ReactNode;
  errorPlaceholder?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  effect?: 'blur' | 'fade' | 'none';
}

const generatePlaceholder = (width: number = 40, height: number = 40) => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#1A1A1A"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  errorPlaceholder,
  threshold = 0.1,
  rootMargin = '100px',
  effect = 'blur',
  className,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!src) {
      setIsError(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current = observer;

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [src, threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setIsError(true);
    setIsLoaded(false);
  };

  const defaultPlaceholder = (
    <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#333] border-t-primary rounded-full animate-spin" />
    </div>
  );

  const defaultErrorPlaceholder = (
    <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
      <div className="text-2xl">🖼️</div>
    </div>
  );

  const effectClasses = {
    blur: cn(
      'transition-all duration-500',
      isLoaded ? 'blur-0 scale-100' : 'blur-sm scale-105'
    ),
    fade: cn(
      'transition-opacity duration-500',
      isLoaded ? 'opacity-100' : 'opacity-0'
    ),
    none: '',
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {!isLoaded && !isError && (placeholder || defaultPlaceholder)}
      
      {isError && (errorPlaceholder || defaultErrorPlaceholder)}

      {imageSrc && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt || ''}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          className={cn(
            'w-full h-full object-cover',
            effectClasses[effect],
            isError && 'hidden'
          )}
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
