import type {
  CalculetteFormData,
  CalculetteResults,
  CalculetteConfig,
  GlobalCostsConfig,
  ClientMarginConfig,
  CalculetteScenario,
  ImportResult,
} from '../types/calculette';

// TODO: Implement real API calls when backend endpoints are available
// All functions currently return empty/default data with console warnings

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
    // TODO: Implement real API call
    // const response = await fetch(`${API_BASE_URL}/calculette/simulate`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
    // return response.json();

    console.warn('calculetteApi.simulate: Using client-side calculation (backend endpoint not implemented)');

    // Basic client-side calculation for demonstration
    const defaultGlobalCosts: GlobalCostsConfig = {
      chargesPatronales: 65,
      coutsIndirects: 5000,
      heuresFacturablesParAn: 1600,
    };

    let coutantMoyenHoraire: number;

    if (data.resourceType === 'SALARIE' && data.salaireAnnuel) {
      coutantMoyenHoraire = calculateCoutantSalarie(data.salaireAnnuel, defaultGlobalCosts);
    } else if (data.resourceType === 'PIGISTE' && data.tarifHoraire) {
      coutantMoyenHoraire = data.tarifHoraire;
    } else {
      throw new Error('Données de ressource manquantes');
    }

    const vendantCibleHoraire = 100; // Default value
    const margeCible = 25; // Default value

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
    // TODO: Implement real API call
    // const response = await fetch(`${API_BASE_URL}/calculette/config`);
    // return response.json();

    console.warn('calculetteApi.getConfig: Backend endpoint not implemented, returning default config');
    
    return {
      globalCosts: {
        chargesPatronales: 65,
        coutsIndirects: 5000,
        heuresFacturablesParAn: 1600,
      },
      clientConfigs: [],
    };
  },

  /**
   * Update global costs configuration (CFO only)
   */
  async updateGlobalCosts(globalCosts: GlobalCostsConfig): Promise<void> {
    // TODO: Implement real API call
    // await fetch(`${API_BASE_URL}/calculette/config/global-costs`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(globalCosts),
    // });

    console.warn('calculetteApi.updateGlobalCosts: Backend endpoint not implemented');
  },

  /**
   * Update client margin configuration (CFO only)
   */
  async updateClientConfig(clientId: string, config: Partial<ClientMarginConfig>): Promise<void> {
    // TODO: Implement real API call
    // await fetch(`${API_BASE_URL}/calculette/config/clients/${clientId}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(config),
    // });

    console.warn('calculetteApi.updateClientConfig: Backend endpoint not implemented');
  },

  /**
   * Save a scenario
   */
  async saveScenario(
    formData: CalculetteFormData,
    results: CalculetteResults
  ): Promise<CalculetteScenario> {
    // TODO: Implement real API call

    console.warn('calculetteApi.saveScenario: Backend endpoint not implemented');

    return {
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
  },

  /**
   * Get saved scenarios
   */
  async getScenarios(): Promise<CalculetteScenario[]> {
    // TODO: Implement real API call

    console.warn('calculetteApi.getScenarios: Backend endpoint not implemented');
    return [];
  },

  /**
   * Delete a scenario
   */
  async deleteScenario(scenarioId: string): Promise<void> {
    // TODO: Implement real API call

    console.warn('calculetteApi.deleteScenario: Backend endpoint not implemented');
  },

  /**
   * Get clients list (CFO only)
   */
  async getClients(): Promise<ClientMarginConfig[]> {
    // TODO: Implement real API call
    // const response = await fetch(`${API_BASE_URL}/calculette/config/clients`);
    // return response.json();

    console.warn('calculetteApi.getClients: Backend endpoint not implemented');
    return [];
  },

  /**
   * Import data from Excel/CSV file (CFO only)
   */
  async importFile(file: File): Promise<ImportResult> {
    // TODO: Implement real API call with FormData
    // const formData = new FormData();
    // formData.append('file', file);
    // const response = await fetch(`${API_BASE_URL}/calculette/import`, {
    //   method: 'POST',
    //   body: formData,
    // });
    // return response.json();

    console.warn('calculetteApi.importFile: Backend endpoint not implemented');

    return {
      success: false,
      linesImported: 0,
      errors: ['API endpoint not implemented yet'],
      message: 'Import functionality not available',
    };
  },
};
