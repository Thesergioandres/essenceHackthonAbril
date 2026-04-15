export interface ImpactStats {
  rescuedFoodKg: number;
  co2AvoidedKg: number;
  mealEquivalents: number;
  assumptions: {
    wasteAvoidanceRate: number;
    co2KgPerFoodKg: number;
    foodKgPerMeal: number;
  };
}

const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100;
};

export class ImpactCalculatorService {
  private static readonly WASTE_AVOIDANCE_RATE = 1;
  private static readonly CO2_KG_PER_FOOD_KG = 2.5;
  private static readonly FOOD_KG_PER_MEAL = 0.5;

  calculate(rescuedFoodKg: number): ImpactStats {
    const normalizedRescuedFoodKg =
      Number.isFinite(rescuedFoodKg) && rescuedFoodKg > 0 ? rescuedFoodKg : 0;

    const co2AvoidedKg =
      normalizedRescuedFoodKg * ImpactCalculatorService.CO2_KG_PER_FOOD_KG;
    const mealEquivalents =
      normalizedRescuedFoodKg / ImpactCalculatorService.FOOD_KG_PER_MEAL;

    return {
      rescuedFoodKg: roundToTwoDecimals(normalizedRescuedFoodKg),
      co2AvoidedKg: roundToTwoDecimals(co2AvoidedKg),
      mealEquivalents: roundToTwoDecimals(mealEquivalents),
      assumptions: {
        wasteAvoidanceRate: ImpactCalculatorService.WASTE_AVOIDANCE_RATE,
        co2KgPerFoodKg: ImpactCalculatorService.CO2_KG_PER_FOOD_KG,
        foodKgPerMeal: ImpactCalculatorService.FOOD_KG_PER_MEAL
      }
    };
  }
}
