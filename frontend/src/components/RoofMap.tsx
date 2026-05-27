"use client";

import { useEffect, useRef, useState } from "react";
import type { InsightsResponse, SolarPanel } from "@/lib/api";
import { mapsLoader } from "@/lib/maps-loader";

interface Props {
  center: { lat: number; lng: number };
  insights: InsightsResponse | null;
  panelLimit: number;
}

// Screen-space data for one projected panel
interface PanelScreenData {
  // Corners in screen pixels: [TL, TR, BR, BL]
  corners: [[number, number], [number, number], [number, number], [number, number]];
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

// Bilinear interpolation across the panel's 4 projected corners.
// u=0 left, u=1 right; v=0 top, v=1 bottom.
function bilerp(
  c: [[number,number],[number,number],[number,number],[number,number]],
  u: number,
  v: number,
): [number, number] {
  const x = (1-u)*(1-v)*c[0][0] + u*(1-v)*c[1][0] + u*v*c[2][0] + (1-u)*v*c[3][0];
  const y = (1-u)*(1-v)*c[0][1] + u*(1-v)*c[1][1] + u*v*c[2][1] + (1-u)*v*c[3][1];
  return [x, y];
}

// Returns SVG path data for a single grid line at parameter t along the given axis.
function gridLinePath(
  c: [[number,number],[number,number],[number,number],[number,number]],
  t: number,
  axis: "h" | "v",
): string {
  const [a, b] = axis === "v"
    ? [bilerp(c, t, 0), bilerp(c, t, 1)]  // vertical divider
    : [bilerp(c, 0, t), bilerp(c, 1, t)]; // horizontal divider
  return `M${a[0].toFixed(1)},${a[1].toFixed(1)} L${b[0].toFixed(1)},${b[1].toFixed(1)}`;
}

function projectPanelsToSV(
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
  const zoom = pov.zoom ?? 1;
  const halfFovH = Math.PI / Math.pow(2, zoom + 1);
  const halfFovV = Math.atan(Math.tan(halfFovH) * (vpH / vpW));
  const CAM_HEIGHT = 1.5;

  const sorted = [...panels].sort((a, b) => b.yearlyEnergyDcKwh - a.yearlyEnergyDcKwh);
  const chosen = sorted.slice(0, panelLimit);
  const result: PanelScreenData[] = [];

  for (const panel of chosen) {
    const seg = insights.roofSegmentStats?.[panel.segmentIndex];
    const panelHeight = seg?.planeHeightAtCenterMeters ?? 5;
    const azimuth = seg?.azimuthDegrees ?? 0;
    const corners2D = panelPolygonPath(panel, insights.panelWidthMeters!, insights.panelHeightMeters!, azimuth);

    const screenCorners: [number, number][] = [];
    let valid = true;

    for (const corner of corners2D) {
      const north = (corner.lat - panoPos.lat) * R_EARTH * (Math.PI / 180);
      const east  = (corner.lng - panoPos.lng) * R_EARTH * (Math.PI / 180) * Math.cos(panoPos.lat * Math.PI / 180);
      const up    = panelHeight - CAM_HEIGHT;

      const fwd   =  east * Math.sin(H) * Math.cos(P) + north * Math.cos(H) * Math.cos(P) + up * Math.sin(P);
      const right =  east * Math.cos(H) - north * Math.sin(H);
      const camUp = -east * Math.sin(H) * Math.sin(P) - north * Math.cos(H) * Math.sin(P) + up * Math.cos(P);

      if (fwd <= 0.5) { valid = false; break; }

      const sx = (( right / (fwd * Math.tan(halfFovH)) + 1) / 2) * vpW;
      const sy = ((1 - camUp / (fwd * Math.tan(halfFovV))) / 2) * vpH;
      screenCorners.push([sx, sy]);
    }

    if (!valid || screenCorners.length !== 4) continue;

    const margin = 300;
    const anyVisible = screenCorners.some(
      ([x, y]) => x > -margin && x < vpW + margin && y > -margin && y < vpH + margin
    );
    if (!anyVisible) continue;

    result.push({
      corners: screenCorners as [[number,number],[number,number],[number,number],[number,number]],
    });
  }

  return result;
}

// Renders one realistic solar panel in SVG space.
// Corners order: TL, TR, BR, BL (matches panelPolygonPath output).
function SvPanel({ corners, index }: { corners: PanelScreenData["corners"]; index: number }) {
  const pts = corners.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const clipId = `sv-pc-${index}`;
  const gradId = `sv-pg-${index}`;

  // Grid: 6 columns × 10 rows (standard 60-cell monocrystalline panel)
  const COLS = 6;
  const ROWS = 10;

  const vPaths = Array.from({ length: COLS - 1 }, (_, k) =>
    gridLinePath(corners, (k + 1) / COLS, "v")
  ).join(" ");

  const hPaths = Array.from({ length: ROWS - 1 }, (_, k) =>
    gridLinePath(corners, (k + 1) / ROWS, "h")
  ).join(" ");

  // Gradient: TL → BR for a subtle cross-light sheen
  const [x1, y1] = corners[0];
  const [x2, y2] = corners[2];

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <polygon points={pts} />
        </clipPath>
        <linearGradient id={gradId} gradientUnits="userSpaceOnUse"
          x1={x1.toFixed(1)} y1={y1.toFixed(1)}
          x2={x2.toFixed(1)} y2={y2.toFixed(1)}>
          <stop offset="0%"   stopColor="#7ab0e0" stopOpacity="0.18" />
          <stop offset="40%"  stopColor="#4070a0" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#000820" stopOpacity="0.00" />
        </linearGradient>
      </defs>

      {/* Panel base — dark monocrystalline blue-black */}
      <polygon points={pts} fill="#0c1a28" fillOpacity={0.92} />

      {/* Cell grid lines, clipped to panel shape */}
      <g clipPath={`url(#${clipId})`}>
        <path d={vPaths} stroke="rgba(255,255,255,0.09)" strokeWidth={0.6} fill="none" />
        <path d={hPaths} stroke="rgba(255,255,255,0.09)" strokeWidth={0.6} fill="none" />
      </g>

      {/* Specular sheen gradient */}
      <polygon points={pts} fill={`url(#${gradId})`} />

      {/* Aluminum frame */}
      <polygon points={pts} fill="none" stroke="#a8b0b8" strokeWidth={1.4} strokeOpacity={0.85} />
    </g>
  );
}

