export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap?: number;
}

export interface EMAValues {
  ema12: number;
  ema21: number;
  ema34: number;
  ema100: number;
}

export interface ScoredCoin extends CoinMarket {
  strengthScore: number;
  emaAlignment: boolean[];
  emas: EMAValues;
  rsi: number;
  stochRsi: number;
  aiAnalysis: string;
  alphaScore: number;
}

export interface AlphaCoin extends ScoredCoin {
  ohlcData?: Array<[number, number, number, number, number]>;
}
