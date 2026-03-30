import { NextRequest, NextResponse } from 'next/server';
import { getTop20, getLastScanTime } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const cached = await getTop20();
    const lastScan = await getLastScanTime();

    if (!cached) {
      return NextResponse.json({
        data: [],
        needsScan: true,
        lastUpdated: null,
        nextScan: null,
      });
    }

    const lastScanTime = lastScan ? new Date(lastScan).getTime() : 0;
    const now = Date.now();
    const nextScanTime = lastScanTime + 4 * 60 * 60 * 1000;

    return NextResponse.json({
      data: cached,
      needsScan: false,
      lastUpdated: lastScan,
      nextScan: new Date(nextScanTime).toISOString(),
      minutesUntilNext: Math.max(0, Math.floor((nextScanTime - now) / 60000)),
    });
  } catch (error) {
    console.error('Error fetching cached coins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coins' },
      { status: 500 }
    );
  }
}
