"use client";

import { useEffect, useRef, useState } from "react";
import type { InsightsResponse, SolarPanel } from "@/lib/api";
import { mapsLoader } from "@/lib/maps-loader";

interface Props {
  center: { lat: number; lng: number };
  insights: InsightsResponse | null;
  panelLimit: number;
}

interface PanelScreenData {
  corners: [[number, number], [number, number], [number, number], [number, number]];
}

interface CapturedScene {
  imageUrl: string;
  panels: PanelScreenData[];
  width: number;
  height: number;
}

const R_EARTH = 6378137;

function offsetLatLng(
  origin: google.maps.LatLngLiteral,
  dxMeters: number,
  dyMeters: number,
): google.maps.LatLngLiteral {
  const dLat = (dyMeters / R_EARTH) * (180 / Math.PI);
  const dLng = ((dxMeters / R_EARTH) * (180 / Math.PI)) / Math.cos((origin.lat * Math.PI) / 180);
  return { lat: origin.lat + dLat, lng: origin.lng + dLng };
}

function panelPolygonPath(
  panel: SolarPanel,
  width: number,
  height: number,
  azimuthDegrees: number,
): google.maps.LatLngLiteral[] {
  const w = panel.orientation === "LANDSCAPE" ? width : height;
  const h = panel.orientation === "LANDSCAPE" ? height : width;
  const half = [
    { x: -w / 2, y: -h / 2 },
    { x:  w / 2, y: -h / 2 },
    { x:  w / 2, y:  h / 2 },
    { x: -w / 2, y:  h / 2 },
  ];
  const theta = (azimuthDegrees * Math.PI) / 180;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return half.map(({ x, y }) => {
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;
    return offsetLatLng({ lat: panel.center.latitude, lng: panel.center.longitude }, rx, ry);
  });
}

