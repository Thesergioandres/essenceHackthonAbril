"use client";

import { useCallback, useEffect, useState } from "react";
import { Donation } from "@/domain/models/Donation";
import { getTenantDonations } from "@/infrastructure/network/donationApi";

interface UseDonationsState {
  donations: Donation[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refresh: () => Promise<void>;
}

export const useDonations = (tenantId: string): UseDonationsState => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const result = await getTenantDonations(tenantId);
      setDonations(result);
    } catch (requestError: unknown) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to fetch donations list";

      setIsError(true);
      setErrorMessage(message);
      setDonations([]);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    donations,
    isLoading,
    isError,
    errorMessage,
    refresh
  };
};