import React from 'react';
import type { MarketTrendsResponse, Positioning, RiskLevel, MarketDemand } from '../types/marketTrends';
import './MarketTrendsCard.css';

interface MarketTrendsCardProps {
  trends: MarketTrendsResponse | null;
  isLoading: boolean;
  error: string | null;
}

export const MarketTrendsCard: React.FC<MarketTrendsCardProps> = ({
  trends,
  isLoading,
  error,
}) => {
  // Helper function to get positioning badge style and label
  const getPositioningStyle = (positioning: Positioning): { className: string; label: string } => {
    switch (positioning) {
      case 'far_below':
        return {
          className: 'market-trends-badge far-below',
          label: 'Très en-dessous',
        };
      case 'below':
        return {
          className: 'market-trends-badge below',
          label: 'En-dessous',
        };
      case 'in_line':
        return {
          className: 'market-trends-badge in-line',
          label: 'Conforme au marché',
        };
      case 'above':
        return {
          className: 'market-trends-badge above',
          label: 'Au-dessus',
        };
      case 'far_above':
        return {
          className: 'market-trends-badge far-above',
          label: 'Très au-dessus',
        };
      default:
        return {
          className: 'market-trends-badge',
          label: 'Indéterminé',
        };
    }
  };

  // Helper function to get risk level badge style and label
  const getRiskLevelStyle = (risk: RiskLevel): { className: string; label: string } => {
    switch (risk) {
      case 'low':
        return {
          className: 'market-trends-indicator risk-low',
          label: '✓ Risque faible',
        };
      case 'medium':
        return {
          className: 'market-trends-indicator risk-medium',
          label: '⚠ Risque modéré',
        };
      case 'high':
        return {
          className: 'market-trends-indicator risk-high',
          label: '⚠ Risque élevé',
        };
      default:
        return {
          className: 'market-trends-indicator',
          label: 'Risque inconnu',
        };
    }
  };

  // Helper function to get market demand badge style and label
  const getMarketDemandStyle = (demand: MarketDemand): { className: string; label: string } => {
    switch (demand) {
      case 'low':
        return {
          className: 'market-trends-indicator demand-low',
          label: 'Demande faible',
        };
      case 'medium':
        return {
          className: 'market-trends-indicator demand-medium',
          label: 'Demande moyenne',
        };
      case 'high':
        return {
          className: 'market-trends-indicator demand-high',
          label: 'Demande élevée',
        };
      case 'very_high':
        return {
          className: 'market-trends-indicator demand-very-high',
          label: 'Demande très élevée',
        };
      default:
        return {
          className: 'market-trends-indicator demand-low',
          label: 'Demande inconnue',
        };
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="market-trends-card">
        <div className="market-trends-loading">
          <div className="market-trends-spinner"></div>
          <div>
            <p className="market-trends-loading-text">Analyse des tendances marché en cours...</p>
            <p className="market-trends-loading-subtext">Cela peut prendre quelques secondes</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="market-trends-error">
        <div className="market-trends-error-content">
          <svg className="market-trends-error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="market-trends-error-title">Tendances marché temporairement indisponibles</h4>
            <p className="market-trends-error-text">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state (not loading, no error, no trends)
  if (!trends) {
    return (
      <div className="market-trends-empty">
        <svg className="market-trends-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="market-trends-empty-text">
          Cliquez sur "Ajouter tendances marché" pour comparer votre proposition avec les données actuelles du marché
        </p>
      </div>
    );
  }

  // Success state - Display trends data
  const employeePos = getPositioningStyle(trends.employeePositioning);
  const freelancePos = getPositioningStyle(trends.freelancePositioning);
  const riskStyle = getRiskLevelStyle(trends.riskLevel);
  const demandStyle = getMarketDemandStyle(trends.marketDemand);

  const hasSeniorityData = trends.salaryRangeByLevel || trends.freelanceRateRangeByLevel;

  return (
    <div className="market-trends-card">
      {/* Header */}
      <div className="market-trends-header">
        <div className="market-trends-title-row">
          <h3 className="market-trends-title">Tendances marché - Canada 🇨🇦</h3>
          <span className="market-trends-ai-badge">
            ✨ AI
          </span>
        </div>
        <p className="market-trends-subtitle">
          Analyse basée sur les données du marché canadien (CAD)
        </p>
      </div>

      <div className="market-trends-body">
        {/* Seniority-based ranges (new) */}
        {hasSeniorityData && (
          <div className="market-trends-seniority-section">
            <h4 className="market-trends-section-title">📊 Fourchettes par niveau de séniorité</h4>
            
            {/* Salary ranges by level */}
            {trends.salaryRangeByLevel && (
              <div className="market-trends-seniority-block">
                <p className="market-trends-seniority-label">Salaires annuels (employé)</p>
                <div className="market-trends-seniority-grid">
                  <div className="market-trends-seniority-item junior">
                    <span className="market-trends-seniority-level">Junior</span>
                    <span className="market-trends-seniority-value">
                      {trends.salaryRangeByLevel.junior.min.toLocaleString()} - {trends.salaryRangeByLevel.junior.max.toLocaleString()} CAD
                    </span>
                  </div>
                  <div className="market-trends-seniority-item intermediate">
                    <span className="market-trends-seniority-level">Intermédiaire</span>
                    <span className="market-trends-seniority-value">
                      {trends.salaryRangeByLevel.intermediate.min.toLocaleString()} - {trends.salaryRangeByLevel.intermediate.max.toLocaleString()} CAD
                    </span>
                  </div>
                  <div className="market-trends-seniority-item senior">
                    <span className="market-trends-seniority-level">Senior</span>
                    <span className="market-trends-seniority-value">
                      {trends.salaryRangeByLevel.senior.min.toLocaleString()} - {trends.salaryRangeByLevel.senior.max.toLocaleString()} CAD
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Freelance rates by level */}
            {trends.freelanceRateRangeByLevel && (
              <div className="market-trends-seniority-block">
                <p className="market-trends-seniority-label">Taux horaires (freelance)</p>
                <div className="market-trends-seniority-grid">
                  <div className="market-trends-seniority-item junior">
                    <span className="market-trends-seniority-level">Junior</span>
                    <span className="market-trends-seniority-value">
                      {trends.freelanceRateRangeByLevel.junior.min.toLocaleString()} - {trends.freelanceRateRangeByLevel.junior.max.toLocaleString()} CAD/h
                    </span>
                  </div>
                  <div className="market-trends-seniority-item intermediate">
                    <span className="market-trends-seniority-level">Intermédiaire</span>
                    <span className="market-trends-seniority-value">
                      {trends.freelanceRateRangeByLevel.intermediate.min.toLocaleString()} - {trends.freelanceRateRangeByLevel.intermediate.max.toLocaleString()} CAD/h
                    </span>
                  </div>
                  <div className="market-trends-seniority-item senior">
                    <span className="market-trends-seniority-level">Senior</span>
                    <span className="market-trends-seniority-value">
                      {trends.freelanceRateRangeByLevel.senior.min.toLocaleString()} - {trends.freelanceRateRangeByLevel.senior.max.toLocaleString()} CAD/h
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main content grid */}
        <div className="market-trends-grid">
          {/* Column 1: Employee / Salary data */}
          <div className="market-trends-range-block">
            <div className="market-trends-range-info employee">
              <p className="market-trends-range-label">
                Fourchette salariale (employé)
              </p>
              <p className="market-trends-range-value">
                {trends.salaryRange.min.toLocaleString()} – {trends.salaryRange.max.toLocaleString()} {trends.salaryRange.currency}
              </p>
              <p className="market-trends-range-note">par an</p>
            </div>

            <div className="market-trends-positioning">
              <p className="market-trends-positioning-label">Positionnement employé</p>
              <span className={employeePos.className}>
                {employeePos.label}
              </span>
            </div>
          </div>

          {/* Column 2: Freelance / Rate data */}
          <div className="market-trends-range-block">
            <div className="market-trends-range-info freelance">
              <p className="market-trends-range-label">
                Fourchette tarif freelance (marché)
              </p>
              <p className="market-trends-range-value">
                {trends.freelanceRateRange.min.toLocaleString()} – {trends.freelanceRateRange.max.toLocaleString()} {trends.freelanceRateRange.currency} / h
              </p>
              <p className="market-trends-range-note">tarif horaire</p>
            </div>

            <div className="market-trends-positioning">
              <p className="market-trends-positioning-label">Positionnement freelance</p>
              <span className={freelancePos.className}>
                {freelancePos.label}
              </span>
            </div>
          </div>
        </div>

        {/* Demand and Risk indicators */}
        <div className="market-trends-indicators">
          <span className={demandStyle.className}>
            📊 {demandStyle.label}
          </span>
          <span className={riskStyle.className}>
            {riskStyle.label}
          </span>
        </div>

        {/* Summary section */}
        <div className="market-trends-summary">
          <h4 className="market-trends-summary-title">Analyse du marché</h4>
          <p className="market-trends-summary-text">
            {trends.summary}
          </p>
        </div>

        {/* Recommendation section */}
        <div className="market-trends-recommendation">
          <div className="market-trends-recommendation-content">
            <svg className="market-trends-recommendation-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div>
              <h4 className="market-trends-recommendation-title">Recommandation</h4>
              <p className="market-trends-recommendation-text">
                {trends.recommendation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