export function RoofMap({ center, insights, panelLimit }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const polygonsRef = useRef<google.maps.Polygon[]>([]);

  const svRef = useRef<HTMLDivElement>(null);
  const svPanorama = useRef<google.maps.StreetViewPanorama | null>(null);
  const svService = useRef<google.maps.StreetViewService | null>(null);
  const [svUnavailable, setSvUnavailable] = useState(false);
  const [svReady, setSvReady] = useState(false);
  const [svPanels, setSvPanels] = useState<PanelScreenData[]>([]);

  // Init satellite map once
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

  // Redraw satellite panel polygons
  useEffect(() => {
    if (!mapInstance.current) return;
    polygonsRef.current.forEach((p) => p.setMap(null));
    polygonsRef.current = [];
    if (!insights?.solarPanels || !insights.panelWidthMeters || !insights.panelHeightMeters) return;

    const sorted = [...insights.solarPanels].sort((a, b) => b.yearlyEnergyDcKwh - a.yearlyEnergyDcKwh);
    sorted.slice(0, panelLimit).forEach((panel) => {
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

  // Init Street View once
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

  // Update Street View position on address change
  useEffect(() => {
    if (!svService.current || !svPanorama.current) return;
    setSvUnavailable(false);
    setSvPanels([]);
    svService.current.getPanorama(
      { location: center, radius: 50, source: google.maps.StreetViewSource.OUTDOOR, preference: google.maps.StreetViewPreference.NEAREST },
      (data, status) => {
        if (status !== google.maps.StreetViewStatus.OK || !data?.location?.latLng) {
          setSvUnavailable(true);
          return;
        }
        const panoLatLng = data.location.latLng.toJSON();
        svPanorama.current!.setPosition(panoLatLng);
        svPanorama.current!.setPov({ heading: computeHeading(panoLatLng, center), pitch: 5 });
        svPanorama.current!.setVisible(true);
      },
    );
  }, [center]);

  // Project panels to Street View — updates on pov_changed / position_changed
  useEffect(() => {
    if (!svReady || !svPanorama.current || !svRef.current) return;
    if (!insights?.solarPanels || !insights.panelWidthMeters || !insights.panelHeightMeters) {
      setSvPanels([]);
      return;
    }

    const reproject = () => {
      if (!svPanorama.current || !svRef.current) return;
      const pos = svPanorama.current.getPosition();
      if (!pos) return;
      setSvPanels(
        projectPanelsToSV(
          insights.solarPanels!, panelLimit, insights,
          pos.toJSON(), svPanorama.current.getPov(),
          svRef.current.clientWidth, svRef.current.clientHeight,
        )
      );
    };

    const listeners = [
      svPanorama.current.addListener("pov_changed", reproject),
      svPanorama.current.addListener("position_changed", reproject),
    ];
    reproject();

    return () => { listeners.forEach((l) => google.maps.event.removeListener(l)); };
  }, [svReady, center, insights, panelLimit]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top half — satellite view */}
      <div ref={mapRef} className="flex-1 bg-fog" />

      {/* Bottom half — Street View + realistic panel SVG overlay */}
      <div className="relative flex-1 bg-ink">
        <div ref={svRef} className="w-full h-full" />

        {svPanels.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {svPanels.map((p, i) => (
              <SvPanel key={i} corners={p.corners} index={i} />
            ))}
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
    </div>
  );
}
