import { useState, useEffect } from 'react';
import type { BusinessUnit } from '../types';
import './BusinessUnitFormModal.css';

export interface BusinessUnitFormValues {
  id?: string;
  name: string;
  code: string;
  sector: string;
  leader: string;
}

interface BusinessUnitFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialBusinessUnit?: BusinessUnit;
  onClose: () => void;
  onSave: (businessUnit: BusinessUnitFormValues) => void;
}

interface FormErrors {
  name?: string;
  code?: string;
  sector?: string;
  leader?: string;
}

const initialFormState: BusinessUnitFormValues = {
  name: '',
  code: '',
  sector: '',
  leader: '',
};

export const BusinessUnitFormModal = ({
  isOpen,
  mode,
  initialBusinessUnit,
  onClose,
  onSave,
}: BusinessUnitFormModalProps) => {
  const [formData, setFormData] = useState<BusinessUnitFormValues>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialBusinessUnit) {
        setFormData({
          id: initialBusinessUnit.id,
          name: initialBusinessUnit.name,
          code: initialBusinessUnit.code,
          sector: initialBusinessUnit.sector,
          leader: initialBusinessUnit.leader,
        });
      } else {
        setFormData(initialFormState);
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, mode, initialBusinessUnit]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est obligatoire';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Le code est obligatoire';
    } else if (!/^[A-Z0-9-]+$/.test(formData.code)) {
      newErrors.code = 'Le code doit contenir uniquement des lettres majuscules, chiffres et tirets';
    }

    if (!formData.sector.trim()) {
      newErrors.sector = 'Le secteur est obligatoire';
    }

    if (!formData.leader.trim()) {
      newErrors.leader = 'Le responsable est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof BusinessUnitFormValues, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
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
    <div className="bu-modal-overlay" onClick={handleClose}>
      <div className="bu-modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="bu-modal-form">
          <div className="bu-modal-header">
            <h2 className="bu-modal-title">
              {mode === 'create' ? 'Nouvelle Business Unit' : 'Modifier la Business Unit'}
            </h2>
            <button
              type="button"
              className="bu-modal-close"
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label="Fermer"
            >
              ×
            </button>
          </div>

          <div className="bu-modal-body">
            <div className="astek-form-grid">
              {/* Name */}
              <div className="astek-col-1">
                <div className="astek-form-group">
                  <label htmlFor="name" className="astek-label">
                    Nom <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    className={`astek-input ${errors.name ? 'is-invalid' : ''}`}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Ex: Banking France"
                  />
                  {errors.name && <div className="astek-error-message">{errors.name}</div>}
                </div>
              </div>

              {/* Code */}
              <div className="astek-col-2">
                <div className="astek-form-group">
                  <label htmlFor="code" className="astek-label">
                    Code <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="code"
                    className={`astek-input ${errors.code ? 'is-invalid' : ''}`}
                    value={formData.code}
                    onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                    disabled={isSubmitting}
                    placeholder="Ex: BU-FR-1"
                  />
                  {errors.code && <div className="astek-error-message">{errors.code}</div>}
                </div>
              </div>

              {/* Sector */}
              <div className="astek-col-2">
                <div className="astek-form-group">
                  <label htmlFor="sector" className="astek-label">
                    Secteur <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="sector"
                    className={`astek-input ${errors.sector ? 'is-invalid' : ''}`}
                    value={formData.sector}
                    onChange={(e) => handleChange('sector', e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Ex: Banking, Energy, Telecom"
                  />
                  {errors.sector && <div className="astek-error-message">{errors.sector}</div>}
                </div>
              </div>

              {/* Leader */}
              <div className="astek-col-1">
                <div className="astek-form-group">
                  <label htmlFor="leader" className="astek-label">
                    Responsable <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="leader"
                    className={`astek-input ${errors.leader ? 'is-invalid' : ''}`}
                    value={formData.leader}
                    onChange={(e) => handleChange('leader', e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Ex: Jean Dupont"
                  />
                  {errors.leader && <div className="astek-error-message">{errors.leader}</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="bu-modal-footer">
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
              {isSubmitting ? 'Enregistrement...' : mode === 'create' ? 'Créer' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
