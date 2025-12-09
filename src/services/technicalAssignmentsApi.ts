import type { 
  TechnicalAssignment, 
  CreateTechnicalAssignmentInput,
  TechnicalAssignmentFilters,
  MarginEvolution,
  DimensionBreakdown
} from '../types/technicalAssignment';
import { calculateMarginByJobType, calculateMarginBySeniority, type ResourceWithMarginData } from '../utils/marginUtils';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock: Resources par mission AT (pour le calcul de marge multi-ressources)
const mockMissionResources: Record<string, ResourceWithMarginData[]> = {
  '1': [
    { jobType: 'Développeur', seniority: 'Sénior', dailyCostRate: 600, dailySellRate: 900, days: 180 },
    { jobType: 'QA', seniority: 'Intermédiaire', dailyCostRate: 450, dailySellRate: 700, days: 120 },
    { jobType: 'Analyste d\'affaires', seniority: 'Sénior', dailyCostRate: 550, dailySellRate: 850, days: 90 },
  ],
  '2': [
    { jobType: 'Architecte', seniority: 'Expert', dailyCostRate: 800, dailySellRate: 1200, days: 200 },
    { jobType: 'Développeur', seniority: 'Sénior', dailyCostRate: 650, dailySellRate: 950, days: 150 },
  ],
  '3': [
    { jobType: 'Analyste d\'affaires', seniority: 'Intermédiaire', dailyCostRate: 500, dailySellRate: 750, days: 150 },
    { jobType: 'Développeur', seniority: 'Junior', dailyCostRate: 400, dailySellRate: 600, days: 100 },
  ],
  '4': [
    { jobType: 'Développeur', seniority: 'Sénior', dailyCostRate: 700, dailySellRate: 1000, days: 120 },
  ],
  '5': [
    { jobType: 'Autres', seniority: 'Sénior', dailyCostRate: 650, dailySellRate: 950, days: 140 },
  ],
};

// Mock data
let mockAssignments: TechnicalAssignment[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Banque Nationale',
    businessUnitCode: 'BU-1',
    department: 'TI – Canaux numériques',
    jobFamily: 'Java',
    seniority: 'Sénior',
    resourceId: 'r1',
    resourceName: 'Marc Leblanc',
    startDate: '2024-01-15',
    endDate: null,
    dailyCostRate: 600,
    dailySellRate: 900,
    marginRate: 33.33,
    status: 'Actif',
    industry: 'Bancaire',
    notes: 'Mission longue durée sur la refonte des canaux',
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: '2',
    clientId: '1',
    clientName: 'Banque Nationale',
    businessUnitCode: 'BU-1',
    department: 'TI – Architecture',
    jobFamily: 'Architecte',
    seniority: 'Expert',
    resourceId: 'r2',
    resourceName: 'Sophie Martin',
    startDate: '2024-02-01',
    endDate: '2024-12-31',
    dailyCostRate: 800,
    dailySellRate: 1200,
    marginRate: 33.33,
    status: 'Actif',
    industry: 'Bancaire',
    createdAt: new Date('2024-01-25').toISOString(),
    updatedAt: new Date('2024-01-25').toISOString(),
  },
  {
    id: '3',
    clientId: '2',
    clientName: 'TechStart Inc.',
    businessUnitCode: 'BU-2',
    department: 'Data & Analytics',
    jobFamily: 'BI',
    seniority: 'Intermédiaire',
    resourceId: 'r3',
    resourceName: 'Julie Chen',
    startDate: '2024-03-01',
    endDate: null,
    dailyCostRate: 500,
    dailySellRate: 750,
    marginRate: 33.33,
    status: 'Actif',
    industry: 'Technologie',
    createdAt: new Date('2024-02-20').toISOString(),
    updatedAt: new Date('2024-02-20').toISOString(),
  },
  {
    id: '4',
    clientId: '3',
    clientName: 'Global Solutions SARL',
    businessUnitCode: 'BU-3',
    department: 'SAP',
    jobFamily: 'SAP',
    seniority: 'Sénior',
    resourceId: 'r4',
    resourceName: 'Thomas Roy',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    dailyCostRate: 700,
    dailySellRate: 1000,
    marginRate: 30,
    status: 'En risque',
    industry: 'Conseil',
    notes: 'Marge en baisse, à surveiller',
    createdAt: new Date('2023-12-15').toISOString(),
    updatedAt: new Date('2024-04-10').toISOString(),
  },
  {
    id: '5',
    clientId: '2',
    clientName: 'TechStart Inc.',
    businessUnitCode: 'BU-2',
    department: 'DevOps',
    jobFamily: 'DevOps',
    seniority: 'Sénior',
    resourceId: 'r5',
    resourceName: 'Pierre Dubois',
    startDate: '2024-04-01',
    endDate: null,
    dailyCostRate: 650,
    dailySellRate: 950,
    marginRate: 31.58,
    status: 'Actif',
    industry: 'Technologie',
    createdAt: new Date('2024-03-15').toISOString(),
    updatedAt: new Date('2024-03-15').toISOString(),
  },
];

