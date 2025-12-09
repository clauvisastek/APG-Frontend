import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { technicalAssignmentsApi } from '../services/technicalAssignmentsApi';
import type { 
  TechnicalAssignment,
  MarginEvolution,
  DimensionBreakdown 
} from '../types/technicalAssignment';
import './TechnicalAssignmentDetailsModal.css';

interface TechnicalAssignmentDetailsModalProps {
  assignment: TechnicalAssignment;
  onClose: () => void;
}

export const TechnicalAssignmentDetailsModal = ({ 
  assignment, 
  onClose 
}: TechnicalAssignmentDetailsModalProps) => {
  const navigate = useNavigate();
  const [marginEvolution, setMarginEvolution] = useState<MarginEvolution[]>([]);
  const [dimensionBreakdown, setDimensionBreakdown] = useState<{
    byJobFamily: DimensionBreakdown[];
    bySeniority: DimensionBreakdown[];
  }>({ byJobFamily: [], bySeniority: [] });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadAnalytics();
  }, [assignment.id]);
  
  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const [evolution, breakdown] = await Promise.all([
        technicalAssignmentsApi.getMarginEvolution(assignment.id),
        technicalAssignmentsApi.getDimensionBreakdown(assignment.id),
      ]);
      setMarginEvolution(evolution);
      setDimensionBreakdown(breakdown);
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
      case 'Actif': return 'status-active';
      case 'En attente': return 'status-pending';
      case 'Terminé': return 'status-completed';
      case 'En risque': return 'status-risk';
      default: return '';
    }
  };
  
  const getMarginColor = (margin: number) => {
    if (margin >= 35) return '#22c55e';
    if (margin >= 25) return '#eab308';
    return '#ef4444';
  };
  
  const maxEvolutionMargin = Math.max(...marginEvolution.map(m => m.marginRate), 40);
  
  return (
    <div className="at-details-overlay" onClick={onClose}>
      <div className="at-details-content" onClick={(e) => e.stopPropagation()}>
        <div className="at-details-header">
          <div>
            <h2>Détails de la mission AT</h2>
            <p className="at-details-subtitle">{assignment.clientName} - {assignment.resourceName}</p>
          </div>
          <button onClick={onClose} className="at-details-close">×</button>
        </div>
        
        <div className="at-details-body">
          {isLoading ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div className="astek-spinner" />
            </div>
          ) : (
            <div className="at-details-grid">
              {/* Left column: General info */}
              <div className="at-details-section">
                <h3>Informations générales</h3>
                
                <div className="at-info-grid">
                  <div className="at-info-item">
                    <span className="at-info-label">Client</span>
                    <span className="at-info-value">{assignment.clientName}</span>
                  </div>
                  
                  <div className="at-info-item">
                    <span className="at-info-label">Département</span>
                    <span className="at-info-value">{assignment.department}</span>
                  </div>
                  
                  <div className="at-info-item">
                    <span className="at-info-label">Business Unit</span>
                    <span className="at-info-value">
                      <span className="at-badge at-badge-bu">{assignment.businessUnitCode}</span>
                    </span>
                  </div>
                  
                  <div className="at-info-item">
                    <span className="at-info-label">Secteur d'activité</span>
                    <span className="at-info-value">{assignment.industry}</span>
                  </div>
                  
                  <div className="at-info-item">
                    <span className="at-info-label">Ressource</span>
                    <span className="at-info-value"><strong>{assignment.resourceName}</strong></span>
                  </div>
                  
                  <div className="at-info-item">
                    <span className="at-info-label">Métier</span>
                    <span className="at-info-value">{assignment.jobFamily}</span>
                  </div>
                  
                  <div className="at-info-item">
                    <span className="at-info-label">Séniorité</span>
                    <span className="at-info-value">
                      <span className="at-badge at-badge-seniority">{assignment.seniority}</span>
                    </span>
                  </div>
                  
                  <div className="at-info-item">
                    <span className="at-info-label">Statut</span>
                    <span className="at-info-value">
                      <span className={`at-badge at-badge-status ${getStatusBadgeClass(assignment.status)}`}>
                        {assignment.status}
                      </span>
                    </span>
                  </div>
                  
                  <div className="at-info-item">
                    <span className="at-info-label">Date de début</span>
                    <span className="at-info-value">{formatDate(assignment.startDate)}</span>
                  </div>
                  
                  <div className="at-info-item">
                    <span className="at-info-label">Date de fin</span>
                    <span className="at-info-value">{formatDate(assignment.endDate)}</span>
                  </div>
                </div>
                
                <div className="at-financial-summary">
                  <h4>Résumé financier</h4>
                  <div className="at-financial-cards">
                    <div className="at-financial-card">
                      <div className="at-financial-label">Taux coûtant</div>
                      <div className="at-financial-value">{formatCurrency(assignment.dailyCostRate)}</div>
                      <div className="at-financial-unit">par jour</div>
                    </div>
                    
                    <div className="at-financial-card">
                      <div className="at-financial-label">Taux vendu</div>
                      <div className="at-financial-value">{formatCurrency(assignment.dailySellRate)}</div>
                      <div className="at-financial-unit">par jour</div>
                    </div>
                    
                    <div className="at-financial-card at-financial-card-margin">
                      <div className="at-financial-label">Marge</div>
                      <div className="at-financial-value" style={{ color: getMarginColor(assignment.marginRate) }}>
                        {assignment.marginRate.toFixed(1)}%
                      </div>
                      <div className="at-margin-bar-detail">
                        <div 
                          className="at-margin-fill-detail"
                          style={{
                            width: `${Math.min(assignment.marginRate, 100)}%`,
                            backgroundColor: getMarginColor(assignment.marginRate)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {assignment.notes && (
                  <div className="at-notes-section">
                    <h4>Notes</h4>
                    <p className="at-notes-text">{assignment.notes}</p>
                  </div>
                )}
              </div>
              
              {/* Right column: Analytics */}
              <div className="at-details-section">
                <h3>Analyse de la marge</h3>
                
                {/* Margin evolution chart */}
                <div className="at-chart-container">
                  <h4>Évolution de la marge</h4>
                  <div className="at-line-chart">
                    <div className="at-chart-y-axis">
                      <span>{maxEvolutionMargin}%</span>
                      <span>{(maxEvolutionMargin * 0.75).toFixed(0)}%</span>
                      <span>{(maxEvolutionMargin * 0.5).toFixed(0)}%</span>
                      <span>{(maxEvolutionMargin * 0.25).toFixed(0)}%</span>
                      <span>0%</span>
                    </div>
                    <div className="at-chart-area">
                      <svg width="100%" height="200" className="at-chart-svg">
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map((y) => (
                          <line
                            key={y}
                            x1="0"
                            y1={200 - (y * 2)}
                            x2="100%"
                            y2={200 - (y * 2)}
                            stroke="#e2e8f0"
                            strokeWidth="1"
                          />
                        ))}
                        
                        {/* Line */}
                        <polyline
                          fill="none"
                          stroke="#0066cc"
                          strokeWidth="3"
                          points={marginEvolution.map((point, index) => {
                            const x = (index / (marginEvolution.length - 1)) * 100;
                            const y = 200 - ((point.marginRate / maxEvolutionMargin) * 200);
                            return `${x}%,${y}`;
                          }).join(' ')}
                        />
                        
                        {/* Points */}
                        {marginEvolution.map((point, index) => {
                          const x = (index / (marginEvolution.length - 1)) * 100;
                          const y = 200 - ((point.marginRate / maxEvolutionMargin) * 200);
                          return (
                            <circle
                              key={index}
                              cx={`${x}%`}
                              cy={y}
                              r="4"
                              fill="#0066cc"
                            />
                          );
                        })}
                      </svg>
                      <div className="at-chart-x-axis">
                        {marginEvolution.map((point, index) => (
                          <span key={index}>{point.month}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Dimension breakdown */}
                <div className="at-insights-container">
                  <h4>Répartition de la marge</h4>
                  
                  <div className="at-insight-item">
                    <div className="at-insight-label">
                      <span className="at-insight-icon">💼</span>
                      Par métier
                    </div>
                    <div className="at-insight-bars">
                      {dimensionBreakdown.byJobFamily.map((item, index) => (
                        <div key={index} className="at-insight-bar-container">
                          <span className="at-insight-bar-label">{item.label}</span>
                          <div className="at-insight-bar">
                            <div 
                              className="at-insight-bar-fill"
                              style={{
                                width: `${item.value}%`,
                                backgroundColor: getMarginColor(item.value)
                              }}
                            />
                          </div>
                          <span className="at-insight-bar-value">{item.value.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="at-insight-item">
                    <div className="at-insight-label">
                      <span className="at-insight-icon">⭐</span>
                      Par séniorité
                    </div>
                    <div className="at-insight-bars">
                      {dimensionBreakdown.bySeniority.map((item, index) => (
                        <div key={index} className="at-insight-bar-container">
                          <span className="at-insight-bar-label">{item.label}</span>
                          <div className="at-insight-bar">
                            <div 
                              className="at-insight-bar-fill"
                              style={{
                                width: `${item.value}%`,
                                backgroundColor: getMarginColor(item.value)
                              }}
                            />
                          </div>
                          <span className="at-insight-bar-value">{item.value.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Key insights */}
                <div className="at-key-insights">
                  <h4>Points clés</h4>
                  <div className="at-insight-badges">
                    <div className="at-insight-badge">
                      <span className="at-insight-badge-icon">📊</span>
                      <div>
                        <div className="at-insight-badge-title">Métier dominant</div>
                        <div className="at-insight-badge-value">
                          {dimensionBreakdown.byJobFamily.length > 0 
                            ? dimensionBreakdown.byJobFamily[0].label 
                            : assignment.jobFamily}
                        </div>
                      </div>
                    </div>
                    
                    <div className="at-insight-badge">
                      <span className="at-insight-badge-icon">💎</span>
                      <div>
                        <div className="at-insight-badge-title">Profil le plus rentable</div>
                        <div className="at-insight-badge-value">
                          {dimensionBreakdown.bySeniority.length > 0 
                            ? `${dimensionBreakdown.bySeniority[0].label} ${dimensionBreakdown.byJobFamily[0]?.label || assignment.jobFamily}`
                            : `${assignment.seniority} ${assignment.jobFamily}`}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bouton vers ressources */}
                  <button 
                    onClick={() => {
                      navigate(`/resources?clientId=${assignment.clientId}&buCode=${assignment.businessUnitCode}&missionId=${assignment.id}`);
                      onClose();
                    }}
                    className="astek-btn astek-btn-primary"
                    style={{ marginTop: '16px', width: '100%' }}
                  >
                    👥 Voir les ressources
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="at-details-footer">
          <button onClick={onClose} className="astek-btn astek-btn-secondary">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
