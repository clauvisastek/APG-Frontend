import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'react-toastify';
import type { BusinessUnitFilter } from '../hooks/useUserBusinessUnitFilter';
import type { Project } from '../types';
import { useUpdateProject } from '../hooks/useApi';
import {
  GeneralInfoSection,
  ClientInfoSection,
  MarginsSection,
  TeamMembersSection,
} from './ProjectCreationWizardSections';
import type {
  ProjectWizardStep1Values,
  ProjectTeamMember,
  ProjectMargins,
} from './ProjectCreationWizard';
import './ProjectCreationWizard.css';

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface EditProjectWizardProps {
  project: Project;
  buFilter: BusinessUnitFilter;
  onClose: () => void;
  onSuccess: () => void;
}

type WizardStep = 1 | 2;
type Step1Section = "general" | "client" | "margins" | "team";

interface SectionErrors {
  [key: string]: string | undefined;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert Project to wizard format
 */
const projectToWizardData = (project: Project): ProjectWizardStep1Values => {
  console.log('🔄 projectToWizardData - Converting project:', {
    projectName: project.name,
    teamMembersRaw: project.teamMembers,
    teamMembersCount: project.teamMembers?.length || 0,
  });

  // Convert teamMembers from API format to wizard format
  // API uses simple TeamMember { name, role, costRate, sellRate, grossMargin, netMargin }
  // Wizard uses ProjectTeamMember { email, firstName, lastName, role, resourceType, internalCostRate, proposedBillRate, margins }
  const teamMembers: ProjectTeamMember[] = project.teamMembers?.map((member) => {
    const [firstName = '', lastName = ''] = member.name.split(' ');
    const converted = {
      id: member.id || `member-${Date.now()}-${Math.random()}`,
      email: member.email || '',
      firstName,
      lastName,
      role: member.role,
      resourceType: 'Employé' as const,
      internalCostRate: member.costRate,
      proposedBillRate: member.sellRate,
      grossMarginAmount: member.grossMargin,
      grossMarginPercent: member.grossMargin,
      netMarginPercent: member.netMargin,
    };
    console.log('  ➡️ Converted member:', { original: member, converted });
    return converted;
  }) || [];

  console.log('✅ Final teamMembers:', teamMembers);

  const margins: ProjectMargins = {
    targetMarginPercent: project.targetMargin,
    minMarginPercent: project.minMargin,
  };

  return {
    name: project.name,
    code: project.code || '',
    type: (project.type === 'T&M' || project.type === 'Forfait') ? project.type : 'T&M',
    currency: project.currency,
    startDate: project.startDate,
    endDate: project.endDate,
    projectManager: project.responsibleName || project.responsibleId || '',
    clientName: project.client?.name || '',
    clientCode: project.client?.code,
    clientCountry: project.client?.countryName,
    clientSector: project.client?.sectorName,
    margins,
    teamMembers,
  };
};

const emptyTeamMember: Omit<ProjectTeamMember, 'id'> = {
  email: '',
  firstName: '',
  lastName: '',
  role: '',
  resourceType: 'Employé',
  internalCostRate: 0,
  proposedBillRate: 0,
  grossMarginAmount: 0,
  grossMarginPercent: 0,
  netMarginPercent: 0,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const EditProjectWizard = ({
  project,
  buFilter,
  onClose,
  onSuccess,
}: EditProjectWizardProps) => {
  const { user } = useAuth0();
  
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [currentSection, setCurrentSection] = useState<Step1Section>('general');
  const [projectData, setProjectData] = useState<ProjectWizardStep1Values>(
    projectToWizardData(project)
  );
  const [errors, setErrors] = useState<SectionErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateProject = useUpdateProject();

  // Update wizard data when project changes
  useEffect(() => {
    setProjectData(projectToWizardData(project));
  }, [project]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleChange = (field: string, value: any) => {
    setProjectData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTeamMember = () => {
    const newMember: ProjectTeamMember = {
      ...emptyTeamMember,
      id: `temp-${Date.now()}`,
    };
    setProjectData((prev) => ({
      ...prev,
      teamMembers: [...prev.teamMembers, newMember],
    }));
  };

  const handleRemoveTeamMember = (id: string) => {
    setProjectData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((m) => m.id !== id),
    }));
  };

  const handleAddMemberComplete = (member: ProjectTeamMember) => {
    setProjectData((prev) => ({
      ...prev,
      teamMembers: [...prev.teamMembers, member],
    }));
  };

  const handleUpdateMemberComplete = (updatedMember: ProjectTeamMember) => {
    setProjectData((prev) => {
      // Créer un NOUVEAU tableau avec des NOUVELLES copies de chaque membre
      const newMembers = prev.teamMembers.map((m) => {
        if (m.id === updatedMember.id) {
          // Pour le membre modifié, retourner une copie complète des nouvelles données
          return {
            id: updatedMember.id,
            email: updatedMember.email,
            firstName: updatedMember.firstName,
            lastName: updatedMember.lastName,
            role: updatedMember.role,
            resourceType: updatedMember.resourceType,
            internalCostRate: updatedMember.internalCostRate,
            proposedBillRate: updatedMember.proposedBillRate,
            grossMarginAmount: updatedMember.grossMarginAmount,
            grossMarginPercent: updatedMember.grossMarginPercent,
            netMarginPercent: updatedMember.netMarginPercent,
          };
        }
        // Pour les autres membres, créer une nouvelle copie avec leurs valeurs actuelles
        return {
          id: m.id,
          email: m.email,
          firstName: m.firstName,
          lastName: m.lastName,
          role: m.role,
          resourceType: m.resourceType,
          internalCostRate: m.internalCostRate,
          proposedBillRate: m.proposedBillRate,
          grossMarginAmount: m.grossMarginAmount,
          grossMarginPercent: m.grossMarginPercent,
          netMarginPercent: m.netMarginPercent,
        };
      });
      
      return {
        ...prev,
        teamMembers: newMembers,
      };
    });
  };

  const handleTeamMemberChange = (id: string, field: keyof ProjectTeamMember, value: any) => {
    setProjectData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.map((m) => {
        if (m.id !== id) return m;
        
        const updated = { ...m, [field]: value };
        
        // Recalculate margins when cost or sell rate changes
        if (field === 'internalCostRate' || field === 'proposedBillRate') {
          const cost = field === 'internalCostRate' ? value : updated.internalCostRate;
          const sell = field === 'proposedBillRate' ? value : updated.proposedBillRate;
          
          if (sell > 0) {
            updated.grossMarginAmount = sell - cost;
            updated.grossMarginPercent = ((sell - cost) / sell) * 100;
            updated.netMarginPercent = updated.grossMarginPercent; // Simplified
          } else {
            updated.grossMarginAmount = 0;
            updated.grossMarginPercent = 0;
            updated.netMarginPercent = 0;
          }
        }
        
        return updated;
      }),
    }));
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateGeneralSection = (): boolean => {
    const newErrors: SectionErrors = {};

    if (!projectData.name.trim()) {
      newErrors.name = 'Le nom du projet est obligatoire';
    }
    if (!projectData.code.trim()) {
      newErrors.code = 'Le code du projet est obligatoire';
    }
    if (!projectData.projectManager.trim()) {
      newErrors.projectManager = 'Le chef de projet est obligatoire';
    }
    if (!projectData.startDate) {
      newErrors.startDate = 'La date de début est obligatoire';
    }
    if (!projectData.endDate) {
      newErrors.endDate = 'La date de fin est obligatoire';
    }
    if (projectData.startDate && projectData.endDate && projectData.endDate < projectData.startDate) {
      newErrors.endDate = 'La date de fin doit être postérieure à la date de début';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateClientSection = (): boolean => {
    const newErrors: SectionErrors = {};

    if (!projectData.clientName.trim()) {
      newErrors.clientName = 'Le nom du client est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMarginsSection = (): boolean => {
    const newErrors: SectionErrors = {};

    if (projectData.margins.targetMarginPercent < 0 || projectData.margins.targetMarginPercent > 100) {
      newErrors.targetMargin = 'La marge cible doit être entre 0 et 100%';
    }
    if (projectData.margins.minMarginPercent < 0 || projectData.margins.minMarginPercent > 100) {
      newErrors.minMargin = 'La marge minimale doit être entre 0 et 100%';
    }
    if (projectData.margins.minMarginPercent > projectData.margins.targetMarginPercent) {
      newErrors.minMargin = 'La marge minimale doit être inférieure ou égale à la marge cible';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateTeamSection = (): boolean => {
    const newErrors: SectionErrors = {};

    projectData.teamMembers.forEach((member, index) => {
      if (!member.firstName.trim()) {
        newErrors[`teamMember_${index}_firstName`] = 'Le prénom est obligatoire';
      }
      if (!member.lastName.trim()) {
        newErrors[`teamMember_${index}_lastName`] = 'Le nom est obligatoire';
      }
      if (!member.role.trim()) {
        newErrors[`teamMember_${index}_role`] = 'Le rôle est obligatoire';
      }
      if (member.internalCostRate < 0) {
        newErrors[`teamMember_${index}_costRate`] = 'Le taux de coût doit être positif';
      }
      if (member.proposedBillRate < 0) {
        newErrors[`teamMember_${index}_billRate`] = 'Le taux de facturation doit être positif';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  const handleNextSection = () => {
    let isValid = false;

    switch (currentSection) {
      case 'general':
        isValid = validateGeneralSection();
        if (isValid) setCurrentSection('client');
        break;
      case 'client':
        isValid = validateClientSection();
        if (isValid) setCurrentSection('margins');
        break;
      case 'margins':
        isValid = validateMarginsSection();
        if (isValid) setCurrentSection('team');
        break;
      case 'team':
        isValid = validateTeamSection();
        if (isValid) setCurrentStep(2);
        break;
    }
  };

  const handlePreviousSection = () => {
    setErrors({}); // Clear errors when going back
    switch (currentSection) {
      case 'client':
        setCurrentSection('general');
        break;
      case 'margins':
        setCurrentSection('client');
        break;
      case 'team':
        setCurrentSection('margins');
        break;
    }
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    setCurrentSection('team');
  };

  // ============================================================================
  // SUBMISSION
  // ============================================================================

  const handleSubmitUpdate = async () => {
    setIsSubmitting(true);

    try {
      // Convert team members to API format
      const teamMembersDto = projectData.teamMembers.map((m) => ({
        email: m.email,
        name: `${m.firstName} ${m.lastName}`.trim(),
        role: m.role,
        costRate: m.internalCostRate,
        sellRate: m.proposedBillRate,
        grossMargin: m.grossMarginPercent,
        netMargin: m.netMarginPercent,
      }));

      // Update the project with all required fields
      await updateProject.mutateAsync({
        id: project.id.toString(),
        updates: {
          name: projectData.name,
          code: projectData.code,
          clientId: parseInt(project.clientId),
          businessUnitId: parseInt(project.businessUnit.id),
          type: projectData.type,
          responsibleName: project.responsibleName || projectData.projectManager,
          currency: projectData.currency,
          startDate: projectData.startDate,
          endDate: projectData.endDate,
          targetMargin: projectData.margins.targetMarginPercent,
          minMargin: projectData.margins.minMarginPercent,
          status: project.status || 'Active',
          notes: project.notes,
          ytdRevenue: project.ytdRevenue,
          teamMembers: teamMembersDto,
        },
      });

      toast.success(`Projet "${project.name}" mis à jour avec succès !`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating project:', error);
      const errorMessage = error?.message || 'Une erreur est survenue lors de la mise à jour du projet.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="wizard-overlay">
      <div className="wizard-modal">
        {/* Header */}
        <div className="wizard-header">
          <div>
            <h2 className="wizard-title">Modifier le projet</h2>
            <p className="wizard-subtitle">
              Étape {currentStep} sur 2
            </p>
          </div>
          <button
            type="button"
            className="wizard-close"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="wizard-body wizard-body-scrollable">
          {currentStep === 1 && (
            <div className="wizard-step1">
              {/* Section Navigation */}
              <div className="wizard-section-nav">
                <button
                  className={`wizard-section-tab ${currentSection === 'general' ? 'active' : ''}`}
                  onClick={() => setCurrentSection('general')}
                >
                  1. Informations générales
                </button>
                <button
                  className={`wizard-section-tab ${currentSection === 'client' ? 'active' : ''}`}
                  onClick={() => setCurrentSection('client')}
                  disabled={!projectData.name}
                >
                  2. Client
                </button>
                <button
                  className={`wizard-section-tab ${currentSection === 'margins' ? 'active' : ''}`}
                  onClick={() => setCurrentSection('margins')}
                  disabled={!projectData.clientName}
                >
                  3. Rentabilité
                </button>
                <button
                  className={`wizard-section-tab ${currentSection === 'team' ? 'active' : ''}`}
                  onClick={() => setCurrentSection('team')}
                  disabled={!projectData.clientName}
                >
                  4. Équipe
                </button>
              </div>

              {/* Section Content */}
              <div className="wizard-section-content">
                {currentSection === 'general' && (
                  <GeneralInfoSection
                    data={projectData}
                    errors={errors}
                    onChange={handleChange}
                  />
                )}

                {currentSection === 'client' && (
                  <ClientInfoSection
                    data={projectData}
                    errors={errors}
                    onChange={handleChange}
                    buFilter={buFilter}
                  />
                )}

                {currentSection === 'margins' && (
                  <MarginsSection
                    data={projectData}
                    errors={errors}
                    onChange={handleChange}
                  />
                )}

                {currentSection === 'team' && (
                  <>
                    {console.log('📊 Rendering TeamMembersSection with:', {
                      teamMembersCount: projectData.teamMembers.length,
                      teamMembers: projectData.teamMembers,
                    })}
                    <TeamMembersSection
                      teamMembers={projectData.teamMembers}
                      errors={errors}
                      onAdd={handleAddTeamMember}
                      onRemove={handleRemoveTeamMember}
                      onChange={handleTeamMemberChange}
                      onAddMember={handleAddMemberComplete}
                      onUpdateMember={handleUpdateMemberComplete}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="wizard-step2">
              <div className="wizard-validation-step">
                <h3 className="wizard-section-title">Confirmation des modifications</h3>
                <p className="wizard-section-description">
                  Vérifiez les modifications avant de les enregistrer.
                </p>
                
                <div className="wizard-validation-info">
                  <div className="wizard-validation-icon">ℹ️</div>
                  <div className="wizard-validation-content">
                    <h4>Note importante</h4>
                    <p>
                      <strong>Modifications immédiates :</strong> Nom, code, dates<br />
                      <strong>Soumises pour validation CFO :</strong> Rentabilité (marges, équipe)
                    </p>
                  </div>
                </div>

                {/* Project Summary */}
                <div className="wizard-summary-card">
                  <h4 className="wizard-summary-title">📋 Informations du projet</h4>
                  <div className="wizard-summary-grid">
                    <div className="wizard-summary-item">
                      <span className="wizard-summary-label">Nom:</span>
                      <span className="wizard-summary-value">{projectData.name}</span>
                    </div>
                    <div className="wizard-summary-item">
                      <span className="wizard-summary-label">Code:</span>
                      <span className="wizard-summary-value">{projectData.code}</span>
                    </div>
                    <div className="wizard-summary-item">
                      <span className="wizard-summary-label">Type:</span>
                      <span className="wizard-summary-value">{projectData.type}</span>
                    </div>
                    <div className="wizard-summary-item">
                      <span className="wizard-summary-label">Devise:</span>
                      <span className="wizard-summary-value">{projectData.currency}</span>
                    </div>
                    <div className="wizard-summary-item">
                      <span className="wizard-summary-label">Chef de projet:</span>
                      <span className="wizard-summary-value">{projectData.projectManager}</span>
                    </div>
                    <div className="wizard-summary-item">
                      <span className="wizard-summary-label">Dates:</span>
                      <span className="wizard-summary-value">
                        {projectData.startDate} → {projectData.endDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Client Summary */}
                <div className="wizard-summary-card">
                  <h4 className="wizard-summary-title">🏢 Client</h4>
                  <div className="wizard-summary-grid">
                    <div className="wizard-summary-item">
                      <span className="wizard-summary-label">Nom:</span>
                      <span className="wizard-summary-value">{projectData.clientName}</span>
                    </div>
                    {projectData.clientCode && (
                      <div className="wizard-summary-item">
                        <span className="wizard-summary-label">Code:</span>
                        <span className="wizard-summary-value">{projectData.clientCode}</span>
                      </div>
                    )}
                    {projectData.clientCountry && (
                      <div className="wizard-summary-item">
                        <span className="wizard-summary-label">Pays:</span>
                        <span className="wizard-summary-value">{projectData.clientCountry}</span>
                      </div>
                    )}
                    {projectData.clientSector && (
                      <div className="wizard-summary-item">
                        <span className="wizard-summary-label">Secteur:</span>
                        <span className="wizard-summary-value">{projectData.clientSector}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Margins Summary */}
                <div className="wizard-summary-card">
                  <h4 className="wizard-summary-title">💰 Rentabilité</h4>
                  <div className="wizard-summary-grid">
                    <div className="wizard-summary-item">
                      <span className="wizard-summary-label">Marge cible:</span>
                      <span className="wizard-summary-value highlight-success">
                        {projectData.margins.targetMarginPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="wizard-summary-item">
                      <span className="wizard-summary-label">Marge minimale:</span>
                      <span className="wizard-summary-value highlight-warning">
                        {projectData.margins.minMarginPercent.toFixed(1)}%
                      </span>
                    </div>
                    {projectData.teamMembers.length > 0 && (
                      <div className="wizard-summary-item">
                        <span className="wizard-summary-label">Marge moyenne équipe:</span>
                        <span className="wizard-summary-value">
                          {(projectData.teamMembers.reduce((sum, m) => sum + m.grossMarginPercent, 0) / projectData.teamMembers.length).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Summary */}
                {projectData.teamMembers.length > 0 && (
                  <div className="wizard-summary-card">
                    <h4 className="wizard-summary-title">👥 Équipe ({projectData.teamMembers.length} membre{projectData.teamMembers.length > 1 ? 's' : ''})</h4>
                    <div className="wizard-team-summary-list">
                      {projectData.teamMembers.map((member) => (
                        <div key={member.id} className="wizard-team-summary-item">
                          <span className="wizard-team-summary-name">
                            {member.firstName} {member.lastName}
                          </span>
                          <span className="wizard-team-summary-role">{member.role}</span>
                          <span className="wizard-team-summary-type">({member.resourceType})</span>
                          <span className="wizard-team-summary-rates">
                            {member.internalCostRate}$ → {member.proposedBillRate}$ 
                            ({member.grossMarginPercent.toFixed(1)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="wizard-footer">
          {currentStep === 1 && (
            <>
              {currentSection !== 'general' && (
                <button
                  type="button"
                  className="astek-btn astek-btn-ghost"
                  onClick={handlePreviousSection}
                >
                  Précédent
                </button>
              )}
              <div style={{ flex: 1 }} />
              <button
                type="button"
                className="astek-btn astek-btn-ghost"
                onClick={handleClose}
              >
                Annuler
              </button>
              <button
                type="button"
                className="astek-btn astek-btn-primary"
                onClick={handleNextSection}
              >
                {currentSection === 'team' ? 'Passer à l\'étape 2' : 'Suivant'}
              </button>
            </>
          )}

          {currentStep === 2 && (
            <>
              <button
                type="button"
                className="astek-btn astek-btn-ghost"
                onClick={handleBackToStep1}
                disabled={isSubmitting}
              >
                Retour à l'étape 1
              </button>
              <div style={{ flex: 1 }} />
              <button
                type="button"
                className="astek-btn astek-btn-ghost"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="button"
                className="astek-btn astek-btn-primary"
                onClick={handleSubmitUpdate}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enregistrement en cours...' : 'Enregistrer les modifications'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
