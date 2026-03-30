import { NextRequest, NextResponse } from 'next/server';
import { AlphaCoin } from '@/types/index';

export async function POST(request: NextRequest) {
  try {
    const { coins } = (await request.json()) as { coins: AlphaCoin[] };

    if (!coins || coins.length === 0) {
      return NextResponse.json({
        analysis: {},
      });
    }

    // Build coin summary for AI
    const coinsSummary = coins
      .map(
        coin =>
          `${coin.symbol}: $${coin.current_price.toFixed(2)}, 24h: ${coin.price_change_percentage_24h.toFixed(2)}%, RSI: ${coin.rsi.toFixed(1)}, EMA Aligned: ${coin.emaAlignment.filter(Boolean).length}/4`
      )
      .join('\n');

    const userPrompt = `Analyze these coins for Smart Money Concepts (institutional setup). Be concise - max 2 sentences per coin:

${coinsSummary}

Respond in JSON format: { "SYMBOL": "brief analysis" }`;

    const systemPrompt = `You are a crypto technical analyst specializing in Smart Money Concepts (SMC). 
Analyze coins for: institutional accumulation/distribution signs, key levels, momentum quality.
Be precise and actionable. Return valid JSON only.`;

    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      }
    );

    if (!response.ok) {
      console.error('OpenRouter API error:', await response.text());
      // Return default analysis on error
      const defaultAnalysis: Record<string, string> = {};
      coins.forEach(coin => {
        defaultAnalysis[coin.symbol] =
          'Technical setup analyzing. Check indicators.';
      });
      return NextResponse.json({ analysis: defaultAnalysis });
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content || '{}';

    // Try to parse JSON from response
    let analysis: Record<string, string> = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('Failed to parse AI response as JSON:', parseError);
      // Fallback analysis
      coins.forEach(coin => {
        analysis[coin.symbol] = 'Smart Money analysis pending...';
      });
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      { error: 'AI analysis failed' },
      { status: 500 }
    );
  }
}
