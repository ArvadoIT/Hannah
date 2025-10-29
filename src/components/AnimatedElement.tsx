'use client';

import { ReactNode, forwardRef, useCallback } from 'react';
import { useScrollAnimation, useStaggeredScrollAnimation } from '@/hooks/useScrollAnimation';

interface AnimatedElementProps {
  children: ReactNode;
  className?: string;
  animationType?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeIn' | 'scaleIn';
  delay?: number;
  duration?: number;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  style?: React.CSSProperties;
}

/**
 * AnimatedElement - A wrapper component that adds scroll-triggered animations
 * Supports multiple animation types and customizable timing
 */
export const AnimatedElement = forwardRef<HTMLDivElement, AnimatedElementProps>(
  ({
    children,
    className = '',
    animationType = 'fadeInUp',
    delay = 0,
    duration = 600,
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
    style = {},
    ...props
  }, ref) => {
    const { setElementRef, isVisible } = useScrollAnimation({
      threshold,
      rootMargin,
      triggerOnce,
      delay,
    });

    // Use a separate ref for the element
    const elementRefCallback = useCallback((node: HTMLDivElement | null) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref && 'current' in ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
      // Set the element ref for the hook
      setElementRef(node);
    }, [ref, setElementRef]);

    const getAnimationStyles = () => {
      const baseStyles: React.CSSProperties = {
        transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
        // Mobile optimizations
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
        ...style,
      };

      if (!isVisible) {
        switch (animationType) {
          case 'fadeInUp':
            return {
              ...baseStyles,
              opacity: 0,
              transform: 'translateY(30px)',
            };
          case 'fadeInLeft':
            return {
              ...baseStyles,
              opacity: 0,
              transform: 'translateX(-30px)',
            };
          case 'fadeInRight':
            return {
              ...baseStyles,
              opacity: 0,
              transform: 'translateX(30px)',
            };
          case 'fadeIn':
            return {
              ...baseStyles,
              opacity: 0,
            };
          case 'scaleIn':
            return {
              ...baseStyles,
              opacity: 0,
              transform: 'scale(0.9)',
            };
          default:
            return {
              ...baseStyles,
              opacity: 0,
              transform: 'translateY(30px)',
            };
        }
      }

      return {
        ...baseStyles,
        opacity: 1,
        transform: 'translateY(0) translateX(0) scale(1)',
      };
    };

    return (
      <div
        ref={elementRefCallback}
        className={className}
        style={getAnimationStyles()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AnimatedElement.displayName = 'AnimatedElement';

/**
 * StaggeredContainer - For animating multiple children with staggered delays
 */
interface StaggeredContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  animationType?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeIn' | 'scaleIn';
  duration?: number;
  threshold?: number;
  rootMargin?: string;
  style?: React.CSSProperties;
}

export const StaggeredContainer = forwardRef<HTMLDivElement, StaggeredContainerProps>(
  ({
    children,
    className = '',
    staggerDelay = 100,
    animationType = 'fadeInUp',
    duration = 600,
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    style = {},
    ...props
  }, ref) => {
    const childrenArray = Array.isArray(children) ? children : [children];
    const { elementRefs, visibleElements } = useStaggeredScrollAnimation(
      childrenArray.length,
      staggerDelay,
      { threshold, rootMargin }
    );

    const getChildAnimationStyles = (index: number) => {
      const baseStyles: React.CSSProperties = {
        transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
        // Mobile optimizations
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
      };

      if (!visibleElements[index]) {
        switch (animationType) {
          case 'fadeInUp':
            return {
              ...baseStyles,
              opacity: 0,
              transform: 'translateY(30px)',
            };
          case 'fadeInLeft':
            return {
              ...baseStyles,
              opacity: 0,
              transform: 'translateX(-30px)',
            };
          case 'fadeInRight':
            return {
              ...baseStyles,
              opacity: 0,
              transform: 'translateX(30px)',
            };
          case 'fadeIn':
            return {
              ...baseStyles,
              opacity: 0,
            };
          case 'scaleIn':
            return {
              ...baseStyles,
              opacity: 0,
              transform: 'scale(0.9)',
            };
          default:
            return {
              ...baseStyles,
              opacity: 0,
              transform: 'translateY(30px)',
            };
        }
      }

      return {
        ...baseStyles,
        opacity: 1,
        transform: 'translateY(0) translateX(0) scale(1)',
      };
    };

    return (
      <div ref={ref} className={className} style={style} {...props}>
        {childrenArray.map((child, index) => (
          <div
            key={index}
            ref={(node) => {
              elementRefs.current[index] = node;
            }}
            style={getChildAnimationStyles(index)}
          >
            {child}
          </div>
        ))}
      </div>
    );
  }
);

StaggeredContainer.displayName = 'StaggeredContainer';
