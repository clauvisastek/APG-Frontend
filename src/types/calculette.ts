export type ResourceType = 'SALARIE' | 'PIGISTE';
export type Seniorite = 'Junior' | 'Intermédiaire' | 'Sénior' | 'Expert';

export interface CalculetteFormData {
  resourceType: ResourceType;
  salaireAnnuel?: number;
  tarifHoraire?: number;
  heures: number;
  clientId: string;
  clientName?: string;
  seniorite?: Seniorite;
  vendantClientProposeHoraire: number;
  businessUnitCode?: string;
  projectId?: string;
}

export interface CalculetteResults {
  coutantMoyenHoraire: number;
  vendantCibleHoraire: number;
  margeCible: number;
  margeFinale: number;
  margeParHeure: number;
  margeEcart: number;
}

export interface CalculetteScenario {
  id: string;
  date: string;
  resourceType: ResourceType;
  clientName: string;
  salaireOrTarif: number;
  vendantPropose: number;
  margeObtenue: number;
  formData: CalculetteFormData;
  results: CalculetteResults;
}

export interface GlobalCostsConfig {
  chargesPatronales: number; // en %
  coutsIndirects: number; // montant fixe annuel
  heuresFacturablesParAn: number;
  // Alias pour compatibilité avec la demande
  chargesPatronalesPourcentage?: number;
  coutsIndirectsAnnuels?: number;
  heuresFacturablesAnnuelles?: number;
}

export interface ClientMarginConfig {
  clientId: string;
  clientName: string;
  margeCible: number;
  vendantCibleHoraire?: number;
}

export interface CalculetteConfig {
  globalCosts: GlobalCostsConfig;
  clientConfigs: ClientMarginConfig[];
}

export interface ImportResult {
  success: boolean;
  linesImported: number;
  errors?: string[];
  message: string;
}
