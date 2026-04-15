import { ImpactStats } from "@/domain/models/ImpactStats";
import { httpClient } from "@/infrastructure/network/httpClient";

interface ImpactApiEntity {
  rescuedFoodKg?: number;
  co2AvoidedKg?: number;
  mealEquivalents?: number;
  deliveredDonationsCount?: number;
  assumptions?: {
    wasteAvoidanceRate?: number;
    co2KgPerFoodKg?: number;
    foodKgPerMeal?: number;
  };
}

const mapImpactStats = (entity: ImpactApiEntity): ImpactStats => {
  return {
    rescuedFoodKg: entity.rescuedFoodKg ?? 0,
    co2AvoidedKg: entity.co2AvoidedKg ?? 0,
    mealEquivalents: entity.mealEquivalents ?? 0,
    deliveredDonationsCount: entity.deliveredDonationsCount ?? 0,
    assumptions: {
      wasteAvoidanceRate: entity.assumptions?.wasteAvoidanceRate ?? 1,
      co2KgPerFoodKg: entity.assumptions?.co2KgPerFoodKg ?? 2.5,
      foodKgPerMeal: entity.assumptions?.foodKgPerMeal ?? 0.5
    }
  };
};

export const getImpactStats = async (tenantId?: string): Promise<ImpactStats> => {
  const response = await httpClient.get<ImpactApiEntity>("/impact/stats", { tenantId });
  return mapImpactStats(response);
};
