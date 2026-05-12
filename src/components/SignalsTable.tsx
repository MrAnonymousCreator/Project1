import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { signals } from "../lib/market-data";
import { cn } from "../lib/utils";

export function SignalsTable() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mt-8 rounded-3xl bg-surface p-8">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Signals
          </div>
          <h3 className="font-display text-2xl mt-1 text-foreground">
            Indicators, in plain language
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">Tap a row to expand</span>
      </div>

      <div className="mt-6 -mx-2">
        <div className="grid grid-cols-[64px_1fr_140px_24px] px-3 pb-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <span>Time</span>
          <span>Signal</span>
          <span>Value</span>
          <span />
        </div>

        <ul>
          {signals.map((s, i) => {
            const isOpen = open === i;
            const tone =
              s.tone === "positive"
                ? "text-positive"
                : s.tone === "negative"
                  ? "text-negative"
                  : "text-foreground/80";
            return (
              <li key={i} className="border-t border-border/40 first:border-t-0">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className={cn(
                    "grid w-full grid-cols-[64px_1fr_140px_24px] items-center px-3 py-3.5 text-left text-sm transition-colors",
                    "hover:bg-muted/50 rounded-xl",
                  )}
                >
                  <span className="tabular-nums text-muted-foreground">{s.time}</span>
                  <span className="text-foreground">{s.signal}</span>
                  <span className={cn("tabular-nums", tone)}>{s.value}</span>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      isOpen && "rotate-90",
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="animate-fade-soft px-3 pb-5 pt-1">
                    <p className="max-w-2xl text-[14px] leading-relaxed text-foreground/75">
                      {s.context}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
