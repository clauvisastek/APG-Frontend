import { useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Project, TeamMember } from '../types';
import './ProjectDetailsModal.css';

interface ProjectDetailsModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDetailsModal = ({ project, isOpen, onClose }: ProjectDetailsModalProps) => {
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

  // Mock data for global margin history if not present
  const marginHistory = project.globalMarginHistory || [
    { label: 'Jan', value: 20 },
    { label: 'Fev', value: 22 },
    { label: 'Mar', value: 21 },
    { label: 'Avr', value: 23 },
    { label: 'Mai', value: 25 },
    { label: 'Jun', value: project.targetMargin },
  ];

  // Mock team members if not present
  const teamMembers: TeamMember[] = project.teamMembers || [
    { id: '1', name: 'Sophie Martin', role: 'Tech Lead', costRate: 400, sellRate: 600, grossMargin: 33, netMargin: 30 },
    { id: '2', name: 'Marc Dubois', role: 'Senior Dev', costRate: 350, sellRate: 500, grossMargin: 30, netMargin: 28 },
    { id: '3', name: 'Julie Chen', role: 'Developer', costRate: 300, sellRate: 450, grossMargin: 33, netMargin: 31 },
    { id: '4', name: 'Thomas Roy', role: 'Junior Dev', costRate: 250, sellRate: 350, grossMargin: 29, netMargin: 26 },
    { id: '5', name: 'Emma Petit', role: 'Consultant', costRate: 200, sellRate: 280, grossMargin: 29, netMargin: 25 },
  ];

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
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={marginHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" stroke="#6b7280" style={{ fontSize: '12px' }} />
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
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#00A859" 
                    strokeWidth={3}
                    dot={{ fill: '#00A859', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2: Margin by Team Member */}
            <div className="chart-section">
              <h3 className="section-title">Marge par membre de l'équipe</h3>
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
              <div className="team-summary">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
