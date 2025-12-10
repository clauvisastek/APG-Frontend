import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Project, TeamMember } from '../types';
import './ProjectDetailsModal.css';

interface ProjectDetailsModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDetailsModal = ({ project, isOpen, onClose }: ProjectDetailsModalProps) => {
  const navigate = useNavigate();

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Use real data from project - no mocks
  const marginHistory = project.globalMarginHistory || [];
  const teamMembers: TeamMember[] = project.teamMembers || [];

  // Prepare team members data for chart
  const teamMembersData = teamMembers.map(member => ({
    name: member.name,
    margin: member.grossMargin,
    isDriver: member.grossMargin >= project.targetMargin,
  }));

  // Sort team members by margin
  const sortedByMargin = [...teamMembers].sort((a, b) => b.grossMargin - a.grossMargin);
  const topDrivers = sortedByMargin.slice(0, 3);
  const bottomDraggers = sortedByMargin.slice(-3).reverse();

  // Navigate to resources page
  const handleViewResources = () => {
    onClose();
    navigate('/resources');
  };

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: project.currency || 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get status badge class
  const getStatusClass = () => {
    const status = project.status;
    if (status === 'Actif') return 'status-active';
    if (status === 'Terminé') return 'status-completed';
    if (status === 'En pause') return 'status-on-hold';
    return 'status-pending';
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="project-details-backdrop" onClick={handleBackdropClick}>
      <div className="project-details-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <h2 className="modal-title">{project.name}</h2>
            <div className="modal-tags">
              <span className="project-code-tag">{project.code || 'N/A'}</span>
              <span className="business-unit-tag">{project.businessUnitCode}</span>
              <span className={`status-tag ${getStatusClass()}`}>{project.status}</span>
              {project.notes?.includes('Demande de validation') && (
                <span className="validation-status-badge pending">
                  ⏳ En attente de validation
                </span>
              )}
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Left Column: Basic Info */}
          <div className="modal-left-column">
            <div className="info-section">
              <h3 className="section-title">Informations générales</h3>
              
              <div className="info-row">
                <span className="info-label">Client:</span>
                <span className="info-value">{project.client?.name || 'N/A'}</span>
              </div>

              <div className="info-row">
                <span className="info-label">Chef de projet:</span>
                <span className="info-value">{project.responsibleName || 'N/A'}</span>
              </div>

              <div className="info-row">
                <span className="info-label">Business Unit:</span>
                <span className="info-value">{project.businessUnit?.name || 'N/A'}</span>
              </div>

              <div className="info-row">
                <span className="info-label">Type:</span>
                <span className="info-value">{project.type}</span>
              </div>

              <div className="info-row">
                <span className="info-label">Date de début:</span>
                <span className="info-value">{formatDate(project.startDate)}</span>
              </div>

              <div className="info-row">
                <span className="info-label">Date de fin:</span>
                <span className="info-value">{formatDate(project.endDate)}</span>
              </div>

              <div className="info-row">
                <span className="info-label">Devise:</span>
                <span className="info-value">{project.currency}</span>
              </div>

              <div className="info-divider"></div>

              <div className="info-row highlight">
                <span className="info-label">Marge globale:</span>
                <span className="info-value-large">{project.targetMargin}%</span>
              </div>

              <div className="info-row">
                <span className="info-label">Marge minimum:</span>
                <span className="info-value">{project.minMargin}%</span>
              </div>

              {project.ytdRevenue && (
                <div className="info-row highlight">
                  <span className="info-label">CA YTD:</span>
                  <span className="info-value-large">{formatCurrency(project.ytdRevenue)}</span>
                </div>
              )}

              {project.notes && (
                <>
                  <div className="info-divider"></div>
                  <div className="info-row vertical">
                    <span className="info-label">Notes:</span>
                    <span className="info-value">{project.notes}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Charts */}
          <div className="modal-right-column">
            {/* Chart 1: Global Margin Evolution */}
            <div className="chart-section">
              <h3 className="section-title">Évolution de la marge globale</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                Suivi de la marge en fonction des changements d'équipe
              </p>
              {marginHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={marginHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="label" 
                      stroke="#6b7280" 
                      style={{ fontSize: '11px' }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      stroke="#6b7280" 
                      style={{ fontSize: '12px' }}
                      domain={[0, 'auto']}
                      label={{ value: 'Marge (%)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        padding: '8px 12px'
                      }}
                      formatter={(value: number) => [`${Number(value).toFixed(2)}%`, 'Marge globale']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#00A859" 
                      strokeWidth={3}
                      dot={{ fill: '#00A859', r: 5, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ 
                  height: '200px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  color: '#6b7280',
                  fontSize: '14px',
                  gap: '8px'
                }}>
                  <span>📊</span>
                  <span>Aucune donnée d'historique de marge disponible</span>
                  <span style={{ fontSize: '12px' }}>L'historique sera créé automatiquement lors des modifications d'équipe</span>
                </div>
              )}
            </div>

            {/* Chart 2: Margin by Team Member */}
            <div className="chart-section">
              <h3 className="section-title">Marge par membre de l'équipe</h3>
              {teamMembers.length > 0 ? (
                <>
                  <div className="chart-legend">
                    <span className="legend-item">
                      <span className="legend-color legend-driver"></span>
                      Génère de la marge
                    </span>
                    <span className="legend-item">
                      <span className="legend-color legend-dragger"></span>
                      Impacte négativement
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={teamMembersData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#6b7280" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        style={{ fontSize: '11px' }}
                      />
                      <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                        formatter={(value: number) => [`${value}%`, 'Marge']}
                      />
                      <Bar 
                        dataKey="margin" 
                        fill="#00A859"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Team Summary */}
                  {topDrivers.length > 0 && (
                    <div className="team-summary">
                      {topDrivers.length > 0 && (
                        <div className="summary-section">
                          <h4 className="summary-title">🌟 Top contributeurs :</h4>
                          <ul className="summary-list">
                            {topDrivers.map(member => (
                              <li key={member.id}>
                                <strong>{member.name}</strong> ({member.role}) - {member.grossMargin}%
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {bottomDraggers.length > 0 && (
                        <div className="summary-section">
                          <h4 className="summary-title">⚠️ À surveiller :</h4>
                          <ul className="summary-list">
                            {bottomDraggers.map(member => (
                              <li key={member.id}>
                                <strong>{member.name}</strong> ({member.role}) - {member.grossMargin}%
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Button to view resources */}
                  <div style={{ 
                    marginTop: '20px', 
                    paddingTop: '16px', 
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <button
                      onClick={handleViewResources}
                      className="astek-btn astek-btn-secondary"
                      style={{
                        padding: '10px 20px',
                        fontSize: '14px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span>👥</span>
                      Consulter les ressources
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ 
                  height: '220px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  Aucun membre d'équipe assigné à ce projet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
