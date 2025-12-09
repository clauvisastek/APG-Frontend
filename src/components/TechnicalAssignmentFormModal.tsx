import { useState } from 'react';
import { technicalAssignmentsApi } from '../services/technicalAssignmentsApi';
import type { 
  TechnicalAssignment, 
  CreateTechnicalAssignmentInput,
  Seniority,
  AssignmentStatus 
} from '../types/technicalAssignment';
import './TechnicalAssignmentFormModal.css';

interface TechnicalAssignmentFormModalProps {
  assignment?: TechnicalAssignment;
  onClose: () => void;
  onSuccess: () => void;
}

export const TechnicalAssignmentFormModal = ({ 
  assignment, 
  onClose, 
  onSuccess 
}: TechnicalAssignmentFormModalProps) => {
  const isEditing = !!assignment;
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<CreateTechnicalAssignmentInput>({
    clientId: assignment?.clientId || '',
    clientName: assignment?.clientName || '',
    businessUnitCode: assignment?.businessUnitCode || 'BU-1',
    department: assignment?.department || '',
    jobFamily: assignment?.jobFamily || '',
    seniority: assignment?.seniority || 'Intermédiaire',
    resourceId: assignment?.resourceId || '',
    resourceName: assignment?.resourceName || '',
    startDate: assignment?.startDate || '',
    endDate: assignment?.endDate || null,
    dailyCostRate: assignment?.dailyCostRate || 0,
    dailySellRate: assignment?.dailySellRate || 0,
    status: assignment?.status || 'Actif',
    industry: assignment?.industry || '',
    notes: assignment?.notes || '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Calculate margin rate
  const marginRate = formData.dailySellRate > 0 
    ? (((formData.dailySellRate - formData.dailyCostRate) / formData.dailySellRate) * 100).toFixed(2)
    : '0';
  
  const handleChange = (field: keyof CreateTechnicalAssignmentInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };
  
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Le client est requis';
    }
    if (!formData.department.trim()) {
      newErrors.department = 'Le département est requis';
    }
    if (!formData.businessUnitCode) {
      newErrors.businessUnitCode = 'La Business Unit est requise';
    }
    if (!formData.jobFamily.trim()) {
      newErrors.jobFamily = 'Le métier est requis';
    }
    if (!formData.resourceName.trim()) {
      newErrors.resourceName = 'Le nom de la ressource est requis';
    }
    if (!formData.industry.trim()) {
      newErrors.industry = "Le secteur d'activité est requis";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.startDate) {
      newErrors.startDate = 'La date de début est requise';
    }
    if (formData.dailyCostRate <= 0) {
      newErrors.dailyCostRate = 'Le taux coûtant doit être supérieur à 0';
    }
    if (formData.dailySellRate <= 0) {
      newErrors.dailySellRate = 'Le taux vendu doit être supérieur à 0';
    }
    if (formData.dailySellRate < formData.dailyCostRate) {
      newErrors.dailySellRate = 'Le taux vendu doit être supérieur au taux coûtant';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };
  
  const handleBack = () => {
    setCurrentStep(1);
  };
  
  const handleSubmit = async () => {
    if (!validateStep2()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditing && assignment) {
        await technicalAssignmentsApi.update(assignment.id, formData);
      } else {
        await technicalAssignmentsApi.create({
          ...formData,
          clientId: formData.clientId || `client-${Date.now()}`,
          resourceId: formData.resourceId || `resource-${Date.now()}`,
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert("Erreur lors de la sauvegarde de la mission AT");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const jobFamilies = ['Java', 'Architecte', 'BI', 'SAP', 'DevOps', '.NET', 'Python', 'React', 'Angular', 'Data Science'];
  const seniorities: Seniority[] = ['Junior', 'Intermédiaire', 'Sénior', 'Expert'];
  const statuses: AssignmentStatus[] = ['Actif', 'En attente', 'Terminé', 'En risque'];
  const businessUnits = ['BU-1', 'BU-2', 'BU-3'];
  const industries = ['Bancaire', 'Assurance', 'Technologie', 'Conseil', 'Télécommunications', 'Énergie', 'Santé'];
  
  return (
    <div className="at-modal-overlay" onClick={onClose}>
      <div className="at-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="at-modal-header">
          <h2>{isEditing ? 'Modifier la mission AT' : 'Nouvelle mission AT'}</h2>
          <button onClick={onClose} className="at-modal-close">×</button>
        </div>
        
        {/* Step indicator */}
        <div className="at-steps">
          <div className={`at-step ${currentStep >= 1 ? 'active' : ''}`}>
            <div className="at-step-number">1</div>
            <div className="at-step-label">Informations générales</div>
          </div>
          <div className="at-step-line" />
          <div className={`at-step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="at-step-number">2</div>
            <div className="at-step-label">Détails financiers</div>
          </div>
        </div>
        
        <div className="at-modal-body">
          {currentStep === 1 && (
            <div className="at-form-step">
              <div className="at-form-grid">
                <div className="astek-form-group">
                  <label>Client *</label>
                  <input
                    type="text"
                    className={`astek-input ${errors.clientName ? 'error' : ''}`}
                    value={formData.clientName}
                    onChange={(e) => handleChange('clientName', e.target.value)}
                    placeholder="Nom du client"
                  />
                  {errors.clientName && <span className="at-error">{errors.clientName}</span>}
                </div>
                
                <div className="astek-form-group">
                  <label>Département *</label>
                  <input
                    type="text"
                    className={`astek-input ${errors.department ? 'error' : ''}`}
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    placeholder="ex: TI – Canaux numériques"
                  />
                  {errors.department && <span className="at-error">{errors.department}</span>}
                </div>
                
                <div className="astek-form-group">
                  <label>Business Unit *</label>
                  <select
                    className={`astek-select ${errors.businessUnitCode ? 'error' : ''}`}
                    value={formData.businessUnitCode}
                    onChange={(e) => handleChange('businessUnitCode', e.target.value)}
                  >
                    {businessUnits.map(bu => (
                      <option key={bu} value={bu}>{bu}</option>
                    ))}
                  </select>
                  {errors.businessUnitCode && <span className="at-error">{errors.businessUnitCode}</span>}
                </div>
                
                <div className="astek-form-group">
                  <label>Secteur d'activité *</label>
                  <select
                    className={`astek-select ${errors.industry ? 'error' : ''}`}
                    value={formData.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                  >
                    <option value="">Sélectionner...</option>
                    {industries.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                  {errors.industry && <span className="at-error">{errors.industry}</span>}
                </div>
                
                <div className="astek-form-group">
                  <label>Métier *</label>
                  <select
                    className={`astek-select ${errors.jobFamily ? 'error' : ''}`}
                    value={formData.jobFamily}
                    onChange={(e) => handleChange('jobFamily', e.target.value)}
                  >
                    <option value="">Sélectionner...</option>
                    {jobFamilies.map(job => (
                      <option key={job} value={job}>{job}</option>
                    ))}
                  </select>
                  {errors.jobFamily && <span className="at-error">{errors.jobFamily}</span>}
                </div>
                
                <div className="astek-form-group">
                  <label>Séniorité *</label>
                  <select
                    className="astek-select"
                    value={formData.seniority}
                    onChange={(e) => handleChange('seniority', e.target.value as Seniority)}
                  >
                    {seniorities.map(sen => (
                      <option key={sen} value={sen}>{sen}</option>
                    ))}
                  </select>
                </div>
                
                <div className="astek-form-group">
                  <label>Ressource *</label>
                  <input
                    type="text"
                    className={`astek-input ${errors.resourceName ? 'error' : ''}`}
                    value={formData.resourceName}
                    onChange={(e) => handleChange('resourceName', e.target.value)}
                    placeholder="Nom de la ressource"
                  />
                  {errors.resourceName && <span className="at-error">{errors.resourceName}</span>}
                </div>
                
                <div className="astek-form-group">
                  <label>Statut *</label>
                  <select
                    className="astek-select"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value as AssignmentStatus)}
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="at-form-step">
              <div className="at-form-grid">
                <div className="astek-form-group">
                  <label>Date de début *</label>
                  <input
                    type="date"
                    className={`astek-input ${errors.startDate ? 'error' : ''}`}
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                  />
                  {errors.startDate && <span className="at-error">{errors.startDate}</span>}
                </div>
                
                <div className="astek-form-group">
                  <label>Date de fin</label>
                  <input
                    type="date"
                    className="astek-input"
                    value={formData.endDate || ''}
                    onChange={(e) => handleChange('endDate', e.target.value || null)}
                  />
                  <small style={{ color: '#64748b' }}>Laisser vide si la mission est en cours</small>
                </div>
                
                <div className="astek-form-group">
                  <label>Taux coûtant journalier ($) *</label>
                  <input
                    type="number"
                    className={`astek-input ${errors.dailyCostRate ? 'error' : ''}`}
                    value={formData.dailyCostRate || ''}
                    onChange={(e) => handleChange('dailyCostRate', Number(e.target.value))}
                    placeholder="600"
                    min="0"
                    step="50"
                  />
                  {errors.dailyCostRate && <span className="at-error">{errors.dailyCostRate}</span>}
                </div>
                
                <div className="astek-form-group">
                  <label>Taux vendu journalier ($) *</label>
                  <input
                    type="number"
                    className={`astek-input ${errors.dailySellRate ? 'error' : ''}`}
                    value={formData.dailySellRate || ''}
                    onChange={(e) => handleChange('dailySellRate', Number(e.target.value))}
                    placeholder="900"
                    min="0"
                    step="50"
                  />
                  {errors.dailySellRate && <span className="at-error">{errors.dailySellRate}</span>}
                </div>
                
                <div className="at-margin-preview">
                  <div className="at-margin-label">Marge calculée</div>
                  <div className="at-margin-value">
                    <span className="at-margin-percent">{marginRate}%</span>
                    <div className="at-margin-bar-large">
                      <div 
                        className="at-margin-fill-large"
                        style={{
                          width: `${Math.min(Number(marginRate), 100)}%`,
                          backgroundColor: Number(marginRate) >= 35 ? '#22c55e' : 
                                         Number(marginRate) >= 25 ? '#eab308' : '#ef4444'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="astek-form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Notes</label>
                <textarea
                  className="astek-textarea"
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Notes ou commentaires additionnels..."
                  rows={4}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="at-modal-footer">
          {currentStep === 1 ? (
            <>
              <button onClick={onClose} className="astek-btn astek-btn-secondary">
                Annuler
              </button>
              <button onClick={handleNext} className="astek-btn astek-btn-primary">
                Suivant
              </button>
            </>
          ) : (
            <>
              <button onClick={handleBack} className="astek-btn astek-btn-secondary">
                Retour
              </button>
              <button 
                onClick={handleSubmit} 
                className="astek-btn astek-btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enregistrement...' : (isEditing ? 'Enregistrer' : 'Créer')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
