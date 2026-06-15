"use client";

import { useEffect, useRef } from "react";
import { mapsLoader } from "@/lib/maps-loader";

interface Props {
  onPlace: (place: { lat: number; lng: number; address: string }) => void;
  placeholder?: string;
  countries?: string[];
}

export function AddressAutocomplete({ onPlace, placeholder, countries = ["fi", "se", "no", "dk"] }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onPlaceRef = useRef(onPlace);
  onPlaceRef.current = onPlace;

  useEffect(() => {
    let mounted = true;
    let element: google.maps.places.PlaceAutocompleteElement | null = null;

    mapsLoader.importLibrary("places").then(() => {
      if (!mounted || !containerRef.current) return;

      element = new google.maps.places.PlaceAutocompleteElement({
        componentRestrictions: { country: countries },
        types: ["address"],
      } as google.maps.places.PlaceAutocompleteElementOptions);

      element.setAttribute("placeholder", placeholder ?? "Enter an address…");
      containerRef.current.appendChild(element);

      element.addEventListener("gmp-select", async (e: Event) => {
        const { place } = e as google.maps.places.PlaceSelectEvent;
        await place.fetchFields({ fields: ["location", "formattedAddress"] });
        const loc = place.location;
        if (!loc) return;
        onPlaceRef.current({
          lat: loc.lat(),
          lng: loc.lng(),
          address: place.formattedAddress ?? "",
        });
      });
    });

    return () => {
      mounted = false;
      if (element && containerRef.current?.contains(element)) {
        containerRef.current.removeChild(element);
      }
    };
  }, []); // mount-only — countries/placeholder don't change per market

  return (
    <>
      <style>{`
        .pac-container-host gmp-placeautocomplete {
          width: 100%;
        }
        gmp-placeautocomplete::part(input) {
          width: 100%;
          border: none;
          border-bottom: 2px solid #1a1a1a;
          background: transparent;
          padding: 1rem 0;
          font-size: 1.5rem;
          font-family: inherit;
          color: #1a1a1a;
          outline: none;
        }
        gmp-placeautocomplete::part(input):focus {
          border-bottom-color: #e3611d;
        }
        gmp-placeautocomplete::part(input)::placeholder {
          color: #5c5b58;
        }
      `}</style>
      <div ref={containerRef} className="w-full" />
    </>
  );
}