const calculateMarginRate = (sellRate: number, costRate: number): number => {
  if (sellRate === 0) return 0;
  return Number((((sellRate - costRate) / sellRate) * 100).toFixed(2));
};

export const technicalAssignmentsApi = {
  list: async (filters?: TechnicalAssignmentFilters): Promise<TechnicalAssignment[]> => {
    await delay(300);
    
    let filtered = [...mockAssignments];
    
    if (filters?.clientName) {
      const search = filters.clientName.toLowerCase();
      filtered = filtered.filter(a => 
        a.clientName.toLowerCase().includes(search)
      );
    }
    
    if (filters?.businessUnitCode) {
      filtered = filtered.filter(a => 
        a.businessUnitCode === filters.businessUnitCode
      );
    }
    
    if (filters?.jobFamily) {
      filtered = filtered.filter(a => 
        a.jobFamily === filters.jobFamily
      );
    }
    
    if (filters?.seniority) {
      filtered = filtered.filter(a => 
        a.seniority === filters.seniority
      );
    }
    
    if (filters?.status) {
      filtered = filtered.filter(a => 
        a.status === filters.status
      );
    }
    
    return filtered;
  },

  getById: async (id: string): Promise<TechnicalAssignment | undefined> => {
    await delay(200);
    return mockAssignments.find(a => a.id === id);
  },

  create: async (input: CreateTechnicalAssignmentInput): Promise<TechnicalAssignment> => {
    await delay(400);
    
    const marginRate = calculateMarginRate(input.dailySellRate, input.dailyCostRate);
    
    const newAssignment: TechnicalAssignment = {
      ...input,
      id: `at-${Date.now()}`,
      marginRate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockAssignments.push(newAssignment);
    return newAssignment;
  },

  update: async (id: string, input: Partial<CreateTechnicalAssignmentInput>): Promise<TechnicalAssignment> => {
    await delay(400);
    
    const index = mockAssignments.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Mission AT non trouvée');
    }
    
    const updated = {
      ...mockAssignments[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    
    if (input.dailySellRate !== undefined || input.dailyCostRate !== undefined) {
      updated.marginRate = calculateMarginRate(
        input.dailySellRate ?? updated.dailySellRate,
        input.dailyCostRate ?? updated.dailyCostRate
      );
    }
    
    mockAssignments[index] = updated;
    return updated;
  },

  remove: async (id: string): Promise<void> => {
    await delay(300);
    
    const index = mockAssignments.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Mission AT non trouvée');
    }
    
    mockAssignments.splice(index, 1);
  },

  // Analytics data
  getMarginEvolution: async (_id: string): Promise<MarginEvolution[]> => {
    await delay(200);
    
    // Mock data for margin evolution chart
    return [
      { month: 'Jan', marginRate: 28 },
      { month: 'Fév', marginRate: 30 },
      { month: 'Mar', marginRate: 32 },
      { month: 'Avr', marginRate: 33 },
      { month: 'Mai', marginRate: 33.5 },
      { month: 'Jun', marginRate: 33.3 },
    ];
  },

  getDimensionBreakdown: async (id: string): Promise<{
    byJobFamily: DimensionBreakdown[];
    bySeniority: DimensionBreakdown[];
  }> => {
    await delay(200);
    
    // Récupérer les ressources de cette mission
    const resources = mockMissionResources[id] || [];
    
    if (resources.length === 0) {
      // Fallback si pas de données multi-ressources
      const assignment = mockAssignments.find(a => a.id === id);
      if (!assignment) {
        throw new Error('Mission AT non trouvée');
      }
      
      return {
        byJobFamily: [
          { dimension: 'jobFamily', value: assignment.marginRate, label: assignment.jobFamily },
        ],
        bySeniority: [
          { dimension: 'seniority', value: assignment.marginRate, label: assignment.seniority },
        ],
      };
    }
    
    // Calculer la vraie répartition avec les utilitaires
    const marginByJob = calculateMarginByJobType(resources);
    const marginBySeniority = calculateMarginBySeniority(resources);
    
    return {
      byJobFamily: marginByJob.map(item => ({
        dimension: 'jobFamily',
        value: item.percentage,
        label: item.label,
      })),
      bySeniority: marginBySeniority.map(item => ({
        dimension: 'seniority',
        value: item.percentage,
        label: item.label,
      })),
    };
  },
};
