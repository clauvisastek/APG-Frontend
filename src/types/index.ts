// Enums as const objects
export const ProjectType = {
  TIME_AND_MATERIALS: 'T&M',
  FIXED_PRICE: 'Forfait',
  OTHER: 'Autre',
} as const;

export type ProjectType = typeof ProjectType[keyof typeof ProjectType];

export const ProjectStatus = {
  CONSTRUCTION: 'En construction',
  ACTIVE: 'Actif',
  COMPLETED: 'Terminé',
  ON_HOLD: 'En pause',
} as const;

export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];

export const Currency = {
  CAD: 'CAD',
  USD: 'USD',
  EUR: 'EUR',
} as const;

export type Currency = typeof Currency[keyof typeof Currency];

export const Country = {
  CANADA: 'Canada',
  USA: 'États-Unis',
  FRANCE: 'France',
  UK: 'Royaume-Uni',
  GERMANY: 'Allemagne',
} as const;

export type Country = typeof Country[keyof typeof Country];

// Business Unit Reference Type
export interface BusinessUnitRef {
  id: string;
  name: string;
  code: string;
}

// Client Types
export interface Client {
  id: number;
  name: string;
  code: string;
  sectorId: number;
  sectorName: string;
  businessUnitId: number;
  businessUnitCode: string;
  businessUnitName: string;
  countryId: number;
  countryName: string;
  currencyId: number;
  currencyCode: string;
  // Financial fields - optional, only visible to Admin/CFO
  defaultTargetMarginPercent?: number;
  defaultMinimumMarginPercent?: number;
  discountPercent?: number;
  forcedVacationDaysPerYear?: number;
  targetHourlyRate?: number;
  isFinancialConfigComplete: boolean;
  financialConfigStatusMessage: string;
  contactName: string;
  contactEmail: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateClientInput {
  code: string;
  name: string;
  sectorId: number;
  businessUnitId: number;
  countryId: number;
  currencyId: number;
  // Financial fields - optional, only editable by Admin/CFO
  defaultTargetMarginPercent?: number;
  defaultMinimumMarginPercent?: number;
  discountPercent?: number;
  forcedVacationDaysPerYear?: number;
  targetHourlyRate?: number;
  contactName: string;
  contactEmail: string;
}

// Project Types
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  costRate: number;
  sellRate: number;
  grossMargin: number;
  netMargin: number;
}

export interface GlobalMarginHistory {
  label: string;
  value: number;
}

export interface Project {
  id: string;
  name: string;
  code?: string;
  clientId: string;
  client?: Client;
  type: ProjectType;
  responsibleId?: string;
  responsibleName?: string;
  currency: Currency;
  startDate: string;
  endDate: string;
  targetMargin: number;
  minMargin: number;
  status: ProjectStatus;
  notes?: string;
  businessUnit: BusinessUnitRef;
  businessUnitCode: string; // Quick access to BU code for filtering
  teamMembers?: TeamMember[];
  globalMarginHistory?: GlobalMarginHistory[];
  ytdRevenue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  code?: string;
  clientId: string;
  type: ProjectType;
  responsibleId?: string;
  currency: Currency;
  startDate: string;
  endDate: string;
  targetMargin: number;
  minMargin: number;
  notes?: string;
  businessUnitId: string;
}


// Business Unit Types
export interface BusinessUnit {
  id: string;
  name: string;
  code: string;
  managerName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateBusinessUnitInput {
  name: string;
  code: string;
  managerName: string;
  isActive?: boolean;
}

// API Response Types
export interface ApiError {
  message: string;
  field?: string;
  code?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

// Re-export margin types
export * from './margin';

// Re-export market trends types
export * from './marketTrends';
