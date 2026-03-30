import { kv } from '@vercel/kv';
import { AlphaCoin } from '@/types/index';

export async function saveTop20(coins: AlphaCoin[]): Promise<void> {
  try {
    await kv.setex(
      'alphascan:top20',
      4 * 60 * 60, // 4 hours TTL
      JSON.stringify(coins)
    );
    console.log('Top 20 coins saved to cache');
  } catch (error) {
    console.error('Error saving top 20 to cache:', error);
  }
}

export async function getTop20(): Promise<AlphaCoin[] | null> {
  try {
    const cached = await kv.get('alphascan:top20');
    if (cached) {
      return JSON.parse(cached as string);
    }
    return null;
  } catch (error) {
    console.error('Error retrieving top 20 from cache:', error);
    return null;
  }
}

export async function saveLastScanTime(): Promise<void> {
  try {
    await kv.set(
      'alphascan:last_scan',
      new Date().toISOString()
    );
    console.log('Scan timestamp saved');
  } catch (error) {
    console.error('Error saving scan timestamp:', error);
  }
}

export async function getLastScanTime(): Promise<string | null> {
  try {
    const timestamp = await kv.get('alphascan:last_scan');
    return timestamp as string | null;
  } catch (error) {
    console.error('Error retrieving last scan time:', error);
    return null;
  }
}

export async function getScanStats(): Promise<{
  total500: number;
  btcStrong: number;
  emaAligned: number;
  top20: number;
}> {
  try {
    const stats = await kv.get('alphascan:stats');
    if (stats) {
      return JSON.parse(stats as string);
    }
    return { total500: 0, btcStrong: 0, emaAligned: 0, top20: 0 };
  } catch (error) {
    console.error('Error retrieving stats:', error);
    return { total500: 0, btcStrong: 0, emaAligned: 0, top20: 0 };
  }
}

export async function saveScanStats(stats: {
  total500: number;
  btcStrong: number;
  emaAligned: number;
  top20: number;
}): Promise<void> {
  try {
    await kv.set('alphascan:stats', JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
}
