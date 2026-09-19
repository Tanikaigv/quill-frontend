import { NavLink } from "react-router-dom";
import { LayoutGrid, CandlestickChart, Activity, Share2, FlaskConical, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/markets", label: "Markets", icon: CandlestickChart },
  { to: "/analytics", label: "Analytics", icon: Activity },
  { to: "/correlation", label: "Correlation", icon: Share2 },
  { to: "/backtest", label: "Backtesting", icon: FlaskConical },
];

function initials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-line bg-surface">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#146C5B" />
          <path
            d="M7 21L12.5 13.5L17 18L25 8"
            stroke="#F6F7F9"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="25" cy="8" r="2.1" fill="#C7A24A" />
        </svg>
        <div>
          <p className="font-display text-[17px] font-semibold leading-none text-ink">Quill</p>
          <p className="mt-1 text-[11px] leading-none text-ink-faint">Quant Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-primary-soft text-primary-dark"
                  : "text-ink-soft hover:bg-canvas hover:text-ink"
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line px-3 py-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary-dark">
            {initials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{user?.name ?? "Guest"}</p>
            <p className="truncate text-xs text-ink-faint">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            aria-label="Log out"
            className="shrink-0 rounded-md p-1.5 text-ink-faint transition-colors hover:bg-loss-soft hover:text-loss"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
