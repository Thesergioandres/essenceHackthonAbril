"use client";

import {
  APIProvider,
  AdvancedMarker,
  Map,
  Marker,
  type MapMouseEvent
} from "@vis.gl/react-google-maps";
import gsap from "gsap";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OrganizationLocation } from "@/domain/models/Organization";
import { useTheme } from "@/infrastructure/ui/theme/ThemeProvider";

interface LocationPickerModalProps {
  isOpen: boolean;
  selectedLocation: OrganizationLocation;
  onClose: () => void;
  onConfirm: (location: OrganizationLocation) => void;
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

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";
const GOOGLE_MAPS_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() ?? "";
const GOOGLE_MAPS_MAP_ID_DARK = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID_DARK?.trim() ?? "";

const NEIVA_DEFAULT_CENTER: LatLngLiteral = {
  lat: 2.9273,
  lng: -75.2819
};

const SILVER_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }]
  },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9e7ff" }] }
];

const DARK_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b6878" }]
  },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
  { featureType: "landscape.man_made", elementType: "geometry.stroke", stylers: [{ color: "#334e87" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#023e58" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#283d6a" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6f9ba5" }] },
  { featureType: "poi", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
  { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#023e58" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
  { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2c6675" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#255763" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
  { featureType: "transit", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
  { featureType: "transit.line", elementType: "geometry.fill", stylers: [{ color: "#283d6a" }] },
  { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#3a4762" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4e6d70" }] }
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

const resolveLocationLabel = (location: OrganizationLocation): string => {
  if (typeof location.addressString === "string") {
    const trimmedAddress = location.addressString.trim();

    if (trimmedAddress.length > 0) {
      return trimmedAddress;
    }
  }

  return `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`;
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

const geocodeAddressText = async (query: string): Promise<LatLngLiteral | null> => {
  if (GOOGLE_MAPS_API_KEY.length === 0) {
    return null;
  }

  const normalizedQuery = query.trim();

  if (normalizedQuery.length === 0) {
    return null;
  }

  const geocodeUrl = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  geocodeUrl.searchParams.set("address", normalizedQuery);
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

  const payload = (await response.json()) as {
    status?: string;
    results?: Array<{
      geometry?: {
        location?: {
          lat?: number;
          lng?: number;
        };
      };
    }>;
  };

  if (payload.status !== "OK" || !Array.isArray(payload.results) || payload.results.length === 0) {
    return null;
  }

  const location = payload.results[0]?.geometry?.location;

  if (
    typeof location?.lat !== "number" ||
    typeof location?.lng !== "number" ||
    !Number.isFinite(location.lat) ||
    !Number.isFinite(location.lng)
  ) {
    return null;
  }

  return {
    lat: location.lat,
    lng: location.lng
  };
};

export const LocationPickerModal = ({
  isOpen,
  selectedLocation,
  onClose,
  onConfirm
}: LocationPickerModalProps): JSX.Element | null => {
  const { theme } = useTheme();

  const [isMounted, setIsMounted] = useState<boolean>(isOpen);
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState<boolean>(false);
  const [isLocatingUser, setIsLocatingUser] = useState<boolean>(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState<boolean>(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [draftLocation, setDraftLocation] = useState<OrganizationLocation>(selectedLocation);
  const [hasMarkedPoint, setHasMarkedPoint] = useState<boolean>(false);

  const latestSelectionId = useRef<number>(0);
  const mapRef = useRef<google.maps.Map | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const markerPosition = useMemo<LatLngLiteral>(() => {
    return {
      lat: getSafeCoordinate(draftLocation.lat, NEIVA_DEFAULT_CENTER.lat, -90, 90),
      lng: getSafeCoordinate(draftLocation.lng, NEIVA_DEFAULT_CENTER.lng, -180, 180)
    };
  }, [draftLocation.lat, draftLocation.lng]);

  const mapStyles = useMemo(() => {
    return theme === "dark" ? DARK_MAP_STYLES : SILVER_MAP_STYLES;
  }, [theme]);

  const mapId = useMemo(() => {
    if (theme === "dark" && GOOGLE_MAPS_MAP_ID_DARK.length > 0) {
      return GOOGLE_MAPS_MAP_ID_DARK;
    }

    return GOOGLE_MAPS_MAP_ID;
  }, [theme]);

  const supportsAdvancedMarker = mapId.length > 0;

  const draftLocationLabel = useMemo(() => {
    return resolveLocationLabel(draftLocation);
  }, [draftLocation]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const normalizedAddress =
      typeof selectedLocation.addressString === "string"
        ? selectedLocation.addressString.trim()
        : "";

    const initialLocation: OrganizationLocation = {
      lat: getSafeCoordinate(selectedLocation.lat, NEIVA_DEFAULT_CENTER.lat, -90, 90),
      lng: getSafeCoordinate(selectedLocation.lng, NEIVA_DEFAULT_CENTER.lng, -180, 180),
      ...(normalizedAddress.length > 0 ? { addressString: normalizedAddress } : {})
    };

    setDraftLocation(initialLocation);
    setSearchValue(resolveLocationLabel(initialLocation));
    setLocationError(null);
    setHasMarkedPoint(normalizedAddress.length > 0);
  }, [isOpen, selectedLocation]);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      return;
    }

    if (!overlayRef.current || !mapContainerRef.current) {
      setIsMounted(false);
      return;
    }

    const timeline = gsap.timeline({
      onComplete: () => {
        setIsMounted(false);
      }
    });

    timeline
      .to(mapContainerRef.current, {
        y: 24,
        scale: 0.985,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in"
      })
      .to(
        overlayRef.current,
        {
          opacity: 0,
          duration: 0.2,
          ease: "power2.inOut"
        },
        "<"
      );

    return () => {
      timeline.kill();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isMounted || !overlayRef.current || !mapContainerRef.current) {
      return;
    }

    gsap.set(overlayRef.current, { opacity: 0 });
    gsap.set(mapContainerRef.current, { y: 28, scale: 0.985, opacity: 0 });

    const timeline = gsap.timeline();
    timeline
      .to(overlayRef.current, {
        opacity: 1,
        duration: 0.22,
        ease: "power2.out"
      })
      .to(
        mapContainerRef.current,
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.28,
          ease: "power3.out"
        },
        "<"
      );

    return () => {
      timeline.kill();
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMounted, onClose]);

  const focusMapOnCoordinates = useCallback((coordinates: LatLngLiteral, targetZoom = 18): void => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    map.panTo(coordinates);
    map.setZoom(targetZoom);
  }, []);

  const updateDraftLocation = useCallback(
    async (coordinates: LatLngLiteral, optionalAddress?: string): Promise<void> => {
      const selectionId = latestSelectionId.current + 1;
      latestSelectionId.current = selectionId;

      const fallbackAddress =
        typeof draftLocation.addressString === "string" && draftLocation.addressString.trim().length > 0
          ? draftLocation.addressString.trim()
          : undefined;

      const immediateAddress =
        typeof optionalAddress === "string" && optionalAddress.trim().length > 0
          ? optionalAddress.trim()
          : fallbackAddress;

      setDraftLocation({
        lat: coordinates.lat,
        lng: coordinates.lng,
        ...(immediateAddress ? { addressString: immediateAddress } : {})
      });
      setSearchValue(immediateAddress ?? `${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}`);
      setHasMarkedPoint(true);
      setLocationError(null);
      setIsResolvingAddress(true);

      let resolvedAddress: string | null = optionalAddress?.trim() ?? null;

      if (!resolvedAddress) {
        try {
          resolvedAddress = await reverseGeocodeCoordinates(coordinates);
        } finally {
          if (latestSelectionId.current !== selectionId) {
            return;
          }

          setIsResolvingAddress(false);
        }
      } else {
        setIsResolvingAddress(false);
      }

      if (latestSelectionId.current !== selectionId) {
        return;
      }

      if (!resolvedAddress) {
        setLocationError("No se pudo resolver la dirección automáticamente.");
        return;
      }

      const normalizedAddress = resolvedAddress.trim();
      setDraftLocation({
        lat: coordinates.lat,
        lng: coordinates.lng,
        addressString: normalizedAddress
      });
      setSearchValue(normalizedAddress);
    },
    [draftLocation.addressString]
  );

  const handleAddressSearch = useCallback(async (): Promise<void> => {
    const normalizedSearch = searchValue.trim();

    if (normalizedSearch.length === 0) {
      setLocationError("Escribe una direccion o lugar para buscar en el mapa.");
      return;
    }

    setIsSearchingAddress(true);
    setLocationError(null);

    try {
      const coordinates = await geocodeAddressText(normalizedSearch);

      if (!coordinates) {
        setLocationError("No encontramos coincidencias para esa busqueda.");
        return;
      }

      focusMapOnCoordinates(coordinates, 18);
      await updateDraftLocation(coordinates, normalizedSearch);
    } finally {
      setIsSearchingAddress(false);
    }
  }, [focusMapOnCoordinates, searchValue, updateDraftLocation]);

  const handleMapIdle = useCallback((event: { map: google.maps.Map }): void => {
    mapRef.current = event.map;
  }, []);

  const handleMapClick = useCallback(
    (event: MapMouseEvent): void => {
      const coordinates = extractCoordinatesFromEvent(event);

      if (!coordinates) {
        return;
      }

      focusMapOnCoordinates(coordinates, 18);
      void updateDraftLocation(coordinates);
    },
    [focusMapOnCoordinates, updateDraftLocation]
  );

  const handleMarkerDragEnd = useCallback(
    (event: unknown): void => {
      const coordinates = extractCoordinatesFromEvent(event);

      if (!coordinates) {
        return;
      }

      void updateDraftLocation(coordinates);
    },
    [updateDraftLocation]
  );

  const handleLocateCurrentPosition = useCallback((): void => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("Este navegador no soporta geolocalización.");
      return;
    }

    setLocationError(null);
    setIsLocatingUser(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates: LatLngLiteral = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        focusMapOnCoordinates(coordinates, 18);
        void updateDraftLocation(coordinates);
        setIsLocatingUser(false);
      },
      () => {
        setLocationError("No fue posible obtener tu ubicación actual.");
        setIsLocatingUser(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  }, [focusMapOnCoordinates, updateDraftLocation]);

  const handleConfirm = useCallback((): void => {
    if (!hasMarkedPoint) {
      return;
    }

    const normalizedAddress =
      typeof draftLocation.addressString === "string" && draftLocation.addressString.trim().length > 0
        ? draftLocation.addressString.trim()
        : `${draftLocation.lat.toFixed(6)}, ${draftLocation.lng.toFixed(6)}`;

    onConfirm({
      lat: draftLocation.lat,
      lng: draftLocation.lng,
      addressString: normalizedAddress
    });
    onClose();
  }, [draftLocation, hasMarkedPoint, onClose, onConfirm]);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] bg-zinc-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Selector de ubicación"
    >
      <div ref={mapContainerRef} className="relative h-full w-full overflow-hidden">
        {GOOGLE_MAPS_API_KEY.length > 0 ? (
          <APIProvider
            apiKey={GOOGLE_MAPS_API_KEY}
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
              {...(supportsAdvancedMarker ? { mapId } : {})}
            >
              {supportsAdvancedMarker ? (
                <AdvancedMarker
                  position={markerPosition}
                  title="Ubicación seleccionada"
                  draggable
                  onDragEnd={handleMarkerDragEnd}
                >
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-red-600 text-white shadow-[0_18px_36px_rgba(220,38,38,0.45)] ring-4 ring-white/70 dark:ring-zinc-900/60">
                    <span className="material-symbols-outlined text-[26px]">location_on</span>
                  </div>
                </AdvancedMarker>
              ) : (
                <Marker position={markerPosition} title="Ubicación seleccionada" />
              )}
            </Map>
          </APIProvider>
        ) : (
          <div className="grid h-full place-items-center bg-zinc-100 px-6 dark:bg-zinc-900">
            <p className="max-w-lg rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-800 dark:border-amber-700/60 dark:bg-amber-900/30 dark:text-amber-300">
              Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para habilitar el selector de ubicación.
            </p>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-3 top-4 z-20 sm:inset-x-6">
          <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/65 bg-white/80 px-3 py-2 shadow-[0_18px_40px_rgba(15,23,42,0.32)] backdrop-blur-xl dark:border-zinc-600/70 dark:bg-zinc-900/80">
            <span className="material-symbols-outlined text-[20px] text-zinc-600 dark:text-zinc-200">
              search
            </span>
            <input
              ref={searchInputRef}
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter") {
                  return;
                }

                event.preventDefault();
                void handleAddressSearch();
              }}
              placeholder="Buscar dirección o lugar"
              className="w-full bg-transparent text-sm font-semibold text-zinc-900 outline-none placeholder:text-zinc-500 dark:text-zinc-100 dark:placeholder:text-zinc-400"
              aria-label="Buscar dirección o lugar"
            />
            <button
              type="button"
              onClick={() => {
                void handleAddressSearch();
              }}
              className="inline-flex h-8 items-center justify-center rounded-full bg-primary px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-on-primary transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSearchingAddress}
              aria-label="Buscar dirección"
            >
              {isSearchingAddress ? "Buscando" : "Buscar"}
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute right-3 top-20 z-20 sm:right-6 sm:top-[5.3rem]">
          <button
            type="button"
            onClick={handleLocateCurrentPosition}
            className="pointer-events-auto grid h-12 w-12 place-items-center rounded-full border border-white/70 bg-white/85 text-zinc-700 shadow-[0_14px_30px_rgba(15,23,42,0.3)] transition hover:scale-[1.03] dark:border-zinc-600/70 dark:bg-zinc-900/80 dark:text-zinc-100"
            aria-label="Centrar en mi ubicación"
          >
            <span
              className={`material-symbols-outlined text-[21px] ${isLocatingUser ? "animate-spin" : ""}`}
            >
              {isLocatingUser ? "progress_activity" : "my_location"}
            </span>
          </button>
        </div>

        <div className="pointer-events-none absolute right-3 top-4 z-30 sm:right-6">
          <button
            type="button"
            onClick={onClose}
            className="pointer-events-auto grid h-12 w-12 place-items-center rounded-full border border-white/70 bg-white/90 text-zinc-700 shadow-[0_14px_30px_rgba(15,23,42,0.3)] transition hover:scale-[1.03] dark:border-zinc-600/70 dark:bg-zinc-900/85 dark:text-zinc-100"
            aria-label="Cerrar selector de ubicación"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="pointer-events-none absolute inset-x-3 bottom-[5.75rem] z-20 sm:inset-x-6 sm:bottom-[6.35rem]">
          <div className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-xs shadow-[0_10px_28px_rgba(15,23,42,0.22)] backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/80">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              {isResolvingAddress ? "Buscando dirección..." : locationError ?? draftLocationLabel}
            </p>
            <p className="mt-1 text-zinc-600 dark:text-zinc-300">
              {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-4 sm:bottom-6">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!hasMarkedPoint}
            className="pointer-events-auto inline-flex min-w-[18rem] items-center justify-center rounded-full border border-white/70 bg-primary px-7 py-4 text-sm font-bold uppercase tracking-[0.16em] text-on-primary shadow-[0_16px_44px_rgba(0,109,55,0.4)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:border-zinc-200/80 disabled:bg-zinc-300 disabled:text-zinc-600 disabled:shadow-none dark:disabled:border-zinc-700 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-300"
          >
            Confirmar Ubicación
          </button>
        </div>
      </div>
    </div>
  );
};
