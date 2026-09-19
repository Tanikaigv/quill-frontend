import { useMemo, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import Select from "../components/common/Select";
import Badge from "../components/common/Badge";
import StatCard from "../components/common/StatCard";
import RollingLineChart from "../components/charts/RollingLineChart";
import DrawdownChart from "../components/charts/DrawdownChart";
import { useMarketData } from "../context/MarketDataContext";
import {
  dailyReturns,
  cumulativeReturns,
  annualizedVolatility,
  sharpeRatio,
  maxDrawdown,
  rollingReturns,
  rollingVolatility,
  detectRegime,
  formatPct,
} from "../utils/indicators";

export default function AnalyticsPage() {
  const { assets, assetList, selectedSymbol, setSelectedSymbol } = useMarketData();
  const asset = assets[selectedSymbol];
  const [window, setWindow] = useState(20);

  const options = assetList.map((a) => ({ value: a.symbol, label: `${a.name} (${a.symbol})` }));
  const windowOptions = [10, 20, 30, 60].map((w) => ({ value: String(w), label: `${w}-day window` }));

  const metrics = useMemo(() => {
    const series = asset.series;
    const rets = dailyReturns(series);
    const cum = cumulativeReturns(series);
    const dd = maxDrawdown(series);
    return {
      avgDailyReturn: rets.reduce((s, v) => s + v, 0) / rets.length,
      cumulativeReturn: cum.at(-1),
      volatility: annualizedVolatility(rets),
      sharpe: sharpeRatio(rets),
      maxDrawdown: dd,
      regime: detectRegime(series),
    };
  }, [asset]);

  const rollingReturnsData = useMemo(() => {
    const roll = rollingReturns(asset.series, window);
    return asset.series.map((p, i) => ({ date: p.date, value: roll[i] }));
  }, [asset, window]);

  const rollingVolData = useMemo(() => {
    const roll = rollingVolatility(asset.series, window);
    return asset.series.map((p, i) => ({ date: p.date, value: roll[i] }));
  }, [asset, window]);

  const drawdownSeries = useMemo(() => {
    let peak = asset.series[0]?.close ?? 0;
    return asset.series.map((p) => {
      peak = Math.max(peak, p.close);
      return { date: p.date, drawdown: p.close / peak - 1 };
    });
  }, [asset]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Quantitative indicator engine"
        description="Returns, volatility, Sharpe ratio, drawdown and rolling performance for a single asset."
        actions={
          <div className="flex gap-2">
            <Select value={selectedSymbol} onChange={setSelectedSymbol} options={options} />
            <Select value={String(window)} onChange={(v) => setWindow(Number(v))} options={windowOptions} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Avg. daily return" value={formatPct(metrics.avgDailyReturn, 3)} tone="primary" />
        <StatCard label="Cumulative return" value={formatPct(metrics.cumulativeReturn)} tone={metrics.cumulativeReturn >= 0 ? "gain" : "loss"} />
        <StatCard label="Annualized volatility" value={formatPct(metrics.volatility)} tone="gold" />
        <StatCard label="Sharpe ratio" value={metrics.sharpe.toFixed(2)} tone="primary" />
        <StatCard label="Max drawdown" value={formatPct(metrics.maxDrawdown.value)} tone="loss" />
      </div>

      <Card className="p-5 animate-rise">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink">Market regime</h2>
            <p className="mt-1 text-sm text-ink-soft">Heuristic read of trend and volatility over the trailing {window} days.</p>
          </div>
          <Badge tone="primary" className="text-sm">{metrics.regime}</Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5 animate-rise" style={{ animationDelay: "80ms" }}>
          <h2 className="text-base font-semibold text-ink">Rolling {window}-day return</h2>
          <p className="mt-1 text-sm text-ink-soft">Trailing total return, recalculated each trading day.</p>
          <div className="mt-3">
            <RollingLineChart
              data={rollingReturnsData}
              dataKey="value"
              color="var(--color-primary)"
              formatter={(v) => formatPct(v, 0)}
              zeroLine
            />
          </div>
        </Card>
        <Card className="p-5 animate-rise" style={{ animationDelay: "120ms" }}>
          <h2 className="text-base font-semibold text-ink">Rolling {window}-day volatility</h2>
          <p className="mt-1 text-sm text-ink-soft">Annualized standard deviation of daily returns.</p>
          <div className="mt-3">
            <RollingLineChart
              data={rollingVolData}
              dataKey="value"
              color="var(--color-gold)"
              formatter={(v) => formatPct(v, 0)}
            />
          </div>
        </Card>
      </div>

      <Card className="p-5 animate-rise" style={{ animationDelay: "160ms" }}>
        <h2 className="text-base font-semibold text-ink">Drawdown from peak</h2>
        <p className="mt-1 text-sm text-ink-soft">Percentage decline from the running all-time high close.</p>
        <div className="mt-3">
          <DrawdownChart data={drawdownSeries} />
        </div>
      </Card>
    </div>
  );
}
