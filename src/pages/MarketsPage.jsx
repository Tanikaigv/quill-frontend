import { useMemo, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import PriceChart from "../components/charts/PriceChart";
import { useMarketData } from "../context/MarketDataContext";
import { sma, ema, formatPct } from "../utils/indicators";

const TIMEFRAMES = [
  { label: "1M", days: 21 },
  { label: "3M", days: 63 },
  { label: "6M", days: 126 },
  { label: "1Y", days: 252 },
  { label: "All", days: null },
];

const RETURN_HORIZONS = [
  { label: "1 day", days: 1 },
  { label: "1 week", days: 5 },
  { label: "1 month", days: 21 },
  { label: "3 months", days: 63 },
  { label: "6 months", days: 126 },
  { label: "1 year", days: 252 },
];

export default function MarketsPage() {
  const { assets, assetList, selectedSymbol, setSelectedSymbol } = useMarketData();
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[3]);
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(true);

  const asset = assets[selectedSymbol];

  const chartData = useMemo(() => {
    const full = asset.series;
    const sliced = timeframe.days ? full.slice(-timeframe.days) : full;
    const smaLine = sma(full, 20);
    const emaLine = ema(full, 50);
    const offset = full.length - sliced.length;
    return sliced.map((p, i) => ({ ...p, sma: smaLine[offset + i], ema: emaLine[offset + i] }));
  }, [asset, timeframe]);

  const periodStats = useMemo(() => {
    const closes = chartData.map((p) => p.close);
    return {
      open: chartData[0]?.close ?? 0,
      high: Math.max(...closes),
      low: Math.min(...closes),
      close: chartData.at(-1)?.close ?? 0,
    };
  }, [chartData]);

  const returnsTable = useMemo(() => {
    const full = asset.series;
    const last = full.at(-1).close;
    return RETURN_HORIZONS.map((h) => {
      const idx = full.length - 1 - h.days;
      if (idx < 0) return { ...h, value: null };
      return { ...h, value: last / full[idx].close - 1 };
    });
  }, [asset]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Markets"
        title="Multi-asset price data"
        description="Normalized historical price series for Gold, Bitcoin and NVIDIA with moving-average overlays."
      />

      <div className="flex flex-wrap gap-2">
        {assetList.map((a) => (
          <button
            key={a.symbol}
            onClick={() => setSelectedSymbol(a.symbol)}
            className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
              selectedSymbol === a.symbol
                ? "border-primary bg-primary-soft text-primary-dark"
                : "border-line text-ink-soft hover:border-line-strong hover:text-ink"
            }`}
          >
            {a.name}
            <Badge tone={a.accent}>{a.symbol}</Badge>
          </button>
        ))}
      </div>

      <Card className="p-5 animate-rise">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink">{asset.name}</h2>
            <p className="text-sm text-ink-soft">{asset.assetClass} · {asset.unit}</p>
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
              EMA 50
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["Period open", periodStats.open],
            ["Period high", periodStats.high],
            ["Period low", periodStats.low],
            ["Last close", periodStats.close],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-line px-3.5 py-3">
              <p className="text-xs text-ink-soft">{label}</p>
              <p className="mt-1 font-tabular text-base font-semibold text-ink">
                {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <PriceChart data={chartData} unit={asset.unit} showSMA={showSMA} showEMA={showEMA} />
        </div>
      </Card>

      <Card className="p-5 animate-rise" style={{ animationDelay: "120ms" }}>
        <h2 className="text-base font-semibold text-ink">Trailing returns</h2>
        <p className="mt-1 text-sm text-ink-soft">Percentage change from the last close over each horizon.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {returnsTable.map((r) => (
            <div key={r.label} className="rounded-lg border border-line px-3 py-3 text-center">
              <p className="text-xs text-ink-soft">{r.label}</p>
              <p
                className={`mt-1 font-tabular text-sm font-semibold ${
                  r.value == null ? "text-ink-faint" : r.value >= 0 ? "text-gain" : "text-loss"
                }`}
              >
                {formatPct(r.value)}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
