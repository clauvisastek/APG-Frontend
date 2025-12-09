import type { Client, CreateClientInput, Project, CreateProjectInput, BusinessUnit, CreateBusinessUnitInput, MarginSimulationRequest, MarginSimulationResponse } from '../types';
import { ProjectStatus, Country, Currency, ProjectType } from '../types';
import { fetchWithAuth } from '../utils/authFetch';

// Simulated delay for API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage for Business Units (defined first for reference)
let mockBusinessUnits: BusinessUnit[] = [
  {
    id: '1',
    name: 'Banking France',
    code: 'BU-1',
    businessUnitCode: 'BU-1',
    sector: 'Banking',
    leader: 'Jean Dupont',
    createdAt: new Date('2023-01-15').toISOString(),
    updatedAt: new Date('2023-01-15').toISOString(),
  },
  {
    id: '2',
    name: 'Energy Canada',
    code: 'BU-2',
    businessUnitCode: 'BU-2',
    sector: 'Energy',
    leader: 'Marie Tremblay',
    createdAt: new Date('2023-02-20').toISOString(),
    updatedAt: new Date('2023-02-20').toISOString(),
  },
  {
    id: '3',
    name: 'Telecom Europe',
    code: 'BU-3',
    businessUnitCode: 'BU-3',
    sector: 'Telecommunications',
    leader: 'Pierre Martin',
    createdAt: new Date('2023-03-10').toISOString(),
    updatedAt: new Date('2023-03-10').toISOString(),
  },
];

// Mock data storage for Clients
let mockClients: Client[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    code: 'ACME',
    sectorId: 1,
    sectorName: 'Technologie',
    country: Country.CANADA,
    defaultCurrency: Currency.CAD,
    defaultTargetMarginPercent: 25,
    defaultMinimumMarginPercent: 15,
    contactName: 'John Doe',
    contactEmail: 'john.doe@acme.com',
    contactPhone: '+1 514 555-0100',
    notes: 'Client principal depuis 2020',
    businessUnit: { id: '1', name: 'Banking France', code: 'BU-1' },
    businessUnitCode: 'BU-1',
    createdAt: new Date('2020-01-15').toISOString(),
    updatedAt: new Date('2020-01-15').toISOString(),
  },
  {
    id: '2',
    name: 'TechStart Inc.',
    code: 'TECH',
    sectorId: 2,
    sectorName: 'Startups',
    country: Country.USA,
    defaultCurrency: Currency.USD,
    defaultTargetMarginPercent: 30,
    defaultMinimumMarginPercent: 20,
    contactName: 'Jane Smith',
    contactEmail: 'jane.smith@techstart.com',
    contactPhone: '+1 415 555-0200',
    businessUnit: { id: '2', name: 'Energy Canada', code: 'BU-2' },
    businessUnitCode: 'BU-2',
    createdAt: new Date('2021-03-20').toISOString(),
    updatedAt: new Date('2021-03-20').toISOString(),
  },
  {
    id: '3',
    name: 'Global Solutions SARL',
    code: 'GLOBAL',
    sectorId: 3,
    sectorName: 'Conseil',
    country: Country.FRANCE,
    defaultCurrency: Currency.EUR,
    defaultTargetMarginPercent: 28,
    defaultMinimumMarginPercent: 18,
    contactName: 'Pierre Dubois',
    contactEmail: 'p.dubois@globalsolutions.fr',
    contactPhone: '+33 1 42 00 00 00',
    businessUnit: { id: '3', name: 'Telecom Europe', code: 'BU-3' },
    businessUnitCode: 'BU-3',
    createdAt: new Date('2019-06-10').toISOString(),
    updatedAt: new Date('2019-06-10').toISOString(),
  },
];

