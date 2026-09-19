import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-[var(--shadow-pop)]">
      <p className="text-xs text-ink-faint">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-tabular text-sm font-medium" style={{ color: p.color }}>
          {p.name}: ${p.value?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      ))}
    </div>
  );
}

export default function EquityCurveChart({ data, height = 320 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
          width={64}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, color: "var(--color-ink-soft)" }} iconType="plainline" iconSize={14} />
        <Line
          type="monotone"
          dataKey="strategy"
          name="Strategy"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={false}
          isAnimationActive
          animationDuration={700}
        />
        <Line
          type="monotone"
          dataKey="benchmark"
          name="Buy & Hold"
          stroke="var(--color-ink-faint)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
