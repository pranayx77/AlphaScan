'use client';

import { AlphaCoin } from '@/types/index';
import { useEffect } from 'react';
import CoinImage from './CoinImage';

interface DeepDiveModalProps {
  coin: AlphaCoin;
  onClose: () => void;
}

export default function DeepDiveModal({ coin, onClose }: DeepDiveModalProps) {
  useEffect(() => {
    // Load TradingView widget script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    document.body.appendChild(script);

    // Add escape key listener
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.removeChild(script);
    };
  }, [onClose]);

  const emaCount = coin.emaAlignment.filter(Boolean).length;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0f0f0f] border border-white/20 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#0f0f0f]">
          <div className="flex items-center gap-4">
            <CoinImage src={coin.image} alt={coin.name} />
            <div>
              <h2 className="text-2xl font-bold text-white">{coin.symbol}</h2>
              <p className="text-sm text-gray-400">{coin.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl p-2"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Price Section */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Price (USD)</p>
              <p className="text-2xl font-bold text-white">
                ${coin.current_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">24h Change</p>
              <p
                className={`text-2xl font-bold ${
                  coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {coin.price_change_percentage_24h > 0 ? '+' : ''}
                {coin.price_change_percentage_24h.toFixed(2)}%
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Volume (24h)</p>
              <p className="text-2xl font-bold text-white">
                ${(coin.total_volume / 1e9).toFixed(2)}B
              </p>
            </div>
          </div>

          {/* TradingView Mini Chart */}
          <div className="bg-white/5 rounded-lg overflow-hidden">
            <div
              className="tradingview-widget-container"
              style={{ height: '420px' }}
            >
              <div className="tradingview-widget-container__widget" />
              <script type="text/plain">{`
{
  "symbols": [
    {
      "proName": "BINANCE:${coin.symbol}USDT",
      "title": "${coin.symbol}/USDT"
    }
  ],
  "showSymbolLogo": true,
  "showFloatingTooltip": false,
  "width": "100%",
  "height": 420,
  "locale": "en",
  "colorTheme": "dark"
}
              `}</script>
            </div>
          </div>

          {/* Technical Indicators Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-lg p-4 border border-blue-500/30">
              <p className="text-gray-400 text-xs font-semibold mb-2">RSI (14)</p>
              <p className="text-2xl font-bold text-blue-300">{coin.rsi.toFixed(1)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {coin.rsi < 30
                  ? 'Oversold'
                  : coin.rsi > 70
                    ? 'Overbought'
                    : 'Neutral'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-lg p-4 border border-purple-500/30">
              <p className="text-gray-400 text-xs font-semibold mb-2">StochRSI</p>
              <p className="text-2xl font-bold text-purple-300">
                {(coin.stochRsi * 100).toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Momentum</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-lg p-4 border border-emerald-500/30">
              <p className="text-gray-400 text-xs font-semibold mb-2">EMA Aligned</p>
              <p className="text-2xl font-bold text-emerald-300">
                {emaCount}/4
              </p>
              <p className="text-xs text-gray-500 mt-1">Bullish Setup</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-lg p-4 border border-orange-500/30">
              <p className="text-gray-400 text-xs font-semibold mb-2">Strength</p>
              <p className="text-2xl font-bold text-orange-300">
                {coin.strengthScore.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">vs BTC</p>
            </div>
          </div>

          {/* EMA Details */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-3">EMA Levels</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'EMA 12', value: coin.emas.ema12 },
                { label: 'EMA 21', value: coin.emas.ema21 },
                { label: 'EMA 34', value: coin.emas.ema34 },
                { label: 'EMA 100', value: coin.emas.ema100 },
              ].map((ema, idx) => (
                <div key={ema.label} className="bg-white/5 rounded p-2">
                  <p className="text-xs text-gray-400">{ema.label}</p>
                  <p className="text-sm font-bold text-white">
                    ${ema.value.toFixed(2)}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      coin.emaAlignment[idx] ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {coin.emaAlignment[idx] ? '✓ Above' : '✗ Below'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis */}
          {coin.aiAnalysis && (
            <div className="border-l-4 border-emerald-500 bg-emerald-500/10 rounded-lg p-4">
              <h3 className="text-sm font-bold text-emerald-400 mb-2">
                🤖 Smart Money Analysis
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {coin.aiAnalysis}
              </p>
            </div>
          )}

          {/* Alpha Score */}
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg p-4 border border-cyan-500/30">
            <h3 className="text-sm font-bold text-cyan-400 mb-2">Alpha Score</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    style={{ width: `${(coin.alphaScore / 100) * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-2xl font-bold text-cyan-300">
                {coin.alphaScore.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
