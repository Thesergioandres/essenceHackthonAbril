import {
  UrgentNeed,
  UrgentNeedPriority,
  UrgentNeedStatus
} from "@/domain/models/UrgentNeed";
import { HttpError, httpClient } from "./httpClient";

interface UrgentNeedApiEntity {
  id?: string;
  _id?: string;
  tenantId?: string;
  title?: string;
  name?: string;
  details?: string;
  description?: string;
  quantityNeededKg?: number;
  quantityKg?: number;
  neededBefore?: string;
  requiredBefore?: string;
  priority?: string;
  status?: string;
  linkedDonationId?: string;
  donationId?: string;
  createdByUserId?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface CreateUrgentNeedPayload {
  title: string;
  details: string;
  quantityNeededKg: number;
  neededBefore: string;
  priority: UrgentNeedPriority;
  description?: string;
  linkedDonationId?: string;
}

interface CreateUrgentNeedRequestPayload extends CreateUrgentNeedPayload {
  description: string;
}

const URGENT_NEED_ENDPOINTS = ["/urgent-needs", "/urgencies"] as const;

const normalizePriority = (priority: unknown): UrgentNeedPriority => {
  if (priority === "LOW") {
    return "low";
  }

  if (priority === "MEDIUM") {
    return "medium";
  }

  if (priority === "HIGH") {
    return "high";
  }

  if (priority === "CRITICAL") {
    return "critical";
  }

  if (priority === "low" || priority === "medium" || priority === "high" || priority === "critical") {
    return priority;
  }

  return "medium";
};

const normalizeStatus = (status: unknown): UrgentNeedStatus => {
  if (status === "open" || status === "matched" || status === "closed") {
    return status;
  }

  return "open";
};

const mapUrgentNeed = (entity: UrgentNeedApiEntity): UrgentNeed => {
  return {
    id: entity.id ?? entity._id ?? "",
    tenantId: entity.tenantId ?? "",
    title: entity.title ?? entity.name ?? "Necesidad urgente",
    details: entity.details ?? entity.description ?? "",
    quantityNeededKg: entity.quantityNeededKg ?? entity.quantityKg ?? 0,
    neededBefore: entity.neededBefore ?? entity.requiredBefore ?? new Date().toISOString(),
    priority: normalizePriority(entity.priority),
    status: normalizeStatus(entity.status),
    linkedDonationId: entity.linkedDonationId ?? entity.donationId,
    createdByUserId: entity.createdByUserId ?? entity.createdBy,
    createdAt: entity.createdAt ?? new Date().toISOString()
  };
};

const shouldTryFallback = (error: unknown): boolean => {
  return error instanceof HttpError && error.status === 404;
};

export const getUrgentNeeds = async (tenantId?: string): Promise<UrgentNeed[]> => {
  let lastError: unknown;

  for (const path of URGENT_NEED_ENDPOINTS) {
    try {
      const response = await httpClient.get<UrgentNeedApiEntity[]>(path, { tenantId });
      return response.map((item) => mapUrgentNeed(item));
    } catch (error: unknown) {
      lastError = error;

      if (!shouldTryFallback(error)) {
        throw error;
      }
    }
  }

  throw lastError;
};

export const createUrgentNeed = async (
  payload: CreateUrgentNeedPayload,
  tenantId?: string
): Promise<UrgentNeed> => {
  let lastError: unknown;
  const normalizedDescription =
    typeof payload.description === "string" && payload.description.trim().length > 0
      ? payload.description.trim()
      : [payload.title.trim(), payload.details.trim()]
          .filter((part) => part.length > 0)
          .join(" - ");

  const requestPayload: CreateUrgentNeedRequestPayload = {
    ...payload,
    description: normalizedDescription
  };

  for (const path of URGENT_NEED_ENDPOINTS) {
    try {
      const response = await httpClient.post<
        UrgentNeedApiEntity,
        CreateUrgentNeedRequestPayload
      >(
        path,
        requestPayload,
        { tenantId }
      );

      return mapUrgentNeed(response);
    } catch (error: unknown) {
      lastError = error;

      if (!shouldTryFallback(error)) {
        throw error;
      }
    }
  }

  throw lastError;
};