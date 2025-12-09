import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import type { BusinessUnitDto } from '../services/businessUnitsApi';
import type { SectorDto } from '../services/sectorsApi';
import { getAvailableSectors, createSector } from '../services/sectorsApi';
import './BusinessUnitFormModal.css';

export interface BusinessUnitFormValues {
  name: string;
  managerName: string;
  sectorIds: number[];
}

interface BusinessUnitFormModalNewProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialBusinessUnit?: BusinessUnitDto;
  onClose: () => void;
  onSave: (data: BusinessUnitFormValues) => Promise<void>;
}

interface FormErrors {
  name?: string;
  managerName?: string;
}

const initialFormState: BusinessUnitFormValues = {
  name: '',
  managerName: '',
  sectorIds: [],
};

export const BusinessUnitFormModalNew = ({
  isOpen,
  mode,
  initialBusinessUnit,
  onClose,
  onSave,
}: BusinessUnitFormModalNewProps) => {
  const [formData, setFormData] = useState<BusinessUnitFormValues>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSectors, setAvailableSectors] = useState<SectorDto[]>([]);
  const [isLoadingSectors, setIsLoadingSectors] = useState(false);
  const [showCreateSector, setShowCreateSector] = useState(false);
  const [newSectorName, setNewSectorName] = useState('');
  const [isCreatingSector, setIsCreatingSector] = useState(false);

  // Load available sectors when modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialBusinessUnit) {
        setFormData({
          name: initialBusinessUnit.name,
          managerName: initialBusinessUnit.managerName,
          sectorIds: initialBusinessUnit.sectors.map(s => s.id),
        });
      } else {
        setFormData(initialFormState);
      }
      setErrors({});
      setIsSubmitting(false);
      loadAvailableSectors();
    }
  }, [isOpen, mode, initialBusinessUnit]);

  const loadAvailableSectors = async () => {
    setIsLoadingSectors(true);
    try {
      const businessUnitId = mode === 'edit' && initialBusinessUnit ? initialBusinessUnit.id : undefined;
      const sectors = await getAvailableSectors(businessUnitId);
      setAvailableSectors(sectors);
    } catch (error) {
      toast.error('Erreur lors du chargement des secteurs');
      console.error(error);
    } finally {
      setIsLoadingSectors(false);
    }
  };

  const handleCreateSector = async () => {
    if (!newSectorName.trim()) {
      toast.error('Le nom du secteur est obligatoire');
      return;
    }

    setIsCreatingSector(true);
    try {
      const newSector = await createSector({ name: newSectorName.trim() });
      toast.success(`Secteur "${newSector.name}" créé avec succès`);
      
      // Reload available sectors
      await loadAvailableSectors();
      
      // Auto-select the newly created sector
      setFormData(prev => ({
        ...prev,
        sectorIds: [...prev.sectorIds, newSector.id],
      }));
      
      // Reset and close sector creation form
      setNewSectorName('');
      setShowCreateSector(false);
    } catch (error) {
      toast.error((error as Error).message || 'Erreur lors de la création du secteur');
    } finally {
      setIsCreatingSector(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est obligatoire';
    }

    if (!formData.managerName.trim()) {
      newErrors.managerName = 'Le nom du responsable est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof BusinessUnitFormValues, value: string | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field in errors) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSectorToggle = (sectorId: number) => {
    setFormData(prev => ({
      ...prev,
      sectorIds: prev.sectorIds.includes(sectorId)
        ? prev.sectorIds.filter(id => id !== sectorId)
        : [...prev.sectorIds, sectorId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      // Error is already handled in the parent component
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
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

              {/* Code - Display only for edit mode */}
              {mode === 'edit' && initialBusinessUnit && (
                <div className="astek-col-2">
                  <div className="astek-form-group">
                    <label htmlFor="code" className="astek-label">
                      Code
                    </label>
                    <input
                      type="text"
                      id="code"
                      className="astek-input"
                      value={initialBusinessUnit.code}
                      disabled
                      style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                    />
                    <small style={{ color: '#6b7280', fontSize: '12px' }}>
                      Le code est généré automatiquement
                    </small>
                  </div>
                </div>
              )}

              {/* Manager Name */}
              <div className={mode === 'create' ? 'astek-col-1' : 'astek-col-2'}>
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

              {/* Sectors Multi-Select */}
              <div className="astek-col-1">
                <div className="astek-form-group">
                  <label className="astek-label">
                    Secteurs
                    {formData.sectorIds.length > 0 && (
                      <span style={{ marginLeft: '8px', color: '#6b7280', fontWeight: 'normal' }}>
                        ({formData.sectorIds.length} sélectionné{formData.sectorIds.length > 1 ? 's' : ''})
                      </span>
                    )}
                  </label>
                  
                  {isLoadingSectors ? (
                    <div style={{ padding: '12px', color: '#6b7280' }}>Chargement des secteurs...</div>
                  ) : (
                    <div className="sector-list" style={{
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '12px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      background: '#fff'
                    }}>
                      {availableSectors.length === 0 ? (
                        <div style={{ color: '#6b7280', textAlign: 'center', padding: '12px' }}>
                          Aucun secteur disponible
                        </div>
                      ) : (
                        availableSectors.map(sector => (
                          <label
                            key={sector.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '8px',
                              cursor: 'pointer',
                              borderRadius: '4px',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <input
                              type="checkbox"
                              checked={formData.sectorIds.includes(sector.id)}
                              onChange={() => handleSectorToggle(sector.id)}
                              disabled={isSubmitting}
                              style={{ marginRight: '8px' }}
                            />
                            <span>{sector.name}</span>
                            {sector.businessUnitId && (
                              <span style={{
                                marginLeft: 'auto',
                                fontSize: '11px',
                                color: '#6b7280',
                                fontStyle: 'italic'
                              }}>
                                (assigné à cette BU)
                              </span>
                            )}
                          </label>
                        ))
                      )}
                    </div>
                  )}

                  {/* Create Sector Section */}
                  {!showCreateSector ? (
                    <button
                      type="button"
                      onClick={() => setShowCreateSector(true)}
                      disabled={isSubmitting}
                      style={{
                        marginTop: '8px',
                        padding: '6px 12px',
                        fontSize: '13px',
                        color: '#2563eb',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      + Créer un nouveau secteur
                    </button>
                  ) : (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      background: '#f9fafb'
                    }}>
                      <label className="astek-label" style={{ fontSize: '13px' }}>
                        Nouveau secteur
                      </label>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <input
                          type="text"
                          className="astek-input"
                          value={newSectorName}
                          onChange={(e) => setNewSectorName(e.target.value)}
                          placeholder="Ex: Healthcare"
                          disabled={isCreatingSector || isSubmitting}
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={handleCreateSector}
                          disabled={isCreatingSector || isSubmitting || !newSectorName.trim()}
                          className="astek-btn astek-btn-secondary"
                          style={{ padding: '8px 16px', fontSize: '13px' }}
                        >
                          {isCreatingSector ? 'Création...' : 'Créer'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateSector(false);
                            setNewSectorName('');
                          }}
                          disabled={isCreatingSector || isSubmitting}
                          className="astek-btn astek-btn-secondary"
                          style={{ padding: '8px 16px', fontSize: '13px' }}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bu-modal-footer">
            <button
              type="button"
              className="astek-btn astek-btn-secondary"
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
              {isSubmitting ? 'En cours...' : (mode === 'create' ? 'Créer' : 'Modifier')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
