import { useState, useEffect } from 'react';
import { resourcesApi } from '../services/resourcesApi';
import type { 
  Resource,
  ResourceMissionHistory,
  ResourceKPIs 
} from '../types/resource';
import './ResourceDetailsModal.css';

interface ResourceDetailsModalProps {
  resource: Resource;
  onClose: () => void;
  onUpdate: () => void;
}

export const ResourceDetailsModal = ({ 
  resource, 
  onClose 
}: ResourceDetailsModalProps) => {
  const [missionHistory, setMissionHistory] = useState<ResourceMissionHistory[]>([]);
  const [kpis, setKPIs] = useState<ResourceKPIs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadResourceData();
  }, [resource.id]);
  
  const loadResourceData = async () => {
    setIsLoading(true);
    try {
      const [history, kpisData] = await Promise.all([
        resourcesApi.getMissionHistory(resource.id),
        resourcesApi.getKPIs(resource.id),
      ]);
      setMissionHistory(history);
      setKPIs(kpisData);
    } catch (error) {
      // Error handled silently
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (date: string | null) => {
    if (!date) return 'En cours';
    return new Date(date).toLocaleDateString('fr-CA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('fr-CA')} $`;
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Actif en mission': return 'status-active';
      case 'Disponible': return 'status-available';
      case 'En intercontract': return 'status-intercontract';
      default: return '';
    }
  };
  
  const getMarginColor = (margin: number) => {
    if (margin >= 35) return '#22c55e';
    if (margin >= 25) return '#eab308';
    return '#ef4444';
  };
  
  // Calculer les données pour le graphique d'évolution des taux
  const ratesEvolution = missionHistory.map(mission => ({
    period: `${new Date(mission.startDate).toLocaleDateString('fr-CA', { month: 'short', year: '2-digit' })}`,
    costRate: mission.dailyCostRate,
    sellRate: mission.dailySellRate,
    marginRate: mission.marginRate,
  }));
  
  const maxRate = Math.max(...ratesEvolution.flatMap(r => [r.costRate, r.sellRate]), 1000);
  
  return (
    <div className="resource-details-overlay" onClick={onClose}>
      <div className="resource-details-content" onClick={(e) => e.stopPropagation()}>
        <div className="resource-details-header">
          <div>
            <h2>{resource.name}</h2>
            <p className="resource-details-subtitle">
              {resource.jobType} - {resource.seniority} - {resource.businessUnitCode}
            </p>
          </div>
          <button onClick={onClose} className="resource-details-close">×</button>
        </div>
        
        <div className="resource-details-body">
          {isLoading ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div className="astek-spinner" />
            </div>
          ) : (
            <>
              {/* KPIs synthèse */}
              {kpis && (
                <div className="resource-kpis">
                  <div className="resource-kpi-card">
                    <div className="resource-kpi-icon">📊</div>
                    <div className="resource-kpi-content">
                      <div className="resource-kpi-label">Taux de chargeabilité YTD</div>
                      <div className="resource-kpi-value">{kpis.utilizationRate.toFixed(1)}%</div>
                    </div>
                  </div>
                  
                  <div className="resource-kpi-card">
                    <div className="resource-kpi-icon">💰</div>
                    <div className="resource-kpi-content">
                      <div className="resource-kpi-label">Marge moyenne YTD</div>
                      <div className="resource-kpi-value">{kpis.averageMargin.toFixed(1)}%</div>
                    </div>
                  </div>
                  
                  <div className="resource-kpi-card">
                    <div className="resource-kpi-icon">👥</div>
                    <div className="resource-kpi-content">
                      <div className="resource-kpi-label">Clients servis</div>
                      <div className="resource-kpi-value">{kpis.clientsCount}</div>
                    </div>
                  </div>
                  
                  <div className="resource-kpi-card">
                    <div className="resource-kpi-icon">✅</div>
                    <div className="resource-kpi-content">
                      <div className="resource-kpi-label">Missions complétées</div>
                      <div className="resource-kpi-value">{kpis.completedMissions}</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="resource-details-grid">
                {/* Left column: Info + History */}
                <div className="resource-details-section">
                  <h3>Informations générales</h3>
                  
                  <div className="resource-info-grid">
                    <div className="resource-info-item">
                      <span className="resource-info-label">Nom complet</span>
                      <span className="resource-info-value"><strong>{resource.name}</strong></span>
                    </div>
                    
                    <div className="resource-info-item">
                      <span className="resource-info-label">Business Unit</span>
                      <span className="resource-info-value">
                        <span className="resource-badge resource-badge-bu">{resource.businessUnitCode}</span>
                      </span>
                    </div>
                    
                    <div className="resource-info-item">
                      <span className="resource-info-label">Métier</span>
                      <span className="resource-info-value">{resource.jobType}</span>
                    </div>
                    
                    <div className="resource-info-item">
                      <span className="resource-info-label">Séniorité</span>
                      <span className="resource-info-value">
                        <span className="resource-badge resource-badge-seniority">{resource.seniority}</span>
                      </span>
                    </div>
                    
                    <div className="resource-info-item">
                      <span className="resource-info-label">Manager</span>
                      <span className="resource-info-value">{resource.manager || '-'}</span>
                    </div>
                    
                    <div className="resource-info-item">
                      <span className="resource-info-label">Date d'embauche</span>
                      <span className="resource-info-value">{formatDate(resource.hireDate)}</span>
                    </div>
                    
                    <div className="resource-info-item">
                      <span className="resource-info-label">Client actuel</span>
                      <span className="resource-info-value">{resource.currentClient || '-'}</span>
                    </div>
                    
                    <div className="resource-info-item">
                      <span className="resource-info-label">Mission actuelle</span>
                      <span className="resource-info-value">{resource.currentMission || '-'}</span>
                    </div>
                    
                    <div className="resource-info-item">
                      <span className="resource-info-label">Statut</span>
                      <span className="resource-info-value">
                        <span className={`resource-badge resource-badge-status ${getStatusBadgeClass(resource.status)}`}>
                          {resource.status}
                        </span>
                      </span>
                    </div>
                    
                    <div className="resource-info-item">
                      <span className="resource-info-label">Email</span>
                      <span className="resource-info-value">{resource.email || '-'}</span>
                    </div>
                    
                    <div className="resource-info-item">
                      <span className="resource-info-label">Téléphone</span>
                      <span className="resource-info-value">{resource.phone || '-'}</span>
                    </div>
                  </div>
                  
                  {/* Historique des missions */}
                  <div className="resource-history-section">
                    <h3>Historique des missions</h3>
                    
                    {missionHistory.length === 0 ? (
                      <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>
                        Aucun historique de mission
                      </p>
                    ) : (
                      <div className="resource-timeline">
                        {missionHistory.map((mission) => (
                          <div key={mission.id} className="resource-timeline-item">
                            <div className="resource-timeline-marker">
                              <span className={`resource-timeline-badge ${mission.type === 'AT' ? 'badge-at' : 'badge-project'}`}>
                                {mission.type}
                              </span>
                            </div>
                            <div className="resource-timeline-content">
                              <div className="resource-timeline-header">
                                <h4>{mission.missionName}</h4>
                                <span className="resource-timeline-dates">
                                  {formatDate(mission.startDate)} → {formatDate(mission.endDate)}
                                </span>
                              </div>
                              <div className="resource-timeline-details">
                                <span><strong>Client:</strong> {mission.clientName}</span>
                                <span><strong>BU:</strong> {mission.businessUnitCode}</span>
                                <span><strong>Métier:</strong> {mission.jobType}</span>
                                <span><strong>Jours facturés:</strong> {mission.billedDays}</span>
                              </div>
                              <div className="resource-timeline-financial">
                                <span>{formatCurrency(mission.dailyCostRate)} / jour</span>
                                <span>→</span>
                                <span>{formatCurrency(mission.dailySellRate)} / jour</span>
                                <span 
                                  className="resource-timeline-margin"
                                  style={{ color: getMarginColor(mission.marginRate) }}
                                >
                                  Marge: {mission.marginRate.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right column: Charts */}
                <div className="resource-details-section">
                  <h3>Analyse des taux</h3>
                  
                  {/* Graphique d'évolution des taux */}
                  <div className="resource-chart-container">
                    <h4>Évolution des taux</h4>
                    {ratesEvolution.length === 0 ? (
                      <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>
                        Pas de données historiques
                      </p>
                    ) : (
                      <div className="resource-line-chart">
                        <div className="resource-chart-y-axis">
                          <span>{maxRate} $</span>
                          <span>{Math.round(maxRate * 0.75)} $</span>
                          <span>{Math.round(maxRate * 0.5)} $</span>
                          <span>{Math.round(maxRate * 0.25)} $</span>
                          <span>0 $</span>
                        </div>
                        <div className="resource-chart-area">
                          <svg width="100%" height="250" className="resource-chart-svg">
                            {/* Grid lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((y, i) => (
                              <line
                                key={i}
                                x1="0"
                                y1={250 - (y * 250)}
                                x2="100%"
                                y2={250 - (y * 250)}
                                stroke="#e2e8f0"
                                strokeWidth="1"
                              />
                            ))}
                            
                            {/* Taux vendu line */}
                            <polyline
                              fill="none"
                              stroke="#0066cc"
                              strokeWidth="3"
                              points={ratesEvolution.map((point, index) => {
                                const x = (index / (ratesEvolution.length - 1 || 1)) * 100;
                                const y = 250 - ((point.sellRate / maxRate) * 250);
                                return `${x}%,${y}`;
                              }).join(' ')}
                            />
                            
                            {/* Taux coûtant line */}
                            <polyline
                              fill="none"
                              stroke="#ef4444"
                              strokeWidth="3"
                              strokeDasharray="5,5"
                              points={ratesEvolution.map((point, index) => {
                                const x = (index / (ratesEvolution.length - 1 || 1)) * 100;
                                const y = 250 - ((point.costRate / maxRate) * 250);
                                return `${x}%,${y}`;
                              }).join(' ')}
                            />
                            
                            {/* Points for sell rate */}
                            {ratesEvolution.map((point, index) => {
                              const x = (index / (ratesEvolution.length - 1 || 1)) * 100;
                              const y = 250 - ((point.sellRate / maxRate) * 250);
                              return (
                                <circle
                                  key={`sell-${index}`}
                                  cx={`${x}%`}
                                  cy={y}
                                  r="4"
                                  fill="#0066cc"
                                />
                              );
                            })}
                            
                            {/* Points for cost rate */}
                            {ratesEvolution.map((point, index) => {
                              const x = (index / (ratesEvolution.length - 1 || 1)) * 100;
                              const y = 250 - ((point.costRate / maxRate) * 250);
                              return (
                                <circle
                                  key={`cost-${index}`}
                                  cx={`${x}%`}
                                  cy={y}
                                  r="4"
                                  fill="#ef4444"
                                />
                              );
                            })}
                          </svg>
                          <div className="resource-chart-x-axis">
                            {ratesEvolution.map((point, index) => (
                              <span key={index}>{point.period}</span>
                            ))}
                          </div>
                          <div className="resource-chart-legend">
                            <span className="legend-item">
                              <span className="legend-color" style={{ backgroundColor: '#0066cc' }}></span>
                              Taux vendu
                            </span>
                            <span className="legend-item">
                              <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
                              Taux coûtant
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Graphique de marge */}
                  <div className="resource-chart-container">
                    <h4>Évolution de la marge</h4>
                    {ratesEvolution.length === 0 ? (
                      <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>
                        Pas de données historiques
                      </p>
                    ) : (
                      <div className="resource-margin-bars">
                        {ratesEvolution.map((point, index) => (
                          <div key={index} className="resource-margin-bar-item">
                            <div className="resource-margin-bar-label">{point.period}</div>
                            <div className="resource-margin-bar-wrapper">
                              <div 
                                className="resource-margin-bar-fill"
                                style={{
                                  width: `${point.marginRate}%`,
                                  backgroundColor: getMarginColor(point.marginRate)
                                }}
                              >
                                <span className="resource-margin-bar-text">{point.marginRate.toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="resource-details-footer">
          <button onClick={onClose} className="astek-btn astek-btn-secondary">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
