"use client";

import {
  APIProvider,
  AdvancedMarker,
  Map,
  Polyline
} from "@vis.gl/react-google-maps";
import { useMemo } from "react";
import { OrganizationLocation } from "@/domain/models/Organization";

interface LogisticsMapProps {
  origin: OrganizationLocation;
  destination: OrganizationLocation;
  routeLabel?: string;
  remainingDistanceKm?: number;
  className?: string;
}

interface LatLngLiteral {
  lat: number;
  lng: number;
}

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

const getApproxDistanceKm = (
  origin: LatLngLiteral,
  destination: LatLngLiteral
): number => {
  const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

  const earthRadiusKm = 6371;
  const latDelta = toRadians(destination.lat - origin.lat);
  const lngDelta = toRadians(destination.lng - origin.lng);

  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(toRadians(origin.lat)) *
      Math.cos(toRadians(destination.lat)) *
      Math.sin(lngDelta / 2) *
      Math.sin(lngDelta / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(0.1, earthRadiusKm * c);
};

export const LogisticsMap = ({
  origin,
  destination,
  routeLabel = "Ruta activa",
  remainingDistanceKm,
  className
}: LogisticsMapProps): JSX.Element => {
  const originPosition = useMemo<LatLngLiteral>(() => {
    return {
      lat: getSafeCoordinate(origin.lat, 2.9273, -90, 90),
      lng: getSafeCoordinate(origin.lng, -75.2819, -180, 180)
    };
  }, [origin.lat, origin.lng]);

  const destinationPosition = useMemo<LatLngLiteral>(() => {
    return {
      lat: getSafeCoordinate(destination.lat, 2.9341, -90, 90),
      lng: getSafeCoordinate(destination.lng, -75.2558, -180, 180)
    };
  }, [destination.lat, destination.lng]);

  const mapCenter = useMemo<LatLngLiteral>(() => {
    return {
      lat: (originPosition.lat + destinationPosition.lat) / 2,
      lng: (originPosition.lng + destinationPosition.lng) / 2
    };
  }, [destinationPosition.lat, destinationPosition.lng, originPosition.lat, originPosition.lng]);

  const computedDistanceKm = useMemo(() => {
    if (typeof remainingDistanceKm === "number" && Number.isFinite(remainingDistanceKm)) {
      return Math.max(0, remainingDistanceKm);
    }

    return getApproxDistanceKm(originPosition, destinationPosition);
  }, [destinationPosition, originPosition, remainingDistanceKm]);

  const rootClassName = className
    ? `rounded-[2rem] border border-slate-900/10 bg-white/85 p-3 shadow-[0_18px_44px_rgba(15,23,42,0.12)] ${className}`
    : "rounded-[2rem] border border-slate-900/10 bg-white/85 p-3 shadow-[0_18px_44px_rgba(15,23,42,0.12)]";

  if (GOOGLE_MAPS_API_KEY.length === 0) {
    return (
      <section className={rootClassName}>
        <div className="relative h-80 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-slate-200 via-slate-100 to-emerald-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(15,118,110,0.2),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(249,115,22,0.24),transparent_40%)]" />
          <div className="absolute left-7 top-7 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700">
            Mapa no disponible (falta API key)
          </div>
          <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/60 bg-white/90 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{routeLabel}</p>
            <p className="mt-1 text-base font-semibold text-ink">
              Distancia estimada: {computedDistanceKm.toFixed(1)} km
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para habilitar el trazado real de ruta.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={rootClassName}>
      <div className="relative h-80 overflow-hidden rounded-[1.5rem]">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <Map
            center={mapCenter}
            defaultCenter={mapCenter}
            defaultZoom={13}
            mapId={GOOGLE_MAPS_MAP_ID}
            gestureHandling="greedy"
            disableDefaultUI
          >
            <AdvancedMarker position={originPosition} title="Origen" />
            <AdvancedMarker position={destinationPosition} title="Destino" />
            <Polyline
              path={[originPosition, destinationPosition]}
              strokeColor="#006d37"
              strokeOpacity={0.95}
              strokeWeight={5}
            />
          </Map>
        </APIProvider>

        <div className="absolute left-4 top-4 rounded-xl bg-white/90 px-3 py-2 shadow-lg">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Ruta</p>
          <p className="text-sm font-semibold text-ink">{routeLabel}</p>
        </div>

        <div className="absolute bottom-4 right-4 rounded-xl bg-secondary-container px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-on-secondary-container shadow-lg">
          {computedDistanceKm.toFixed(1)} km
        </div>
      </div>
    </section>
  );
};
