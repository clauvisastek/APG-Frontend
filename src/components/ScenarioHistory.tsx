import type { CalculetteScenario } from '../types/calculette';

interface ScenarioHistoryProps {
  scenarios: CalculetteScenario[];
  onDeleteScenario?: (scenarioId: string) => void;
  onLoadScenario?: (scenario: CalculetteScenario) => void;
  loading?: boolean;
}

export const ScenarioHistory: React.FC<ScenarioHistoryProps> = ({
  scenarios,
  onDeleteScenario,
  onLoadScenario,
  loading = false,
}) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number): string => {
    return `${value.toFixed(2)} $`;
  };

  const getMarginClass = (marge: number): string => {
    if (marge >= 25) return 'calculette-badge-success';
    if (marge >= 15) return 'calculette-badge-warning';
    return 'calculette-badge-danger';
  };

  if (scenarios.length === 0) {
    return null;
  }

  return (
    <div className="astek-card">
      <div className="calculette-history-section">
        <h3 className="calculette-section-title">
          Historique des scénarios ({scenarios.length})
        </h3>
        <p className="calculette-section-subtitle">
          Vos simulations de marge enregistrées
        </p>

        <div className="astek-table-container">
          <table className="astek-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Client</th>
                <th>Salaire/Tarif</th>
                <th>Vendant ($/h)</th>
                <th>Marge obtenue</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario) => (
                <tr key={scenario.id}>
                  <td style={{ fontSize: '13px', color: '#64748b' }}>
                    {formatDate(scenario.date)}
                  </td>
                  <td>
                    <span className={`calculette-badge ${
                      scenario.resourceType === 'SALARIE' 
                        ? 'calculette-badge-primary' 
                        : 'calculette-badge-info'
                    }`}>
                      {scenario.resourceType === 'SALARIE' ? 'Salarié' : 'Pigiste'}
                    </span>
                  </td>
                  <td>{scenario.clientName}</td>
                  <td>
                    {formatCurrency(scenario.salaireOrTarif)}
                    {scenario.resourceType === 'PIGISTE' && (
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}> /h</span>
                    )}
                  </td>
                  <td>{formatCurrency(scenario.vendantPropose)}</td>
                  <td>
                    <span className={`calculette-badge ${getMarginClass(scenario.margeObtenue)}`}>
                      {scenario.margeObtenue.toFixed(2)} %
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {onLoadScenario && (
                        <button
                          className="astek-btn astek-btn-sm astek-btn-secondary"
                          onClick={() => onLoadScenario(scenario)}
                          disabled={loading}
                          title="Recharger ce scénario"
                        >
                          ↻
                        </button>
                      )}
                      {onDeleteScenario && (
                        <button
                          className="astek-btn astek-btn-sm astek-btn-danger"
                          onClick={() => onDeleteScenario(scenario.id)}
                          disabled={loading}
                          title="Supprimer ce scénario"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
