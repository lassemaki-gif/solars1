import type { Metadata } from "next";
import Link from "next/link";
import { hreflangAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "SoLars — Solar savings calculator",
  description: "Instant solar savings estimate for your home. Satellite roof analysis, local tariffs, and certified installers across 59 countries worldwide.",
  openGraph: {
    title: "SoLars — Solar savings calculator",
    description: "Instant solar savings estimate for your home. Satellite roof analysis, local tariffs, and certified installers across 59 countries worldwide.",
    siteName: "SoLars",
    type: "website",
    url: "https://solars.solutions",
    images: [{ url: "https://solars.solutions/api/og", width: 1200, height: 630, alt: "SoLars — Solar savings calculator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SoLars — Solar savings calculator",
    description: "Instant solar savings estimate for your home. Satellite roof analysis, local tariffs, and certified installers across 59 countries.",
    images: ["https://solars.solutions/api/og"],
  },
  alternates: {
    canonical: "https://solars.solutions",
    languages: { "x-default": "https://solars.solutions" },
  },
};
import {
  arMarket, atMarket, auMarket, beMarket, bgMarket, brMarket,
  caMarket, chMarket, clMarket, coMarket, cyMarket, czMarket,
  deMarket, dkMarket, eeMarket, esMarket, fiMarket, frMarket,
  gbMarket, grMarket, hkMarket, hrMarket, huMarket, idMarket, ieMarket, isMarket,
  itMarket, jpMarket, krMarket, ltMarket, luMarket, lvMarket, mtMarket, mxMarket,
  myMarket, nlMarket, noMarket, nzMarket, peMarket, phMarket, plMarket,
  prMarket, ptMarket, roMarket, seMarket, sgMarket, siMarket, skMarket,
  thMarket, twMarket, usMarket,
} from "@/lib/market";
import type { MarketConfig } from "@/lib/market";

const euMarkets: { href: string; config: MarketConfig }[] = [
  { href: "/at", config: atMarket },
  { href: "/be", config: beMarket },
  { href: "/bg", config: bgMarket },
  { href: "/hr", config: hrMarket },
  { href: "/cy", config: cyMarket },
  { href: "/cz", config: czMarket },
  { href: "/dk", config: dkMarket },
  { href: "/ee", config: eeMarket },
  { href: "/fi", config: fiMarket },
  { href: "/fr", config: frMarket },
  { href: "/de", config: deMarket },
  { href: "/gr", config: grMarket },
  { href: "/hu", config: huMarket },
  { href: "/ie", config: ieMarket },
  { href: "/it", config: itMarket },
  { href: "/lv", config: lvMarket },
  { href: "/lt", config: ltMarket },
  { href: "/lu", config: luMarket },
  { href: "/mt", config: mtMarket },
  { href: "/nl", config: nlMarket },
  { href: "/pl", config: plMarket },
  { href: "/pt", config: ptMarket },
  { href: "/ro", config: roMarket },
  { href: "/sk", config: skMarket },
  { href: "/si", config: siMarket },
  { href: "/es", config: esMarket },
  { href: "/se", config: seMarket },
];

const nonEuMarkets: { href: string; config: MarketConfig }[] = [
  { href: "/gb", config: gbMarket },
  { href: "/ch", config: chMarket },
  { href: "/no", config: noMarket },
  { href: "/is", config: isMarket },
];

const globalMarkets: { href: string; config: MarketConfig }[] = [
  { href: "/us", config: usMarket },
  { href: "/ca", config: caMarket },
  { href: "/au", config: auMarket },
  { href: "/nz", config: nzMarket },
];

const asiaMarkets: { href: string; config: MarketConfig }[] = [
  { href: "/jp", config: jpMarket },
  { href: "/kr", config: krMarket },
  { href: "/hk", config: hkMarket },
  { href: "/tw", config: twMarket },
  { href: "/sg", config: sgMarket },
  { href: "/th", config: thMarket },
  { href: "/my", config: myMarket },
  { href: "/ph", config: phMarket },
  { href: "/id", config: idMarket },
];

const latamMarkets: { href: string; config: MarketConfig }[] = [
  { href: "/mx", config: mxMarket },
  { href: "/co", config: coMarket },
  { href: "/pe", config: peMarket },
  { href: "/cl", config: clMarket },
  { href: "/br", config: brMarket },
  { href: "/ar", config: arMarket },
  { href: "/pr", config: prMarket },
];

function MarketCard({ href, config }: { href: string; config: MarketConfig }) {
  return (
    <Link
      href={href}
      className="group bg-paper p-6 flex flex-col justify-between min-h-[160px] hover:bg-ink hover:text-paper transition-colors duration-200"
    >
      <div>
        <p className="text-xs uppercase tracking-widest text-ash group-hover:text-paper/50 mb-2">
          {config.countryNameEn}
        </p>
        <p className="font-display text-xl leading-tight tracking-tight">
          {config.edition}
        </p>
      </div>
      <div className="flex items-end justify-between mt-4">
        <span className="mono text-xs text-ash group-hover:text-paper/50">
          {config.currencySymbol}{config.defaults.electricityPrice.toFixed(2)}/kWh
        </span>
        <span className="font-display text-xl text-sun group-hover:translate-x-1 transition-transform">
          →
        </span>
      </div>
    </Link>
  );
}

export default function Hub() {
  return (
    <main className="min-h-screen bg-paper flex flex-col">
      <header className="flex items-center justify-between px-8 lg:px-12 py-6 border-b border-ink/10">
        <span className="font-display text-2xl tracking-tight">
          SoLars<span className="text-sun">.</span>
        </span>
        <span className="text-xs uppercase tracking-widest text-ash hidden sm:block">
          Solar savings calculator
        </span>
      </header>

      <section className="px-8 lg:px-12 pt-14 pb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-ash mb-4">
          № 01 — Choose your market
        </p>
        <h1 className="font-display font-light text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-tight">
          Where is<br />
          <span className="italic text-sun">your roof?</span>
        </h1>
        <p className="mt-5 max-w-lg text-lg text-ash leading-relaxed">
          Select your country. We use local tariffs, feed-in rates, and
          install costs to calculate your solar savings.
        </p>
      </section>

      <section className="px-8 lg:px-12 pb-4">
        <p className="text-xs uppercase tracking-widest text-ash mb-3">European Union</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-ink/10 border border-ink/10">
          {euMarkets.map(({ href, config }) => (
            <MarketCard key={href} href={href} config={config} />
          ))}
        </div>
      </section>

      <section className="px-8 lg:px-12 pb-8 mt-8">
        <p className="text-xs uppercase tracking-widest text-ash mb-3">Outside EU</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-ink/10 border border-ink/10">
          {nonEuMarkets.map(({ href, config }) => (
            <MarketCard key={href} href={href} config={config} />
          ))}
        </div>
      </section>

      <section className="px-8 lg:px-12 pb-8 mt-8">
        <p className="text-xs uppercase tracking-widest text-ash mb-3">Americas &amp; Oceania</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-ink/10 border border-ink/10">
          {globalMarkets.map(({ href, config }) => (
            <MarketCard key={href} href={href} config={config} />
          ))}
        </div>
      </section>

      <section className="px-8 lg:px-12 pb-8 mt-8">
        <p className="text-xs uppercase tracking-widest text-ash mb-3">Asia</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-ink/10 border border-ink/10">
          {asiaMarkets.map(({ href, config }) => (
            <MarketCard key={href} href={href} config={config} />
          ))}
        </div>
      </section>

      <section className="px-8 lg:px-12 pb-16 mt-8">
        <p className="text-xs uppercase tracking-widest text-ash mb-3">Latin America</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-ink/10 border border-ink/10">
          {latamMarkets.map(({ href, config }) => (
            <MarketCard key={href} href={href} config={config} />
          ))}
        </div>
      </section>

      <footer className="mt-auto border-t border-ink/10 px-8 lg:px-12 py-6">
        <p className="text-xs text-ash">
          Satellite solar modelling · Google Solar API · Certified installers worldwide
        </p>
      </footer>
    </main>
  );
}
