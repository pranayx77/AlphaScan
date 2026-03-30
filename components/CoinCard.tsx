'use client';

import { AlphaCoin } from '@/types/index';
import CoinImage from './CoinImage';
import StrengthBar from './StrengthBar';
import EMADots from './EMADots';
import { useState } from 'react';
import DeepDiveModal from './DeepDiveModal';

interface CoinCardProps {
  coin: AlphaCoin;
}

export default function CoinCard({ coin }: CoinCardProps) {
  const [showModal, setShowModal] = useState(false);

  const changeColor = coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="bg-[#0f0f0f] border border-white/10 rounded-xl p-4 hover:border-white/30 transition-all cursor-pointer hover:shadow-lg hover:shadow-white/5"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <CoinImage src={coin.image} alt={coin.name} />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white truncate">{coin.symbol}</h3>
            <p className="text-xs text-gray-400 truncate">{coin.name}</p>
          </div>
        </div>

        {/* Price Info */}
        <div className="mb-3 pb-3 border-b border-white/10">
          <p className="text-lg font-bold text-white">
            ${coin.current_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
          <p className={`text-sm font-semibold ${changeColor}`}>
            {coin.price_change_percentage_24h > 0 ? '+' : ''}
            {coin.price_change_percentage_24h.toFixed(2)}%
          </p>
        </div>

        {/* Strength Bar */}
        <div className="mb-3">
          <StrengthBar score={coin.strengthScore} coinChange={coin.price_change_percentage_24h} />
        </div>

        {/* EMA Dots */}
        <div className="mb-3">
          <EMADots alignment={coin.emaAlignment} emas={coin.emas} />
        </div>

        {/* RSI & Volume */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-white/5 rounded px-2 py-1">
            <p className="text-gray-400 text-xs">RSI</p>
            <p className="text-white font-semibold">{coin.rsi.toFixed(1)}</p>
          </div>
          <div className="bg-white/5 rounded px-2 py-1">
            <p className="text-gray-400 text-xs">Alpha Score</p>
            <p className="text-white font-semibold">{coin.alphaScore.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {showModal && <DeepDiveModal coin={coin} onClose={() => setShowModal(false)} />}
    </>
  );
}
