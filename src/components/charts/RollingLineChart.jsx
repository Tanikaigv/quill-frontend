import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  if (value == null) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-[var(--shadow-pop)]">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="font-tabular text-sm font-medium" style={{ color: payload[0].color }}>
        {formatter ? formatter(value) : value}
      </p>
    </div>
  );
}

export default function RollingLineChart({ data, dataKey, color = "var(--color-primary)", formatter, height = 220, zeroLine = false }) {
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
          width={52}
          tickFormatter={formatter}
        />
        {zeroLine && <ReferenceLine y={0} stroke="var(--color-line-strong)" />}
        <Tooltip content={<ChartTooltip formatter={formatter} />} />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
          connectNulls
          isAnimationActive
          animationDuration={600}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
