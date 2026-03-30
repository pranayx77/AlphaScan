import { EMA, RSI, Stochastic } from 'technicalindicators';
import { EMAValues } from '@/types/index';

export function calculateEMAs(closes: number[]): EMAValues {
  try {
    const ema12 = EMA.calculate({ values: closes, period: 12 });
    const ema21 = EMA.calculate({ values: closes, period: 21 });
    const ema34 = EMA.calculate({ values: closes, period: 34 });
    const ema100 = EMA.calculate({ values: closes, period: 100 });

    return {
      ema12: ema12[ema12.length - 1] || 0,
      ema21: ema21[ema21.length - 1] || 0,
      ema34: ema34[ema34.length - 1] || 0,
      ema100: ema100[ema100.length - 1] || 0,
    };
  } catch (error) {
    console.error('Error calculating EMAs:', error);
    return { ema12: 0, ema21: 0, ema34: 0, ema100: 0 };
  }
}

export function calculateRSI(closes: number[]): number {
  try {
    const rsi = RSI.calculate({ values: closes, period: 14 });
    return rsi[rsi.length - 1] || 50;
  } catch (error) {
    console.error('Error calculating RSI:', error);
    return 50;
  }
}

export function calculateStochRSI(closes: number[]): number {
  try {
    const rsiValues = RSI.calculate({ values: closes, period: 14 });
    const stoch = Stochastic.calculate({
      high: rsiValues,
      low: rsiValues,
      close: rsiValues,
      period: 14,
      signalPeriod: 3,
    });

    if (stoch.length > 0) {
      const lastStoch = stoch[stoch.length - 1];
      return (lastStoch.k || 50) / 100;
    }
    return 0.5;
  } catch (error) {
    console.error('Error calculating StochRSI:', error);
    return 0.5;
  }
}

export function getEMAAlignment(
  currentPrice: number,
  emas: EMAValues
): boolean[] {
  return [
    currentPrice > emas.ema12,
    currentPrice > emas.ema21,
    currentPrice > emas.ema34,
    currentPrice > emas.ema100,
  ];
}

export function getStrengthScore(
  coinChange: number,
  btcChange: number
): number {
  const rawScore = 50 + (coinChange - btcChange) * 2;
  return Math.min(100, Math.max(0, rawScore));
}

export function getRSIScore(rsi: number): number {
  if (rsi > 45 && rsi < 65) return 100;
  if (rsi >= 65 && rsi <= 75) return 50;
  if (rsi > 75 || rsi < 30) return 0;
  return 25;
}
