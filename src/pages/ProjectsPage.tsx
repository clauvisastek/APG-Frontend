import { useState, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useUserBusinessUnitFilter } from '../hooks/useUserBusinessUnitFilter';
import { useProjectsQuery, useCreateProjectMutation, useUpdateProjectMutation, useDeleteProjectMutation, type ProjectDto } from '../hooks/useProjectsApi';
import { useClientsQuery } from '../hooks/useClientsApi';
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
import { toast } from 'react-toastify';

export const ProjectsPage = () => {
  const { user } = useAuth0();
  const buFilter = useUserBusinessUnitFilter(); // Keep this for ProjectCreationWizard
  const { data: projects, isLoading, error } = useProjectsQuery();
  const { data: clients } = useClientsQuery();
  const createProjectMutation = useCreateProjectMutation();
  const updateProjectMutation = useUpdateProjectMutation();
  const deleteProjectMutation = useDeleteProjectMutation();
  
  // Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  
  // Edit wizard state
  const [isEditWizardOpen, setIsEditWizardOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | undefined>(undefined);
  
  // Details modal state
  const [selectedProject, setSelectedProject] = useState<ProjectDto | undefined>(undefined);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Determine if user can manage projects (Admin, Vente, or BU leaders)
  const canManageProjects = hasAnyRole(user, ['Admin', 'Vente', 'BU-1', 'BU-2', 'BU-3']);

  // Handlers
  const handleOpenWizard = () => {
    setIsWizardOpen(true);
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
  };

  const handleWizardSubmit = async (validationRequest: ProjectValidationRequest) => {
    try {
      const projectData = validationRequest.project;
      
      // Find client by name
      const client = clients?.find(c => c.name === projectData.clientName);
      if (!client) {
        toast.error('Client non trouvé. Veuillez créer le client d\'abord.');
        return;
      }

      // Map wizard data to API format
      const payload = {
        name: projectData.name,
        code: projectData.code,
        clientId: client.id,
        businessUnitId: client.businessUnitId,
        type: projectData.type,
        responsibleName: projectData.projectManager,
        currency: projectData.currency,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        targetMargin: projectData.margins.targetMarginPercent,
        minMargin: projectData.margins.minMarginPercent,
        status: 'En construction',
        notes: `Demande de validation envoyée à ${validationRequest.approverEmail}\nÉquipe: ${projectData.teamMembers.length} membre(s)`,
        teamMembers: projectData.teamMembers.map(tm => ({
          id: tm.id,
          name: `${tm.firstName} ${tm.lastName}`,
          role: tm.role,
          costRate: tm.internalCostRate,
          sellRate: tm.proposedBillRate,
          grossMargin: tm.grossMarginAmount,
          netMargin: tm.netMarginPercent,
        })),
      };

      await createProjectMutation.mutateAsync(payload);
      handleCloseWizard();
      toast.success(`Projet "${projectData.name}" créé avec succès !`);
    } catch (error: any) {
      toast.error(error?.message || 'Erreur lors de la création du projet');
    }
  };

  // Map ProjectDto to Project for compatibility
  const mapProjectDtoToProject = (dto: ProjectDto): Project => {
    return {
      id: dto.id.toString(),
      name: dto.name,
      code: dto.code,
      clientId: dto.clientId.toString(),
      client: {
        id: dto.clientId,
        name: dto.clientName,
        code: dto.clientCode,
        sectorId: 1,
        sectorName: '',
        businessUnitId: dto.businessUnitId,
        businessUnitCode: dto.businessUnitCode,
        businessUnitName: dto.businessUnitName,
        countryId: 1,
        countryName: '',
        currencyId: 1,
        currencyCode: dto.currency,
        isFinancialConfigComplete: false,
        financialConfigStatusMessage: '',
        contactName: '',
        contactEmail: '',
        isActive: true,
        createdAt: dto.createdAt,
      },
      type: dto.type as ProjectType,
      responsibleName: dto.responsibleName || undefined,
      currency: dto.currency as Currency,
      startDate: dto.startDate,
      endDate: dto.endDate,
      targetMargin: dto.targetMargin,
      minMargin: dto.minMargin,
      status: dto.status as ProjectStatus,
      notes: dto.notes || undefined,
      businessUnit: {
        id: dto.businessUnitId.toString(),
        name: dto.businessUnitName,
        code: dto.businessUnitCode,
      },
      businessUnitCode: dto.businessUnitCode,
      ytdRevenue: dto.ytdRevenue || undefined,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt || dto.createdAt,
    };
  };

  // Handlers for details modal
  const handleRowClick = (project: ProjectDto) => {
    setSelectedProject(project);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedProject(undefined);
  };

  // Handler for edit
  const handleEdit = (project: ProjectDto, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToEdit(mapProjectDtoToProject(project));
    setIsEditWizardOpen(true);
  };

  // Handler for successful edit
  const handleEditSuccess = () => {
    setIsEditWizardOpen(false);
    setProjectToEdit(undefined);
  };

  // Handler for delete
  const handleDelete = async (project: ProjectDto, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ?\n\nCette action est irréversible.`
    );
    
    if (confirmDelete) {
      try {
        await deleteProjectMutation.mutateAsync(project.id);
        toast.success(`Projet "${project.name}" supprimé avec succès`);
      } catch (error: any) {
        toast.error(error?.message || 'Erreur lors de la suppression du projet');
      }
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

  // Filter projects based on user's BU roles
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    const buCodes = getUserBusinessUnitCodes(user);
    return buCodes.length === 0
      ? projects // Admin or CFO: no restriction
      : projects.filter(project =>
          buCodes.includes(project.businessUnitCode)
        );
  }, [projects, user]);

  // Define columns for DataTable
  const columns: DataTableColumn<ProjectDto>[] = useMemo(() => [
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
      accessor: (project) => project.clientName || 'N/A',
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
          {project.businessUnitCode}
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
          project={convertDtoToProject(selectedProject)}
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
