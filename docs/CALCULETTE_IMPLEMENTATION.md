# Implémentation de la page Calculette

## Vue d'ensemble

La page **Calculette** a été entièrement implémentée dans l'application APG (Astek Profit Guard). Elle remplace le fichier Excel "Fiche de marge 2025" et permet aux vendeurs de calculer rapidement les marges par ressource (salarié ou pigiste).

## Fichiers créés

### Types TypeScript
- **`src/types/calculette.ts`** : Définit tous les types et interfaces nécessaires
  - `ResourceType`, `Seniorite`
  - `CalculetteFormData`, `CalculetteResults`
  - `CalculetteScenario`, `GlobalCostsConfig`, `ClientMarginConfig`, `CalculetteConfig`

### Services API
- **`src/services/calculetteApi.ts`** : Gère toutes les interactions avec le backend
  - `simulate()` : Calcule les marges
  - `getConfig()` : Récupère la configuration globale et par client
  - `updateGlobalCosts()` : Met à jour les paramètres globaux (CFO)
  - `updateClientConfig()` : Met à jour les paramètres par client (CFO)
  - `saveScenario()`, `getScenarios()`, `deleteScenario()` : Gestion des scénarios
  - **Note** : Actuellement avec données mockées, prêt pour intégration backend réelle

### Composants React
- **`src/components/CalculetteForm.tsx`** : Formulaire de saisie principal
  - Type de ressource (Salarié/Pigiste)
  - Salaire annuel ou tarif horaire
  - Nombre d'heures, séniorité
  - Sélection client
  - Vendant client proposé
  - Validation des champs

- **`src/components/CalculetteResults.tsx`** : Affichage des résultats
  - KPIs (coûtant, vendant cible, marges)
  - Barre de progression visuelle
  - Messages d'explication contextuels
  - Bouton de sauvegarde de scénario

- **`src/components/CfoConfigSection.tsx`** : Configuration CFO
  - Paramètres globaux (charges patronales, coûts indirects, heures facturables)
  - Configuration par client (marge cible, vendant cible)
  - Visible uniquement pour les utilisateurs CFO/Admin

- **`src/components/ScenarioHistory.tsx`** : Historique des calculs
  - Liste des scénarios enregistrés
  - Actions : recharger, supprimer
  - Badges colorés selon la marge

### Page principale
- **`src/pages/CalculettePage.tsx`** : Orchestration de tous les composants
  - Gestion de l'état global
  - Appels API
  - Contrôle d'accès CFO
  - Toasts de notification

### Styles
- **`src/pages/CalculettePage.css`** : Styles personnalisés
  - Cartes de statistiques avec effets hover
  - Barres de progression animées
  - Styles responsive
  - Cohérence visuelle avec le reste de l'app

### Routing
- **`src/App.tsx`** : Ajout de la route `/calculette`
- **`src/components/Layout.tsx`** : Ajout du lien de navigation "Calculette"

## Fonctionnalités implémentées

### Pour les vendeurs
✅ Calcul de marge pour salariés et pigistes  
✅ Sélection de client avec option "Autre client"  
✅ Affichage des résultats avec KPIs visuels  
✅ Indication de la marge cible vs marge obtenue  
✅ Messages contextuels (succès/avertissement/erreur)  
✅ Sauvegarde et historique des scénarios  
✅ Rechargement de scénarios précédents  

### Pour les CFO
✅ Configuration des paramètres globaux de coûts  
✅ Configuration des marges cibles par client  
✅ Interface intuitive avec modals  
✅ Contrôle d'accès basé sur les rôles  
✅ Tooltips explicatifs sur chaque paramètre  

## Intégration backend requise

### Endpoints Laravel à créer

```php
// Route group protégée par authentification
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Simulation de marge (accessible à tous)
    Route::post('/calculette/simulate', [CalculetteController::class, 'simulate']);
    
    // Récupération de la configuration (accessible à tous)
    Route::get('/calculette/config', [CalculetteController::class, 'getConfig']);
    
    // Scénarios (accessible à tous)
    Route::get('/calculette/scenarios', [CalculetteController::class, 'getScenarios']);
    Route::post('/calculette/scenarios', [CalculetteController::class, 'saveScenario']);
    Route::delete('/calculette/scenarios/{id}', [CalculetteController::class, 'deleteScenario']);
    
    // Configuration CFO (accessible uniquement CFO/Admin)
    Route::middleware(['role:CFO,Admin'])->group(function () {
        Route::put('/calculette/config/global-costs', [CalculetteController::class, 'updateGlobalCosts']);
        Route::put('/calculette/config/clients/{id}', [CalculetteController::class, 'updateClientConfig']);
    });
});
```

### Modèles de base de données suggérés

