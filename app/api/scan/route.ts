import { NextRequest, NextResponse } from 'next/server';
import { fetchTop500, fetchOHLCBatch } from '@/lib/coingecko';
import {
  calculateEMAs,
  calculateRSI,
  calculateStochRSI,
  getEMAAlignment,
  getStrengthScore,
} from '@/lib/indicators';
import { filterStrongerThanBTC, selectTop20 } from '@/lib/filter';
import { saveTop20, saveLastScanTime, saveScanStats } from '@/lib/cache';
import { AlphaCoin } from '@/types/index';

export async function POST(request: NextRequest) {
  try {
    // Verify CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const expectedSecret = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔍 Starting AlphaScan...');

    // Step 1: Fetch top 500 coins
    console.log('📊 Fetching top 500 coins...');
    const allCoins = await fetchTop500();
    console.log(`✅ Fetched ${allCoins.length} coins`);

    // Step 2: Find BTC's 24h change
    const btcCoin = allCoins.find(c => c.symbol === 'BTC');
    const btcChange = btcCoin?.price_change_percentage_24h || 0;
    console.log(`📈 BTC 24h change: ${btcChange.toFixed(2)}%`);

    // Step 3: Filter stronger than BTC
    console.log('🎯 Filtering coins stronger than BTC...');
    const strongCoins = filterStrongerThanBTC(allCoins, btcChange);
    console.log(`✅ Found ${strongCoins.length} coins stronger than BTC`);

    // Step 4: Fetch OHLC data for top 50
    console.log('📉 Fetching OHLC data...');
    const coinIds = strongCoins.map(c => c.id);
    const ohlcData = await fetchOHLCBatch(coinIds);
    console.log(`✅ Fetched OHLC for ${Object.keys(ohlcData).length} coins`);

    // Step 5: Calculate indicators
    console.log('🧮 Calculating technical indicators...');
    const coinsWithIndicators: AlphaCoin[] = [];

    for (const coin of strongCoins) {
      const coinOhlc = ohlcData[coin.id];
      if (!coinOhlc || coinOhlc.length < 34) {
        continue;
      }

      const closes = coinOhlc.map(ohlc => ohlc[4]); // Close prices
      const emas = calculateEMAs(closes);
      const rsi = calculateRSI(closes);
      const stochRsi = calculateStochRSI(closes);
      const emaAlignment = getEMAAlignment(coin.current_price, emas);
      const strengthScore = getStrengthScore(
        coin.price_change_percentage_24h,
        btcChange
      );

      coinsWithIndicators.push({
        ...coin,
        emas,
        rsi,
        stochRsi,
        emaAlignment,
        strengthScore,
        aiAnalysis: '', // Will be filled by AI service
        alphaScore: 0, // Will be calculated
        ohlcData: ohlcData[coin.id],
      });
    }

    console.log(
      `✅ Calculated indicators for ${coinsWithIndicators.length} coins`
    );

    // Step 6: Select top 20
    console.log('🏆 Selecting top 20 alpha coins...');
    const top20 = selectTop20(coinsWithIndicators);
    console.log(`✅ Selected ${top20.length} top alpha coins`);

    // Step 7: AI analysis (optional - graceful failure}
    console.log('🤖 Fetching AI analysis...');
    try {
      const aiResponse = await fetch(
        `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/ai-analyze`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coins: top20 }),
        }
      );

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        for (const coin of top20) {
          coin.aiAnalysis =
            aiData.analysis[coin.symbol] || 'Analysis unavailable';
        }
        console.log('✅ AI analysis completed');
      }
    } catch (aiError) {
      console.warn('⚠️ AI analysis failed, continuing without it:', aiError);
    }

    // Step 8: Save to cache
    console.log('💾 Saving to cache...');
    await Promise.all([
      saveTop20(top20),
      saveLastScanTime(),
      saveScanStats({
        total500: allCoins.length,
        btcStrong: strongCoins.length,
        emaAligned: coinsWithIndicators.filter(c =>
          c.emaAlignment.filter(Boolean).length >= 3
        ).length,
        top20: top20.length,
      }),
    ]);

    console.log('✅ AlphaScan completed successfully!');

    return NextResponse.json({
      success: true,
      count: top20.length,
      timestamp: new Date().toISOString(),
      stats: {
        total500: allCoins.length,
        btcStrong: strongCoins.length,
        emaAligned: coinsWithIndicators.filter(c =>
          c.emaAlignment.filter(Boolean).length >= 3
        ).length,
      },
    });
  } catch (error) {
    console.error('❌ AlphaScan failed:', error);
    return NextResponse.json(
      { error: 'Scan failed', details: String(error) },
      { status: 500 }
    );
  }
}
