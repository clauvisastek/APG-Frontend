import { fetchWithAuth as authFetch } from '../utils/authFetch';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Wrapper to maintain existing API signature
async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  return authFetch<T>(`${API_URL}${url}`, options);
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface GlobalSalarySettingsDto {
  id: number;
  employerChargesRate: number;
  indirectAnnualCosts: number;
  billableHoursPerYear: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGlobalSalarySettingsRequest {
  employerChargesRate: number;
  indirectAnnualCosts: number;
  billableHoursPerYear: number;
}

export interface UpdateGlobalSalarySettingsRequest {
  employerChargesRate: number;
  indirectAnnualCosts: number;
  billableHoursPerYear: number;
}

export interface ActiveGlobalSalarySettingsResponse {
  hasActiveSettings: boolean;
  settings: GlobalSalarySettingsDto | null;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const globalSalarySettingsApi = {
  /**
   * Get all global salary settings (full history)
   */
  getAll: async (): Promise<GlobalSalarySettingsDto[]> => {
    return fetchWithAuth<GlobalSalarySettingsDto[]>('/api/salary-settings');
  },

  /**
   * Get the currently active global salary settings
   */
  getActive: async (): Promise<ActiveGlobalSalarySettingsResponse> => {
    return fetchWithAuth<ActiveGlobalSalarySettingsResponse>('/api/salary-settings/active');
  },

  /**
   * Create new global salary settings (automatically activated)
   */
  create: async (
    payload: CreateGlobalSalarySettingsRequest
  ): Promise<GlobalSalarySettingsDto> => {
    return fetchWithAuth<GlobalSalarySettingsDto>('/api/salary-settings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update existing global salary settings
   */
  update: async (
    id: number,
    payload: UpdateGlobalSalarySettingsRequest
  ): Promise<GlobalSalarySettingsDto> => {
    return fetchWithAuth<GlobalSalarySettingsDto>(`/api/salary-settings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Activate a specific global salary settings record
   */
  activate: async (id: number): Promise<GlobalSalarySettingsDto> => {
    return fetchWithAuth<GlobalSalarySettingsDto>(`/api/salary-settings/${id}/activate`, {
      method: 'POST',
    });
  },

  /**
   * Delete a global salary settings record (only if not active)
   */
  delete: async (id: number): Promise<void> => {
    return fetchWithAuth<void>(`/api/salary-settings/${id}`, {
      method: 'DELETE',
    });
  },
};
