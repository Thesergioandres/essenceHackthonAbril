import { Donation, DonationStatus } from "@/domain/models/Donation";
import { HttpError, httpClient } from "./httpClient";

interface DonationApiEntity {
  id: string;
  tenantId: string;
  donorId?: string;
  title?: string;
  foodType?: string;
  quantity?: number;
  quantityKg?: number;
  status?: string;
  expirationDate?: string;
  expiresAt?: string;
  requestedByTenantId?: string;
  assignedVolunteerId?: string;
  assignedAt?: string;
  reassignmentCount?: number;
  urgentNeedId?: string;
  donorPhoto?: string;
  pickupPhoto?: string;
  deliveryPhoto?: string;
}

export interface CreateDonationPayload {
  donorId: string;
  title: string;
  quantity: number;
  status?: DonationStatus;
  expirationDate: string;
  donorPhoto?: string;
  urgentNeedId?: string;
}

interface UpdateDonationStatusPayload {
  status: string;
  photo?: string;
  photoBase64?: string;
  assignedVolunteerId?: string;
}

export interface UpdateDonationStatusInput {
  status: DonationStatus;
  photoBase64?: string;
  assignedVolunteerId?: string;
}

const normalizeStatus = (status: unknown): DonationStatus => {
  if (
    status === "available" ||
    status === "requested" ||
    status === "picked_up" ||
    status === "delivered"
  ) {
    return status;
  }

  if (status === "pending") {
    return "available";
  }

  if (status === "in_transit") {
    return "picked_up";
  }

  return "available";
};

const toLegacyStatus = (status: DonationStatus): string => {
  if (status === "available") {
    return "pending";
  }

  if (status === "requested") {
    return "pending";
  }

  if (status === "picked_up") {
    return "in_transit";
  }

  return status;
};

const mapDonation = (entity: DonationApiEntity): Donation => {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    donorId: entity.donorId,
    title: entity.title ?? entity.foodType ?? "Untitled donation",
    quantity: entity.quantity ?? entity.quantityKg ?? 0,
    status: normalizeStatus(entity.status),
    expirationDate: entity.expirationDate ?? entity.expiresAt ?? new Date().toISOString(),
    requestedByTenantId: entity.requestedByTenantId,
    assignedVolunteerId: entity.assignedVolunteerId,
    assignedAt: entity.assignedAt,
    reassignmentCount: entity.reassignmentCount,
    urgentNeedId: entity.urgentNeedId,
    donorPhoto: entity.donorPhoto,
    pickupPhoto: entity.pickupPhoto,
    deliveryPhoto: entity.deliveryPhoto
  };
};

export const getTenantDonations = async (tenantId?: string): Promise<Donation[]> => {
  const response = await httpClient.get<DonationApiEntity[]>("/donations", { tenantId });
  return response.map((item) => mapDonation(item));
};

export const createDonation = async (
  payload: CreateDonationPayload,
  tenantId?: string
): Promise<Donation> => {
  const requestPayload: CreateDonationPayload = {
    ...payload,
    status: payload.status ?? "available"
  };

  const response = await httpClient.post<DonationApiEntity, CreateDonationPayload>(
    "/donations",
    requestPayload,
    { tenantId }
  );

  return mapDonation(response);
};

export const updateDonationStatus = async (
  id: string,
  tenantId: string,
  input: UpdateDonationStatusInput
): Promise<Donation> => {
  const payload: UpdateDonationStatusPayload = {
    status: input.status,
    ...(input.photoBase64
      ? {
          photo: input.photoBase64,
          photoBase64: input.photoBase64
        }
      : {}),
    ...(input.assignedVolunteerId
      ? { assignedVolunteerId: input.assignedVolunteerId }
      : {})
  };

  try {
    const response = await httpClient.patch<DonationApiEntity, UpdateDonationStatusPayload>(
      `/donations/${id}/status`,
      payload,
      { tenantId }
    );

    return mapDonation(response);
  } catch (error: unknown) {
    const fallbackStatus = toLegacyStatus(input.status);
    const shouldRetryWithLegacyStatus =
      error instanceof HttpError &&
      error.status >= 400 &&
      error.status < 500 &&
      fallbackStatus !== input.status;

    if (!shouldRetryWithLegacyStatus) {
      throw error;
    }

    const fallbackResponse = await httpClient.patch<DonationApiEntity, UpdateDonationStatusPayload>(
      `/donations/${id}/status`,
      {
        ...payload,
        status: fallbackStatus
      },
      { tenantId }
    );

    return mapDonation(fallbackResponse);
  }
};
