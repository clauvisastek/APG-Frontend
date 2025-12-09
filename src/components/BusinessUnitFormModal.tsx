import { useState, useEffect } from 'react';
import type { BusinessUnit } from '../types';
import './BusinessUnitFormModal.css';

export interface BusinessUnitFormValues {
  id?: string;
  name: string;
  code: string;
  managerName: string;
  isActive?: boolean;
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
  managerName?: string;
}

const initialFormState: BusinessUnitFormValues = {
  name: '',
  code: '',
  managerName: '',
  isActive: true,
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
          managerName: initialBusinessUnit.managerName,
          isActive: initialBusinessUnit.isActive,
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

    if (!formData.managerName.trim()) {
      newErrors.managerName = 'Le responsable est obligatoire';
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

              {/* Manager Name */}
              <div className="astek-col-1">
                <div className="astek-form-group">
                  <label htmlFor="managerName" className="astek-label">
                    Responsable <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="managerName"
                    className={`astek-input ${errors.managerName ? 'is-invalid' : ''}`}
                    value={formData.managerName}
                    onChange={(e) => handleChange('managerName', e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Ex: Jean Dupont"
                  />
                  {errors.managerName && <div className="astek-error-message">{errors.managerName}</div>}
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
