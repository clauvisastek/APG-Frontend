import { useMemo, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useProjects, useBusinessUnits, useClients } from '../hooks/useApi';
import { getUserBusinessUnitCodes, hasRole } from '../utils/roleUtils';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell 
} from 'recharts';
import type { Project } from '../types';
import './HomePage.css';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface BusinessUnit {
  id: string;
  code: string;
  name: string;
}

interface DashboardKpis {
  totalProjects: number;
  activeProjects: number;
  profitableProjects: number;
  atRiskProjects: number;
  averageMargin: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  clientCount: number;
  resourceCount: number;
}

interface BUKpis {
  buCode: string;
  buName: string;
  
  // 1. Revenu mensuel récurrent (MRR)
  mrr: number;
  
  // 2. EBITDA
  ebitda: number;
  ebitdaMargin: number;
  
  // 3. Marge brute par ressource
  grossMarginPercent: number;
  grossMarginAmount: number;
  grossMarginPerResource: number;
  
  // 4. Marge nette
  netMargin: number;
  netMarginPercent: number;
  
  // 5. Taux journalier moyen (TJM)
  averageDailyRate: number;
  marketBenchmark: number;
  internalTarget: number;
  
  // 6. Coûtant moyen
  averageCost: number;
  costByRole: { role: string; avgCost: number }[];
  
  // 7. Rendement par employé
  revenuePerEmployee: number;
  
  // Métriques additionnelles
  totalRevenue: number;
  totalCost: number;
  resourceCount: number;
  projectCount: number;
}

interface MarginDataPoint {
  month: string;
  value: number;
  target: number;
}

interface MarginDistribution {
  name: string;
  value: number;
  color: string;
}

interface RevenueByBU {
  name: string;
  revenue: number;
  margin: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Compute dashboard KPIs from a list of projects
 */
function computeKpisForProjects(projects: Project[]): DashboardKpis {
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => !p.isDeleted).length;
  const profitableProjects = projects.filter(p => p.targetMargin >= 20).length;
  const atRiskProjects = projects.filter(p => p.targetMargin < 15).length;
  
  // Calculate revenue, cost and profit
  const totalRevenue = projects.reduce((sum, p) => {
    const assignments = p.technicalAssignments || [];
    return sum + assignments.reduce((aSum, a) => aSum + (a.billRate * a.hoursPerWeek * 52 / 12 * a.durationMonths), 0);
  }, 0);
  
  const totalCost = projects.reduce((sum, p) => {
    const assignments = p.technicalAssignments || [];
    return sum + assignments.reduce((aSum, a) => aSum + (a.monthlyCost * a.durationMonths), 0);
  }, 0);
  
  const totalProfit = totalRevenue - totalCost;
  
  const averageMargin = totalProjects > 0
    ? projects.reduce((sum, p) => sum + p.targetMargin, 0) / totalProjects
    : 0;

  // Count unique clients and resources
  const uniqueClients = new Set(projects.map(p => p.clientId)).size;
  const totalResources = projects.reduce((sum, p) => sum + (p.technicalAssignments?.length || 0), 0);

  return {
    totalProjects,
    activeProjects,
    profitableProjects,
    atRiskProjects,
    averageMargin: Math.round(averageMargin * 10) / 10,
    totalRevenue: Math.round(totalRevenue),
    totalCost: Math.round(totalCost),
    totalProfit: Math.round(totalProfit),
    clientCount: uniqueClients,
    resourceCount: totalResources,
  };
}

/**
 * Group projects by business unit code
 */
function groupProjectsByBusinessUnit(projects: Project[]): Record<string, Project[]> {
  return projects.reduce((acc, project) => {
    const buCode = project.businessUnitCode;
    if (!acc[buCode]) {
      acc[buCode] = [];
    }
    acc[buCode].push(project);
    return acc;
  }, {} as Record<string, Project[]>);
}

/**
 * Get visible business units for current user
 */
function getVisibleBusinessUnitsForUser(
  userBuCodes: string[],
  allBusinessUnits: BusinessUnit[],
  isGlobalViewer: boolean
): BusinessUnit[] {
  if (isGlobalViewer) {
    return allBusinessUnits;
  }
  return allBusinessUnits.filter(bu => userBuCodes.includes(bu.code));
}

/**
 * Generate margin evolution data with historical trend
 */
