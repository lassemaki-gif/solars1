"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
const STORAGE_KEY = "solars_utm";

export type UTMParams = Partial<Record<typeof UTM_KEYS[number], string>>;

export function useUTM(): UTMParams {
  const searchParams = useSearchParams();

  useEffect(() => {
    const found: UTMParams = {};
    UTM_KEYS.forEach((key) => {
      const val = searchParams.get(key);
      if (val) found[key] = val;
    });
    if (Object.keys(found).length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    }
  }, [searchParams]);

  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}
