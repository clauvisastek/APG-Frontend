import type { Client, CreateClientInput, Project, CreateProjectInput, BusinessUnit, CreateBusinessUnitInput, MarginSimulationRequest, MarginSimulationResponse } from '../types';
import type { MarketTrendsRequest, MarketTrendsResponse } from '../types/marketTrends';
import { fetchWithAuth } from '../utils/authFetch';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001';

// API functions for Clients
export const clientApi = {
  // Get all clients (with optional BU filter)
  getAll: async (buId?: number): Promise<Client[]> => {
    const url = buId 
      ? `${API_BASE_URL}/api/Clients?businessUnitId=${buId}`
      : `${API_BASE_URL}/api/Clients`;
    return fetchWithAuth<Client[]>(url);
  },

  // Search clients by name
  search: async (query: string): Promise<Client[]> => {
    return fetchWithAuth<Client[]>(`${API_BASE_URL}/api/Clients?search=${encodeURIComponent(query)}`);
  },

  // Get client by ID
  getById: async (id: number): Promise<Client | undefined> => {
    try {
      return await fetchWithAuth<Client>(`${API_BASE_URL}/api/Clients/${id}`);
    } catch (error) {
      return undefined;
    }
  },

  // Create new client
  create: async (input: CreateClientInput): Promise<Client> => {
    return fetchWithAuth<Client>(`${API_BASE_URL}/api/Clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  },
};

// API functions for Projects
export const projectApi = {
  // Get all projects (with optional BU filter)
  getAll: async (buId?: string): Promise<Project[]> => {
    const url = buId 
      ? `${API_BASE_URL}/api/Projects?businessUnitId=${buId}`
      : `${API_BASE_URL}/api/Projects`;
    return fetchWithAuth<Project[]>(url);
  },

  // Get project by ID
  getById: async (id: string): Promise<Project | undefined> => {
    try {
      return await fetchWithAuth<Project>(`${API_BASE_URL}/api/Projects/${id}`);
    } catch (error) {
      return undefined;
    }
  },

  // Create new project
  create: async (input: CreateProjectInput): Promise<Project> => {
    return fetchWithAuth<Project>(`${API_BASE_URL}/api/Projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  },

  // Update non-critical project fields (optimistic update - no validation required)
  updateNonCritical: async (
    id: string,
    updates: {
      name?: string;
      code?: string;
      startDate?: string;
      endDate?: string;
      notes?: string;
    }
  ): Promise<Project> => {
    return fetchWithAuth<Project>(`${API_BASE_URL}/api/Projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  // Update project (all fields including team and margins)
  update: async (
    id: string,
    updates: {
      name?: string;
      code?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
      targetMargin?: number;
      minMargin?: number;
      teamMembers?: Array<{
        email: string;
        name: string;
        role: string;
        costRate: number;
        sellRate: number;
        grossMargin: number;
        netMargin: number;
      }>;
    }
  ): Promise<Project> => {
    return fetchWithAuth<Project>(`${API_BASE_URL}/api/Projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },
};

// API functions for Business Units
export const businessUnitApi = {
  // Get all business units
  getAll: async (): Promise<BusinessUnit[]> => {
    return fetchWithAuth<BusinessUnit[]>(`${API_BASE_URL}/api/BusinessUnits`);
  },

  // Get business unit by ID
  getById: async (id: string): Promise<BusinessUnit | undefined> => {
    try {
      return await fetchWithAuth<BusinessUnit>(`${API_BASE_URL}/api/BusinessUnits/${id}`);
    } catch (error) {
      return undefined;
    }
  },

  // Create new business unit
  create: async (input: CreateBusinessUnitInput): Promise<BusinessUnit> => {
    return fetchWithAuth<BusinessUnit>(`${API_BASE_URL}/api/BusinessUnits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  },

  // Update business unit
  update: async (id: string, input: CreateBusinessUnitInput): Promise<BusinessUnit> => {
    return fetchWithAuth<BusinessUnit>(`${API_BASE_URL}/api/BusinessUnits/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  },

  // Delete business unit
  deleteBusinessUnit: async (id: string): Promise<void> => {
    await fetchWithAuth<void>(`${API_BASE_URL}/api/BusinessUnits/${id}`, {
      method: 'DELETE',
    });
  },
};

// API functions for Project Change Requests
export const projectChangeRequestApi = {
  // Submit project edit for validation
  submitEditForValidation: async (
    projectId: string,
    previousValues: import('../types').EditProjectProfitabilityPayload,
    newValues: import('../types').EditProjectProfitabilityPayload,
    userEmail: string,
    approverEmail: string
  ): Promise<import('../types').ProjectChangeRequest> => {
    return fetchWithAuth<import('../types').ProjectChangeRequest>(`${API_BASE_URL}/api/ProjectChangeRequests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        previousValues,
        newValues,
        requestedByEmail: userEmail,
        approverEmail,
      }),
    });
  },

  // Get all change requests
  getAll: async (): Promise<import('../types').ProjectChangeRequest[]> => {
    return fetchWithAuth<import('../types').ProjectChangeRequest[]>(`${API_BASE_URL}/api/ProjectChangeRequests`);
  },

  // Get change requests by project ID
  getByProjectId: async (projectId: string): Promise<import('../types').ProjectChangeRequest[]> => {
    return fetchWithAuth<import('../types').ProjectChangeRequest[]>(`${API_BASE_URL}/api/ProjectChangeRequests?projectId=${projectId}`);
  },

  // Approve change request (Admin/CFO only)
  approve: async (requestId: string): Promise<void> => {
    await fetchWithAuth<void>(`${API_BASE_URL}/api/ProjectChangeRequests/${requestId}/approve`, {
      method: 'POST',
    });
  },

  // Reject change request
  reject: async (requestId: string): Promise<void> => {
    await fetchWithAuth<void>(`${API_BASE_URL}/api/ProjectChangeRequests/${requestId}/reject`, {
      method: 'POST',
    });
  },
};

// Margin simulation API
export const marginApi = {
  // Simulate margin calculation
  simulate: async (request: MarginSimulationRequest): Promise<MarginSimulationResponse> => {
    return fetchWithAuth<MarginSimulationResponse>(`${API_BASE_URL}/api/Margin/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  },
};

// Market Trends API
export const marketTrendsApi = {
  // Fetch market trends analysis
  analyze: async (request: MarketTrendsRequest): Promise<MarketTrendsResponse> => {
    return fetchWithAuth<MarketTrendsResponse>(`${API_BASE_URL}/api/market-trends`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  },
};
