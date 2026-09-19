// Quantitative indicator engine: SMA/EMA, returns, volatility, Sharpe,
// drawdown, rolling performance, and cross-asset correlation.

export function sma(series, period) {
  const out = new Array(series.length).fill(null);
  let sum = 0;
  for (let i = 0; i < series.length; i++) {
    sum += series[i].close;
    if (i >= period) sum -= series[i - period].close;
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

export function ema(series, period) {
  const out = new Array(series.length).fill(null);
  const k = 2 / (period + 1);
  let prev = null;
  for (let i = 0; i < series.length; i++) {
    if (i === period - 1) {
      const seed = series.slice(0, period).reduce((s, p) => s + p.close, 0) / period;
      prev = seed;
      out[i] = seed;
    } else if (i >= period) {
      prev = series[i].close * k + prev * (1 - k);
      out[i] = prev;
    }
  }
  return out;
}

export function dailyReturns(series) {
  const out = [];
  for (let i = 1; i < series.length; i++) {
    out.push(series[i].close / series[i - 1].close - 1);
  }
  return out;
}

export function cumulativeReturns(series) {
  const base = series[0]?.close ?? 1;
  return series.map((p) => p.close / base - 1);
}

export function mean(arr) {
  return arr.reduce((s, v) => s + v, 0) / (arr.length || 1);
}

export function stdev(arr) {
  const m = mean(arr);
  const variance = mean(arr.map((v) => (v - m) ** 2));
  return Math.sqrt(variance);
}

// Annualized volatility from daily returns (252 trading days).
export function annualizedVolatility(returns) {
  return stdev(returns) * Math.sqrt(252);
}

// Annualized Sharpe ratio; riskFreeRate is an annual rate (e.g. 0.04).
export function sharpeRatio(returns, riskFreeRate = 0.04) {
  const dailyRf = riskFreeRate / 252;
  const excess = returns.map((r) => r - dailyRf);
  const vol = stdev(excess);
  if (vol === 0) return 0;
  return (mean(excess) / vol) * Math.sqrt(252);
}

// Maximum drawdown across a close-price series -> { value, peakIdx, troughIdx }
export function maxDrawdown(series) {
  let peak = series[0]?.close ?? 0;
  let peakIdx = 0;
  let worst = 0;
  let worstPeakIdx = 0;
  let worstTroughIdx = 0;
  series.forEach((p, i) => {
    if (p.close > peak) {
      peak = p.close;
      peakIdx = i;
    }
    const dd = p.close / peak - 1;
    if (dd < worst) {
      worst = dd;
      worstPeakIdx = peakIdx;
      worstTroughIdx = i;
    }
  });
  return { value: worst, peakIdx: worstPeakIdx, troughIdx: worstTroughIdx };
}

// Rolling total return over a trailing window, expressed per point.
export function rollingReturns(series, window) {
  const out = new Array(series.length).fill(null);
  for (let i = window; i < series.length; i++) {
    out[i] = series[i].close / series[i - window].close - 1;
  }
  return out;
}

// Rolling annualized volatility of daily returns over a trailing window.
export function rollingVolatility(series, window) {
  const rets = dailyReturns(series);
  const out = new Array(series.length).fill(null);
  for (let i = window; i < rets.length; i++) {
    const windowRets = rets.slice(i - window, i);
    out[i + 1] = stdev(windowRets) * Math.sqrt(252);
  }
  return out;
}

function pearson(a, b) {
  const n = Math.min(a.length, b.length);
  const av = a.slice(-n);
  const bv = b.slice(-n);
  const ma = mean(av);
  const mb = mean(bv);
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    num += (av[i] - ma) * (bv[i] - mb);
    da += (av[i] - ma) ** 2;
    db += (bv[i] - mb) ** 2;
  }
  const denom = Math.sqrt(da * db);
  return denom === 0 ? 0 : num / denom;
}

// Full correlation matrix across { key: returns[] } assets.
export function correlationMatrix(returnsByAsset) {
  const keys = Object.keys(returnsByAsset);
  const matrix = {};
  keys.forEach((rowKey) => {
    matrix[rowKey] = {};
    keys.forEach((colKey) => {
      matrix[rowKey][colKey] = pearson(returnsByAsset[rowKey], returnsByAsset[colKey]);
    });
  });
  return { keys, matrix };
}

// Rolling pairwise correlation over a trailing window of daily returns.
export function rollingCorrelation(returnsA, returnsB, window) {
  const n = Math.min(returnsA.length, returnsB.length);
  const out = new Array(n).fill(null);
  for (let i = window; i <= n; i++) {
    out[i - 1] = pearson(returnsA.slice(i - window, i), returnsB.slice(i - window, i));
  }
  return out;
}

// Heuristic market-regime classifier from trailing trend + volatility.
export function detectRegime(series, window = 30) {
  if (series.length < window + 1) return "Insufficient data";
  const recent = series.slice(-window);
  const trend = recent[recent.length - 1].close / recent[0].close - 1;
  const rets = dailyReturns(recent);
  const vol = annualizedVolatility(rets);
  const highVol = vol > 0.35;
  if (trend > 0.04) return highVol ? "Bull \u00b7 High Volatility" : "Bull Market";
  if (trend < -0.04) return highVol ? "Bear \u00b7 High Volatility" : "Bear Market";
  return highVol ? "Range \u00b7 High Volatility" : "Low Volatility";
}

export function formatPct(v, digits = 2) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `${(v * 100).toFixed(digits)}%`;
}

export function formatCurrency(v, digits = 2) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
