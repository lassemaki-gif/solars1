"use client";

import { Loader } from "@googlemaps/js-api-loader";
import { useEffect, useRef } from "react";
import type { InsightsResponse, SolarPanel } from "@/lib/api";

interface Props {
  center: { lat: number; lng: number };
  insights: InsightsResponse | null;
  panelLimit: number; // top-N panels by yearly energy
}

const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  version: "weekly",
});

// Convert meters offset to a lat/lng delta — flat-earth approx is fine at building scale
function offsetLatLng(
  origin: google.maps.LatLngLiteral,
  dxMeters: number,
  dyMeters: number,
): google.maps.LatLngLiteral {
  const R = 6378137; // earth radius m
  const dLat = (dyMeters / R) * (180 / Math.PI);
  const dLng = ((dxMeters / R) * (180 / Math.PI)) / Math.cos((origin.lat * Math.PI) / 180);
  return { lat: origin.lat + dLat, lng: origin.lng + dLng };
}

function panelPolygonPath(
  panel: SolarPanel,
  width: number,
  height: number,
  azimuthDegrees: number,
): google.maps.LatLngLiteral[] {
  // Width/height in meters. Orientation rotates the rectangle 90° if PORTRAIT vs LANDSCAPE.
  const w = panel.orientation === "LANDSCAPE" ? width : height;
  const h = panel.orientation === "LANDSCAPE" ? height : width;
  const half = [
    { x: -w / 2, y: -h / 2 },
    { x: w / 2, y: -h / 2 },
    { x: w / 2, y: h / 2 },
    { x: -w / 2, y: h / 2 },
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

export function RoofMap({ center, insights, panelLimit }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const polygonsRef = useRef<google.maps.Polygon[]>([]);

  // Init map once
  useEffect(() => {
    loader.importLibrary("maps").then((maps) => {
      if (!mapRef.current || mapInstance.current) return;
      mapInstance.current = new maps.Map(mapRef.current, {
        center,
        zoom: 20,
        mapTypeId: "satellite",
        tilt: 0,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: "greedy",
      });
    });
  }, [center]);

  // Recenter on change
  useEffect(() => {
    mapInstance.current?.panTo(center);
  }, [center]);

  // Redraw panels whenever insights or panel limit change
  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear previous polygons
    polygonsRef.current.forEach((p) => p.setMap(null));
    polygonsRef.current = [];

    if (!insights || !insights.solarPanels || !insights.panelWidthMeters || !insights.panelHeightMeters) {
      return;
    }

    // Sort by yearly energy and take top N
    const sorted = [...insights.solarPanels].sort(
      (a, b) => b.yearlyEnergyDcKwh - a.yearlyEnergyDcKwh,
    );
    const chosen = sorted.slice(0, panelLimit);

    chosen.forEach((panel) => {
      const seg = insights.roofSegmentStats?.[panel.segmentIndex];
      const azimuth = seg?.azimuthDegrees ?? 0;
      const path = panelPolygonPath(
        panel,
        insights.panelWidthMeters!,
        insights.panelHeightMeters!,
        azimuth,
      );
      const polygon = new google.maps.Polygon({
        paths: path,
        strokeColor: "#1a1a1a",
        strokeOpacity: 0.9,
        strokeWeight: 0.6,
        fillColor: "#0b1d3a",
        fillOpacity: 0.85,
        map: mapInstance.current!,
        clickable: false,
      });
      polygonsRef.current.push(polygon);
    });
  }, [insights, panelLimit]);

  return <div ref={mapRef} className="w-full h-full bg-fog" />;
}