function generateMarginEvolutionData(projects: Project[]): MarginDataPoint[] {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const currentMonth = new Date().getMonth();
  
  return months.slice(0, currentMonth + 1).map((month, index) => {
    const baseMargin = projects.length > 0 
      ? projects.reduce((sum, p) => sum + p.targetMargin, 0) / projects.length
      : 20;
    
    // Simulate historical variation with slight trend
    const trendFactor = (index - currentMonth / 2) * 0.5;
    const variation = (Math.random() - 0.5) * 3 + trendFactor;
    
    return {
      month,
      value: Math.round((baseMargin + variation) * 10) / 10,
      target: 20, // Target margin
    };
  });
}

/**
 * Calculate margin distribution for pie chart
 */
function calculateMarginDistribution(projects: Project[]): MarginDistribution[] {
  const excellent = projects.filter(p => p.targetMargin >= 25).length;
  const good = projects.filter(p => p.targetMargin >= 20 && p.targetMargin < 25).length;
  const acceptable = projects.filter(p => p.targetMargin >= 15 && p.targetMargin < 20).length;
  const atRisk = projects.filter(p => p.targetMargin < 15).length;

  return [
    { name: 'Excellente (≥25%)', value: excellent, color: '#10B981' },
    { name: 'Bonne (20-25%)', value: good, color: '#00A859' },
    { name: 'Acceptable (15-20%)', value: acceptable, color: '#F59E0B' },
    { name: 'À risque (<15%)', value: atRisk, color: '#EF4444' },
  ].filter(d => d.value > 0);
}

/**
 * Calculate comprehensive KPIs for a Business Unit
 */
function calculateBUKpis(
  buCode: string,
  buName: string,
  projects: Project[]
): BUKpis {
  const buProjects = projects.filter(p => p.businessUnitCode === buCode);
  const resourceCount = buProjects.reduce((sum, p) => sum + (p.technicalAssignments?.length || 0), 0);
  
  // Calculate revenue and costs
  let totalRevenue = 0;
  let totalCost = 0;
  let totalDailyRates = 0;
  let totalCosts = 0;
  let rateCount = 0;
  let costCount = 0;
  
  const costsByRole: Record<string, { total: number; count: number }> = {};
  
  buProjects.forEach(project => {
    const assignments = project.technicalAssignments || [];
    
    assignments.forEach(assignment => {
      // Revenue calculation
      const monthlyHours = (assignment.hoursPerWeek * 52) / 12;
      const assignmentRevenue = assignment.billRate * monthlyHours * assignment.durationMonths;
      totalRevenue += assignmentRevenue;
      
      // Cost calculation
      const assignmentCost = assignment.monthlyCost * assignment.durationMonths;
      totalCost += assignmentCost;
      
      // Daily rate (assuming 8 hours/day)
      const dailyRate = assignment.billRate * 8;
      totalDailyRates += dailyRate;
      rateCount++;
      
      // Cost tracking
      totalCosts += assignment.monthlyCost;
      costCount++;
      
      // Cost by role
      const role = assignment.role || 'Non spécifié';
      if (!costsByRole[role]) {
        costsByRole[role] = { total: 0, count: 0 };
      }
      costsByRole[role].total += assignment.monthlyCost;
      costsByRole[role].count++;
    });
  });
  
  // 1. MRR - Revenu mensuel récurrent
  const mrr = totalRevenue / 12;
  
  // 2. EBITDA (approximation: profit opérationnel sans amortissement)
  const operatingExpenses = totalCost * 0.15; // 15% de frais opérationnels estimés
  const ebitda = totalRevenue - totalCost - operatingExpenses;
  const ebitdaMargin = totalRevenue > 0 ? (ebitda / totalRevenue) * 100 : 0;
  
  // 3. Marge brute
  const grossMargin = totalRevenue - totalCost;
  const grossMarginPercent = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;
  const grossMarginPerResource = resourceCount > 0 ? grossMargin / resourceCount : 0;
  
  // 4. Marge nette (après tous les coûts)
  const administrativeCosts = totalRevenue * 0.08; // 8% de frais administratifs
  const netMargin = grossMargin - operatingExpenses - administrativeCosts;
  const netMarginPercent = totalRevenue > 0 ? (netMargin / totalRevenue) * 100 : 0;
  
  // 5. Taux journalier moyen (TJM)
  const averageDailyRate = rateCount > 0 ? totalDailyRates / rateCount : 0;
  const marketBenchmark = averageDailyRate * 0.95; // Market benchmark estimé à -5%
  const internalTarget = averageDailyRate * 1.10; // Target interne à +10%
  
  // 6. Coûtant moyen
  const averageCost = costCount > 0 ? totalCosts / costCount : 0;
  const costByRole = Object.entries(costsByRole).map(([role, data]) => ({
    role,
    avgCost: data.total / data.count,
  })).sort((a, b) => b.avgCost - a.avgCost);
  
  // 7. Rendement par employé
  const revenuePerEmployee = resourceCount > 0 ? totalRevenue / resourceCount : 0;
  
  return {
    buCode,
    buName,
    mrr: Math.round(mrr),
    ebitda: Math.round(ebitda),
    ebitdaMargin: Math.round(ebitdaMargin * 10) / 10,
    grossMarginPercent: Math.round(grossMarginPercent * 10) / 10,
    grossMarginAmount: Math.round(grossMargin),
    grossMarginPerResource: Math.round(grossMarginPerResource),
    netMargin: Math.round(netMargin),
    netMarginPercent: Math.round(netMarginPercent * 10) / 10,
    averageDailyRate: Math.round(averageDailyRate),
    marketBenchmark: Math.round(marketBenchmark),
    internalTarget: Math.round(internalTarget),
    averageCost: Math.round(averageCost),
    costByRole,
    revenuePerEmployee: Math.round(revenuePerEmployee),
    totalRevenue: Math.round(totalRevenue),
    totalCost: Math.round(totalCost),
    resourceCount,
    projectCount: buProjects.length,
  };
}

