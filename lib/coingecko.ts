import axios from 'axios';
import { CoinMarket } from '@/types/index';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const API_KEY = process.env.COINGECKO_API_KEY;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchTop500(): Promise<CoinMarket[]> {
  try {
    const coins1 = await axios.get(`${COINGECKO_API_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 250,
        page: 1,
        sparkline: false,
      },
      headers: {
        'x-cg-demo-api-key': API_KEY,
      },
    });

    await delay(300);

    const coins2 = await axios.get(`${COINGECKO_API_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 250,
        page: 2,
        sparkline: false,
      },
      headers: {
        'x-cg-demo-api-key': API_KEY,
      },
    });

    const allCoins: CoinMarket[] = [
      ...coins1.data,
      ...coins2.data,
    ].map(coin => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h || 0,
      total_volume: coin.total_volume || 0,
      market_cap: coin.market_cap,
    }));

    return allCoins;
  } catch (error) {
    console.error('Error fetching top 500 coins:', error);
    throw error;
  }
}

export async function fetchOHLC(
  coinId: string
): Promise<Array<[number, number, number, number, number]>> {
  try {
    const response = await axios.get(
      `${COINGECKO_API_URL}/coins/${coinId}/ohlc`,
      {
        params: {
          vs_currency: 'usd',
          days: 14,
        },
        headers: {
          'x-cg-demo-api-key': API_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Error fetching OHLC for ${coinId}:`, error);
    return [];
  }
}

export async function fetchOHLCBatch(
  coinIds: string[]
): Promise<Record<string, Array<[number, number, number, number, number]>>> {
  const results: Record<string, Array<[number, number, number, number, number]>> =
    {};

  for (const coinId of coinIds) {
    const ohlc = await fetchOHLC(coinId);
    if (ohlc.length > 0) {
      results[coinId] = ohlc;
    }
    await delay(300);
  }

  return results;
}
