"use client";

import {
  APIProvider,
  AdvancedMarker,
  Map,
  type MapMouseEvent
} from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OrganizationLocation } from "@/domain/models/Organization";
import { useTheme } from "@/infrastructure/ui/theme/ThemeProvider";

interface LocationPickerMapProps {
  selectedLocation: OrganizationLocation;
  onLocationSelect: (location: OrganizationLocation) => void;
  className?: string;
  enableFullscreenOnMapClick?: boolean;
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
const API_LIBRARIES = ["places"];

const SILVER_MAP_STYLES = [
  {
    elementType: "geometry",
    stylers: [{ color: "#f5f5f5" }]
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }]
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }]
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#f5f5f5" }]
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }]
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#dadada" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }]
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }]
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }]
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c9e7ff" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#78909c" }]
  }
];

const RETRO_MAP_STYLES = [
  {
    elementType: "geometry",
    stylers: [{ color: "#ebe3cd" }]
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#523735" }]
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#f5f1e6" }]
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#c9b2a6" }]
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "geometry.stroke",
    stylers: [{ color: "#dcd2be" }]
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ae9e90" }]
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#dfd2ae" }]
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#dfd2ae" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#93817c" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{ color: "#a5b076" }]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#447530" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#f5f1e6" }]
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#fdfcf8" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#f8c967" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e9bc62" }]
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [{ color: "#e98d58" }]
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry.stroke",
    stylers: [{ color: "#db8555" }]
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#806b63" }]
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [{ color: "#dfd2ae" }]
  },
  {
    featureType: "transit.line",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8f7d77" }]
  },
  {
    featureType: "transit.line",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#ebe3cd" }]
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [{ color: "#dfd2ae" }]
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#b9d3c2" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#92998d" }]
  }
];

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
  className,
  enableFullscreenOnMapClick = false
}: LocationPickerMapProps): JSX.Element => {
  const { theme } = useTheme();
  const [isResolvingAddress, setIsResolvingAddress] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [isLocatingUser, setIsLocatingUser] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState<boolean>(false);

  const latestSelectionId = useRef<number>(0);
  const mapRef = useRef<google.maps.Map | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const markerPosition = useMemo(() => {
    return {
      lat: getSafeCoordinate(selectedLocation.lat, NEIVA_DEFAULT_CENTER.lat, -90, 90),
      lng: getSafeCoordinate(selectedLocation.lng, NEIVA_DEFAULT_CENTER.lng, -180, 180)
    };
  }, [selectedLocation.lat, selectedLocation.lng]);

  const mapStyles = useMemo(() => {
    return theme === "dark" ? RETRO_MAP_STYLES : SILVER_MAP_STYLES;
  }, [theme]);

  const locationLabel = useMemo(() => {
    return resolveLocationLabel(selectedLocation);
  }, [selectedLocation.addressString, selectedLocation.lat, selectedLocation.lng]);

  const rootClassName = className ? `space-y-2 ${className}` : "space-y-2";

  useEffect(() => {
    setSearchValue(locationLabel);
  }, [locationLabel]);

  useEffect(() => {
    if (!isFullscreen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isFullscreen]);

  const focusMapOnCoordinates = useCallback(
    (coordinates: LatLngLiteral, targetZoom = 18): void => {
      const map = mapRef.current;

      if (!map) {
        return;
      }

      map.panTo(coordinates);
      map.setZoom(targetZoom);
    },
    []
  );

  const updateLocation = useCallback(
    async (coordinates: LatLngLiteral): Promise<void> => {
      const selectionId = latestSelectionId.current + 1;
      latestSelectionId.current = selectionId;

      const fallbackAddress =
        typeof selectedLocation.addressString === "string" &&
        selectedLocation.addressString.trim().length > 0
          ? selectedLocation.addressString.trim()
          : null;

      onLocationSelect({
        lat: coordinates.lat,
        lng: coordinates.lng,
        ...(fallbackAddress ? { addressString: fallbackAddress } : {})
      });

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
        return;
      }

      onLocationSelect({
        lat: coordinates.lat,
        lng: coordinates.lng,
        addressString: resolvedAddress
      });
    },
    [onLocationSelect, selectedLocation.addressString]
  );

  useEffect(() => {
    if (
      !isGoogleMapsReady ||
      !searchInputRef.current ||
      typeof google === "undefined" ||
      !google.maps.places
    ) {
      return;
    }

    const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
      fields: ["formatted_address", "geometry", "name"],
      componentRestrictions: { country: "co" }
    });

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const placeGeometryLocation = place.geometry?.location;

      if (!placeGeometryLocation) {
        setLocationError("Selecciona una sugerencia valida para ubicar el mapa.");
        return;
      }

      const coordinates = {
        lat: placeGeometryLocation.lat(),
        lng: placeGeometryLocation.lng()
      };

      const placeLabel =
        typeof place.formatted_address === "string" && place.formatted_address.trim().length > 0
          ? place.formatted_address.trim()
          : typeof place.name === "string"
            ? place.name.trim()
            : "";

      if (placeLabel.length > 0) {
        setSearchValue(placeLabel);
      }

      focusMapOnCoordinates(coordinates, 18);
      void updateLocation(coordinates);
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [focusMapOnCoordinates, isGoogleMapsReady, updateLocation]);

  const handleLocateCurrentPosition = useCallback((): void => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("Este navegador no soporta geolocalizacion.");
      return;
    }

    setIsLocatingUser(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        focusMapOnCoordinates(coordinates, 18);
        void updateLocation(coordinates);
        setIsLocatingUser(false);
      },
      () => {
        setLocationError("No fue posible obtener tu ubicacion actual.");
        setIsLocatingUser(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  }, [focusMapOnCoordinates, updateLocation]);

  const handleMapIdle = useCallback((event: { map: google.maps.Map }): void => {
    mapRef.current = event.map;
  }, []);

  const handleMapClick = useCallback(
    (event: MapMouseEvent): void => {
      const coordinates = extractCoordinatesFromEvent(event);

      if (!coordinates) {
        return;
      }

      if (enableFullscreenOnMapClick && !isFullscreen) {
        setIsFullscreen(true);
      }

      focusMapOnCoordinates(coordinates, isFullscreen ? 18 : 17);

      void updateLocation(coordinates);
    },
    [enableFullscreenOnMapClick, focusMapOnCoordinates, isFullscreen, updateLocation]
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

  const handleMarkerClick = useCallback((event: unknown): void => {
    if (typeof event !== "object" || event === null) {
      return;
    }

    const markerEvent = event as {
      domEvent?: {
        stopPropagation?: () => void;
      };
      stop?: () => void;
    };

    if (typeof markerEvent.stop === "function") {
      markerEvent.stop();
    }

    markerEvent.domEvent?.stopPropagation?.();
  }, []);

  if (GOOGLE_MAPS_API_KEY.length === 0) {
    return (
      <div className={rootClassName}>
        <div className="rounded-3xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800 dark:border-amber-700/60 dark:bg-amber-900/25 dark:text-amber-300">
          Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para habilitar el selector de mapa.
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-300">Ubicacion actual: {locationLabel}</p>
      </div>
    );
  }

  const mapViewportClassName = isFullscreen
    ? "fixed inset-0 z-50 bg-zinc-950/55 p-4 backdrop-blur-sm transition-all duration-300 sm:p-6"
    : "relative";

  const mapCardClassName = isFullscreen
    ? "relative h-full overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.45)] transition-all duration-300 dark:border-zinc-700 dark:bg-zinc-900"
    : "relative h-72 overflow-hidden rounded-3xl border border-zinc-300 shadow-[0_14px_32px_rgba(15,23,42,0.12)] transition-all duration-300 dark:border-zinc-700";

  return (
    <div className={rootClassName}>
      <div className={mapViewportClassName}>
        <div className={mapCardClassName}>
          <APIProvider
            apiKey={GOOGLE_MAPS_API_KEY}
            libraries={API_LIBRARIES}
            onLoad={() => {
              setIsGoogleMapsReady(true);
            }}
          >
            <Map
              defaultCenter={NEIVA_DEFAULT_CENTER}
              center={markerPosition}
              defaultZoom={13}
              gestureHandling="greedy"
              fullscreenControl={false}
              mapTypeControl={false}
              streetViewControl={false}
              clickableIcons={false}
              styles={mapStyles}
              onIdle={handleMapIdle}
              onClick={handleMapClick}
              className="h-full w-full"
            >
              <AdvancedMarker
                position={markerPosition}
                title="Ubicacion del tenant"
                draggable
                onClick={handleMarkerClick}
                onDragEnd={handleMarkerDragEnd}
              />
            </Map>
          </APIProvider>

          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3 sm:p-4">
            <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/70 bg-white/65 px-3 py-2 shadow-[0_12px_28px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-zinc-600/70 dark:bg-zinc-900/70">
              <span className="material-symbols-outlined text-[19px] text-zinc-500 dark:text-zinc-300">
                search
              </span>
              <input
                ref={searchInputRef}
                value={searchValue}
                onChange={(event) => {
                  setSearchValue(event.target.value);
                }}
                onClick={(event) => {
                  event.stopPropagation();
                }}
                placeholder="Busca tu dirección o un lugar cercano..."
                className="w-full bg-transparent text-sm font-medium text-zinc-800 outline-none placeholder:text-zinc-500 dark:text-zinc-100 dark:placeholder:text-zinc-400"
                aria-label="Buscar direccion o lugar"
              />
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-4 right-4 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleLocateCurrentPosition();
              }}
              className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/80 text-zinc-700 shadow-[0_10px_20px_rgba(15,23,42,0.28)] transition hover:scale-[1.04] hover:bg-white dark:border-zinc-600 dark:bg-zinc-900/85 dark:text-zinc-100 dark:hover:bg-zinc-900"
              aria-label="Usar mi ubicacion actual"
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  isLocatingUser ? "animate-spin" : ""
                }`}
              >
                {isLocatingUser ? "progress_activity" : "my_location"}
              </span>
            </button>

            {isFullscreen ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsFullscreen(false);
                }}
                className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-rose-200 bg-white/90 text-rose-600 shadow-[0_10px_20px_rgba(15,23,42,0.28)] transition hover:scale-[1.04] hover:bg-white dark:border-rose-900/70 dark:bg-zinc-900/90 dark:text-rose-400 dark:hover:bg-zinc-900"
                aria-label="Cerrar mapa en pantalla completa"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            ) : null}
          </div>

          <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 rounded-2xl border border-white/60 bg-white/70 px-3 py-2 text-[11px] backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/70">
            <div className="flex flex-wrap items-center justify-between gap-2 text-zinc-700 dark:text-zinc-200">
              <p>
                {isResolvingAddress
                  ? "Buscando direccion..."
                  : locationError ?? `Direccion: ${locationLabel}`}
              </p>
              <p className="font-semibold text-zinc-600 dark:text-zinc-300">
                {toCoordinateText(markerPosition.lat)}, {toCoordinateText(markerPosition.lng)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {!isFullscreen ? (
        <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
          {enableFullscreenOnMapClick
            ? "Haz clic en el mapa para abrir pantalla completa, mueve el pin y presiona ESC para cerrar."
            : "Haz clic o arrastra el marcador para ajustar la ubicacion."}
        </p>
      ) : null}
    </div>
  );
};
