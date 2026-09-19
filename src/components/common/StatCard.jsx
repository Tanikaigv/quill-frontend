import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import Card from "./Card";
import MiniSparkline from "../charts/MiniSparkline";

const ACCENT_BAR = {
  gain: "bg-gain",
  loss: "bg-loss",
  gold: "bg-gold",
  primary: "bg-primary",
};

export default function StatCard({ label, value, unit, delta, sparkline, tone = "primary", className = "" }) {
  const positive = delta != null ? delta >= 0 : null;
  return (
    <Card className={`relative overflow-hidden p-5 ${className}`}>
      <span className={`absolute left-0 top-0 h-full w-1 ${ACCENT_BAR[tone] ?? ACCENT_BAR.primary}`} />
      <div className="flex items-start justify-between gap-4 pl-2">
        <div className="min-w-0">
          <p className="text-sm text-ink-soft">{label}</p>
          <p className="mt-2 font-tabular text-2xl font-semibold text-ink truncate">
            {value}
            {unit && <span className="ml-1 text-sm font-normal text-ink-faint">{unit}</span>}
          </p>
          {delta != null && (
            <div
              className={`mt-2 inline-flex items-center gap-1 text-xs font-medium font-tabular ${
                positive ? "text-gain" : "text-loss"
              }`}
            >
              {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(delta).toFixed(2)}%
            </div>
          )}
        </div>
        {sparkline && (
          <div className="shrink-0 pt-1">
            <MiniSparkline data={sparkline} tone={tone} />
          </div>
        )}
      </div>
    </Card>
  );
}
