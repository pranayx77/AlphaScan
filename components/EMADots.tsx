'use client';

import { EMAValues } from '@/types/index';

interface EMADotsProps {
  alignment: boolean[];
  emas: EMAValues;
}

const periods = [
  { label: '12', key: 'ema12' as const },
  { label: '21', key: 'ema21' as const },
  { label: '34', key: 'ema34' as const },
  { label: '100', key: 'ema100' as const },
];

export default function EMADots({ alignment, emas }: EMADotsProps) {
  return (
    <div className="flex gap-2 items-center">
      <p className="text-xs text-gray-400 font-semibold">EMA:</p>
      <div className="flex gap-1">
        {periods.map((period, idx) => (
          <div
            key={period.label}
            className="group relative"
            title={`EMA${period.label}: $${emas[period.key].toFixed(2)}`}
          >
            <div
              className={`w-3 h-3 rounded-full transition-all ${
                alignment[idx]
                  ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                  : 'bg-gray-600 border border-gray-500'
              }`}
            />
            <label className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-xs text-white px-2 py-1 rounded whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
              ${emas[period.key].toFixed(2)}
            </label>
          </div>
        ))}
      </div>
      <span className="text-xs text-gray-400">
        {alignment.filter(Boolean).length}/4
      </span>
    </div>
  );
}
