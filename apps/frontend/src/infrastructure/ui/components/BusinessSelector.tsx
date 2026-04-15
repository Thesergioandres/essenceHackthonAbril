"use client";

import { useMemo } from "react";
import { UserType } from "@/domain/models/User";
import { useTenant } from "@/application/hooks/useTenant";
import { LocationPickerMap } from "@/infrastructure/ui/components/LocationPickerMap";

type BusinessSelectorVariant = "compact" | "panel";

interface BusinessSelectorProps {
  className?: string;
  variant?: BusinessSelectorVariant;
  showRoleSwitch?: boolean;
  showLocationPicker?: boolean;
}

const DASHBOARD_ROLES: Array<{ value: UserType; label: string }> = [
  { value: "foundation", label: "Fundacion" },
  { value: "volunteer", label: "Voluntario" }
];

export const BusinessSelector = ({
  className,
  variant = "compact",
  showRoleSwitch = false,
  showLocationPicker = false
}: BusinessSelectorProps): JSX.Element => {
  const {
    organizations,
    activeTenantId,
    activeUserType,
    setActiveTenantId,
    setActiveUserType,
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

  const rootClassName =
    className ??
    (variant === "compact"
      ? "rounded-2xl border border-zinc-200/80 bg-white/85 px-3 py-2 shadow-[0_12px_32px_rgba(15,23,42,0.08)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/85"
      : "rounded-2xl border border-zinc-200/80 bg-white/85 px-4 py-3 shadow-[0_12px_32px_rgba(15,23,42,0.08)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/85");

  return (
    <div className={rootClassName}>
      <p className="font-display text-[11px] uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
        Tenant activo
      </p>

      <div
        className={`mt-2 flex items-center gap-2 ${
          variant === "compact" ? "flex-nowrap" : "flex-wrap"
        }`}
      >
        <select
          value={activeTenantId}
          onChange={(event) => setActiveTenantId(event.target.value)}
          className={`rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-ink outline-none ring-0 focus:border-accent dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 ${
            variant === "compact" ? "w-full" : "min-w-56"
          }`}
          aria-label="Seleccionar organizacion"
        >
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>

        {variant === "panel" ? (
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            {locationLabel}
          </span>
        ) : null}
      </div>

      {variant === "compact" ? (
        <p className="mt-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{locationLabel}</p>
      ) : null}

      {showRoleSwitch ? (
        <div className="mt-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">Modo Operativo</p>
          <div className="mt-2 inline-flex rounded-xl border border-zinc-300 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-800">
            {DASHBOARD_ROLES.map((role) => {
              const isActive = activeUserType === role.value;

              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => {
                    setActiveUserType(role.value);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-accent text-white shadow-[0_8px_24px_rgba(15,118,110,0.28)]"
                      : "text-zinc-600 hover:text-ink dark:text-zinc-300 dark:hover:text-zinc-50"
                  }`}
                >
                  {role.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {showLocationPicker ? (
        <LocationPickerMap
          className="mt-4"
          selectedLocation={activeOrganization.location}
          onLocationSelect={setActiveOrganizationLocation}
        />
      ) : null}
    </div>
  );
};
