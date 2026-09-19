import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Gauge, ShieldAlert, Sparkles } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import StatCard from "../components/common/StatCard";
import Badge from "../components/common/Badge";
import PriceChart from "../components/charts/PriceChart";
import CorrelationHeatmap from "../components/charts/CorrelationHeatmap";
import { useMarketData } from "../context/MarketDataContext";
import {
  sma,
  ema,
  dailyReturns,
  annualizedVolatility,
  sharpeRatio,
  maxDrawdown,
  detectRegime,
  correlationMatrix,
  formatPct,
} from "../utils/indicators";

const TIMEFRAMES = [
  { label: "1M", days: 21 },
  { label: "3M", days: 63 },
  { label: "6M", days: 126 },
  { label: "1Y", days: 252 },
  { label: "All", days: null },
];

function assetDelta(series) {
  if (series.length < 2) return 0;
  return (series.at(-1).close / series.at(-2).close - 1) * 100;
}

export default function DashboardPage() {
  const { assets, assetList, returnsBySymbol, selectedSymbol, setSelectedSymbol } = useMarketData();
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[2]);
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(false);

  const selectedAsset = assets[selectedSymbol];

  const chartData = useMemo(() => {
    const full = selectedAsset.series;
    const sliced = timeframe.days ? full.slice(-timeframe.days) : full;
    const smaLine = sma(full, 20);
    const emaLine = ema(full, 20);
    const offset = full.length - sliced.length;
    return sliced.map((p, i) => ({
      ...p,
      sma: smaLine[offset + i],
      ema: emaLine[offset + i],
    }));
  }, [selectedAsset, timeframe]);

  const riskSnapshot = useMemo(() => {
    const rets = dailyReturns(selectedAsset.series);
    return {
      volatility: annualizedVolatility(rets),
      sharpe: sharpeRatio(rets),
      drawdown: maxDrawdown(selectedAsset.series).value,
      regime: detectRegime(selectedAsset.series),
    };
  }, [selectedAsset]);

  const correlationSnapshot = useMemo(() => correlationMatrix(returnsBySymbol), [returnsBySymbol]);

  const labels = Object.fromEntries(assetList.map((a) => [a.symbol, a.symbol]));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="A daily snapshot of Gold, Bitcoin and NVIDIA — price action, risk metrics and cross-asset signals in one place."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {assetList.map((asset, i) => {
          const series = assets[asset.symbol].series;
          const delta = assetDelta(series);
          return (
            <button
              key={asset.symbol}
              onClick={() => setSelectedSymbol(asset.symbol)}
              className={`text-left animate-rise ${selectedSymbol === asset.symbol ? "ring-2 ring-primary/40 rounded-[var(--radius-card)]" : ""}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <StatCard
                label={`${asset.name} · ${asset.assetClass}`}
                value={series.at(-1).close.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                unit={asset.unit.split(" ")[0]}
                delta={delta}
                sparkline={series.slice(-30).map((p) => p.close)}
                tone={asset.accent}
              />
            </button>
          );
        })}
      </div>

      <Card className="p-5 animate-rise" style={{ animationDelay: "180ms" }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink">{selectedAsset.name}</h2>
            <p className="text-sm text-ink-soft">{selectedAsset.unit}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-line p-1">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.label}
                  onClick={() => setTimeframe(tf)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    timeframe.label === tf.label ? "bg-primary-soft text-primary-dark" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSMA((v) => !v)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                showSMA ? "border-gold bg-gold-soft text-gold" : "border-line text-ink-soft"
              }`}
            >
              SMA 20
            </button>
            <button
              onClick={() => setShowEMA((v) => !v)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                showEMA ? "border-loss bg-loss-soft text-loss" : "border-line text-ink-soft"
              }`}
            >
              EMA 20
            </button>
          </div>
        </div>
        <div className="mt-4">
          <PriceChart data={chartData} unit={selectedAsset.unit} showSMA={showSMA} showEMA={showEMA} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="p-5 animate-rise" style={{ animationDelay: "220ms" }}>
          <div className="flex items-center gap-2 text-ink-soft">
            <Gauge size={16} />
            <span className="text-sm">Annualized volatility</span>
          </div>
          <p className="mt-2 font-tabular text-xl font-semibold text-ink">{formatPct(riskSnapshot.volatility)}</p>
        </Card>
        <Card className="p-5 animate-rise" style={{ animationDelay: "260ms" }}>
          <div className="flex items-center gap-2 text-ink-soft">
            <TrendingUp size={16} />
            <span className="text-sm">Sharpe ratio</span>
          </div>
          <p className="mt-2 font-tabular text-xl font-semibold text-ink">{riskSnapshot.sharpe.toFixed(2)}</p>
        </Card>
        <Card className="p-5 animate-rise" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center gap-2 text-ink-soft">
            <ShieldAlert size={16} />
            <span className="text-sm">Max drawdown</span>
          </div>
          <p className="mt-2 font-tabular text-xl font-semibold text-loss">{formatPct(riskSnapshot.drawdown)}</p>
        </Card>
        <Card className="p-5 animate-rise" style={{ animationDelay: "340ms" }}>
          <div className="flex items-center gap-2 text-ink-soft">
            <Sparkles size={16} />
            <span className="text-sm">Market regime</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-ink">
            <Badge tone="primary">{riskSnapshot.regime}</Badge>
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3 animate-rise" style={{ animationDelay: "380ms" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Cross-asset correlation</h2>
            <Link to="/correlation" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Full analysis <ArrowRight size={14} />
            </Link>
          </div>
          <p className="mt-1 text-sm text-ink-soft">Pearson correlation of daily returns over the full sample.</p>
          <div className="mt-4">
            <CorrelationHeatmap keys={correlationSnapshot.keys} matrix={correlationSnapshot.matrix} labels={labels} />
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2 animate-rise" style={{ animationDelay: "420ms" }}>
          <h2 className="text-base font-semibold text-ink">Explore the platform</h2>
          <p className="mt-1 text-sm text-ink-soft">Jump into a focused workspace for each part of the research workflow.</p>
          <div className="mt-4 space-y-2.5">
            {[
              { to: "/markets", label: "Markets", desc: "Price history & indicators per asset" },
              { to: "/analytics", label: "Analytics", desc: "Returns, volatility, Sharpe & drawdown" },
              { to: "/backtest", label: "Backtesting", desc: "Simulate strategies vs. buy & hold" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-between rounded-lg border border-line px-3.5 py-3 transition-colors hover:border-primary hover:bg-primary-soft/40"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{item.label}</p>
                  <p className="text-xs text-ink-soft">{item.desc}</p>
                </div>
                <ArrowRight size={16} className="text-ink-faint" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
