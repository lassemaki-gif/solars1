"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { AdBanner } from "@/components/AdBanner";
import { Configurator } from "@/components/Configurator";
import { RoofMap } from "@/components/RoofMap";
import { api, ApiError, FinanceResponse, InsightsResponse } from "@/lib/api";
import type { MarketConfig } from "@/lib/market";

interface Selection {
  lat: number;
  lng: number;
  address: string;
}

export function SolarsApp({ config }: { config: MarketConfig }) {
  const { t } = config;

  const [selection, setSelection] = useState<Selection | null>(null);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [finance, setFinance] = useState<FinanceResponse | null>(null);
  const [targetPanels, setTargetPanels] = useState<number>(0);
  const [financeParams, setFinanceParams] = useState({
    electricity_price: config.defaults.electricityPrice,
    feed_in_price: config.defaults.feedInPrice,
    install_cost_per_kwp: config.defaults.installCostPerKwp,
    self_consumption_ratio: config.defaults.selfConsumptionRatio,
  });
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingFinance, setLoadingFinance] = useState(false);
  const [financeError, setFinanceError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selection) return;
    setError(null);
    setInsights(null);
    setFinance(null);
    setLoadingInsights(true);
    api
      .insights(selection.lat, selection.lng)
      .then((data) => {
        setInsights(data);
        setTargetPanels(Math.max(1, Math.round((data.maxArrayPanelsCount ?? 1) * 0.5)));
      })
      .catch((err: ApiError) => {
        if (err.code === "no_coverage") {
          setError(t.noCoverage);
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoadingInsights(false));
  }, [selection]);

  useEffect(() => {
    if (!selection || !insights || targetPanels === 0) return;
    const panelW = insights.panelCapacityWatts ?? 400;
    const target_kwp = (targetPanels * panelW) / 1000;
    setLoadingFinance(true);
    setFinanceError(null);
    const id = setTimeout(() => {
      api
        .finance({
          lat: selection.lat,
          lng: selection.lng,
          target_kwp,
          ...financeParams,
        })
        .then((data) => { setFinance(data); setFinanceError(null); })
        .catch((err) => setFinanceError(err instanceof Error ? err.message : String(err)))
        .finally(() => setLoadingFinance(false));
    }, 250);
    return () => clearTimeout(id);
  }, [selection, insights, targetPanels, financeParams]);

  if (!selection) {
    return <Landing config={config} onPick={setSelection} />;
  }

  return (
    <main className="relative min-h-screen">
      <Header config={config} onReset={() => { setSelection(null); setInsights(null); setFinance(null); }} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-0">
        <section className="relative h-[60vh] lg:h-[calc(100vh-72px)] bg-fog">
          <RoofMap
            center={{ lat: selection.lat, lng: selection.lng }}
            insights={insights}
            panelLimit={targetPanels}
          />
          {insights && (
            <ImageryBadge quality={insights.imageryQuality} date={insights.imageryDate} />
          )}
          {loadingInsights && (
            <div className="absolute inset-0 grid place-items-center bg-paper/40 backdrop-blur-sm">
              <div className="font-display text-3xl text-ink">{t.scanningRoof}</div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 grid place-items-center p-8">
              <div className="max-w-md bg-paper border-2 border-ink p-8">
                <h3 className="font-display text-2xl mb-2">{t.noData}</h3>
                <p className="text-ash">{error}</p>
                <button
                  onClick={() => setSelection(null)}
                  className="mt-4 underline underline-offset-4"
                >
                  {t.tryAnother}
                </button>
              </div>
            </div>
          )}
        </section>

        <aside className="bg-paper border-l border-ink/10 p-8 lg:p-10 lg:h-[calc(100vh-72px)] lg:overflow-y-auto">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-ash mb-1">{t.property}</p>
            <p className="font-display text-xl leading-tight">{selection.address}</p>
          </div>

          {loadingInsights && (
            <p className="text-ash italic text-sm">{t.scanningRoof}</p>
          )}
          {error && !loadingInsights && (
            <p className="text-red-600 text-sm font-mono mt-2">{error}</p>
          )}
          {insights && (
            <Configurator
              insights={insights}
              finance={finance}
              loadingFinance={loadingFinance}
              financeError={financeError}
              targetPanels={targetPanels}
              market={config}
              onChange={({ targetPanels: tp, ...rest }) => {
                setTargetPanels(tp);
                setFinanceParams(rest);
              }}
            />
          )}

          {insights && config.installer && (
            <div className="mt-8 pt-8 border-t-2 border-ink">
              <p className="text-xs uppercase tracking-widest text-ash mb-1">Certified installer</p>
              <p className="font-display text-lg mb-4">{config.installer.name}</p>
              {config.installer.phone ? (
                <a
                  href={`tel:${config.installer.phone}`}
                  className="flex items-center justify-between w-full bg-sun text-paper px-6 py-4 hover:bg-ink transition-colors duration-200 group"
                >
                  <span className="font-display text-xl">Call now</span>
                  <span className="mono text-sm opacity-80 group-hover:opacity-100">{config.installer.phone}</span>
                </a>
              ) : (
                <p className="text-sm text-ash">Contact via web for a quote.</p>
              )}
            </div>
          )}

          {insights && (
            <div className="mt-8 pt-8 border-t-2 border-ink">
              <AdBanner slot="4853670761" format="auto" />
            </div>
          )}

          <p className="mt-10 text-xs text-ash leading-relaxed">{t.disclaimer}</p>
        </aside>
      </div>
    </main>
  );
}

