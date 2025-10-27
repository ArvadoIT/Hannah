/**
 * Health Check API Route
 * Tests database connectivity and service availability
 */

import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/db';
import { isEmailEnabled } from '@/lib/email';
import { isSmsEnabled } from '@/lib/sms';

export async function GET() {
  try {
    // Skip health check during build process
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({
        status: 'build-mode',
        timestamp: new Date().toISOString(),
        message: 'Health check skipped during build',
        environment: process.env.NODE_ENV,
      }, { status: 200 });
    }

    // Test database connection
    const dbConnected = await testConnection();

    // Check service availability
    const services = {
      database: dbConnected,
      email: isEmailEnabled(),
      sms: isSmsEnabled(),
    };

    const status = dbConnected ? 200 : 503;

    return NextResponse.json({
      status: dbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services,
      environment: process.env.NODE_ENV,
    }, { status });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    }, { status: 503 });
  }
}

