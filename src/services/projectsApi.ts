import { fetchWithAuth } from '../utils/authFetch';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Wrapper to maintain existing API signature
async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  return fetchWithAuth<T>(`${API_URL}${url}`, options);
}

export interface ProjectDto {
  id: number;
  name: string;
  code: string;
  clientId: number;
  clientName: string;
  clientCode: string;
  businessUnitId: number;
  businessUnitCode: string;
  businessUnitName: string;
  type: string; // T&M, Forfait, Autre
  responsibleName?: string | null;
  currency: string; // CAD, USD, EUR
  startDate: string;
  endDate: string;
  targetMargin: number;
  minMargin: number;
  status: string; // En construction, Actif, Terminé, En pause
  notes?: string | null;
  ytdRevenue?: number | null;
  teamMembers?: TeamMemberDto[] | null;
  globalMarginHistory?: GlobalMarginHistoryDto[] | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ProjectCreateDto {
  name: string;
  code: string;
  clientId: number;
  businessUnitId: number;
  type: string;
  responsibleName?: string | null;
  currency: string;
  startDate: string;
  endDate: string;
  targetMargin: number;
  minMargin: number;
  status?: string | null;
  notes?: string | null;
  ytdRevenue?: number | null;
  teamMembers?: TeamMemberDto[] | null;
  globalMarginHistory?: GlobalMarginHistoryDto[] | null;
}

export interface ProjectUpdateDto {
  name: string;
  code: string;
  clientId: number;
  businessUnitId: number;
  type: string;
  responsibleName?: string | null;
  currency: string;
  startDate: string;
  endDate: string;
  targetMargin: number;
  minMargin: number;
  status: string;
  notes?: string | null;
  ytdRevenue?: number | null;
  teamMembers?: TeamMemberDto[] | null;
  globalMarginHistory?: GlobalMarginHistoryDto[] | null;
}

export interface TeamMemberDto {
  id: string;
  email?: string; // Email for resource uniqueness
  name: string;
  role: string;
  costRate: number;
  sellRate: number;
  grossMargin: number;
  netMargin: number;
}

export interface GlobalMarginHistoryDto {
  label: string;
  value: number;
}

export const projectsApi = {
  /**
   * Get all projects (filtered by user's accessible Business Units)
   */
  getAll: async (): Promise<ProjectDto[]> => {
    return apiFetch<ProjectDto[]>('/api/Projects');
  },

  /**
   * Get a project by ID
   */
  getById: async (id: number): Promise<ProjectDto> => {
    return apiFetch<ProjectDto>(`/api/Projects/${id}`);
  },

  /**
   * Create a new project
   */
  create: async (payload: ProjectCreateDto): Promise<ProjectDto> => {
    return apiFetch<ProjectDto>('/api/Projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update an existing project
   */
  update: async (id: number, payload: ProjectUpdateDto): Promise<ProjectDto> => {
    return apiFetch<ProjectDto>(`/api/Projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Delete a project (soft delete)
   */
  delete: async (id: number): Promise<void> => {
    return apiFetch<void>(`/api/Projects/${id}`, {
      method: 'DELETE',
    });
  },
};
