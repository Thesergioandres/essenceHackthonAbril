"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Organization } from "@/domain/models/Organization";

const organizations: Organization[] = [
  { id: "tenant-demo", name: "Central Kitchen - Downtown", isActive: true },
  { id: "tenant-north", name: "North Rescue Hub", isActive: true },
  { id: "tenant-paused", name: "Sunset Community Pantry", isActive: false }
];

interface TenantState {
  activeTenantId: string;
}

let tenantState: TenantState = {
  activeTenantId: organizations[0].id
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

  tenantState = { activeTenantId: selected.id };
  emitChange();
};

interface UseTenantState {
  organizations: Organization[];
  activeTenantId: string;
  setActiveTenantId: (tenantId: string) => void;
}

export const useTenant = (): UseTenantState => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setActiveTenantId = useCallback((tenantId: string): void => {
    setActiveTenantInStore(tenantId);
  }, []);

  return {
    organizations,
    activeTenantId: snapshot.activeTenantId,
    setActiveTenantId
  };
};
