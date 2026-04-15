"use client";

import { useCallback, useEffect, useState } from "react";
import { Donation, DonationStatus } from "@/domain/models/Donation";
import {
  createDonation,
  CreateDonationPayload,
  getTenantDonations,
  updateDonationStatus as updateDonationStatusRequest
} from "@/infrastructure/network/donationApi";

interface UseDonationsState {
  data: Donation[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (payload: CreateDonationPayload) => Promise<Donation | null>;
  updateStatus: (
    donationId: string,
    status: DonationStatus,
    photoBase64: string
  ) => Promise<Donation | null>;
}

const getPhotoPatchByStatus = (
  status: DonationStatus,
  photoBase64: string
): Partial<Pick<Donation, "pickupPhoto" | "deliveryPhoto">> => {
  if (status === "in_transit") {
    return { pickupPhoto: photoBase64 };
  }

  if (status === "delivered") {
    return { deliveryPhoto: photoBase64 };
  }

  return {};
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
    async (
      donationId: string,
      status: DonationStatus,
      photoBase64: string
    ): Promise<Donation | null> => {
      const currentDonation = data.find((donation) => donation.id === donationId);

      if (!currentDonation) {
        return null;
      }

      setIsError(false);
      setError(null);

      const optimisticDonation: Donation = {
        ...currentDonation,
        status,
        ...getPhotoPatchByStatus(status, photoBase64)
      };

      setData((currentData) =>
        currentData.map((donation) =>
          donation.id === donationId ? optimisticDonation : donation
        )
      );

      try {
        const updated = await updateDonationStatusRequest(
          donationId,
          tenantId,
          status,
          photoBase64
        );

        setData((currentData) =>
          currentData.map((donation) => (donation.id === donationId ? updated : donation))
        );

        return updated;
      } catch (requestError: unknown) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unable to update donation status";

        setData((currentData) =>
          currentData.map((donation) =>
            donation.id === donationId ? currentDonation : donation
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