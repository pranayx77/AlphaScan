import { CoinMarket, AlphaCoin } from '@/types/index';
import { getStrengthScore, getRSIScore } from './indicators';

const STABLECOINS = ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'USDP'];

export function filterStrongerThanBTC(
  coins: CoinMarket[],
  btcChange: number
): CoinMarket[] {
  return coins
    .filter(coin => {
      // Filter out stablecoins
      if (STABLECOINS.includes(coin.symbol.toUpperCase())) {
        return false;
      }
      // Only coins stronger than BTC
      return coin.price_change_percentage_24h > btcChange;
    })
    .sort((a, b) => {
      const scoreA = a.price_change_percentage_24h - btcChange;
      const scoreB = b.price_change_percentage_24h - btcChange;
      return scoreB - scoreA;
    })
    .slice(0, 50);
}

export function selectTop20(coins: AlphaCoin[]): AlphaCoin[] {
  const scoredCoins = coins.map(coin => {
    const emaCount = coin.emaAlignment.filter(Boolean).length;
    const rsiScore = getRSIScore(coin.rsi);
    const alphaScore =
      coin.strengthScore * 0.4 + emaCount * 10 + rsiScore * 0.2;

    return {
      ...coin,
      alphaScore,
    };
  });

  return scoredCoins
    .sort((a, b) => b.alphaScore - a.alphaScore)
    .slice(0, 20);
}

export function filterByEMAAlignment(coins: AlphaCoin[]): AlphaCoin[] {
  return coins.filter(coin => coin.emaAlignment.filter(Boolean).length >= 3);
}

export function filterByRSI(coins: AlphaCoin[], maxRSI: number = 70): AlphaCoin[] {
  return coins.filter(coin => coin.rsi < maxRSI);
}

export function filterByStrength(
  coins: AlphaCoin[],
  minScore: number = 70
): AlphaCoin[] {
  return coins.filter(coin => coin.strengthScore >= minScore);
}
