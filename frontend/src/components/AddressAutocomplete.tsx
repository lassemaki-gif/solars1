"use client";

import { useEffect, useRef } from "react";
import { mapsLoader } from "@/lib/maps-loader";

interface Props {
  onPlace: (place: { lat: number; lng: number; address: string }) => void;
  placeholder?: string;
  countries?: string[];
}

export function AddressAutocomplete({ onPlace, placeholder, countries = ["fi", "se", "no", "dk"] }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onPlaceRef = useRef(onPlace);
  onPlaceRef.current = onPlace;

  useEffect(() => {
    let ac: google.maps.places.Autocomplete | null = null;
    mapsLoader.importLibrary("places").then((places) => {
      if (!inputRef.current) return;
      ac = new places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: countries },
        fields: ["geometry", "formatted_address"],
        types: ["address"],
      });
      ac.addListener("place_changed", () => {
        const p = ac!.getPlace();
        const loc = p.geometry?.location;
        if (!loc) return;
        onPlaceRef.current({
          lat: loc.lat(),
          lng: loc.lng(),
          address: p.formatted_address ?? "",
        });
      });
    });
    return () => {
      if (ac) google.maps.event.clearInstanceListeners(ac);
    };
  }, []); // mount-only — onPlace changes are handled via ref

  return (
    <input
      ref={inputRef}
      type="text"
      autoComplete="off"
      placeholder={placeholder ?? "Enter a Nordic address…"}
      className="w-full border-b-2 border-ink bg-transparent py-4 text-2xl placeholder:text-ash focus:outline-none focus:border-sun font-display"
    />
  );
}
