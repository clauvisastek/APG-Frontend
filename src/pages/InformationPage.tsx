import { useState } from 'react';
import './InformationPage.css';

export const InformationPage = () => {
  const [activeTab, setActiveTab] = useState<'functioning' | 'benefits' | 'users'>('functioning');

  return (
    <div className="information-page">
      <div className="information-container">
        {/* Page Header */}
        <div className="information-header">
          <h1 className="information-title">À propos d'Astek Profit Guard</h1>
          <p className="information-subtitle">
            Comprendre le rôle d'APG, son fonctionnement et les bénéfices pour les équipes Astek.
          </p>
        </div>

        {/* Intro Section */}
        <div className="info-card intro-card">
          <h2 className="card-title">Qu'est-ce qu'APG ?</h2>
          <p className="intro-text">
            Astek Profit Guard (APG) est un outil interne de calcul et de pilotage de la rentabilité 
            et des marges. Il aide à contrôler la performance financière des projets et des profils, 
            en supportant les décisions stratégiques des équipes ventes, delivery, finance et direction. 
            APG standardise les calculs, fluidifie les validations et aligne tous les acteurs autour 
            d'une vision commune de la rentabilité.
          </p>
        </div>

        {/* Tabs Section */}
        <div className="info-card tabs-card">
          <div className="tabs-header">
            <button
              className={`tab-button ${activeTab === 'functioning' ? 'active' : ''}`}
              onClick={() => setActiveTab('functioning')}
            >
              Fonctionnement
            </button>
            <button
              className={`tab-button ${activeTab === 'benefits' ? 'active' : ''}`}
              onClick={() => setActiveTab('benefits')}
            >
              Rôle et bénéfices
            </button>
            <button
              className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Pour qui ?
            </button>
          </div>

          <div className="tabs-content">
            {/* Tab 1: Fonctionnement */}
            {activeTab === 'functioning' && (
              <div className="tab-panel">
                <div className="tiles-grid">
                  <div className="info-tile">
                    <div className="tile-icon">📝</div>
                    <h3 className="tile-title">1. Créer un projet</h3>
                    <p className="tile-text">
                      Définissez le client, le type de contrat (T&M, Forfait, Régie), 
                      les marges cibles et minimales, ainsi que les dates de début et fin du projet.
                    </p>
                  </div>

                  <div className="info-tile">
                    <div className="tile-icon">👥</div>
                    <h3 className="tile-title">2. Ajouter les profils</h3>
                    <p className="tile-text">
                      Saisissez les profils de l'équipe : salaires, taux coûtants, taux vendants, 
                      et calculez automatiquement les marges individuelles et globales du projet.
                    </p>
                  </div>

                  <div className="info-tile">
                    <div className="tile-icon">✅</div>
                    <h3 className="tile-title">3. Lancer la validation</h3>
                    <p className="tile-text">
                      Soumettez le projet à validation selon le workflow défini : équipe ventes, 
                      direction et CFO examinent et approuvent ou demandent des ajustements.
                    </p>
                  </div>

                  <div className="info-tile">
                    <div className="tile-icon">📊</div>
                    <h3 className="tile-title">4. Suivre la rentabilité</h3>
                    <p className="tile-text">
                      Consultez le tableau de bord pour suivre la rentabilité en temps réel, 
                      recevoir des alertes sur les projets à risque et analyser l'historique.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Rôle et bénéfices */}
            {activeTab === 'benefits' && (
              <div className="tab-panel">
                <div className="tiles-grid">
                  <div className="info-tile">
                    <div className="tile-icon">🔒</div>
                    <h3 className="tile-title">Sécuriser la rentabilité</h3>
                    <p className="tile-text">
                      Validez chaque projet avant son lancement pour garantir que les marges 
                      cibles sont atteignables et éviter les mauvaises surprises financières.
                    </p>
                  </div>

                  <div className="info-tile">
                    <div className="tile-icon">📐</div>
                    <h3 className="tile-title">Standardiser les calculs</h3>
                    <p className="tile-text">
                      Utilisez une méthode unique et partagée pour calculer les coûts, les taux 
                      et les marges, éliminant les écarts entre services et fichiers Excel.
                    </p>
                  </div>

                  <div className="info-tile">
                    <div className="tile-icon">⚡</div>
                    <h3 className="tile-title">Fluidifier les validations</h3>
                    <p className="tile-text">
                      Accélérez le processus d'approbation grâce à un workflow digital clair, 
                      avec notifications et traçabilité complète des décisions.
                    </p>
                  </div>

                  <div className="info-tile">
                    <div className="tile-icon">🤝</div>
                    <h3 className="tile-title">Aligner ventes et finance</h3>
                    <p className="tile-text">
                      Créez une vision commune entre les équipes commerciales et financières 
                      pour prendre des décisions cohérentes et basées sur les mêmes données.
                    </p>
                  </div>

                  <div className="info-tile">
                    <div className="tile-icon">📈</div>
                    <h3 className="tile-title">Piloter le portefeuille</h3>
                    <p className="tile-text">
                      Suivez la performance globale de tous les projets en cours, identifiez 
                      les tendances et anticipez les risques pour optimiser la rentabilité.
                    </p>
                  </div>

                  <div className="info-tile">
                    <div className="tile-icon">🎯</div>
                    <h3 className="tile-title">Prendre de meilleures décisions</h3>
                    <p className="tile-text">
                      Appuyez-vous sur des données fiables et à jour pour négocier, arbitrer 
                      et ajuster votre stratégie commerciale et opérationnelle.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Pour qui ? */}
            {activeTab === 'users' && (
              <div className="tab-panel">
                <div className="user-cards-grid">
                  <div className="user-card">
                    <div className="user-card-icon">💼</div>
                    <h3 className="user-card-title">Équipe ventes</h3>
                    <ul className="user-card-list">
                      <li>Créer et simuler des offres avec des marges réalistes</li>
                      <li>Valider la faisabilité financière avant engagement client</li>
                      <li>Accéder rapidement aux historiques de projets similaires</li>
                    </ul>
                  </div>

                  <div className="user-card">
                    <div className="user-card-icon">👔</div>
                    <h3 className="user-card-title">Direction / CFO</h3>
                    <ul className="user-card-list">
                      <li>Valider les projets stratégiques et contrôler les risques</li>
                      <li>Visualiser la rentabilité globale du portefeuille</li>
                      <li>Prendre des décisions éclairées basées sur des KPIs fiables</li>
                    </ul>
                  </div>

                  <div className="user-card">
                    <div className="user-card-icon">🎯</div>
                    <h3 className="user-card-title">Chefs de projet</h3>
                    <ul className="user-card-list">
                      <li>Suivre la rentabilité de leurs projets en temps réel</li>
                      <li>Recevoir des alertes si les marges se dégradent</li>
                      <li>Ajuster les ressources pour maintenir la performance</li>
                    </ul>
                  </div>

                  <div className="user-card">
                    <div className="user-card-icon">💰</div>
                    <h3 className="user-card-title">Finance / contrôle de gestion</h3>
                    <ul className="user-card-list">
                      <li>Standardiser les méthodes de calcul des marges</li>
                      <li>Produire des reportings consolidés et cohérents</li>
                      <li>Analyser les écarts et identifier les leviers d'optimisation</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="info-card contact-card">
          <p className="contact-text">
            <strong>APG est un outil interne réservé aux équipes Astek.</strong> Pour toute question 
            ou suggestion d'évolution, contactez l'équipe produit.
          </p>
        </div>
      </div>
    </div>
  );
};
