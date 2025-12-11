import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useClients } from '../hooks/useApi';
import { resourcesApi } from '../services/resourcesApi';
import type { BusinessUnitFilter } from '../hooks/useUserBusinessUnitFilter';
import type { ProjectWizardStep1Values, ProjectTeamMember, ResourceType } from './ProjectCreationWizard';

interface SectionErrors {
  [key: string]: string | undefined;
}

// ============================================================================
// 1. GENERAL INFO SECTION
// ============================================================================

interface GeneralInfoSectionProps {
  data: ProjectWizardStep1Values;
  errors: SectionErrors;
  onChange: (field: string, value: any) => void;
}

export const GeneralInfoSection = ({ data, errors, onChange }: GeneralInfoSectionProps) => {
  return (
    <div className="wizard-section">
      <h3 className="wizard-section-title">Informations générales du projet</h3>
      <p className="wizard-section-description">
        Définissez les informations de base de votre projet.
      </p>

      <div className="astek-form-group">
        <label htmlFor="name" className="astek-label">
          Nom du projet <span className="required-star">*</span>
        </label>
        <input
          type="text"
          id="name"
          className={`astek-input ${errors.name ? 'is-invalid' : ''}`}
          value={data.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Ex: Projet SAP Migration 2024"
        />
        {errors.name && <div className="astek-error-message">{errors.name}</div>}
      </div>

      <div className="astek-form-group">
        <label htmlFor="code" className="astek-label">
          Code du projet <span className="required-star">*</span>
        </label>
        <input
          type="text"
          id="code"
          className={`astek-input ${errors.code ? 'is-invalid' : ''}`}
          value={data.code}
          onChange={(e) => onChange('code', e.target.value)}
          placeholder="Ex: SAP-2024-001"
        />
        {errors.code && <div className="astek-error-message">{errors.code}</div>}
      </div>

      <div className="astek-row">
        <div className="astek-col-2">
          <div className="astek-form-group">
            <label htmlFor="type" className="astek-label">
              Type de projet <span className="required-star">*</span>
            </label>
            <select
              id="type"
              className="astek-select"
              value={data.type}
              onChange={(e) => onChange('type', e.target.value)}
            >
              <option value="T&M">T&M (Temps et matériel)</option>
              <option value="Forfait">Forfait (Prix fixe)</option>
            </select>
          </div>
        </div>

        <div className="astek-col-2">
          <div className="astek-form-group">
            <label htmlFor="currency" className="astek-label">
              Devise <span className="required-star">*</span>
            </label>
            <select
              id="currency"
              className="astek-select"
              value={data.currency}
              onChange={(e) => onChange('currency', e.target.value)}
            >
              <option value="CAD">CAD (Dollar canadien)</option>
              <option value="USD">USD (Dollar américain)</option>
              <option value="EUR">EUR (Euro)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="astek-form-group">
        <label htmlFor="projectManager" className="astek-label">
          Chef de projet <span className="required-star">*</span>
        </label>
        <input
          type="text"
          id="projectManager"
          className={`astek-input ${errors.projectManager ? 'is-invalid' : ''}`}
          value={data.projectManager}
          onChange={(e) => onChange('projectManager', e.target.value)}
          placeholder="Nom du chef de projet"
        />
        {errors.projectManager && <div className="astek-error-message">{errors.projectManager}</div>}
      </div>

      <div className="astek-row">
        <div className="astek-col-2">
          <div className="astek-form-group">
            <label htmlFor="startDate" className="astek-label">
              Date de début <span className="required-star">*</span>
            </label>
            <input
              type="date"
              id="startDate"
              className={`astek-input ${errors.startDate ? 'is-invalid' : ''}`}
              value={data.startDate}
              onChange={(e) => onChange('startDate', e.target.value)}
            />
            {errors.startDate && <div className="astek-error-message">{errors.startDate}</div>}
          </div>
        </div>

        <div className="astek-col-2">
          <div className="astek-form-group">
            <label htmlFor="endDate" className="astek-label">
              Date de fin prévue <span className="required-star">*</span>
            </label>
            <input
              type="date"
              id="endDate"
              className={`astek-input ${errors.endDate ? 'is-invalid' : ''}`}
              value={data.endDate}
              onChange={(e) => onChange('endDate', e.target.value)}
            />
            {errors.endDate && <div className="astek-error-message">{errors.endDate}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. CLIENT INFO SECTION
// ============================================================================

interface ClientInfoSectionProps {
  data: ProjectWizardStep1Values;
  errors: SectionErrors;
  onChange: (field: string, value: any) => void;
  buFilter: BusinessUnitFilter;
  onClientFinancialStatusChange?: (isComplete: boolean) => void;
}

export const ClientInfoSection = ({ data, errors, onChange, buFilter, onClientFinancialStatusChange }: ClientInfoSectionProps) => {
  const { data: clients, isLoading } = useClients(buFilter.scope === 'bu' ? Number(buFilter.buId) : undefined);
  
  // Handle client selection
  const handleClientSelect = (clientId: number) => {
    const selectedClient = clients?.find(c => c.id === clientId);
    if (selectedClient) {
      onChange('clientName', selectedClient.name);
      onChange('clientCode', selectedClient.code || '');
      onChange('clientCountry', selectedClient.countryName);
      onChange('clientSector', selectedClient.sectorName || '');
      
      // Notify parent about financial status
      if (onClientFinancialStatusChange) {
        onClientFinancialStatusChange(selectedClient.isFinancialConfigComplete || false);
      }
      
      // Pré-remplir les marges avec les valeurs par défaut du client
      if (selectedClient.defaultTargetMarginPercent != null) {
        onChange('margins.targetMarginPercent', selectedClient.defaultTargetMarginPercent);
      }
      if (selectedClient.defaultMinimumMarginPercent != null) {
        onChange('margins.minMarginPercent', selectedClient.defaultMinimumMarginPercent);
      }
    }
  };
  
  return (
    <div className="wizard-section">
      <h3 className="wizard-section-title">Informations client</h3>
      <p className="wizard-section-description">
        Sélectionnez le client pour lequel ce projet est réalisé.
      </p>

      <div className="astek-form-group">
        <label htmlFor="clientSelect" className="astek-label">
          Client <span className="required-star">*</span>
        </label>
        <select
          id="clientSelect"
          className={`astek-select ${errors.clientName ? 'is-invalid' : ''}`}
          value={data.clientName}
          onChange={(e) => {
            const clientId = e.target.value ? parseInt(e.target.value) : null;
            if (clientId) {
              handleClientSelect(clientId);
            } else {
              onChange('clientName', '');
              onChange('clientCode', '');
              onChange('clientCountry', '');
              onChange('clientSector', '');
            }
          }}
          disabled={isLoading}
        >
          <option value="">Sélectionnez un client</option>
          {clients?.map(client => (
            <option key={client.id} value={client.id}>
              {client.name} {client.code ? `(${client.code})` : ''} - BU: {client.businessUnitCode}
            </option>
          ))}
        </select>
        {errors.clientName && <div className="astek-error-message">{errors.clientName}</div>}
        {buFilter.scope === 'bu' && (
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
            Seuls les clients de votre Business Unit ({buFilter.buCode}) sont affichés
          </div>
        )}
      </div>

      {/* Avertissement si données financières incomplètes - Affiché en haut */}
      {data.clientName && !clients?.find(c => c.name === data.clientName)?.isFinancialConfigComplete && (
        <div style={{
          background: '#FEF3C7',
          border: '1px solid #F59E0B',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '16px',
          marginBottom: '16px',
          display: 'flex',
          gap: '12px'
        }}>
          <div style={{ fontSize: '20px' }}>⚠️</div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#92400E', fontSize: '14px', fontWeight: 600 }}>
              Configuration financière incomplète
            </h4>
            <p style={{ margin: '0 0 12px 0', color: '#78350F', fontSize: '13px', lineHeight: '1.5' }}>
              Ce client ne dispose pas de toutes les données financières requises (marges cibles, taux horaire cible, remises et jours de congés obligatoires).
            </p>
            <p style={{ margin: 0, color: '#78350F', fontSize: '13px', lineHeight: '1.5', fontWeight: 500 }}>
              Veuillez compléter la configuration financière du client avant de créer un projet.
            </p>
          </div>
        </div>
      )}

      {data.clientName && (
        <>
          <div className="astek-form-group">
            <label className="astek-label">Business Unit</label>
            <div style={{
              background: '#DBEAFE',
              color: '#1E40AF',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600
            }}>
              {clients?.find(c => c.name === data.clientName)?.businessUnitName} 
              ({clients?.find(c => c.name === data.clientName)?.businessUnitCode})
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
              La Business Unit est automatiquement dérivée du client sélectionné
            </div>
          </div>

          <div className="astek-form-group">
            <label htmlFor="clientCode" className="astek-label">
              Code client
            </label>
            <input
              type="text"
              id="clientCode"
              className="astek-input"
              value={data.clientCode || ''}
              disabled
              placeholder="Code interne du client"
            />
          </div>

          <div className="astek-row">
            <div className="astek-col-2">
              <div className="astek-form-group">
                <label htmlFor="clientCountry" className="astek-label">
                  Pays
                </label>
                <input
                  type="text"
                  id="clientCountry"
                  className="astek-input"
                  value={data.clientCountry || ''}
                  disabled
                  placeholder="Pays du client"
                />
              </div>
            </div>

            <div className="astek-col-2">
              <div className="astek-form-group">
                <label htmlFor="clientSector" className="astek-label">
                  Secteur d'activité
                </label>
                <input
                  type="text"
                  id="clientSector"
                  className="astek-input"
                  value={data.clientSector || ''}
                  disabled
                  placeholder="Secteur du client"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================================
// 3. MARGINS SECTION
// ============================================================================

interface MarginsSectionProps {
  data: ProjectWizardStep1Values;
  errors: SectionErrors;
  onChange: (field: string, value: any) => void;
  readOnly?: boolean;
  clientFinancialComplete?: boolean;
}

export const MarginsSection = ({ data, errors, onChange, readOnly = true, clientFinancialComplete = true }: MarginsSectionProps) => {
  return (
    <div className="wizard-section">
      <h3 className="wizard-section-title">Rentabilité du projet</h3>
      <p className="wizard-section-description">
        Les marges par défaut sont héritées automatiquement du client sélectionné.
      </p>

      <div className="astek-row">
        <div className="astek-col-2">
          <div className="astek-form-group">
            <label htmlFor="targetMargin" className="astek-label">
              Marge cible (%) <span className="required-star">*</span>
            </label>
            <input
              type="number"
              id="targetMargin"
              className={`astek-input ${errors.targetMargin ? 'is-invalid' : ''}`}
              value={data.margins.targetMarginPercent}
              onChange={(e) => onChange('margins.targetMarginPercent', parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              step="0.1"
              readOnly={readOnly}
              disabled={readOnly}
              style={readOnly ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed' } : {}}
            />
            {errors.targetMargin && <div className="astek-error-message">{errors.targetMargin}</div>}
            <small className="astek-field-hint">
              Marge brute du client (héritée automatiquement)
            </small>
          </div>
        </div>

        <div className="astek-col-2">
          <div className="astek-form-group">
            <label htmlFor="minMargin" className="astek-label">
              Marge minimale (%) <span className="required-star">*</span>
            </label>
            <input
              type="number"
              id="minMargin"
              className={`astek-input ${errors.minMargin ? 'is-invalid' : ''}`}
              value={data.margins.minMarginPercent}
              onChange={(e) => onChange('margins.minMarginPercent', parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              step="0.1"
              readOnly={readOnly}
              disabled={readOnly}
              style={readOnly ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed' } : {}}
            />
            {errors.minMargin && <div className="astek-error-message">{errors.minMargin}</div>}
            <small className="astek-field-hint">
              Marge minimale du client (héritée automatiquement)
            </small>
          </div>
        </div>
      </div>

      <div className="wizard-info-box">
        <div className="wizard-info-icon">ℹ️</div>
        <div className="wizard-info-content">
          <strong>Marges héritées du client :</strong><br />
          Les marges sont automatiquement définies selon la configuration du client sélectionné. 
          Ces valeurs sont en lecture seule pour garantir la cohérence avec les accords commerciaux établis.
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. TEAM MEMBERS SECTION - GRID WITH MODAL
// ============================================================================

interface TeamMembersSectionProps {
  teamMembers: ProjectTeamMember[];
  errors: SectionErrors;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, field: keyof ProjectTeamMember, value: any) => void;
  onAddMember?: (member: ProjectTeamMember) => void; // Ajouter un membre complet
  onUpdateMember?: (member: ProjectTeamMember) => void; // Mettre à jour un membre complet
  targetMargin?: number;
  minMargin?: number;
}

// Modal pour ajouter/éditer un membre
interface TeamMemberModalProps {
  isOpen: boolean;
  member: ProjectTeamMember | null;
  isEditMode: boolean;
  onClose: () => void;
  onSave: (member: ProjectTeamMember) => void;
  errors: SectionErrors;
  memberIndex: number;
}

const TeamMemberModal = ({ isOpen, member, isEditMode, onClose, onSave, errors, memberIndex }: TeamMemberModalProps) => {
  const [formData, setFormData] = useState<ProjectTeamMember | null>(member);
  const [existingResourceFound, setExistingResourceFound] = useState(false);

  // Reset form when member changes or modal opens
  useEffect(() => {
    if (isOpen && member) {
      setFormData(member);
      setExistingResourceFound(false);
    }
  }, [isOpen, member]);

  if (!isOpen || !formData) return null;

  const checkResourceExists = async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setExistingResourceFound(false);
      return;
    }

    try {
      const existingResource = await resourcesApi.getByEmail(email);
      
      if (existingResource) {
        setExistingResourceFound(true);
        // Auto-fill fields with existing resource data
        setFormData(prev => prev ? {
          ...prev,
          firstName: existingResource.firstName || '',
          lastName: existingResource.lastName || '',
          role: existingResource.jobType || '',
          internalCostRate: existingResource.dailyCostRate || 0,
          proposedBillRate: existingResource.dailySellRate || 0,
        } : null);
        
        toast.info('Ressource existante trouvée - Informations pré-remplies');
      } else {
        setExistingResourceFound(false);
      }
    } catch (error) {
      console.error('Error checking resource:', error);
      setExistingResourceFound(false);
    }
  };

  const handleChange = (field: keyof ProjectTeamMember, value: any) => {
    setFormData(prev => {
      if (!prev) return null;
      
      const updated = { ...prev, [field]: value };
      
      // Recalculate margins when rates change
      if (field === 'internalCostRate' || field === 'proposedBillRate') {
        const cost = field === 'internalCostRate' ? value : updated.internalCostRate;
        const sell = field === 'proposedBillRate' ? value : updated.proposedBillRate;
        
        if (sell > 0) {
          updated.grossMarginAmount = sell - cost;
          updated.grossMarginPercent = ((sell - cost) / sell) * 100;
          updated.netMarginPercent = updated.grossMarginPercent;
        }
      }
      
      return updated;
    });
  };

  // Validation du formulaire
  const isFormValid = formData && 
    formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.firstName.trim() !== '' &&
    formData.lastName.trim() !== '' &&
    formData.role.trim() !== '' &&
    formData.internalCostRate > 0 &&
    formData.proposedBillRate > 0;

  const handleSave = () => {
    if (formData && isFormValid) {
      onSave(formData);
      toast.success(isEditMode ? 'Membre mis à jour' : 'Membre ajouté avec succès');
      onClose();
    }
  };

  return (
    <div className="wizard-overlay" onClick={onClose}>
      <div className="wizard-modal-form" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="wizard-modal-header">
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
            {isEditMode ? '✏️ Modifier le membre' : '➕ Ajouter un nouveau membre'}
          </h3>
          <button
            type="button"
            className="wizard-close-btn"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: 0,
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
            }}
          >
            ×
          </button>
        </div>

        <div className="wizard-modal-body" style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Email */}
          <div className="astek-form-group">
            <label className="astek-label">Email <span className="required-star">*</span></label>
            <input
              type="email"
              className={`astek-input ${errors[`team_${memberIndex}_email`] ? 'is-invalid' : ''}`}
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={(e) => checkResourceExists(e.target.value)}
              placeholder="prenom.nom@astek.ca"
            />
            {errors[`team_${memberIndex}_email`] && (
              <div className="astek-error-message">{errors[`team_${memberIndex}_email`]}</div>
            )}
            {existingResourceFound && (
              <div style={{ marginTop: '8px', padding: '8px', background: '#DBEAFE', border: '1px solid #3B82F6', borderRadius: '4px', fontSize: '13px', color: '#1E40AF' }}>
                ℹ️ Ressource existante - Informations pré-remplies
              </div>
            )}
          </div>

          {/* Prénom & Nom */}
          <div className="astek-row">
            <div className="astek-col-2">
              <div className="astek-form-group">
                <label className="astek-label">Prénom <span className="required-star">*</span></label>
                <input
                  type="text"
                  className={`astek-input ${errors[`team_${memberIndex}_firstName`] ? 'is-invalid' : ''}`}
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Prénom"
                />
                {errors[`team_${memberIndex}_firstName`] && (
                  <div className="astek-error-message">{errors[`team_${memberIndex}_firstName`]}</div>
                )}
              </div>
            </div>
            <div className="astek-col-2">
              <div className="astek-form-group">
                <label className="astek-label">Nom <span className="required-star">*</span></label>
                <input
                  type="text"
                  className={`astek-input ${errors[`team_${memberIndex}_lastName`] ? 'is-invalid' : ''}`}
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Nom"
                />
                {errors[`team_${memberIndex}_lastName`] && (
                  <div className="astek-error-message">{errors[`team_${memberIndex}_lastName`]}</div>
                )}
              </div>
            </div>
          </div>

          {/* Rôle & Type */}
          <div className="astek-row">
            <div className="astek-col-2">
              <div className="astek-form-group">
                <label className="astek-label">Rôle <span className="required-star">*</span></label>
                <input
                  type="text"
                  className={`astek-input ${errors[`team_${memberIndex}_role`] ? 'is-invalid' : ''}`}
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  placeholder="Ex: Développeur, PO"
                />
                {errors[`team_${memberIndex}_role`] && (
                  <div className="astek-error-message">{errors[`team_${memberIndex}_role`]}</div>
                )}
              </div>
            </div>
            <div className="astek-col-2">
              <div className="astek-form-group">
                <label className="astek-label">Type <span className="required-star">*</span></label>
                <select
                  className="astek-select"
                  value={formData.resourceType}
                  onChange={(e) => handleChange('resourceType', e.target.value as ResourceType)}
                >
                  <option value="Employé">Employé</option>
                  <option value="Pigiste">Pigiste</option>
                </select>
              </div>
            </div>
          </div>

          {/* Taux */}
          <div className="astek-row">
            <div className="astek-col-2">
              <div className="astek-form-group">
                <label className="astek-label">Taux coûtant ($/h) <span className="required-star">*</span></label>
                <input
                  type="number"
                  className={`astek-input ${errors[`team_${memberIndex}_cost`] ? 'is-invalid' : ''}`}
                  value={formData.internalCostRate}
                  onChange={(e) => handleChange('internalCostRate', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
                {errors[`team_${memberIndex}_cost`] && (
                  <div className="astek-error-message">{errors[`team_${memberIndex}_cost`]}</div>
                )}
              </div>
            </div>
            <div className="astek-col-2">
              <div className="astek-form-group">
                <label className="astek-label">Taux vendant ($/h) <span className="required-star">*</span></label>
                <input
                  type="number"
                  className={`astek-input ${errors[`team_${memberIndex}_bill`] ? 'is-invalid' : ''}`}
                  value={formData.proposedBillRate}
                  onChange={(e) => handleChange('proposedBillRate', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
                {errors[`team_${memberIndex}_bill`] && (
                  <div className="astek-error-message">{errors[`team_${memberIndex}_bill`]}</div>
                )}
              </div>
            </div>
          </div>

          {/* Marges calculées */}
          <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Marge brute</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#00A859' }}>
                  {formData.grossMarginAmount.toFixed(2)} $ ({formData.grossMarginPercent.toFixed(1)}%)
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Marge nette</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#00A859' }}>
                  {formData.netMarginPercent.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="wizard-modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="astek-btn astek-btn-secondary"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            type="button"
            className="astek-btn astek-btn-primary"
            onClick={handleSave}
            disabled={!isFormValid}
            style={{ opacity: isFormValid ? 1 : 0.5, cursor: isFormValid ? 'pointer' : 'not-allowed' }}
          >
            {isEditMode ? 'Mettre à jour' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const TeamMembersSection = ({
  teamMembers,
  errors,
  onAdd,
  onRemove,
  onChange,
  onAddMember,
  onUpdateMember,
  targetMargin = 0,
  minMargin = 0,
}: TeamMembersSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<{ member: ProjectTeamMember; index: number } | null>(null);
  
  // State local pour stocker les membres indépendamment
  const [localMembers, setLocalMembers] = useState<ProjectTeamMember[]>([]);

  // Synchroniser le state local avec les props UNIQUEMENT au montage ou si teamMembers change de longueur
  useEffect(() => {
    console.log('🔄 TeamMembersSection - Syncing localMembers:', {
      teamMembersLength: teamMembers.length,
      teamMembers: teamMembers,
    });
    
    if (teamMembers.length > 0) {
      // Créer une copie profonde complètement indépendante
      const membersCopy = teamMembers.map(m => ({
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
      }));
      setLocalMembers(membersCopy);
      console.log('✅ LocalMembers synced:', membersCopy.length, 'members');
    }
  }, [teamMembers.length]); // Se déclenche uniquement si le nombre de membres change

  // Vérifier si des membres ont des marges en dessous des objectifs
  const membersWithLowMargins = localMembers.filter(
    m => m.grossMarginPercent < minMargin || m.netMarginPercent < minMargin
  );
  const hasMarginIssues = membersWithLowMargins.length > 0;

  const handleAddClick = () => {
    // Créer un membre temporaire vide sans l'ajouter à la liste
    const tempMember: ProjectTeamMember = {
      id: `temp-${Date.now()}`,
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
    setEditingMember({ member: tempMember, index: -1 }); // index -1 = nouveau membre
    setIsModalOpen(true);
  };

  const handleEditClick = (member: ProjectTeamMember, index: number) => {
    // Extraire le membre du state local pour l'éditer
    const memberToEdit = localMembers[index];
    if (memberToEdit) {
      // Créer une copie pour l'édition
      const memberCopy: ProjectTeamMember = {
        id: memberToEdit.id,
        email: memberToEdit.email,
        firstName: memberToEdit.firstName,
        lastName: memberToEdit.lastName,
        role: memberToEdit.role,
        resourceType: memberToEdit.resourceType,
        internalCostRate: memberToEdit.internalCostRate,
        proposedBillRate: memberToEdit.proposedBillRate,
        grossMarginAmount: memberToEdit.grossMarginAmount,
        grossMarginPercent: memberToEdit.grossMarginPercent,
        netMarginPercent: memberToEdit.netMarginPercent,
      };
      setEditingMember({ member: memberCopy, index });
      setIsModalOpen(true);
    }
  };

  const handleModalSave = (updatedMember: ProjectTeamMember) => {
    console.log('🔵 handleModalSave called:', {
      isNewMember: editingMember?.index === -1,
      editingIndex: editingMember?.index,
      updatedMemberEmail: updatedMember.email,
      updatedMemberRate: updatedMember.internalCostRate,
    });

    if (editingMember && editingMember.index === -1) {
      // Nouveau membre - créer et ajouter au state local ET parent
      const newMember: ProjectTeamMember = {
        id: `member-${Date.now()}-${Math.random()}`,
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
      
      console.log('➕ Adding new member:', newMember.email);
      
      // Mettre à jour le state local
      setLocalMembers(prev => {
        console.log('📊 LocalMembers before add:', prev.map(m => ({ email: m.email, rate: m.internalCostRate })));
        const newList = [...prev, newMember];
        console.log('📊 LocalMembers after add:', newList.map(m => ({ email: m.email, rate: m.internalCostRate })));
        return newList;
      });
      
      // Notifier le parent
      if (onAddMember) {
        onAddMember(newMember);
      }
    } else if (editingMember) {
      // Mise à jour d'un membre existant
      const memberToUpdate: ProjectTeamMember = {
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
      
      console.log('✏️ Updating member at index:', editingMember.index, {
        id: memberToUpdate.id,
        email: memberToUpdate.email,
        newRate: memberToUpdate.internalCostRate,
      });
      
      // Mettre à jour le state local en remplaçant le membre à l'index donné
      setLocalMembers(prev => {
        console.log('📊 LocalMembers before update:', prev.map((m, idx) => ({ 
          index: idx, 
          id: m.id, 
          email: m.email, 
          rate: m.internalCostRate 
        })));
        
        const newList = [...prev];
        console.log('🎯 Updating index:', editingMember.index, 'with rate:', memberToUpdate.internalCostRate);
        newList[editingMember.index] = memberToUpdate;
        
        console.log('📊 LocalMembers after update:', newList.map((m, idx) => ({ 
          index: idx, 
          id: m.id, 
          email: m.email, 
          rate: m.internalCostRate 
        })));
        
        return newList;
      });
      
      // Notifier le parent
      if (onUpdateMember) {
        onUpdateMember(memberToUpdate);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingMember(null);
  };

  const handleRemoveClick = (memberId: string) => {
    // Supprimer du state local
    setLocalMembers(prev => {
      const filtered = prev.filter(m => m.id !== memberId);
      // Notifier le parent avec la nouvelle liste complète
      setTimeout(() => {
        filtered.forEach(m => {
          if (onUpdateMember) onUpdateMember(m);
        });
      }, 0);
      return filtered;
    });
    
    // Notifier le parent de la suppression
    onRemove(memberId);
  };

  return (
    <div className="wizard-section">
      <div className="wizard-section-header">
        <div>
          <h3 className="wizard-section-title">
            Membres de l'équipe
            {localMembers.length > 0 && (
              <span style={{ 
                marginLeft: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#00A859',
                background: '#D1FAE5',
                padding: '4px 12px',
                borderRadius: '20px'
              }}>
                {localMembers.length} membre{localMembers.length > 1 ? 's' : ''}
              </span>
            )}
          </h3>
          <p className="wizard-section-description">
            Gérez les membres de l'équipe. Les marges sont calculées automatiquement.
          </p>
        </div>
      </div>

      {/* Bouton d'ajout */}
      <div style={{ marginBottom: '20px' }}>
        <button
          type="button"
          className="astek-btn astek-btn-primary"
          onClick={handleAddClick}
          style={{ width: '100%', fontSize: '15px', padding: '12px' }}>
          ➕ Ajouter un nouveau membre
        </button>
      </div>

      {/* Avertissement marges */}
      {hasMarginIssues && localMembers.length > 0 && (
        <div style={{
          background: '#FEF3C7',
          border: '1px solid #F59E0B',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px'
        }}>
          <div style={{ fontSize: '20px' }}>⚠️</div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#92400E', fontSize: '14px', fontWeight: 600 }}>
              Objectifs de marge non atteints
            </h4>
            <p style={{ margin: 0, color: '#78350F', fontSize: '13px' }}>
              {membersWithLowMargins.length} membre{membersWithLowMargins.length > 1 ? 's ont' : ' a'} des marges inférieures au minimum ({minMargin.toFixed(1)}%)
            </p>
          </div>
        </div>
      )}

      {/* Grille des membres */}
      {localMembers.length === 0 ? (
        <div className="wizard-empty-state">
          <div className="wizard-empty-icon">👥</div>
          <p className="wizard-empty-text">
            Aucun membre d'équipe ajouté. Cliquez sur "Ajouter un nouveau membre" pour commencer.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="wizard-team-grid">
            <thead>
              <tr>
                <th style={{ width: '30px' }}>#</th>
                <th>Nom complet</th>
                <th>Email</th>
                <th>Rôle</th>
                <th style={{ width: '100px' }}>Type</th>
                <th style={{ width: '110px', textAlign: 'right' }}>Taux coût</th>
                <th style={{ width: '110px', textAlign: 'right' }}>Taux vente</th>
                <th style={{ width: '110px', textAlign: 'right' }}>Marge brute</th>
                <th style={{ width: '90px', textAlign: 'right' }}>Marge %</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {localMembers.map((member, index) => (
                <tr key={member.id}>
                  <td style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>{index + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1f2937' }}>
                      {member.firstName} {member.lastName}
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', color: '#6b7280' }}>{member.email}</td>
                  <td style={{ fontSize: '13px' }}>{member.role}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: member.resourceType === 'Employé' ? '#DBEAFE' : '#FEF3C7',
                      color: member.resourceType === 'Employé' ? '#1E40AF' : '#92400E'
                    }}>
                      {member.resourceType}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '14px', fontFamily: 'monospace' }}>
                    {member.internalCostRate.toFixed(2)} $
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '14px', fontFamily: 'monospace' }}>
                    {member.proposedBillRate.toFixed(2)} $
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '14px', fontFamily: 'monospace' }}>
                    {member.grossMarginAmount.toFixed(2)} $
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '14px', fontWeight: 600 }}>
                    <span style={{ color: member.grossMarginPercent >= minMargin ? '#00A859' : '#DC2626' }}>
                      {member.grossMarginPercent.toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleEditClick(member, index)}
                        style={{
                          background: 'none',
                          border: '1px solid #d1d5db',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: '#6b7280',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#f3f4f6';
                          e.currentTarget.style.borderColor = '#9ca3af';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'none';
                          e.currentTarget.style.borderColor = '#d1d5db';
                        }}
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveClick(member.id)}
                        style={{
                          background: 'none',
                          border: '1px solid #d1d5db',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: '#dc2626',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#fee';
                          e.currentTarget.style.borderColor = '#dc2626';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'none';
                          e.currentTarget.style.borderColor = '#d1d5db';
                        }}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && editingMember && (
        <TeamMemberModal
          isOpen={isModalOpen}
          member={editingMember.member}
          isEditMode={editingMember.index !== -1}
          onClose={handleModalClose}
          onSave={handleModalSave}
          errors={errors}
          memberIndex={editingMember.index === -1 ? teamMembers.length : editingMember.index}
        />
      )}
    </div>
  );
};

// ============================================================================
// VALIDATION REQUEST STEP (STEP 2)
// ============================================================================

interface ValidationRequestStepProps {
  data: ProjectWizardStep1Values;
  createdByEmail: string | undefined;
  approverEmail: string;
  userRoles?: string[];
}

export const ValidationRequestStep = ({
  data,
  createdByEmail,
  approverEmail,
  userRoles = [],
}: ValidationRequestStepProps) => {
  const avgTeamMargin = data.teamMembers.length > 0
    ? data.teamMembers.reduce((sum, m) => sum + m.grossMarginPercent, 0) / data.teamMembers.length
    : 0;

  // Vérifier si l'utilisateur est CFO ou Admin
  const canValidate = userRoles.some(role => 
    role === 'Admin' || role === 'CFO' || role === 'admin' || role === 'cfo'
  );

  // Si l'utilisateur n'est pas CFO/Admin, afficher un message différent
  if (!canValidate) {
    return (
      <div className="wizard-validation-step">
        <h3 className="wizard-section-title">Demande de validation envoyée</h3>
        
        <div style={{
          background: '#DBEAFE',
          border: '1px solid #3B82F6',
          borderRadius: '8px',
          padding: '24px',
          marginTop: '20px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h4 style={{ margin: '0 0 12px 0', color: '#1E40AF', fontSize: '18px', fontWeight: 600 }}>
            Votre projet est en cours de validation
          </h4>
          <p style={{ margin: '0 0 16px 0', color: '#1E3A8A', fontSize: '14px', lineHeight: '1.6' }}>
            Votre demande de création de projet a été soumise avec succès et est maintenant en attente de validation par le CFO.
          </p>
          <div style={{
            background: 'white',
            borderRadius: '6px',
            padding: '16px',
            marginTop: '16px',
            textAlign: 'left'
          }}>
            <p style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '13px' }}>
              <strong>Demandeur :</strong> {createdByEmail || 'Utilisateur non identifié'}
            </p>
            <p style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '13px' }}>
              <strong>Validateur :</strong> {approverEmail}
            </p>
            <p style={{ margin: 0, color: '#374151', fontSize: '13px' }}>
              <strong>Statut :</strong> <span style={{ color: '#F59E0B', fontWeight: 600 }}>En attente de validation</span>
            </p>
          </div>
          <p style={{ margin: '16px 0 0 0', color: '#1E3A8A', fontSize: '13px', fontStyle: 'italic' }}>
            Vous recevrez une notification par email dès que le CFO aura pris une décision concernant votre projet.
          </p>
        </div>

        {/* Project Summary - Collapsed view */}
        <details style={{ marginTop: '20px' }}>
          <summary style={{ 
            cursor: 'pointer', 
            fontSize: '14px', 
            fontWeight: 600, 
            color: '#374151',
            padding: '12px',
            background: '#F3F4F6',
            borderRadius: '6px'
          }}>
            📋 Voir le récapitulatif du projet
          </summary>
          <div style={{ marginTop: '12px' }}>
            {/* Project Summary Cards */}
            <div className="wizard-summary-card">
              <h4 className="wizard-summary-title">📋 Informations du projet</h4>
              <div className="wizard-summary-grid">
                <div className="wizard-summary-item">
                  <span className="wizard-summary-label">Nom:</span>
                  <span className="wizard-summary-value">{data.name}</span>
                </div>
                <div className="wizard-summary-item">
                  <span className="wizard-summary-label">Code:</span>
                  <span className="wizard-summary-value">{data.code}</span>
                </div>
                <div className="wizard-summary-item">
                  <span className="wizard-summary-label">Client:</span>
                  <span className="wizard-summary-value">{data.clientName}</span>
                </div>
              </div>
            </div>
          </div>
        </details>
      </div>
    );
  }

  // Vue complète pour CFO/Admin
  return (
    <div className="wizard-validation-step">
      <h3 className="wizard-section-title">Récapitulatif et demande de validation</h3>
      <p className="wizard-section-description">
        Vérifiez les informations du projet avant d'envoyer la demande de validation à l'approbateur.
      </p>

      {/* Project Summary */}
      <div className="wizard-summary-card">
        <h4 className="wizard-summary-title">📋 Informations du projet</h4>
        <div className="wizard-summary-grid">
          <div className="wizard-summary-item">
            <span className="wizard-summary-label">Nom:</span>
            <span className="wizard-summary-value">{data.name}</span>
          </div>
          <div className="wizard-summary-item">
            <span className="wizard-summary-label">Code:</span>
            <span className="wizard-summary-value">{data.code}</span>
          </div>
          <div className="wizard-summary-item">
            <span className="wizard-summary-label">Type:</span>
            <span className="wizard-summary-value">{data.type}</span>
          </div>
          <div className="wizard-summary-item">
            <span className="wizard-summary-label">Devise:</span>
            <span className="wizard-summary-value">{data.currency}</span>
          </div>
          <div className="wizard-summary-item">
            <span className="wizard-summary-label">Chef de projet:</span>
            <span className="wizard-summary-value">{data.projectManager}</span>
          </div>
          <div className="wizard-summary-item">
            <span className="wizard-summary-label">Dates:</span>
            <span className="wizard-summary-value">
              {data.startDate} → {data.endDate}
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
            <span className="wizard-summary-value">{data.clientName}</span>
          </div>
          {data.clientCode && (
            <div className="wizard-summary-item">
              <span className="wizard-summary-label">Code:</span>
              <span className="wizard-summary-value">{data.clientCode}</span>
            </div>
          )}
          {data.clientCountry && (
            <div className="wizard-summary-item">
              <span className="wizard-summary-label">Pays:</span>
              <span className="wizard-summary-value">{data.clientCountry}</span>
            </div>
          )}
          {data.clientSector && (
            <div className="wizard-summary-item">
              <span className="wizard-summary-label">Secteur:</span>
              <span className="wizard-summary-value">{data.clientSector}</span>
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
              {data.margins.targetMarginPercent.toFixed(1)}%
            </span>
          </div>
          <div className="wizard-summary-item">
            <span className="wizard-summary-label">Marge minimale:</span>
            <span className="wizard-summary-value highlight-warning">
              {data.margins.minMarginPercent.toFixed(1)}%
            </span>
          </div>
          {data.teamMembers.length > 0 && (
            <div className="wizard-summary-item">
              <span className="wizard-summary-label">Marge moyenne équipe:</span>
              <span className="wizard-summary-value">
                {avgTeamMargin.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Team Summary */}
      {data.teamMembers.length > 0 && (
        <div className="wizard-summary-card">
          <h4 className="wizard-summary-title">👥 Équipe ({data.teamMembers.length} membre{data.teamMembers.length > 1 ? 's' : ''})</h4>
          <div className="wizard-team-summary-list">
            {data.teamMembers.map((member) => (
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

      {/* Validation Info */}
      <div className="wizard-validation-info">
        <div className="wizard-validation-icon">✉️</div>
        <div className="wizard-validation-content">
          <h4>Envoi de la demande de validation</h4>
          <p>
            <strong>Demandeur :</strong> {createdByEmail || 'Utilisateur non identifié'}<br />
            <strong>Approbateur :</strong> {approverEmail}<br />
            <strong>Statut initial :</strong> En attente
          </p>
          <p>
            Un email de notification sera envoyé à l'approbateur avec les détails du projet. 
            Vous serez notifié dès qu'une décision sera prise.
          </p>
        </div>
      </div>
    </div>
  );
};
