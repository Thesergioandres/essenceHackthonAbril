import { Donation, DonationStatus } from "@/domain/models/Donation";
import { httpClient } from "./httpClient";

interface DonationApiEntity {
  id: string;
  tenantId: string;
  title?: string;
  foodType?: string;
  quantity?: number;
  quantityKg?: number;
  status?: string;
  expirationDate?: string;
  expiresAt?: string;
  donorPhoto?: string;
  pickupPhoto?: string;
  deliveryPhoto?: string;
}

export interface CreateDonationPayload {
  title: string;
  quantity: number;
  status: DonationStatus;
  expirationDate: string;
  donorPhoto?: string;
}

interface UpdateDonationStatusPayload {
  status: DonationStatus;
  photoBase64: string;
}

const normalizeStatus = (status: unknown): DonationStatus => {
  if (status === "pending" || status === "in_transit" || status === "delivered") {
    return status;
  }

  return "pending";
};

const mapDonation = (entity: DonationApiEntity): Donation => {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    title: entity.title ?? entity.foodType ?? "Untitled donation",
    quantity: entity.quantity ?? entity.quantityKg ?? 0,
    status: normalizeStatus(entity.status),
    expirationDate: entity.expirationDate ?? entity.expiresAt ?? new Date().toISOString(),
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
  const response = await httpClient.post<DonationApiEntity, CreateDonationPayload>(
    "/donations",
    payload,
    { tenantId }
  );

  return mapDonation(response);
};

export const updateDonationStatus = async (
  id: string,
  tenantId: string,
  status: DonationStatus,
  photoBase64: string
): Promise<Donation> => {
  const response = await httpClient.patch<DonationApiEntity, UpdateDonationStatusPayload>(
    `/donations/${id}/status`,
    {
      status,
      photoBase64
    },
    { tenantId }
  );

  return mapDonation(response);
};
