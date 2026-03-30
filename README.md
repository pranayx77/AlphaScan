# AlphaScan 🚀

A **real-time crypto intelligence dashboard** that scans the top 500 cryptocurrencies, identifies relative strength vs BTC, calculates technical indicators, and leverages AI for Smart Money analysis.

## Features ✨

- ✅ **Every 4 hours**: Fetches top 500 coins from CoinGecko
- ✅ **Filters**: Relative strength calculation (coins stronger than BTC)
- ✅ **Technical Analysis**: EMA (12/21/34/100), RSI, StochRSI
- ✅ **AI Analysis**: Smart Money Concepts via OpenRouter Llama 3.1
- ✅ **Real-time Dashboard**: Dark-themed card grid with deep-dive modals
- ✅ **Auto-refresh**: Every 5 minutes on the frontend
- ✅ **Cron Jobs**: GitHub Actions automated scanning
- ✅ **Caching**: Vercel KV (Redis) for fast API responses
- ✅ **Vercel Ready**: Deploy to Vercel with one click

---

## Tech Stack 🛠️

| Technology | Purpose |
|-----------|---------|
| **Next.js 14** | Full-stack framework (App Router) |
| **React 18** | UI components |
| **Tailwind CSS 3** | Styling |
| **TypeScript** | Type safety |
| **CoinGecko API** | Cryptocurrency data |
| **OpenRouter API** | AI-powered analysis |
| **Vercel KV** | Redis caching |
| **technicalindicators** | EMA, RSI, StochRSI |
| **GitHub Actions** | Cron scheduling |

---

## Quick Start 🚀

### Prerequisites
- Node.js 18+
- Git
- CoinGecko API key (free tier)
- OpenRouter API key (free tier with Llama 3.1)
- Vercel account (optional, for KV database)

### 1. Local Setup

```bash
# Clone or create the project
cd alphascan

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
# Edit .env.local with your API keys
```

### 2. Environment Variables

Create a `.env.local` file:

```bash
# CoinGecko (https://www.coingecko.com/)
COINGECKO_API_KEY=your_coingecko_api_key

# OpenRouter (https://openrouter.ai/)
OPENROUTER_API_KEY=your_openrouter_api_key

# Vercel KV (https://vercel.com/storage/kv)
KV_URL=your_kv_url
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token

# Cron Security
CRON_SECRET=any_random_string_you_choose
```

### 3. Run Locally

```bash
npm run dev
# Visit http://localhost:3000
```

### 4. Test the Scan Endpoint

```bash
curl -X POST \
  -H "Authorization: Bearer your_cron_secret" \
  http://localhost:3000/api/scan
```

---

## Deployment to Vercel 📦

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial AlphaScan commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/alphascan.git
git push -u origin main
```

### Step 2: Link to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"** → Import GitHub repo
3. Select **alphascan** repository
4. Click **"Deploy"**

### Step 3: Set Environment Variables

In Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add all variables from `.env.local`:
   - `COINGECKO_API_KEY`
   - `OPENROUTER_API_KEY`
   - `CRON_SECRET`

### Step 4: Create Vercel KV Database

1. Go to **Storage** → **KV**
2. Click **"Create Database"**
3. Name it `alphascan`
4. Copy the connection details
5. Paste into Vercel environment variables:
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

### Step 5: GitHub Actions Cron Setup

1. Add **GitHub Secrets** to your repo:
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Add `CRON_SECRET` (same as Vercel env)
   - Add `VERCEL_URL` (your Vercel domain, e.g., `alphascan.vercel.app`)

2. The `.github/workflows/cron.yml` will run every 4 hours automatically!

---

## API Endpoints 📡

### POST `/api/scan`
Triggers the full scanning pipeline. Requires auth header.

**Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer CRON_SECRET" \
  https://alphascan.vercel.app/api/scan
```

**Response:**
```json
{
  "success": true,
  "count": 20,
  "timestamp": "2026-03-30T10:00:00Z",
  "stats": {
    "total500": 500,
    "btcStrong": 47,
    "emaAligned": 23
  }
}
```

### GET `/api/coins`
Returns cached top 20 alpha coins.

**Response:**
```json
{
  "data": [AlphaCoin[], ...],
  "needsScan": false,
  "lastUpdated": "2026-03-30T10:00:00Z",
  "nextScan": "2026-03-30T14:00:00Z",
  "minutesUntilNext": 240
}
```

### POST `/api/ai-analyze`
Internal endpoint to generate AI analysis for coins.

---

## Architecture 🏗️

```
User Browser
     ↓
  [Next.js Page]
     ↓
[/api/coins] ← [Vercel KV Cache]
     ↓
(Every 4 hours via GitHub Actions)
     ↓
[/api/scan] ← [CoinGecko API] → [Technical Indicators]
     ↓
[/api/ai-analyze] ← [OpenRouter API]
     ↓
[Save to KV Cache] → [Display in Dashboard]
```

### File Structure

