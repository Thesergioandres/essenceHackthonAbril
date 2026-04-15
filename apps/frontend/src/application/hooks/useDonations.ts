"use client";

import { useCallback, useEffect, useState } from "react";
import { Donation } from "@/domain/models/Donation";
import { apiGet } from "@/infrastructure/network/httpClient";

interface UseDonationsState {
  donations: Donation[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useDonations = (autoLoad: boolean = false): UseDonationsState => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiGet<Donation[]>("/api/donations");
      setDonations(result);
    } catch (requestError: unknown) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to fetch donations list.";

      setError(message);
      setDonations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      void refresh();
    }
  }, [autoLoad, refresh]);

  return {
    donations,
    isLoading,
    error,
    refresh
  };
};