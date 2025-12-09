const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export interface CurrencyDto {
  id: number;
  name: string;
  code: string;
  symbol?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CurrencyCreateDto {
  name: string;
  code: string;
  symbol?: string;
}

export const currenciesApi = {
  /**
   * Get all active currencies
   */
  getAll: async (): Promise<CurrencyDto[]> => {
    return fetchWithAuth<CurrencyDto[]>('/api/Currencies');
  },

  /**
   * Get a currency by ID
   */
  getById: async (id: number): Promise<CurrencyDto> => {
    return fetchWithAuth<CurrencyDto>(`/api/Currencies/${id}`);
  },

  /**
   * Create a new currency
   */
  create: async (payload: CurrencyCreateDto): Promise<CurrencyDto> => {
    return fetchWithAuth<CurrencyDto>('/api/Currencies', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