function Header({ config, onReset }: { config: MarketConfig; onReset: () => void }) {
  return (
    <header className="flex items-center justify-between px-8 lg:px-10 h-[72px] border-b border-ink/10">
      <button onClick={onReset} className="font-display text-2xl tracking-tight">
        SoLars<span className="text-sun">.</span>
      </button>
      <div className="flex items-center gap-6">
        <span className="text-xs uppercase tracking-widest text-ash hidden sm:block">{config.edition}</span>
        <Link href="/?all" className="text-xs uppercase tracking-widest text-ink/60 hover:text-ink border border-ink/20 hover:border-ink/50 px-3 py-1.5 transition-colors">
          All markets
        </Link>
      </div>
    </header>
  );
}

function ImageryBadge({
  quality,
  date,
}: {
  quality?: string;
  date?: { year: number; month: number; day?: number };
}) {
  if (!quality) return null;
  const dateStr = date ? `${date.year}-${String(date.month).padStart(2, "0")}` : "—";
  const tier =
    quality === "HIGH" ? "High resolution" : quality === "MEDIUM" ? "Medium resolution" : "Base resolution";
  return (
    <div className="absolute bottom-4 left-4 bg-paper/95 border border-ink px-4 py-2 mono text-xs">
      <div className="uppercase tracking-widest text-ash">Imagery</div>
      <div className="font-sans">{tier} · {dateStr}</div>
    </div>
  );
}

function Landing({ config, onPick }: { config: MarketConfig; onPick: (s: Selection) => void }) {
  const { t } = config;
  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-8 lg:px-12 py-6">
        <span className="font-display text-2xl tracking-tight">SoLars<span className="text-sun">.</span></span>
        <div className="flex items-center gap-6">
          <span className="text-xs uppercase tracking-widest text-ash hidden sm:block">{config.cities}</span>
          <Link href="/?all" className="text-xs uppercase tracking-widest text-ink/60 hover:text-ink border border-ink/20 hover:border-ink/50 px-3 py-1.5 transition-colors">
            All markets
          </Link>
        </div>
      </header>

      <div className="flex-1 grid lg:grid-cols-12 gap-8 px-8 lg:px-12 pb-16">
        <section className="lg:col-span-7 flex flex-col justify-center">
          <p className="text-sm uppercase tracking-[0.3em] text-ash mb-6">{t.kicker}</p>
          <h1 className="font-display font-light text-[clamp(3rem,8vw,7.5rem)] leading-[0.95] tracking-tight">
            {t.headline1}
            <br />
            <span className="italic text-sun">{t.headline2}</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-ash leading-relaxed">{t.body}</p>

          <div className="mt-12 max-w-2xl">
            <AddressAutocomplete
              onPlace={onPick}
              placeholder={config.placeholder}
              countries={config.countries}
            />
            <p className="mt-3 text-xs uppercase tracking-widest text-ash">{t.pressEnter}</p>
          </div>
        </section>

        <section className="lg:col-span-5 relative hidden lg:block">
          <SunArc solarDeclination={config.solarDeclination} />
        </section>
      </div>

      <footer className="border-t border-ink/10 px-8 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
        <div>
          <div className="text-xs uppercase tracking-widest text-ash mb-1">{t.trust1title}</div>
          <p>{t.trust1body}</p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-ash mb-1">{t.trust2title}</div>
          <p>{t.trust2body}</p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-ash mb-1">{t.trust3title}</div>
          <p>{t.trust3body}</p>
        </div>
      </footer>
    </main>
  );
}

function SunArc({ solarDeclination }: { solarDeclination: string }) {
  return (
    <svg viewBox="0 0 500 600" className="w-full h-full" fill="none">
      <defs>
        <radialGradient id="sg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e3611d" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#e3611d" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#e3611d" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="350" cy="200" r="90" fill="url(#sg)" />
      <circle cx="350" cy="200" r="42" fill="#e3611d" />

      {[80, 130, 180, 230, 280, 330].map((r, i) => (
        <circle
          key={r}
          cx="350"
          cy="200"
          r={r}
          stroke="#1a1a1a"
          strokeOpacity={0.12 - i * 0.012}
          strokeWidth={1}
        />
      ))}

      <line x1="0" y1="470" x2="500" y2="470" stroke="#1a1a1a" strokeWidth="1" />
      <path d="M 60 470 L 60 380 L 200 300 L 340 380 L 340 470 Z" fill="#1a1a1a" />
      <g stroke="#f7f4ee" strokeWidth="0.5">
        <polygon points="100,395 160,355 195,375 135,415" fill="#0b1d3a" />
        <polygon points="200,350 260,310 295,330 235,370" fill="#0b1d3a" />
        <polygon points="245,395 305,355 340,375 280,415" fill="#0b1d3a" />
      </g>

      {[15, 35, 55, 75, 95, 115, 135, 155, 175].map((deg) => {
        const a = (deg * Math.PI) / 180;
        const inner = 330;
        const outer = 346;
        const r = (n: number) => Math.round(n * 1000) / 1000;
        const x1 = r(350 + inner * Math.cos(a));
        const y1 = r(200 + inner * Math.sin(a));
        const x2 = r(350 + outer * Math.cos(a));
        const y2 = r(200 + outer * Math.sin(a));
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1a1a1a" strokeWidth="1" />;
      })}

      <text x="350" y="120" textAnchor="middle" className="mono" fontSize="10" fill="#5c5b58">
        {solarDeclination}
      </text>
      <text x="60" y="495" className="mono" fontSize="9" fill="#5c5b58">
        06:00
      </text>
      <text x="490" y="495" textAnchor="end" className="mono" fontSize="9" fill="#5c5b58">
        21:00
      </text>
    </svg>
  );
}
