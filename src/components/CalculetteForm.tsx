import { useState, useEffect, useMemo } from 'react';
import type { CalculetteFormData, Seniorite } from '../types/calculette';

interface Client {
  id: string;
  name: string;
  isFinancialConfigComplete?: boolean;
}

interface CalculetteFormProps {
  onSubmit: (data: CalculetteFormData) => void;
  loading?: boolean;
  clients: Client[];
}

const senioriteOptions: Seniorite[] = ['Junior', 'Intermédiaire', 'Sénior', 'Expert'];

export const CalculetteForm: React.FC<CalculetteFormProps> = ({
  onSubmit,
  loading = false,
  clients,
}) => {
  const [formData, setFormData] = useState<CalculetteFormData>({
    resourceType: 'SALARIE',
    heures: 0,
    clientId: '',
    vendantClientProposeHoraire: 0,
  });

  const [showCustomClient, setShowCustomClient] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Find the selected client and check if config is complete
  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === formData.clientId);
  }, [clients, formData.clientId]);

  const canCalculate = useMemo(() => {
    const hasRequiredFields = 
      formData.clientId &&
      formData.heures > 0 &&
      formData.vendantClientProposeHoraire > 0 &&
      (formData.resourceType === 'SALARIE' ? (formData.salaireAnnuel || 0) > 0 : (formData.tarifHoraire || 0) > 0);
    
    const clientConfigComplete = !selectedClient || selectedClient.isFinancialConfigComplete !== false;
    
    return hasRequiredFields && clientConfigComplete;
  }, [formData, selectedClient]);

  useEffect(() => {
    if (formData.clientId === 'CUSTOM') {
      setShowCustomClient(true);
    } else {
      setShowCustomClient(false);
      setFormData(prev => ({ ...prev, clientName: undefined }));
    }
  }, [formData.clientId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.resourceType === 'SALARIE' && (!formData.salaireAnnuel || formData.salaireAnnuel <= 0)) {
      newErrors.salaireAnnuel = 'Le salaire annuel doit être supérieur à 0';
    }

    if (formData.resourceType === 'PIGISTE' && (!formData.tarifHoraire || formData.tarifHoraire <= 0)) {
      newErrors.tarifHoraire = 'Le tarif horaire doit être supérieur à 0';
    }

    if (!formData.heures || formData.heures <= 0) {
      newErrors.heures = 'Le nombre d\'heures doit être supérieur à 0';
    }

    if (!formData.clientId) {
      newErrors.clientId = 'Veuillez sélectionner un client';
    }

    if (showCustomClient && !formData.clientName) {
      newErrors.clientName = 'Veuillez saisir le nom du client';
    }

    if (!formData.vendantClientProposeHoraire || formData.vendantClientProposeHoraire <= 0) {
      newErrors.vendantClientProposeHoraire = 'Le vendant proposé doit être supérieur à 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleReset = () => {
    setFormData({
      resourceType: 'SALARIE',
      heures: 0,
      clientId: '',
      vendantClientProposeHoraire: 0,
    });
    setErrors({});
  };

  // Helper function to check if client has missing financial data
  const hasMissingFinancialData = (client: Client | undefined): boolean => {
    if (!client) return false;
    return client.isFinancialConfigComplete === false;
  };

  return (
    <div className="astek-card">
      <div className="calculette-form-section">
        <h3 className="calculette-section-title">Simulation de marge</h3>
        <p className="calculette-section-subtitle">
          Calculez la marge pour une ressource selon le vendant proposé au client
        </p>
        
        {/* Warning box - appears above form when client has incomplete financial parameters */}
        {selectedClient && hasMissingFinancialData(selectedClient) && (
          <div 
            style={{ 
              marginTop: '20px',
              marginBottom: '20px',
              padding: '16px 20px',
              background: '#FFFBEB',
              border: '1px solid #FCD34D',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}
          >
            {/* Warning Icon (Heroicons ExclamationTriangle) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="#92400E"
              style={{
                width: '24px',
                height: '24px',
                flexShrink: 0,
                marginTop: '2px'
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <div style={{ flex: 1 }}>
              <strong style={{ color: '#92400E', fontSize: '14px', display: 'block', marginBottom: '6px' }}>
                ⚠ Paramètres financiers incomplets
              </strong>
              <p style={{ margin: 0, color: '#92400E', fontSize: '13px', lineHeight: '1.5' }}>
                Les paramètres financiers de ce client ne sont pas entièrement configurés. 
                Merci de demander au CFO de renseigner la marge cible, la marge minimale, 
                la remise, les jours de vacances forcés et le vendant cible avant de lancer une simulation.
              </p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="calculette-form-grid">
            {/* Type de ressource */}
            <div className="astek-form-group">
              <label className="astek-label">Type de ressource *</label>
              <select
                className="astek-select"
                value={formData.resourceType}
                onChange={(e) => setFormData({ ...formData, resourceType: e.target.value as 'SALARIE' | 'PIGISTE' })}
              >
                <option value="SALARIE">Salarié</option>
                <option value="PIGISTE">Pigiste</option>
              </select>
            </div>

            {/* Salaire annuel ou Tarif horaire */}
            {formData.resourceType === 'SALARIE' ? (
              <div className="astek-form-group">
                <label className="astek-label">Salaire annuel brut *</label>
                <input
                  type="number"
                  className={`astek-input ${errors.salaireAnnuel ? 'astek-input-error' : ''}`}
                  value={formData.salaireAnnuel || ''}
                  onChange={(e) => setFormData({ ...formData, salaireAnnuel: parseFloat(e.target.value) || undefined })}
                  placeholder="Ex: 75000"
                />
                {errors.salaireAnnuel && (
                  <span className="astek-error-message">{errors.salaireAnnuel}</span>
                )}
              </div>
            ) : (
              <div className="astek-form-group">
                <label className="astek-label">Tarif horaire *</label>
                <input
                  type="number"
                  className={`astek-input ${errors.tarifHoraire ? 'astek-input-error' : ''}`}
                  value={formData.tarifHoraire || ''}
                  onChange={(e) => setFormData({ ...formData, tarifHoraire: parseFloat(e.target.value) || undefined })}
                  placeholder="Ex: 110"
                />
                {errors.tarifHoraire && (
                  <span className="astek-error-message">{errors.tarifHoraire}</span>
                )}
              </div>
            )}

            {/* Nombre d'heures */}
            <div className="astek-form-group">
              <label className="astek-label">Nombre d'heures prévues *</label>
              <input
                type="number"
                className={`astek-input ${errors.heures ? 'astek-input-error' : ''}`}
                value={formData.heures || ''}
                onChange={(e) => setFormData({ ...formData, heures: parseFloat(e.target.value) || 0 })}
                placeholder="Ex: 160"
              />
              {errors.heures && (
                <span className="astek-error-message">{errors.heures}</span>
              )}
            </div>

            {/* Séniorité */}
            <div className="astek-form-group">
              <label className="astek-label">Séniorité (optionnel)</label>
              <select
                className="astek-select"
                value={formData.seniorite || ''}
                onChange={(e) => setFormData({ ...formData, seniorite: (e.target.value as Seniorite) || undefined })}
              >
                <option value="">Sélectionner une séniorité</option>
                {senioriteOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Client */}
            <div className="astek-form-group">
              <label className="astek-label">Client *</label>
              <select
                className={`astek-select ${errors.clientId ? 'astek-input-error' : ''}`}
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              >
                <option value="">Sélectionner un client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                <option value="CUSTOM">Autre client</option>
              </select>
              {errors.clientId && (
                <span className="astek-error-message">{errors.clientId}</span>
              )}
            </div>

            {/* Nom du client personnalisé */}
            {showCustomClient && (
              <div className="astek-form-group">
                <label className="astek-label">Nom du client *</label>
                <input
                  type="text"
                  className={`astek-input ${errors.clientName ? 'astek-input-error' : ''}`}
                  value={formData.clientName || ''}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Saisir le nom du client"
                />
                {errors.clientName && (
                  <span className="astek-error-message">{errors.clientName}</span>
                )}
              </div>
            )}

            {/* Vendant proposé */}
            <div className="astek-form-group">
              <label className="astek-label">Vendant client proposé ($/h) *</label>
              <input
                type="number"
                className={`astek-input ${errors.vendantClientProposeHoraire ? 'astek-input-error' : ''}`}
                value={formData.vendantClientProposeHoraire || ''}
                onChange={(e) => setFormData({ ...formData, vendantClientProposeHoraire: parseFloat(e.target.value) || 0 })}
                placeholder="Ex: 120"
              />
              {errors.vendantClientProposeHoraire && (
                <span className="astek-error-message">{errors.vendantClientProposeHoraire}</span>
              )}
            </div>

            {/* Projet / BU (optionnel) */}
            <div className="astek-form-group">
              <label className="astek-label">Projet / BU (optionnel)</label>
              <input
                type="text"
                className="astek-input"
                value={formData.projectId || ''}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value || undefined })}
                placeholder="Ex: Projet Banque XYZ"
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="calculette-form-actions">
            <button
              type="submit"
              className="astek-btn astek-btn-primary"
              disabled={loading || !canCalculate}
              style={{
                opacity: (!canCalculate && !loading) ? 0.5 : 1,
                cursor: (!canCalculate && !loading) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <>
                  <span className="astek-spinner"></span>
                  Calcul en cours...
                </>
              ) : (
                'Calculer la marge'
              )}
            </button>
            <button
              type="button"
              className="astek-btn astek-btn-secondary"
              onClick={handleReset}
              disabled={loading}
            >
              Réinitialiser
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
