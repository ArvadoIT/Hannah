/**
 * Analytics Page
 * Protected analytics dashboard
 */

import { redirect } from 'next/navigation';

export default function AnalyticsPage() {
  // In a real implementation, check authentication here
  // For now, redirect to login
  redirect('/login');
}