```php
// Migration: calculette_global_config
Schema::create('calculette_global_config', function (Blueprint $table) {
    $table->id();
    $table->decimal('charges_patronales', 5, 2); // Pourcentage
    $table->decimal('couts_indirects', 10, 2); // Montant annuel
    $table->integer('heures_facturables_par_an');
    $table->timestamps();
});

// Migration: calculette_client_config
Schema::create('calculette_client_config', function (Blueprint $table) {
    $table->id();
    $table->foreignId('client_id')->constrained()->onDelete('cascade');
    $table->decimal('marge_cible', 5, 2); // Pourcentage
    $table->decimal('vendant_cible_horaire', 8, 2)->nullable();
    $table->timestamps();
});

// Migration: calculette_scenarios
Schema::create('calculette_scenarios', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->enum('resource_type', ['SALARIE', 'PIGISTE']);
    $table->string('client_name');
    $table->decimal('salaire_or_tarif', 10, 2);
    $table->decimal('vendant_propose', 8, 2);
    $table->decimal('marge_obtenue', 5, 2);
    $table->json('form_data'); // Stocke toutes les données du formulaire
    $table->json('results'); // Stocke tous les résultats du calcul
    $table->timestamps();
});
```

### Service de calcul Laravel

```php
class MarginCalculatorService
{
    public function calculateMargin(array $data): array
    {
        $globalConfig = GlobalConfig::first();
        $clientConfig = ClientConfig::where('client_id', $data['client_id'])->first();
        
        // Calcul du coûtant horaire
        $coutantHoraire = $this->calculateCoutantHoraire(
            $data['resource_type'],
            $data['salaire_annuel'] ?? null,
            $data['tarif_horaire'] ?? null,
            $globalConfig
        );
        
        // Calcul de la marge
        $vendantPropose = $data['vendant_client_propose_horaire'];
        $heures = $data['heures'];
        
        $coutTotal = $coutantHoraire * $heures;
        $revenueTotal = $vendantPropose * $heures;
        
        $margeFinale = $revenueTotal > 0 
            ? (($revenueTotal - $coutTotal) / $revenueTotal) * 100 
            : 0;
        
        $margeParHeure = $vendantPropose - $coutantHoraire;
        $margeCible = $clientConfig->marge_cible ?? 25;
        $margeEcart = $margeFinale - $margeCible;
        
        return [
            'coutantMoyenHoraire' => $coutantHoraire,
            'vendantCibleHoraire' => $clientConfig->vendant_cible_horaire ?? 100,
            'margeCible' => $margeCible,
            'margeFinale' => $margeFinale,
            'margeParHeure' => $margeParHeure,
            'margeEcart' => $margeEcart,
        ];
    }
    
    private function calculateCoutantHoraire(
        string $resourceType,
        ?float $salaireAnnuel,
        ?float $tarifHoraire,
        GlobalConfig $config
    ): float {
        if ($resourceType === 'SALARIE' && $salaireAnnuel) {
            $chargesPatronales = $salaireAnnuel * ($config->charges_patronales / 100);
            $coutTotal = $salaireAnnuel + $chargesPatronales + $config->couts_indirects;
            return $coutTotal / $config->heures_facturables_par_an;
        }
        
        if ($resourceType === 'PIGISTE' && $tarifHoraire) {
            return $tarifHoraire;
        }
        
        throw new \Exception('Données de ressource invalides');
    }
}
```

## Prochaines étapes

### Priorité haute
1. **Créer les migrations Laravel** pour les tables de configuration et scénarios
2. **Implémenter le CalculetteController** avec toutes les méthodes
3. **Créer le MarginCalculatorService** avec la logique de calcul
4. **Implémenter les policies** pour restreindre l'accès CFO
5. **Remplacer les appels API mockés** dans `calculetteApi.ts` par de vrais appels

### Priorité moyenne
6. **Ajouter des tests backend** pour la logique de calcul
7. **Ajouter des tests frontend** (React Testing Library)
8. **Améliorer la validation** côté backend (Form Requests)
9. **Ajouter l'export PDF/Excel** des scénarios
10. **Intégrer avec les données clients réelles** de la BDD

### Améliorations futures
11. **Graphiques de tendances** des marges dans le temps
12. **Comparaison de scénarios** côte à côte
13. **Notifications** quand un vendant est trop bas
14. **Templates de calcul** pré-configurés
15. **Import/Export de configurations** CFO

## Remarques techniques

### Variables d'environnement
Le fichier `calculetteApi.ts` utilise `import.meta.env.VITE_API_URL`. Assurez-vous que cette variable est définie dans votre `.env` :

```env
VITE_API_URL=http://localhost:8000/api
```

### Permissions et rôles
Les sections CFO sont visibles uniquement pour les utilisateurs avec les rôles :
- `CFO`
- `Admin`

Ceci est géré via `getRolesArray(user)` qui lit les claims du token Auth0.

### Toasts
La page utilise `react-toastify` pour les notifications. Assurez-vous que le `ToastContainer` est bien présent dans votre `App.tsx` ou `main.tsx`.

## Test de la page

1. **Démarrer l'application** : `npm run dev`
2. **Se connecter** avec un utilisateur authentifié
3. **Naviguer vers** `/calculette` ou cliquer sur "Calculette" dans la navbar
4. **Tester le formulaire** :
   - Sélectionner "Salarié" et entrer un salaire
   - Sélectionner un client
   - Entrer un nombre d'heures et un vendant
   - Cliquer sur "Calculer la marge"
5. **Vérifier les résultats** affichés
6. **Enregistrer un scénario** et vérifier l'historique
7. **Se connecter en tant que CFO** pour tester la configuration

## Support et questions

Pour toute question sur l'implémentation ou l'intégration backend, référez-vous à ce document ou consultez les commentaires dans le code source.

---

**Développé pour APG (Astek Profit Guard)**  
Date : Décembre 2024
