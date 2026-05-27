// Typed wrapper around the FastAPI backend.

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export interface RoofSegmentStats {
  pitchDegrees?: number;
  azimuthDegrees?: number;
  stats?: { areaMeters2?: number; sunshineQuantiles?: number[] };
  center?: { latitude: number; longitude: number };
  boundingBox?: { sw: { latitude: number; longitude: number }; ne: { latitude: number; longitude: number } };
  planeHeightAtCenterMeters?: number;
}

export interface SolarPanel {
  center: { latitude: number; longitude: number };
  orientation: "LANDSCAPE" | "PORTRAIT";
  yearlyEnergyDcKwh: number;
  segmentIndex: number;
}

export interface SolarPanelConfig {
  panelsCount: number;
  yearlyEnergyDcKwh: number;
  roofSegmentSummaries: Array<{
    pitchDegrees?: number;
    azimuthDegrees?: number;
    panelsCount: number;
    yearlyEnergyDcKwh: number;
    segmentIndex: number;
  }>;
}

export interface InsightsResponse {
  name?: string;
  center?: { latitude: number; longitude: number };
  imageryQuality?: "HIGH" | "MEDIUM" | "BASE";
  imageryDate?: { year: number; month: number; day: number };
  panelCapacityWatts?: number;
  panelHeightMeters?: number;
  panelWidthMeters?: number;
  maxArrayPanelsCount?: number;
  maxArrayAreaMeters2?: number;
  maxSunshineHoursPerYear?: number;
  carbonOffsetFactorKgPerMwh?: number;
  roofSegmentStats?: RoofSegmentStats[];
  solarPanelConfigs?: SolarPanelConfig[];
  solarPanels?: SolarPanel[];
}

export interface FinanceResponse {
  panels_count: number;
  system_kwp: number;
  annual_kwh_year_one: number;
  co2_offset_kg_year_one: number;
  finance: {
    capex_eur: number;
    annual_savings_year_one_eur: number;
    lifetime_savings_eur: number;
    npv_eur: number;
    payback_years: number | null;
    irr_estimate: number | null;
    yearly_cashflows: Array<{ year: number; kwh: number; savings_eur: number; cumulative_eur: number }>;
  };
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const detail = await r.json().catch(() => ({ message: r.statusText }));
    throw new ApiError(detail?.detail?.message ?? detail?.message ?? "Request failed", r.status, detail?.detail?.code);
  }
  return r.json();
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
  }
}

export const api = {
  insights: (lat: number, lng: number) =>
    post<InsightsResponse>("/api/insights", { lat, lng, required_quality: "MEDIUM" }),
  finance: (params: {
    lat: number;
    lng: number;
    target_kwp?: number;
    electricity_price?: number;
    feed_in_price?: number;
    install_cost_per_kwp?: number;
    self_consumption_ratio?: number;
  }) => post<FinanceResponse>("/api/finance", params),
  lead: (body: {
    name: string;
    email: string;
    phone: string;
    address: string;
    lat: number;
    lng: number;
    system_kwp: number;
    annual_kwh: number;
    estimated_cost_eur: number;
    notes?: string;
  }) => post<{ id: number; ok: boolean }>("/api/leads", body),
};
