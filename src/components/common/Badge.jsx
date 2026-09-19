const TONES = {
  gain: "bg-gain-soft text-gain",
  loss: "bg-loss-soft text-loss",
  gold: "bg-gold-soft text-gold",
  primary: "bg-primary-soft text-primary-dark",
  neutral: "bg-canvas text-ink-soft border border-line",
};

export default function Badge({ tone = "neutral", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
