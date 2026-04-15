"use client";

import { useCallback, useEffect, useState } from "react";
import { SystemHealth } from "@/domain/models/SystemHealth";
import { fetchBackendHealth } from "@/infrastructure/network/healthApi";

interface UseBackendHealthState {
  data: SystemHealth | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useBackendHealth = (): UseBackendHealthState => {
  const [data, setData] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchBackendHealth();
      setData(result);
    } catch (requestError: unknown) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to reach backend health endpoint.";

      setError(message);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    isLoading,
    error,
    refresh
  };
};