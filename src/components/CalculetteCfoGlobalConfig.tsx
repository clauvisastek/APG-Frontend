import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  calculatorSettingsApi, 
  type GlobalSalarySettingsDto, 
  type UpdateGlobalSalarySettingsRequest 
} from '../services/calculatorSettingsApi';

interface CalculetteCfoGlobalConfigProps {
  // No longer needed, we fetch data directly
}

export const CalculetteCfoGlobalConfig: React.FC<CalculetteCfoGlobalConfigProps> = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<GlobalSalarySettingsDto | null>(null);
  const [formData, setFormData] = useState<UpdateGlobalSalarySettingsRequest>({
    employerChargesRate: 65,
    indirectAnnualCosts: 5000,
    billableHoursPerYear: 1600,
  });

  // Load data on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await calculatorSettingsApi.getGlobalSalarySettings();
      if (data) {
        setSettings(data);
        setFormData({
          employerChargesRate: data.employerChargesRate,
          indirectAnnualCosts: data.indirectAnnualCosts,
          billableHoursPerYear: data.billableHoursPerYear,
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres globaux:', error);
      toast.error('Erreur lors du chargement des paramètres globaux');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof UpdateGlobalSalarySettingsRequest, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numValue }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updated = await calculatorSettingsApi.updateGlobalSalarySettings(formData);
      setSettings(updated);
      setIsEditing(false);
      toast.success('Paramètres globaux enregistrés avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (settings) {
      setFormData({
        employerChargesRate: settings.employerChargesRate,
        indirectAnnualCosts: settings.indirectAnnualCosts,
        billableHoursPerYear: settings.billableHoursPerYear,
      });
    }
    setIsEditing(false);
  };

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
          {!isEditing && (
            <button
              className="astek-btn astek-btn-primary"
              onClick={() => setIsEditing(true)}
            >
              ✏️ Modifier
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="calculette-form-section">
            <div className="calculette-form-grid">
              <div className="astek-form-group">
                <label htmlFor="employerChargesRate" className="astek-label">
                  Charges patronales (%)
                  <span className="calculette-tooltip" title="Pourcentage de charges patronales appliqué sur le salaire">
                    ℹ️
                  </span>
                </label>
                <input
                  id="employerChargesRate"
                  type="number"
                  className="astek-input"
                  value={formData.employerChargesRate}
                  onChange={(e) => handleChange('employerChargesRate', e.target.value)}
                  step="0.1"
                  min="0"
                  max="100"
                  disabled={isSaving}
                />
              </div>

              <div className="astek-form-group">
                <label htmlFor="indirectAnnualCosts" className="astek-label">
                  Coûts indirects annuels ($)
                  <span className="calculette-tooltip" title="Coûts fixes par employé (bureau, équipement, formation, etc.)">
                    ℹ️
                  </span>
                </label>
                <input
                  id="indirectAnnualCosts"
                  type="number"
                  className="astek-input"
                  value={formData.indirectAnnualCosts}
                  onChange={(e) => handleChange('indirectAnnualCosts', e.target.value)}
                  step="100"
                  min="0"
                  disabled={isSaving}
                />
              </div>

              <div className="astek-form-group">
                <label htmlFor="billableHoursPerYear" className="astek-label">
                  Heures facturables par an
                  <span className="calculette-tooltip" title="Nombre d'heures facturables attendues par employé par an">
                    ℹ️
                  </span>
                </label>
                <input
                  id="billableHoursPerYear"
                  type="number"
                  className="astek-input"
                  value={formData.billableHoursPerYear}
                  onChange={(e) => handleChange('billableHoursPerYear', e.target.value)}
                  step="1"
                  min="1"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="calculette-form-actions">
              <button
                className="astek-btn astek-btn-success"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? '💾 Enregistrement...' : '💾 Enregistrer'}
              </button>
              <button
                className="astek-btn astek-btn-secondary"
                onClick={handleCancel}
                disabled={isSaving}
              >
                ✖️ Annuler
              </button>
            </div>
          </div>
        ) : (
          <div className="calculette-details-grid">
            <div className="calculette-detail-item">
              <span className="calculette-detail-label">Charges patronales</span>
              <span className="calculette-detail-value">{formData.employerChargesRate} %</span>
            </div>
            <div className="calculette-detail-item">
              <span className="calculette-detail-label">Coûts indirects annuels</span>
              <span className="calculette-detail-value">{formData.indirectAnnualCosts.toLocaleString('fr-CA')} $</span>
            </div>
            <div className="calculette-detail-item">
              <span className="calculette-detail-label">Heures facturables / an</span>
              <span className="calculette-detail-value">{formData.billableHoursPerYear} h</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
