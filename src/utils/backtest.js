// Strategy backtesting engine: predefined signal generators + a portfolio
// simulator that accounts for capital, position sizing, and transaction costs.
import { sma, ema, dailyReturns, annualizedVolatility, sharpeRatio, maxDrawdown, stdev } from "./indicators";

export const STRATEGIES = {
  SMA_CROSSOVER: {
    id: "SMA_CROSSOVER",
    label: "SMA Crossover",
    description: "Goes long when the fast simple moving average trades above the slow moving average.",
    params: [
      { key: "fast", label: "Fast SMA period", default: 20, min: 5, max: 60, step: 1 },
      { key: "slow", label: "Slow SMA period", default: 50, min: 20, max: 150, step: 1 },
    ],
    signal: (series, params) => {
      const fastLine = sma(series, params.fast);
      const slowLine = sma(series, params.slow);
      return series.map((_, i) => (fastLine[i] != null && slowLine[i] != null && fastLine[i] > slowLine[i] ? 1 : 0));
    },
  },
  EMA_TREND: {
    id: "EMA_TREND",
    label: "EMA Trend",
    description: "Stays long while price trades above its exponential moving average trendline.",
    params: [{ key: "period", label: "EMA period", default: 34, min: 10, max: 120, step: 1 }],
    signal: (series, params) => {
      const line = ema(series, params.period);
      return series.map((p, i) => (line[i] != null && p.close > line[i] ? 1 : 0));
    },
  },
  MOMENTUM: {
    id: "MOMENTUM",
    label: "Momentum",
    description: "Buys assets that have posted a positive return over the trailing lookback window.",
    params: [{ key: "lookback", label: "Lookback (days)", default: 20, min: 5, max: 90, step: 1 }],
    signal: (series, params) => {
      const out = new Array(series.length).fill(0);
      for (let i = params.lookback; i < series.length; i++) {
        const change = series[i].close / series[i - params.lookback].close - 1;
        out[i] = change > 0 ? 1 : 0;
      }
      return out;
    },
  },
  MEAN_REVERSION: {
    id: "MEAN_REVERSION",
    label: "Mean Reversion",
    description: "Buys dips below the moving average and exits once price reverts back to it.",
    params: [
      { key: "period", label: "SMA period", default: 20, min: 10, max: 90, step: 1 },
      { key: "threshold", label: "Entry z-score", default: 1, min: 0.5, max: 3, step: 0.25 },
    ],
    signal: (series, params) => {
      const line = sma(series, params.period);
      const out = new Array(series.length).fill(0);
      const rets = dailyReturns(series);
      const rollStd = stdev(rets) || 0.001;
      let holding = false;
      for (let i = 0; i < series.length; i++) {
        if (line[i] == null) continue;
        const z = (series[i].close - line[i]) / (line[i] * rollStd);
        if (!holding && z < -params.threshold) holding = true;
        else if (holding && series[i].close >= line[i]) holding = false;
        out[i] = holding ? 1 : 0;
      }
      return out;
    },
  },
};

function statsFromEquity(equityCurve, initialCapital) {
  const rets = [];
  for (let i = 1; i < equityCurve.length; i++) {
    rets.push(equityCurve[i].value / equityCurve[i - 1].value - 1);
  }
  const totalReturn = equityCurve.at(-1).value / initialCapital - 1;
  const years = equityCurve.length / 252;
  const annualizedReturn = years > 0 ? (1 + totalReturn) ** (1 / years) - 1 : 0;
  const dd = maxDrawdown(equityCurve.map((p) => ({ close: p.value })));
  return {
    totalReturn,
    annualizedReturn,
    volatility: annualizedVolatility(rets),
    sharpe: sharpeRatio(rets),
    maxDrawdown: dd.value,
  };
}

export function runBacktest({
  series,
  strategyId,
  params,
  initialCapital = 10000,
  positionSizePct = 1,
  transactionCostPct = 0.001,
}) {
  const strategy = STRATEGIES[strategyId];
  const signal = strategy.signal(series, params);

  let cash = initialCapital;
  let shares = 0;
  const trades = [];
  const equityCurve = [];
  const benchmarkShares = initialCapital / series[0].close;

  for (let i = 0; i < series.length; i++) {
    const price = series[i].close;
    const want = signal[i];
    const currentlyIn = shares > 0;

    if (want === 1 && !currentlyIn) {
      const allocation = cash * positionSizePct;
      const cost = allocation * transactionCostPct;
      const spend = allocation - cost;
      const boughtShares = spend / price;
      shares += boughtShares;
      cash -= allocation;
      trades.push({ date: series[i].date, type: "BUY", price, shares: boughtShares, cost });
    } else if (want === 0 && currentlyIn) {
      const proceeds = shares * price;
      const cost = proceeds * transactionCostPct;
      cash += proceeds - cost;
      trades.push({ date: series[i].date, type: "SELL", price, shares, cost });
      shares = 0;
    }

    equityCurve.push({ date: series[i].date, value: cash + shares * price });
  }

  const benchmarkCurve = series.map((p) => ({ date: p.date, value: benchmarkShares * p.close }));

  // Pair BUY->SELL trades to evaluate win rate.
  let wins = 0;
  let closedTrades = 0;
  for (let i = 0; i < trades.length - 1; i++) {
    if (trades[i].type === "BUY" && trades[i + 1]?.type === "SELL") {
      closedTrades++;
      if (trades[i + 1].price > trades[i].price) wins++;
    }
  }

  return {
    equityCurve,
    benchmarkCurve,
    trades,
    strategyStats: {
      ...statsFromEquity(equityCurve, initialCapital),
      numTrades: trades.length,
      winRate: closedTrades > 0 ? wins / closedTrades : null,
    },
    benchmarkStats: statsFromEquity(benchmarkCurve, initialCapital),
  };
}
