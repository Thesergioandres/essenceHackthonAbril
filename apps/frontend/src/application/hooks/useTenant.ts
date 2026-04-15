"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { Organization, OrganizationLocation } from "@/domain/models/Organization";
import { User, UserType } from "@/domain/models/User";
import {
  getTenantIdFromRuntime,
  getUserContextFromRuntime,
  setTenantIdInRuntime,
  setUserContextInRuntime
} from "@/infrastructure/network/httpClient";

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

const initialUsers = [
  {
    id: "user-foundation-01",
    tenantIds: ["tenant-demo", "tenant-north", "tenant-east"],
    name: "Laura Fundacion",
    email: "laura@rura.org",
    type: "foundation"
  },
  {
    id: "user-volunteer-01",
    tenantIds: ["tenant-demo", "tenant-north", "tenant-east"],
    name: "Carlos Voluntario",
    email: "carlos@rura.org",
    type: "volunteer"
  }
] satisfies [User, ...User[]];

const DEFAULT_USER_ID = initialUsers[0].id;

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

const resolveInitialUserId = (users: readonly User[]): string => {
  const runtimeUserContext = getUserContextFromRuntime();

  const selectedById =
    typeof runtimeUserContext.userId === "string"
      ? users.find((user) => user.id === runtimeUserContext.userId)
      : undefined;

  const selectedByType =
    typeof runtimeUserContext.userType === "string"
      ? users.find((user) => user.type === runtimeUserContext.userType)
      : undefined;

  const selectedUser = selectedById ?? selectedByType ?? users[0];

  setUserContextInRuntime({
    userId: selectedUser?.id,
    userType: selectedUser?.type
  });

  return selectedUser?.id ?? DEFAULT_USER_ID;
};

interface TenantState {
  activeTenantId: string;
  activeUserId: string;
  organizations: Organization[];
  users: User[];
}

let tenantState: TenantState = {
  activeTenantId: resolveInitialTenantId(initialOrganizations),
  activeUserId: resolveInitialUserId(initialUsers),
  organizations: [...initialOrganizations],
  users: [...initialUsers]
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

const setActiveUserInStore = (userId: string): void => {
  const selectedUser = tenantState.users.find((user) => user.id === userId);

  if (!selectedUser) {
    return;
  }

  if (selectedUser.id === tenantState.activeUserId) {
    return;
  }

  tenantState = {
    ...tenantState,
    activeUserId: selectedUser.id
  };

  setUserContextInRuntime({
    userId: selectedUser.id,
    userType: selectedUser.type
  });

  emitChange();
};

const setActiveUserTypeInStore = (userType: UserType): void => {
  const selectedUser = tenantState.users.find((user) => user.type === userType);

  if (!selectedUser) {
    return;
  }

  setActiveUserInStore(selectedUser.id);
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
  users: User[];
  activeTenantId: string;
  activeUserId: string;
  activeUser: User;
  activeUserType: UserType;
  activeOrganization: Organization;
  setActiveTenantId: (tenantId: string) => void;
  setActiveUserId: (userId: string) => void;
  setActiveUserType: (userType: UserType) => void;
  setActiveOrganizationLocation: (location: OrganizationLocation) => void;
}

export const useTenant = (): UseTenantState => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setActiveTenantId = useCallback((tenantId: string): void => {
    setActiveTenantInStore(tenantId);
  }, []);

  const setActiveUserId = useCallback((userId: string): void => {
    setActiveUserInStore(userId);
  }, []);

  const setActiveUserType = useCallback((userType: UserType): void => {
    setActiveUserTypeInStore(userType);
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

  const activeUser = useMemo(() => {
    const fallbackUser = snapshot.users[0] ?? initialUsers[0];

    return snapshot.users.find((user) => user.id === snapshot.activeUserId) ?? fallbackUser;
  }, [snapshot.activeUserId, snapshot.users]);

  return {
    organizations: snapshot.organizations,
    users: snapshot.users,
    activeTenantId: snapshot.activeTenantId,
    activeUserId: activeUser.id,
    activeUser,
    activeUserType: activeUser.type,
    activeOrganization,
    setActiveTenantId,
    setActiveUserId,
    setActiveUserType,
    setActiveOrganizationLocation
  };
};
