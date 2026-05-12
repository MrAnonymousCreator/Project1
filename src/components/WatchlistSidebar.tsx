import { useMemo, useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { assets, formatPrice, type Asset } from "../lib/market-data";
import { Sparkline } from "./Sparkline";
import { cn } from "../lib/utils";

type Props = {
  selectedId: string;
  onSelect: (a: Asset) => void;
};

export function WatchlistSidebar({ selectedId, onSelect }: Props) {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return assets;
    return assets.filter(
      (a) => a.name.toLowerCase().includes(s) || a.symbol.toLowerCase().includes(s),
    );
  }, [q]);

  const suggestions = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return assets
      .filter((a) => a.name.toLowerCase().includes(s) || a.symbol.toLowerCase().includes(s))
      .slice(0, 6);
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setFocused(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <aside className="flex h-screen w-[320px] shrink-0 flex-col bg-sidebar">
      <div className="px-6 pt-7 pb-4">
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Workspace
        </div>
        <h1 className="font-display text-2xl mt-1 text-foreground">Markets</h1>
      </div>

      <div className="px-5 relative" ref={wrapRef}>
        <div className="flex items-center gap-2 rounded-2xl bg-surface px-3.5 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Search assets"
            className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              clear
            </button>
          )}
        </div>

        {focused && suggestions.length > 0 && (
          <div className="animate-fade-soft absolute left-5 right-5 top-full mt-2 z-20 overflow-hidden rounded-2xl bg-surface shadow-[0_12px_40px_-12px_oklch(0.3_0.02_270/0.18)]">
            {suggestions.map((a) => (
              <button
                key={a.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(a);
                  setQ("");
                  setFocused(false);
                }}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted/60 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground w-9">
                    {a.symbol}
                  </span>
                  <span className="text-foreground">{a.name}</span>
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  ${formatPrice(a.price)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between px-6">
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Watchlist
        </span>
        <span className="text-[11px] text-muted-foreground tabular-nums">{filtered.length}</span>
      </div>

      <nav className="mt-2 flex-1 overflow-y-auto px-3 pb-6">
        {filtered.map((a) => {
          const positive = a.change24h >= 0;
          const active = a.id === selectedId;
          return (
            <button
              key={a.id}
              onClick={() => onSelect(a)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all",
                active
                  ? "bg-surface shadow-[0_4px_18px_-10px_oklch(0.3_0.02_270/0.15)]"
                  : "hover:bg-sidebar-accent/60",
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/60 text-[11px] font-semibold text-accent-foreground">
                {a.symbol.slice(0, 3)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-medium text-foreground">{a.name}</span>
                  <span className="text-sm tabular-nums text-foreground">
                    ${formatPrice(a.price)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {a.symbol}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] tabular-nums",
                      positive ? "text-positive" : "text-negative",
                    )}
                  >
                    {positive ? "+" : ""}
                    {a.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
              <Sparkline data={a.sparkline} positive={positive} width={56} height={20} />
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No assets match "{q}"
          </div>
        )}
      </nav>
    </aside>
  );
}