function computeHeading(
  from: google.maps.LatLngLiteral,
  to: google.maps.LatLngLiteral,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

// Bilinear interpolation across the panel's 4 projected screen corners.
// u=0 left, u=1 right; v=0 top, v=1 bottom.
function bilerp(
  c: [[number,number],[number,number],[number,number],[number,number]],
  u: number, v: number,
): [number, number] {
  const x = (1-u)*(1-v)*c[0][0] + u*(1-v)*c[1][0] + u*v*c[2][0] + (1-u)*v*c[3][0];
  const y = (1-u)*(1-v)*c[0][1] + u*(1-v)*c[1][1] + u*v*c[2][1] + (1-u)*v*c[3][1];
  return [x, y];
}

function gridLinePath(
  c: [[number,number],[number,number],[number,number],[number,number]],
  t: number,
  axis: "h" | "v",
): string {
  const [a, b] = axis === "v"
    ? [bilerp(c, t, 0), bilerp(c, t, 1)]
    : [bilerp(c, 0, t), bilerp(c, 1, t)];
  return `M${a[0].toFixed(1)},${a[1].toFixed(1)} L${b[0].toFixed(1)},${b[1].toFixed(1)}`;
}

// Project all panels into Street View screen space.
function projectPanels(
  panels: SolarPanel[],
  panelLimit: number,
  insights: InsightsResponse,
  panoPos: google.maps.LatLngLiteral,
  pov: google.maps.StreetViewPov,
  vpW: number,
  vpH: number,
): PanelScreenData[] {
  if (!insights.panelWidthMeters || !insights.panelHeightMeters) return [];

  const H = (pov.heading * Math.PI) / 180;
  const P = (pov.pitch   * Math.PI) / 180;
  const halfFovH = Math.PI / Math.pow(2, (pov.zoom ?? 1) + 1);
  const halfFovV = Math.atan(Math.tan(halfFovH) * (vpH / vpW));
  const CAM_H = 1.5;

  const chosen = [...panels]
    .sort((a, b) => b.yearlyEnergyDcKwh - a.yearlyEnergyDcKwh)
    .slice(0, panelLimit);

  const result: PanelScreenData[] = [];

  for (const panel of chosen) {
    const seg     = insights.roofSegmentStats?.[panel.segmentIndex];
    const pH      = seg?.planeHeightAtCenterMeters ?? 5;
    const corners = panelPolygonPath(panel, insights.panelWidthMeters!, insights.panelHeightMeters!, seg?.azimuthDegrees ?? 0);
    const sc: [number, number][] = [];
    let ok = true;

    for (const c of corners) {
      const north = (c.lat - panoPos.lat) * R_EARTH * (Math.PI / 180);
      const east  = (c.lng - panoPos.lng) * R_EARTH * (Math.PI / 180) * Math.cos(panoPos.lat * Math.PI / 180);
      const up    = pH - CAM_H;
      const fwd   =  east * Math.sin(H) * Math.cos(P) + north * Math.cos(H) * Math.cos(P) + up * Math.sin(P);
      const right =  east * Math.cos(H) - north * Math.sin(H);
      const camUp = -east * Math.sin(H) * Math.sin(P) - north * Math.cos(H) * Math.sin(P) + up * Math.cos(P);

      if (fwd <= 0.5) { ok = false; break; }
      sc.push([
        (( right / (fwd * Math.tan(halfFovH)) + 1) / 2) * vpW,
        ((1 - camUp / (fwd * Math.tan(halfFovV))) / 2) * vpH,
      ]);
    }

    if (!ok || sc.length !== 4) continue;
    const m = 300;
    if (!sc.some(([x, y]) => x > -m && x < vpW + m && y > -m && y < vpH + m)) continue;
    result.push({ corners: sc as PanelScreenData["corners"] });
  }
  return result;
}

// Renders one realistic solar panel in SVG space.
function SvPanel({ corners, index }: { corners: PanelScreenData["corners"]; index: number }) {
  const pts   = corners.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const clipId = `sv-pc-${index}`;
  const gradId = `sv-pg-${index}`;
  const COLS = 6, ROWS = 10;

  const vPaths = Array.from({ length: COLS - 1 }, (_, k) => gridLinePath(corners, (k+1)/COLS, "v")).join(" ");
  const hPaths = Array.from({ length: ROWS - 1 }, (_, k) => gridLinePath(corners, (k+1)/ROWS, "h")).join(" ");
  const [x1, y1] = corners[0];
  const [x2, y2] = corners[2];

  return (
    <g>
      <defs>
        <clipPath id={clipId}><polygon points={pts} /></clipPath>
        <linearGradient id={gradId} gradientUnits="userSpaceOnUse"
          x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)}>
          <stop offset="0%"   stopColor="#7ab0e0" stopOpacity="0.18" />
          <stop offset="40%"  stopColor="#4070a0" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#000820" stopOpacity="0.00" />
        </linearGradient>
      </defs>
      <polygon points={pts} fill="#0c1a28" fillOpacity={0.92} />
      <g clipPath={`url(#${clipId})`}>
        <path d={vPaths} stroke="rgba(255,255,255,0.09)" strokeWidth={0.6} fill="none" />
        <path d={hPaths} stroke="rgba(255,255,255,0.09)" strokeWidth={0.6} fill="none" />
      </g>
      <polygon points={pts} fill={`url(#${gradId})`} />
      <polygon points={pts} fill="none" stroke="#a8b0b8" strokeWidth={1.4} strokeOpacity={0.85} />
    </g>
  );
}

