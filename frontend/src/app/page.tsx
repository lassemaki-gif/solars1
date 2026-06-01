"use client";

import { useEffect, useState } from "react";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { Configurator } from "@/components/Configurator";
import { LeadForm } from "@/components/LeadForm";
import { RoofMap } from "@/components/RoofMap";
import { api, ApiError, FinanceResponse, InsightsResponse } from "@/lib/api";

interface Selection {
  lat: number;
  lng: number;
  address: string;
}

export default function Home() {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [finance, setFinance] = useState<FinanceResponse | null>(null);
  const [targetPanels, setTargetPanels] = useState<number>(0);
  const [financeParams, setFinanceParams] = useState({
    electricity_price: 0.18,
    feed_in_price: 0.05,
    install_cost_per_kwp: 750,
    self_consumption_ratio: 0.45,
  });
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingFinance, setLoadingFinance] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch insights when an address is picked
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
          setError("This address isn't covered by satellite solar data yet. Try a nearby city or a different neighbourhood.");
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoadingInsights(false));
  }, [selection]);

  // Fetch finance whenever the target system or assumptions change
  useEffect(() => {
    if (!selection || !insights || targetPanels === 0) return;
    const panelW = insights.panelCapacityWatts ?? 400;
    const target_kwp = (targetPanels * panelW) / 1000;
    setLoadingFinance(true);
    const id = setTimeout(() => {
      api
        .finance({
          lat: selection.lat,
          lng: selection.lng,
          target_kwp,
          ...financeParams,
        })
        .then(setFinance)
        .catch(() => {})
        .finally(() => setLoadingFinance(false));
    }, 250); // debounce slider drags
    return () => clearTimeout(id);
  }, [selection, insights, targetPanels, financeParams]);

  // === Landing state ===
  if (!selection) {
    return <Landing onPick={setSelection} />;
  }

  // === Results state ===
  return (
    <main className="relative min-h-screen">
      <Header onReset={() => { setSelection(null); setInsights(null); setFinance(null); }} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-0">
        {/* Map column */}
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
              <div className="font-display text-3xl text-ink">Scanning the roof…</div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 grid place-items-center p-8">
              <div className="max-w-md bg-paper border-2 border-ink p-8">
                <h3 className="font-display text-2xl mb-2">No data available.</h3>
                <p className="text-ash">{error}</p>
                <button
                  onClick={() => setSelection(null)}
                  className="mt-4 underline underline-offset-4"
                >
                  Try another address
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Config column */}
        <aside className="bg-paper border-l border-ink/10 p-8 lg:p-10 lg:h-[calc(100vh-72px)] lg:overflow-y-auto">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-ash mb-1">Property</p>
            <p className="font-display text-xl leading-tight">{selection.address}</p>
          </div>

          {insights && (
            <Configurator
              insights={insights}
              finance={finance}
              loadingFinance={loadingFinance}
              targetPanels={targetPanels}
              onChange={({ targetPanels: tp, ...rest }) => {
                setTargetPanels(tp);
                setFinanceParams(rest);
              }}
            />
          )}

          {insights && finance && (
            <div className="mt-10 pt-8 border-t-2 border-ink">
              <LeadForm
                address={selection.address}
                lat={selection.lat}
                lng={selection.lng}
                system_kwp={finance.system_kwp}
                annual_kwh={finance.annual_kwh_year_one}
                estimated_cost_eur={finance.finance.capex_eur}
              />
            </div>
          )}

          <p className="mt-10 text-xs text-ash leading-relaxed">
            Estimates are based on Google Solar API satellite modelling and typical Nordic
            tariffs. A certified installer will provide a binding quote after a site survey.
          </p>
        </aside>
      </div>
    </main>
  );
}

