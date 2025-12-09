import type { ImportResult } from '../types/import';

// TODO: Utiliser pour les vrais appels API
// @ts-expect-error - API_BASE_URL sera utilisé lors de l'implémentation backend réelle
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Simulated delay for API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Service générique pour l'import de données (CSV/Excel)
 */
export const importApi = {
  /**
   * Import de projets
   */
  async importProjects(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      // TODO: Remplacer par un vrai appel API
      await delay(1500);
      
      // Mock: simuler un import réussi
      return {
        success: true,
        importedCount: 42,
        errors: [],
        message: 'Import des projets réussi (MOCK)',
      };

      /*
      const response = await fetch(`${API_BASE_URL}/api/projects/import`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      return data;
      */
    } catch (error: any) {
      console.error('Erreur lors de l\'import des projets:', error);
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
      // TODO: Remplacer par un vrai appel API
      await delay(1500);
      
      // Mock: simuler un import réussi
      return {
        success: true,
        importedCount: 28,
        errors: [],
        message: 'Import des clients réussi (MOCK)',
      };

      /*
      const response = await fetch(`${API_BASE_URL}/api/clients/import`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      return data;
      */
    } catch (error: any) {
      console.error('Erreur lors de l\'import des clients:', error);
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
      // TODO: Remplacer par un vrai appel API
      await delay(1500);
      
      // Mock: simuler un import réussi
      return {
        success: true,
        importedCount: 35,
        errors: [],
        message: 'Import des assistances techniques réussi (MOCK)',
      };

      /*
      const response = await fetch(`${API_BASE_URL}/api/technical-assignments/import`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      return data;
      */
    } catch (error: any) {
      console.error('Erreur lors de l\'import des AT:', error);
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
      // TODO: Remplacer par un vrai appel API
      await delay(1500);
      
      // Mock: simuler un import réussi
      return {
        success: true,
        importedCount: 67,
        errors: [],
        message: 'Import des ressources réussi (MOCK)',
      };

      /*
      const response = await fetch(`${API_BASE_URL}/api/resources/import`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      return data;
      */
    } catch (error: any) {
      console.error('Erreur lors de l\'import des ressources:', error);
      return {
        success: false,
        importedCount: 0,
        errors: [],
        message: error.message || 'Erreur lors de l\'import des ressources',
      };
    }
  },

  /**
   * Télécharger un modèle d'import (non utilisé car géré côté client dans ImportDialog)
   */
  async downloadTemplate(entityType: 'projects' | 'clients' | 'technical-assignments' | 'resources'): Promise<void> {
    try {
      // TODO: Implémenter si nécessaire côté backend
      await delay(500);
      console.log(`Téléchargement du modèle pour ${entityType}`);
    } catch (error) {
      console.error(`Erreur lors du téléchargement du modèle ${entityType}:`, error);
      throw error;
    }
  },
};
