"use client";

import { useState } from "react";
import type { FinanceResponse, InsightsResponse } from "@/lib/api";

interface Props {
  insights: InsightsResponse;
  finance: FinanceResponse | null;
  loadingFinance: boolean;
  financeError?: string | null;
  targetPanels: number;
  onChange: (params: {
    targetPanels: number;
    electricity_price: number;
    feed_in_price: number;
    install_cost_per_kwp: number;
    self_consumption_ratio: number;
  }) => void;
}

export function Configurator({ insights, finance, loadingFinance, financeError, targetPanels, onChange }: Props) {
  const max = insights.maxArrayPanelsCount ?? 1;
  const panelW = insights.panelCapacityWatts ?? 400;

  const [elec, setElec] = useState(0.18);
  const [fit, setFit] = useState(0.05);
  const [capex, setCapex] = useState(750);
  const [scr, setScr] = useState(0.45);

  const emit = (patch: Partial<{ targetPanels: number; elec: number; fit: number; capex: number; scr: number }>) => {
    onChange({
      targetPanels: patch.targetPanels ?? targetPanels,
      electricity_price: patch.elec ?? elec,
      feed_in_price: patch.fit ?? fit,
      install_cost_per_kwp: patch.capex ?? capex,
      self_consumption_ratio: patch.scr ?? scr,
    });
  };

  const sysKwp = (targetPanels * panelW) / 1000;

  return (
    <div className="space-y-8">
      {/* System size slider */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label className="text-sm uppercase tracking-widest text-ash">System size</label>
          <span className="mono text-2xl">{sysKwp.toFixed(2)} <span className="text-base text-ash">kWp</span></span>
        </div>
        <input
          type="range"
          min={1}
          max={max}
          value={Math.min(targetPanels, max)}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            emit({ targetPanels: v });
          }}
          className="w-full accent-sun"
        />
        <div className="flex justify-between mono text-xs text-ash mt-1">
          <span>1 panel</span>
          <span>{targetPanels} panels</span>
          <span>{max} max</span>
        </div>
      </div>

      {/* Finance inputs */}
      <details className="border-t border-ink/20 pt-6">
        <summary className="cursor-pointer text-sm uppercase tracking-widest text-ash select-none">
          Adjust assumptions
        </summary>
        <div className="grid grid-cols-2 gap-6 mt-6">
          <Field
            label="Electricity price"
            unit="€/kWh"
            value={elec}
            step={0.01}
            min={0.05}
            max={0.5}
            onChange={(v) => { setElec(v); emit({ elec: v }); }}
          />
          <Field
            label="Feed-in price"
            unit="€/kWh"
            value={fit}
            step={0.01}
            min={0}
            max={0.3}
            onChange={(v) => { setFit(v); emit({ fit: v }); }}
          />
          <Field
            label="Install cost"
            unit="€/kWp"
            value={capex}
            step={50}
            min={400}
            max={2500}
            onChange={(v) => { setCapex(v); emit({ capex: v }); }}
          />
          <Field
            label="Self-consumption"
            unit="%"
            value={scr * 100}
            step={5}
            min={20}
            max={90}
            onChange={(v) => { setScr(v / 100); emit({ scr: v / 100 }); }}
          />
        </div>
      </details>

      {/* Results */}
      <div className="border-t border-ink/20 pt-6 space-y-5">
        {financeError ? (
          <p className="text-red-600 text-sm font-mono">{financeError}</p>
        ) : loadingFinance && !finance ? (
          <p className="text-ash italic">Calculating…</p>
        ) : finance ? (
          <>
            <Stat label="Annual production" value={finance.annual_kwh_year_one.toLocaleString("fi-FI")} unit="kWh / yr" />
            <Stat
              label="Year-one savings"
              value={`€${finance.finance.annual_savings_year_one_eur.toLocaleString("fi-FI", { maximumFractionDigits: 0 })}`}
            />
            <Stat
              label="System cost"
              value={`€${finance.finance.capex_eur.toLocaleString("fi-FI", { maximumFractionDigits: 0 })}`}
            />
            <Stat
              label="Payback"
              value={finance.finance.payback_years != null ? `${finance.finance.payback_years} years` : "> 25 yr"}
              accent
            />
            <Stat
              label="25-year net gain"
              value={`€${finance.finance.lifetime_savings_eur.toLocaleString("fi-FI", { maximumFractionDigits: 0 })}`}
            />
            <Stat
              label="CO₂ offset / yr"
              value={`${finance.co2_offset_kg_year_one.toLocaleString("fi-FI", { maximumFractionDigits: 0 })} kg`}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  label,
  unit,
  value,
  step,
  min,
  max,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  step: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest text-ash mb-2">{label}</span>
      <div className="flex items-baseline gap-2">
        <input
          type="number"
          step={step}
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full bg-transparent border-b border-ink mono text-lg py-1 focus:outline-none focus:border-sun"
        />
        <span className="mono text-xs text-ash">{unit}</span>
      </div>
    </label>
  );
}

function Stat({ label, value, unit, accent }: { label: string; value: string; unit?: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-sm uppercase tracking-widest text-ash">{label}</span>
      <span className={`font-display text-2xl ${accent ? "text-sun" : ""}`}>
        {value}
        {unit && <span className="text-sm text-ash ml-2 font-sans">{unit}</span>}
      </span>
    </div>
  );
}
