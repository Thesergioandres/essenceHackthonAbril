"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { Organization, OrganizationLocation } from "@/domain/models/Organization";
import { getTenantIdFromRuntime, setTenantIdInRuntime } from "@/infrastructure/network/httpClient";

const initialOrganizations = [
  {
    id: "tenant-demo",
    name: "Central Kitchen - Downtown",
    location: {
      lat: 2.928611,
      lng: -75.281111,
      addressString: "Carrera 5 #14-24, Neiva"
    },
    createdAt: "2026-04-01T10:00:00.000Z"
  },
  {
    id: "tenant-north",
    name: "North Rescue Hub",
    location: {
      lat: 2.950241,
      lng: -75.270628,
      addressString: "Avenida Circunvalar #88, Neiva"
    },
    createdAt: "2026-04-02T10:00:00.000Z"
  },
  {
    id: "tenant-east",
    name: "East Community Pantry",
    location: {
      lat: 2.934109,
      lng: -75.255864,
      addressString: "Calle 21 #45-12, Neiva"
    },
    createdAt: "2026-04-03T10:00:00.000Z"
  }
] satisfies [Organization, ...Organization[]];

const DEFAULT_TENANT_ID = initialOrganizations[0].id;

const normalizeLocation = (location: OrganizationLocation): OrganizationLocation => {
  const normalized: OrganizationLocation = {
    lat: location.lat,
    lng: location.lng
  };

  if (typeof location.addressString === "string") {
    const trimmedAddress = location.addressString.trim();

    if (trimmedAddress.length > 0) {
      normalized.addressString = trimmedAddress;
    }
  }

  return normalized;
};

const resolveInitialTenantId = (organizations: readonly Organization[]): string => {
  const runtimeTenantId = getTenantIdFromRuntime();
  const selectedTenant = organizations.find((organization) => organization.id === runtimeTenantId);

  const initialTenantId = selectedTenant?.id ?? DEFAULT_TENANT_ID;
  setTenantIdInRuntime(initialTenantId);
  return initialTenantId;
};

interface TenantState {
  activeTenantId: string;
  organizations: Organization[];
}

let tenantState: TenantState = {
  activeTenantId: resolveInitialTenantId(initialOrganizations),
  organizations: [...initialOrganizations]
};

const subscribers = new Set<() => void>();

const subscribe = (listener: () => void): (() => void) => {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
};

const getSnapshot = (): TenantState => tenantState;

const emitChange = (): void => {
  subscribers.forEach((listener) => listener());
};

const setActiveTenantInStore = (tenantId: string): void => {
  const selected = tenantState.organizations.find((organization) => organization.id === tenantId);

  if (!selected) {
    return;
  }

  if (selected.id === tenantState.activeTenantId) {
    return;
  }

  tenantState = {
    ...tenantState,
    activeTenantId: selected.id
  };
  setTenantIdInRuntime(selected.id);
  emitChange();
};

const setActiveOrganizationLocationInStore = (
  tenantId: string,
  location: OrganizationLocation
): void => {
  const selected = tenantState.organizations.find((organization) => organization.id === tenantId);

  if (!selected) {
    return;
  }

  const normalizedLocation = normalizeLocation(location);
  const currentLocation = normalizeLocation(selected.location);

  const didLocationChange =
    currentLocation.lat !== normalizedLocation.lat ||
    currentLocation.lng !== normalizedLocation.lng ||
    currentLocation.addressString !== normalizedLocation.addressString;

  if (!didLocationChange) {
    return;
  }

  tenantState = {
    ...tenantState,
    organizations: tenantState.organizations.map((organization) => {
      if (organization.id !== tenantId) {
        return organization;
      }

      return {
        ...organization,
        location: normalizedLocation
      };
    })
  };

  emitChange();
};

interface UseTenantState {
  organizations: Organization[];
  activeTenantId: string;
  activeOrganization: Organization;
  setActiveTenantId: (tenantId: string) => void;
  setActiveOrganizationLocation: (location: OrganizationLocation) => void;
}

export const useTenant = (): UseTenantState => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setActiveTenantId = useCallback((tenantId: string): void => {
    setActiveTenantInStore(tenantId);
  }, []);

  const setActiveOrganizationLocation = useCallback(
    (location: OrganizationLocation): void => {
      setActiveOrganizationLocationInStore(snapshot.activeTenantId, location);
    },
    [snapshot.activeTenantId]
  );

  const activeOrganization = useMemo(() => {
    const fallbackOrganization = snapshot.organizations[0] ?? initialOrganizations[0];

    return (
      snapshot.organizations.find((organization) => organization.id === snapshot.activeTenantId) ??
      fallbackOrganization
    );
  }, [snapshot.activeTenantId, snapshot.organizations]);

  return {
    organizations: snapshot.organizations,
    activeTenantId: snapshot.activeTenantId,
    activeOrganization,
    setActiveTenantId,
    setActiveOrganizationLocation
  };
};
