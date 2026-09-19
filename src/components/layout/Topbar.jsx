import { Search, Bell, Menu } from "lucide-react";

export default function Topbar({ onMenuClick }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-md p-1.5 text-ink-soft hover:bg-canvas lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      <div className="relative hidden max-w-xs flex-1 sm:block">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          type="text"
          placeholder="Search assets, strategies…"
          className="w-full rounded-lg border border-line bg-canvas py-2 pl-9 pr-3 text-sm text-ink
            placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden items-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-1.5 text-xs font-medium text-ink-soft sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-gain animate-pulse-dot" />
          Simulated market feed
        </span>
        <button className="relative rounded-md p-2 text-ink-soft hover:bg-canvas" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-loss" />
        </button>
      </div>
    </header>
  );
}
