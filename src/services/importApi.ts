import type { ImportResult } from '../types/import';

// Simulated delay for API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Service générique pour l'import de données (CSV/Excel)
 * TODO: Implémenter les vrais appels API
 */
export const importApi = {
  /**
   * Import de projets
   */
  async importProjects(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await delay(1500);
      
      return {
        success: true,
        importedCount: 42,
        errors: [],
        message: 'Import des projets réussi (MOCK)',
      };
    } catch (error: any) {
      return {
        success: false,
        importedCount: 0,
        errors: [],
        message: error.message || 'Erreur lors de l\'import des projets',
      };
    }
  },

  /**
   * Import de clients
   */
  async importClients(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await delay(1500);
      
      return {
        success: true,
        importedCount: 28,
        errors: [],
        message: 'Import des clients réussi (MOCK)',
      };
    } catch (error: any) {
      return {
        success: false,
        importedCount: 0,
        errors: [],
        message: error.message || 'Erreur lors de l\'import des clients',
      };
    }
  },

  /**
   * Import d'assistances techniques
   */
  async importTechnicalAssignments(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await delay(1500);
      
      return {
        success: true,
        importedCount: 35,
        errors: [],
        message: 'Import des assistances techniques réussi (MOCK)',
      };
    } catch (error: any) {
      return {
        success: false,
        importedCount: 0,
        errors: [],
        message: error.message || 'Erreur lors de l\'import des AT',
      };
    }
  },

  /**
   * Import de ressources
   */
  async importResources(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await delay(1500);
      
      return {
        success: true,
        importedCount: 67,
        errors: [],
        message: 'Import des ressources réussi (MOCK)',
      };
    } catch (error: any) {
      return {
        success: false,
        importedCount: 0,
        errors: [],
        message: error.message || 'Erreur lors de l\'import des ressources',
      };
    }
  },

  /**
   * Télécharger un modèle d'import
   */
  async downloadTemplate(entityType: 'projects' | 'clients' | 'technical-assignments' | 'resources'): Promise<void> {
    try {
      await delay(500);
    } catch (error) {
      throw error;
    }
  },
};

