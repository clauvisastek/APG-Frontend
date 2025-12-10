import axios from 'axios';
import type { 
  TechnicalAssignment, 
  CreateTechnicalAssignmentInput,
  TechnicalAssignmentFilters,
  MarginEvolution,
  DimensionBreakdown
} from '../types/technicalAssignment';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const calculateMarginRate = (sellRate: number, costRate: number): number => {
  if (sellRate === 0) return 0;
  return Number((((sellRate - costRate) / sellRate) * 100).toFixed(2));
};

export const technicalAssignmentsApi = {
  list: async (filters?: TechnicalAssignmentFilters): Promise<TechnicalAssignment[]> => {
    const params = new URLSearchParams();
    
    if (filters?.clientName) params.append('clientName', filters.clientName);
    if (filters?.businessUnitCode) params.append('businessUnitCode', filters.businessUnitCode);
    if (filters?.jobFamily) params.append('jobFamily', filters.jobFamily);
    if (filters?.seniority) params.append('seniority', filters.seniority);
    if (filters?.status) params.append('status', filters.status);
    
    // TODO: Implement backend endpoint for Technical Assignments
    // For now, return empty array to avoid errors
    console.warn('TechnicalAssignments API not yet implemented - returning empty array');
    return [];
  },

  getById: async (id: string): Promise<TechnicalAssignment | undefined> => {
    try {
      // TODO: Implement backend endpoint
      console.warn('TechnicalAssignments API not yet implemented');
      return undefined;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return undefined;
      }
      throw error;
    }
  },

  create: async (input: CreateTechnicalAssignmentInput): Promise<TechnicalAssignment> => {
    const marginRate = calculateMarginRate(input.dailySellRate, input.dailyCostRate);
    
    const newAssignment: TechnicalAssignment = {
      ...input,
      id: `at-${Date.now()}`,
      marginRate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // TODO: Implement backend endpoint
    console.warn('TechnicalAssignments API not yet implemented - returning mock data');
    return newAssignment;
  },

  update: async (id: string, input: Partial<CreateTechnicalAssignmentInput>): Promise<TechnicalAssignment> => {
    // TODO: Implement backend endpoint
    console.warn('TechnicalAssignments API not yet implemented');
    throw new Error('TechnicalAssignments update not yet implemented');
  },

  remove: async (id: string): Promise<void> => {
    // TODO: Implement backend endpoint
    console.warn('TechnicalAssignments API not yet implemented');
  },

  // Analytics data
  getMarginEvolution: async (_id: string): Promise<MarginEvolution[]> => {
    // TODO: Implement backend endpoint
    console.warn('TechnicalAssignments analytics not yet implemented');
    return [];
  },

  getDimensionBreakdown: async (id: string): Promise<{
    byJobFamily: DimensionBreakdown[];
    bySeniority: DimensionBreakdown[];
  }> => {
    // TODO: Implement backend endpoint
    console.warn('TechnicalAssignments analytics not yet implemented');
    return {
      byJobFamily: [],
      bySeniority: [],
    };
  },
};
