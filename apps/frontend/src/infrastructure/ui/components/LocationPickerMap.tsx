"use client";

import {
  APIProvider,
  AdvancedMarker,
  Map,
  type MapMouseEvent
} from "@vis.gl/react-google-maps";
import { useCallback, useMemo, useRef, useState } from "react";
import { OrganizationLocation } from "@/domain/models/Organization";

interface LocationPickerMapProps {
  selectedLocation: OrganizationLocation;
  onLocationSelect: (location: OrganizationLocation) => void;
  className?: string;
}

interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface GoogleGeocodeResult {
  formatted_address?: string;
}

interface GoogleGeocodeResponse {
  results?: GoogleGeocodeResult[];
  status?: string;
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

const toCoordinateText = (coordinate: number): string => {
  return coordinate.toFixed(5);
};

const parseLatLngFromUnknown = (value: unknown): LatLngLiteral | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const maybeLatLng = value as {
    lat?: unknown;
    lng?: unknown;
  };

  const latValue =
    typeof maybeLatLng.lat === "function"
      ? (maybeLatLng.lat as () => unknown)()
      : maybeLatLng.lat;
  const lngValue =
    typeof maybeLatLng.lng === "function"
      ? (maybeLatLng.lng as () => unknown)()
      : maybeLatLng.lng;

  if (typeof latValue !== "number" || typeof lngValue !== "number") {
    return null;
  }

  if (!Number.isFinite(latValue) || !Number.isFinite(lngValue)) {
    return null;
  }

  return {
    lat: latValue,
    lng: lngValue
  };
};

const extractCoordinatesFromEvent = (event: unknown): LatLngLiteral | null => {
  if (typeof event !== "object" || event === null) {
    return null;
  }

  const eventRecord = event as {
    detail?: {
      latLng?: unknown;
    };
    latLng?: unknown;
  };

  const fromDetail = parseLatLngFromUnknown(eventRecord.detail?.latLng);

  if (fromDetail) {
    return fromDetail;
  }

  return parseLatLngFromUnknown(eventRecord.latLng);
};

const reverseGeocodeCoordinates = async (
  coordinates: LatLngLiteral
): Promise<string | null> => {
  if (GOOGLE_MAPS_API_KEY.length === 0) {
    return null;
  }

  const geocodeUrl = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  geocodeUrl.searchParams.set("latlng", `${coordinates.lat},${coordinates.lng}`);
  geocodeUrl.searchParams.set("key", GOOGLE_MAPS_API_KEY);
  geocodeUrl.searchParams.set("language", "es");
  geocodeUrl.searchParams.set("region", "co");

  const response = await fetch(geocodeUrl.toString(), {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as GoogleGeocodeResponse;

  if (payload.status !== "OK" || !Array.isArray(payload.results)) {
    return null;
  }

  const primaryResult = payload.results[0];

  if (!primaryResult || typeof primaryResult.formatted_address !== "string") {
    return null;
  }

  const normalizedAddress = primaryResult.formatted_address.trim();
  return normalizedAddress.length > 0 ? normalizedAddress : null;
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
  const [isResolvingAddress, setIsResolvingAddress] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const latestSelectionId = useRef<number>(0);

  const markerPosition = useMemo(() => {
    return {
      lat: getSafeCoordinate(selectedLocation.lat, NEIVA_DEFAULT_CENTER.lat, -90, 90),
      lng: getSafeCoordinate(selectedLocation.lng, NEIVA_DEFAULT_CENTER.lng, -180, 180)
    };
  }, [selectedLocation.lat, selectedLocation.lng]);

  const updateLocation = useCallback(
    async (coordinates: LatLngLiteral): Promise<void> => {
      const selectionId = latestSelectionId.current + 1;
      latestSelectionId.current = selectionId;

      setLocationError(null);
      setIsResolvingAddress(true);

      let resolvedAddress: string | null = null;

      try {
        resolvedAddress = await reverseGeocodeCoordinates(coordinates);
      } finally {
        if (latestSelectionId.current !== selectionId) {
          return;
        }

        setIsResolvingAddress(false);
      }

      if (latestSelectionId.current !== selectionId) {
        return;
      }

      if (!resolvedAddress) {
        setLocationError("No se pudo resolver la direccion automaticamente.");
      }

      onLocationSelect({
        lat: coordinates.lat,
        lng: coordinates.lng,
        ...(resolvedAddress
          ? { addressString: resolvedAddress }
          : typeof selectedLocation.addressString === "string" &&
              selectedLocation.addressString.trim().length > 0
            ? { addressString: selectedLocation.addressString.trim() }
            : {})
      });
    },
    [onLocationSelect, selectedLocation.addressString]
  );

  const handleMapClick = useCallback(
    (event: MapMouseEvent): void => {
      const coordinates = extractCoordinatesFromEvent(event);

      if (!coordinates) {
        return;
      }

      void updateLocation(coordinates);
    },
    [updateLocation]
  );

  const handleMarkerDragEnd = useCallback(
    (event: unknown): void => {
      const coordinates = extractCoordinatesFromEvent(event);

      if (!coordinates) {
        return;
      }

      void updateLocation(coordinates);
    },
    [updateLocation]
  );

  const locationLabel = useMemo(() => {
    return resolveLocationLabel(selectedLocation);
  }, [selectedLocation.addressString, selectedLocation.lat, selectedLocation.lng]);

  const rootClassName = className ? `space-y-2 ${className}` : "space-y-2";

  if (GOOGLE_MAPS_API_KEY.length === 0) {
    return (
      <div className={rootClassName}>
        <div className="rounded-3xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
          El mapa no esta disponible en este entorno.
        </div>
        <p className="text-xs text-slate-600">Ubicacion actual: {locationLabel}</p>
      </div>
    );
  }

  return (
    <div className={rootClassName}>
      <div className="h-72 overflow-hidden rounded-3xl border border-slate-300 shadow-[0_14px_32px_rgba(15,23,42,0.12)]">
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
            <AdvancedMarker
              position={markerPosition}
              title="Ubicacion del tenant"
              draggable
              onDragEnd={handleMarkerDragEnd}
            />
          </Map>
        </APIProvider>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <p>
          {isResolvingAddress
            ? "Buscando direccion..."
            : locationError ?? `Direccion: ${locationLabel}`}
        </p>
        <p className="font-semibold text-slate-500">
          {toCoordinateText(markerPosition.lat)}, {toCoordinateText(markerPosition.lng)}
        </p>
      </div>
    </div>
  );
};
