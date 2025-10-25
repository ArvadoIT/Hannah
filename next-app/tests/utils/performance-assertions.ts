import { expect } from '@playwright/test';
import { PerformanceMetrics, ConsoleMessage, NetworkRequest } from '../fixtures/performance-monitor';

/**
 * Performance thresholds for different types of pages
 */
export const PERFORMANCE_THRESHOLDS = {
  // Navigation timing thresholds (in milliseconds)
  domContentLoaded: 2000,
  loadComplete: 3000,
  ttfb: 800,
  
  // Core Web Vitals thresholds
  lcp: 2500, // Largest Contentful Paint (Good: < 2.5s)
  fid: 100, // First Input Delay (Good: < 100ms)
  cls: 0.1, // Cumulative Layout Shift (Good: < 0.1)
  fcp: 1800, // First Contentful Paint (Good: < 1.8s)
  
  // Resource thresholds
  maxRequests: 50,
  maxFailedRequests: 0,
  maxTotalSize: 6 * 1024 * 1024, // 6MB (realistic for Next.js with images)
  maxImageSize: 4 * 1024 * 1024, // 4MB (for all images)
  maxScriptSize: 2 * 1024 * 1024, // 2MB (Next.js bundles)
  
  // Memory thresholds (in bytes)
  maxMemoryUsage: 60 * 1024 * 1024, // 60MB (realistic for modern React apps)
};

/**
 * Assert that performance metrics meet the defined thresholds
 */
export async function expectGoodPerformance(
  metrics: PerformanceMetrics,
  customThresholds?: Partial<typeof PERFORMANCE_THRESHOLDS>
) {
  const thresholds = { ...PERFORMANCE_THRESHOLDS, ...customThresholds };

  // Navigation timing checks
  expect(
    metrics.domContentLoaded,
    `DOM Content Loaded time (${metrics.domContentLoaded}ms) should be under ${thresholds.domContentLoaded}ms`
  ).toBeLessThan(thresholds.domContentLoaded);

  expect(
    metrics.loadComplete,
    `Load Complete time (${metrics.loadComplete}ms) should be under ${thresholds.loadComplete}ms`
  ).toBeLessThan(thresholds.loadComplete);

  if (metrics.ttfb) {
    expect(
      metrics.ttfb,
      `Time to First Byte (${metrics.ttfb}ms) should be under ${thresholds.ttfb}ms`
    ).toBeLessThan(thresholds.ttfb);
  }

  // Core Web Vitals checks
  if (metrics.lcp) {
    expect(
      metrics.lcp,
      `LCP (${metrics.lcp}ms) should be under ${thresholds.lcp}ms`
    ).toBeLessThan(thresholds.lcp);
  }

  if (metrics.cls) {
    expect(
      metrics.cls,
      `CLS (${metrics.cls}) should be under ${thresholds.cls}`
    ).toBeLessThan(thresholds.cls);
  }

  // Resource checks
  expect(
    metrics.totalRequests,
    `Total requests (${metrics.totalRequests}) should be under ${thresholds.maxRequests}`
  ).toBeLessThan(thresholds.maxRequests);

  expect(
    metrics.failedRequests,
    `Failed requests (${metrics.failedRequests}) should be ${thresholds.maxFailedRequests}`
  ).toBe(thresholds.maxFailedRequests);

  expect(
    metrics.resourceSizes.total,
    `Total resource size (${formatBytes(metrics.resourceSizes.total)}) should be under ${formatBytes(thresholds.maxTotalSize)}`
  ).toBeLessThan(thresholds.maxTotalSize);

  // Memory checks (if available)
  if (metrics.usedJSHeapSize) {
    expect(
      metrics.usedJSHeapSize,
      `Used JS Heap Size (${formatBytes(metrics.usedJSHeapSize)}) should be under ${formatBytes(thresholds.maxMemoryUsage)}`
    ).toBeLessThan(thresholds.maxMemoryUsage);
  }
}

/**
 * Assert no console errors
 */
export async function expectNoConsoleErrors(
  messages: ConsoleMessage[],
  allowedPatterns: RegExp[] = []
) {
  const errors = messages.filter(msg => msg.type === 'error');
  
  const actualErrors = errors.filter(error => {
    return !allowedPatterns.some(pattern => pattern.test(error.text));
  });

  if (actualErrors.length > 0) {
    const errorDetails = actualErrors.map(
      error => `  - ${error.text} (${error.location || 'unknown location'})`
    ).join('\n');
    
    throw new Error(`Found ${actualErrors.length} console error(s):\n${errorDetails}`);
  }
}

/**
 * Assert no console warnings
 */
