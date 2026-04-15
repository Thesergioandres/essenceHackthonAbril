import { Donation, DonationStatus } from "@/domain/models/Donation";
import { httpGet } from "./httpClient";

interface BackendDonation {
  id: string;
  tenantId: string;
  donorName?: string;
  originName?: string;
  foodType?: string;
  title?: string;
  quantityKg?: number;
  quantity?: number;
  status?: DonationStatus;
  expiresAt?: string;
  expirationDate?: string;
}

const normalizeStatus = (status: unknown, index: number): DonationStatus => {
  if (status === "pending" || status === "in_transit" || status === "delivered") {
    return status;
  }

  const fallbackOrder: DonationStatus[] = ["pending", "in_transit", "delivered"];
  return fallbackOrder[index % fallbackOrder.length];
};

const normalizeDonation = (item: BackendDonation, index: number): Donation => {
  const title = item.title ?? item.foodType ?? "Untitled donation";
  const quantity = item.quantity ?? item.quantityKg ?? 0;
  const expirationDate = item.expirationDate ?? item.expiresAt ?? new Date().toISOString();
  const originName = item.originName ?? item.donorName ?? "Unknown source";

  return {
    id: item.id,
    tenantId: item.tenantId,
    title,
    quantity,
    status: normalizeStatus(item.status, index),
    expirationDate,
    originName
  };
};

export const getTenantDonations = async (tenantId: string): Promise<Donation[]> => {
  const payload = await httpGet<BackendDonation[]>("/api/donations", tenantId);
  return payload.map((item, index) => normalizeDonation(item, index));
};

export const getPendingDonations = async (tenantId: string): Promise<Donation[]> => {
  const donations = await getTenantDonations(tenantId);
  return donations.filter((donation) => donation.status === "pending");
};
