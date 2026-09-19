import { useMemo, useState } from "react";
import { Play, FlaskConical } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import Select from "../components/common/Select";
import Field from "../components/common/Field";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import EquityCurveChart from "../components/charts/EquityCurveChart";
import { useMarketData } from "../context/MarketDataContext";
import { STRATEGIES, runBacktest } from "../utils/backtest";
import { formatPct } from "../utils/indicators";

const assetOptionsFrom = (assetList) => assetList.map((a) => ({ value: a.symbol, label: `${a.name} (${a.symbol})` }));
const strategyOptions = Object.values(STRATEGIES).map((s) => ({ value: s.id, label: s.label }));

export default function BacktestPage() {
  const { assets, assetList } = useMarketData();
  const [symbol, setSymbol] = useState(assetList[0].symbol);
  const [strategyId, setStrategyId] = useState("SMA_CROSSOVER");
  const [params, setParams] = useState(
    Object.fromEntries(STRATEGIES.SMA_CROSSOVER.params.map((p) => [p.key, p.default]))
  );
  const [initialCapital, setInitialCapital] = useState(10000);
  const [positionSizePct, setPositionSizePct] = useState(100);
  const [transactionCostPct, setTransactionCostPct] = useState(0.1);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  const strategy = STRATEGIES[strategyId];

  const handleStrategyChange = (id) => {
    setStrategyId(id);
    setParams(Object.fromEntries(STRATEGIES[id].params.map((p) => [p.key, p.default])));
    setResult(null);
  };

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      const res = runBacktest({
        series: assets[symbol].series,
        strategyId,
        params,
        initialCapital,
        positionSizePct: positionSizePct / 100,
        transactionCostPct: transactionCostPct / 100,
      });
      setResult(res);
      setRunning(false);
    }, 250);
  };

  const chartData = useMemo(() => {
    if (!result) return [];
    return result.equityCurve.map((p, i) => ({
      date: p.date,
      strategy: p.value,
      benchmark: result.benchmarkCurve[i].value,
    }));
  }, [result]);

  const comparisonRows = result
    ? [
        ["Total return", formatPct(result.strategyStats.totalReturn), formatPct(result.benchmarkStats.totalReturn)],
        ["Annualized return", formatPct(result.strategyStats.annualizedReturn), formatPct(result.benchmarkStats.annualizedReturn)],
        ["Volatility", formatPct(result.strategyStats.volatility), formatPct(result.benchmarkStats.volatility)],
        ["Sharpe ratio", result.strategyStats.sharpe.toFixed(2), result.benchmarkStats.sharpe.toFixed(2)],
        ["Max drawdown", formatPct(result.strategyStats.maxDrawdown), formatPct(result.benchmarkStats.maxDrawdown)],
        ["Number of trades", result.strategyStats.numTrades, "—"],
        ["Win rate", result.strategyStats.winRate != null ? formatPct(result.strategyStats.winRate, 0) : "—", "—"],
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Backtesting"
        title="Strategy backtesting engine"
        description="Simulate a rules-based strategy against historical data and compare it with a buy-and-hold benchmark."
      />

      <Card className="p-5 animate-rise">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Asset" value={symbol} onChange={setSymbol} options={assetOptionsFrom(assetList)} />
              <Select label="Strategy" value={strategyId} onChange={handleStrategyChange} options={strategyOptions} />
            </div>
            <p className="rounded-lg bg-canvas px-3.5 py-2.5 text-sm text-ink-soft">{strategy.description}</p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {strategy.params.map((p) => (
                <Field
                  key={p.key}
                  label={p.label}
                  type="number"
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  value={params[p.key]}
                  onChange={(v) => setParams((prev) => ({ ...prev, [p.key]: v }))}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-line p-4">
            <p className="text-sm font-medium text-ink">Trading assumptions</p>
            <Field label="Initial capital (USD)" type="number" min={1000} step={500} value={initialCapital} onChange={setInitialCapital} />
            <Field label="Position size (% of capital)" type="number" min={5} max={100} step={5} value={positionSizePct} onChange={setPositionSizePct} />
            <Field label="Transaction cost (% per trade)" type="number" min={0} max={2} step={0.05} value={transactionCostPct} onChange={setTransactionCostPct} />
            <Button onClick={handleRun} disabled={running} className="w-full">
              <Play size={16} />
              {running ? "Running…" : "Run backtest"}
            </Button>
          </div>
        </div>
      </Card>

      {result ? (
        <>
          <Card className="p-5 animate-rise">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-ink">Equity curve</h2>
                <p className="mt-1 text-sm text-ink-soft">Portfolio value over time: strategy vs. buy &amp; hold.</p>
              </div>
              <Badge tone={result.strategyStats.totalReturn >= result.benchmarkStats.totalReturn ? "gain" : "loss"}>
                {result.strategyStats.totalReturn >= result.benchmarkStats.totalReturn ? "Outperformed benchmark" : "Underperformed benchmark"}
              </Badge>
            </div>
            <div className="mt-4">
              <EquityCurveChart data={chartData} />
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <Card className="p-5 lg:col-span-2 animate-rise">
              <h2 className="text-base font-semibold text-ink">Strategy vs. benchmark</h2>
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-ink-soft">
                    <th className="pb-2 font-medium">Metric</th>
                    <th className="pb-2 font-medium text-right">{strategy.label}</th>
                    <th className="pb-2 font-medium text-right">Buy &amp; hold</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map(([label, a, b]) => (
                    <tr key={label} className="border-t border-line">
                      <td className="py-2 text-ink-soft">{label}</td>
                      <td className="py-2 text-right font-tabular font-medium text-ink">{a}</td>
                      <td className="py-2 text-right font-tabular text-ink-soft">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <Card className="p-5 lg:col-span-3 animate-rise">
              <h2 className="text-base font-semibold text-ink">Trade log</h2>
              <p className="mt-1 text-sm text-ink-soft">{result.trades.length} simulated executions for this run.</p>
              <div className="mt-3 max-h-72 overflow-y-auto scroll-thin">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-surface">
                    <tr className="text-left text-xs text-ink-soft">
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Side</th>
                      <th className="pb-2 font-medium text-right">Price</th>
                      <th className="pb-2 font-medium text-right">Shares</th>
                      <th className="pb-2 font-medium text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.trades.map((t, i) => (
                      <tr key={i} className="border-t border-line">
                        <td className="py-2 text-ink-soft">{t.date}</td>
                        <td className="py-2">
                          <Badge tone={t.type === "BUY" ? "gain" : "loss"}>{t.type}</Badge>
                        </td>
                        <td className="py-2 text-right font-tabular text-ink">{t.price.toFixed(2)}</td>
                        <td className="py-2 text-right font-tabular text-ink-soft">{t.shares.toFixed(4)}</td>
                        <td className="py-2 text-right font-tabular text-ink-soft">{t.cost.toFixed(2)}</td>
                      </tr>
                    ))}
                    {result.trades.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-ink-faint">No trades were triggered for these parameters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <Card className="flex flex-col items-center gap-3 p-10 text-center animate-rise">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
            <FlaskConical size={20} />
          </span>
          <p className="text-sm font-medium text-ink">Configure a strategy and run a backtest</p>
          <p className="max-w-sm text-sm text-ink-soft">
            Results are simulated on historical data and never guarantee future performance.
          </p>
        </Card>
      )}
    </div>
  );
}
