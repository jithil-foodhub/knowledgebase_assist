import { NextResponse } from 'next/server';
import { HealthCheckResponse } from '@/types';

// Track application start time for uptime calculation
const startTime = Date.now();

export async function GET() {
  const timestamp = new Date().toISOString();
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  const healthCheck: HealthCheckResponse = {
    status: 'healthy',
    timestamp,
    version: '1.0.0',
    uptime,
    environment: process.env.NODE_ENV || 'development',
  };

  return NextResponse.json(healthCheck, { status: 200 });
}

// Also support HEAD requests for simple health checks
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
