import { fetchWithAuth as authFetch } from '../utils/authFetch';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Wrapper to maintain existing API signature
async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  return authFetch<T>(`${API_URL}${url}`, options);
}

export interface ClientDto {
  id: number;
  code: string;
  name: string;
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
  defaultTargetMarginPercent?: number | null;
  defaultMinimumMarginPercent?: number | null;
  discountPercent?: number | null;
  forcedVacationDaysPerYear?: number | null;
  targetHourlyRate?: number | null; // Vendant cible ($/h)
  // Indicates if all financial parameters required by CFO are configured
  isFinancialConfigComplete?: boolean;
  financialConfigStatusMessage?: string;
  contactName: string;
  contactEmail: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ClientCreateUpdateDto {
  code: string;
  name: string;
  sectorId: number;
  businessUnitId: number;
  countryId: number;
  currencyId: number;
  // Financial fields - optional, only editable by Admin/CFO
  defaultTargetMarginPercent?: number | null;
  defaultMinimumMarginPercent?: number | null;
  discountPercent?: number | null;
  forcedVacationDaysPerYear?: number | null;
  targetHourlyRate?: number | null;
  contactName: string;
  contactEmail: string;
}

export const clientsApi = {
  /**
   * Get all clients (filtered by user's accessible Business Units)
   */
  getAll: async (): Promise<ClientDto[]> => {
    return fetchWithAuth<ClientDto[]>('/api/Clients');
  },

  /**
   * Get a client by ID
   */
  getById: async (id: number): Promise<ClientDto> => {
    return fetchWithAuth<ClientDto>(`/api/Clients/${id}`);
  },

  /**
   * Create a new client
   */
  create: async (payload: ClientCreateUpdateDto): Promise<ClientDto> => {
    return fetchWithAuth<ClientDto>('/api/Clients', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update an existing client
   */
  update: async (id: number, payload: ClientCreateUpdateDto): Promise<ClientDto> => {
    return fetchWithAuth<ClientDto>(`/api/Clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Delete a client (soft delete)
   */
  delete: async (id: number): Promise<void> => {
    return fetchWithAuth<void>(`/api/Clients/${id}`, {
      method: 'DELETE',
    });
  },
};
