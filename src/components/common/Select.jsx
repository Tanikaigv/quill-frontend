export default function Select({ label, value, onChange, options, className = "" }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      {label && <span className="text-xs font-medium text-ink-soft">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
