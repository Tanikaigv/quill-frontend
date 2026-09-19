export default function Field({ label, type = "text", value, onChange, placeholder, min, max, step, required, icon: Icon }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-xs font-medium text-ink-soft">{label}</span>}
      <div className="relative">
        {Icon && (
          <Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          required={required}
          className={`w-full rounded-lg border border-line-strong bg-surface py-2.5 text-sm text-ink
            placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
            ${Icon ? "pl-9 pr-3" : "px-3"}`}
        />
      </div>
    </label>
  );
}
