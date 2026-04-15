"use client";

import { useMemo } from "react";
import { useTenant } from "@/application/hooks/useTenant";
import { LocationPickerMap } from "@/infrastructure/ui/components/LocationPickerMap";

export const BusinessSelector = (): JSX.Element => {
  const {
    organizations,
    activeTenantId,
    setActiveTenantId,
    activeOrganization,
    setActiveOrganizationLocation
  } = useTenant();

  const locationLabel = useMemo(() => {
    if (typeof activeOrganization.location.addressString === "string") {
      const trimmedAddress = activeOrganization.location.addressString.trim();

      if (trimmedAddress.length > 0) {
        return trimmedAddress;
      }
    }

    return `${activeOrganization.location.lat.toFixed(5)}, ${activeOrganization.location.lng.toFixed(5)}`;
  }, [
    activeOrganization.location.addressString,
    activeOrganization.location.lat,
    activeOrganization.location.lng
  ]);

  return (
    <div className="rounded-2xl border border-slate-900/10 bg-white/85 px-4 py-3 shadow-[0_12px_32px_rgba(15,23,42,0.08)] backdrop-blur">
      <p className="font-display text-[11px] uppercase tracking-[0.2em] text-slate-500">
        Tenant activo
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <select
          value={activeTenantId}
          onChange={(event) => setActiveTenantId(event.target.value)}
          className="min-w-56 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-ink outline-none ring-0 focus:border-accent"
          aria-label="Seleccionar organizacion"
        >
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>

        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
          {locationLabel}
        </span>
      </div>

      <LocationPickerMap
        className="mt-4"
        selectedLocation={activeOrganization.location}
        onLocationSelect={setActiveOrganizationLocation}
      />
    </div>
  );
};
