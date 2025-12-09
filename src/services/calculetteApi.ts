import type {
  CalculetteFormData,
  CalculetteResults,
  CalculetteConfig,
  GlobalCostsConfig,
  ClientMarginConfig,
  CalculetteScenario,
  ImportResult,
} from '../types/calculette';

// TODO: Remplacer par de vrais appels API une fois le backend implémenté
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Mock data pour le développement initial
let mockConfig: CalculetteConfig = {
  globalCosts: {
    chargesPatronales: 65,
    coutsIndirects: 5000,
    heuresFacturablesParAn: 1600,
  },
  clientConfigs: [
    {
      clientId: '1',
      clientName: 'Banque Nationale',
      margeCible: 25,
      vendantCibleHoraire: 120,
    },
    {
      clientId: '2',
      clientName: 'Desjardins',
      margeCible: 30,
      vendantCibleHoraire: 130,
    },
    {
      clientId: '3',
      clientName: 'Hydro-Québec',
      margeCible: 22,
      vendantCibleHoraire: 110,
    },
  ],
};

let mockScenarios: CalculetteScenario[] = [];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calcule le coûtant moyen horaire pour un salarié
 */
function calculateCoutantSalarie(
  salaireAnnuel: number,
  globalCosts: GlobalCostsConfig
): number {
  const chargesPatronalesAmount = salaireAnnuel * (globalCosts.chargesPatronales / 100);
  const coutTotal = salaireAnnuel + chargesPatronalesAmount + globalCosts.coutsIndirects;
  return coutTotal / globalCosts.heuresFacturablesParAn;
}

/**
 * Calcule la marge
 */
function calculateMarge(
  coutantHoraire: number,
  vendantHoraire: number,
  heures: number
): { margeFinale: number; margeParHeure: number } {
  const coutTotal = coutantHoraire * heures;
  const revenueTotal = vendantHoraire * heures;
  const margeFinale = revenueTotal > 0 ? ((revenueTotal - coutTotal) / revenueTotal) * 100 : 0;
  const margeParHeure = vendantHoraire - coutantHoraire;
  
  return { margeFinale, margeParHeure };
}

