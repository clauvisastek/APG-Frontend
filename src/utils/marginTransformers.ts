import type { MarginSimulationResponse } from '../types/margin';

/**
 * Structure de données pour SimulationResultsSection
 */
export interface SimulationTarget {
  hourlyCost: number;
  hourlyCostFormatted: string;
  targetRateBeforeDiscount: number;
  targetRateBeforeDiscountFormatted: string;
  targetRateAfterDiscount: number;
  targetRateAfterDiscountFormatted: string;
  targetMarginPercent: number;
  minMarginPercent: number;
  discountPercent: number;
  forcedVacationDays: number;
  globals: {
    employerRate: number;
    indirectCostsFormatted: string;
    billableHours: number;
  };
  isWithinObjective: boolean;
}

export interface SimulationProposal {
  rate: number;
  rateFormatted: string;
  marginPercent: number;
  marginPerHour: number;
  marginPerHourFormatted: string;
  diffVsTarget: number;
  discountDeltaPercent: number;
  premiumVsTargetPerHour: number;
  premiumVsTargetPerHourFormatted: string;
}

export interface SimulationResult {
  target: SimulationTarget;
  proposal: SimulationProposal;
}

/**
 * Formate un nombre en euros avec 2 décimales
 */
function formatEuros(value: number): string {
  return `${value.toFixed(2)} €`;
}

/**
 * Transforme la réponse de l'API backend vers le format attendu par SimulationResultsSection
 */
export function transformMarginResponse(
  response: MarginSimulationResponse
): SimulationResult {
  const { targetResults, proposedResults } = response;

  // Calculs dérivés pour les données manquantes dans l'API actuelle
  const targetRateBeforeDiscount = targetResults.configuredDiscountPercent 
    ? targetResults.effectiveTargetBillRate / (1 - targetResults.configuredDiscountPercent / 100)
    : targetResults.effectiveTargetBillRate;

  const diffVsTarget = proposedResults.marginPercent - targetResults.theoreticalMarginPercent;
  
  const premiumVsTargetPerHour = proposedResults.proposedBillRate - targetResults.effectiveTargetBillRate;

  return {
    target: {
      hourlyCost: targetResults.costPerHour,
      hourlyCostFormatted: formatEuros(targetResults.costPerHour),
      targetRateBeforeDiscount: targetRateBeforeDiscount,
      targetRateBeforeDiscountFormatted: formatEuros(targetRateBeforeDiscount),
      targetRateAfterDiscount: targetResults.effectiveTargetBillRate,
      targetRateAfterDiscountFormatted: formatEuros(targetResults.effectiveTargetBillRate),
      targetMarginPercent: targetResults.theoreticalMarginPercent,
      minMarginPercent: targetResults.configuredMinMarginPercent,
      discountPercent: targetResults.configuredDiscountPercent ?? 0,
      forcedVacationDays: targetResults.forcedVacationDaysPerYear,
      globals: {
        employerRate: 0, // Pas disponible dans l'API actuelle
        indirectCostsFormatted: '0 €', // Pas disponible dans l'API actuelle
        billableHours: 0, // Pas disponible dans l'API actuelle
      },
      isWithinObjective: targetResults.status === 'OK',
    },
    proposal: {
      rate: proposedResults.proposedBillRate,
      rateFormatted: formatEuros(proposedResults.proposedBillRate),
      marginPercent: proposedResults.marginPercent,
      marginPerHour: proposedResults.marginPerHour,
      marginPerHourFormatted: formatEuros(proposedResults.marginPerHour),
      diffVsTarget: diffVsTarget,
      discountDeltaPercent: proposedResults.discountPercentApplied ?? 0,
      premiumVsTargetPerHour: premiumVsTargetPerHour,
      premiumVsTargetPerHourFormatted: formatEuros(premiumVsTargetPerHour),
    },
  };
}
