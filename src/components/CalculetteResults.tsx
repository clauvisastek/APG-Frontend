import type { MarginSimulationResponse } from '../types';
import type { MarketTrendsResponse } from '../types/marketTrends';
import { MarketTrendsCard } from './MarketTrendsCard';
import './CalculetteResults.css';

interface CalculetteResultsProps {
  results: MarginSimulationResponse | null;
  onSaveScenario?: () => void;
  savingScenario?: boolean;
  onFetchMarketTrends?: () => void;
  marketTrends?: MarketTrendsResponse | null;
  isLoadingMarketTrends?: boolean;
  marketTrendsError?: string | null;
}

// Fonctions utilitaires de formatage
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

function formatSignedPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatPercent(value)}`;
}

export const CalculetteResultsDisplay: React.FC<CalculetteResultsProps> = ({
  results,
  onSaveScenario,
  savingScenario = false,
  onFetchMarketTrends,
  marketTrends,
  isLoadingMarketTrends = false,
  marketTrendsError,
}) => {
  if (!results) {
    return null;
  }

  const { targetResults, proposedResults } = results;

  // Structure des données CFO (objectifs)
  const cfo = {
    hourlyCost: targetResults.costPerHour,
    targetBillRateNet: targetResults.effectiveTargetBillRate,
    targetBillRateGross:
      targetResults.configuredDiscountPercent && targetResults.configuredDiscountPercent > 0
        ? targetResults.effectiveTargetBillRate / (1 - targetResults.configuredDiscountPercent / 100)
        : targetResults.effectiveTargetBillRate,
    targetMarginPercent: targetResults.theoreticalMarginPercent,
    minRequiredMarginPercent: targetResults.configuredMinMarginPercent,
    discountPercent: targetResults.configuredDiscountPercent ?? 0,
    vacationDaysPerYear: targetResults.forcedVacationDaysPerYear,
    employerChargesRate: 0, // Non disponible dans l'API actuelle
    indirectAnnualCosts: 0, // Non disponible dans l'API actuelle
    billableHoursPerYear: 0, // Non disponible dans l'API actuelle
  };

  // Structure des données proposées
  const proposed = {
    proposedBillRate: proposedResults.proposedBillRate,
    obtainedMarginPercent: proposedResults.marginPercent,
    obtainedMarginPerHour: proposedResults.marginPerHour,
    deltaVsTargetPercent: proposedResults.marginPercent - targetResults.theoreticalMarginPercent,
    discountImpactPercent: proposedResults.discountPercentApplied ?? 0,
    netBillRateAfterDisc:
      proposedResults.discountPercentApplied
        ? proposedResults.proposedBillRate * (1 - proposedResults.discountPercentApplied / 100)
        : proposedResults.proposedBillRate,
    premiumPerHour: proposedResults.proposedBillRate - targetResults.effectiveTargetBillRate,
  };

  // Message qualitatif
  let qualitativeMessage = 'Marge insuffisante';
  if (proposedResults.status === 'OK') {
    qualitativeMessage = proposed.deltaVsTargetPercent >= 5 ? '✓ Excellente marge' : '✓ Marge acceptable';
  } else if (proposedResults.status === 'WARNING') {
    qualitativeMessage = '⚠ Marge à surveiller';
  } else {
    qualitativeMessage = '✗ Marge insuffisante';
  }

  const proposedWithMessage = { ...proposed, qualitativeMessage };

  return (
    <section className="calc-results-section" aria-labelledby="results-title">
      <header className="calc-results-header">
        <div>
          <h2 id="results-title" className="calc-results-title">
            Résultats de la simulation
          </h2>
          <p className="calc-results-subtitle">
            Analyse comparative des marges : objectifs CFO vs vendant proposé au client.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {onFetchMarketTrends && (
            <button
              onClick={onFetchMarketTrends}
              disabled={isLoadingMarketTrends}
              className="calc-save-btn"
              style={{
                backgroundColor: '#6366f1',
                borderColor: '#6366f1',
              }}
            >
              {isLoadingMarketTrends ? (
                <>
                  <svg className="calc-spinner" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Analyse en cours...
                </>
              ) : (
                <>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Ajouter tendances marché
                </>
              )}
            </button>
          )}
          {onSaveScenario && (
            <button
              onClick={onSaveScenario}
              disabled={savingScenario}
              className="calc-save-btn"
            >
              {savingScenario ? (
                <>
                  <svg className="calc-spinner" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Enregistrement...
                </>
              ) : (
                <>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Enregistrer ce scénario
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* GRILLE DES DEUX BLOCS PRINCIPAUX */}
      <div className="calc-results-grid">
        {/* Bloc 1 : Objectifs CFO – Résultats cibles */}
        <article className="calc-card">
          <div className="calc-card-header">
            <h3 className="calc-card-title">Objectifs CFO – Résultats cibles</h3>
            <p className="calc-card-desc">
              Basé sur les paramètres financiers configurés pour ce client.
            </p>
          </div>

          {/* Cartes KPI CFO */}
          <div className="calc-card-body">
            <div className="calc-kpi-grid">
              {/* Coûtant moyen / h */}
              <div className="calc-kpi-card">
                <p className="calc-kpi-label">Coûtant moyen / h</p>
                <p className="calc-kpi-value">{formatCurrency(cfo.hourlyCost)}</p>
                <p className="calc-kpi-note">Base de calcul</p>
              </div>

              {/* Vendant cible net / h */}
              <div className="calc-kpi-card">
                <p className="calc-kpi-label">Vendant cible / h</p>
                <p className="calc-kpi-value sky-text">{formatCurrency(cfo.targetBillRateNet)}</p>
                <p className="calc-kpi-note">Après remise de {formatPercent(cfo.discountPercent)}</p>
              </div>

              {/* Marge cible théorique */}
              <div className="calc-kpi-card">
                <p className="calc-kpi-label">Marge cible théorique</p>
                <p className="calc-kpi-value violet-text">{formatPercent(cfo.targetMarginPercent)}</p>
                <p className="calc-kpi-note">
                  Objectif CFO (min. {formatPercent(cfo.minRequiredMarginPercent)})
                </p>
              </div>

              {/* Vacances + charges */}
              <div className="calc-kpi-card">
                <p className="calc-kpi-label">Paramètres RH & charges</p>
                <p className="calc-kpi-value" style={{ fontSize: '14px' }}>
                  {cfo.vacationDaysPerYear} j/an
                  {cfo.employerChargesRate > 0 && ` • ${formatPercent(cfo.employerChargesRate)} charges`}
                </p>
                <p className="calc-kpi-note">
                  {cfo.indirectAnnualCosts > 0
                    ? `${formatCurrency(cfo.indirectAnnualCosts)} de coûts indirects`
                    : 'Coûts indirects non disponibles'}
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Bloc 2 : Résultats avec le vendant proposé */}
        <article className="calc-card">
          <div className="calc-card-header">
            <h3 className="calc-card-title">Résultats avec le vendant proposé</h3>
            <p className="calc-card-desc">
              Simulation réelle en fonction du vendant proposé au client.
            </p>
          </div>

          {/* Cartes KPI vendant proposé */}
          <div className="calc-card-body">
            <div className="calc-kpi-grid">
              {/* Vendant proposé / h */}
              <div className="calc-kpi-card emerald-bg">
                <p className="calc-kpi-label">Vendant proposé / h</p>
                <p className="calc-kpi-value emerald-text">
                  {formatCurrency(proposed.proposedBillRate)}
                </p>
                <p className="calc-kpi-note">Montant proposé au client</p>
              </div>

              {/* Marge obtenue */}
              <div className="calc-kpi-card emerald-bg">
                <p className="calc-kpi-label">Marge obtenue</p>
                <p className="calc-kpi-value emerald-text">
                  {formatPercent(proposed.obtainedMarginPercent)}
                </p>
                <p className="calc-kpi-note">
                  Soit {formatCurrency(proposed.obtainedMarginPerHour)} / h
                </p>
              </div>

              {/* Écart vs marge cible */}
              <div className="calc-kpi-card emerald-bg">
                <p className="calc-kpi-label">Écart vs marge cible</p>
                <p
                  className={`calc-kpi-value ${
                    proposed.deltaVsTargetPercent >= 0 ? 'emerald-text' : 'rose-text'
                  }`}
                >
                  {formatSignedPercent(proposed.deltaVsTargetPercent)}
                </p>
                <p className="calc-kpi-note">Par rapport à la cible CFO</p>
              </div>

              {/* Impact de la remise */}
              <div className="calc-kpi-card emerald-bg">
                <p className="calc-kpi-label">Impact de la remise</p>
                <p className="calc-kpi-value">
                  {formatSignedPercent(proposed.discountImpactPercent)}
                </p>
                <p className="calc-kpi-note">
                  Vendant net : {formatCurrency(proposed.netBillRateAfterDisc)} / h
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* ZONE DE COMPARAISON VISUELLE */}
      <div className="calc-comparison-card">
        <div className="calc-comparison-header">
          <div>
            <p className="calc-comparison-title">Marge finale obtenue</p>
            <p className="calc-comparison-desc">
              Comparaison visuelle entre la marge cible du CFO et la marge obtenue avec le vendant proposé.
            </p>
          </div>
          {/* Badge résumé */}
          <div
            className={`calc-quality-badge ${
              proposed.obtainedMarginPercent >= cfo.targetMarginPercent
                ? 'excellent'
                : proposed.obtainedMarginPercent >= cfo.minRequiredMarginPercent
                ? 'warning'
                : 'danger'
            }`}
          >
            {proposedWithMessage.qualitativeMessage}
          </div>
        </div>

        {/* Barre de progression 0–100 % */}
        <div className="calc-progress-container">
          <div className="calc-progress-bar">
            {/* Remplissage = marge obtenue */}
            <div
              className={`calc-progress-fill ${
                proposed.obtainedMarginPercent >= cfo.targetMarginPercent
                  ? 'excellent'
                  : proposed.obtainedMarginPercent >= cfo.minRequiredMarginPercent
                  ? 'warning'
                  : 'danger'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, proposed.obtainedMarginPercent))}%` }}
            />

            {/* Marqueur cible CFO */}
            <div
              className="calc-progress-marker"
              style={{ left: `${Math.max(0, Math.min(100, cfo.targetMarginPercent))}%` }}
            />
          </div>

          {/* Légende sous la barre */}
          <div className="calc-progress-legend">
            <span>0 %</span>
            <span>
              Cible CFO : <strong>{formatPercent(cfo.targetMarginPercent)}</strong>
            </span>
            <span>
              Résultat : <strong>{formatPercent(proposed.obtainedMarginPercent)}</strong>
            </span>
            <span>100 %</span>
          </div>
        </div>

        {/* Récap chiffré en bas */}
        <div className="calc-recap-grid">
          <div className="calc-recap-item">
            <p className="calc-recap-label">Coûtant moyen horaire</p>
            <p className="calc-recap-value">{formatCurrency(cfo.hourlyCost)}</p>
          </div>
          <div className="calc-recap-item">
            <p className="calc-recap-label">Vendant cible net</p>
            <p className="calc-recap-value">{formatCurrency(cfo.targetBillRateNet)}</p>
          </div>
          <div className="calc-recap-item">
            <p className="calc-recap-label">Écart vs cible</p>
            <p
              className={`calc-recap-value ${
                proposed.deltaVsTargetPercent >= 0 ? 'emerald-text' : 'rose-text'
              }`}
            >
              {formatSignedPercent(proposed.deltaVsTargetPercent)}
            </p>
          </div>
          <div className="calc-recap-item">
            <p className="calc-recap-label">Marge finale / h</p>
            <p className="calc-recap-value">{formatCurrency(proposed.obtainedMarginPerHour)}</p>
          </div>
        </div>
      </div>

      {/* Market Trends Card */}
      {onFetchMarketTrends && (
        <MarketTrendsCard
          trends={marketTrends || null}
          isLoading={isLoadingMarketTrends}
          error={marketTrendsError || null}
        />
      )}
    </section>
  );
};
