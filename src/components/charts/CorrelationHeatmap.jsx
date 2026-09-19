// Diverging color scale: -1 -> loss red, 0 -> neutral surface, +1 -> primary teal.
function cellColor(value) {
  const clamped = Math.max(-1, Math.min(1, value));
  if (clamped >= 0) {
    const t = clamped;
    return `color-mix(in srgb, var(--color-primary) ${(t * 75).toFixed(0)}%, var(--color-surface))`;
  }
  const t = -clamped;
  return `color-mix(in srgb, var(--color-loss) ${(t * 75).toFixed(0)}%, var(--color-surface))`;
}

function textColor(value) {
  return Math.abs(value) > 0.55 ? "#FFFFFF" : "var(--color-ink)";
}

export default function CorrelationHeatmap({ keys, matrix, labels = {} }) {
  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="w-full border-separate" style={{ borderSpacing: 6 }}>
        <thead>
          <tr>
            <th className="w-24" />
            {keys.map((k) => (
              <th key={k} className="pb-1 text-xs font-medium text-ink-soft">
                {labels[k] ?? k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keys.map((rowKey) => (
            <tr key={rowKey}>
              <th className="pr-2 text-right text-xs font-medium text-ink-soft">{labels[rowKey] ?? rowKey}</th>
              {keys.map((colKey) => {
                const value = matrix[rowKey][colKey];
                return (
                  <td key={colKey}>
                    <div
                      className="flex aspect-square min-w-[64px] items-center justify-center rounded-md font-tabular text-sm font-medium transition-transform duration-150 hover:scale-[1.04]"
                      style={{ background: cellColor(value), color: textColor(value) }}
                      title={`${labels[rowKey] ?? rowKey} vs ${labels[colKey] ?? colKey}: ${value.toFixed(2)}`}
                    >
                      {value.toFixed(2)}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
