import { useState, useMemo, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { hasManageRights, getRolesArray } from '../utils/roleHelpers';
import { getUserBusinessUnitCodes } from '../utils/roleUtils';
import { technicalAssignmentsApi } from '../services/technicalAssignmentsApi';
import type { 
  TechnicalAssignment, 
  TechnicalAssignmentFilters,
  Seniority,
  AssignmentStatus 
} from '../types/technicalAssignment';
import type { ImportConfig } from '../types/import';
import { TechnicalAssignmentFormModal } from '../components/TechnicalAssignmentFormModal';
import { TechnicalAssignmentDetailsModal } from '../components/TechnicalAssignmentDetailsModal';
import { ImportDialog } from '../components/ImportDialog';
import { importApi } from '../services/importApi';
import './TechnicalAssignmentsPage.css';

export const TechnicalAssignmentsPage = () => {
  const { user } = useAuth0();
  const userRoles = getRolesArray(user);
  const canManage = hasManageRights(userRoles);
  const userBUCodes = getUserBusinessUnitCodes(user);
  
  // State
  const [assignments, setAssignments] = useState<TechnicalAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<TechnicalAssignment | undefined>();
  const [selectedAssignment, setSelectedAssignment] = useState<TechnicalAssignment | undefined>();
  
  // Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<TechnicalAssignmentFilters>({});
  const [searchClient, setSearchClient] = useState('');
  const [filterBU, setFilterBU] = useState('');
  const [filterJobFamily, setFilterJobFamily] = useState('');
  const [filterSeniority, setFilterSeniority] = useState<Seniority | ''>('');
  const [filterStatus, setFilterStatus] = useState<AssignmentStatus | ''>('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Load data
  useEffect(() => {
    loadAssignments();
  }, [filters]);
  
  const loadAssignments = async () => {
    setIsLoading(true);
    try {
      const data = await technicalAssignmentsApi.list(filters);
      setAssignments(data);
    } catch (error) {
      console.error('Erreur lors du chargement des AT:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter by BU roles
  const filteredAssignments = useMemo(() => {
    if (userRoles.includes('admin') || userRoles.includes('cfo')) {
      return assignments;
    }
    
    return assignments.filter(assignment => 
      userBUCodes.includes(assignment.businessUnitCode)
    );
  }, [assignments, userRoles, userBUCodes]);
  
  // Pagination
  const paginatedAssignments = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredAssignments.slice(startIndex, endIndex);
  }, [filteredAssignments, currentPage, rowsPerPage]);
  
  const totalPages = Math.ceil(filteredAssignments.length / rowsPerPage);
  
  // Handlers
  const handleSearch = () => {
    setFilters({
      clientName: searchClient || undefined,
      businessUnitCode: filterBU || undefined,
      jobFamily: filterJobFamily || undefined,
      seniority: filterSeniority || undefined,
      status: filterStatus || undefined,
    });
    setCurrentPage(1);
  };
  
  const handleReset = () => {
    setSearchClient('');
    setFilterBU('');
    setFilterJobFamily('');
    setFilterSeniority('');
    setFilterStatus('');
    setFilters({});
    setCurrentPage(1);
  };
  
  const handleCreate = () => {
    if (!canManage) {
      console.warn('Utilisateur non autorisé à créer des AT');
      return;
    }
    setEditingAssignment(undefined);
    setIsFormModalOpen(true);
  };
  
  const handleEdit = (assignment: TechnicalAssignment) => {
    if (!canManage) {
      console.warn('Utilisateur non autorisé à modifier des AT');
      return;
    }
    setEditingAssignment(assignment);
    setIsFormModalOpen(true);
  };
  
  const handleDelete = async (assignment: TechnicalAssignment) => {
    if (!canManage) {
      console.warn('Utilisateur non autorisé à supprimer des AT');
      return;
    }
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la mission de ${assignment.resourceName} chez ${assignment.clientName} ?`)) {
      try {
        await technicalAssignmentsApi.remove(assignment.id);
        await loadAssignments();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la mission AT');
      }
    }
  };
  
  const handleRowClick = (assignment: TechnicalAssignment) => {
    setSelectedAssignment(assignment);
    setIsDetailsModalOpen(true);
  };
  
  const handleFormSuccess = async () => {
    setIsFormModalOpen(false);
    setEditingAssignment(undefined);
    await loadAssignments();
  };

  // Import handlers
  const handleOpenImport = () => {
    setIsImportModalOpen(true);
  };

  const handleCloseImport = () => {
    setIsImportModalOpen(false);
  };

  const handleImportSuccess = async () => {
    // Rafraîchir la liste des AT
    await loadAssignments();
  };

  // Configuration pour l'import d'assistances techniques
  const atImportConfig: ImportConfig = {
    title: 'Import d\'Assistances Techniques (AT)',
    description: 'Importez plusieurs missions AT simultanément via un fichier CSV ou Excel.',
    templateFileName: 'template_assistances_techniques.csv',
    importEndpoint: '/api/technical-assignments/import',
    downloadTemplateEndpoint: '/api/technical-assignments/import/template',
    columns: [
      { name: 'clientCode', label: 'Code Client', required: true, type: 'string', description: 'Code du client', example: 'CLI-001' },
      { name: 'clientName', label: 'Nom Client', required: true, type: 'string', description: 'Nom du client', example: 'Banque Nationale' },
      { name: 'ressource', label: 'Nom de la Ressource', required: true, type: 'string', description: 'Nom de la ressource affectée', example: 'Marie Martin' },
      { name: 'metier', label: 'Métier / Famille', required: true, type: 'enum', description: 'Famille de métier', example: 'Java', enumValues: ['Java', 'Architecte', 'BI', 'SAP', 'DevOps', '.NET', 'Python', 'React'] },
      { name: 'seniorite', label: 'Séniorité', required: true, type: 'enum', description: 'Niveau de séniorité', example: 'Sénior', enumValues: ['Junior', 'Intermédiaire', 'Sénior', 'Expert'] },
      { name: 'dateDebut', label: 'Date de Début', required: true, type: 'date', description: 'Format: YYYY-MM-DD', example: '2024-01-15' },
      { name: 'dateFin', label: 'Date de Fin', required: false, type: 'date', description: 'Format: YYYY-MM-DD (vide si en cours)', example: '2024-12-31' },
      { name: 'tauxJournalier', label: 'Taux Journalier', required: true, type: 'number', description: 'Taux journalier facturé', example: '850' },
      { name: 'coutJournalier', label: 'Coût Journalier', required: true, type: 'number', description: 'Coût journalier de la ressource', example: '550' },
      { name: 'statut', label: 'Statut', required: false, type: 'enum', description: 'Statut de la mission', example: 'Actif', enumValues: ['Actif', 'En attente', 'Terminé', 'En risque'] },
      { name: 'businessUnitCode', label: 'Code Business Unit', required: true, type: 'string', description: 'Code de la BU responsable', example: 'BU-1' },
    ],
  };
  
  const getStatusBadgeClass = (status: AssignmentStatus) => {
    switch (status) {
      case 'Actif': return 'status-active';
      case 'En attente': return 'status-pending';
      case 'Terminé': return 'status-completed';
      case 'En risque': return 'status-risk';
      default: return '';
    }
  };
  
  const formatDate = (date: string | null) => {
    if (!date) return 'En cours';
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
  
  const jobFamilies = ['Java', 'Architecte', 'BI', 'SAP', 'DevOps', '.NET', 'Python', 'React'];
  const seniorities: Seniority[] = ['Junior', 'Intermédiaire', 'Sénior', 'Expert'];
  const statuses: AssignmentStatus[] = ['Actif', 'En attente', 'Terminé', 'En risque'];
  const businessUnits = ['BU-1', 'BU-2', 'BU-3'];
  
  return (
    <div className="astek-page">
      <div className="astek-page-header">
        <div>
          <h1 className="astek-page-title">Assistance Technique (AT)</h1>
          <p className="astek-page-subtitle">
            Gestion des missions d'assistance technique et analyse des marges
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {canManage && (
            <>
              <button 
                onClick={handleOpenImport}
                className="astek-btn astek-btn-secondary"
              >
                📥 Importer des AT
              </button>
              <button 
                onClick={handleCreate}
                className="astek-btn astek-btn-primary"
              >
                + Nouvelle mission AT
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Filters */}
      <div className="astek-card" style={{ marginBottom: '24px' }}>
        <div className="at-filters">
          <div className="at-filter-row">
            <div className="astek-form-group">
              <label>Client</label>
              <input
                type="text"
                className="astek-input"
                placeholder="Rechercher un client..."
                value={searchClient}
                onChange={(e) => setSearchClient(e.target.value)}
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
                value={filterJobFamily}
                onChange={(e) => setFilterJobFamily(e.target.value)}
              >
                <option value="">Tous</option>
                {jobFamilies.map(job => (
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
                onChange={(e) => setFilterStatus(e.target.value as AssignmentStatus | '')}
              >
                <option value="">Tous</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="at-filter-actions">
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
        ) : filteredAssignments.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            Aucune mission AT trouvée
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="at-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Département</th>
                    <th>Ressource</th>
                    <th>Métier</th>
                    <th>Séniorité</th>
                    <th>BU</th>
                    <th>Dates</th>
                    <th>Taux vendu</th>
                    <th>Taux coûtant</th>
                    <th>Marge</th>
                    <th>Statut</th>
                    {canManage && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedAssignments.map((assignment) => (
                    <tr 
                      key={assignment.id}
                      onClick={() => handleRowClick(assignment)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td><strong>{assignment.clientName}</strong></td>
                      <td>{assignment.department}</td>
                      <td>{assignment.resourceName}</td>
                      <td>{assignment.jobFamily}</td>
                      <td>
                        <span className="at-badge at-badge-seniority">
                          {assignment.seniority}
                        </span>
                      </td>
                      <td>
                        <span className="at-badge at-badge-bu">
                          {assignment.businessUnitCode}
                        </span>
                      </td>
                      <td className="at-dates">
                        {formatDate(assignment.startDate)} → {formatDate(assignment.endDate)}
                      </td>
                      <td>{formatCurrency(assignment.dailySellRate)}</td>
                      <td>{formatCurrency(assignment.dailyCostRate)}</td>
                      <td>
                        <div className="at-margin">
                          <div className="at-margin-bar">
                            <div 
                              className="at-margin-fill"
                              style={{
                                width: `${Math.min(assignment.marginRate, 100)}%`,
                                backgroundColor: getMarginColor(assignment.marginRate)
                              }}
                            />
                          </div>
                          <span className="at-margin-text">
                            {assignment.marginRate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`at-badge at-badge-status ${getStatusBadgeClass(assignment.status)}`}>
                          {assignment.status}
                        </span>
                      </td>
                      {canManage && (
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="at-actions">
                            <button
                              onClick={() => handleEdit(assignment)}
                              className="at-action-btn at-action-edit"
                              title="Modifier"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(assignment)}
                              className="at-action-btn at-action-delete"
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="at-pagination">
              <div className="at-pagination-info">
                Affichage de {((currentPage - 1) * rowsPerPage) + 1} à{' '}
                {Math.min(currentPage * rowsPerPage, filteredAssignments.length)} sur{' '}
                {filteredAssignments.length} missions
              </div>
              
              <div className="at-pagination-controls">
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
                
                <div className="at-pagination-buttons">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="astek-btn astek-btn-secondary"
                  >
                    Précédent
                  </button>
                  <span className="at-pagination-page">
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
      
      {/* Modals */}
      {isFormModalOpen && (
        <TechnicalAssignmentFormModal
          assignment={editingAssignment}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingAssignment(undefined);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
      
      {isDetailsModalOpen && selectedAssignment && (
        <TechnicalAssignmentDetailsModal
          assignment={selectedAssignment}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedAssignment(undefined);
          }}
        />
      )}

      {/* Import Modal */}
      <ImportDialog
        config={atImportConfig}
        isOpen={isImportModalOpen}
        onClose={handleCloseImport}
        onImport={importApi.importTechnicalAssignments}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
};
