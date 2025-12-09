import { useState, useEffect } from 'react';
import type { Project, ProjectType, ProjectStatus, Currency } from '../types';
import './ProjectFormModal.css';

export interface ProjectFormValues {
  id?: string;
  name: string;
  code: string;
  clientName: string;
  type: ProjectType;
  currency: Currency;
  responsibleName: string;
  startDate: string;
  endDate: string;
  targetMargin: number;
  minMargin: number;
  status: ProjectStatus;
  notes?: string;
}

interface ProjectFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialProject?: Project;
  onClose: () => void;
  onSave: (project: ProjectFormValues) => void;
}

interface FormErrors {
  name?: string;
  code?: string;
  clientName?: string;
  type?: string;
  currency?: string;
  responsibleName?: string;
  startDate?: string;
  endDate?: string;
  targetMargin?: string;
  minMargin?: string;
  status?: string;
}

const initialFormState: ProjectFormValues = {
  name: '',
  code: '',
  clientName: '',
  type: 'T&M' as ProjectType,
  currency: 'CAD' as Currency,
  responsibleName: '',
  startDate: '',
  endDate: '',
  targetMargin: 20,
  minMargin: 15,
  status: 'Actif' as ProjectStatus,
  notes: '',
};

export const ProjectFormModal = ({
  isOpen,
  mode,
  initialProject,
  onClose,
  onSave,
}: ProjectFormModalProps) => {
  const [formData, setFormData] = useState<ProjectFormValues>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens or project changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialProject) {
        setFormData({
          id: initialProject.id,
          name: initialProject.name,
          code: initialProject.code || '',
          clientName: initialProject.client?.name || '',
          type: initialProject.type,
          currency: initialProject.currency,
          responsibleName: initialProject.responsibleName || '',
          startDate: initialProject.startDate.split('T')[0], // Extract date part
          endDate: initialProject.endDate.split('T')[0],
          targetMargin: initialProject.targetMargin,
          minMargin: initialProject.minMargin,
          status: initialProject.status,
          notes: initialProject.notes || '',
        });
      } else {
        setFormData(initialFormState);
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, mode, initialProject]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ce champ est obligatoire';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Ce champ est obligatoire';
    }

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Ce champ est obligatoire';
    }

    if (!formData.type) {
      newErrors.type = 'Ce champ est obligatoire';
    }

    if (!formData.currency) {
      newErrors.currency = 'Ce champ est obligatoire';
    }

    if (!formData.responsibleName.trim()) {
      newErrors.responsibleName = 'Ce champ est obligatoire';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Ce champ est obligatoire';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Ce champ est obligatoire';
    }

    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'La date de fin doit être postérieure ou égale à la date de début';
    }

    if (formData.targetMargin < 0 || formData.targetMargin > 100) {
      newErrors.targetMargin = 'La marge doit être entre 0 et 100';
    }

    if (formData.minMargin < 0 || formData.minMargin > 100) {
      newErrors.minMargin = 'La marge doit être entre 0 et 100';
    }

    if (formData.minMargin > formData.targetMargin) {
      newErrors.minMargin = 'La marge minimale doit être inférieure ou égale à la marge cible';
    }

    if (!formData.status) {
      newErrors.status = 'Ce champ est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof ProjectFormValues, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (field in errors) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    onSave(formData);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="project-modal-overlay" onClick={handleClose}>
      <div className="project-modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="project-modal-form">
          <div className="project-modal-header">
            <h2 className="project-modal-title">
              {mode === 'create' ? 'Nouveau projet' : 'Modifier le projet'}
            </h2>
            <button
              type="button"
              className="project-modal-close"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>

          <div className="project-modal-body project-modal-body-scrollable">
            {/* Nom du projet */}
            <div className="astek-form-group">
              <label htmlFor="name" className="astek-label">
                Nom du projet <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="name"
                className={`astek-input ${errors.name ? 'is-invalid' : ''}`}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={isSubmitting}
              />
              {errors.name && <div className="astek-error-message">{errors.name}</div>}
            </div>

            {/* Code */}
            <div className="astek-form-group">
              <label htmlFor="code" className="astek-label">
                Code <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="code"
                className={`astek-input ${errors.code ? 'is-invalid' : ''}`}
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                disabled={isSubmitting}
              />
              {errors.code && <div className="astek-error-message">{errors.code}</div>}
            </div>

            {/* Client */}
            <div className="astek-form-group">
              <label htmlFor="clientName" className="astek-label">
                Client <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="clientName"
                className={`astek-input ${errors.clientName ? 'is-invalid' : ''}`}
                value={formData.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
                disabled={isSubmitting}
                placeholder="Nom du client"
              />
              {errors.clientName && <div className="astek-error-message">{errors.clientName}</div>}
            </div>

            <div className="astek-row">
              {/* Type de projet */}
              <div className="astek-col-2">
                <div className="astek-form-group">
                  <label htmlFor="type" className="astek-label">
                    Type de projet <span className="required-star">*</span>
                  </label>
                  <select
                    id="type"
                    className={`astek-select ${errors.type ? 'is-invalid' : ''}`}
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="T&M">T&M (Temps et matériel)</option>
                    <option value="Forfait">Forfait (Prix fixe)</option>
                    <option value="Autre">Autre</option>
                  </select>
                  {errors.type && <div className="astek-error-message">{errors.type}</div>}
                </div>
              </div>

              {/* Devise */}
              <div className="astek-col-2">
                <div className="astek-form-group">
                  <label htmlFor="currency" className="astek-label">
                    Devise <span className="required-star">*</span>
                  </label>
                  <select
                    id="currency"
                    className={`astek-select ${errors.currency ? 'is-invalid' : ''}`}
                    value={formData.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="CAD">CAD (Dollar canadien)</option>
                    <option value="USD">USD (Dollar américain)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                  {errors.currency && <div className="astek-error-message">{errors.currency}</div>}
                </div>
              </div>
            </div>

            {/* Responsable */}
            <div className="astek-form-group">
              <label htmlFor="responsibleName" className="astek-label">
                Responsable de projet <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="responsibleName"
                className={`astek-input ${errors.responsibleName ? 'is-invalid' : ''}`}
                value={formData.responsibleName}
                onChange={(e) => handleChange('responsibleName', e.target.value)}
                disabled={isSubmitting}
              />
              {errors.responsibleName && <div className="astek-error-message">{errors.responsibleName}</div>}
            </div>

            <div className="astek-row">
              {/* Date de début */}
              <div className="astek-col-2">
                <div className="astek-form-group">
                  <label htmlFor="startDate" className="astek-label">
                    Date de début <span className="required-star">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    className={`astek-input ${errors.startDate ? 'is-invalid' : ''}`}
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.startDate && <div className="astek-error-message">{errors.startDate}</div>}
                </div>
              </div>

              {/* Date de fin */}
              <div className="astek-col-2">
                <div className="astek-form-group">
                  <label htmlFor="endDate" className="astek-label">
                    Date de fin prévue <span className="required-star">*</span>
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    className={`astek-input ${errors.endDate ? 'is-invalid' : ''}`}
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.endDate && <div className="astek-error-message">{errors.endDate}</div>}
                </div>
              </div>
            </div>

            <div className="astek-row">
              {/* Marge cible */}
              <div className="astek-col-2">
                <div className="astek-form-group">
                  <label htmlFor="targetMargin" className="astek-label">
                    Marge cible (%) <span className="required-star">*</span>
                  </label>
                  <input
                    type="number"
                    id="targetMargin"
                    className={`astek-input ${errors.targetMargin ? 'is-invalid' : ''}`}
                    value={formData.targetMargin}
                    onChange={(e) => handleChange('targetMargin', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                    disabled={isSubmitting}
                  />
                  {errors.targetMargin && <div className="astek-error-message">{errors.targetMargin}</div>}
                </div>
              </div>

              {/* Marge minimale */}
              <div className="astek-col-2">
                <div className="astek-form-group">
                  <label htmlFor="minMargin" className="astek-label">
                    Marge minimale (%) <span className="required-star">*</span>
                  </label>
                  <input
                    type="number"
                    id="minMargin"
                    className={`astek-input ${errors.minMargin ? 'is-invalid' : ''}`}
                    value={formData.minMargin}
                    onChange={(e) => handleChange('minMargin', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                    disabled={isSubmitting}
                  />
                  {errors.minMargin && <div className="astek-error-message">{errors.minMargin}</div>}
                </div>
              </div>
            </div>

            {/* Statut */}
            <div className="astek-form-group">
              <label htmlFor="status" className="astek-label">
                Statut <span className="required-star">*</span>
              </label>
              <select
                id="status"
                className={`astek-select ${errors.status ? 'is-invalid' : ''}`}
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                disabled={isSubmitting}
              >
                <option value="En construction">En construction</option>
                <option value="Actif">Actif</option>
                <option value="Terminé">Terminé</option>
                <option value="En pause">En pause</option>
              </select>
              {errors.status && <div className="astek-error-message">{errors.status}</div>}
            </div>

            {/* Notes */}
            <div className="astek-form-group">
              <label htmlFor="notes" className="astek-label">
                Notes / Commentaires
              </label>
              <textarea
                id="notes"
                className="astek-textarea"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                disabled={isSubmitting}
                rows={4}
                placeholder="Notes ou commentaires additionnels..."
              />
            </div>
          </div>
          {/* End of scrollable body */}

          <div className="project-modal-footer">
            <button
              type="button"
              className="astek-btn astek-btn-ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="astek-btn astek-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="astek-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', marginRight: '8px' }}></span>
                  Enregistrement...
                </>
              ) : (
                'Enregistrer le projet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
