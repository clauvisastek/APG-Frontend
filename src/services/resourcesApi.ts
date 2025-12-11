import axios from 'axios';
import type { 
  Resource, 
  ResourceMissionHistory, 
  ResourceFilters,
  ResourceKPIs,
  CreateResourceInput 
} from '../types/resource';
import { getAuthToken } from '../utils/authFetch';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const token = await getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper to transform backend resource to frontend format
const transformResource = (backendResource: any): Resource => {
  return {
    id: backendResource.id.toString(),
    name: backendResource.name,
    firstName: backendResource.firstName,
    lastName: backendResource.lastName,
    businessUnitCode: backendResource.businessUnit?.code || '',
    jobType: backendResource.jobType,
    seniority: backendResource.seniority,
    currentClient: backendResource.currentClient,
    currentMission: backendResource.currentMission,
    status: backendResource.status,
    dailyCostRate: backendResource.dailyCostRate,
    dailySellRate: backendResource.dailySellRate,
    marginRate: backendResource.marginRate,
    hireDate: backendResource.hireDate,
    manager: backendResource.manager,
    email: backendResource.email,
    phone: backendResource.phone,
    createdAt: backendResource.createdAt,
    updatedAt: backendResource.updatedAt,
  };
};

export const resourcesApi = {
  list: async (filters?: ResourceFilters): Promise<Resource[]> => {
    const params = new URLSearchParams();
    
    if (filters?.name) params.append('name', filters.name);
    if (filters?.jobType) params.append('jobType', filters.jobType);
    if (filters?.seniority) params.append('seniority', filters.seniority);
    if (filters?.status) params.append('status', filters.status);
    
    const response = await axios.get(`${API_URL}/api/Resources?${params.toString()}`, {
      headers: await getAuthHeaders(),
    });
    return response.data.map(transformResource);
  },

  getById: async (id: string): Promise<Resource | undefined> => {
    try {
      const response = await axios.get(`${API_URL}/api/Resources/${id}`, {
        headers: await getAuthHeaders(),
      });
      return transformResource(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return undefined;
      }
      throw error;
    }
  },

  getByEmail: async (email: string): Promise<Resource | undefined> => {
    try {
      const response = await axios.get(`${API_URL}/api/Resources/by-email/${encodeURIComponent(email)}`, {
        headers: await getAuthHeaders(),
      });
      return transformResource(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return undefined;
      }
      throw error;
    }
  },

  getMissionHistory: async (resourceId: string): Promise<ResourceMissionHistory[]> => {
    try {
      const response = await axios.get(`${API_URL}/api/Resources/${resourceId}/history`, {
        headers: await getAuthHeaders(),
      });
      return response.data.map((pr: any) => ({
        id: pr.id.toString(),
        resourceId: pr.resourceId.toString(),
        type: 'Projet',
        clientName: pr.project?.client?.name || '',
        missionName: pr.project?.name || '',
        businessUnitCode: pr.project?.businessUnit?.code || '',
        jobType: pr.role,
        startDate: pr.startDate,
        endDate: pr.endDate,
        dailyCostRate: pr.dailyCostRate,
        dailySellRate: pr.dailySellRate,
        marginRate: pr.grossMarginPercent,
        billedDays: pr.billedDays || 0,
      }));
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  getKPIs: async (resourceId: string): Promise<ResourceKPIs> => {
    const history = await resourcesApi.getMissionHistory(resourceId);
    
    const currentYear = new Date().getFullYear();
    const workableDays = 220;
    
    const ytdHistory = history.filter(h => {
      const startYear = new Date(h.startDate).getFullYear();
      return startYear === currentYear || (h.endDate && new Date(h.endDate).getFullYear() >= currentYear);
    });
    
    const totalBilledDays = ytdHistory.reduce((sum, h) => sum + h.billedDays, 0);
    const utilizationRate = (totalBilledDays / workableDays) * 100;
    
    const averageMargin = ytdHistory.length > 0
      ? ytdHistory.reduce((sum, h) => sum + h.marginRate, 0) / ytdHistory.length
      : 0;
    
    const clientsCount = new Set(history.map(h => h.clientName)).size;
    const completedMissions = history.filter(h => h.endDate !== null).length;
    
    return {
      utilizationRate: Math.round(utilizationRate * 10) / 10,
      averageMargin: Math.round(averageMargin * 10) / 10,
      clientsCount,
      completedMissions,
    };
  },

  create: async (input: CreateResourceInput): Promise<Resource> => {
    const buResponse = await axios.get(`${API_URL}/api/BusinessUnits`, {
      headers: await getAuthHeaders(),
    });
    const businessUnit = buResponse.data.find((bu: any) => bu.code === input.businessUnitCode);
    
    if (!businessUnit) {
      throw new Error(`Business Unit ${input.businessUnitCode} not found`);
    }
    
    const nameParts = input.name.split(' ');
    const payload = {
      firstName: nameParts[0] || input.name,
      lastName: nameParts.slice(1).join(' ') || '',
      email: input.email || `${input.name.toLowerCase().replace(/\s+/g, '.')}@astek.com`,
      businessUnitId: businessUnit.id,
      jobType: input.jobType,
      seniority: input.seniority,
      dailyCostRate: input.dailyCostRate,
      dailySellRate: input.dailySellRate,
      hireDate: input.hireDate,
      currentClient: input.currentClient,
      currentMission: input.currentMission,
      status: input.status,
      manager: input.manager,
      phone: input.phone,
    };
    
    const response = await axios.post(`${API_URL}/api/Resources`, payload, {
      headers: await getAuthHeaders(),
    });
    return transformResource(response.data);
  },

  update: async (id: string, input: Partial<CreateResourceInput>): Promise<Resource> => {
    let businessUnitId: number | undefined;
    
    if (input.businessUnitCode) {
      const buResponse = await axios.get(`${API_URL}/api/BusinessUnits`, {
        headers: await getAuthHeaders(),
      });
      const businessUnit = buResponse.data.find((bu: any) => bu.code === input.businessUnitCode);
      if (businessUnit) {
        businessUnitId = businessUnit.id;
      }
    }
    
    const payload: any = {};
    
    if (input.name) {
      const nameParts = input.name.split(' ');
      payload.firstName = nameParts[0] || input.name;
      payload.lastName = nameParts.slice(1).join(' ') || '';
    }
    if (input.email) payload.email = input.email;
    if (businessUnitId) payload.businessUnitId = businessUnitId;
    if (input.jobType) payload.jobType = input.jobType;
    if (input.seniority) payload.seniority = input.seniority;
    if (input.dailyCostRate !== undefined) payload.dailyCostRate = input.dailyCostRate;
    if (input.dailySellRate !== undefined) payload.dailySellRate = input.dailySellRate;
    if (input.hireDate) payload.hireDate = input.hireDate;
    if (input.currentClient !== undefined) payload.currentClient = input.currentClient;
    if (input.currentMission !== undefined) payload.currentMission = input.currentMission;
    if (input.status) payload.status = input.status;
    if (input.manager !== undefined) payload.manager = input.manager;
    if (input.phone !== undefined) payload.phone = input.phone;
    
    const response = await axios.put(`${API_URL}/api/Resources/${id}`, payload, {
      headers: await getAuthHeaders(),
    });
    return transformResource(response.data);
  },

  remove: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/api/Resources/${id}`, {
      headers: await getAuthHeaders(),
    });
  },
};
