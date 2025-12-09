export interface MarketTrendsRange {
  min: number;
  max: number;
  currency: string;
}

export type Positioning =
  | "far_below"
  | "below"
  | "in_line"
  | "above"
  | "far_above";

export type RiskLevel = "low" | "medium" | "high";

export type MarketDemand = "low" | "medium" | "high" | "very_high";

export interface SalaryRangeByLevel {
  junior: MarketTrendsRange;
  intermediate: MarketTrendsRange;
  senior: MarketTrendsRange;
}

export interface FreelanceRateRangeByLevel {
  junior: MarketTrendsRange;
  intermediate: MarketTrendsRange;
  senior: MarketTrendsRange;
}

export interface MarketTrendsResponse {
  // Ranges by seniority level (new)
  salaryRangeByLevel?: SalaryRangeByLevel;
  freelanceRateRangeByLevel?: FreelanceRateRangeByLevel;
  
  // Original ranges (for specified seniority or default)
  salaryRange: MarketTrendsRange;
  freelanceRateRange: MarketTrendsRange;
  
  employeePositioning: Positioning;
  freelancePositioning: Positioning;
  marketDemand: MarketDemand;
  riskLevel: RiskLevel;
  summary: string;
  recommendation: string;
  rawModelOutput?: string;
}

export interface MarketTrendsRequest {
  role: string;
  seniority: string;
  resourceType: "Employee" | "Freelancer";
  location: string;
  currency: string;
  proposedAnnualSalary?: number | null;
  proposedBillRate?: number | null;
  clientName?: string;
  businessUnit?: string;
}
