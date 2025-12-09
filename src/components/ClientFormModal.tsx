import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useBusinessUnits, useCountries, useCurrencies, useSectors, useCreateCountry, useCreateCurrency } from '../hooks/useApi';
import { useUserBusinessUnitFilter } from '../hooks/useUserBusinessUnitFilter';
import { QuickCreateCountry, QuickCreateCurrency } from './QuickCreateModal';
import type { Client } from '../types';
import { hasAnyRole } from '../utils/roleHelpers';
import './ClientFormModal.css';

export interface ClientFormValues {
  id?: string;
  name: string;
  code: string;
  sectorId: string;
  country: string; // Country ID
  defaultCurrency: string; // Currency ID
  defaultTargetMarginPercent?: number;
  defaultMinimumMarginPercent?: number;
  discountPercent?: number;
  forcedVacationDaysPerYear?: number;
  targetHourlyRate?: number;
  contactName: string;
  contactEmail: string;
  businessUnitId: number;
}

interface ClientFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialClient?: Client;
  onClose: () => void;
  onSave: (client: ClientFormValues) => void;
}

interface FormErrors {
  name?: string;
  code?: string;
  sectorId?: string;
  country?: string;
  defaultCurrency?: string;
  defaultTargetMarginPercent?: string;
  defaultMinimumMarginPercent?: string;
  discountPercent?: string;
  forcedVacationDaysPerYear?: string;
  targetHourlyRate?: string;
  contactName?: string;
  contactEmail?: string;
  businessUnitId?: string;
}

const initialFormState: ClientFormValues = {
  name: '',
  code: '',
  sectorId: '',
  country: '', // Will be populated from API
  defaultCurrency: '', // Will be populated from API
  defaultTargetMarginPercent: undefined,
  defaultMinimumMarginPercent: undefined,
  discountPercent: undefined,
  forcedVacationDaysPerYear: undefined,
  targetHourlyRate: undefined,
  contactName: '',
  contactEmail: '',
  businessUnitId: 0,
};

