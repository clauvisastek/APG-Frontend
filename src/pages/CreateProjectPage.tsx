import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { projectSchema, type ProjectFormData } from '../utils/validationSchemas';
import { ProjectType, Currency, type Client, type CreateProjectInput } from '../types';
import { useCreateProject, useClientSearch } from '../hooks/useApi';
import { CreateClientModal } from '../components/CreateClientModal';
import './CreateProjectPage.css';

type WizardSection = 'general' | 'client' | 'rentabilite' | 'notes';

interface SectionValidation {
  isValid: boolean;
  errors: string[];
}

export const CreateProjectPage = () => {
  const navigate = useNavigate();
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [serverError, setServerError] = useState<string>('');
  const [activeSection, setActiveSection] = useState<WizardSection>('general');
  const [completedSections, setCompletedSections] = useState<Set<WizardSection>>(new Set());
  const [sectionErrors, setSectionErrors] = useState<Record<WizardSection, string[]>>({
    general: [],
    client: [],
    rentabilite: [],
    notes: [],
  });

  const createProject = useCreateProject();
  const { data: clients, isLoading: isSearching } = useClientSearch(
    clientSearchTerm,
    clientSearchTerm.length >= 2
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    trigger,
    getValues,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      code: '',
      clientId: '',
      type: ProjectType.TIME_AND_MATERIALS,
      responsibleId: '',
      currency: Currency.CAD,
      startDate: '',
      endDate: '',
      targetMargin: 25,
      minMargin: 15,
      notes: '',
    },
  });

  const clientId = watch('clientId');
  const formValues = watch();

  useEffect(() => {
    if (selectedClient) {
      setValue('clientId', selectedClient.id.toString());
      setValue('currency', selectedClient.currencyCode as Currency);
      setValue('targetMargin', selectedClient.defaultTargetMarginPercent || 25);
      setValue('minMargin', selectedClient.defaultMinimumMarginPercent || 15);
    }
  }, [selectedClient, setValue]);

  // Section validation functions
  const validateGeneralSection = async (): Promise<SectionValidation> => {
    const fieldsToValidate: (keyof ProjectFormData)[] = [
      'name',
      'type',
      'currency',
      'responsibleId',
      'startDate',
      'endDate',
    ];
    
    const results = await trigger(fieldsToValidate);
    const errorMessages: string[] = [];

    fieldsToValidate.forEach((field) => {
      if (errors[field]) {
        errorMessages.push(errors[field]?.message || `Erreur sur le champ ${field}`);
      }
    });

    return {
      isValid: results && errorMessages.length === 0,
      errors: errorMessages,
    };
  };

  const validateClientSection = async (): Promise<SectionValidation> => {
    const result = await trigger('clientId');
    const errorMessages: string[] = [];

    if (errors.clientId) {
      errorMessages.push(errors.clientId.message || 'Veuillez sélectionner un client');
    }

    if (!formValues.clientId) {
      errorMessages.push('Veuillez sélectionner un client');
    }

    return {
      isValid: result && errorMessages.length === 0 && !!formValues.clientId,
      errors: errorMessages,
    };
  };

  const validateRentabiliteSection = async (): Promise<SectionValidation> => {
    const fieldsToValidate: (keyof ProjectFormData)[] = ['targetMargin', 'minMargin'];
    const results = await trigger(fieldsToValidate);
    const errorMessages: string[] = [];

    fieldsToValidate.forEach((field) => {
      if (errors[field]) {
        errorMessages.push(errors[field]?.message || `Erreur sur le champ ${field}`);
      }
    });

    return {
      isValid: results && errorMessages.length === 0,
      errors: errorMessages,
    };
  };

  const validateNotesSection = async (): Promise<SectionValidation> => {
    // Notes section is optional, always valid
    return {
      isValid: true,
      errors: [],
    };
  };

  const handleNextSection = async () => {
    let validation: SectionValidation;

    switch (activeSection) {
      case 'general':
        validation = await validateGeneralSection();
        if (validation.isValid) {
          setCompletedSections((prev) => new Set(prev).add('general'));
          setSectionErrors((prev) => ({ ...prev, general: [] }));
          setActiveSection('client');
        } else {
          setSectionErrors((prev) => ({ ...prev, general: validation.errors }));
        }
        break;

      case 'client':
        validation = await validateClientSection();
        if (validation.isValid) {
          setCompletedSections((prev) => new Set(prev).add('client'));
          setSectionErrors((prev) => ({ ...prev, client: [] }));
          setActiveSection('rentabilite');
        } else {
          setSectionErrors((prev) => ({ ...prev, client: validation.errors }));
        }
        break;

      case 'rentabilite':
        validation = await validateRentabiliteSection();
        if (validation.isValid) {
          setCompletedSections((prev) => new Set(prev).add('rentabilite'));
          setSectionErrors((prev) => ({ ...prev, rentabilite: [] }));
          setActiveSection('notes');
        } else {
          setSectionErrors((prev) => ({ ...prev, rentabilite: validation.errors }));
        }
        break;

      default:
        break;
    }
  };

  const handlePrevSection = () => {
    switch (activeSection) {
      case 'client':
        setActiveSection('general');
        break;
      case 'rentabilite':
        setActiveSection('client');
        break;
      case 'notes':
        setActiveSection('rentabilite');
        break;
      default:
        break;
    }
  };

  const handleSectionClick = (section: WizardSection) => {
    // Allow navigation to any section for better UX
    setActiveSection(section);
  };

  const onSubmit = async (data: ProjectFormData) => {
    setServerError('');
    
    // Final validation of all sections
    const generalValid = await validateGeneralSection();
    const clientValid = await validateClientSection();
    const rentabiliteValid = await validateRentabiliteSection();

    if (!generalValid.isValid || !clientValid.isValid || !rentabiliteValid.isValid) {
      toast.error('Veuillez corriger les erreurs dans toutes les sections');
      setSectionErrors({
        general: generalValid.errors,
        client: clientValid.errors,
        rentabilite: rentabiliteValid.errors,
        notes: [],
      });
      return;
    }

    try {
      // Find selected client to get businessUnitId
      const client = clients?.find(c => c.id.toString() === data.clientId);
      if (!client) {
        toast.error('Client sélectionné introuvable');
        return;
      }

      // Transform to CreateProjectInput
      const createInput: CreateProjectInput = {
        ...data,
        businessUnitId: client.businessUnitId.toString(),
      };

      await createProject.mutateAsync(createInput);
      toast.success(`Projet "${data.name}" créé avec succès !`);
      navigate('/projects');
    } catch (error) {
      setServerError((error as Error).message);
      toast.error('Erreur lors de la création du projet');
    }
  };

  const handleClientCreated = (newClientId: number) => {
    const newClient = clients?.find((c) => c.id === newClientId);
    if (newClient) {
      setSelectedClient(newClient);
      setClientSearchTerm(newClient.name);
      toast.success(`Client "${newClient.name}" créé et sélectionné !`);
    }
  };

  const handleCancel = () => {
    navigate('/projects');
  };

  const sections = [
    { id: 'general' as WizardSection, title: 'Informations générales', step: 1 },
    { id: 'client' as WizardSection, title: 'Client', step: 2 },
    { id: 'rentabilite' as WizardSection, title: 'Rentabilité', step: 3 },
    { id: 'notes' as WizardSection, title: 'Notes / Commentaires', step: 4 },
  ];

  return (
    <div className="apg-page">
      <div className="apg-form-card">
        {/* Page Title */}
        <h1 className="apg-form-title">Créer un nouveau projet</h1>

        {/* Error Summary Alert */}
        {serverError && (
          <div className="apg-alert apg-alert-danger">
            <strong>Erreur:</strong> {serverError}
          </div>
        )}

        {/* Main Form */}
        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="apg-wizard-container">
            {/* SECTION 1: Informations générales */}
            <div className={`apg-wizard-section ${activeSection === 'general' ? 'active' : ''} ${completedSections.has('general') ? 'completed' : ''}`}>
              <div className="apg-wizard-header" onClick={() => handleSectionClick('general')}>
                <div className="apg-wizard-step-badge">
                  {completedSections.has('general') ? <span className="check-icon"></span> : '1'}
                </div>
                <h3 className="apg-wizard-title">Informations générales</h3>
                <svg className="apg-wizard-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {activeSection === 'general' && (
                <div className="apg-wizard-content">
                  <div className="apg-wizard-fields">
                    {/* Nom du projet */}
                    <div className="apg-form-row">
                      <div className="apg-form-label">
                        <label htmlFor="project-name">
                          Nom du projet <span className="text-danger">*</span>
                        </label>
                      </div>
                      <div className="apg-form-field">
                        <Controller
                          name="name"
                          control={control}
                          render={({ field }) => (
                            <Form.Control
                              {...field}
                              id="project-name"
                              type="text"
                              placeholder="Ex: Migration Cloud AWS"
                              aria-required="true"
                              aria-invalid={!!errors.name}
                            />
                          )}
                        />
                        {errors.name && (
                          <div className="invalid-feedback d-block">{errors.name.message}</div>
                        )}
                      </div>
                    </div>

                    {/* Code projet */}
                    <div className="apg-form-row">
                      <div className="apg-form-label">
                        <label htmlFor="project-code">Code projet</label>
                      </div>
                      <div className="apg-form-field">
                        <Controller
                          name="code"
                          control={control}
                          render={({ field }) => (
                            <Form.Control
                              {...field}
                              id="project-code"
                              type="text"
                              placeholder="Ex: PROJ-2024"
                            />
                          )}
                        />
                        {errors.code && (
                          <div className="invalid-feedback d-block">{errors.code.message}</div>
                        )}
                      </div>
                    </div>

                    {/* Type, Devise, Responsable */}
                    <div className="apg-form-row">
                      <div className="apg-form-label">
                        <label>Détails du projet</label>
                      </div>
                      <div className="apg-form-field">
                        <div className="apg-form-field-group">
                          <div>
                            <label htmlFor="project-type" style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem', display: 'block' }}>
                              Type <span className="text-danger">*</span>
                            </label>
                            <Controller
                              name="type"
                              control={control}
                              render={({ field }) => (
                                <Form.Select {...field} id="project-type">
                                  {Object.values(ProjectType).map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </Form.Select>
                              )}
                            />
                          </div>

                          <div>
                            <label htmlFor="project-currency" style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem', display: 'block' }}>
                              Devise <span className="text-danger">*</span>
                            </label>
                            <Controller
                              name="currency"
                              control={control}
                              render={({ field }) => (
                                <Form.Select {...field} id="project-currency">
                                  {Object.values(Currency).map((currency) => (
                                    <option key={currency} value={currency}>{currency}</option>
                                  ))}
                                </Form.Select>
                              )}
                            />
                          </div>

                          <div>
                            <label htmlFor="project-responsible" style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem', display: 'block' }}>
                              Responsable <span className="text-danger">*</span>
                            </label>
                            <Controller
                              name="responsibleId"
                              control={control}
                              render={({ field }) => (
                                <Form.Control
                                  {...field}
                                  id="project-responsible"
                                  type="text"
                                  placeholder="Ex: Jean Dupont"
                                />
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Date de début */}
                    <div className="apg-form-row">
                      <div className="apg-form-label">
                        <label htmlFor="project-start-date">
                          Date de début <span className="text-danger">*</span>
                        </label>
                      </div>
                      <div className="apg-form-field">
                        <Controller
                          name="startDate"
                          control={control}
                          render={({ field }) => (
                            <Form.Control {...field} id="project-start-date" type="date" />
                          )}
                        />
                        {errors.startDate && (
                          <div className="invalid-feedback d-block">{errors.startDate.message}</div>
                        )}
                      </div>
                    </div>

                    {/* Date de fin */}
                    <div className="apg-form-row">
                      <div className="apg-form-label">
                        <label htmlFor="project-end-date">
                          Date de fin prévue <span className="text-danger">*</span>
                        </label>
                      </div>
                      <div className="apg-form-field">
                        <Controller
                          name="endDate"
                          control={control}
                          render={({ field }) => (
                            <Form.Control {...field} id="project-end-date" type="date" />
                          )}
                        />
                        {errors.endDate && (
                          <div className="invalid-feedback d-block">{errors.endDate.message}</div>
                        )}
                        <Form.Text>La date de fin doit être postérieure à la date de début</Form.Text>
                      </div>
                    </div>
                  </div>

                  {sectionErrors.general.length > 0 && (
                    <div className="apg-wizard-section-errors">
                      <strong>Veuillez corriger les erreurs suivantes :</strong>
                      <ul>
                        {sectionErrors.general.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="apg-wizard-navigation">
                    <div className="apg-wizard-nav-left"></div>
                    <div className="apg-wizard-nav-right">
                      <button
                        type="button"
                        className="apg-wizard-btn-next"
                        onClick={handleNextSection}
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: Client */}
            <div className={`apg-wizard-section ${activeSection === 'client' ? 'active' : ''} ${completedSections.has('client') ? 'completed' : ''}`}>
              <div className="apg-wizard-header" onClick={() => handleSectionClick('client')}>
                <div className="apg-wizard-step-badge">
                  {completedSections.has('client') ? <span className="check-icon"></span> : '2'}
                </div>
                <h3 className="apg-wizard-title">Client</h3>
                <svg className="apg-wizard-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {activeSection === 'client' && (
                <div className="apg-wizard-content">
                  <div className="apg-wizard-fields">
                    {/* Client search */}
                    <div className="apg-form-row">
                      <div className="apg-form-label">
                        <label htmlFor="project-client">
                          Client <span className="text-danger">*</span>
                        </label>
                      </div>
                      <div className="apg-form-field no-background">
                        <div className="apg-client-row">
                          <div className="apg-client-search">
                            <div className="apg-form-field apg-form-field-relative">
                              <Form.Control
                                id="project-client"
                                type="text"
                                value={clientSearchTerm}
                                onChange={(e) => setClientSearchTerm(e.target.value)}
                                placeholder="Rechercher un client par nom..."
                                autoComplete="off"
                              />
                              {isSearching && (
                                <Spinner animation="border" size="sm" className="apg-spinner-right" />
                              )}
                              {errors.clientId && (
                                <div className="invalid-feedback d-block">{errors.clientId.message}</div>
                              )}
                              <Form.Text>Saisissez au moins 2 caractères pour rechercher</Form.Text>

                              {/* Autocomplete Dropdown */}
                              {clientSearchTerm.length >= 2 && clients && clients.length > 0 && !selectedClient && (
                                <div className="apg-client-dropdown">
                                  {clients.map((client) => (
                                    <div
                                      key={client.id}
                                      className="apg-client-dropdown-item"
                                      onClick={() => {
                                        setSelectedClient(client);
                                        setClientSearchTerm(client.name);
                                      }}
                                    >
                                      <div>
                                        <strong>{client.name}</strong>
                                        {client.code && <span style={{ color: '#555' }}> ({client.code})</span>}
                                      </div>
                                      <small>{client.countryName} • {client.currencyCode}</small>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Selected Client Info */}
                            {selectedClient && (
                              <div className="apg-selected-client">
                                <div>
                                  <strong>Client sélectionné:</strong> {selectedClient.name}
                                  {selectedClient.code && <span> ({selectedClient.code})</span>}
                                </div>
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedClient(null);
                                    setClientSearchTerm('');
                                    setValue('clientId', '');
                                  }}
                                  style={{ color: '#00A86B', textDecoration: 'none', padding: '0' }}
                                >
                                  Changer
                                </Button>
                              </div>
                            )}
                          </div>

                          <div className="apg-client-button">
                            <button
                              type="button"
                              className="apg-btn-new-client"
                              onClick={() => setShowClientModal(true)}
                            >
                              + Nouveau client
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {sectionErrors.client.length > 0 && (
                    <div className="apg-wizard-section-errors">
                      <strong>Veuillez corriger les erreurs suivantes :</strong>
                      <ul>
                        {sectionErrors.client.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="apg-wizard-navigation">
                    <div className="apg-wizard-nav-left">
                      <button
                        type="button"
                        className="apg-wizard-btn-prev"
                        onClick={handlePrevSection}
                      >
                        Précédent
                      </button>
                    </div>
                    <div className="apg-wizard-nav-right">
                      <button
                        type="button"
                        className="apg-wizard-btn-next"
                        onClick={handleNextSection}
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3: Rentabilité */}
            <div className={`apg-wizard-section ${activeSection === 'rentabilite' ? 'active' : ''} ${completedSections.has('rentabilite') ? 'completed' : ''}`}>
              <div className="apg-wizard-header" onClick={() => handleSectionClick('rentabilite')}>
                <div className="apg-wizard-step-badge">
                  {completedSections.has('rentabilite') ? <span className="check-icon"></span> : '3'}
                </div>
                <h3 className="apg-wizard-title">Rentabilité</h3>
                <svg className="apg-wizard-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {activeSection === 'rentabilite' && (
                <div className="apg-wizard-content">
                  <div className="apg-wizard-fields">
                    {/* Marge cible */}
                    <div className="apg-form-row">
                      <div className="apg-form-label">
                        <label htmlFor="project-target-margin">
                          Marge cible (%) <span className="text-danger">*</span>
                        </label>
                      </div>
                      <div className="apg-form-field">
                        <Controller
                          name="targetMargin"
                          control={control}
                          render={({ field: { onChange, ...field } }) => (
                            <Form.Control
                              {...field}
                              id="project-target-margin"
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                              placeholder="Ex: 25.0"
                            />
                          )}
                        />
                        {errors.targetMargin && (
                          <div className="invalid-feedback d-block">{errors.targetMargin.message}</div>
                        )}
                        <Form.Text>Marge de rentabilité visée pour ce projet (0-100%)</Form.Text>
                      </div>
                    </div>

                    {/* Marge minimale */}
                    <div className="apg-form-row">
                      <div className="apg-form-label">
                        <label htmlFor="project-min-margin">
                          Marge minimale (%) <span className="text-danger">*</span>
                        </label>
                      </div>
                      <div className="apg-form-field">
                        <Controller
                          name="minMargin"
                          control={control}
                          render={({ field: { onChange, ...field } }) => (
                            <Form.Control
                              {...field}
                              id="project-min-margin"
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                              placeholder="Ex: 15.0"
                            />
                          )}
                        />
                        {errors.minMargin && (
                          <div className="invalid-feedback d-block">{errors.minMargin.message}</div>
                        )}
                        <Form.Text>Marge minimale acceptable (doit être ≤ marge cible)</Form.Text>
                      </div>
                    </div>
                  </div>

                  {sectionErrors.rentabilite.length > 0 && (
                    <div className="apg-wizard-section-errors">
                      <strong>Veuillez corriger les erreurs suivantes :</strong>
                      <ul>
                        {sectionErrors.rentabilite.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="apg-wizard-navigation">
                    <div className="apg-wizard-nav-left">
                      <button
                        type="button"
                        className="apg-wizard-btn-prev"
                        onClick={handlePrevSection}
                      >
                        Précédent
                      </button>
                    </div>
                    <div className="apg-wizard-nav-right">
                      <button
                        type="button"
                        className="apg-wizard-btn-next"
                        onClick={handleNextSection}
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 4: Notes / Commentaires */}
            <div className={`apg-wizard-section ${activeSection === 'notes' ? 'active' : ''} ${completedSections.has('notes') ? 'completed' : ''}`}>
              <div className="apg-wizard-header" onClick={() => handleSectionClick('notes')}>
                <div className="apg-wizard-step-badge">
                  {completedSections.has('notes') ? <span className="check-icon"></span> : '4'}
                </div>
                <h3 className="apg-wizard-title">Notes / Commentaires</h3>
                <svg className="apg-wizard-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {activeSection === 'notes' && (
                <div className="apg-wizard-content">
                  <div className="apg-wizard-fields">
                    {/* Notes */}
                    <div className="apg-form-row">
                      <div className="apg-form-label">
                        <label htmlFor="project-notes">Notes (optionnel)</label>
                      </div>
                      <div className="apg-form-field">
                        <Controller
                          name="notes"
                          control={control}
                          render={({ field }) => (
                            <Form.Control
                              {...field}
                              id="project-notes"
                              as="textarea"
                              rows={4}
                              placeholder="Ajoutez ici des informations supplémentaires sur le projet, contraintes, objectifs spécifiques..."
                              maxLength={1000}
                            />
                          )}
                        />
                        {errors.notes && (
                          <div className="invalid-feedback d-block">{errors.notes.message}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="apg-wizard-navigation">
                    <div className="apg-wizard-nav-left">
                      <button
                        type="button"
                        className="apg-wizard-btn-prev"
                        onClick={handlePrevSection}
                      >
                        Précédent
                      </button>
                    </div>
                    <div className="apg-wizard-nav-right">
                      <button
                        type="button"
                        className="apg-btn-cancel"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        style={{ marginRight: '1rem' }}
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="apg-btn-primary"
                        disabled={isSubmitting || !clientId}
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Création en cours...
                          </>
                        ) : (
                          'Créer le projet'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Form>

        {/* Client Creation Modal */}
        <CreateClientModal
          show={showClientModal}
          onHide={() => setShowClientModal(false)}
          onClientCreated={handleClientCreated}
        />
      </div>
    </div>
  );
};
