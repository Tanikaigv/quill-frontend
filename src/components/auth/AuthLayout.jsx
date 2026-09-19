import { Link } from "react-router-dom";
import { BarChart3, GitBranch, FlaskConical } from "lucide-react";

const FEATURES = [
  { icon: BarChart3, text: "Track Gold, Bitcoin and NVIDIA on one quantitative dashboard." },
  { icon: GitBranch, text: "Study rolling correlation and risk across asset classes." },
  { icon: FlaskConical, text: "Backtest SMA, EMA, momentum and mean-reversion strategies." },
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary-soft p-10 lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#146C5B" />
            <path d="M7 21L12.5 13.5L17 18L25 8" stroke="#F6F7F9" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="25" cy="8" r="2.1" fill="#C7A24A" />
          </svg>
          <span className="font-display text-lg font-semibold text-ink">Quill</span>
        </Link>

        <div className="animate-rise">
          <h2 className="font-display text-3xl font-semibold leading-tight text-ink">
            Multi-asset intelligence, built for research.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-ink-soft">
            One workspace for market data, quantitative indicators, correlation analysis and strategy backtesting.
          </p>
          <ul className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-primary">
                  <Icon size={16} />
                </span>
                <span className="text-sm text-ink-soft">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <svg viewBox="0 0 400 90" className="h-20 w-full text-primary opacity-70">
          <polyline
            points="0,60 40,55 80,68 120,40 160,48 200,20 240,30 280,10 320,26 360,15 400,22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
            style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: "draw-line 1.4s ease-out forwards" }}
          />
        </svg>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm animate-rise">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#146C5B" />
              <path d="M7 21L12.5 13.5L17 18L25 8" stroke="#F6F7F9" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="25" cy="8" r="2.1" fill="#C7A24A" />
            </svg>
            <span className="font-display text-lg font-semibold text-ink">Quill</span>
          </Link>
          <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-ink-soft">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
