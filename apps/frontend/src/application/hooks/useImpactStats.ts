"use client";

import { useCallback, useEffect, useState } from "react";
import { ImpactStats } from "@/domain/models/ImpactStats";
import { getImpactStats } from "@/infrastructure/network/impactApi";

const EMPTY_IMPACT_STATS: ImpactStats = {
  rescuedFoodKg: 0,
  co2AvoidedKg: 0,
  mealEquivalents: 0,
  deliveredDonationsCount: 0,
  assumptions: {
    wasteAvoidanceRate: 1,
    co2KgPerFoodKg: 2.5,
    foodKgPerMeal: 0.5
  }
};

interface UseImpactStatsState {
  stats: ImpactStats;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useImpactStats = (tenantId: string): UseImpactStatsState => {
  const [stats, setStats] = useState<ImpactStats>(EMPTY_IMPACT_STATS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const nextStats = await getImpactStats(tenantId);
      setStats(nextStats);
    } catch (requestError: unknown) {
      const message =
        requestError instanceof Error ? requestError.message : "Unable to fetch impact stats";

      setIsError(true);
      setError(message);
      setStats(EMPTY_IMPACT_STATS);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    stats,
    isLoading,
    isError,
    error,
    refetch
  };
};