function Header({ onReset }: { onReset: () => void }) {
  return (
    <header className="flex items-center justify-between px-8 lg:px-10 h-[72px] border-b border-ink/10">
      <button onClick={onReset} className="font-display text-2xl tracking-tight">
        SoLars<span className="text-sun">.</span>
      </button>
      <span className="text-xs uppercase tracking-widest text-ash">Nordic edition</span>
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

function Landing({ onPick }: { onPick: (s: Selection) => void }) {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-8 lg:px-12 py-6">
        <span className="font-display text-2xl tracking-tight">SoLars<span className="text-sun">.</span></span>
        <span className="text-xs uppercase tracking-widest text-ash">Helsinki · Stockholm · Oslo · København</span>
      </header>

      <div className="flex-1 grid lg:grid-cols-12 gap-8 px-8 lg:px-12 pb-16">
        {/* Editorial display */}
        <section className="lg:col-span-7 flex flex-col justify-center">
          <p className="text-sm uppercase tracking-[0.3em] text-ash mb-6">№ 01 — A new map of the sun</p>
          <h1 className="font-display font-light text-[clamp(3rem,8vw,7.5rem)] leading-[0.95] tracking-tight">
            See the sun
            <br />
            <span className="italic text-sun">on your roof.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-ash leading-relaxed">
            Type a Nordic address. We'll measure your roof from satellite, place panels where they
            earn the most, and tell you what they'll save you in twenty-five years.
          </p>

          <div className="mt-12 max-w-2xl">
            <AddressAutocomplete onPlace={onPick} placeholder="Mannerheimintie 1, Helsinki…" />
            <p className="mt-3 text-xs uppercase tracking-widest text-ash">
              Press ↵ after selecting from the suggestions
            </p>
          </div>
        </section>

        {/* Decorative sun-arc */}
        <section className="lg:col-span-5 relative hidden lg:block">
          <SunArc />
        </section>
      </div>

      {/* Trust strip */}
      <footer className="border-t border-ink/10 px-8 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
        <div>
          <div className="text-xs uppercase tracking-widest text-ash mb-1">Satellite-measured</div>
          <p>Roof area, pitch, azimuth and shading from Google Solar API.</p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-ash mb-1">Nordic economics</div>
          <p>Local tariffs, feed-in compensation, and install costs by default.</p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-ash mb-1">Vetted installers</div>
          <p>Quotes come from certified Nordic installers, not call centres.</p>
        </div>
      </footer>
    </main>
  );
}

function SunArc() {
  // Hand-drawn-feeling solar arc, purely decorative.
  return (
    <svg viewBox="0 0 500 600" className="w-full h-full" fill="none">
      <defs>
        <radialGradient id="sg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e3611d" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#e3611d" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#e3611d" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sun */}
      <circle cx="350" cy="200" r="90" fill="url(#sg)" />
      <circle cx="350" cy="200" r="42" fill="#e3611d" />

      {/* Concentric latitude arcs */}
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

      {/* Horizon line and roof silhouette */}
      <line x1="0" y1="470" x2="500" y2="470" stroke="#1a1a1a" strokeWidth="1" />
      <path
        d="M 60 470 L 60 380 L 200 300 L 340 380 L 340 470 Z"
        fill="#1a1a1a"
      />
      {/* Panels on the roof */}
      <g stroke="#f7f4ee" strokeWidth="0.5">
        <polygon points="100,395 160,355 195,375 135,415" fill="#0b1d3a" />
        <polygon points="200,350 260,310 295,330 235,370" fill="#0b1d3a" />
        <polygon points="245,395 305,355 340,375 280,415" fill="#0b1d3a" />
      </g>

      {/* Tick marks for time-of-day along the arc */}
      {[15, 35, 55, 75, 95, 115, 135, 155, 175].map((deg) => {
        const a = (deg * Math.PI) / 180;
        const inner = 330;
        const outer = 346;
        const x1 = 350 + inner * Math.cos(a);
        const y1 = 200 + inner * Math.sin(a);
        const x2 = 350 + outer * Math.cos(a);
        const y2 = 200 + outer * Math.sin(a);
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1a1a1a" strokeWidth="1" />;
      })}

      {/* Editorial annotations */}
      <text x="350" y="120" textAnchor="middle" className="mono" fontSize="10" fill="#5c5b58">
        SOLAR DECLINATION · 60°N
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
