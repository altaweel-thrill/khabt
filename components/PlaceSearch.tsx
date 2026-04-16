"use client";

import { useEffect, useRef } from "react";

type PlaceSearchProps = {
  onSelect: (data: {
    lat: number;
    lng: number;
    address: string;
    city: string;
  }) => void;
};

export default function PlaceSearch({ onSelect }: PlaceSearchProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let autocompleteEl: google.maps.places.PlaceAutocompleteElement | null = null;

    const init = async () => {
      if (!window.google?.maps) return;

      await google.maps.importLibrary("places");

      autocompleteEl = new google.maps.places.PlaceAutocompleteElement({
       
      });

      autocompleteEl.className = "w-full";
      autocompleteEl.setAttribute("placeholder", "ابحث عن العنوان أو اسم المكان");

      autocompleteEl.addEventListener("gmp-select", async (event: any) => {
        const place = event.placePrediction?.toPlace?.();

        if (!place) return;

        await place.fetchFields({
          fields: ["displayName", "formattedAddress", "location", "addressComponents"],
        });

        const lat = place.location?.lat();
        const lng = place.location?.lng();

        if (lat == null || lng == null) return;

        let city = "";

        const components = place.addressComponents || [];
        for (const component of components) {
          const types = component.types || [];
          if (
            types.includes("locality") ||
            types.includes("administrative_area_level_2") ||
            types.includes("administrative_area_level_1")
          ) {
            city = component.longText || component.shortText || "";
            break;
          }
        }

        onSelect({
          lat,
          lng,
          address: place.formattedAddress || "",
          city,
        });
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(autocompleteEl);
      }
    };

    init();

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [onSelect]);

  return <div ref={containerRef} className="w-full" />;
}