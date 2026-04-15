"use client";

import {
  APIProvider,
  AdvancedMarker,
  Map,
  type MapMouseEvent
} from "@vis.gl/react-google-maps";
import { useCallback, useMemo } from "react";
import { OrganizationLocation } from "@/domain/models/Organization";

interface LocationPickerMapProps {
  selectedLocation: OrganizationLocation;
  onLocationSelect: (location: OrganizationLocation) => void;
  className?: string;
}

const NEIVA_DEFAULT_CENTER = {
  lat: 2.9273,
  lng: -75.2819
};

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";
const GOOGLE_MAPS_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() || "DEMO_MAP_ID";

const getSafeCoordinate = (
  value: number,
  fallback: number,
  min: number,
  max: number
): number => {
  if (!Number.isFinite(value) || value < min || value > max) {
    return fallback;
  }

  return value;
};

const resolveLocationLabel = (location: OrganizationLocation): string => {
  if (typeof location.addressString === "string") {
    const trimmedAddress = location.addressString.trim();

    if (trimmedAddress.length > 0) {
      return trimmedAddress;
    }
  }

  return `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`;
};

export const LocationPickerMap = ({
  selectedLocation,
  onLocationSelect,
  className
}: LocationPickerMapProps): JSX.Element => {
  const markerPosition = useMemo(() => {
    return {
      lat: getSafeCoordinate(selectedLocation.lat, NEIVA_DEFAULT_CENTER.lat, -90, 90),
      lng: getSafeCoordinate(selectedLocation.lng, NEIVA_DEFAULT_CENTER.lng, -180, 180)
    };
  }, [selectedLocation.lat, selectedLocation.lng]);

  const handleMapClick = useCallback(
    (event: MapMouseEvent): void => {
      if (!event.detail.latLng) {
        return;
      }

      const nextLocation: OrganizationLocation = {
        lat: event.detail.latLng.lat,
        lng: event.detail.latLng.lng
      };

      if (typeof selectedLocation.addressString === "string") {
        const trimmedAddress = selectedLocation.addressString.trim();

        if (trimmedAddress.length > 0) {
          nextLocation.addressString = trimmedAddress;
        }
      }

      onLocationSelect(nextLocation);
    },
    [onLocationSelect, selectedLocation.addressString]
  );

  const locationLabel = useMemo(() => {
    return resolveLocationLabel(selectedLocation);
  }, [selectedLocation.addressString, selectedLocation.lat, selectedLocation.lng]);

  const rootClassName = className ? `space-y-2 ${className}` : "space-y-2";

  if (GOOGLE_MAPS_API_KEY.length === 0) {
    return (
      <div className={rootClassName}>
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
          Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para habilitar el selector de mapa.
        </div>
        <p className="text-xs text-slate-600">Ubicacion actual: {locationLabel}</p>
      </div>
    );
  }

  return (
    <div className={rootClassName}>
      <div className="h-56 overflow-hidden rounded-2xl border border-slate-300">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <Map
            defaultCenter={NEIVA_DEFAULT_CENTER}
            center={markerPosition}
            defaultZoom={13}
            gestureHandling="greedy"
            disableDefaultUI
            mapId={GOOGLE_MAPS_MAP_ID}
            onClick={handleMapClick}
          >
            <AdvancedMarker position={markerPosition} title="Ubicacion del tenant" />
          </Map>
        </APIProvider>
      </div>

      <p className="text-xs text-slate-600">Seleccion actual: {locationLabel}</p>
      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
        Haz clic en el mapa para mover el marcador.
      </p>
    </div>
  );
};
