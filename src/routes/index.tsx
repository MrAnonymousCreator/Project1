import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { assets, type Asset } from "../lib/market-data";
import { WatchlistSidebar } from "../components/WatchlistSidebar";
import { NewsTicker } from "../components/NewsTicker";
import { AssetWorkspace } from "../components/AssetWorkspace";

export const Route = createFileRoute("/", {
  component: Index,
  head: () => ({
    meta: [
      { title: "Lumen — A calm crypto market workspace" },
      {
        name: "description",
        content:
          "A soft, minimal crypto workspace with watchlists, charts, and readable market summaries.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
});

function Index() {
  const [selected, setSelected] = useState<Asset>(assets[0]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <WatchlistSidebar selectedId={selected.id} onSelect={setSelected} />
      <main className="flex-1 min-w-0 flex flex-col">
        <NewsTicker />
        <div className="flex-1 overflow-y-auto">
          <AssetWorkspace asset={selected} />
        </div>
      </main>
    </div>
  );
}
