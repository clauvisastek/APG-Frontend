import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'react-toastify';
import { CalculetteForm } from '../components/CalculetteForm';
import { CalculetteResultsDisplay } from '../components/CalculetteResults';
import { GlobalSalarySettingsSection } from '../components/GlobalSalarySettingsSection';
import { CalculetteCfoImport } from '../components/CalculetteCfoImport';
import { ScenarioHistory } from '../components/ScenarioHistory';
import { calculetteApi } from '../services/calculetteApi';
import { marginApi, marketTrendsApi } from '../services/api';
import { clientsApi, type ClientDto } from '../services/clientsApi';
import { getRolesArray } from '../utils/roleHelpers';
import type { CalculetteFormData, CalculetteScenario } from '../types/calculette';
import type { MarginSimulationResponse } from '../types';
import type { MarketTrendsResponse } from '../types/marketTrends';
import './CalculettePage.css';

export const CalculettePage = () => {
  const { user } = useAuth0();
  const userRoles = getRolesArray(user);
  // Match backend authorization: "Admin" or "CFO" (case-sensitive)
  const canManageCfoSettings = userRoles.includes('Admin') || userRoles.includes('CFO') || 
                                userRoles.includes('admin') || userRoles.includes('cfo');
  
  // Debug : Afficher les rôles dans la console
  console.log('🔍 Rôles utilisateur:', userRoles);
  console.log('🔐 Mode CFO actif:', canManageCfoSettings);

  // State
  const [results, setResults] = useState<MarginSimulationResponse | null>(null);
  const [scenarios, setScenarios] = useState<CalculetteScenario[]>([]);
  const [clients, setClients] = useState<ClientDto[]>([]);
  
  // Loading states
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);

  // Current form data (pour sauvegarde de scénario - désactivé temporairement)
  // const [currentFormData, setCurrentFormData] = useState<CalculetteFormData | null>(null);
  const [lastFormData, setLastFormData] = useState<CalculetteFormData | null>(null);

  // Market Trends state
  const [marketTrends, setMarketTrends] = useState<MarketTrendsResponse | null>(null);
  const [isLoadingMarketTrends, setIsLoadingMarketTrends] = useState(false);
  const [marketTrendsError, setMarketTrendsError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoadingClients(true);
      
      // Load clients and scenarios
      const [clientsData, scenariosData] = await Promise.all([
        clientsApi.getAll(),
        calculetteApi.getScenarios(),
      ]);
      
      setClients(clientsData);
      setScenarios(scenariosData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoadingClients(false);
    }
  };

  const handleCalculate = async (formData: CalculetteFormData) => {
    try {
      // Find the selected client for validation
      const client = clients.find(c => c.id.toString() === formData.clientId);
      
      // Validate client financial configuration
      if (client && !client.isFinancialConfigComplete) {
        toast.error(
          'Les paramètres financiers de ce client ne sont pas entièrement configurés. Merci de demander au CFO de renseigner la marge cible, la marge minimale, la remise, les jours de vacances forcés et le vendant cible avant de lancer une simulation.',
          { autoClose: 8000 }
        );
        return;
      }
      
      setIsCalculating(true);
      // setCurrentFormData(formData); // Désactivé temporairement
      setLastFormData(formData); // Track for market trends
      
      // Reset market trends when new calculation is made
      setMarketTrends(null);
      setMarketTrendsError(null);
      
      // Map form data to MarginSimulationRequest
      const request = {
        resourceType: (formData.resourceType === 'SALARIE' ? 'Salarie' : 'Pigiste') as 'Salarie' | 'Pigiste',
        annualGrossSalary: formData.salaireAnnuel,
        clientId: parseInt(formData.clientId),
        proposedBillRate: formData.vendantClientProposeHoraire,
        plannedHours: formData.heures,
        seniority: formData.seniorite,
      };
      
      const calculationResults = await marginApi.simulate(request);
      setResults(calculationResults);
      
      toast.success('Calcul effectué avec succès');
    } catch (error: any) {
      console.error('Erreur lors du calcul:', error);
      
      // Display error message from backend
      const errorMessage = error?.message || 'Erreur lors du calcul de la marge';
      toast.error(errorMessage, { autoClose: 8000 });
    } finally {
      setIsCalculating(false);
    }
  };

  /* Fonction de sauvegarde de scénario - désactivée temporairement
  const handleSaveScenario = async () => {
    if (!currentFormData || !results) {
      toast.warning('Aucun calcul à sauvegarder');
      return;
    }

    // TODO: Implement scenario saving with new API structure
    toast.info('La sauvegarde de scénarios sera implémentée prochainement');
    return;
  };
  */

  const handleDeleteScenario = async (_scenarioId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce scénario ?')) {
      return;
    }

    // TODO: Implement scenario deletion
    toast.info('La suppression de scénarios sera implémentée prochainement');
    return;

    /*
    try {
      await calculetteApi.deleteScenario(scenarioId);
      setScenarios(prev => prev.filter(s => s.id !== scenarioId));
      toast.success('Scénario supprimé');
    } catch (error) {
      console.error('Erreur lors de la suppression du scénario:', error);
      toast.error('Erreur lors de la suppression');
    }
    */
  };

  const handleLoadScenario = (_scenario: CalculetteScenario) => {
    // TODO: Implement scenario loading with new API structure
    toast.info('Le chargement de scénarios sera implémenté prochainement');
    return;

    /*
    // setCurrentFormData(scenario.formData);
    setResults(scenario.results);
    toast.info('Scénario rechargé');
    */
  };

  const handleImportFile = async (file: File) => {
    const result = await calculetteApi.importFile(file);
    if (result.success) {
      await loadInitialData(); // Refresh data after successful import
    }
    return result;
  };

  const handleFetchMarketTrends = async () => {
    if (!lastFormData || !results) {
      toast.warning('Veuillez d\'abord effectuer un calcul de marge');
      return;
    }

    try {
      setIsLoadingMarketTrends(true);
      setMarketTrendsError(null);

      // Find the selected client
      const client = clients.find(c => c.id.toString() === lastFormData.clientId);
      
      // Determine role based on context - use a generic role for now
      // In a real app, this could come from a role/position field in the form
      const role = 'Developer'; // Default role
      
      // Map resource type
      const resourceType = lastFormData.resourceType === 'SALARIE' ? 'Employee' : 'Freelancer';
      
      // Prepare market trends request
      const request = {
        role,
        seniority: lastFormData.seniorite || 'Intermédiaire',
        resourceType: resourceType as 'Employee' | 'Freelancer',
        location: client?.countryName || 'Canada',
        currency: client?.currencyCode || 'CAD',
        proposedAnnualSalary: lastFormData.resourceType === 'SALARIE' ? lastFormData.salaireAnnuel : null,
        proposedBillRate: lastFormData.vendantClientProposeHoraire,
        clientName: client?.name || lastFormData.clientName,
        businessUnit: lastFormData.businessUnitCode,
      };

      const trendsData = await marketTrendsApi.analyze(request);
      setMarketTrends(trendsData);
      
      toast.success('Analyse des tendances marché terminée');
    } catch (error: any) {
      console.error('Erreur lors de l\'analyse des tendances marché:', error);
      
      const errorMessage = error?.message || 'Impossible de récupérer les tendances marché pour le moment';
      setMarketTrendsError(errorMessage);
      toast.error('Erreur lors de l\'analyse des tendances marché', { autoClose: 5000 });
    } finally {
      setIsLoadingMarketTrends(false);
    }
  };

  if (isLoadingClients) {
    return (
      <div className="astek-page">
        <div className="astek-loading-container">
          <div className="astek-spinner"></div>
          <p>Chargement de la calculette...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="astek-page">
      {/* Header */}
      <div className="astek-page-header">
        <div>
          <h1 className="astek-page-title">Calculette de marge</h1>
          <p className="astek-page-subtitle">
            Simulez vos marges par ressource et optimisez vos vendants clients
          </p>
        </div>
      </div>

      {/* Formulaire de calcul */}
      <CalculetteForm
        onSubmit={handleCalculate}
        loading={isCalculating}
        clients={clients.map(c => ({ 
          id: c.id.toString(), 
          name: c.name,
          isFinancialConfigComplete: c.isFinancialConfigComplete 
        }))}
      />

      {/* Résultats - UI moderne */}
      {results && (
        <CalculetteResultsDisplay
          results={results}
          onSaveScenario={undefined}
          savingScenario={false}
          onFetchMarketTrends={handleFetchMarketTrends}
          marketTrends={marketTrends}
          isLoadingMarketTrends={isLoadingMarketTrends}
          marketTrendsError={marketTrendsError}
        />
      )}

      {/* Résultats - Autres versions commentées */}
      {/* {results && (
        <SimulationResultsSection 
          simulationResult={transformMarginResponse(results)} 
        />
      )} */}

      {/* Historique des scénarios */}
      {scenarios.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <ScenarioHistory
            scenarios={scenarios}
            onDeleteScenario={handleDeleteScenario}
            onLoadScenario={handleLoadScenario}
          />
        </div>
      )}

      {/* Configuration CFO */}
      {canManageCfoSettings && (
        <>
          <div className="calculette-cfo-divider">
            <div className="calculette-cfo-divider-line"></div>
            <div className="calculette-cfo-divider-badge">
              🔐 Zone réservée CFO
            </div>
            <div className="calculette-cfo-divider-line"></div>
          </div>

          <div className="calculette-cfo-alert">
            <strong>Paramètres financiers</strong>
            <p>
              Les sections ci-dessous permettent de configurer les paramètres financiers globaux
              et d'importer des données historiques. Les paramètres par client se configurent
              directement dans la page <strong>Clients</strong>.
            </p>
          </div>

          {/* Paramètres globaux salariés */}
          <GlobalSalarySettingsSection />

          {/* Import Excel/CSV */}
          <div style={{ marginTop: '24px' }}>
            <CalculetteCfoImport
              onImport={handleImportFile}
              onSuccess={loadInitialData}
            />
          </div>
        </>
      )}
    </div>
  );
};
