'use client';

interface StrengthBarProps {
  score: number;
  coinChange: number;
}

export default function StrengthBar({ score, coinChange }: StrengthBarProps) {
  const getColor = () => {
    if (score >= 70) return 'from-emerald-500 to-green-600';
    if (score >= 50) return 'from-yellow-500 to-amber-600';
    return 'from-orange-500 to-red-600';
  };

  const getLabel = () => {
    if (score >= 70) return '🔥 Strong';
    if (score >= 50) return '⚡ Moderate';
    return '⏱️ Weak';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold text-gray-400">{getLabel()}</span>
        <span className="text-xs font-bold text-emerald-400">
          +{coinChange.toFixed(2)}% vs BTC
        </span>
      </div>
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getColor()} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
