# Guide de test rapide - Page Calculette

## Statut de l'implémentation

✅ **TERMINÉ** - La page Calculette est entièrement implémentée et fonctionnelle avec des données mockées.

## Démarrage rapide

1. **Démarrer l'application**
   ```bash
   cd /Users/clauviskitieu/Documents/Projets/DPO/Apps/APG_Front
   npm run dev
   ```

2. **Accéder à la calculette**
   - URL: http://localhost:5173/calculette
   - Ou cliquer sur "Calculette" dans la barre de navigation

## Scénarios de test

### Test 1: Calcul pour un salarié

1. Sélectionner "Salarié" comme type de ressource
2. Saisir un salaire annuel: **75000**
3. Saisir un nombre d'heures: **160**
4. Sélectionner un client: **Banque Nationale**
5. Saisir un vendant proposé: **120**
6. Cliquer sur **"Calculer la marge"**

**Résultat attendu**: 
- Le calcul s'effectue
- Les KPIs s'affichent (coûtant moyen/h, vendant cible, marges)
- Une barre de progression colorée indique si la marge est atteinte
- Un message contextuel explique le résultat

### Test 2: Calcul pour un pigiste

1. Sélectionner "Pigiste" comme type de ressource
2. Saisir un tarif horaire: **85**
3. Saisir un nombre d'heures: **120**
4. Sélectionner un client: **Desjardins**
5. Saisir un vendant proposé: **130**
6. Cliquer sur **"Calculer la marge"**

**Résultat attendu**: 
- Le calcul utilise le tarif horaire directement comme coûtant
- Les résultats s'affichent avec une marge positive

### Test 3: Client personnalisé

1. Sélectionner un type de ressource
2. Saisir les valeurs
3. Sélectionner **"Autre client"** dans la liste des clients
4. Un nouveau champ apparaît: **"Nom du client"**
5. Saisir un nom personnalisé
6. Continuer avec le vendant et calculer

**Résultat attendu**: 
- Le champ "Nom du client" apparaît dynamiquement
- Le calcul s'effectue normalement

### Test 4: Sauvegarde d'un scénario

1. Effectuer un calcul (voir Test 1 ou 2)
2. Une fois les résultats affichés, cliquer sur **"Enregistrer ce scénario"**
3. Descendre dans la page

**Résultat attendu**: 
- Un message de succès apparaît (toast)
- Le scénario apparaît dans la section **"Historique des scénarios"**
- Le badge de marge est coloré selon le niveau (vert/orange/rouge)

### Test 5: Rechargement d'un scénario

1. Dans l'historique, cliquer sur l'icône de rechargement (↻)

**Résultat attendu**: 
- Le formulaire se remplit avec les données du scénario
- Les résultats s'affichent à nouveau

### Test 6: Suppression d'un scénario

1. Dans l'historique, cliquer sur l'icône de suppression (poubelle)
2. Confirmer la suppression

**Résultat attendu**: 
- Une confirmation est demandée
- Le scénario disparaît de l'historique

### Test 7: Configuration CFO (si vous avez le rôle CFO ou Admin)

1. Descendre jusqu'à la section **"Paramètres globaux (CFO uniquement)"**
2. Cliquer sur **"Modifier"**
3. Changer une valeur (ex: Charges patronales à **70**)
4. Cliquer sur **"Enregistrer"**

**Résultat attendu**: 
- Les champs deviennent éditables
- La sauvegarde fonctionne (message de succès)
- Les nouvelles valeurs sont prises en compte pour les futurs calculs

### Test 8: Configuration client CFO

1. Dans la section **"Paramètres par client"**
2. Cliquer sur l'icône d'édition (crayon) pour un client
3. Modifier la marge cible (ex: **28**)
4. Cliquer sur **"Enregistrer"**

**Résultat attendu**: 
- Un modal s'ouvre avec les paramètres du client
- La modification est sauvegardée
- Les nouveaux paramètres apparaissent dans le tableau

### Test 9: Validation des champs

1. Essayer de soumettre le formulaire avec des champs vides
2. Essayer avec un salaire négatif
3. Essayer avec 0 heures

**Résultat attendu**: 
- Des messages d'erreur apparaissent en rouge sous les champs
- Le bouton "Calculer" ne soumet pas le formulaire tant que les erreurs persistent

### Test 10: Bouton Réinitialiser

1. Remplir le formulaire avec des valeurs
2. Cliquer sur **"Réinitialiser"**

**Résultat attendu**: 
- Tous les champs reviennent à leur valeur par défaut
- Les erreurs sont effacées
- Les résultats disparaissent

## Vérification visuelle

### Éléments à vérifier

✅ La page est cohérente visuellement avec le reste de l'application (ResourcesPage)  
✅ Les cartes ont des ombres et des effets hover  
✅ Les couleurs des badges correspondent aux niveaux de marge:
   - 🟢 Vert: marge >= marge cible
   - 🟡 Orange: marge proche de la cible (écart < 5%)
   - 🔴 Rouge: marge insuffisante

✅ La barre de progression est animée et colorée  
✅ Les icônes Bootstrap Icons s'affichent correctement  
✅ Les tooltips (ℹ️) apparaissent au survol dans la section CFO  
✅ Les spinners de chargement apparaissent pendant les opérations  

### Responsive

Tester la page sur différentes tailles d'écran:
- 💻 Desktop (>1200px): Layout sur 2 colonnes possible
- 📱 Tablet (768-1200px): Layout adapté
- 📱 Mobile (<768px): Formulaire en pleine largeur, tableaux scrollables

## Messages de notification (Toasts)

Les toasts devraient apparaître pour:
- ✅ Calcul effectué avec succès
- ⚠️ Erreur de calcul
- ✅ Scénario enregistré
- ⚠️ Erreur de sauvegarde
- ✅ Scénario supprimé
- ✅ Configuration CFO mise à jour
- ℹ️ Scénario rechargé

## Données mockées actuelles

### Clients disponibles
1. Banque Nationale (marge cible: 25%, vendant cible: 120 $/h)
2. Desjardins (marge cible: 30%, vendant cible: 130 $/h)
3. Hydro-Québec (marge cible: 22%, vendant cible: 110 $/h)

### Paramètres globaux
- Charges patronales: **65%**
- Coûts indirects annuels: **5000 $**
- Heures facturables par an: **1600 h**

## Points d'attention

### Ce qui fonctionne (avec mock)
- ✅ Tous les calculs de marge
- ✅ Sauvegarde et historique des scénarios (en mémoire)
- ✅ Configuration CFO (en mémoire)
- ✅ Toutes les interactions UI
- ✅ Validation des formulaires

### Ce qui nécessite le backend
- ❌ Persistance des scénarios en base de données
- ❌ Persistance de la configuration CFO
- ❌ Liste des clients depuis la BDD
- ❌ Authentification et autorisation CFO réelle

## Prochaine étape: Intégration backend

Référez-vous au fichier `CALCULETTE_IMPLEMENTATION.md` pour:
1. Les endpoints Laravel à créer
2. Les migrations de base de données
3. Le service de calcul côté serveur
4. Les modifications à apporter dans `calculetteApi.ts`

## Problèmes connus

Aucun problème connu pour le moment. L'application compile et démarre sans erreur.

## Support

Pour toute question:
1. Consulter `CALCULETTE_IMPLEMENTATION.md` pour la documentation complète
2. Vérifier les commentaires dans le code source
3. Consulter les types dans `src/types/calculette.ts`

---

**Date de création**: 3 décembre 2024  
**Status**: ✅ Prêt pour les tests et l'intégration backend