let mockProjects: Project[] = [
  {
    id: '1',
    name: 'Migration Cloud AWS',
    code: 'ACME-CLOUD-2024',
    clientId: '1',
    type: ProjectType.TIME_AND_MATERIALS,
    responsibleName: 'Marie Tremblay',
    currency: Currency.CAD,
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    targetMargin: 25,
    minMargin: 15,
    status: ProjectStatus.ACTIVE,
    notes: 'Migration complète vers AWS avec support 24/7',
    businessUnit: { id: '1', name: 'Banking France', code: 'BU-1' },
    businessUnitCode: 'BU-1',
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: '2',
    name: 'Application Mobile',
    code: 'TECH-MOBILE',
    clientId: '2',
    type: ProjectType.FIXED_PRICE,
    responsibleName: 'Alexandre Roy',
    currency: Currency.USD,
    startDate: '2024-03-01',
    endDate: '2024-09-30',
    targetMargin: 30,
    minMargin: 20,
    status: ProjectStatus.ACTIVE,
    notes: 'Développement iOS et Android',
    businessUnit: { id: '2', name: 'Energy Canada', code: 'BU-2' },
    businessUnitCode: 'BU-2',
    createdAt: new Date('2024-02-20').toISOString(),
    updatedAt: new Date('2024-02-20').toISOString(),
  },
  {
    id: '3',
    name: 'Plateforme E-commerce',
    code: 'TECH-ECOM-2024',
    clientId: '2',
    type: ProjectType.TIME_AND_MATERIALS,
    responsibleName: 'Sophie Chen',
    currency: Currency.USD,
    startDate: '2024-04-01',
    endDate: '2024-11-30',
    targetMargin: 28,
    minMargin: 18,
    status: ProjectStatus.ACTIVE,
    notes: 'Marketplace avec intégration payment gateway',
    businessUnit: { id: '2', name: 'Energy Canada', code: 'BU-2' },
    businessUnitCode: 'BU-2',
    createdAt: new Date('2024-03-15').toISOString(),
    updatedAt: new Date('2024-03-15').toISOString(),
  },
  {
    id: '4',
    name: 'Refonte Site Web',
    code: 'ACME-WEB-2024',
    clientId: '1',
    type: ProjectType.FIXED_PRICE,
    responsibleName: 'Thomas Leblanc',
    currency: Currency.CAD,
    startDate: '2024-05-01',
    endDate: '2024-08-31',
    targetMargin: 25,
    minMargin: 15,
    status: ProjectStatus.ACTIVE,
    notes: 'Refonte complète avec React et TypeScript',
    businessUnit: { id: '1', name: 'Banking France', code: 'BU-1' },
    businessUnitCode: 'BU-1',
    createdAt: new Date('2024-04-20').toISOString(),
    updatedAt: new Date('2024-04-20').toISOString(),
  },
  {
    id: '5',
    name: 'Système CRM',
    code: 'GLOBAL-CRM',
    clientId: '3',
    type: ProjectType.TIME_AND_MATERIALS,
    responsibleName: 'Emma Dubois',
    currency: Currency.EUR,
    startDate: '2024-02-15',
    endDate: '2024-10-31',
    targetMargin: 28,
    minMargin: 18,
    status: ProjectStatus.ACTIVE,
    notes: 'CRM personnalisé avec intégration Salesforce',
    businessUnit: { id: '3', name: 'Telecom Europe', code: 'BU-3' },
    businessUnitCode: 'BU-3',
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-01').toISOString(),
  },
];

