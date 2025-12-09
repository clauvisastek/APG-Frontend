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

export interface CountryDto {
  id: number;
  name: string;
  isoCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CountryCreateDto {
  name: string;
  isoCode?: string;
}

export const countriesApi = {
  /**
   * Get all active countries
   */
  getAll: async (): Promise<CountryDto[]> => {
    return fetchWithAuth<CountryDto[]>('/api/Countries');
  },

  /**
   * Get a country by ID
   */
  getById: async (id: number): Promise<CountryDto> => {
    return fetchWithAuth<CountryDto>(`/api/Countries/${id}`);
  },

  /**
   * Create a new country
   */
  create: async (payload: CountryCreateDto): Promise<CountryDto> => {
    return fetchWithAuth<CountryDto>('/api/Countries', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
