import { useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { type Asset, formatBig, formatPrice } from "../lib/market-data";
import { PriceChart } from "./PriceChart";
import { SignalsTable } from "./SignalsTable";
import { MarketCalendar } from "./MarketCalendar";
import { StoryCards } from "./StoryCards";
import { cn } from "../lib/utils";

const RANGES = ["1H", "1D", "1W", "1M", "1Y", "ALL"] as const;
const VIEWS = ["Overview", "Calendar"] as const;

export function AssetWorkspace({ asset }: { asset: Asset }) {
  const [range, setRange] = useState<(typeof RANGES)[number]>("1M");
  const [view, setView] = useState<(typeof VIEWS)[number]>("Overview");
  const positive = asset.change24h >= 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-10 py-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-8">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {asset.symbol} · USD
          </div>
          <h2 className="font-display text-[3.25rem] leading-[1.05] mt-2 text-foreground">
            {asset.name}
          </h2>
          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-[3.75rem] leading-none tabular-nums text-foreground">
              ${formatPrice(asset.price)}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm tabular-nums",
                positive ? "bg-positive-soft text-positive" : "bg-negative-soft text-negative",
              )}
            >
              {positive ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {positive ? "+" : ""}
              {asset.change24h.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 text-right">
          <div className="inline-flex rounded-full bg-muted p-1">
            {VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                  view === v
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">Last updated · just now</span>
        </div>
      </div>

      {view === "Overview" ? (
        <>
          {/* Chart card */}
          <section className="mt-10 rounded-3xl bg-surface p-8 shadow-[0_4px_24px_-16px_oklch(0.3_0.02_270/0.18)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Price chart
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Trailing performance · USD
                </div>
              </div>
              <div className="inline-flex rounded-full bg-muted p-1">
                {RANGES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                      range === r
                        ? "bg-surface text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <PriceChart data={asset.sparkline} positive={positive} />
            </div>
          </section>

          {/* Stats grid */}
          <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "Market cap", value: formatBig(asset.marketCap) },
              { label: "24h volume", value: formatBig(asset.volume) },
              { label: "Circulating", value: "19.7M" },
              { label: "All-time high", value: `$${formatPrice(asset.price * 1.18)}` },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-surface p-5">
                <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {s.label}
                </div>
                <div className="mt-2 text-xl tabular-nums text-foreground">{s.value}</div>
              </div>
            ))}
          </section>

          {/* Summary */}
          <section className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="md:col-span-2 rounded-3xl bg-surface p-8">
              <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Market summary
              </div>
              <h3 className="font-display text-[1.6rem] leading-snug mt-2 text-foreground">
                {summaryHeadline(asset.name, positive)}
              </h3>
              <p className="mt-4 text-[15px] leading-[1.7] text-foreground/80">
                {summaryBody(asset, positive)}
              </p>
            </article>

            <aside className="rounded-3xl bg-surface p-8">
              <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                About
              </div>
              <h3 className="font-display text-xl mt-2 text-foreground">{asset.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{asset.about}</p>
              <div className="mt-6 space-y-3 text-sm">
                <Row label="Category" value="Layer 1" />
                <Row label="Launched" value="2015" />
                <Row label="Consensus" value="Proof of Stake" />
              </div>
            </aside>
          </section>

          <SignalsTable />
          <StoryCards />
        </>
      ) : (
        <MarketCalendar />
      )}
    </div>
  );
}

function summaryHeadline(name: string, positive: boolean) {
  return positive
    ? `${name} held a steady, constructive tone`
    : `${name} eased without conviction on either side`;
}

function summaryBody(asset: Asset, positive: boolean) {
  const dir = positive ? "advanced" : "drifted lower";
  const tone = positive ? "buyers continued absorbing supply near support" : "sellers met patient bids and momentum cooled rather than accelerated";
  return `${asset.name} ${dir} ${Math.abs(asset.change24h).toFixed(2)}% over the last session, trading in an orderly range with participation close to its trailing average. ${tone.charAt(0).toUpperCase() + tone.slice(1)}, suggesting positioning rather than panic. Volatility remains contained and the broader tape continues to look more like accumulation than chase.`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
