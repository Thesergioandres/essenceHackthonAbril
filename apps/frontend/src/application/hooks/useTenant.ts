"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { Organization } from "@/domain/models/Organization";
import { getTenantIdFromRuntime, setTenantIdInRuntime } from "@/infrastructure/network/httpClient";

const organizations: Organization[] = [
  {
    id: "tenant-demo",
    name: "Central Kitchen - Downtown",
    address: "14th Avenue 121, Downtown",
    createdAt: "2026-04-01T10:00:00.000Z"
  },
  {
    id: "tenant-north",
    name: "North Rescue Hub",
    address: "North Harbor Street 88",
    createdAt: "2026-04-02T10:00:00.000Z"
  },
  {
    id: "tenant-east",
    name: "East Community Pantry",
    address: "Liberty Road 45",
    createdAt: "2026-04-03T10:00:00.000Z"
  }
];

const DEFAULT_TENANT_ID = organizations[0]?.id ?? "tenant-demo";

const resolveInitialTenantId = (): string => {
  const runtimeTenantId = getTenantIdFromRuntime();
  const selectedTenant = organizations.find((organization) => organization.id === runtimeTenantId);

  const initialTenantId = selectedTenant?.id ?? DEFAULT_TENANT_ID;
  setTenantIdInRuntime(initialTenantId);
  return initialTenantId;
};

interface TenantState {
  activeTenantId: string;
}

let tenantState: TenantState = {
  activeTenantId: resolveInitialTenantId()
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
  const selected = organizations.find((organization) => organization.id === tenantId);

  if (!selected) {
    return;
  }

  if (selected.id === tenantState.activeTenantId) {
    return;
  }

  tenantState = { activeTenantId: selected.id };
  setTenantIdInRuntime(selected.id);
  emitChange();
};

interface UseTenantState {
  organizations: Organization[];
  activeTenantId: string;
  activeOrganization: Organization;
  setActiveTenantId: (tenantId: string) => void;
}

export const useTenant = (): UseTenantState => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setActiveTenantId = useCallback((tenantId: string): void => {
    setActiveTenantInStore(tenantId);
  }, []);

  const activeOrganization = useMemo(() => {
    return (
      organizations.find((organization) => organization.id === snapshot.activeTenantId) ?? organizations[0]
    );
  }, [snapshot.activeTenantId]);

  return {
    organizations,
    activeTenantId: snapshot.activeTenantId,
    activeOrganization,
    setActiveTenantId
  };
};
