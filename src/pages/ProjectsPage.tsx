import { useState, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useProjects } from '../hooks/useApi';
import { useUserBusinessUnitFilter } from '../hooks/useUserBusinessUnitFilter';
import { hasAnyRole } from '../utils/roleHelpers';
import { getUserBusinessUnitCodes, canEditProject } from '../utils/roleUtils';
import type { Project } from '../types';
import type { ImportConfig } from '../types/import';
import { ProjectStatus, ProjectType, Currency, Country } from '../types';
import { ProjectCreationWizard, type ProjectValidationRequest } from '../components/ProjectCreationWizard';
import { EditProjectWizard } from '../components/EditProjectWizard';
import { ProjectDetailsModal } from '../components/ProjectDetailsModal';
import { DataTable, type DataTableColumn } from '../components/DataTable/DataTable';
import { ImportDialog } from '../components/ImportDialog';
import { importApi } from '../services/importApi';

export const ProjectsPage = () => {
  const { user } = useAuth0();
  const buFilter = useUserBusinessUnitFilter(); // Keep this for ProjectCreationWizard
  const { data: projects, isLoading, error } = useProjects(); // Removed BU filter - now handled by getUserBusinessUnitCodes
  
  // Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  
  // Edit wizard state
  const [isEditWizardOpen, setIsEditWizardOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | undefined>(undefined);
  
  // Details modal state
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Local projects state for CRUD (will be replaced by API calls later)
  const [localProjects, setLocalProjects] = useState<Project[]>(projects || []);
  
  // Determine if user can manage projects (Admin, Vente, or BU leaders)
  const canManageProjects = hasAnyRole(user, ['Admin', 'Vente', 'BU-1', 'BU-2', 'BU-3']);
  
  // Sync with API data
  if (projects && localProjects.length === 0) {
    setLocalProjects(projects);
  }

  // Handlers
  const handleOpenWizard = () => {
    setIsWizardOpen(true);
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
  };

  const handleWizardSubmit = (validationRequest: ProjectValidationRequest) => {
    // Pour l'instant, on crée directement le projet (simulation)
    // Plus tard, ceci enverra une demande de validation à l'approbateur
    const projectData = validationRequest.project;
    
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: projectData.name,
      code: projectData.code,
      clientId: 'temp-client-id',
      client: {
        id: 1,
        name: projectData.clientName,
        code: projectData.clientCode || '',
        sectorId: 1,
        sectorName: projectData.clientSector || 'N/A',
        businessUnitId: 1,
        businessUnitCode: 'BU-1',
        businessUnitName: 'Banking France',
        countryId: 1,
        countryName: projectData.clientCountry || 'Canada',
        currencyId: 1,
        currencyCode: (projectData.currency as Currency) || 'CAD',
        defaultTargetMarginPercent: projectData.margins.targetMarginPercent,
        defaultMinimumMarginPercent: projectData.margins.minMarginPercent,
        isFinancialConfigComplete: false,
        financialConfigStatusMessage: 'N/A',
        contactName: 'N/A',
        contactEmail: 'N/A',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      type: projectData.type === 'T&M' ? ProjectType.TIME_AND_MATERIALS : ProjectType.FIXED_PRICE,
      responsibleName: projectData.projectManager,
      currency: projectData.currency as Currency,
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      targetMargin: projectData.margins.targetMarginPercent,
      minMargin: projectData.margins.minMarginPercent,
      status: ProjectStatus.CONSTRUCTION,
      notes: `Demande de validation envoyée à ${validationRequest.approverEmail}\nÉquipe: ${projectData.teamMembers.length} membre(s)`,
      businessUnit: { id: '1', name: 'Banking France', code: 'BU-1' },
      businessUnitCode: 'BU-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setLocalProjects(prev => [...prev, newProject]);
    handleCloseWizard();
    
    // Afficher un message de succès
    alert(`Demande de validation envoyée avec succès à ${validationRequest.approverEmail} pour le projet "${projectData.name}" !`);
  };

  // Handlers for details modal
  const handleRowClick = (project: Project) => {
    setSelectedProject(project);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedProject(undefined);
  };

  // Handler for edit
  const handleEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    setProjectToEdit(project);
    setIsEditWizardOpen(true);
  };

  // Handler for successful edit
  const handleEditSuccess = () => {
    setIsEditWizardOpen(false);
    setProjectToEdit(undefined);
    // Refresh projects list (React Query will automatically refetch)
  };

  // Handler for delete
  const handleDelete = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    
    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ?\n\nCette action est irréversible.`
    );
    
    if (confirmDelete) {
      setLocalProjects(prev => prev.filter(p => p.id !== project.id));
      // TODO: Call API to delete project
      alert(`Projet "${project.name}" supprimé avec succès`);
    }
  };

  // Import handlers
  const handleOpenImport = () => {
    setIsImportModalOpen(true);
  };

  const handleCloseImport = () => {
    setIsImportModalOpen(false);
  };

  const handleImportSuccess = () => {
    // Rafraîchir la liste des projets
    // React Query refetch automatiquement
  };

  // Configuration pour l'import de projets
  const projectImportConfig: ImportConfig = {
    title: 'Import de Projets',
    description: 'Importez plusieurs projets simultanément via un fichier CSV ou Excel.',
    templateFileName: 'template_projets.csv',
    importEndpoint: '/api/projects/import',
    downloadTemplateEndpoint: '/api/projects/import/template',
    columns: [
      { name: 'code', label: 'Code Projet', required: true, type: 'string', description: 'Code unique du projet', example: 'PRJ-2024-001' },
      { name: 'nom', label: 'Nom du Projet', required: true, type: 'string', description: 'Nom descriptif du projet', example: 'Migration Cloud Banque X' },
      { name: 'clientCode', label: 'Code Client', required: true, type: 'string', description: 'Code du client existant', example: 'CLI-001' },
      { name: 'businessUnitCode', label: 'Code Business Unit', required: true, type: 'string', description: 'Code de la BU responsable', example: 'BU-1' },
      { name: 'type', label: 'Type de Projet', required: true, type: 'enum', description: 'T&M, Forfait, ou Autre', example: 'T&M', enumValues: ['T&M', 'Forfait', 'Autre'] },
      { name: 'dateDebut', label: 'Date de Début', required: true, type: 'date', description: 'Format: YYYY-MM-DD', example: '2024-01-15' },
      { name: 'dateFin', label: 'Date de Fin', required: true, type: 'date', description: 'Format: YYYY-MM-DD', example: '2024-12-31' },
      { name: 'margeCible', label: 'Marge Cible (%)', required: true, type: 'number', description: 'Marge cible en pourcentage', example: '25' },
      { name: 'margeMin', label: 'Marge Minimum (%)', required: false, type: 'number', description: 'Marge minimale acceptée', example: '15' },
      { name: 'responsable', label: 'Responsable', required: false, type: 'string', description: 'Nom du chef de projet', example: 'Jean Dupont' },
      { name: 'statut', label: 'Statut', required: false, type: 'enum', description: 'Construction, Active, OnHold, Completed, Cancelled', example: 'Active', enumValues: ['Construction', 'Active', 'OnHold', 'Completed', 'Cancelled'] },
    ],
  };

  // Use local projects or API projects
  const displayProjects = localProjects.length > 0 ? localProjects : projects || [];
  
  // Filter projects based on user's BU roles
  const filteredProjects = useMemo(() => {
    const buCodes = getUserBusinessUnitCodes(user);
    return buCodes.length === 0
      ? displayProjects // Admin or CFO: no restriction
      : displayProjects.filter(project =>
          buCodes.includes(project.businessUnitCode)
        );
  }, [displayProjects, user]);

  // Define columns for DataTable
  const columns: DataTableColumn<Project>[] = useMemo(() => [
    {
      id: 'name',
      label: 'Projet',
      width: '20%',
      accessor: (project) => <strong>{project.name}</strong>,
    },
    {
      id: 'code',
      label: 'Code',
      width: '10%',
      accessor: (project) => (
        <code style={{ 
          background: '#E5E7EB', 
          padding: '4px 10px', 
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#4B5563'
        }}>
          {project.code || '-'}
        </code>
      ),
    },
    {
      id: 'client',
      label: 'Client',
      width: '15%',
      accessor: (project) => project.client?.name || 'N/A',
    },
    {
      id: 'businessUnit',
      label: 'Business Unit',
      width: '10%',
      accessor: (project) => (
        <span style={{
          background: '#DBEAFE',
          color: '#1E40AF',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
          display: 'inline-block'
        }}>
          {project.businessUnit.code}
        </span>
      ),
    },
    {
      id: 'type',
      label: 'Type',
      width: '10%',
      searchType: 'select',
      searchOptions: [
        { value: 'T&M', label: 'T&M' },
        { value: 'Forfait', label: 'Forfait' },
        { value: 'Autre', label: 'Autre' },
      ],
      accessor: (project) => {
        const typeLabel = {
          [ProjectType.TIME_AND_MATERIALS]: 'T&M',
          [ProjectType.FIXED_PRICE]: 'Forfait',
          [ProjectType.OTHER]: 'Autre',
        }[project.type];
        
        return (
          <span className="project-type-badge">
            {typeLabel}
          </span>
        );
      },
    },
    {
      id: 'manager',
      label: 'Responsable',
      width: '12%',
      accessor: (project) => project.responsibleName || '-',
    },
    {
      id: 'dates',
      label: 'Dates',
      width: '10%',
      searchable: false,
      accessor: (project) => (
        <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.4' }}>
          <div>{new Date(project.startDate).toLocaleDateString('fr-CA')}</div>
          <div>→ {new Date(project.endDate).toLocaleDateString('fr-CA')}</div>
        </div>
      ),
    },
    {
      id: 'margin',
      label: 'Marge',
      width: '13%',
      searchable: false,
      accessor: (project) => {
        const targetMargin = project.targetMargin;
        const marginClass = 
          targetMargin >= 25 ? 'margin-excellent' :
          targetMargin >= 20 ? 'margin-good' :
          targetMargin >= 15 ? 'margin-warning' : 'margin-danger';
        
        return (
          <div className="margin-cell">
            <span className="margin-value">{targetMargin}%</span>
            <div className="margin-progress-bar">
              <div 
                className={`margin-progress-fill ${marginClass}`}
                style={{ width: `${Math.min(targetMargin * 3, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      id: 'status',
      label: 'Statut',
      width: '10%',
      searchType: 'select',
      searchOptions: [
        { value: 'Profitable', label: 'Rentable' },
        { value: 'AtRisk', label: 'À risque' },
        { value: 'ToValidate', label: 'À valider' },
      ],
      accessor: (project) => {
        // Map project status to display status
        let displayStatus = 'À valider';
        let statusClass = 'status-to-validate';
        
        if (project.status === ProjectStatus.ACTIVE) {
          displayStatus = 'Rentable';
          statusClass = 'status-profitable';
        } else if (project.status === ProjectStatus.ON_HOLD) {
          displayStatus = 'À risque';
          statusClass = 'status-at-risk';
        }
        
        return (
          <span className={`status-pill ${statusClass}`}>
            {displayStatus}
          </span>
        );
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      width: '12%',
      searchable: false,
      accessor: (project) => {
        const canEdit = canEditProject(user, project.businessUnitCode);
        
        if (!canEdit) return null;
        
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="astek-btn astek-btn-ghost"
              style={{
                padding: '6px 12px',
                minHeight: 'auto',
                fontSize: '13px',
              }}
              onClick={(e) => handleEdit(project, e)}
              title="Modifier le projet"
            >
              ✏️ Modifier
            </button>
            <button
              className="astek-btn astek-btn-ghost"
              style={{
                padding: '6px 12px',
                minHeight: 'auto',
                fontSize: '13px',
                color: '#DC2626',
              }}
              onClick={(e) => handleDelete(project, e)}
              title="Supprimer le projet"
            >
              🗑️ Supprimer
            </button>
          </div>
        );
      },
    },
  ], [user]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div className="astek-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="astek-alert astek-alert-error">
        Erreur lors du chargement des projets: {(error as Error).message}
      </div>
    );
  }

  return (
    <div>
      <div className="astek-flex-between" style={{ marginBottom: '32px' }}>
        <h1 className="astek-page-title">Projets</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          {canManageProjects && (
            <>
              <button
                className="astek-btn astek-btn-secondary"
                onClick={handleOpenImport}
              >
                📥 Importer des projets
              </button>
              <button
                className="astek-btn astek-btn-primary"
                onClick={handleOpenWizard}
              >
                ✨ Créer avec le wizard
              </button>
            </>
          )}
        </div>
      </div>

      {!filteredProjects || filteredProjects.length === 0 ? (
        <div className="astek-alert astek-alert-info">
          Aucun projet trouvé. Créez votre premier projet !
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredProjects}
          pageSizeOptions={[10, 25, 50]}
          defaultPageSize={10}
          onRowClick={handleRowClick}
        />
      )}

      {/* Project Creation Wizard */}
      {isWizardOpen && (
        <ProjectCreationWizard
          buFilter={buFilter}
          onClose={handleCloseWizard}
          onSubmit={handleWizardSubmit}
        />
      )}

      {/* Project Edit Wizard */}
      {isEditWizardOpen && projectToEdit && (
        <EditProjectWizard
          project={projectToEdit}
          buFilter={buFilter}
          onClose={() => setIsEditWizardOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
        />
      )}

      {/* Import Modal */}
      <ImportDialog
        config={projectImportConfig}
        isOpen={isImportModalOpen}
        onClose={handleCloseImport}
        onImport={importApi.importProjects}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
};
