export type JobType = "Développeur" | "QA" | "Analyste d'affaires" | "Architecte" | "Autres";
export type Seniority = "Junior" | "Intermédiaire" | "Sénior" | "Expert";
export type ResourceStatus = "Actif en mission" | "Disponible" | "En intercontrat";

export interface Resource {
  id: string;
  name: string;
  businessUnitCode: string;
  jobType: JobType;
  seniority: Seniority;
  currentClient?: string;
  currentMission?: string;
  status: ResourceStatus;
  dailyCostRate: number;
  dailySellRate: number;
  marginRate: number;
  hireDate: string;
  manager?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceMissionHistory {
  id: string;
  resourceId: string;
  type: "AT" | "Projet";
  clientName: string;
  missionName: string;
  businessUnitCode: string;
  jobType: JobType;
  startDate: string;
  endDate: string | null;
  dailyCostRate: number;
  dailySellRate: number;
  marginRate: number;
  billedDays: number;
}

export interface ResourceFilters {
  name?: string;
  businessUnitCode?: string;
  jobType?: JobType;
  seniority?: Seniority;
  status?: ResourceStatus;
  currentClient?: string;
}

export interface ResourceKPIs {
  utilizationRate: number; // % jours facturés / jours travaillables
  averageMargin: number;
  clientsCount: number;
  completedMissions: number;
}

export interface CreateResourceInput {
  name: string;
  businessUnitCode: string;
  jobType: JobType;
  seniority: Seniority;
  dailyCostRate: number;
  dailySellRate: number;
  status: ResourceStatus;
  hireDate: string;
  manager?: string;
  email?: string;
  phone?: string;
}
