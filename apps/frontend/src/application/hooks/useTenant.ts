"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { Organization } from "@/domain/models/Organization";
import { getTenantIdFromRuntime, setTenantIdInRuntime } from "@/infrastructure/network/httpClient";

const organizations: Organization[] = [
  { id: "tenant-demo", name: "Central Kitchen - Downtown", isActive: true },
  { id: "tenant-north", name: "North Rescue Hub", isActive: true },
  { id: "tenant-paused", name: "Sunset Community Pantry", isActive: false }
];

const DEFAULT_TENANT_ID = organizations.find((organization) => organization.isActive)?.id ?? "tenant-demo";

const resolveInitialTenantId = (): string => {
  const runtimeTenantId = getTenantIdFromRuntime();
  const selectedTenant = organizations.find(
    (organization) => organization.id === runtimeTenantId && organization.isActive
  );

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

  if (!selected || !selected.isActive) {
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
