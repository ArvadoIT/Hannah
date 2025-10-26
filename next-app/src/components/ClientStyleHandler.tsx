'use client';

import { useEffect } from 'react';

/**
 * Client-side style handler to avoid hydration mismatches
 * Applies critical styles only on the client side with proper error handling
 */
export default function ClientStyleHandler() {
  useEffect(() => {
    // Safety check to ensure we're in the browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    try {
      // Apply critical styles to html and body elements with null checks
      if (document.documentElement) {
        document.documentElement.style.backgroundColor = '#faf8f5';
        document.documentElement.style.margin = '0';
        document.documentElement.style.padding = '0';
      }
      
      if (document.body) {
        document.body.style.backgroundColor = '#faf8f5';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
      }
    } catch (error) {
      // Log error in development but don't crash the app
      if (process.env.NODE_ENV === 'development') {
        console.warn('ClientStyleHandler: Error applying styles:', error);
      }
    }

    // Cleanup function to prevent memory leaks
    return () => {
      try {
        // Reset styles on unmount if needed
        if (typeof window !== 'undefined' && document.documentElement) {
          document.documentElement.style.backgroundColor = '';
          document.documentElement.style.margin = '';
          document.documentElement.style.padding = '';
        }
        
        if (typeof window !== 'undefined' && document.body) {
          document.body.style.backgroundColor = '';
          document.body.style.margin = '';
          document.body.style.padding = '';
        }
      } catch (error) {
        // Silently handle cleanup errors
        if (process.env.NODE_ENV === 'development') {
          console.warn('ClientStyleHandler: Error during cleanup:', error);
        }
      }
    };
  }, []);

  return null; // This component doesn't render anything
}
