"use client";

import { useCallback, useEffect, useState } from "react";
import { Donation } from "@/domain/models/Donation";
import {
  createDonation,
  CreateDonationPayload,
  getTenantDonations
} from "@/infrastructure/network/donationApi";

interface UseDonationsState {
  data: Donation[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (payload: CreateDonationPayload) => Promise<Donation | null>;
}

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

  useEffect(() => {
    void refetch();
  }, [tenantId, refetch]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    create
  };
};