export async function expectNoConsoleWarnings(
  messages: ConsoleMessage[],
  allowedPatterns: RegExp[] = []
) {
  const warnings = messages.filter(msg => msg.type === 'warning');
  
  const actualWarnings = warnings.filter(warning => {
    return !allowedPatterns.some(pattern => pattern.test(warning.text));
  });

  if (actualWarnings.length > 0) {
    const warningDetails = actualWarnings.map(
      warning => `  - ${warning.text} (${warning.location || 'unknown location'})`
    ).join('\n');
    
    throw new Error(`Found ${actualWarnings.length} console warning(s):\n${warningDetails}`);
  }
}

/**
 * Assert no failed network requests
 */
export async function expectNoFailedRequests(
  requests: NetworkRequest[],
  allowedUrls: RegExp[] = []
) {
  const failedRequests = requests.filter(req => req.failed || req.status >= 400);
  
  const actualFailures = failedRequests.filter(req => {
    return !allowedUrls.some(pattern => pattern.test(req.url));
  });

  if (actualFailures.length > 0) {
    const failureDetails = actualFailures.map(
      req => `  - ${req.method} ${req.url} (${req.status || 'failed'})`
    ).join('\n');
    
    throw new Error(`Found ${actualFailures.length} failed request(s):\n${failureDetails}`);
  }
}

/**
 * Assert efficient resource loading
 */
export async function expectEfficientResourceLoading(
  requests: NetworkRequest[],
  maxDuration: number = 3000
) {
  const slowRequests = requests.filter(req => req.timing > maxDuration && !req.failed);
  
  if (slowRequests.length > 0) {
    const slowDetails = slowRequests.map(
      req => `  - ${req.method} ${req.url} (${req.timing}ms)`
    ).join('\n');
    
    console.warn(`Found ${slowRequests.length} slow request(s):\n${slowDetails}`);
  }

  expect(
    slowRequests.length,
    `Should have no requests taking longer than ${maxDuration}ms`
  ).toBe(0);
}

/**
 * Generate a performance report
 */
export function generatePerformanceReport(
  metrics: PerformanceMetrics,
  consoleMessages: ConsoleMessage[],
  networkRequests: NetworkRequest[]
): string {
  const report = [];
  
  report.push('=== Performance Report ===\n');
  
  // Navigation Timing
  report.push('Navigation Timing:');
  report.push(`  DOM Content Loaded: ${metrics.domContentLoaded}ms`);
  report.push(`  Load Complete: ${metrics.loadComplete}ms`);
  if (metrics.ttfb) report.push(`  TTFB: ${metrics.ttfb}ms`);
  report.push('');
  
  // Core Web Vitals
  if (metrics.lcp || metrics.fid || metrics.cls) {
    report.push('Core Web Vitals:');
    if (metrics.lcp) report.push(`  LCP: ${metrics.lcp}ms`);
    if (metrics.fid) report.push(`  FID: ${metrics.fid}ms`);
    if (metrics.cls) report.push(`  CLS: ${metrics.cls}`);
    if (metrics.fcp) report.push(`  FCP: ${metrics.fcp}ms`);
    report.push('');
  }
  
  // Resources
  report.push('Resources:');
  report.push(`  Total Requests: ${metrics.totalRequests}`);
  report.push(`  Failed Requests: ${metrics.failedRequests}`);
  report.push(`  Total Size: ${formatBytes(metrics.resourceSizes.total)}`);
  report.push(`  Images: ${formatBytes(metrics.resourceSizes.images)}`);
  report.push(`  Scripts: ${formatBytes(metrics.resourceSizes.scripts)}`);
  report.push(`  Stylesheets: ${formatBytes(metrics.resourceSizes.stylesheets)}`);
  report.push(`  Fonts: ${formatBytes(metrics.resourceSizes.fonts)}`);
  report.push('');
  
  // Memory
  if (metrics.usedJSHeapSize) {
    report.push('Memory Usage:');
    report.push(`  Used: ${formatBytes(metrics.usedJSHeapSize)}`);
    report.push(`  Total: ${formatBytes(metrics.totalJSHeapSize || 0)}`);
    report.push(`  Limit: ${formatBytes(metrics.jsHeapSizeLimit || 0)}`);
    report.push('');
  }
  
  // Console Messages
  const errors = consoleMessages.filter(m => m.type === 'error').length;
  const warnings = consoleMessages.filter(m => m.type === 'warning').length;
  report.push('Console Messages:');
  report.push(`  Errors: ${errors}`);
  report.push(`  Warnings: ${warnings}`);
  report.push(`  Total Messages: ${consoleMessages.length}`);
  report.push('');
  
  // Network Summary
  const failedReqs = networkRequests.filter(r => r.failed || r.status >= 400).length;
  const avgTiming = networkRequests.reduce((sum, r) => sum + r.timing, 0) / networkRequests.length;
  report.push('Network Summary:');
  report.push(`  Total Requests: ${networkRequests.length}`);
  report.push(`  Failed: ${failedReqs}`);
  report.push(`  Average Timing: ${avgTiming.toFixed(2)}ms`);
  
  return report.join('\n');
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

