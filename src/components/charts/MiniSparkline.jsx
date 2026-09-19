// Lightweight inline trend line for stat cards — no charting library needed.
export default function MiniSparkline({ data, width = 96, height = 32, tone = "primary" }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data
    .map((v, i) => `${(i * stepX).toFixed(2)},${(height - ((v - min) / range) * height).toFixed(2)}`)
    .join(" ");

  const strokeByTone = {
    primary: "var(--color-primary)",
    gain: "var(--color-gain)",
    loss: "var(--color-loss)",
    gold: "var(--color-gold)",
  };

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={strokeByTone[tone] ?? strokeByTone.primary}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