// Static composite: Street View Static API image + panel overlay inside a single SVG viewBox.
// Both image and panels share the same coordinate space, so they scale together on resize.
function VisualisationPanel({ scene }: { scene: CapturedScene }) {
  return (
    <div className="relative flex-1 bg-ink overflow-hidden">
      <svg
        viewBox={`0 0 ${scene.width} ${scene.height}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Street View static image as SVG background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <image
          href={scene.imageUrl}
          x={0} y={0}
          width={scene.width}
          height={scene.height}
          preserveAspectRatio="xMidYMid slice"
        />
        {/* Panel overlays in the same coordinate space */}
        {scene.panels.map((p, i) => (
          <SvPanel key={i} corners={p.corners} index={i + 1000} />
        ))}
      </svg>
      <div className="absolute bottom-4 left-4 bg-paper/95 border border-ink px-4 py-2 mono text-xs">
        <div className="uppercase tracking-widest text-ash">Visualisation</div>
        <div className="font-sans">{scene.panels.length} panel{scene.panels.length !== 1 ? "s" : ""} rendered</div>
      </div>
    </div>
  );
}

export function RoofMap({ center, insights, panelLimit }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const polygonsRef = useRef<google.maps.Polygon[]>([]);

  const svRef = useRef<HTMLDivElement>(null);
  const svPanorama = useRef<google.maps.StreetViewPanorama | null>(null);
  const svService = useRef<google.maps.StreetViewService | null>(null);

  // Stores the panorama position + initial heading used to build the static capture
  const capturedPovRef = useRef<{ pos: google.maps.LatLngLiteral; pov: google.maps.StreetViewPov } | null>(null);

  const [svUnavailable, setSvUnavailable] = useState(false);
  const [svReady, setSvReady]   = useState(false);
  const [panoReady, setPanoReady] = useState(false);
  const [svPanels, setSvPanels] = useState<PanelScreenData[]>([]);
  const [capturedScene, setCapturedScene] = useState<CapturedScene | null>(null);

  // ── Satellite map ──────────────────────────────────────────────────────────

  useEffect(() => {
    mapsLoader.importLibrary("maps").then((maps) => {
      if (!mapRef.current || mapInstance.current) return;
      mapInstance.current = new maps.Map(mapRef.current, {
        center, zoom: 20, mapTypeId: "satellite",
        tilt: 0, disableDefaultUI: true, zoomControl: true, gestureHandling: "greedy",
      });
    });
  }, [center]);

  useEffect(() => { mapInstance.current?.panTo(center); }, [center]);

  useEffect(() => {
    if (!mapInstance.current) return;
    polygonsRef.current.forEach((p) => p.setMap(null));
    polygonsRef.current = [];
    if (!insights?.solarPanels || !insights.panelWidthMeters || !insights.panelHeightMeters) return;

    [...insights.solarPanels]
      .sort((a, b) => b.yearlyEnergyDcKwh - a.yearlyEnergyDcKwh)
      .slice(0, panelLimit)
      .forEach((panel) => {
        const seg = insights.roofSegmentStats?.[panel.segmentIndex];
        const path = panelPolygonPath(panel, insights.panelWidthMeters!, insights.panelHeightMeters!, seg?.azimuthDegrees ?? 0);
        polygonsRef.current.push(new google.maps.Polygon({
          paths: path,
          strokeColor: "#1a1a1a", strokeOpacity: 0.9, strokeWeight: 0.6,
          fillColor: "#0b1d3a", fillOpacity: 0.85,
          map: mapInstance.current!, clickable: false,
        }));
      });
  }, [insights, panelLimit]);

  // ── Street View init ───────────────────────────────────────────────────────

  useEffect(() => {
    mapsLoader.importLibrary("streetView").then((sv) => {
      if (!svRef.current || svPanorama.current) return;
      svService.current = new sv.StreetViewService();
      svPanorama.current = new sv.StreetViewPanorama(svRef.current, {
        disableDefaultUI: true,
        motionTracking: false, motionTrackingControl: false,
        linksControl: false, panControl: false,
        zoomControl: false, addressControl: false, fullscreenControl: false,
      });
      setSvReady(true);
    });
  }, []);

  // ── Street View position update ────────────────────────────────────────────

  useEffect(() => {
    if (!svService.current || !svPanorama.current) return;
    setSvUnavailable(false);
    setSvPanels([]);
    setCapturedScene(null);
    setPanoReady(false);
    capturedPovRef.current = null;

    svService.current.getPanorama(
      { location: center, radius: 50, source: google.maps.StreetViewSource.OUTDOOR, preference: google.maps.StreetViewPreference.NEAREST },
      (data, status) => {
        if (status !== google.maps.StreetViewStatus.OK || !data?.location?.latLng) {
          setSvUnavailable(true);
          return;
        }
        const pos = data.location.latLng.toJSON();
        const heading = computeHeading(pos, center);
        const pov: google.maps.StreetViewPov = { heading, pitch: 5, zoom: 1 };

        svPanorama.current!.setPosition(pos);
        svPanorama.current!.setPov(pov);
        svPanorama.current!.setVisible(true);

        capturedPovRef.current = { pos, pov };
        setPanoReady(true);
      },
    );
  }, [center]);

  // ── Live Street View panel overlay + static capture ────────────────────────

  useEffect(() => {
    if (!svReady || !panoReady || !svPanorama.current || !svRef.current) return;
    if (!insights?.solarPanels || !insights.panelWidthMeters || !insights.panelHeightMeters) {
      setSvPanels([]);
      setCapturedScene(null);
      return;
    }

    // Live overlay: reproject on every camera move
    const reproject = () => {
      if (!svPanorama.current || !svRef.current) return;
      const pos = svPanorama.current.getPosition();
      if (!pos) return;
      setSvPanels(projectPanels(
        insights.solarPanels!, panelLimit, insights,
        pos.toJSON(), svPanorama.current.getPov(),
        svRef.current.clientWidth, svRef.current.clientHeight,
      ));
    };

    const listeners = [
      svPanorama.current.addListener("pov_changed",      reproject),
      svPanorama.current.addListener("position_changed", reproject),
    ];
    reproject();

    // Static capture: fixed dimensions within Street View Static API 640px limit
    if (capturedPovRef.current) {
      const { pos, pov } = capturedPovRef.current;
      const CAPTURE_W = 600;
      const CAPTURE_H = 338;
      const rawFov = 180 / Math.pow(2, pov.zoom ?? 1);
      const fov = Math.max(10, Math.min(120, rawFov));
      const heading = ((pov.heading % 360) + 360) % 360;
      const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
      const imageUrl = `https://maps.googleapis.com/maps/api/streetview`
        + `?size=${CAPTURE_W}x${CAPTURE_H}`
        + `&location=${pos.lat},${pos.lng}`
        + `&heading=${heading.toFixed(2)}`
        + `&pitch=${(pov.pitch ?? 0).toFixed(2)}`
        + `&fov=${fov}`
        + `&key=${key}`;
      const panels = projectPanels(insights.solarPanels!, panelLimit, insights, pos, pov, CAPTURE_W, CAPTURE_H);
      setCapturedScene({ imageUrl, panels, width: CAPTURE_W, height: CAPTURE_H });
    }

    return () => { listeners.forEach((l) => google.maps.event.removeListener(l)); };
  }, [svReady, panoReady, center, insights, panelLimit]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full h-full flex flex-col">

      {/* 1 — Satellite view with panel polygons */}
      <div ref={mapRef} className="flex-1 bg-fog" />

      {/* 2 — Live Street View with real-time panel overlay */}
      <div className="relative flex-1 bg-ink">
        <div ref={svRef} className="w-full h-full" />

        {svPanels.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {svPanels.map((p, i) => <SvPanel key={i} corners={p.corners} index={i} />)}
          </svg>
        )}

        {svUnavailable && (
          <div className="absolute inset-0 grid place-items-center bg-ink text-paper">
            <div className="text-center px-6">
              <p className="text-xs uppercase tracking-widest text-ash mb-2">Street View</p>
              <p className="font-display text-xl">Not available</p>
              <p className="mt-2 text-sm text-ash">No street-level imagery for this address.</p>
            </div>
          </div>
        )}
      </div>

      {/* 3 — Static composite: Street View Static API image + panels in one SVG */}
      {capturedScene
        ? <VisualisationPanel scene={capturedScene} />
        : (
          <div className="relative flex-1 bg-ink grid place-items-center">
            <p className="text-xs uppercase tracking-widest text-ash">
              {svUnavailable ? "No street-level imagery" : "Loading visualisation…"}
            </p>
          </div>
        )
      }
    </div>
  );
}
