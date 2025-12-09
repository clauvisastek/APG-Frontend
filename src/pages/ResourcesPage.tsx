import { useState, useMemo, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useSearchParams } from 'react-router-dom';
import { getRolesArray } from '../utils/roleHelpers';
import { getUserBusinessUnitCodes } from '../utils/roleUtils';
import { resourcesApi } from '../services/resourcesApi';
import type { 
  Resource, 
  ResourceFilters,
  JobType,
  Seniority,
  ResourceStatus 
} from '../types/resource';
import type { ImportConfig } from '../types/import';
import { ResourceDetailsModal } from '../components/ResourceDetailsModal';
import { ImportDialog } from '../components/ImportDialog';
import { importApi } from '../services/importApi';
import './ResourcesPage.css';

export const ResourcesPage = () => {
  const { user } = useAuth0();
  const [searchParams] = useSearchParams();
  const userRoles = getRolesArray(user);
  const userBUCodes = getUserBusinessUnitCodes(user);
  
  // State
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | undefined>();
  
  // Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<ResourceFilters>({});
  const [searchName, setSearchName] = useState('');
  const [filterBU, setFilterBU] = useState(searchParams.get('buCode') || '');
  const [filterJobType, setFilterJobType] = useState<JobType | ''>('');
  const [filterSeniority, setFilterSeniority] = useState<Seniority | ''>('');
  const [filterStatus, setFilterStatus] = useState<ResourceStatus | ''>('');
  const [filterClient, setFilterClient] = useState(searchParams.get('clientId') || '');
  
  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Resource>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Load data
  useEffect(() => {
    loadResources();
  }, [filters]);
  
  const loadResources = async () => {
    setIsLoading(true);
    try {
      const data = await resourcesApi.list(filters);
      setResources(data);
    } catch (error) {
      console.error('Erreur lors du chargement des ressources:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter by BU roles
  const filteredResources = useMemo(() => {
    if (userRoles.includes('admin') || userRoles.includes('cfo')) {
      return resources;
    }
    
    return resources.filter(resource => 
      userBUCodes.includes(resource.businessUnitCode)
    );
  }, [resources, userRoles, userBUCodes]);
  
  // Sorting
  const sortedResources = useMemo(() => {
    const sorted = [...filteredResources];
    
    sorted.sort((a, b) => {
      let aVal: string | number | undefined = a[sortField];
      let bVal: string | number | undefined = b[sortField];
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [filteredResources, sortField, sortDirection]);
  
  // Pagination
  const paginatedResources = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return sortedResources.slice(startIndex, endIndex);
  }, [sortedResources, currentPage, rowsPerPage]);
  
  const totalPages = Math.ceil(sortedResources.length / rowsPerPage);
  
  // Handlers
  const handleSearch = () => {
    setFilters({
      name: searchName || undefined,
      businessUnitCode: filterBU || undefined,
      jobType: filterJobType || undefined,
      seniority: filterSeniority || undefined,
      status: filterStatus || undefined,
      currentClient: filterClient || undefined,
    });
    setCurrentPage(1);
  };
  
  const handleReset = () => {
    setSearchName('');
    setFilterBU('');
    setFilterJobType('');
    setFilterSeniority('');
    setFilterStatus('');
    setFilterClient('');
    setFilters({});
    setCurrentPage(1);
  };
  
  const handleSort = (field: keyof Resource) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleRowClick = (resource: Resource) => {
    setSelectedResource(resource);
    setIsDetailsModalOpen(true);
  };

  // Import handlers
  const handleOpenImport = () => {
    setIsImportModalOpen(true);
  };

  const handleCloseImport = () => {
    setIsImportModalOpen(false);
  };

  const handleImportSuccess = async () => {
    // Rafraîchir la liste des ressources
    await loadResources();
  };

  // Configuration pour l'import de ressources
  const resourceImportConfig: ImportConfig = {
    title: 'Import de Ressources',
    description: 'Importez plusieurs ressources simultanément via un fichier CSV ou Excel.',
    templateFileName: 'template_ressources.csv',
    importEndpoint: '/api/resources/import',
    downloadTemplateEndpoint: '/api/resources/import/template',
    columns: [
      { name: 'nomComplet', label: 'Nom Complet', required: true, type: 'string', description: 'Nom et prénom de la ressource', example: 'Marie Martin' },
      { name: 'email', label: 'Email', required: true, type: 'string', description: 'Adresse email professionnelle', example: 'marie.martin@astek.com' },
      { name: 'metier', label: 'Métier / Type', required: true, type: 'enum', description: 'Type de poste', example: 'Développeur', enumValues: ['Développeur', 'QA', 'Analyste d\'affaires', 'Architecte', 'Autres'] },
      { name: 'seniorite', label: 'Séniorité', required: true, type: 'enum', description: 'Niveau de séniorité', example: 'Sénior', enumValues: ['Junior', 'Intermédiaire', 'Sénior', 'Expert'] },
      { name: 'statut', label: 'Statut', required: true, type: 'enum', description: 'Statut d\'affectation', example: 'Actif en mission', enumValues: ['Actif en mission', 'Disponible', 'En intercontrat'] },
      { name: 'tauxJournalier', label: 'Taux Journalier', required: true, type: 'number', description: 'Taux journalier facturé', example: '850' },
      { name: 'coutJournalier', label: 'Coût Journalier', required: true, type: 'number', description: 'Coût journalier de la ressource', example: '550' },
      { name: 'dateDebut', label: 'Date de Début', required: false, type: 'date', description: 'Date de début de mission (si en mission)', example: '2024-01-15' },
      { name: 'dateFin', label: 'Date de Fin', required: false, type: 'date', description: 'Date de fin de mission (si applicable)', example: '2024-12-31' },
      { name: 'clientActuel', label: 'Client Actuel', required: false, type: 'string', description: 'Nom du client actuel (si en mission)', example: 'Banque Nationale' },
      { name: 'businessUnitCode', label: 'Code Business Unit', required: true, type: 'string', description: 'Code de la BU responsable', example: 'BU-1' },
    ],
  };
  
  const getStatusBadgeClass = (status: ResourceStatus) => {
    switch (status) {
      case 'Actif en mission': return 'status-active';
      case 'Disponible': return 'status-available';
      case 'En intercontrat': return 'status-intercontract';
      default: return '';
    }
  };
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-CA');
  };
  
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('fr-CA')} $`;
  };
  
  const getMarginColor = (margin: number) => {
    if (margin >= 35) return '#22c55e';
    if (margin >= 25) return '#eab308';
    return '#ef4444';
  };
  
  const jobTypes: JobType[] = ['Développeur', 'QA', 'Analyste d\'affaires', 'Architecte', 'Autres'];
  const seniorities: Seniority[] = ['Junior', 'Intermédiaire', 'Sénior', 'Expert'];
  const statuses: ResourceStatus[] = ['Actif en mission', 'Disponible', 'En intercontrat'];
  const businessUnits = ['BU-1', 'BU-2', 'BU-3'];
  
  return (
    <div className="astek-page">
      <div className="astek-page-header">
        <div>
          <h1 className="astek-page-title">Ressources</h1>
          <p className="astek-page-subtitle">
            Gestion des ressources et analyse des affectations
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleOpenImport}
            className="astek-btn astek-btn-secondary"
          >
            📥 Importer des ressources
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="astek-card" style={{ marginBottom: '24px' }}>
        <div className="resource-filters">
          <div className="resource-filter-row">
            <div className="astek-form-group">
              <label>Nom</label>
              <input
                type="text"
                className="astek-input"
                placeholder="Rechercher par nom..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            
            <div className="astek-form-group">
              <label>Business Unit</label>
              <select
                className="astek-select"
                value={filterBU}
                onChange={(e) => setFilterBU(e.target.value)}
              >
                <option value="">Toutes</option>
                {businessUnits.map(bu => (
                  <option key={bu} value={bu}>{bu}</option>
                ))}
              </select>
            </div>
            
            <div className="astek-form-group">
              <label>Métier</label>
              <select
                className="astek-select"
                value={filterJobType}
                onChange={(e) => setFilterJobType(e.target.value as JobType | '')}
              >
                <option value="">Tous</option>
                {jobTypes.map(job => (
                  <option key={job} value={job}>{job}</option>
                ))}
              </select>
            </div>
            
            <div className="astek-form-group">
              <label>Séniorité</label>
              <select
                className="astek-select"
                value={filterSeniority}
                onChange={(e) => setFilterSeniority(e.target.value as Seniority | '')}
              >
                <option value="">Toutes</option>
                {seniorities.map(sen => (
                  <option key={sen} value={sen}>{sen}</option>
                ))}
              </select>
            </div>
            
            <div className="astek-form-group">
              <label>Statut</label>
              <select
                className="astek-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ResourceStatus | '')}
              >
                <option value="">Tous</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div className="astek-form-group">
              <label>Client</label>
              <input
                type="text"
                className="astek-input"
                placeholder="Rechercher par client..."
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
              />
            </div>
          </div>
          
          <div className="resource-filter-actions">
            <button onClick={handleSearch} className="astek-btn astek-btn-primary">
              Rechercher
            </button>
            <button onClick={handleReset} className="astek-btn astek-btn-secondary">
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="astek-card">
        {isLoading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div className="astek-spinner" />
          </div>
        ) : filteredResources.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            Aucune ressource trouvée
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="resource-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                      Nom {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('businessUnitCode')} style={{ cursor: 'pointer' }}>
                      BU {sortField === 'businessUnitCode' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('jobType')} style={{ cursor: 'pointer' }}>
                      Métier {sortField === 'jobType' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Séniorité</th>
                    <th>Client actuel</th>
                    <th>Mission actuelle</th>
                    <th>Statut</th>
                    <th>Taux coûtant</th>
                    <th>Taux vendu</th>
                    <th onClick={() => handleSort('marginRate')} style={{ cursor: 'pointer' }}>
                      Marge {sortField === 'marginRate' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Date d'entrée</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedResources.map((resource) => (
                    <tr 
                      key={resource.id}
                      onClick={() => handleRowClick(resource)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td><strong>{resource.name}</strong></td>
                      <td>
                        <span className="resource-badge resource-badge-bu">
                          {resource.businessUnitCode}
                        </span>
                      </td>
                      <td>{resource.jobType}</td>
                      <td>
                        <span className="resource-badge resource-badge-seniority">
                          {resource.seniority}
                        </span>
                      </td>
                      <td>{resource.currentClient || '-'}</td>
                      <td>{resource.currentMission || '-'}</td>
                      <td>
                        <span className={`resource-badge resource-badge-status ${getStatusBadgeClass(resource.status)}`}>
                          {resource.status}
                        </span>
                      </td>
                      <td>{formatCurrency(resource.dailyCostRate)}</td>
                      <td>{formatCurrency(resource.dailySellRate)}</td>
                      <td>
                        <div className="resource-margin">
                          <div className="resource-margin-bar">
                            <div 
                              className="resource-margin-fill"
                              style={{
                                width: `${Math.min(resource.marginRate, 100)}%`,
                                backgroundColor: getMarginColor(resource.marginRate)
                              }}
                            />
                          </div>
                          <span className="resource-margin-text">
                            {resource.marginRate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td>{formatDate(resource.hireDate)}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleRowClick(resource)}
                          className="resource-action-btn"
                          title="Détails"
                        >
                          👁️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="resource-pagination">
              <div className="resource-pagination-info">
                Affichage de {((currentPage - 1) * rowsPerPage) + 1} à{' '}
                {Math.min(currentPage * rowsPerPage, sortedResources.length)} sur{' '}
                {sortedResources.length} ressources
              </div>
              
              <div className="resource-pagination-controls">
                <label>
                  Lignes par page:
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="astek-select"
                    style={{ marginLeft: '8px', width: 'auto' }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </label>
                
                <div className="resource-pagination-buttons">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="astek-btn astek-btn-secondary"
                  >
                    Précédent
                  </button>
                  <span className="resource-pagination-page">
                    Page {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="astek-btn astek-btn-secondary"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Details Modal */}
      {isDetailsModalOpen && selectedResource && (
        <ResourceDetailsModal
          resource={selectedResource}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedResource(undefined);
          }}
          onUpdate={() => loadResources()}
        />
      )}

      {/* Import Modal */}
      <ImportDialog
        config={resourceImportConfig}
        isOpen={isImportModalOpen}
        onClose={handleCloseImport}
        onImport={importApi.importResources}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
};
