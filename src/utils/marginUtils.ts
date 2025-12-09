import type { JobType, Seniority } from '../types/resource';

export interface ResourceWithMarginData {
  jobType: JobType;
  seniority: Seniority;
  dailyCostRate: number;
  dailySellRate: number;
  days: number;
}

export interface MarginByDimension {
  label: string;
  marginAmount: number;
  percentage: number;
}

/**
 * Calcule la marge par métier à partir d'une liste de ressources
 * et ajuste les pourcentages pour totaliser 100%
 */
export function calculateMarginByJobType(resources: ResourceWithMarginData[]): MarginByDimension[] {
  // Grouper par métier et calculer la marge pour chaque groupe
  const marginByJob = new Map<JobType, number>();
  
  resources.forEach(resource => {
    const margin = (resource.dailySellRate - resource.dailyCostRate) * resource.days;
    const currentMargin = marginByJob.get(resource.jobType) || 0;
    marginByJob.set(resource.jobType, currentMargin + margin);
  });
  
  return calculatePercentagesWithAdjustment(marginByJob);
}

/**
 * Calcule la marge par séniorité à partir d'une liste de ressources
 * et ajuste les pourcentages pour totaliser 100%
 */
export function calculateMarginBySeniority(resources: ResourceWithMarginData[]): MarginByDimension[] {
  // Grouper par séniorité et calculer la marge pour chaque groupe
  const marginBySeniority = new Map<Seniority, number>();
  
  resources.forEach(resource => {
    const margin = (resource.dailySellRate - resource.dailyCostRate) * resource.days;
    const currentMargin = marginBySeniority.get(resource.seniority) || 0;
    marginBySeniority.set(resource.seniority, currentMargin + margin);
  });
  
  return calculatePercentagesWithAdjustment(marginBySeniority);
}

/**
 * Calcule les pourcentages à partir d'une map de marges
 * et ajuste le dernier élément pour garantir un total de 100%
 */
function calculatePercentagesWithAdjustment<T extends string>(
  marginMap: Map<T, number>
): MarginByDimension[] {
  // Calculer la marge totale
  const totalMargin = Array.from(marginMap.values()).reduce((sum, val) => sum + val, 0);
  
  if (totalMargin === 0) {
    return [];
  }
  
  // Calculer les pourcentages bruts
  const results: MarginByDimension[] = Array.from(marginMap.entries()).map(([label, marginAmount]) => ({
    label,
    marginAmount,
    percentage: (marginAmount / totalMargin) * 100,
  }));
  
  // Trier par pourcentage décroissant
  results.sort((a, b) => b.percentage - a.percentage);
  
  // Arrondir à 1 décimale
  results.forEach(item => {
    item.percentage = Math.round(item.percentage * 10) / 10;
  });
  
  // Ajuster le dernier élément pour que la somme soit exactement 100%
  const sum = results.reduce((acc, item) => acc + item.percentage, 0);
  if (results.length > 0 && sum !== 100) {
    const adjustment = Math.round((100 - sum) * 10) / 10;
    results[results.length - 1].percentage += adjustment;
  }
  
  return results;
}

/**
 * Calcule le taux de marge en pourcentage
 */
export function calculateMarginRate(sellRate: number, costRate: number): number {
  if (sellRate === 0) return 0;
  return Number((((sellRate - costRate) / sellRate) * 100).toFixed(2));
}

/**
 * Calcule le taux d'utilisation (chargeabilité)
 */
export function calculateUtilizationRate(billedDays: number, availableDays: number): number {
  if (availableDays === 0) return 0;
  return Number(((billedDays / availableDays) * 100).toFixed(1));
}
