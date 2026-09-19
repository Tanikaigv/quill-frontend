import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-[var(--shadow-pop)]">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="font-tabular text-sm font-medium text-loss">{(payload[0].value * 100).toFixed(2)}%</p>
    </div>
  );
}

export default function DrawdownChart({ data, height = 160 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="ddFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-loss)" stopOpacity={0.05} />
            <stop offset="100%" stopColor="var(--color-loss)" stopOpacity={0.35} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-line)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "var(--color-ink-faint)" }}
          tickLine={false}
          axisLine={{ stroke: "var(--color-line)" }}
          minTickGap={40}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--color-ink-faint)" }}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="drawdown"
          stroke="var(--color-loss)"
          strokeWidth={1.5}
          fill="url(#ddFill)"
          dot={false}
          isAnimationActive
          animationDuration={600}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
