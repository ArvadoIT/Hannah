'use client';

import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
}

/**
 * Custom hook for scroll-triggered animations
 * Uses Intersection Observer API to trigger animations when elements come into view
 */
export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
    delay = 0
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If already animated and triggerOnce is true, don't observe again
    if (hasAnimated && triggerOnce) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay > 0) {
              setTimeout(() => {
                setIsVisible(true);
                if (triggerOnce) {
                  setHasAnimated(true);
                }
              }, delay);
            } else {
              setIsVisible(true);
              if (triggerOnce) {
                setHasAnimated(true);
              }
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, delay, hasAnimated]);

  // Function to set the element ref
  const setElementRef = (node: HTMLElement | null) => {
    elementRef.current = node;
  };

  return {
    elementRef,
    setElementRef,
    isVisible,
    hasAnimated,
  };
}

/**
 * Hook for staggered animations (multiple elements with delays)
 */
export function useStaggeredScrollAnimation(
  count: number,
  staggerDelay: number = 100,
  options: UseScrollAnimationOptions = {}
) {
  const [visibleElements, setVisibleElements] = useState<boolean[]>(
    new Array(count).fill(false)
  );

  const elementRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const elements = elementRefs.current.filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = elements.indexOf(entry.target as HTMLElement);
            if (index !== -1) {
              setTimeout(() => {
                setVisibleElements(prev => {
                  const newState = [...prev];
                  newState[index] = true;
                  return newState;
                });
              }, index * staggerDelay);
            }
          }
        });
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px 0px -50px 0px',
      }
    );

    elements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      elements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, [count, staggerDelay, options.threshold, options.rootMargin]);

  return {
    elementRefs,
    visibleElements,
  };
}
