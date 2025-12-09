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
}

export interface UpdateGlobalSalarySettingsRequest {
  employerChargesRate: number;
  indirectAnnualCosts: number;
  billableHoursPerYear: number;
}

export interface ClientMarginSettingsDto {
  id: number;
  clientId: number;
  clientName: string;
  targetMarginPercent: number;
  targetHourlyRate: number;
}

export interface CreateClientMarginSettingsRequest {
  clientId: number;
  targetMarginPercent: number;
  targetHourlyRate: number;
}

export interface UpdateClientMarginSettingsRequest {
  targetMarginPercent: number;
  targetHourlyRate: number;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const calculatorSettingsApi = {
  // Global Salary Settings
  
  /**
   * Get current global salary settings
   */
  getGlobalSalarySettings: async (): Promise<GlobalSalarySettingsDto | null> => {
    try {
      return await fetchWithAuth<GlobalSalarySettingsDto>('/api/calculator-settings/global-salary');
    } catch (error: any) {
      // Return null if no content (204)
      if (error?.status === 204 || error?.response?.status === 204) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create or update global salary settings
   */
  updateGlobalSalarySettings: async (
    payload: UpdateGlobalSalarySettingsRequest
  ): Promise<GlobalSalarySettingsDto> => {
    return fetchWithAuth<GlobalSalarySettingsDto>('/api/calculator-settings/global-salary', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // Client Margin Settings

  /**
   * Get all client margin settings
   */
  getClientMarginSettings: async (): Promise<ClientMarginSettingsDto[]> => {
    return fetchWithAuth<ClientMarginSettingsDto[]>('/api/calculator-settings/client-margins');
  },

  /**
   * Create new client margin settings
   */
  createClientMarginSettings: async (
    payload: CreateClientMarginSettingsRequest
  ): Promise<ClientMarginSettingsDto> => {
    return fetchWithAuth<ClientMarginSettingsDto>('/api/calculator-settings/client-margins', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update existing client margin settings
   */
  updateClientMarginSettings: async (
    id: number,
    payload: UpdateClientMarginSettingsRequest
  ): Promise<ClientMarginSettingsDto> => {
    return fetchWithAuth<ClientMarginSettingsDto>(`/api/calculator-settings/client-margins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Delete client margin settings
   */
  deleteClientMarginSettings: async (id: number): Promise<void> => {
    return fetchWithAuth<void>(`/api/calculator-settings/client-margins/${id}`, {
      method: 'DELETE',
    });
  },
};
