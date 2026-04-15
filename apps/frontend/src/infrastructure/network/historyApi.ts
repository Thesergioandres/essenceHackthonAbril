import { ReceiptLog } from "@/domain/models/ReceiptLog";
import { HttpError, httpClient } from "./httpClient";

interface ReceiptLogApiEntity {
  id?: string;
  _id?: string;
  tenantId?: string;
  donationId?: string;
  donationTitle?: string;
  title?: string;
  quantityKg?: number;
  quantity?: number;
  deliveredAt?: string;
  receivedAt?: string;
  receivedBy?: string;
  receiverName?: string;
  pickupPhoto?: string;
  deliveryPhoto?: string;
}

const HISTORY_ENDPOINTS = ["/history", "/history/receipts", "/receipts/history", "/receipts"] as const;

const mapReceiptLog = (entity: ReceiptLogApiEntity): ReceiptLog => {
  return {
    id: entity.id ?? entity._id ?? "",
    tenantId: entity.tenantId ?? "",
    donationId: entity.donationId ?? "",
    donationTitle: entity.donationTitle ?? entity.title ?? "Donacion",
    quantityKg: entity.quantityKg ?? entity.quantity ?? 0,
    deliveredAt: entity.deliveredAt ?? entity.receivedAt ?? new Date().toISOString(),
    receivedBy: entity.receivedBy ?? entity.receiverName ?? "Sin asignar",
    pickupPhoto: entity.pickupPhoto,
    deliveryPhoto: entity.deliveryPhoto
  };
};

const shouldTryFallback = (error: unknown): boolean => {
  return error instanceof HttpError && error.status === 404;
};

export const getReceiptHistory = async (tenantId?: string): Promise<ReceiptLog[]> => {
  let lastError: unknown;

  for (const path of HISTORY_ENDPOINTS) {
    try {
      const response = await httpClient.get<ReceiptLogApiEntity[]>(path, { tenantId });
      return response.map((item) => mapReceiptLog(item));
    } catch (error: unknown) {
      lastError = error;

      if (!shouldTryFallback(error)) {
        throw error;
      }
    }
  }

  throw lastError;
};