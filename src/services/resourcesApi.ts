import type { 
  Resource, 
  ResourceMissionHistory, 
  ResourceFilters,
  ResourceKPIs,
  CreateResourceInput 
} from '../types/resource';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data
let mockResources: Resource[] = [
  {
    id: '1',
    name: 'Marc Leblanc',
    businessUnitCode: 'BU-1',
    jobType: 'Développeur',
    seniority: 'Sénior',
    currentClient: 'Banque Nationale',
    currentMission: 'Refonte des canaux numériques',
    status: 'Actif en mission',
    dailyCostRate: 600,
    dailySellRate: 900,
    marginRate: 33.33,
    hireDate: '2020-03-15',
    manager: 'Sophie Tremblay',
    email: 'marc.leblanc@astek.com',
    phone: '514-555-0101',
    createdAt: new Date('2020-03-15').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Sophie Martin',
    businessUnitCode: 'BU-1',
    jobType: 'Architecte',
    seniority: 'Expert',
    currentClient: 'Banque Nationale',
    currentMission: 'Architecture Cloud',
    status: 'Actif en mission',
    dailyCostRate: 800,
    dailySellRate: 1200,
    marginRate: 33.33,
    hireDate: '2018-06-01',
    manager: 'Sophie Tremblay',
    email: 'sophie.martin@astek.com',
    phone: '514-555-0102',
    createdAt: new Date('2018-06-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Julie Chen',
    businessUnitCode: 'BU-2',
    jobType: 'Analyste d\'affaires',
    seniority: 'Intermédiaire',
    currentClient: 'TechStart Inc.',
    currentMission: 'Data & Analytics',
    status: 'Actif en mission',
    dailyCostRate: 500,
    dailySellRate: 750,
    marginRate: 33.33,
    hireDate: '2021-09-01',
    manager: 'Jean Dupont',
    email: 'julie.chen@astek.com',
    phone: '514-555-0103',
    createdAt: new Date('2021-09-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Thomas Roy',
    businessUnitCode: 'BU-3',
    jobType: 'Développeur',
    seniority: 'Sénior',
    currentClient: 'Global Solutions SARL',
    currentMission: 'SAP Modernisation',
    status: 'Actif en mission',
    dailyCostRate: 700,
    dailySellRate: 1000,
    marginRate: 30,
    hireDate: '2019-11-20',
    manager: 'Marie Bouchard',
    email: 'thomas.roy@astek.com',
    phone: '514-555-0104',
    createdAt: new Date('2019-11-20').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Pierre Dubois',
    businessUnitCode: 'BU-2',
    jobType: 'QA',
    seniority: 'Sénior',
    status: 'Disponible',
    dailyCostRate: 550,
    dailySellRate: 850,
    marginRate: 35.29,
    hireDate: '2020-01-10',
    manager: 'Jean Dupont',
    email: 'pierre.dubois@astek.com',
    phone: '514-555-0105',
    createdAt: new Date('2020-01-10').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Marie Gagnon',
    businessUnitCode: 'BU-1',
    jobType: 'Développeur',
    seniority: 'Junior',
    status: 'En intercontrat',
    dailyCostRate: 400,
    dailySellRate: 600,
    marginRate: 33.33,
    hireDate: '2023-05-15',
    manager: 'Sophie Tremblay',
    email: 'marie.gagnon@astek.com',
    phone: '514-555-0106',
    createdAt: new Date('2023-05-15').toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockMissionHistory: Record<string, ResourceMissionHistory[]> = {
  '1': [
    {
      id: 'mh-1',
      resourceId: '1',
      type: 'AT',
      clientName: 'Banque Nationale',
      missionName: 'Refonte des canaux numériques',
      businessUnitCode: 'BU-1',
      jobType: 'Développeur',
      startDate: '2024-01-15',
      endDate: null,
      dailyCostRate: 600,
      dailySellRate: 900,
      marginRate: 33.33,
      billedDays: 180,
    },
    {
      id: 'mh-2',
      resourceId: '1',
      type: 'Projet',
      clientName: 'Desjardins',
      missionName: 'Portail Client Web',
      businessUnitCode: 'BU-1',
      jobType: 'Développeur',
      startDate: '2022-06-01',
      endDate: '2023-12-31',
      dailyCostRate: 550,
      dailySellRate: 850,
      marginRate: 35.29,
      billedDays: 320,
    },
  ],
  '2': [
    {
      id: 'mh-3',
      resourceId: '2',
      type: 'AT',
      clientName: 'Banque Nationale',
      missionName: 'Architecture Cloud',
      businessUnitCode: 'BU-1',
      jobType: 'Architecte',
      startDate: '2024-02-01',
      endDate: '2024-12-31',
      dailyCostRate: 800,
      dailySellRate: 1200,
      marginRate: 33.33,
      billedDays: 200,
    },
  ],
  '3': [
    {
      id: 'mh-4',
      resourceId: '3',
      type: 'AT',
      clientName: 'TechStart Inc.',
      missionName: 'Data & Analytics',
      businessUnitCode: 'BU-2',
      jobType: 'Analyste d\'affaires',
      startDate: '2024-03-01',
      endDate: null,
      dailyCostRate: 500,
      dailySellRate: 750,
      marginRate: 33.33,
      billedDays: 150,
    },
  ],
  '4': [
    {
      id: 'mh-5',
      resourceId: '4',
      type: 'AT',
      clientName: 'Global Solutions SARL',
      missionName: 'SAP Modernisation',
      businessUnitCode: 'BU-3',
      jobType: 'Développeur',
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      dailyCostRate: 700,
      dailySellRate: 1000,
      marginRate: 30,
      billedDays: 120,
    },
  ],
  '5': [],
  '6': [],
};

export const resourcesApi = {
  list: async (filters?: ResourceFilters): Promise<Resource[]> => {
    await delay(300);
    
    let filtered = [...mockResources];
    
    if (filters?.name) {
      const search = filters.name.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(search)
      );
    }
    
    if (filters?.businessUnitCode) {
      filtered = filtered.filter(r => 
        r.businessUnitCode === filters.businessUnitCode
      );
    }
    
    if (filters?.jobType) {
      filtered = filtered.filter(r => 
        r.jobType === filters.jobType
      );
    }
    
    if (filters?.seniority) {
      filtered = filtered.filter(r => 
        r.seniority === filters.seniority
      );
    }
    
    if (filters?.status) {
      filtered = filtered.filter(r => 
        r.status === filters.status
      );
    }
    
    if (filters?.currentClient) {
      filtered = filtered.filter(r => 
        r.currentClient?.toLowerCase().includes(filters.currentClient!.toLowerCase())
      );
    }
    
    return filtered;
  },

  getById: async (id: string): Promise<Resource | undefined> => {
    await delay(200);
    return mockResources.find(r => r.id === id);
  },

  getMissionHistory: async (resourceId: string): Promise<ResourceMissionHistory[]> => {
    await delay(200);
    return mockMissionHistory[resourceId] || [];
  },

  getKPIs: async (resourceId: string): Promise<ResourceKPIs> => {
    await delay(200);
    
    // Mock KPIs calculation
    const history = mockMissionHistory[resourceId] || [];
    const currentYear = new Date().getFullYear();
    const workableDays = 220; // Approximate workable days per year
    
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
    await delay(400);
    
    const marginRate = input.dailySellRate > 0 
      ? (((input.dailySellRate - input.dailyCostRate) / input.dailySellRate) * 100)
      : 0;
    
    const newResource: Resource = {
      ...input,
      id: `resource-${Date.now()}`,
      marginRate: Number(marginRate.toFixed(2)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockResources.push(newResource);
    return newResource;
  },

  update: async (id: string, input: Partial<CreateResourceInput>): Promise<Resource> => {
    await delay(400);
    
    const index = mockResources.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Ressource non trouvée');
    }
    
    const updated = {
      ...mockResources[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    
    if (input.dailySellRate !== undefined || input.dailyCostRate !== undefined) {
      const sellRate = input.dailySellRate ?? updated.dailySellRate;
      const costRate = input.dailyCostRate ?? updated.dailyCostRate;
      updated.marginRate = Number((((sellRate - costRate) / sellRate) * 100).toFixed(2));
    }
    
    mockResources[index] = updated;
    return updated;
  },

  remove: async (id: string): Promise<void> => {
    await delay(300);
    
    const index = mockResources.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Ressource non trouvée');
    }
    
    mockResources.splice(index, 1);
  },
};
