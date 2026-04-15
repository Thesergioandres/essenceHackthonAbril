export interface ImpactAssumptions {
  wasteAvoidanceRate: number;
  co2KgPerFoodKg: number;
  foodKgPerMeal: number;
}

export interface ImpactStats {
  rescuedFoodKg: number;
  co2AvoidedKg: number;
  mealEquivalents: number;
  deliveredDonationsCount: number;
  assumptions: ImpactAssumptions;
}
