import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { BusinessUnitFilter } from '../hooks/useUserBusinessUnitFilter';
import {
  GeneralInfoSection,
  ClientInfoSection,
  MarginsSection,
  TeamMembersSection,
  ValidationRequestStep,
} from './ProjectCreationWizardSections';
import './ProjectCreationWizard.css';

// ============================================================================
// DATA MODELS
// ============================================================================

export type ResourceType = "Employé" | "Pigiste";

export interface ProjectTeamMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  resourceType: ResourceType;
  internalCostRate: number;
  proposedBillRate: number;
  grossMarginAmount: number;
  grossMarginPercent: number;
  netMarginPercent: number;
}

export interface ProjectMargins {
  targetMarginPercent: number;
  minMarginPercent: number;
}

export interface ProjectWizardStep1Values {
  // 1. Informations générales
  name: string;
  code: string;
  type: "T&M" | "Forfait";
  currency: string;
  startDate: string;
  endDate: string;
  projectManager: string;

  // 2. Client
  clientName: string;
  clientCode?: string;
  clientCountry?: string;
  clientSector?: string;

  // 3. Rentabilité
  margins: ProjectMargins;

  // 4. Membres de l'équipe
  teamMembers: ProjectTeamMember[];
}

export interface ProjectValidationRequest {
  project: ProjectWizardStep1Values;
  createdByEmail: string | undefined;
  approverEmail: string;
  status: "En attente" | "Approuvé" | "Refusé";
  createdAt: string;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface ProjectCreationWizardProps {
  buFilter: BusinessUnitFilter;
  onClose: () => void;
  onSubmit: (request: ProjectValidationRequest) => void;
}

type WizardStep = 1 | 2;
type Step1Section = "general" | "client" | "margins" | "team";

interface SectionErrors {
  [key: string]: string | undefined;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialProjectData: ProjectWizardStep1Values = {
  name: '',
  code: '',
  type: 'T&M',
  currency: 'CAD',
  startDate: '',
  endDate: '',
  projectManager: '',
  clientName: '',
  clientCode: '',
  clientCountry: '',
  clientSector: '',
  margins: {
    targetMarginPercent: 20,
    minMarginPercent: 15,
  },
  teamMembers: [],
};

const emptyTeamMember: Omit<ProjectTeamMember, 'id'> = {
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

export const ProjectCreationWizard = ({
  buFilter,
  onClose,
  onSubmit,
}: ProjectCreationWizardProps) => {
  const { user } = useAuth0();
  
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [currentSection, setCurrentSection] = useState<Step1Section>('general');
  const [projectData, setProjectData] = useState<ProjectWizardStep1Values>(initialProjectData);
  const [errors, setErrors] = useState<SectionErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClientFinancialComplete, setSelectedClientFinancialComplete] = useState<boolean>(true);

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
    // Team members are optional, but if added, validate them
    const newErrors: SectionErrors = {};

    projectData.teamMembers.forEach((member, index) => {
      if (!member.firstName.trim()) {
        newErrors[`team_${index}_firstName`] = 'Le prénom est obligatoire';
      }
      if (!member.lastName.trim()) {
        newErrors[`team_${index}_lastName`] = 'Le nom est obligatoire';
      }
      if (!member.role.trim()) {
        newErrors[`team_${index}_role`] = 'Le rôle est obligatoire';
      }
      if (member.internalCostRate < 0) {
        newErrors[`team_${index}_cost`] = 'Le taux coûtant doit être positif';
      }
      if (member.proposedBillRate < 0) {
        newErrors[`team_${index}_bill`] = 'Le taux vendant doit être positif';
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
  // FORM HANDLERS
  // ============================================================================

  const handleChange = (field: string, value: any) => {
    setProjectData(prev => {
      if (field.startsWith('margins.')) {
        const marginField = field.split('.')[1] as keyof ProjectMargins;
        return {
          ...prev,
          margins: {
            ...prev.margins,
            [marginField]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // ============================================================================
  // TEAM MEMBERS MANAGEMENT
  // ============================================================================

  const calculateMargins = (costRate: number, billRate: number): Partial<ProjectTeamMember> => {
    const grossMarginAmount = billRate - costRate;
    const grossMarginPercent = billRate > 0 ? (grossMarginAmount / billRate) * 100 : 0;
    const netMarginPercent = grossMarginPercent; // Simplified for now

    return {
      grossMarginAmount,
      grossMarginPercent,
      netMarginPercent,
    };
  };

  const handleAddTeamMember = () => {
    const newMember: ProjectTeamMember = {
      ...emptyTeamMember,
      id: `member-${Date.now()}-${Math.random()}`,
    };
    setProjectData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, newMember],
    }));
  };

  const handleRemoveTeamMember = (id: string) => {
    setProjectData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(m => m.id !== id),
    }));
  };

  const handleTeamMemberChange = (id: string, field: keyof ProjectTeamMember, value: any) => {
    setProjectData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map(member => {
        if (member.id !== id) return member;

        const updated = { ...member, [field]: value };

        // Recalculate margins if cost or bill rate changed
        if (field === 'internalCostRate' || field === 'proposedBillRate') {
          const margins = calculateMargins(
            field === 'internalCostRate' ? value : member.internalCostRate,
            field === 'proposedBillRate' ? value : member.proposedBillRate
          );
          return { ...updated, ...margins };
        }

        return updated;
      }),
    }));

    // Clear error for this field
    const errorKey = `team_${projectData.teamMembers.findIndex(m => m.id === id)}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: undefined }));
    }
  };

  // ============================================================================
  // SUBMISSION
  // ============================================================================

  const handleSubmitValidationRequest = () => {
    setIsSubmitting(true);

    const approverEmail = import.meta.env.VITE_APG_VALIDATOR_EMAIL || 'validator@astek.com';

    const request: ProjectValidationRequest = {
      project: projectData,
      createdByEmail: user?.email,
      approverEmail,
      status: 'En attente',
      createdAt: new Date().toISOString(),
    };

    onSubmit(request);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="wizard-overlay" onClick={handleClose}>
      <div className="wizard-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wizard-header">
          <div className="wizard-header-left">
            <h2 className="wizard-title">Nouveau projet</h2>
            <div className="wizard-step-indicator">
              <span className={`wizard-step-badge ${currentStep === 1 ? 'active' : 'completed'}`}>
                {currentStep === 2 ? '✓' : '1'}
              </span>
              <span className="wizard-step-label">Configuration</span>
              <span className="wizard-step-separator">→</span>
              <span className={`wizard-step-badge ${currentStep === 2 ? 'active' : ''}`}>2</span>
              <span className="wizard-step-label">Demande de validation</span>
            </div>
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
                    onClientFinancialStatusChange={setSelectedClientFinancialComplete}
                  />
                )}

                {currentSection === 'margins' && (
                  <MarginsSection
                    data={projectData}
                    errors={errors}
                    onChange={handleChange}
                    readOnly={true}
                    clientFinancialComplete={selectedClientFinancialComplete}
                  />
                )}

                {currentSection === 'team' && (
                  <TeamMembersSection
                    teamMembers={projectData.teamMembers}
                    errors={errors}
                    onAdd={handleAddTeamMember}
                    onRemove={handleRemoveTeamMember}
                    onChange={handleTeamMemberChange}
                  />
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <ValidationRequestStep
              data={projectData}
              createdByEmail={user?.email}
              approverEmail={import.meta.env.VITE_APG_VALIDATOR_EMAIL || 'validator@astek.com'}
            />
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
                disabled={currentSection === 'client' && !selectedClientFinancialComplete}
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
                onClick={handleSubmitValidationRequest}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