// API functions for Clients
export const clientApi = {
  // Get all clients (with optional BU filter)
  getAll: async (buId?: string): Promise<Client[]> => {
    await delay(300);
    if (buId) {
      return mockClients.filter(client => client.businessUnit.id === buId);
    }
    return [...mockClients];
  },

  // Search clients by name
  search: async (query: string): Promise<Client[]> => {
    await delay(200);
    const lowerQuery = query.toLowerCase();
    return mockClients.filter(client => 
      client.name.toLowerCase().includes(lowerQuery) ||
      client.code?.toLowerCase().includes(lowerQuery)
    );
  },

  // Get client by ID
  getById: async (id: string): Promise<Client | undefined> => {
    await delay(200);
    return mockClients.find(client => client.id === id);
  },

  // Create new client
  create: async (input: CreateClientInput): Promise<Client> => {
    await delay(500);
    
    // Check if code already exists
    if (input.code && mockClients.some(c => c.code === input.code)) {
      throw new Error('Un client avec ce code existe déjà');
    }

    // Get the business unit
    const bu = mockBusinessUnits.find(b => b.id === input.businessUnitId);
    if (!bu) {
      throw new Error('Business Unit introuvable');
    }

    const newClient: Client = {
      id: String(Date.now()),
      name: input.name,
      code: input.code,
      sectorId: input.sectorId,
      country: input.country as Country,
      defaultCurrency: input.defaultCurrency,
      defaultTargetMarginPercent: input.defaultTargetMarginPercent,
      defaultMinimumMarginPercent: input.defaultMinimumMarginPercent,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      notes: input.notes,
      businessUnit: { id: bu.id, name: bu.name, code: bu.code },
      businessUnitCode: bu.code,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockClients.push(newClient);
    return newClient;
  },
};

// API functions for Projects
export const projectApi = {
  // Get all projects (with optional BU filter)
  getAll: async (buId?: string): Promise<Project[]> => {
    await delay(400);
    let projects = mockProjects;
    
    if (buId) {
      projects = projects.filter(project => project.businessUnit.id === buId);
    }
    
    // Enrich projects with client data
    return projects.map(project => ({
      ...project,
      client: mockClients.find(c => c.id === project.clientId),
    }));
  },

  // Get project by ID
  getById: async (id: string): Promise<Project | undefined> => {
    await delay(200);
    const project = mockProjects.find(p => p.id === id);
    if (!project) return undefined;

    return {
      ...project,
      client: mockClients.find(c => c.id === project.clientId),
    };
  },

  // Create new project
  create: async (input: CreateProjectInput): Promise<Project> => {
    await delay(500);

    // Check if code already exists
    if (input.code && mockProjects.some(p => p.code === input.code)) {
      throw new Error('Un projet avec ce code existe déjà');
    }

    // Verify client exists
    const client = mockClients.find(c => c.id === input.clientId);
    if (!client) {
      throw new Error('Client introuvable');
    }

    // Get the business unit (from input or derive from client)
    let businessUnit = client.businessUnit;
    if (input.businessUnitId) {
      const bu = mockBusinessUnits.find(b => b.id === input.businessUnitId);
      if (!bu) {
        throw new Error('Business Unit introuvable');
      }
      // Validate consistency with client BU
      if (bu.id !== client.businessUnit.id) {
        throw new Error('La Business Unit du projet doit correspondre à celle du client');
      }
      businessUnit = { id: bu.id, name: bu.name, code: bu.code };
    }

    const newProject: Project = {
      id: String(Date.now()),
      name: input.name,
      code: input.code,
      clientId: input.clientId,
      type: input.type,
      responsibleId: input.responsibleId,
      currency: input.currency,
      startDate: input.startDate,
      endDate: input.endDate,
      targetMargin: input.targetMargin,
      minMargin: input.minMargin,
      notes: input.notes,
      businessUnit,
      businessUnitCode: businessUnit.code,
      status: 'En construction' as ProjectStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      client,
    };

    mockProjects.push(newProject);
    return newProject;
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
    await delay(400);

    const projectIndex = mockProjects.findIndex(p => p.id === id);
    if (projectIndex === -1) {
      throw new Error('Projet introuvable');
    }

    // Check code uniqueness if updating code
    if (updates.code && updates.code !== mockProjects[projectIndex].code) {
      if (mockProjects.some(p => p.code === updates.code && p.id !== id)) {
        throw new Error('Un projet avec ce code existe déjà');
      }
    }

    const updatedProject = {
      ...mockProjects[projectIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    mockProjects[projectIndex] = updatedProject;

    // Enrich with client data
    return {
      ...updatedProject,
      client: mockClients.find(c => c.id === updatedProject.clientId),
    };
  },
};

// API functions for Business Units
export const businessUnitApi = {
  // Get all business units
  getAll: async (): Promise<BusinessUnit[]> => {
    await delay(300);
    return [...mockBusinessUnits];
  },

  // Get business unit by ID
  getById: async (id: string): Promise<BusinessUnit | undefined> => {
    await delay(200);
    return mockBusinessUnits.find(bu => bu.id === id);
  },

  // Create new business unit
  create: async (input: CreateBusinessUnitInput): Promise<BusinessUnit> => {
    await delay(500);
    
    // Check if code already exists
    if (mockBusinessUnits.some(bu => bu.code === input.code)) {
      throw new Error('Une business unit avec ce code existe déjà');
    }

    const newBusinessUnit: BusinessUnit = {
      id: String(Date.now()),
      ...input,
      businessUnitCode: input.code,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockBusinessUnits.push(newBusinessUnit);
    return newBusinessUnit;
  },

  // Update business unit
  update: async (id: string, input: CreateBusinessUnitInput): Promise<BusinessUnit> => {
    await delay(500);
    
    const index = mockBusinessUnits.findIndex(bu => bu.id === id);
    if (index === -1) {
      throw new Error('Business unit non trouvée');
    }

    // Check if code already exists for another BU
    if (mockBusinessUnits.some(bu => bu.code === input.code && bu.id !== id)) {
      throw new Error('Une business unit avec ce code existe déjà');
    }

    const updatedBusinessUnit: BusinessUnit = {
      ...mockBusinessUnits[index],
      ...input,
      businessUnitCode: input.code,
      updatedAt: new Date().toISOString(),
    };

    mockBusinessUnits[index] = updatedBusinessUnit;
    return updatedBusinessUnit;
  },

  // Delete business unit
  delete: async (id: string): Promise<void> => {
    await delay(300);
    
    const index = mockBusinessUnits.findIndex(bu => bu.id === id);
    if (index === -1) {
      throw new Error('Business unit non trouvée');
    }

    mockBusinessUnits.splice(index, 1);
  },
};

// Mock storage for Project Change Requests
let mockProjectChangeRequests: import('../types').ProjectChangeRequest[] = [];

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
    await delay(500);

    const project = mockProjects.find(p => p.id === projectId);
    if (!project) {
      throw new Error('Projet introuvable');
    }

    const changeRequest: import('../types').ProjectChangeRequest = {
      id: `change-req-${Date.now()}`,
      projectId,
      previousValues,
      newValues,
      requestedByUserId: `user-${Date.now()}`,
      requestedByEmail: userEmail,
      requestedAt: new Date().toISOString(),
      status: 'PENDING_CFO_APPROVAL',
      approverEmail,
    };

    mockProjectChangeRequests.push(changeRequest);
    return changeRequest;
  },

  // Get all change requests
  getAll: async (): Promise<import('../types').ProjectChangeRequest[]> => {
    await delay(300);
    return [...mockProjectChangeRequests];
  },

  // Get change requests by project ID
  getByProjectId: async (projectId: string): Promise<import('../types').ProjectChangeRequest[]> => {
    await delay(300);
    return mockProjectChangeRequests.filter(req => req.projectId === projectId);
  },

  // Approve change request (Admin/CFO only)
  approve: async (requestId: string): Promise<void> => {
    await delay(500);
    
    const request = mockProjectChangeRequests.find(req => req.id === requestId);
    if (!request) {
      throw new Error('Demande de modification introuvable');
    }

    // Apply changes to project
    const projectIndex = mockProjects.findIndex(p => p.id === request.projectId);
    if (projectIndex !== -1) {
      mockProjects[projectIndex] = {
        ...mockProjects[projectIndex],
        ...request.newValues,
        updatedAt: new Date().toISOString(),
      };
    }

    request.status = 'APPROVED';
  },

  // Reject change request
  reject: async (requestId: string): Promise<void> => {
    await delay(300);
    
    const request = mockProjectChangeRequests.find(req => req.id === requestId);
    if (!request) {
      throw new Error('Demande de modification introuvable');
    }

    request.status = 'REJECTED';
  },
};

// Margin simulation API
export const marginApi = {
  // Simulate margin calculation
  simulate: async (request: MarginSimulationRequest): Promise<MarginSimulationResponse> => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001';
    
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
import type { MarketTrendsRequest, MarketTrendsResponse } from '../types/marketTrends';

export const marketTrendsApi = {
  // Fetch market trends analysis
  analyze: async (request: MarketTrendsRequest): Promise<MarketTrendsResponse> => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001';
    
    return fetchWithAuth<MarketTrendsResponse>(`${API_BASE_URL}/api/market-trends`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  },
};
