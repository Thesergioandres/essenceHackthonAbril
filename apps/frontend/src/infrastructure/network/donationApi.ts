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
}

export interface CreateDonationPayload {
  title: string;
  quantity: number;
  status: DonationStatus;
  expirationDate: string;
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
    expirationDate: entity.expirationDate ?? entity.expiresAt ?? new Date().toISOString()
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
