export type ResourceType = 'Salarie' | 'Pigiste';

export type MarginStatus = 'OK' | 'WARNING' | 'KO';

export interface MarginSimulationRequest {
  resourceType: ResourceType;
  annualGrossSalary?: number;
  clientId: number;
  proposedBillRate: number;
  plannedHours?: number;
  seniority?: string;
}

export interface TargetResults {
  costPerHour: number;
  effectiveTargetBillRate: number;
  theoreticalMarginPercent: number;
  theoreticalMarginPerHour: number;
  configuredTargetMarginPercent: number;
  configuredMinMarginPercent: number;
  configuredDiscountPercent: number | null;
  forcedVacationDaysPerYear: number;
  status: MarginStatus;
}

export interface ProposedResults {
  proposedBillRate: number;
  marginPercent: number;
  marginPerHour: number;
  discountPercentApplied: number | null;
  status: MarginStatus;
}

export interface MarginSimulationResponse {
  targetResults: TargetResults;
  proposedResults: ProposedResults;
}
