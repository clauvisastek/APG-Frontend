import { useClients } from '../hooks/useApi';
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
}

export const ClientInfoSection = ({ data, errors, onChange, buFilter }: ClientInfoSectionProps) => {
  const { data: clients, isLoading } = useClients(buFilter.scope === 'bu' ? buFilter.buId : undefined);
  
  // Handle client selection
  const handleClientSelect = (clientId: string) => {
    const selectedClient = clients?.find(c => c.id === clientId);
    if (selectedClient) {
      onChange('clientName', selectedClient.name);
      onChange('clientCode', selectedClient.code || '');
      onChange('clientCountry', selectedClient.country);
      onChange('clientSector', selectedClient.sector || '');
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
            const clientId = e.target.value;
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
              {client.name} {client.code ? `(${client.code})` : ''} - BU: {client.businessUnit.code}
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
              {clients?.find(c => c.name === data.clientName)?.businessUnit.name} 
              ({clients?.find(c => c.name === data.clientName)?.businessUnit.code})
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
}

export const MarginsSection = ({ data, errors, onChange }: MarginsSectionProps) => {
  return (
    <div className="wizard-section">
      <h3 className="wizard-section-title">Rentabilité du projet</h3>
      <p className="wizard-section-description">
        Définissez les objectifs de marge pour ce projet. Ces marges serviront de référence pour 
        la validation et le suivi de la rentabilité.
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
            />
            {errors.targetMargin && <div className="astek-error-message">{errors.targetMargin}</div>}
            <small className="astek-field-hint">
              Marge brute souhaitée pour le projet
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
            />
            {errors.minMargin && <div className="astek-error-message">{errors.minMargin}</div>}
            <small className="astek-field-hint">
              Seuil d'alerte en dessous duquel une validation sera requise
            </small>
          </div>
        </div>
      </div>

      <div className="wizard-info-box">
        <div className="wizard-info-icon">ℹ️</div>
        <div className="wizard-info-content">
          <strong>À propos des marges :</strong><br />
          La marge cible représente l'objectif de rentabilité standard pour ce projet. 
          La marge minimale est le seuil en dessous duquel une validation spéciale sera nécessaire 
          pour engager des ressources ou accepter des taux.
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. TEAM MEMBERS SECTION
// ============================================================================

interface TeamMembersSectionProps {
  teamMembers: ProjectTeamMember[];
  errors: SectionErrors;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, field: keyof ProjectTeamMember, value: any) => void;
}

export const TeamMembersSection = ({
  teamMembers,
  errors,
  onAdd,
  onRemove,
  onChange,
}: TeamMembersSectionProps) => {
  return (
    <div className="wizard-section">
      <div className="wizard-section-header">
        <div>
          <h3 className="wizard-section-title">Membres de l'équipe</h3>
          <p className="wizard-section-description">
            Ajoutez les membres de l'équipe qui travailleront sur ce projet. 
            Les marges seront calculées automatiquement.
          </p>
        </div>
        <button
          type="button"
          className="astek-btn astek-btn-secondary"
          onClick={onAdd}
        >
          + Ajouter un membre
        </button>
      </div>

      {teamMembers.length === 0 ? (
        <div className="wizard-empty-state">
          <div className="wizard-empty-icon">👥</div>
          <p className="wizard-empty-text">
            Aucun membre d'équipe ajouté pour le moment.
          </p>
          <button
            type="button"
            className="astek-btn astek-btn-primary"
            onClick={onAdd}
          >
            Ajouter le premier membre
          </button>
        </div>
      ) : (
        <div className="wizard-team-list">
          {teamMembers.map((member, index) => (
            <div key={member.id} className="wizard-team-card">
              <div className="wizard-team-card-header">
                <span className="wizard-team-card-number">Membre #{index + 1}</span>
                <button
                  type="button"
                  className="wizard-team-card-remove"
                  onClick={() => onRemove(member.id)}
                  title="Retirer ce membre"
                >
                  ×
                </button>
              </div>

              <div className="astek-row">
                <div className="astek-col-2">
                  <div className="astek-form-group">
                    <label className="astek-label">
                      Prénom <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className={`astek-input ${errors[`team_${index}_firstName`] ? 'is-invalid' : ''}`}
                      value={member.firstName}
                      onChange={(e) => onChange(member.id, 'firstName', e.target.value)}
                      placeholder="Prénom"
                    />
                    {errors[`team_${index}_firstName`] && (
                      <div className="astek-error-message">{errors[`team_${index}_firstName`]}</div>
                    )}
                  </div>
                </div>

                <div className="astek-col-2">
                  <div className="astek-form-group">
                    <label className="astek-label">
                      Nom <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className={`astek-input ${errors[`team_${index}_lastName`] ? 'is-invalid' : ''}`}
                      value={member.lastName}
                      onChange={(e) => onChange(member.id, 'lastName', e.target.value)}
                      placeholder="Nom"
                    />
                    {errors[`team_${index}_lastName`] && (
                      <div className="astek-error-message">{errors[`team_${index}_lastName`]}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="astek-row">
                <div className="astek-col-2">
                  <div className="astek-form-group">
                    <label className="astek-label">
                      Rôle <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className={`astek-input ${errors[`team_${index}_role`] ? 'is-invalid' : ''}`}
                      value={member.role}
                      onChange={(e) => onChange(member.id, 'role', e.target.value)}
                      placeholder="Ex: Développeur, PO, Architecte"
                    />
                    {errors[`team_${index}_role`] && (
                      <div className="astek-error-message">{errors[`team_${index}_role`]}</div>
                    )}
                  </div>
                </div>

                <div className="astek-col-2">
                  <div className="astek-form-group">
                    <label className="astek-label">
                      Type de ressource <span className="required-star">*</span>
                    </label>
                    <select
                      className="astek-select"
                      value={member.resourceType}
                      onChange={(e) => onChange(member.id, 'resourceType', e.target.value as ResourceType)}
                    >
                      <option value="Employé">Employé</option>
                      <option value="Pigiste">Pigiste</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="astek-row">
                <div className="astek-col-2">
                  <div className="astek-form-group">
                    <label className="astek-label">
                      Taux coûtant ($/h) <span className="required-star">*</span>
                    </label>
                    <input
                      type="number"
                      className={`astek-input ${errors[`team_${index}_cost`] ? 'is-invalid' : ''}`}
                      value={member.internalCostRate}
                      onChange={(e) => onChange(member.id, 'internalCostRate', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                    {errors[`team_${index}_cost`] && (
                      <div className="astek-error-message">{errors[`team_${index}_cost`]}</div>
                    )}
                  </div>
                </div>

                <div className="astek-col-2">
                  <div className="astek-form-group">
                    <label className="astek-label">
                      Taux vendant ($/h) <span className="required-star">*</span>
                    </label>
                    <input
                      type="number"
                      className={`astek-input ${errors[`team_${index}_bill`] ? 'is-invalid' : ''}`}
                      value={member.proposedBillRate}
                      onChange={(e) => onChange(member.id, 'proposedBillRate', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                    {errors[`team_${index}_bill`] && (
                      <div className="astek-error-message">{errors[`team_${index}_bill`]}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Calculated Margins Display */}
              <div className="wizard-team-margins">
                <div className="wizard-team-margin-item">
                  <span className="wizard-team-margin-label">Marge brute:</span>
                  <span className="wizard-team-margin-value">
                    {member.grossMarginAmount.toFixed(2)} $ 
                    ({member.grossMarginPercent.toFixed(1)}%)
                  </span>
                </div>
                <div className="wizard-team-margin-item">
                  <span className="wizard-team-margin-label">Marge nette:</span>
                  <span className="wizard-team-margin-value">
                    {member.netMarginPercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
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
}

export const ValidationRequestStep = ({
  data,
  createdByEmail,
  approverEmail,
}: ValidationRequestStepProps) => {
  const avgTeamMargin = data.teamMembers.length > 0
    ? data.teamMembers.reduce((sum, m) => sum + m.grossMarginPercent, 0) / data.teamMembers.length
    : 0;

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
