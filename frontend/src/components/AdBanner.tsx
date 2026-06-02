"use client";

import { useEffect, useRef } from "react";

interface AdBannerProps {
  slot: string;
  format?: "auto" | "rectangle" | "vertical";
  className?: string;
}

export function AdBanner({ slot, format = "auto", className = "" }: AdBannerProps) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current || !ref.current) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // adsbygoogle not loaded yet — script still initialising
    }
  }, []);

  return (
    <ins
      ref={ref}
      className={`adsbygoogle block ${className}`}
      style={{ display: "block" }}
      data-ad-client="ca-pub-2322898189280889"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
