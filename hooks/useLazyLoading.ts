import { useState, useEffect, useCallback, useRef } from 'react';

interface UseLazyLoadingOptions {
  rootMargin?: string;
  threshold?: number;
  enabled?: boolean;
}

export const useLazyLoading = (options: UseLazyLoadingOptions = {}) => {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    enabled = true
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsIntersecting(true);
          setHasLoaded(true);
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(elementRef.current);

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [enabled, rootMargin, threshold, hasLoaded]);

  const ref = useCallback((node: HTMLElement | null) => {
    if (node) {
      elementRef.current = node;
    }
  }, []);

  return { ref, isIntersecting, hasLoaded };
};

interface UseImageLazyLoadingOptions extends UseLazyLoadingOptions {
  src?: string;
  placeholder?: string;
}

export const useImageLazyLoading = (options: UseImageLazyLoadingOptions = {}) => {
  const { src, placeholder = '', ...lazyOptions } = options;
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { ref, isIntersecting } = useLazyLoading(lazyOptions);

  useEffect(() => {
    if (isIntersecting && src && !isLoaded && !hasError) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        setHasError(true);
      };
      img.src = src;
    }
  }, [isIntersecting, src, isLoaded, hasError]);

  return {
    ref,
    src: imageSrc,
    isLoaded,
    hasError,
    isIntersecting
  };
};

export default useLazyLoading;
