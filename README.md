# Quill — Quantitative Multi-Asset Intelligence Platform

Frontend for a quantitative multi-asset financial analysis & strategy
backtesting platform, covering Gold, Bitcoin and NVIDIA. This repo is the UI
layer only — built to be scaled with a real backend, database and market-data
feed later.

## Stack

- **React 19** + **Vite 8**
- **React Router 7** for routing
- **Tailwind CSS 4** (CSS-first theme, light-only design system)
- **Recharts** for price, equity-curve, drawdown and rolling-metric charts
- **lucide-react** for icons
- Context API for state (`AuthContext`, `MarketDataContext`) — no external
  state library needed yet; swap in React Query / Zustand later if the
  backend introduces async data fetching at scale.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. Use **"Continue with demo account"** on the
login screen, or sign up with any email/password — auth is currently mocked
in `localStorage` so there's something to click through before a real API
exists.

```bash
npm run build     # production build to dist/
npm run preview   # preview the production build locally
npm run lint       # oxlint
```

## Project structure

```
src/
  components/
    auth/        # AuthLayout — split branding/form layout for login & signup
    charts/       # Recharts-based chart components (price, equity curve,
                   # drawdown, rolling metrics, correlation heatmap, sparkline)
    common/       # Design-system primitives: Card, Button, Badge, Field,
                   # Select, StatCard, PageHeader
    layout/       # Sidebar, Topbar, DashboardLayout (protected app shell)
  context/
    AuthContext.jsx         # mock auth (localStorage), swap for real API later
    MarketDataContext.jsx   # asset data + shared selected-asset state
  data/
    marketData.js  # synthetic OHLC-style price series (seeded, deterministic)
  pages/
    auth/          # LoginPage, SignupPage
    DashboardPage.jsx
    MarketsPage.jsx
    AnalyticsPage.jsx
    CorrelationPage.jsx
    BacktestPage.jsx
  routes/
    ProtectedRoute.jsx   # redirects unauthenticated users to /login
  utils/
    indicators.js  # SMA, EMA, returns, volatility, Sharpe, max drawdown,
                    # rolling returns/volatility, correlation matrix, regime
    backtest.js     # 4 strategies (SMA Crossover, EMA Trend, Momentum,
                    # Mean Reversion) + portfolio simulator
    random.js       # seeded RNG used only by the mock data generator
```

## What's real vs. mocked right now

- **Mocked:** market data (`src/data/marketData.js`) and auth
  (`src/context/AuthContext.jsx`). Both are isolated behind a context, so
  swapping them for real endpoints means editing two files, not the pages.
- **Real:** every calculation — SMA/EMA, returns, annualized volatility,
  Sharpe ratio, max drawdown, rolling performance, Pearson correlation, and
  the strategy backtest simulator (capital, position sizing, transaction
  costs, trade log) all run on whatever price series they're given, so they
  will work unchanged once real historical data is wired in.

## Next steps for scaling

1. Replace `src/data/marketData.js` with an API/data-fetching layer (e.g. a
   `services/marketDataApi.js` + React Query) that resolves to the same
   `{ date, close }[]` shape the indicator/backtest utilities already expect.
2. Replace `AuthContext`'s localStorage calls with real auth endpoints —
   the `login` / `signup` / `logout` function signatures can stay the same.
3. Add a persistence layer for saved backtests and watchlists once a
   database exists.
