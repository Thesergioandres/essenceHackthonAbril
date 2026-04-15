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

  const response = await httpClient.patch<DonationApiEntity, UpdateDonationStatusPayload>(
    `/donations/${id}/status`,
    payload,
    { tenantId }
  );

  return mapDonation(response);
};
