import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  globalSalarySettingsApi, 
  type GlobalSalarySettingsDto,
  type CreateGlobalSalarySettingsRequest
} from '../services/globalSalarySettingsApi';

export const GlobalSalarySettingsSection: React.FC = () => {
  const [settings, setSettings] = useState<GlobalSalarySettingsDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [activatingId, setActivatingId] = useState<number | null>(null);

  // Form data for creating new settings
  const [formData, setFormData] = useState<CreateGlobalSalarySettingsRequest>({
    employerChargesRate: 65,
    indirectAnnualCosts: 5000,
    billableHoursPerYear: 1600,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await globalSalarySettingsApi.getAll();
      setSettings(data);
    } catch (err: any) {
      console.error('Erreur lors du chargement des paramètres globaux:', err);
      setError(err.message || 'Erreur lors du chargement des paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    loadSettings();
  };

  const handleOpenAddModal = () => {
    // Reset form to default values
    setFormData({
      employerChargesRate: 65,
      indirectAnnualCosts: 5000,
      billableHoursPerYear: 1600,
    });
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    if (!isSubmitting) {
      setIsAddModalOpen(false);
    }
  };

  const handleFormChange = (field: keyof CreateGlobalSalarySettingsRequest, value: string) => {
    const numValue = field === 'billableHoursPerYear' 
      ? parseInt(value) || 0 
      : parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numValue }));
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.employerChargesRate <= 0 || formData.employerChargesRate > 100) {
      toast.error('Les charges patronales doivent être entre 0 et 100 %');
      return;
    }
    if (formData.indirectAnnualCosts < 0) {
      toast.error('Les coûts indirects annuels doivent être positifs ou nuls');
      return;
    }
    if (formData.billableHoursPerYear <= 0) {
      toast.error('Les heures facturables par an doivent être supérieures à 0');
      return;
    }

    try {
      setIsSubmitting(true);
      await globalSalarySettingsApi.create(formData);
      toast.success('Paramètres créés avec succès et activés');
      setIsAddModalOpen(false);
      await loadSettings();
    } catch (err: any) {
      console.error('Erreur lors de la création:', err);
      toast.error(err.message || 'Erreur lors de la création des paramètres');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      setActivatingId(id);
      await globalSalarySettingsApi.activate(id);
      toast.success('Configuration activée avec succès');
      await loadSettings();
    } catch (err: any) {
      console.error('Erreur lors de l\'activation:', err);
      toast.error(err.message || 'Erreur lors de l\'activation');
    } finally {
      setActivatingId(null);
    }
  };

  const handleDelete = async (id: number, isActive: boolean) => {
    if (isActive) {
      toast.warning('Impossible de supprimer la configuration active');
      return;
    }

    if (settings.length === 1) {
      toast.warning('Impossible de supprimer la dernière configuration');
      return;
    }

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette configuration ?')) {
      return;
    }

    try {
      setDeletingId(id);
      await globalSalarySettingsApi.delete(id);
      toast.success('Configuration supprimée avec succès');
      await loadSettings();
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      toast.error(err.message || 'Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('fr-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="astek-card">
        <div className="astek-loading-container">
          <div className="astek-spinner"></div>
          <p>Chargement des paramètres globaux...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="astek-card">
        <div className="astek-error-container" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#d32f2f', marginBottom: '1rem' }}>
            ❌ {error}
          </p>
          <button className="astek-btn astek-btn-primary" onClick={handleRetry}>
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (settings.length === 0) {
    return (
      <div className="astek-card">
        <div className="calculette-cfo-section">
          <div className="calculette-cfo-header">
            <div>
              <h3 className="calculette-section-title">
                Paramètres globaux – Salariés
              </h3>
              <p className="calculette-section-subtitle">
                Aucun paramètre n'a encore été configuré. Ajoutez un premier jeu de paramètres pour calculer le coûtant.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <button 
              className="astek-btn astek-btn-primary" 
              onClick={handleOpenAddModal}
            >
              ➕ Ajouter des paramètres
            </button>
          </div>
        </div>

        {/* Add Modal */}
        {isAddModalOpen && (
          <AddParametersModal
            formData={formData}
            isSubmitting={isSubmitting}
            onFormChange={handleFormChange}
            onSubmit={handleSubmitCreate}
            onClose={handleCloseAddModal}
          />
        )}
      </div>
    );
  }

  // Table view with data
  return (
    <div className="astek-card">
      <div className="calculette-cfo-section">
        <div className="calculette-cfo-header">
          <div>
            <h3 className="calculette-section-title">
              Paramètres globaux – Salariés
            </h3>
            <p className="calculette-section-subtitle">
              Configuration des charges et coûts fixes utilisés pour le calcul du coûtant
            </p>
          </div>
          <button 
            className="astek-btn astek-btn-primary" 
            onClick={handleOpenAddModal}
          >
            ➕ Ajouter des paramètres
          </button>
        </div>

        <div className="astek-table-container" style={{ marginTop: '1.5rem' }}>
          <table className="astek-table">
            <thead>
              <tr>
                <th>Charges patronales</th>
                <th>Coûts indirects annuels</th>
                <th>Heures facturables / an</th>
                <th>Statut</th>
                <th>Date de création</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((setting) => (
                <tr 
                  key={setting.id}
                  style={{
                    backgroundColor: setting.isActive ? '#e8f5e9' : 'transparent',
                  }}
                >
                  <td>
                    <strong>{setting.employerChargesRate} %</strong>
                  </td>
                  <td>
                    {formatCurrency(setting.indirectAnnualCosts)} $
                  </td>
                  <td>
                    {setting.billableHoursPerYear} h
                  </td>
                  <td>
                    {setting.isActive ? (
                      <span 
                        className="astek-badge astek-badge-success"
                        style={{ 
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          backgroundColor: '#4caf50',
                          color: 'white'
                        }}
                      >
                        ✓ Actif
                      </span>
                    ) : (
                      <span 
                        className="astek-badge astek-badge-secondary"
                        style={{ 
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          backgroundColor: '#9e9e9e',
                          color: 'white'
                        }}
                      >
                        Inactif
                      </span>
                    )}
                  </td>
                  <td>
                    {formatDate(setting.createdAt)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      {!setting.isActive && (
                        <>
                          <button
                            className="astek-btn astek-btn-sm astek-btn-success"
                            onClick={() => handleActivate(setting.id)}
                            disabled={activatingId === setting.id}
                            title="Définir comme actif"
                            style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
                          >
                            {activatingId === setting.id ? '⏳' : '✓'} Activer
                          </button>
                          {settings.length > 1 && (
                            <button
                              className="astek-btn astek-btn-sm astek-btn-danger"
                              onClick={() => handleDelete(setting.id, setting.isActive)}
                              disabled={deletingId === setting.id}
                              title="Supprimer"
                              style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
                            >
                              {deletingId === setting.id ? '⏳' : '🗑️'}
                            </button>
                          )}
                        </>
                      )}
                      {setting.isActive && (
                        <span style={{ color: '#4caf50', fontSize: '0.875rem', fontWeight: '600' }}>
                          Configuration en cours
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <AddParametersModal
          formData={formData}
          isSubmitting={isSubmitting}
          onFormChange={handleFormChange}
          onSubmit={handleSubmitCreate}
          onClose={handleCloseAddModal}
        />
      )}
    </div>
  );
};

// ============================================================================
// Add Parameters Modal Component
// ============================================================================

interface AddParametersModalProps {
  formData: CreateGlobalSalarySettingsRequest;
  isSubmitting: boolean;
  onFormChange: (field: keyof CreateGlobalSalarySettingsRequest, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const AddParametersModal: React.FC<AddParametersModalProps> = ({
  formData,
  isSubmitting,
  onFormChange,
  onSubmit,
  onClose,
}) => {
  // Validation logic: compute if form is valid
  const isFormValid = 
    formData.employerChargesRate > 0 &&
    formData.indirectAnnualCosts >= 0 &&
    formData.billableHoursPerYear > 0;

  return (
    <div 
      className="astek-modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div 
        className="astek-modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>
            Ajouter des paramètres globaux
          </h2>
          <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.875rem' }}>
            Cette nouvelle configuration sera automatiquement activée
          </p>
        </div>

        <form onSubmit={onSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="astek-form-group">
              <label htmlFor="employerChargesRate" className="astek-label">
                Charges patronales (%)
                <span 
                  className="calculette-tooltip" 
                  title="Pourcentage de charges patronales appliqué sur le salaire"
                  style={{ marginLeft: '0.5rem', cursor: 'help' }}
                >
                  ℹ️
                </span>
              </label>
              <input
                id="employerChargesRate"
                type="number"
                className="astek-input"
                value={formData.employerChargesRate}
                onChange={(e) => onFormChange('employerChargesRate', e.target.value)}
                step="0.1"
                min="0"
                max="100"
                required
                disabled={isSubmitting}
                style={{ width: '100%' }}
              />
            </div>

            <div className="astek-form-group">
              <label htmlFor="indirectAnnualCosts" className="astek-label">
                Coûts indirects annuels ($)
                <span 
                  className="calculette-tooltip" 
                  title="Coûts fixes par employé (bureau, équipement, formation, etc.)"
                  style={{ marginLeft: '0.5rem', cursor: 'help' }}
                >
                  ℹ️
                </span>
              </label>
              <input
                id="indirectAnnualCosts"
                type="number"
                className="astek-input"
                value={formData.indirectAnnualCosts}
                onChange={(e) => onFormChange('indirectAnnualCosts', e.target.value)}
                step="100"
                min="0"
                required
                disabled={isSubmitting}
                style={{ width: '100%' }}
              />
            </div>

            <div className="astek-form-group">
              <label htmlFor="billableHoursPerYear" className="astek-label">
                Heures facturables par an
                <span 
                  className="calculette-tooltip" 
                  title="Nombre d'heures facturables attendues par employé par an"
                  style={{ marginLeft: '0.5rem', cursor: 'help' }}
                >
                  ℹ️
                </span>
              </label>
              <input
                id="billableHoursPerYear"
                type="number"
                className="astek-input"
                value={formData.billableHoursPerYear}
                onChange={(e) => onFormChange('billableHoursPerYear', e.target.value)}
                step="1"
                min="1"
                required
                disabled={isSubmitting}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div 
            className="astek-modal-actions" 
            style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'flex-end', 
              marginTop: '2rem' 
            }}
          >
            <button
              type="button"
              className="astek-btn astek-btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              ✖️ Annuler
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '6px',
                fontSize: '0.9375rem',
                fontWeight: '600',
                border: 'none',
                cursor: (!isFormValid || isSubmitting) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: (!isFormValid || isSubmitting) ? '#e0e0e0' : '#4caf50',
                color: (!isFormValid || isSubmitting) ? '#9e9e9e' : 'white',
              }}
              onMouseEnter={(e) => {
                if (isFormValid && !isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#45a049';
                }
              }}
              onMouseLeave={(e) => {
                if (isFormValid && !isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#4caf50';
                }
              }}
            >
              {isSubmitting ? '💾 Création...' : '💾 Créer et activer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