```
alphascan/
├── app/
│   ├── api/
│   │   ├── scan/route.ts        ← Main scanning endpoint
│   │   ├── coins/route.ts       ← Returns cached data
│   │   └── ai-analyze/route.ts  ← AI analysis
│   ├── page.tsx                 ← Dashboard UI
│   ├── layout.tsx               ← Root layout
│   └── globals.css              ← Tailwind styles
├── components/
│   ├── CoinCard.tsx             ← Coin display card
│   ├── StrengthBar.tsx          ← Relative strength visual
│   ├── EMADots.tsx              ← EMA alignment dots
│   ├── DeepDiveModal.tsx        ← Modal detail view
│   └── CoinImage.tsx            ← Image component
├── lib/
│   ├── coingecko.ts             ← CoinGecko API
│   ├── indicators.ts            ← Technical calculations
│   ├── filter.ts                ← Coin filtering logic
│   └── cache.ts                 ← Vercel KV helpers
├── types/
│   └── index.ts                 ← TypeScript interfaces
├── .github/
│   └── workflows/
│       └── cron.yml             ← GitHub Actions schedule
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── postcss.config.js
├── .env.local                   ← API keys (local only)
└── README.md
```

---

## How It Works 🔍

### The Scanning Algorithm

1. **Fetch Top 500** (CoinGecko)
   - Queries `/coins/markets` (pages 1-2)
   - Returns: symbol, name, price, 24h change, volume

2. **Find BTC Baseline**
   - Extracts BTC's 24h price change
   - Used as reference for relative strength

3. **Filter BTC-Strong** (Top 50)
   - Keep only coins with `24h_change > btc_change`
   - Remove stablecoins (USDT, USDC, DAI, BUSD)
   - Sort by strength descending

4. **Fetch Technical Data** (Top 50)
   - OHLC data from CoinGecko (14 days)
   - Batch requests with 300ms delays

5. **Calculate Indicators**
   - **EMA**: 12, 21, 34, 100-period
   - **RSI**: 14-period momentum
   - **StochRSI**: Volatility of RSI
   - **EMA Alignment**: Price vs EMA levels

6. **Score & Rank** (Top 20)
   ```
   alphaScore = (strengthScore × 0.4) + (emaCount × 10) + (rsiScore × 0.2)
   ```

7. **AI Analysis** (Optional)
   - Sends top 20 to OpenRouter
   - Gets Smart Money Concepts insights
   - Caches for 4 hours

---

## Filters & Indicators 📊

### Dashboard Filters
- **All 20**: Show all top alpha coins
- **EMA Aligned**: 3+ EMAs in bullish alignment
- **RSI < 70**: Coins with room to run (avoid overbought)
- **High Strength**: Score ≥ 70 (very strong vs BTC)

### Technical Indicators

| Indicator | Use Case |
|-----------|----------|
| **EMA 12** | Fast trend follower |
| **EMA 21** | Short-term trend |
| **EMA 34** | Mid-term trend |
| **EMA 100** | Long-term trend |
| **RSI 14** | Momentum (45-65 = ideal) |
| **StochRSI** | RSI oscillator |
| **Strength Score** | Relative performance vs BTC |

### Color Coding
- 🟢 **Green**: Above EMA, bullish
- ⚪ **Gray**: Below EMA, bearish
- 🟣 **Purple/Magenta**: Strong setup
- 🟠 **Orange**: Moderate strength
- 🔴 **Red**: Weak vs BTC

---

## Customization 🎨

### Change Scan Interval

Edit `.github/workflows/cron.yml`:
```yaml
schedule:
  - cron: '0 */2 * * *'  # Every 2 hours instead of 4
```

### Adjust Indicators

Edit `lib/indicators.ts`:
```typescript
// Change RSI period
const rsi = RSI.calculate({ values: closes, period: 21 }); // was 14
```

### Modify Score Formula

Edit `lib/filter.ts`:
```typescript
alphaScore = 
  coin.strengthScore * 0.5 +  // was 0.4
  emaCount * 15 +             // was 10
  rsiScore * 0.1;             // was 0.2
```

---

## Troubleshooting 🐛

### No data appearing on dashboard

- Check API keys in `.env.local`
- Run `/api/scan` manually to populate cache
- Check Vercel KV connection in database settings

### AI analysis not showing

- Verify `OPENROUTER_API_KEY` is valid
- Check OpenRouter free tier usage limits
- Falls back gracefully if API fails

### GitHub Actions not triggering

- Add `CRON_SECRET` to repo Settings → Secrets
- Check `.github/workflows/cron.yml` is in main branch
- Verify `VERCEL_URL` is set correctly

### Rate limiting on CoinGecko

- Free tier: 10-50 calls/minute
- 300ms delay between OHLC calls is built-in
- Upgrade to premium if needed

---

## Resources 📚

- **CoinGecko API**: https://docs.coingecko.com/reference
- **OpenRouter API**: https://openrouter.ai/docs
- **Vercel KV Docs**: https://vercel.com/docs/storage/vercel-kv
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Technical Indicators**: https://www.npmjs.com/package/technicalindicators

---

## Legal Disclaimer ⚠️

**AlphaScan is for educational and research purposes only.**

- Not financial advice
- Cryptocurrency trading carries risks
- Always DYOR (Do Your Own Research)
- Past performance ≠ Future results
- Use at your own risk

---

## Contributing 🤝

Found a bug or want to improve AlphaScan?

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License 📄

MIT License - feel free to use this project for personal or commercial use.

---

## Support 💬

Have questions? Check out:
- GitHub Discussions (coming soon)
- Issues tab for bug reports
- Vercel docs for deployment issues

---

**Happy scanning! 🚀📈**

Built with ❤️ using Next.js + AI