// ============================================================================
// Sub-Components
// ============================================================================

interface KpiCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: string;
}

const KpiCard = ({ label, value, subtitle, trend, trendValue, icon }: KpiCardProps) => (
  <div className="dashboard-kpi-card">
    {icon && <div className="kpi-icon">{icon}</div>}
    <div className="kpi-label">{label}</div>
    <div className="kpi-value">{value}</div>
    {subtitle && <div className="kpi-subtitle">{subtitle}</div>}
    {trend && trendValue && (
      <div className={`kpi-trend kpi-trend-${trend}`}>
        {trend === 'up' && '↑'}
        {trend === 'down' && '↓'}
        {trend === 'neutral' && '→'}
        {' '}{trendValue}
      </div>
    )}
  </div>
);

interface BuSectionProps {
  businessUnit: BusinessUnit;
  projects: Project[];
}

const BuSection = ({ businessUnit, projects }: BuSectionProps) => {
  const kpis = computeKpisForProjects(projects);
  const marginData = generateMarginEvolutionData(projects);
  
  // Prepare data for margin distribution chart
  const projectMarginData = projects
    .slice(0, 10) // Limit to 10 projects for readability
    .map(p => ({
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      margin: p.targetMargin,
      isGood: p.targetMargin >= 20,
    }));

  return (
    <div className="bu-section">
      {/* Section Header */}
      <div className="bu-section-header">
        <div className="bu-section-title">
          <h2>{businessUnit.name} ({businessUnit.code})</h2>
          <span className="bu-project-count">{projects.length} projet{projects.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* BU KPIs */}
      <div className="bu-kpis-grid">
        <div className="bu-kpi-card">
          <div className="bu-kpi-label">Total projets</div>
          <div className="bu-kpi-value">{kpis.totalProjects}</div>
        </div>
        <div className="bu-kpi-card">
          <div className="bu-kpi-label">Rentables</div>
          <div className="bu-kpi-value success">{kpis.profitableProjects}</div>
        </div>
        <div className="bu-kpi-card">
          <div className="bu-kpi-label">À risque</div>
          <div className="bu-kpi-value warning">{kpis.atRiskProjects}</div>
        </div>
        <div className="bu-kpi-card">
          <div className="bu-kpi-label">Marge moyenne</div>
          <div className="bu-kpi-value">{kpis.averageMargin}%</div>
        </div>
      </div>

      {/* BU Charts */}
      <div className="bu-charts-grid">
        {/* Chart 1: Margin Evolution */}
        <div className="bu-chart-card">
          <h3 className="bu-chart-title">Évolution de la marge ({businessUnit.code})</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={marginData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280" 
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280" 
                style={{ fontSize: '12px' }}
                domain={[0, 40]}
              />
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
                strokeWidth={2}
                dot={{ fill: '#00A859', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Margin Distribution */}
        <div className="bu-chart-card">
          <h3 className="bu-chart-title">Marge par projet</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={projectMarginData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280" 
                angle={-45}
                textAnchor="end"
                height={80}
                style={{ fontSize: '10px' }}
              />
              <YAxis 
                stroke="#6b7280" 
                style={{ fontSize: '12px' }}
                domain={[0, 40]}
              />
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
                radius={[4, 4, 0, 0]}
              >
                {projectMarginData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isGood ? '#00A859' : '#F59E0B'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="bu-chart-legend">
            <span className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: '#00A859' }}></span>
              Marge ≥ 20%
            </span>
            <span className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: '#F59E0B' }}></span>
              Marge &lt; 20%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// BU KPIs Detailed Section Component
// ============================================================================

interface BUKpisSectionProps {
  kpis: BUKpis;
  isExpanded: boolean;
  onToggle: () => void;
}

const BUKpisSection: React.FC<BUKpisSectionProps> = ({ kpis, isExpanded, onToggle }) => {
  // Prepare data for TJM comparison chart
  const tjmComparisonData = [
    { name: 'Marché', value: kpis.marketBenchmark, fill: '#94A3B8' },
    { name: 'Réel', value: kpis.averageDailyRate, fill: kpis.averageDailyRate >= kpis.internalTarget ? '#10B981' : '#F59E0B' },
    { name: 'Objectif', value: kpis.internalTarget, fill: '#3B82F6' },
  ];

  return (
    <div className="bu-kpis-section">
      {/* Header - Clickable */}
      <div className="bu-kpis-header" onClick={onToggle} style={{ cursor: 'pointer' }}>
        <div className="bu-kpis-header-left">
          <h3 className="bu-kpis-title">
            <span className="bu-expand-icon">{isExpanded ? '▼' : '▶'}</span>
            {kpis.buName} <span className="bu-code-badge">{kpis.buCode}</span>
          </h3>
          <div className="bu-kpis-subtitle">
            {kpis.projectCount} projet{kpis.projectCount > 1 ? 's' : ''} • {kpis.resourceCount} ressource{kpis.resourceCount > 1 ? 's' : ''}
          </div>
        </div>
        <div className="bu-kpis-header-right">
          <div className="bu-kpis-summary">
            <div className="bu-summary-item">
              <span className="bu-summary-label">MRR</span>
              <span className="bu-summary-value">{(kpis.mrr / 1000).toFixed(0)}K$</span>
            </div>
            <div className="bu-summary-item">
              <span className="bu-summary-label">Marge</span>
              <span className="bu-summary-value">{kpis.grossMarginPercent}%</span>
            </div>
            <div className="bu-summary-item">
              <span className="bu-summary-label">TJM</span>
              <span className="bu-summary-value">{kpis.averageDailyRate}$</span>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="bu-kpis-content">
          {/* Section 1: Revenus et Marges - 4 cards */}
          <div className="kpi-section-compact">
            <h4 className="kpi-section-title">💰 Revenus et Rentabilité</h4>
            <div className="kpi-cards-grid-4">
              <div className="kpi-metric-card primary compact">
                <div className="kpi-metric-label">MRR</div>
                <div className="kpi-metric-value">{(kpis.mrr / 1000).toFixed(0)}K$</div>
                <div className="kpi-metric-subtitle">{(kpis.totalRevenue / 1000).toFixed(0)}K$/an</div>
              </div>

              <div className="kpi-metric-card success compact">
                <div className="kpi-metric-label">EBITDA</div>
                <div className="kpi-metric-value">{(kpis.ebitda / 1000).toFixed(0)}K$</div>
                <div className="kpi-metric-subtitle">{kpis.ebitdaMargin}%</div>
              </div>

              <div className="kpi-metric-card info compact">
                <div className="kpi-metric-label">Marge Brute</div>
                <div className="kpi-metric-value">{kpis.grossMarginPercent}%</div>
                <div className="kpi-metric-subtitle">{(kpis.grossMarginAmount / 1000).toFixed(0)}K$</div>
              </div>

              <div className="kpi-metric-card compact">
                <div className="kpi-metric-label">Marge Nette</div>
                <div className="kpi-metric-value">{kpis.netMarginPercent}%</div>
                <div className="kpi-metric-subtitle">{(kpis.netMargin / 1000).toFixed(0)}K$</div>
              </div>
            </div>
          </div>

          {/* Section 2 & 3 & 4: Combined Row Layout */}
          <div className="kpi-section-compact">
            <div className="kpi-combined-grid">
              {/* Section 2: Performance par Ressource */}
              <div className="kpi-subsection">
                <h4 className="kpi-section-title">👤 Performance / Ressource</h4>
                <div className="kpi-cards-vertical">
                  <div className="kpi-metric-card highlight compact">
                    <div className="kpi-metric-label">Marge / Ressource</div>
                    <div className="kpi-metric-value">{(kpis.grossMarginPerResource / 1000).toFixed(1)}K$</div>
                  </div>
                  <div className="kpi-metric-card highlight compact">
                    <div className="kpi-metric-label">Revenu / Employé</div>
                    <div className="kpi-metric-value">{(kpis.revenuePerEmployee / 1000).toFixed(0)}K$</div>
                  </div>
                </div>
              </div>

              {/* Section 3: TJM */}
              <div className="kpi-subsection kpi-subsection-large">
                <h4 className="kpi-section-title">📅 Taux Journalier Moyen (TJM)</h4>
                <div className="tjm-compact-wrapper">
                  <div className="tjm-metrics-horizontal">
                    <div className="tjm-metric-compact">
                      <span className="tjm-label">Marché</span>
                      <span className="tjm-value">{kpis.marketBenchmark}$</span>
                      <span className="tjm-badge">-5%</span>
                    </div>
                    <div className="tjm-metric-compact primary">
                      <span className="tjm-label">Réel</span>
                      <span className="tjm-value">{kpis.averageDailyRate}$</span>
                    </div>
                    <div className="tjm-metric-compact">
                      <span className="tjm-label">Objectif</span>
                      <span className="tjm-value">{kpis.internalTarget}$</span>
                      <span className="tjm-badge">+10%</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={80}>
                    <BarChart data={tjmComparisonData} layout="vertical" margin={{ top: 0, right: 5, bottom: 0, left: 5 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={60} style={{ fontSize: '11px' }} />
                      <Tooltip formatter={(value: number) => [`${value}$`, 'TJM']} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {tjmComparisonData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Section 4: Coûtants */}
              <div className="kpi-subsection">
                <h4 className="kpi-section-title">💸 Coûtants Moyens</h4>
                <div className="cost-compact-wrapper">
                  <div className="cost-overview-compact">
                    <div className="cost-avg-label">Coûtant Moyen</div>
                    <div className="cost-avg-value">{(kpis.averageCost / 1000).toFixed(0)}K$</div>
                  </div>
                  {kpis.costByRole.length > 0 && (
                    <div className="cost-roles-mini">
                      {kpis.costByRole.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="cost-role-mini">
                          <span className="cost-role-mini-name">{item.role}</span>
                          <div className="cost-role-mini-bar">
                            <div 
                              className="cost-role-mini-fill"
                              style={{ 
                                width: `${(item.avgCost / kpis.costByRole[0].avgCost) * 100}%`,
                                backgroundColor: idx === 0 ? '#00A859' : idx === 1 ? '#3B82F6' : '#8B5CF6'
                              }}
                            />
                          </div>
                          <span className="cost-role-mini-value">{(item.avgCost / 1000).toFixed(0)}K$</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const HomePage = () => {
  const { user } = useAuth0();
  const { data: allProjects = [], isLoading: projectsLoading } = useProjects();
  const { data: businessUnits = [], isLoading: businessUnitsLoading } = useBusinessUnits();
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const [expandedBUs, setExpandedBUs] = useState<Set<string>>(new Set());
  const [hasInitialized, setHasInitialized] = useState(false);

  // Determine user access level
  const isGlobalViewer = useMemo(() => {
    return hasRole(user, 'Admin') || hasRole(user, 'CFO');
  }, [user]);

  const userBuCodes = useMemo(() => {
    return getUserBusinessUnitCodes(user);
  }, [user]);

  // Filter visible projects
  const visibleProjects = useMemo(() => {
    if (isGlobalViewer) {
      return allProjects;
    }
    return allProjects.filter(p => userBuCodes.includes(p.businessUnitCode));
  }, [allProjects, isGlobalViewer, userBuCodes]);

  // Get visible business units
  const visibleBusinessUnits = useMemo(() => {
    const buList = businessUnits.map(bu => ({
      id: bu.id,
      code: bu.code,
      name: bu.name,
    }));
    return getVisibleBusinessUnitsForUser(userBuCodes, buList, isGlobalViewer);
  }, [businessUnits, userBuCodes, isGlobalViewer]);

  // Calculate BU KPIs for each BU (use all projects for calculation)
  const buKpisData = useMemo(() => {
    // Get all unique BU codes from projects
    const buCodesWithProjects = new Set(allProjects.map(p => p.businessUnitCode));
    
    // If user is global viewer, show all BUs with projects
    // Otherwise, show only user's BUs that have projects
    const busToShow = Array.from(buCodesWithProjects)
      .filter(code => isGlobalViewer || userBuCodes.includes(code))
      .map(code => {
        const bu = businessUnits.find(b => b.code === code);
        return bu ? { code: bu.code, name: bu.name } : { code, name: code };
      });
    
    return busToShow
      .map(bu => calculateBUKpis(bu.code, bu.name, allProjects))
      .filter(kpi => kpi.projectCount > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue); // Sort by revenue descending
  }, [allProjects, businessUnits, isGlobalViewer, userBuCodes]);

  // Initialize first BU as expanded by default
  useEffect(() => {
    if (!hasInitialized && buKpisData.length > 0 && expandedBUs.size === 0) {
      setExpandedBUs(new Set([buKpisData[0].buCode]));
      setHasInitialized(true);
    }
  }, [buKpisData, hasInitialized, expandedBUs.size]);

  // Compute global KPIs
  const globalKpis = useMemo(() => {
    const projectsForKpis = isGlobalViewer ? allProjects : visibleProjects;
    return computeKpisForProjects(projectsForKpis);
  }, [allProjects, visibleProjects, isGlobalViewer]);

  // Generate chart data for global overview
  const marginEvolution = useMemo(() => 
    generateMarginEvolutionData(visibleProjects), [visibleProjects]
  );
  
  const marginDistribution = useMemo(() => 
    calculateMarginDistribution(visibleProjects), [visibleProjects]
  );

  const isLoading = projectsLoading || businessUnitsLoading || clientsLoading;

  if (isLoading) {
    return (
      <div className="apg-dashboard">
        <div className="dashboard-container">
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="astek-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
            <p style={{ marginTop: '16px', color: '#6B7280' }}>Chargement des données...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="apg-dashboard">
      <div className="dashboard-container">
        {/* Page Title */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">📊 Tableau de bord - KPIs par BU</h1>
            <p className="dashboard-subtitle">
              {isGlobalViewer 
                ? `Vue d'ensemble globale - ${buKpisData.length} Business Units` 
                : `Vos Business Units - ${buKpisData.length} BU${buKpisData.length > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* Global Summary KPIs (Compact) */}
        {isGlobalViewer && (
          <div className="global-summary-section">
            <div className="global-summary-badge">
              🌍 Résumé Global
            </div>
            <div className="global-summary-grid">
              <div className="summary-metric">
                <span className="summary-metric-label">Total Projets</span>
                <span className="summary-metric-value">{globalKpis.totalProjects}</span>
              </div>
              <div className="summary-metric">
                <span className="summary-metric-label">Revenu Total</span>
                <span className="summary-metric-value">{(globalKpis.totalRevenue / 1000000).toFixed(2)}M$</span>
              </div>
              <div className="summary-metric">
                <span className="summary-metric-label">Marge Moyenne</span>
                <span className="summary-metric-value">{globalKpis.averageMargin}%</span>
              </div>
              <div className="summary-metric">
                <span className="summary-metric-label">Rentables / À Risque</span>
                <span className="summary-metric-value">
                  <span style={{ color: '#10B981' }}>{globalKpis.profitableProjects}</span>
                  {' / '}
                  <span style={{ color: '#EF4444' }}>{globalKpis.atRiskProjects}</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* BU KPIs Sections */}
        {buKpisData.length > 0 ? (
          <div className="bu-kpis-container">
            {buKpisData.map((kpis, index) => (
              <BUKpisSection 
                key={kpis.buCode} 
                kpis={kpis}
                isExpanded={expandedBUs.has(kpis.buCode)}
                onToggle={() => {
                  const newExpanded = new Set(expandedBUs);
                  if (newExpanded.has(kpis.buCode)) {
                    newExpanded.delete(kpis.buCode);
                  } else {
                    newExpanded.add(kpis.buCode);
                  }
                  setExpandedBUs(newExpanded);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <div className="empty-state-icon">📊</div>
            <h3>Aucune donnée disponible</h3>
            <p>
              {isGlobalViewer 
                ? "Il n'y a pas encore de projets dans le système."
                : "Vous n'avez pas accès à des Business Units ou il n'y a pas de projets pour vos BU."}
            </p>
          </div>
        )}

        {/* Access Info */}
        {!isGlobalViewer && userBuCodes.length > 0 && (
          <div className="access-info">
            <span className="access-info-icon">🔒</span>
            <span className="access-info-text">
              Vous avez accès aux Business Units : <strong>{userBuCodes.join(', ')}</strong>
            </span>
          </div>
        )}
      </div>
    </main>
  );
};
