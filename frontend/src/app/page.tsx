import Link from "next/link";
import { nordicMarket, dachMarket, ukMarket, frMarket, esMarket, itMarket } from "@/lib/market";
import type { MarketConfig } from "@/lib/market";

const markets: { href: string; config: MarketConfig }[] = [
  { href: "/nordic", config: nordicMarket },
  { href: "/dach",   config: dachMarket   },
  { href: "/uk",     config: ukMarket     },
  { href: "/fr",     config: frMarket     },
  { href: "/es",     config: esMarket     },
  { href: "/it",     config: itMarket     },
];

export default function Hub() {
  return (
    <main className="min-h-screen bg-paper flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 lg:px-12 py-6 border-b border-ink/10">
        <span className="font-display text-2xl tracking-tight">
          SoLars<span className="text-sun">.</span>
        </span>
        <span className="text-xs uppercase tracking-widest text-ash">
          Solar savings calculator
        </span>
      </header>

      {/* Hero */}
      <section className="px-8 lg:px-12 pt-16 pb-12">
        <p className="text-sm uppercase tracking-[0.3em] text-ash mb-4">
          № 01 — Choose your market
        </p>
        <h1 className="font-display font-light text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] tracking-tight">
          Where is<br />
          <span className="italic text-sun">your roof?</span>
        </h1>
        <p className="mt-6 max-w-lg text-lg text-ash leading-relaxed">
          Select your country. We'll use local electricity tariffs, feed-in
          rates, and install costs to calculate your solar savings.
        </p>
      </section>

      {/* Market grid */}
      <section className="flex-1 px-8 lg:px-12 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/10 border border-ink/10">
          {markets.map(({ href, config }) => (
            <Link
              key={href}
              href={href}
              className="group bg-paper p-8 flex flex-col justify-between min-h-[200px] hover:bg-ink hover:text-paper transition-colors duration-200"
            >
              <div>
                <p className="text-xs uppercase tracking-widest text-ash group-hover:text-paper/60 mb-3">
                  {config.edition}
                </p>
                <p className="font-display text-3xl leading-tight tracking-tight">
                  {config.cities.split(" · ")[0]}
                </p>
                <p className="text-sm text-ash group-hover:text-paper/60 mt-1">
                  {config.cities}
                </p>
              </div>
              <div className="flex items-end justify-between mt-6">
                <span className="mono text-sm text-ash group-hover:text-paper/60">
                  {config.currencySymbol}{config.defaults.electricityPrice.toFixed(2)}/kWh
                </span>
                <span className="font-display text-2xl text-sun group-hover:text-sun translate-x-0 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink/10 px-8 lg:px-12 py-6">
        <p className="text-xs text-ash">
          Satellite solar modelling · Google Solar API · MCS, RGE &amp; certified installers
        </p>
      </footer>
    </main>
  );
}
