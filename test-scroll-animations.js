/**
 * Test script to verify scroll animations are working
 * This can be run in the browser console to test the animations
 */

// Test function to verify scroll animations
function testScrollAnimations() {
  console.log('Testing scroll animations...');
  
  // Check if IntersectionObserver is available
  if (typeof IntersectionObserver === 'undefined') {
    console.error('IntersectionObserver not supported');
    return false;
  }
  
  // Check if animated elements exist
  const animatedElements = document.querySelectorAll('[style*="transition"]');
  console.log(`Found ${animatedElements.length} elements with transitions`);
  
  // Check if elements have proper animation styles
  let hasAnimations = false;
  animatedElements.forEach((el, index) => {
    const style = window.getComputedStyle(el);
    const hasTransform = style.transform !== 'none';
    const hasOpacity = style.opacity !== '1';
    const hasTransition = style.transition.includes('transform') || style.transition.includes('opacity');
    
    if (hasTransition) {
      hasAnimations = true;
      console.log(`Element ${index}: has transition, transform: ${hasTransform}, opacity: ${hasOpacity}`);
    }
  });
  
  if (hasAnimations) {
    console.log('✅ Scroll animations are properly implemented');
    return true;
  } else {
    console.log('❌ No scroll animations found');
    return false;
  }
}

// Test mobile viewport behavior
function testMobileViewport() {
  console.log('Testing mobile viewport behavior...');
  
  // Simulate mobile viewport
  const originalWidth = window.innerWidth;
  const originalHeight = window.innerHeight;
  
  // Set mobile viewport
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 375
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 667
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
  
  // Check if animations still work
  const result = testScrollAnimations();
  
  // Restore original viewport
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: originalWidth
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: originalHeight
  });
  
  window.dispatchEvent(new Event('resize'));
  
  return result;
}

// Export functions for testing
if (typeof window !== 'undefined') {
  window.testScrollAnimations = testScrollAnimations;
  window.testMobileViewport = testMobileViewport;
  console.log('Scroll animation test functions loaded. Run testScrollAnimations() or testMobileViewport() to test.');
}
