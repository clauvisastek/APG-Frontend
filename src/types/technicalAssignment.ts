export type Seniority = "Junior" | "Intermédiaire" | "Sénior" | "Expert";
export type AssignmentStatus = "Actif" | "En attente" | "Terminé" | "En risque";

export interface TechnicalAssignment {
  id: string;
  clientId: string;
  clientName: string;
  businessUnitCode: string;
  department: string;
  jobFamily: string;
  seniority: Seniority;
  resourceId: string;
  resourceName: string;
  startDate: string;
  endDate: string | null;
  dailyCostRate: number;
  dailySellRate: number;
  marginRate: number;
  status: AssignmentStatus;
  industry: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTechnicalAssignmentInput {
  clientId: string;
  clientName: string;
  businessUnitCode: string;
  department: string;
  jobFamily: string;
  seniority: Seniority;
  resourceId: string;
  resourceName: string;
  startDate: string;
  endDate: string | null;
  dailyCostRate: number;
  dailySellRate: number;
  status: AssignmentStatus;
  industry: string;
  notes?: string;
}

export interface TechnicalAssignmentFilters {
  clientName?: string;
  businessUnitCode?: string;
  jobFamily?: string;
  seniority?: Seniority;
  status?: AssignmentStatus;
  startDate?: string;
  endDate?: string;
}

export interface MarginEvolution {
  month: string;
  marginRate: number;
}

export interface DimensionBreakdown {
  dimension: string;
  value: number;
  label: string;
}
