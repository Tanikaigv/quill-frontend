import { useMemo, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import Select from "../components/common/Select";
import CorrelationHeatmap from "../components/charts/CorrelationHeatmap";
import RollingLineChart from "../components/charts/RollingLineChart";
import { useMarketData } from "../context/MarketDataContext";
import { correlationMatrix, rollingCorrelation } from "../utils/indicators";

const WINDOWS = [20, 30, 60, 90];

export default function CorrelationPage() {
  const { assets, assetList, returnsBySymbol } = useMarketData();
  const [pairA, setPairA] = useState(assetList[0].symbol);
  const [pairB, setPairB] = useState(assetList[1].symbol);
  const [window, setWindow] = useState(60);

  const labels = Object.fromEntries(assetList.map((a) => [a.symbol, a.symbol]));
  const options = assetList.map((a) => ({ value: a.symbol, label: `${a.name} (${a.symbol})` }));
  const windowOptions = WINDOWS.map((w) => ({ value: String(w), label: `${w}-day window` }));

  const { keys, matrix } = useMemo(() => correlationMatrix(returnsBySymbol), [returnsBySymbol]);

  const rollingData = useMemo(() => {
    const roll = rollingCorrelation(returnsBySymbol[pairA], returnsBySymbol[pairB], window);
    const dates = assets[pairA].series.slice(1);
    return dates.map((p, i) => ({ date: p.date, value: roll[i] }));
  }, [returnsBySymbol, pairA, pairB, window, assets]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Correlation"
        title="Cross-asset correlation analysis"
        description="See how Gold, Bitcoin and NVIDIA move together — and how that relationship shifts over time."
      />

      <Card className="p-5 animate-rise">
        <h2 className="text-base font-semibold text-ink">Full-sample correlation matrix</h2>
        <p className="mt-1 text-sm text-ink-soft">Pearson correlation of daily returns across the entire history.</p>
        <div className="mt-4">
          <CorrelationHeatmap keys={keys} matrix={matrix} labels={labels} />
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink-soft">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--color-primary)" }} /> Positive correlation
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm border border-line" style={{ background: "var(--color-surface)" }} /> No correlation
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--color-loss)" }} /> Negative correlation
          </span>
        </div>
      </Card>

      <Card className="p-5 animate-rise" style={{ animationDelay: "100ms" }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink">Rolling pairwise correlation</h2>
            <p className="mt-1 text-sm text-ink-soft">How the relationship between two assets evolves over a trailing window.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select label="Asset A" value={pairA} onChange={setPairA} options={options} />
            <Select label="Asset B" value={pairB} onChange={setPairB} options={options} />
            <Select label="Window" value={String(window)} onChange={(v) => setWindow(Number(v))} options={windowOptions} />
          </div>
        </div>
        <div className="mt-4">
          <RollingLineChart
            data={rollingData}
            dataKey="value"
            color="var(--color-primary)"
            formatter={(v) => v?.toFixed(2)}
            zeroLine
            height={280}
          />
        </div>
      </Card>
    </div>
  );
}
