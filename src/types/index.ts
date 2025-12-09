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
  id: string;
  name: string;
  code?: string;
  sectorId: number;
  sectorName?: string;
  country: Country;
  defaultCurrency: Currency;
  // Financial fields - optional, only visible to Admin/CFO
  defaultTargetMarginPercent?: number;
  defaultMinimumMarginPercent?: number;
  discountPercent?: number;
  forcedVacationDaysPerYear?: number;
  targetHourlyRate?: number; // Vendant cible ($/h)
  // Indicates if all financial parameters are configured
  isFinancialConfigComplete?: boolean;
  financialConfigStatusMessage?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  businessUnit: BusinessUnitRef;
  businessUnitCode: string; // Quick access to BU code for filtering
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientInput {
  name: string;
  code?: string;
  sectorId: number;
  country: Country;
  defaultCurrency: Currency;
  // Financial fields - optional, only editable by Admin/CFO
  defaultTargetMarginPercent?: number;
  defaultMinimumMarginPercent?: number;
  discountPercent?: number;
  forcedVacationDaysPerYear?: number;
  targetHourlyRate?: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  businessUnitId: string;
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

export interface EditProjectProfitabilityPayload {
  targetMargin?: number;
  minMargin?: number;
  teamMembers?: TeamMember[];
  notes?: string;
}

export interface ProjectChangeRequest {
  id: string;
  projectId: string;
  previousValues: EditProjectProfitabilityPayload;
  newValues: EditProjectProfitabilityPayload;
  requestedByUserId: string;
  requestedByEmail: string;
  requestedAt: string;
  status: 'PENDING_CFO_APPROVAL' | 'APPROVED' | 'REJECTED';
  approverEmail?: string;
}

// Business Unit Types
export interface BusinessUnit {
  id: string;
  name: string;
  code: string;
  businessUnitCode: string; // Same as code, for consistency
  sector: string;
  leader: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessUnitInput {
  name: string;
  code: string;
  sector: string;
  leader: string;
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
