"use client";

import { useCallback, useEffect, useState } from "react";
import { Donation, DonationStatus } from "@/domain/models/Donation";
import {
  createDonation,
  CreateDonationPayload,
  getTenantDonations,
  UpdateDonationStatusInput,
  updateDonationStatus as updateDonationStatusRequest
} from "@/infrastructure/network/donationApi";

interface UpdateStatusParams extends UpdateDonationStatusInput {
  donationId: string;
}

interface UseDonationsState {
  data: Donation[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (payload: CreateDonationPayload) => Promise<Donation | null>;
  updateStatus: (params: UpdateStatusParams) => Promise<Donation | null>;
}

const ALLOWED_TRANSITIONS: Record<DonationStatus, DonationStatus[]> = {
  available: ["requested"],
  requested: ["picked_up"],
  picked_up: ["delivered"],
  delivered: []
};

const getPhotoPatchByStatus = (
  status: DonationStatus,
  photoBase64?: string
): Partial<Pick<Donation, "pickupPhoto" | "deliveryPhoto">> => {
  if (status === "picked_up" && photoBase64) {
    return { pickupPhoto: photoBase64 };
  }

  if (status === "delivered" && photoBase64) {
    return { deliveryPhoto: photoBase64 };
  }

  return {};
};

const canTransition = (from: DonationStatus, to: DonationStatus): boolean => {
  return ALLOWED_TRANSITIONS[from].includes(to);
};

export const useDonations = (tenantId: string): UseDonationsState => {
  const [data, setData] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const donations = await getTenantDonations(tenantId);
      setData(donations);
    } catch (requestError: unknown) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to fetch tenant donations";

      setIsError(true);
      setError(message);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  const create = useCallback(
    async (payload: CreateDonationPayload): Promise<Donation | null> => {
      try {
        const created = await createDonation(payload, tenantId);
        setData((currentData) => [created, ...currentData]);
        return created;
      } catch (requestError: unknown) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unable to create donation";

        setIsError(true);
        setError(message);
        return null;
      }
    },
    [tenantId]
  );

  const updateStatus = useCallback(
    async (params: UpdateStatusParams): Promise<Donation | null> => {
      const currentDonation = data.find((donation) => donation.id === params.donationId);

      if (!currentDonation) {
        return null;
      }

      if (!canTransition(currentDonation.status, params.status)) {
        setIsError(true);
        setError(
          `Transition ${currentDonation.status} -> ${params.status} is not allowed`
        );
        return null;
      }

      setIsError(false);
      setError(null);

      const optimisticDonation: Donation = {
        ...currentDonation,
        status: params.status,
        ...(params.assignedVolunteerId
          ? { assignedVolunteerId: params.assignedVolunteerId }
          : {}),
        ...getPhotoPatchByStatus(params.status, params.photoBase64)
      };

      setData((currentData) =>
        currentData.map((donation) =>
          donation.id === params.donationId ? optimisticDonation : donation
        )
      );

      try {
        const updated = await updateDonationStatusRequest(
          params.donationId,
          tenantId,
          {
            status: params.status,
            photoBase64: params.photoBase64,
            assignedVolunteerId: params.assignedVolunteerId
          }
        );

        setData((currentData) =>
          currentData.map((donation) =>
            donation.id === params.donationId ? updated : donation
          )
        );

        return updated;
      } catch (requestError: unknown) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unable to update donation status";

        setData((currentData) =>
          currentData.map((donation) =>
            donation.id === params.donationId ? currentDonation : donation
          )
        );
        setIsError(true);
        setError(message);
        return null;
      }
    },
    [data, tenantId]
  );

  useEffect(() => {
    void refetch();
  }, [tenantId, refetch]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    create,
    updateStatus
  };
};