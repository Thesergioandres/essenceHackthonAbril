"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { Organization, OrganizationLocation } from "@/domain/models/Organization";
import { User, UserType } from "@/domain/models/User";
import {
  clearRuntimeSession,
  setTenantIdInRuntime,
  setUserContextInRuntime
} from "@/infrastructure/network/httpClient";

const TENANT_SESSION_STORAGE_KEY = "rura.tenantSession";
const ALLOWED_USER_TYPES: UserType[] = ["foundation", "volunteer", "donor", "admin"];

interface PersistedTenantSession {
  activeTenantId: string;
  activeUserId: string;
  activeUserType: UserType;
  organizations: Organization[];
  users: User[];
}

interface TenantState extends PersistedTenantSession {
  hasSession: boolean;
}

interface BootstrapTenantSessionInput {
  organization: Organization;
  user: User;
}

const EMPTY_ORGANIZATION: Organization = {
  id: "",
  name: "Sin organizacion",
  location: {
    lat: 0,
    lng: 0
  },
  createdAt: new Date(0).toISOString()
};

const EMPTY_USER: User = {
  id: "",
  tenantIds: [],
  name: "Sin usuario",
  email: "",
  type: "foundation"
};

const isBrowser = (): boolean => typeof window !== "undefined";

const isUserType = (value: unknown): value is UserType => {
  return ALLOWED_USER_TYPES.includes(value as UserType);
};

const normalizeLocation = (location: OrganizationLocation): OrganizationLocation => {
  const normalized: OrganizationLocation = {
    lat: Number.isFinite(location.lat) ? location.lat : 0,
    lng: Number.isFinite(location.lng) ? location.lng : 0
  };

  if (typeof location.addressString === "string") {
    const trimmedAddress = location.addressString.trim();

    if (trimmedAddress.length > 0) {
      normalized.addressString = trimmedAddress;
    }
  }

  return normalized;
};

const normalizeOrganization = (organization: Organization): Organization => {
  return {
    id: organization.id.trim(),
    name: organization.name.trim(),
    location: normalizeLocation(organization.location),
    createdAt: organization.createdAt
  };
};

const normalizeUser = (user: User): User => {
  const normalizedType = isUserType(user.type) ? user.type : "foundation";
  const normalizedTenantIds = user.tenantIds
    .map((tenantId) => tenantId.trim())
    .filter((tenantId, index, allTenantIds) => {
      return tenantId.length > 0 && allTenantIds.indexOf(tenantId) === index;
    });

  return {
    id: user.id.trim(),
    tenantIds: normalizedTenantIds,
    name: user.name.trim(),
    email: user.email.trim().toLowerCase(),
    type: normalizedType
  };
};

const createEmptyTenantState = (): TenantState => {
  return {
    hasSession: false,
    activeTenantId: "",
    activeUserId: "",
    activeUserType: "foundation",
    organizations: [],
    users: []
  };
};

const toPersistedSession = (value: unknown): PersistedTenantSession | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const raw = value as {
    activeTenantId?: unknown;
    activeUserId?: unknown;
    activeUserType?: unknown;
    organizations?: unknown;
    users?: unknown;
  };

  if (!Array.isArray(raw.organizations) || !Array.isArray(raw.users)) {
    return null;
  }

  const organizations = raw.organizations
    .filter((organization): organization is Organization => {
      if (typeof organization !== "object" || organization === null) {
        return false;
      }

      const candidate = organization as Partial<Organization>;

      return (
        typeof candidate.id === "string" &&
        typeof candidate.name === "string" &&
        typeof candidate.createdAt === "string" &&
        typeof candidate.location === "object" &&
        candidate.location !== null &&
        typeof (candidate.location as OrganizationLocation).lat === "number" &&
        typeof (candidate.location as OrganizationLocation).lng === "number"
      );
    })
    .map((organization) => normalizeOrganization(organization))
    .filter((organization) => organization.id.length > 0);

  const users = raw.users
    .filter((user): user is User => {
      if (typeof user !== "object" || user === null) {
        return false;
      }

      const candidate = user as Partial<User>;

      return (
        typeof candidate.id === "string" &&
        Array.isArray(candidate.tenantIds) &&
        typeof candidate.name === "string" &&
        typeof candidate.email === "string" &&
        isUserType(candidate.type)
      );
    })
    .map((user) => normalizeUser(user))
    .filter((user) => user.id.length > 0);

  if (organizations.length === 0 || users.length === 0) {
    return null;
  }

  const rawActiveTenantId =
    typeof raw.activeTenantId === "string" ? raw.activeTenantId.trim() : "";
  const activeTenantId =
    organizations.find((organization) => organization.id === rawActiveTenantId)?.id ??
    organizations[0].id;

  const scopedUsers = users.filter((user) => user.tenantIds.includes(activeTenantId));
  const tenantUsers = scopedUsers.length > 0 ? scopedUsers : users;

  const rawActiveUserId = typeof raw.activeUserId === "string" ? raw.activeUserId.trim() : "";
  const activeUser =
    tenantUsers.find((user) => user.id === rawActiveUserId) ?? tenantUsers[0] ?? users[0];

  if (!activeUser) {
    return null;
  }

  const activeUserType = isUserType(raw.activeUserType)
    ? raw.activeUserType
    : activeUser.type;

  return {
    activeTenantId,
    activeUserId: activeUser.id,
    activeUserType,
    organizations,
    users
  };
};

const readPersistedSession = (): PersistedTenantSession | null => {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(TENANT_SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return toPersistedSession(parsed);
  } catch {
    return null;
  }
};

