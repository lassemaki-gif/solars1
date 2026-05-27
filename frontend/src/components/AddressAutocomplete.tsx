"use client";

import { Loader } from "@googlemaps/js-api-loader";
import { useEffect, useRef } from "react";

interface Props {
  onPlace: (place: { lat: number; lng: number; address: string }) => void;
  placeholder?: string;
}

const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  version: "weekly",
  libraries: ["places"],
});

export function AddressAutocomplete({ onPlace, placeholder }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let ac: google.maps.places.Autocomplete | null = null;
    loader.importLibrary("places").then((places) => {
      if (!inputRef.current) return;
      ac = new places.Autocomplete(inputRef.current, {
        // Focus the Nordics to reduce irrelevant suggestions
        componentRestrictions: { country: ["fi", "se", "no", "dk"] },
        fields: ["geometry", "formatted_address"],
        types: ["address"],
      });
      ac.addListener("place_changed", () => {
        const p = ac!.getPlace();
        const loc = p.geometry?.location;
        if (!loc) return;
        onPlace({
          lat: loc.lat(),
          lng: loc.lng(),
          address: p.formatted_address ?? "",
        });
      });
    });
    return () => {
      if (ac) google.maps.event.clearInstanceListeners(ac);
    };
  }, [onPlace]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder ?? "Enter a Nordic address…"}
      className="w-full border-b-2 border-ink bg-transparent py-4 text-2xl placeholder:text-ash focus:outline-none focus:border-sun font-display"
    />
  );
}
