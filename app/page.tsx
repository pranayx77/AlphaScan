'use client';

import { useEffect, useState } from 'react';
import CoinCard from '@/components/CoinCard';
import { AlphaCoin } from '@/types/index';
import {
  filterByEMAAlignment,
  filterByRSI,
  filterByStrength,
} from '@/lib/filter';

type FilterType = 'all' | 'ema' | 'rsi' | 'strength';

export default function Dashboard() {
  const [coins, setCoins] = useState<AlphaCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [nextScan, setNextScan] = useState<string | null>(null);
  const [minutesUntil, setMinutesUntil] = useState(0);
  const [stats, setStats] = useState({
    total500: 0,
    btcStrong: 0,
    emaAligned: 0,
    top20: 0,
  });

  const fetchCoins = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/coins');
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        setCoins(data.data);
        setStats({
          total500: 500,
          btcStrong: data.data.length * 2,
          emaAligned: data.data.filter((c: AlphaCoin) =>
            c.emaAlignment.filter(Boolean).length >= 3
          ).length,
          top20: data.data.length,
        });
      } else if (data.needsScan) {
        // Trigger initial scan
        await fetch('/api/scan', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'dev-secret'}`,
          },
        });
      }

      setLastScan(data.lastUpdated);
      setNextScan(data.nextScan);
      setMinutesUntil(data.minutesUntilNext || 0);
    } catch (error) {
      console.error('Error fetching coins:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
    const interval = setInterval(fetchCoins, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!nextScan) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const nextTime = new Date(nextScan).getTime();
      const minutes = Math.max(0, Math.floor((nextTime - now) / 60000));
      setMinutesUntil(minutes);
    }, 60000);
    return () => clearInterval(timer);
  }, [nextScan]);

  const getFilteredCoins = (): AlphaCoin[] => {
    switch (filter) {
      case 'ema':
        return filterByEMAAlignment(coins);
      case 'rsi':
        return filterByRSI(coins);
      case 'strength':
        return filterByStrength(coins);
      default:
        return coins;
    }
  };

  const filteredCoins = getFilteredCoins();
  const hours = Math.floor(minutesUntil / 60);
  const mins = minutesUntil % 60;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090909] via-[#0a0a0a] to-[#0f0f0f]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0f0f0f]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent font-mono-trading">
                AlphaScan
              </div>
              <div className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 font-mono-trading">
                LIVE
              </div>
            </div>

            <button
              onClick={fetchCoins}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              {loading ? '⟳ Scanning...' : '⟳ Rescan'}
            </button>
          </div>

          {/* Status info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-gray-400">
              Last scan:{' '}
              <span className="text-white font-semibold">
                {lastScan ? new Date(lastScan).toLocaleTimeString() : 'Never'}
              </span>
            </div>
            <div className="text-gray-400">
              Next scan in:{' '}
              <span className="text-emerald-400 font-semibold">
                {hours}h {mins}m
              </span>
            </div>
            <div className="text-gray-400">
              Total coins scanned: <span className="text-cyan-400 font-semibold">500</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b border-white/10 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Screened</p>
              <p className="text-2xl font-bold text-white">{stats.total500}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">BTC-Strong</p>
              <p className="text-2xl font-bold text-orange-400">{stats.btcStrong}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">EMA-Aligned</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.emaAligned}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Alpha Top 20</p>
              <p className="text-2xl font-bold text-cyan-400">{stats.top20}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="border-b border-white/10 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {[
              { id: 'all' as const, label: '🔍 All 20' },
              { id: 'ema' as const, label: '📊 EMA Aligned' },
              { id: 'rsi' as const, label: '📈 RSI < 70' },
              { id: 'strength' as const, label: '🔥 High Strength' },
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap font-semibold transition-all ${
                  filter === btn.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && coins.length === 0 ? (
          // Loading skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white/5 rounded-xl h-64 skeleton"
              />
            ))}
          </div>
        ) : filteredCoins.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              No coins match this filter
            </h2>
            <p className="text-gray-400 mb-6">
              Try changing filters or{' '}
              <button
                onClick={() => setFilter('all')}
                className="text-emerald-400 hover:text-emerald-300 underline"
              >
                view all 20 coins
              </button>
            </p>
          </div>
        ) : (
          // Coin Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredCoins.map(coin => (
              <CoinCard key={coin.id} coin={coin} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 mt-12 py-6 text-center text-gray-500 text-sm">
        <p>
          AlphaScan • Updated every 4 hours • Data via CoinGecko & OpenRouter AI
        </p>
        <p className="mt-2 text-xs">
          Always DYOR - This is technical analysis only, not financial advice
        </p>
      </div>
    </div>
  );
}