const persistSession = (state: TenantState): void => {
  if (!isBrowser()) {
    return;
  }

  if (!state.hasSession) {
    window.localStorage.removeItem(TENANT_SESSION_STORAGE_KEY);
    clearRuntimeSession();
    return;
  }

  const session: PersistedTenantSession = {
    activeTenantId: state.activeTenantId,
    activeUserId: state.activeUserId,
    activeUserType: state.activeUserType,
    organizations: state.organizations,
    users: state.users
  };

  window.localStorage.setItem(TENANT_SESSION_STORAGE_KEY, JSON.stringify(session));
  setTenantIdInRuntime(state.activeTenantId);
  setUserContextInRuntime({
    userId: state.activeUserId,
    userType: state.activeUserType
  });
};

const resolveInitialState = (): TenantState => {
  return createEmptyTenantState();
};

const hydrateStore = (): void => {
  if (!isBrowser()) {
    return;
  }

  const persisted = readPersistedSession();
  if (persisted) {
    commitState({
      hasSession: true,
      ...persisted
    });
  }
};

let tenantState: TenantState = resolveInitialState();
let isHydrated = false;

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

const commitState = (nextState: TenantState): void => {
  tenantState = nextState;
  persistSession(nextState);
  emitChange();
};

const setActiveTenantInStore = (tenantId: string): void => {
  if (!tenantState.hasSession) {
    return;
  }

  const normalizedTenantId = tenantId.trim();
  const selectedOrganization = tenantState.organizations.find(
    (organization) => organization.id === normalizedTenantId
  );

  if (!selectedOrganization || selectedOrganization.id === tenantState.activeTenantId) {
    return;
  }

  const scopedUsers = tenantState.users.filter((user) =>
    user.tenantIds.includes(selectedOrganization.id)
  );
  const nextUsers = scopedUsers.length > 0 ? scopedUsers : tenantState.users;
  const nextActiveUser =
    nextUsers.find((user) => user.id === tenantState.activeUserId) ?? nextUsers[0];

  if (!nextActiveUser) {
    return;
  }

  commitState({
    ...tenantState,
    activeTenantId: selectedOrganization.id,
    activeUserId: nextActiveUser.id,
    activeUserType: nextActiveUser.type
  });
};

const setActiveUserInStore = (userId: string): void => {
  if (!tenantState.hasSession) {
    return;
  }

  const normalizedUserId = userId.trim();
  const selectedUser = tenantState.users.find((user) => user.id === normalizedUserId);

  if (!selectedUser || selectedUser.id === tenantState.activeUserId) {
    return;
  }

  commitState({
    ...tenantState,
    activeUserId: selectedUser.id,
    activeUserType: selectedUser.type
  });
};

const setActiveUserTypeInStore = (userType: UserType): void => {
  if (!tenantState.hasSession || !isUserType(userType)) {
    return;
  }

  const selectedUser = tenantState.users.find((user) => user.type === userType);

  if (!selectedUser) {
    commitState({
      ...tenantState,
      activeUserType: userType
    });
    return;
  }

  commitState({
    ...tenantState,
    activeUserId: selectedUser.id,
    activeUserType: userType
  });
};

const setActiveOrganizationLocationInStore = (
  tenantId: string,
  location: OrganizationLocation
): void => {
  if (!tenantState.hasSession) {
    return;
  }

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

  commitState({
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
  });
};

const bootstrapSessionInStore = (input: BootstrapTenantSessionInput): void => {
  const organization = normalizeOrganization(input.organization);
  const user = normalizeUser(input.user);

  if (organization.id.length === 0 || user.id.length === 0) {
    return;
  }

  const userTenantIds = user.tenantIds.includes(organization.id)
    ? user.tenantIds
    : [organization.id, ...user.tenantIds];

  commitState({
    hasSession: true,
    activeTenantId: organization.id,
    activeUserId: user.id,
    activeUserType: user.type,
    organizations: [organization],
    users: [
      {
        ...user,
        tenantIds: userTenantIds
      }
    ]
  });
};

const clearSessionInStore = (): void => {
  commitState(createEmptyTenantState());
};

interface UseTenantState {
  hasSession: boolean;
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
  bootstrapSession: (input: BootstrapTenantSessionInput) => void;
  clearSession: () => void;
  isHydrated: boolean;
}

export const useTenant = (): UseTenantState => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!isHydrated) {
      isHydrated = true;
      hydrateStore();
    }
  }, []);

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

  const bootstrapSession = useCallback((input: BootstrapTenantSessionInput): void => {
    bootstrapSessionInStore(input);
  }, []);

  const clearSession = useCallback((): void => {
    clearSessionInStore();
  }, []);

  const activeOrganization = useMemo(() => {
    return (
      snapshot.organizations.find((organization) => organization.id === snapshot.activeTenantId) ??
      snapshot.organizations[0] ??
      EMPTY_ORGANIZATION
    );
  }, [snapshot.activeTenantId, snapshot.organizations]);

  const activeUser = useMemo(() => {
    const selectedUser =
      snapshot.users.find((user) => user.id === snapshot.activeUserId) ?? snapshot.users[0];

    if (!selectedUser) {
      return EMPTY_USER;
    }

    return {
      ...selectedUser,
      type: snapshot.activeUserType
    };
  }, [snapshot.activeUserId, snapshot.activeUserType, snapshot.users]);

  return {
    hasSession: snapshot.hasSession,
    organizations: snapshot.organizations,
    users: snapshot.users,
    activeTenantId: snapshot.activeTenantId,
    activeUserId: activeUser.id,
    activeUser,
    activeUserType: snapshot.activeUserType,
    activeOrganization,
    setActiveTenantId,
    setActiveUserId,
    setActiveUserType,
    setActiveOrganizationLocation,
    bootstrapSession,
    clearSession,
    isHydrated
  };
};