export const ClientFormModal = ({
  isOpen,
  mode,
  initialClient,
  onClose,
  onSave,
}: ClientFormModalProps) => {
  const { user } = useAuth0();
  const buFilter = useUserBusinessUnitFilter();
  const { data: businessUnits, isLoading: isLoadingBUs } = useBusinessUnits();
  const { data: countries, isLoading: isLoadingCountries } = useCountries();
  const { data: currencies, isLoading: isLoadingCurrencies } = useCurrencies();
  const { data: sectors, isLoading: isLoadingSectors } = useSectors();
  const [formData, setFormData] = useState<ClientFormValues>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const createCountryMutation = useCreateCountry();
  const createCurrencyMutation = useCreateCurrency();

  // Determine if user can edit financial fields (Admin and CFO only)
  const canEditFinancialFields = hasAnyRole(user, ['Admin', 'CFO']);

  // Users can select from available Business Units (filtered by API based on their roles)
  const hasBusinessUnits = (businessUnits?.length ?? 0) > 0;

  // Debug: Log business units data and user roles
  useEffect(() => {
    console.log('🏢 ClientFormModal - user:', user);
    console.log('🏢 ClientFormModal - user roles:', user?.['https://apg-astek.com/roles']);
    console.log('🏢 ClientFormModal - businessUnits:', businessUnits);
    console.log('🏢 ClientFormModal - isLoadingBUs:', isLoadingBUs);
    console.log('🏢 ClientFormModal - hasBusinessUnits:', hasBusinessUnits);
    console.log('🏢 ClientFormModal - canEditFinancialFields:', canEditFinancialFields);
  }, [businessUnits, isLoadingBUs, hasBusinessUnits, canEditFinancialFields, user]);

  // Reset form when modal opens or client changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialClient) {
        setFormData({
          id: initialClient.id.toString(),
          name: initialClient.name,
          code: initialClient.code || '',
          sectorId: initialClient.sectorId.toString(),
          country: initialClient.countryId.toString(),
          defaultCurrency: initialClient.currencyId.toString(),
          defaultTargetMarginPercent: initialClient.defaultTargetMarginPercent,
          defaultMinimumMarginPercent: initialClient.defaultMinimumMarginPercent,
          discountPercent: initialClient.discountPercent,
          forcedVacationDaysPerYear: initialClient.forcedVacationDaysPerYear,
          targetHourlyRate: initialClient.targetHourlyRate,
          contactName: initialClient.contactName || '',
          contactEmail: initialClient.contactEmail || '',
          businessUnitId: initialClient.businessUnitId,
        });
      } else {
        // For BU Leaders, pre-select their BU
        const initialBuId = buFilter.scope === 'bu' && buFilter.buId ? Number(buFilter.buId) : 0;
        // Set default country and currency to first available
        const defaultCountryId = countries?.[0]?.id.toString() || '';
        const defaultCurrencyId = currencies?.[0]?.id.toString() || '';
        setFormData({ 
          ...initialFormState, 
          businessUnitId: initialBuId,
          country: defaultCountryId,
          defaultCurrency: defaultCurrencyId,
        });
      }
      setErrors({});
      setIsSubmitting(false);
    }
    // Only re-run when modal opens/closes or mode/client changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, initialClient?.id, buFilter.scope, buFilter.buId]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ce champ est obligatoire';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Ce champ est obligatoire';
    }

    if (!formData.businessUnitId) {
      newErrors.businessUnitId = 'La Business Unit est obligatoire';
    }

    if (!formData.sectorId) {
      newErrors.sectorId = 'Ce champ est obligatoire';
    }

    // Validate financial fields only if provided and user can edit them
    if (canEditFinancialFields) {
      if (formData.discountPercent !== undefined && formData.discountPercent !== null) {
        if (formData.discountPercent < 0 || formData.discountPercent > 100) {
          newErrors.discountPercent = 'La remise doit être entre 0 et 100';
        }
      }

      if (formData.forcedVacationDaysPerYear !== undefined && formData.forcedVacationDaysPerYear !== null) {
        if (formData.forcedVacationDaysPerYear < 0 || formData.forcedVacationDaysPerYear > 365) {
          newErrors.forcedVacationDaysPerYear = 'Le nombre de jours doit être entre 0 et 365';
        }
      }

      if (formData.defaultTargetMarginPercent !== undefined && formData.defaultTargetMarginPercent !== null) {
        if (formData.defaultTargetMarginPercent < 0 || formData.defaultTargetMarginPercent > 100) {
          newErrors.defaultTargetMarginPercent = 'La marge doit être entre 0 et 100';
        }
      }

      if (formData.defaultMinimumMarginPercent !== undefined && formData.defaultMinimumMarginPercent !== null) {
        if (formData.defaultMinimumMarginPercent < 0 || formData.defaultMinimumMarginPercent > 100) {
          newErrors.defaultMinimumMarginPercent = 'La marge doit être entre 0 et 100';
        }
      }

      if (formData.defaultMinimumMarginPercent !== undefined && formData.defaultMinimumMarginPercent !== null &&
          formData.defaultTargetMarginPercent !== undefined && formData.defaultTargetMarginPercent !== null) {
        if (formData.defaultMinimumMarginPercent > formData.defaultTargetMarginPercent) {
          newErrors.defaultMinimumMarginPercent = 'La marge minimale doit être inférieure ou égale à la marge cible';
        }
      }

      if (formData.targetHourlyRate !== undefined && formData.targetHourlyRate !== null) {
        if (formData.targetHourlyRate <= 0) {
          newErrors.targetHourlyRate = 'Le vendant cible doit être supérieur à 0';
        }
      }
    }

    if (!formData.country) {
      newErrors.country = 'Ce champ est obligatoire';
    }

    if (!formData.defaultCurrency) {
      newErrors.defaultCurrency = 'Ce champ est obligatoire';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Ce champ est obligatoire';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Ce champ est obligatoire';
    } else if (!validateEmail(formData.contactEmail)) {
      newErrors.contactEmail = 'Format d\'email invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof ClientFormValues, value: string | number | undefined) => {
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

  const handleCreateCountry = async (name: string, isoCode: string) => {
    await createCountryMutation.mutateAsync({ name, isoCode });
  };

  const handleCreateCurrency = async (code: string, name: string, symbol: string) => {
    await createCurrencyMutation.mutateAsync({ code, name, symbol });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="client-modal-overlay" onClick={handleClose}>
      <div className="client-modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="client-modal-form">
          <div className="client-modal-header">
            <h2 className="client-modal-title">
              {mode === 'create' ? 'Nouveau client' : 'Modifier le client'}
            </h2>
            <button
              type="button"
              className="client-modal-close"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>
          <div className="client-modal-body client-modal-body-scrollable">
            {/* Nom du client */}
            <div className="astek-form-group">
              <label htmlFor="name" className="astek-label">
                Nom du client <span className="required-star">*</span>
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

            {/* Secteur */}
            <div className="astek-form-group">
              <label htmlFor="sectorId" className="astek-label">
                Secteur <span className="required-star">*</span>
              </label>
              <select
                id="sectorId"
                className={`astek-select ${errors.sectorId ? 'is-invalid' : ''}`}
                value={formData.sectorId}
                onChange={(e) => handleChange('sectorId', e.target.value)}
                disabled={isSubmitting || isLoadingSectors}
              >
                <option value="">Sélectionnez un secteur</option>
                {sectors?.map(sector => (
                  <option key={sector.id} value={sector.id.toString()}>
                    {sector.name}
                  </option>
                ))}
              </select>
              {errors.sectorId && <div className="astek-error-message">{errors.sectorId}</div>}
            </div>

            {/* Business Unit */}
            <div className="astek-form-group">
              <label htmlFor="businessUnit" className="astek-label">
                Business Unit <span className="required-star">*</span>
              </label>
              <select
                id="businessUnit"
                className={`astek-select ${errors.businessUnitId ? 'is-invalid' : ''}`}
                value={formData.businessUnitId}
                onChange={(e) => handleChange('businessUnitId', e.target.value)}
                disabled={isSubmitting || isLoadingBUs}
              >
                <option value="">Sélectionnez une Business Unit</option>
                {businessUnits?.map(bu => (
                  <option key={bu.id} value={bu.id}>
                    {bu.name} ({bu.code})
                  </option>
                ))}
              </select>
              {errors.businessUnitId && <div className="astek-error-message">{errors.businessUnitId}</div>}
              {buFilter.scope === 'bu' && hasBusinessUnits && (
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                  Vous ne pouvez créer des clients que pour vos Business Units assignées
                </div>
              )}
            </div>

            {/* Pays */}
            <div className="astek-form-group">
              <label htmlFor="country" className="astek-label">
                Pays <span className="required-star">*</span>
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <select
                  id="country"
                  className={`astek-select ${errors.country ? 'is-invalid' : ''}`}
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  disabled={isSubmitting || isLoadingCountries}
                  style={{ flex: 1 }}
                >
                  <option value="">Sélectionnez un pays</option>
                  {countries?.map(country => (
                    <option key={country.id} value={country.id.toString()}>
                      {country.name} ({country.isoCode})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="astek-btn astek-btn-ghost"
                  onClick={() => setShowCountryModal(true)}
                  disabled={isSubmitting}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  + Nouveau
                </button>
              </div>
              {errors.country && <div className="astek-error-message">{errors.country}</div>}
            </div>

            {/* Devise */}
            <div className="astek-form-group">
              <label htmlFor="currency" className="astek-label">
                Devise <span className="required-star">*</span>
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <select
                  id="currency"
                  className={`astek-select ${errors.defaultCurrency ? 'is-invalid' : ''}`}
                  value={formData.defaultCurrency}
                  onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                  disabled={isSubmitting || isLoadingCurrencies}
                  style={{ flex: 1 }}
                >
                  <option value="">Sélectionnez une devise</option>
                  {currencies?.map(currency => (
                    <option key={currency.id} value={currency.id.toString()}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="astek-btn astek-btn-ghost"
                  onClick={() => setShowCurrencyModal(true)}
                  disabled={isSubmitting}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  + Nouveau
                </button>
              </div>
              {errors.defaultCurrency && <div className="astek-error-message">{errors.defaultCurrency}</div>}
            </div>

            {/* Financial Fields - Only visible to Admin/CFO */}
            {canEditFinancialFields && (
              <>
                <div className="astek-row">
                  {/* Marge cible */}
                  <div className="astek-col-2">
                    <div className="astek-form-group">
                      <label htmlFor="targetMargin" className="astek-label">
                        Marge cible par défaut (%)
                      </label>
                      <input
                        type="number"
                        id="targetMargin"
                        className={`astek-input ${errors.defaultTargetMarginPercent ? 'is-invalid' : ''}`}
                        value={formData.defaultTargetMarginPercent ?? ''}
                        onChange={(e) => handleChange('defaultTargetMarginPercent', e.target.value ? parseFloat(e.target.value) : undefined)}
                        min="0"
                        max="100"
                        step="0.1"
                        disabled={isSubmitting}
                        placeholder="Optionnel"
                      />
                      {errors.defaultTargetMarginPercent && <div className="astek-error-message">{errors.defaultTargetMarginPercent}</div>}
                    </div>
                  </div>

                  {/* Marge minimale */}
                  <div className="astek-col-2">
                    <div className="astek-form-group">
                      <label htmlFor="minMargin" className="astek-label">
                        Marge minimale par défaut (%)
                      </label>
                      <input
                        type="number"
                        id="minMargin"
                        className={`astek-input ${errors.defaultMinimumMarginPercent ? 'is-invalid' : ''}`}
                        value={formData.defaultMinimumMarginPercent ?? ''}
                        onChange={(e) => handleChange('defaultMinimumMarginPercent', e.target.value ? parseFloat(e.target.value) : undefined)}
                        min="0"
                        max="100"
                        step="0.1"
                        disabled={isSubmitting}
                        placeholder="Optionnel"
                      />
                      {errors.defaultMinimumMarginPercent && <div className="astek-error-message">{errors.defaultMinimumMarginPercent}</div>}
                    </div>
                  </div>
                </div>

                <div className="astek-row">
                  {/* Remise */}
                  <div className="astek-col-2">
                    <div className="astek-form-group">
                      <label htmlFor="discountPercent" className="astek-label">
                        Remise (%)
                      </label>
                      <input
                        type="number"
                        id="discountPercent"
                        className={`astek-input ${errors.discountPercent ? 'is-invalid' : ''}`}
                        value={formData.discountPercent ?? ''}
                        onChange={(e) => handleChange('discountPercent', e.target.value ? parseFloat(e.target.value) : undefined)}
                        min="0"
                        max="100"
                        step="0.1"
                        disabled={isSubmitting}
                        placeholder="Optionnel"
                      />
                      {errors.discountPercent && <div className="astek-error-message">{errors.discountPercent}</div>}
                    </div>
                  </div>

                  {/* Jours de vacances forcés */}
                  <div className="astek-col-2">
                    <div className="astek-form-group">
                      <label htmlFor="forcedVacationDaysPerYear" className="astek-label">
                        Jours de vacances forcés par an
                      </label>
                      <input
                        type="number"
                        id="forcedVacationDaysPerYear"
                        className={`astek-input ${errors.forcedVacationDaysPerYear ? 'is-invalid' : ''}`}
                        value={formData.forcedVacationDaysPerYear ?? ''}
                        onChange={(e) => handleChange('forcedVacationDaysPerYear', e.target.value ? parseInt(e.target.value) : undefined)}
                        min="0"
                        max="365"
                        step="1"
                        disabled={isSubmitting}
                        placeholder="Optionnel"
                      />
                      {errors.forcedVacationDaysPerYear && <div className="astek-error-message">{errors.forcedVacationDaysPerYear}</div>}
                    </div>
                  </div>
                </div>

                <div className="astek-row">
                  {/* Vendant cible ($/h) */}
                  <div className="astek-col-2">
                    <div className="astek-form-group">
                      <label htmlFor="targetHourlyRate" className="astek-label">
                        Vendant cible ($/h)
                      </label>
                      <input
                        type="number"
                        id="targetHourlyRate"
                        className={`astek-input ${errors.targetHourlyRate ? 'is-invalid' : ''}`}
                        value={formData.targetHourlyRate ?? ''}
                        onChange={(e) => handleChange('targetHourlyRate', e.target.value ? parseFloat(e.target.value) : undefined)}
                        min="0"
                        step="0.01"
                        disabled={isSubmitting}
                        placeholder="Optionnel"
                      />
                      {errors.targetHourlyRate && <div className="astek-error-message">{errors.targetHourlyRate}</div>}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Nom du contact */}
            <div className="astek-form-group">
              <label htmlFor="contactName" className="astek-label">
                Nom du contact <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="contactName"
                className={`astek-input ${errors.contactName ? 'is-invalid' : ''}`}
                value={formData.contactName}
                onChange={(e) => handleChange('contactName', e.target.value)}
                disabled={isSubmitting}
              />
              {errors.contactName && <div className="astek-error-message">{errors.contactName}</div>}
            </div>

            {/* Email du contact */}
            <div className="astek-form-group">
              <label htmlFor="contactEmail" className="astek-label">
                Email du contact <span className="required-star">*</span>
              </label>
              <input
                type="email"
                id="contactEmail"
                className={`astek-input ${errors.contactEmail ? 'is-invalid' : ''}`}
                value={formData.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                disabled={isSubmitting}
              />
              {errors.contactEmail && <div className="astek-error-message">{errors.contactEmail}</div>}
            </div>
          </div>
          {/* End of scrollable body */}

          <div className="client-modal-footer">
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
                'Enregistrer'
              )}
            </button>
          </div>
        </form>
      </div>
      {/* Quick Create Modals */}
      <QuickCreateCountry 
        isOpen={showCountryModal} 
        onClose={() => setShowCountryModal(false)} 
        onCreate={handleCreateCountry} 
      />
      <QuickCreateCurrency 
        isOpen={showCurrencyModal} 
        onClose={() => setShowCurrencyModal(false)} 
        onCreate={handleCreateCurrency} 
      />
    </div>
  );
};
