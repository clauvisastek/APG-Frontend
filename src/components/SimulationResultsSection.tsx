import React from 'react';

interface SimulationTarget {
  hourlyCost: number;
  hourlyCostFormatted: string;
  targetRateBeforeDiscount: number;
  targetRateBeforeDiscountFormatted: string;
  targetRateAfterDiscount: number;
  targetRateAfterDiscountFormatted: string;
  targetMarginPercent: number;
  minMarginPercent: number;
  discountPercent: number;
  forcedVacationDays: number;
  globals: {
    employerRate: number;
    indirectCostsFormatted: string;
    billableHours: number;
  };
  isWithinObjective: boolean;
}

interface SimulationProposal {
  rate: number;
  rateFormatted: string;
  marginPercent: number;
  marginPerHour: number;
  marginPerHourFormatted: string;
  diffVsTarget: number;
  discountDeltaPercent: number;
  premiumVsTargetPerHour: number;
  premiumVsTargetPerHourFormatted: string;
}

interface SimulationResult {
  target: SimulationTarget;
  proposal: SimulationProposal;
}

interface SimulationResultsSectionProps {
  simulationResult: SimulationResult | null | undefined;
}

export const SimulationResultsSection: React.FC<SimulationResultsSectionProps> = ({
  simulationResult,
}) => {
  // Ne rien afficher si pas de résultats
  if (!simulationResult) {
    return null;
  }

  const { target, proposal } = simulationResult;

  // Déterminer le statut de la proposition
  const getProposalStatus = () => {
    if (proposal.diffVsTarget >= 5) {
      return {
        label: '✔ Excellente marge',
        className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
      };
    } else if (proposal.diffVsTarget >= 0) {
      return {
        label: '✓ Marge conforme',
        className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
      };
    } else {
      return {
        label: '⚠ Marge en-dessous de l\'objectif',
        className: 'bg-red-50 text-red-700 ring-1 ring-red-200',
      };
    }
  };

  const proposalStatus = getProposalStatus();

  return (
    <section className="mt-8">
      {/* En-tête de section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Résultats de la simulation
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Analyse comparative des marges : objectifs CFO vs. vendant proposé
        </p>
      </div>

      {/* Layout à deux colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARTE 1 : Objectifs CFO – Résultats cibles */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 flex flex-col">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Objectifs CFO – Résultats cibles
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Basé sur les paramètres financiers configurés pour le client
            </p>
          </div>

          {/* Bloc KPIs principaux */}
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            {/* KPI 1 : Coûtant moyen */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 font-medium mb-1">
                Coûtant moyen / h
              </p>
              <p className="text-lg font-bold text-gray-900">
                {target.hourlyCostFormatted}
              </p>
            </div>

            {/* KPI 2 : Vendant cible après remise */}
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-700 font-medium mb-1">
                Vendant cible / h
              </p>
              <p className="text-xs text-blue-600 mb-0.5">(après remise)</p>
              <p className="text-lg font-bold text-blue-900">
                {target.targetRateAfterDiscountFormatted}
              </p>
            </div>

            {/* KPI 3 : Marge cible théorique */}
            <div className="bg-emerald-50 rounded-lg p-3">
              <p className="text-xs text-emerald-700 font-medium mb-1">
                Marge cible théorique
              </p>
              <p className="text-lg font-bold text-emerald-900">
                {target.targetMarginPercent.toFixed(2)} %
              </p>
            </div>
          </div>

          {/* Bloc détails en deux colonnes */}
          <div className="grid sm:grid-cols-2 gap-4 mb-4 border-t border-gray-100 pt-4">
            {/* Colonne 1 : Paramètres client */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Vendant cible brut</span>
                <span className="font-medium text-gray-900">
                  {target.targetRateBeforeDiscountFormatted}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Remise appliquée</span>
                <span className="font-medium text-gray-900">
                  {target.discountPercent.toFixed(2)} %
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Jours vacances forcées</span>
                <span className="font-medium text-gray-900">
                  {target.forcedVacationDays} j/an
                </span>
              </div>
            </div>

            {/* Colonne 2 : Paramètres globaux */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Charges patronales</span>
                <span className="font-medium text-gray-900">
                  {target.globals.employerRate.toFixed(2)} %
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Coûts indirects annuels</span>
                <span className="font-medium text-gray-900">
                  {target.globals.indirectCostsFormatted}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Heures facturables / an</span>
                <span className="font-medium text-gray-900">
                  {target.globals.billableHours} h
                </span>
              </div>
            </div>
          </div>

          {/* Footer : Badge de statut */}
          <div className="border-t border-gray-100 pt-4 mt-auto">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  target.isWithinObjective
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                }`}
              >
                {target.isWithinObjective
                  ? '✓ Conforme à l\'objectif'
                  : '⚠ Sous l\'objectif'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              (objectif minimal : {target.minMarginPercent.toFixed(2)} %)
            </p>
          </div>
        </div>

        {/* CARTE 2 : Résultats avec le vendant proposé */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 flex flex-col">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Résultats avec le vendant proposé
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Simulation réelle en fonction du vendant proposé au client
            </p>
          </div>

          {/* Bloc KPIs principaux */}
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            {/* KPI 1 : Vendant proposé */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 font-medium mb-1">
                Vendant proposé / h
              </p>
              <p className="text-lg font-bold text-gray-900">
                {proposal.rateFormatted}
              </p>
            </div>

            {/* KPI 2 : Marge obtenue */}
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-purple-700 font-medium mb-1">
                Marge obtenue
              </p>
              <p className="text-lg font-bold text-purple-900">
                {proposal.marginPercent.toFixed(2)} %
              </p>
              <p className="text-xs text-purple-600 mt-0.5">
                {proposal.marginPerHourFormatted} / h
              </p>
            </div>

            {/* KPI 3 : Écart vs marge cible */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 font-medium mb-1">
                Écart vs marge cible
              </p>
              <p
                className={`text-lg font-bold ${
                  proposal.diffVsTarget >= 0
                    ? 'text-emerald-700'
                    : 'text-red-700'
                }`}
              >
                {proposal.diffVsTarget >= 0 ? '+' : ''}
                {proposal.diffVsTarget.toFixed(2)} %
              </p>
            </div>
          </div>

          {/* Comparatif visuel : Barres de progression */}
          <div className="mb-4 border-t border-gray-100 pt-4">
            <p className="text-xs uppercase font-semibold text-gray-600 mb-3">
              Comparaison rapide
            </p>

            {/* Barre 1 : Marge cible théorique */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-700 mb-1">
                <span>Marge cible théorique</span>
                <span className="font-semibold">
                  {target.targetMarginPercent.toFixed(2)} %
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(target.targetMarginPercent, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Barre 2 : Marge avec vendant proposé */}
            <div>
              <div className="flex justify-between text-xs text-gray-700 mb-1">
                <span>Marge avec vendant proposé</span>
                <span className="font-semibold">
                  {proposal.marginPercent.toFixed(2)} %
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    proposal.marginPercent >= target.targetMarginPercent
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`}
                  style={{
                    width: `${Math.min(proposal.marginPercent, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bloc Remise & Prime */}
          <div className="grid sm:grid-cols-2 gap-4 mb-4 border-t border-gray-100 pt-4">
            {/* Colonne 1 : Impact de la remise */}
            <div className="space-y-2">
              <p className="text-xs uppercase font-semibold text-gray-600 mb-2">
                Impact de la remise
              </p>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Remise vs vendant cible</span>
                <span className="font-medium text-gray-900">
                  {proposal.discountDeltaPercent.toFixed(2)} %
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Vendant cible après remise</span>
                <span className="font-medium text-gray-900">
                  {target.targetRateAfterDiscountFormatted}
                </span>
              </div>
            </div>

            {/* Colonne 2 : Prime supplémentaire */}
            <div className="space-y-2">
              <p className="text-xs uppercase font-semibold text-gray-600 mb-2">
                Prime supplémentaire
              </p>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Prime au-dessus du cible</span>
                <span className="font-medium text-gray-900">
                  {proposal.premiumVsTargetPerHourFormatted} / h
                </span>
              </div>
            </div>
          </div>

          {/* Footer conclusion : Badge de statut */}
          <div className="border-t border-gray-100 pt-4 mt-auto">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${proposalStatus.className}`}
              >
                {proposalStatus.label}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {proposal.diffVsTarget >= 0
                ? 'Le vendant proposé permet d\'atteindre ou dépasser la marge cible configurée par le CFO.'
                : 'Le vendant proposé reste en-dessous de la marge cible configurée par le CFO.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
