import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { hasRole } from '../utils/roleHelpers';
import { Currency } from '../types';

// Types
interface AdminClientMarginRule {
  id: string;
  clientId: string;
  clientName: string;
  currency: Currency;
  defaultTargetMargin: number;
  defaultMinMargin: number;
}

interface TargetRateSettings {
  chargeCoefficient: number;
  billableHoursPerYear: number;
  globalTargetMargin: number;
}

interface MarginFormData {
  targetMargin: number;
  minMargin: number;
}

interface MarginFormErrors {
  targetMargin?: string;
  minMargin?: string;
}

interface TargetRateCalculation {
  annualSalary: number;
  chargeCoefficient: number;
  billableHours: number;
  targetMargin: number;
  targetRate: number;
}

export const AdminPage = () => {
  const { user } = useAuth0();
  const isCfo = hasRole(user, 'CFO');

  // Mock data for client margin rules
  const [clientRules, setClientRules] = useState<AdminClientMarginRule[]>([
    {
      id: '1',
      clientId: 'c1',
      clientName: 'Banque Nationale',
      currency: Currency.CAD,
      defaultTargetMargin: 25,
      defaultMinMargin: 15,
    },
    {
      id: '2',
      clientId: 'c2',
      clientName: 'Desjardins',
      currency: Currency.CAD,
      defaultTargetMargin: 30,
      defaultMinMargin: 20,
    },
    {
      id: '3',
      clientId: 'c3',
      clientName: 'Hydro-Québec',
      currency: Currency.CAD,
      defaultTargetMargin: 22,
      defaultMinMargin: 12,
    },
  ]);

  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<MarginFormData>({
    targetMargin: 0,
    minMargin: 0,
  });
  const [editFormErrors, setEditFormErrors] = useState<MarginFormErrors>({});

  // Target rate settings state
  const [targetRateSettings, setTargetRateSettings] = useState<TargetRateSettings>({
    chargeCoefficient: 65,
    billableHoursPerYear: 1600,
    globalTargetMargin: 25,
  });

  // Example calculation state
  const [exampleSalary, setExampleSalary] = useState<number>(80000);
  const [calculatedExample, setCalculatedExample] = useState<TargetRateCalculation | null>(null);

  // Edit margin rule handlers
  const handleEditClick = (rule: AdminClientMarginRule) => {
    setEditingRuleId(rule.id);
    setEditFormData({
      targetMargin: rule.defaultTargetMargin,
      minMargin: rule.defaultMinMargin,
    });
    setEditFormErrors({});
  };

  const handleCancelEdit = () => {
    setEditingRuleId(null);
    setEditFormData({ targetMargin: 0, minMargin: 0 });
    setEditFormErrors({});
  };

  const validateMarginForm = (data: MarginFormData): MarginFormErrors => {
    const errors: MarginFormErrors = {};

    if (data.minMargin < 0 || data.minMargin > 100) {
      errors.minMargin = 'La marge minimale doit être entre 0 et 100%';
    }

    if (data.targetMargin < 0 || data.targetMargin > 100) {
      errors.targetMargin = 'La marge cible doit être entre 0 et 100%';
    }

    if (data.minMargin > data.targetMargin) {
      errors.minMargin = 'La marge minimale doit être inférieure ou égale à la marge cible';
    }

    return errors;
  };

  const handleSaveEdit = () => {
    const errors = validateMarginForm(editFormData);
    
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    setClientRules(prevRules =>
      prevRules.map(rule =>
        rule.id === editingRuleId
          ? {
              ...rule,
              defaultTargetMargin: editFormData.targetMargin,
              defaultMinMargin: editFormData.minMargin,
            }
          : rule
      )
    );

    setEditingRuleId(null);
    setEditFormData({ targetMargin: 0, minMargin: 0 });
    setEditFormErrors({});
  };

  // Target rate calculation
  const handleCalculateExample = () => {
    const totalCost = exampleSalary * (1 + targetRateSettings.chargeCoefficient / 100);
    const costPerHour = totalCost / targetRateSettings.billableHoursPerYear;
    const targetRate = costPerHour * (1 + targetRateSettings.globalTargetMargin / 100);

    setCalculatedExample({
      annualSalary: exampleSalary,
      chargeCoefficient: targetRateSettings.chargeCoefficient,
      billableHours: targetRateSettings.billableHoursPerYear,
      targetMargin: targetRateSettings.globalTargetMargin,
      targetRate: Math.round(targetRate * 100) / 100,
    });
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="astek-page-title">Administration – Règles de marges</h1>
        <p style={{ fontSize: '15px', color: 'var(--astek-text-muted)', marginTop: '8px' }}>
          Configurer les règles de marges par client et les paramètres de calcul du vendant cible.
        </p>
      </div>

      {/* Bloc 1: Règles de marges par client */}
      <div className="astek-card" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
          Règles de marges par client
        </h2>

        <div className="astek-table-container">
          <table className="astek-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Devise</th>
                <th>Marge cible par défaut (%)</th>
                <th>Marge minimale par défaut (%)</th>
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clientRules.map(rule => (
                <tr key={rule.id}>
                  <td>
                    <strong>{rule.clientName}</strong>
                  </td>
                  <td style={{ textAlign: 'center' }}>{rule.currency}</td>
                  <td>
                    {editingRuleId === rule.id ? (
                      <div>
                        <input
                          type="number"
                          className={`astek-input ${editFormErrors.targetMargin ? 'is-invalid' : ''}`}
                          value={editFormData.targetMargin}
                          onChange={e =>
                            setEditFormData({ ...editFormData, targetMargin: parseFloat(e.target.value) || 0 })
                          }
                          min="0"
                          max="100"
                          step="0.1"
                          style={{ maxWidth: '120px' }}
                        />
                        {editFormErrors.targetMargin && (
                          <div className="astek-error-message">{editFormErrors.targetMargin}</div>
                        )}
                      </div>
                    ) : (
                      `${rule.defaultTargetMargin}%`
                    )}
                  </td>
                  <td>
                    {editingRuleId === rule.id ? (
                      <div>
                        <input
                          type="number"
                          className={`astek-input ${editFormErrors.minMargin ? 'is-invalid' : ''}`}
                          value={editFormData.minMargin}
                          onChange={e =>
                            setEditFormData({ ...editFormData, minMargin: parseFloat(e.target.value) || 0 })
                          }
                          min="0"
                          max="100"
                          step="0.1"
                          style={{ maxWidth: '120px' }}
                        />
                        {editFormErrors.minMargin && (
                          <div className="astek-error-message">{editFormErrors.minMargin}</div>
                        )}
                      </div>
                    ) : (
                      `${rule.defaultMinMargin}%`
                    )}
                  </td>
                  <td>
                    {editingRuleId === rule.id ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={handleSaveEdit}
                          className="astek-btn astek-btn-primary"
                          style={{ padding: '8px 16px', minHeight: 'auto', fontSize: '14px' }}
                        >
                          Sauvegarder
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="astek-btn astek-btn-ghost"
                          style={{ padding: '8px 16px', minHeight: 'auto', fontSize: '14px' }}
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditClick(rule)}
                        className="astek-btn astek-btn-ghost"
                        style={{ padding: '8px 16px', minHeight: 'auto', fontSize: '14px' }}
                      >
                        Éditer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bloc 2: Paramètres de calcul du vendant cible (CFO only) */}
      {isCfo && (
      <div className="astek-card">
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
          Paramètres de calcul du vendant cible
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--astek-text-muted)', marginBottom: '24px' }}>
          Définir les paramètres globaux utilisés pour calculer le taux de vente cible par ressource.
        </p>

        {/* Form fields */}
        <div style={{ maxWidth: '800px' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '16px', alignItems: 'start' }}>
              <label className="astek-label" style={{ paddingTop: '12px' }}>
                Coefficient de charges (%)
              </label>
              <div style={{ backgroundColor: '#F7F9FC', padding: '16px', borderRadius: '8px' }}>
                <input
                  type="number"
                  className="astek-input"
                  value={targetRateSettings.chargeCoefficient}
                  onChange={e =>
                    setTargetRateSettings({
                      ...targetRateSettings,
                      chargeCoefficient: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  max="200"
                  step="1"
                />
                <small style={{ color: 'var(--astek-text-muted)', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  Charges sociales et autres frais en % du salaire
                </small>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '16px', alignItems: 'start' }}>
              <label className="astek-label" style={{ paddingTop: '12px' }}>
                Heures facturables par an
              </label>
              <div style={{ backgroundColor: '#F7F9FC', padding: '16px', borderRadius: '8px' }}>
                <input
                  type="number"
                  className="astek-input"
                  value={targetRateSettings.billableHoursPerYear}
                  onChange={e =>
                    setTargetRateSettings({
                      ...targetRateSettings,
                      billableHoursPerYear: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  max="2500"
                  step="1"
                />
                <small style={{ color: 'var(--astek-text-muted)', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  Nombre d'heures facturables standard par ressource
                </small>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '16px', alignItems: 'start' }}>
              <label className="astek-label" style={{ paddingTop: '12px' }}>
                Marge globale visée (%)
              </label>
              <div style={{ backgroundColor: '#F7F9FC', padding: '16px', borderRadius: '8px' }}>
                <input
                  type="number"
                  className="astek-input"
                  value={targetRateSettings.globalTargetMargin}
                  onChange={e =>
                    setTargetRateSettings({
                      ...targetRateSettings,
                      globalTargetMargin: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  max="100"
                  step="0.1"
                />
                <small style={{ color: 'var(--astek-text-muted)', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  Objectif de marge pour le calcul du taux cible
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Example calculation box */}
        <div style={{ 
          marginTop: '32px', 
          padding: '24px', 
          backgroundColor: '#F7F9FC', 
          borderRadius: '8px',
          border: '1px solid var(--astek-border)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Exemple de calcul
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label className="astek-label" style={{ marginBottom: '8px' }}>
              Salaire annuel (exemple)
            </label>
            <input
              type="number"
              className="astek-input"
              value={exampleSalary}
              onChange={e => setExampleSalary(parseFloat(e.target.value) || 0)}
              min="0"
              step="1000"
              style={{ maxWidth: '300px' }}
            />
          </div>

          <button
            onClick={handleCalculateExample}
            className="astek-btn astek-btn-primary"
            style={{ padding: '12px 24px', minHeight: 'auto', marginBottom: '16px' }}
          >
            Calculer
          </button>

          {calculatedExample && (
            <div style={{ 
              marginTop: '16px', 
              padding: '16px', 
              backgroundColor: 'var(--astek-white)', 
              borderRadius: '8px',
              border: '1px solid var(--astek-border)'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Résultat:</h4>
              <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                <div><strong>Salaire annuel:</strong> {calculatedExample.annualSalary.toLocaleString('fr-CA')} $</div>
                <div><strong>Coefficient de charges:</strong> {calculatedExample.chargeCoefficient}%</div>
                <div><strong>Coût total:</strong> {(calculatedExample.annualSalary * (1 + calculatedExample.chargeCoefficient / 100)).toLocaleString('fr-CA')} $</div>
                <div><strong>Heures facturables:</strong> {calculatedExample.billableHours} h/an</div>
                <div><strong>Marge visée:</strong> {calculatedExample.targetMargin}%</div>
                <div style={{ 
                  marginTop: '12px', 
                  paddingTop: '12px', 
                  borderTop: '2px solid var(--astek-green)',
                  fontSize: '16px',
                  fontWeight: '700',
                  color: 'var(--astek-green)'
                }}>
                  <strong>Vendant cible / heure:</strong> {calculatedExample.targetRate.toLocaleString('fr-CA')} $ / h
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};
