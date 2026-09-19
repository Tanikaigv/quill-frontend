import { AreaChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-[var(--shadow-pop)]">
      <p className="text-xs text-ink-faint">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-tabular text-sm font-medium" style={{ color: p.color }}>
          {p.name}: {p.value?.toLocaleString(undefined, { maximumFractionDigits: 2 })} {p.dataKey === "close" ? unit : ""}
        </p>
      ))}
    </div>
  );
}

export default function PriceChart({ data, unit, showSMA, showEMA, height = 320 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.16} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
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
          width={56}
          domain={["auto", "auto"]}
        />
        <Tooltip content={<ChartTooltip unit={unit} />} />
        <Area
          type="monotone"
          dataKey="close"
          name="Price"
          stroke="var(--color-primary)"
          strokeWidth={2}
          fill="url(#priceFill)"
          dot={false}
          isAnimationActive
          animationDuration={600}
        />
        {showSMA && (
          <Line
            type="monotone"
            dataKey="sma"
            name="SMA"
            stroke="var(--color-gold)"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        )}
        {showEMA && (
          <Line
            type="monotone"
            dataKey="ema"
            name="EMA"
            stroke="var(--color-loss)"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