export const calculetteApi = {
  /**
   * Simulate margin calculation
   */
  async simulate(data: CalculetteFormData): Promise<CalculetteResults> {
    // TODO: Remplacer par un vrai appel API
    // const response = await fetch(`${API_BASE_URL}/calculette/simulate`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
    // return response.json();

    await delay(500); // Simule latence réseau

    const config = mockConfig;
    const clientConfig = config.clientConfigs.find(c => c.clientId === data.clientId);

    let coutantMoyenHoraire: number;

    if (data.resourceType === 'SALARIE' && data.salaireAnnuel) {
      coutantMoyenHoraire = calculateCoutantSalarie(data.salaireAnnuel, config.globalCosts);
    } else if (data.resourceType === 'PIGISTE' && data.tarifHoraire) {
      // Pour un pigiste, le coûtant = tarif horaire (simplifié)
      coutantMoyenHoraire = data.tarifHoraire;
    } else {
      throw new Error('Données de ressource manquantes');
    }

    const vendantCibleHoraire = clientConfig?.vendantCibleHoraire || 100;
    const margeCible = clientConfig?.margeCible || 25;

    const { margeFinale, margeParHeure } = calculateMarge(
      coutantMoyenHoraire,
      data.vendantClientProposeHoraire,
      data.heures
    );

    const margeEcart = margeFinale - margeCible;

    return {
      coutantMoyenHoraire,
      vendantCibleHoraire,
      margeCible,
      margeFinale,
      margeParHeure,
      margeEcart,
    };
  },

  /**
   * Get configuration (global + clients)
   */
  async getConfig(): Promise<CalculetteConfig> {
    // TODO: Remplacer par un vrai appel API
    // const response = await fetch(`${API_BASE_URL}/calculette/config`);
    // return response.json();

    await delay(300);
    return mockConfig;
  },

  /**
   * Update global costs configuration (CFO only)
   */
  async updateGlobalCosts(globalCosts: GlobalCostsConfig): Promise<void> {
    // TODO: Remplacer par un vrai appel API
    // await fetch(`${API_BASE_URL}/calculette/config/global-costs`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(globalCosts),
    // });

    await delay(500);
    mockConfig.globalCosts = globalCosts;
  },

  /**
   * Update client margin configuration (CFO only)
   */
  async updateClientConfig(clientId: string, config: Partial<ClientMarginConfig>): Promise<void> {
    // TODO: Remplacer par un vrai appel API
    // await fetch(`${API_BASE_URL}/calculette/config/clients/${clientId}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(config),
    // });

    await delay(500);
    const index = mockConfig.clientConfigs.findIndex(c => c.clientId === clientId);
    if (index !== -1) {
      mockConfig.clientConfigs[index] = {
        ...mockConfig.clientConfigs[index],
        ...config,
      };
    }
  },

  /**
   * Save a scenario
   */
  async saveScenario(
    formData: CalculetteFormData,
    results: CalculetteResults
  ): Promise<CalculetteScenario> {
    // TODO: Remplacer par un vrai appel API
    await delay(300);

    const scenario: CalculetteScenario = {
      id: `scenario-${Date.now()}`,
      date: new Date().toISOString(),
      resourceType: formData.resourceType,
      clientName: formData.clientName || '',
      salaireOrTarif: formData.salaireAnnuel || formData.tarifHoraire || 0,
      vendantPropose: formData.vendantClientProposeHoraire,
      margeObtenue: results.margeFinale,
      formData,
      results,
    };

    mockScenarios.unshift(scenario);
    return scenario;
  },

  /**
   * Get saved scenarios
   */
  async getScenarios(): Promise<CalculetteScenario[]> {
    // TODO: Remplacer par un vrai appel API
    await delay(300);
    return mockScenarios;
  },

  /**
   * Delete a scenario
   */
  async deleteScenario(scenarioId: string): Promise<void> {
    // TODO: Remplacer par un vrai appel API
    await delay(300);
    mockScenarios = mockScenarios.filter(s => s.id !== scenarioId);
  },

  /**
   * Get clients list (CFO only)
   */
  async getClients(): Promise<ClientMarginConfig[]> {
    // TODO: Remplacer par un vrai appel API
    // const response = await fetch(`${API_BASE_URL}/calculette/config/clients`);
    // return response.json();

    await delay(300);
    return mockConfig.clientConfigs;
  },

  /**
   * Import data from Excel/CSV file (CFO only)
   */
  async importFile(file: File): Promise<ImportResult> {
    // TODO: Remplacer par un vrai appel API avec FormData
    // const formData = new FormData();
    // formData.append('file', file);
    // const response = await fetch(`${API_BASE_URL}/calculette/import`, {
    //   method: 'POST',
    //   body: formData,
    // });
    // return response.json();

    await delay(2000); // Simule le traitement du fichier

    // Mock: simulation d'un import réussi
    const linesImported = Math.floor(Math.random() * 50) + 10;
    
    // Optionnel: simuler une erreur aléatoire
    if (file.name.includes('error')) {
      return {
        success: false,
        linesImported: 0,
        errors: ['Format de fichier invalide', 'Colonne "client_id" manquante'],
        message: 'Erreur lors de l\'import du fichier',
      };
    }

    // Simulation: mise à jour de quelques configs clients avec des données aléatoires
    mockConfig.clientConfigs.forEach((client) => {
      if (Math.random() > 0.5) {
        client.margeCible = 20 + Math.random() * 15; // Entre 20 et 35%
        client.vendantCibleHoraire = 100 + Math.random() * 50; // Entre 100 et 150 $/h
      }
    });

    return {
      success: true,
      linesImported,
      message: `${linesImported} lignes importées avec succès`,
    };
  },
};
