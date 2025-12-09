# Guide de test - Fonctionnalités CFO

## 🚀 Démarrage rapide

### 1. Lancer le serveur de développement
```bash
cd /Users/clauviskitieu/Documents/Projets/DPO/Apps/APG_Front
npm run dev
```

Le serveur démarre sur `http://localhost:5173`

### 2. Se connecter avec un compte CFO
- Se connecter via Auth0
- S'assurer que l'utilisateur a le rôle `CFO` ou `Admin`

### 3. Accéder à la page Calculette
Naviguer vers: `http://localhost:5173/calculette`

---

## 📋 Scénarios de test

### Test 1: Vérification visibilité des sections CFO

**Objectif**: Vérifier que les sections CFO sont bien conditionnées par le rôle.

**Étapes**:
1. Se connecter avec un utilisateur **sans** rôle CFO
   - ✅ Le formulaire de simulation est visible
   - ✅ Les résultats s'affichent après calcul
   - ✅ L'historique des scénarios est visible
   - ❌ Le divider "🔐 Zone réservée CFO" n'est **pas** visible
   - ❌ Les 3 cards CFO ne sont **pas** visibles

2. Se connecter avec un utilisateur **avec** rôle CFO
   - ✅ Toutes les sections précédentes sont visibles
   - ✅ Le divider "🔐 Zone réservée CFO" est visible
   - ✅ Les 3 cards CFO sont visibles en dessous

---

### Test 2: Paramètres globaux salariés

**Objectif**: Tester l'édition des paramètres financiers globaux.

**Étapes**:
1. Dans la card "Paramètres globaux – Salariés":
   - ✅ Les valeurs actuelles s'affichent (65%, 5000$, 1600h par défaut)
   
2. Cliquer sur "✏️ Modifier":
   - ✅ Le mode édition s'active
   - ✅ Les 3 champs deviennent éditables
   - ✅ Les tooltips ℹ️ affichent de l'aide au survol

3. Modifier les valeurs:
   - Charges patronales: `68`
   - Coûts indirects: `5500`
   - Heures facturables: `1650`

4. Cliquer sur "💾 Enregistrer":
   - ✅ Spinner pendant la sauvegarde
   - ✅ Toast de succès: "Paramètres globaux enregistrés avec succès"
   - ✅ Le mode édition se désactive
   - ✅ Les nouvelles valeurs s'affichent

5. Cliquer sur "✖️ Annuler" (après modification):
   - ✅ Les valeurs reviennent à l'état initial
   - ✅ Le mode édition se désactive

**Vérification impact**:
6. Faire un nouveau calcul de simulation avec un salarié:
   - ✅ Le coûtant moyen horaire doit refléter les nouveaux paramètres
   - Formule: `(salaire + 68% charges + 5500) / 1650`

---

### Test 3: Paramètres par client

**Objectif**: Tester l'édition des configurations clients.

**Étapes**:
1. Dans la card "Paramètres par client":
   - ✅ Tableau avec 3 clients (Banque Nationale, Desjardins, Hydro-Québec)
   - ✅ Chaque ligne affiche: nom, marge cible (badge bleu), vendant cible

2. Cliquer sur "✏️ Modifier" pour "Banque Nationale":
   - ✅ Modal s'ouvre avec overlay semi-transparent
   - ✅ Titre: "Modifier la configuration client"
   - ✅ 2 champs pré-remplis:
     - Marge cible: `25`
     - Vendant cible: `120`

3. Modifier les valeurs:
   - Marge cible: `28`
   - Vendant cible: `125`

4. Cliquer sur "Enregistrer":
   - ✅ Spinner sur le bouton
   - ✅ Modal se ferme
   - ✅ Toast: "Configuration client mise à jour avec succès"
   - ✅ Le tableau affiche les nouvelles valeurs immédiatement

5. Cliquer sur "Annuler":
   - ✅ Modal se ferme sans sauvegarder

6. Cliquer sur l'overlay (en dehors du modal):
   - ✅ Modal se ferme

**Vérification impact**:
7. Faire une simulation avec "Banque Nationale" comme client:
   - ✅ La marge cible affichée doit être 28%
   - ✅ Le vendant cible doit être 125 $/h

---

### Test 4: Import Excel/CSV

**Objectif**: Tester l'upload et l'import de fichiers.

#### Partie A: Sélection de fichier

**Étapes**:
1. Dans la card "Import de données Excel/CSV":
   - ✅ Zone de drag & drop visible
   - ✅ Texte: "Glissez-déposez un fichier ici ou cliquez pour parcourir"
   - ✅ Formats acceptés: .xlsx, .xls, .csv

2. Cliquer sur la zone:
   - ✅ Sélecteur de fichier s'ouvre
   - ✅ Filtre sur les formats xlsx/xls/csv

3. Sélectionner un fichier valide:
   - ✅ Fichier s'affiche avec icône 📄
   - ✅ Nom du fichier visible
   - ✅ Taille du fichier affichée (ex: "2.3 KB")
   - ✅ Bouton "✖" pour supprimer

4. Cliquer sur "✖":
   - ✅ Fichier supprimé
   - ✅ Retour à l'état initial

#### Partie B: Drag & drop

**Étapes**:
1. Glisser un fichier .xlsx au-dessus de la zone:
   - ✅ Fond devient bleu clair
   - ✅ Bordure bleue

2. Déposer le fichier:
   - ✅ Fichier sélectionné comme dans le test précédent

3. Essayer de glisser un fichier .pdf:
   - ✅ Toast d'erreur: "Format de fichier non supporté..."

#### Partie C: Import

**Étapes**:
1. Sélectionner un fichier valide
2. Cliquer sur "📤 Lancer l'import":
   - ✅ Bouton devient "📤 Import en cours..."
   - ✅ Spinner visible (2 secondes - simulé)
   - ✅ Toast de succès: "XX lignes importées avec succès"
   - ✅ Fichier se réinitialise
   - ✅ Tableau des clients se rafraîchit automatiquement

3. Sélectionner un fichier nommé contenant "error":
   - ✅ Toast d'erreur avec détails
   - ✅ Fichier reste sélectionné pour correction

#### Partie D: Validation taille

**Étapes**:
1. Essayer d'uploader un fichier > 10 MB:
   - ✅ Toast: "Le fichier est trop volumineux (max 10 MB)"
   - ✅ Fichier non sélectionné

---

### Test 5: Documentation format import

**Objectif**: Vérifier la clarté de la documentation.

**Étapes**:
1. Scroller vers le bas de la card "Import":
   - ✅ Section "Format attendu du fichier" visible
   - ✅ Liste des colonnes requises:
     - client_id / ClientID
     - client_name / ClientName
     - marge_cible / MargeCible
     - vendant_cible / VendantCible (optionnel)
   - ✅ Note en bleu: comportement pour clients existants/nouveaux

---

### Test 6: Workflow complet CFO

**Objectif**: Tester le workflow réel d'un CFO.

**Scénario**:
Un CFO veut ajuster les marges suite à une nouvelle analyse financière.

**Étapes**:
1. **Mise à jour paramètres globaux**:
   - Augmenter charges patronales à 70% (nouvelles obligations)
   - Bouton "Enregistrer"
   - ✅ Confirmation

2. **Ajustement marge Desjardins**:
   - Cliquer "Modifier" sur ligne Desjardins
   - Marge cible: `32%` (négociation réussie)
   - Vendant cible: `135 $/h`
   - Bouton "Enregistrer"
   - ✅ Confirmation

3. **Import marges clients en masse**:
   - Préparer fichier Excel avec 10 clients mis à jour
   - Drag & drop du fichier
   - Bouton "Lancer l'import"
   - ✅ "10 lignes importées avec succès"

4. **Vérification**:
   - Faire une simulation avec Desjardins
   - ✅ Marge cible affichée: 32%
   - ✅ Vendant cible: 135 $/h
   - ✅ Calcul utilise charges 70%

---

## 🎨 Tests visuels

### Responsive design

**Desktop (> 768px)**:
- ✅ Formulaire paramètres globaux: 3 colonnes
- ✅ KPI cards résultats: 4 colonnes
- ✅ Tableau clients: colonnes bien espacées
- ✅ Modal centré, largeur 800px max

**Tablet (768px)**:
- ✅ Formulaire: 2 colonnes
- ✅ KPI cards: 2 colonnes
- ✅ Tableau: scroll horizontal

**Mobile (< 768px)**:
- ✅ Formulaire: 1 colonne
- ✅ KPI cards: 1 colonne empilées
- ✅ Boutons empilés verticalement
- ✅ Modal: 95% largeur écran

### Thème et couleurs

**Badges**:
- ✅ Badge primaire (type ressource): fond bleu clair, texte bleu foncé
- ✅ Badge success (marge > cible): fond vert clair, texte vert foncé
- ✅ Badge warning (marge proche): fond jaune clair, texte orange foncé
- ✅ Badge danger (marge < cible): fond rouge clair, texte rouge foncé

**Cards**:
- ✅ Fond blanc `#ffffff`
- ✅ Bordure grise `#e2e8f0`
- ✅ Ombre subtile au hover

**Buttons**:
- ✅ Primaire: bleu `#3b82f6`
- ✅ Secondaire: gris `#64748b`
- ✅ Success: vert `#22c55e`
- ✅ Danger: rouge `#ef4444`
- ✅ Effet hover: légère élévation

---

## 🐛 Tests d'erreur

### Réseau

**Simuler déconnexion**:
1. Ouvrir DevTools > Network
2. Throttling: Offline
3. Essayer de sauvegarder paramètres
   - ✅ Toast d'erreur
   - ✅ Formulaire reste éditable
   - ✅ Pas de perte de données saisies

### Permissions

**Simuler perte de rôle CFO**:
1. Se connecter en CFO
2. Dans console: `localStorage.clear()` (simule logout)
3. Recharger la page
   - ✅ Sections CFO disparaissent
   - ✅ Pas d'erreur JavaScript

### Validation

**Valeurs invalides**:
1. Paramètres globaux:
   - Charges patronales: `-5` → ❌ (min: 0)
   - Heures facturables: `0` → ❌ (min: 1)

2. Configuration client:
   - Marge cible: `150` → ❌ (max: 100)
   - Vendant cible: `abc` → ❌ (doit être numérique)

---

## 📊 Tests de données mock

**Par défaut, les mocks retournent**:

**Paramètres globaux**:
```json
{
  "chargesPatronales": 65,
  "coutsIndirects": 5000,
  "heuresFacturablesParAn": 1600
}
```

**Clients**:
- Banque Nationale: marge 25%, vendant 120 $/h
- Desjardins: marge 30%, vendant 130 $/h
- Hydro-Québec: marge 22%, vendant 110 $/h

**Import**:
- Fichiers sans "error" dans le nom: succès (nombre aléatoire 10-60 lignes)
- Fichiers avec "error": échec avec 2 erreurs simulées

---

## ✅ Checklist finale

Avant de valider l'implémentation:

**Fonctionnel**:
- [ ] Sections CFO visibles uniquement pour CFO/Admin
- [ ] Édition paramètres globaux fonctionne
- [ ] Édition paramètres clients avec modal
- [ ] Import fichier avec drag & drop
- [ ] Toasts de confirmation/erreur
- [ ] Rechargement données après modifications
- [ ] Calculs utilisent paramètres mis à jour

**UX/UI**:
- [ ] Design cohérent avec APG (astek-* classes)
- [ ] Responsive mobile/tablet/desktop
- [ ] Animations fluides
- [ ] Loading states clairs
- [ ] Tooltips d'aide présents
- [ ] Messages d'erreur explicites

**Technique**:
- [ ] 0 erreur TypeScript
- [ ] 0 warning ESLint
- [ ] Console propre (pas d'erreurs JS)
- [ ] Performance acceptable (< 2s par action)

**Sécurité**:
- [ ] Contrôle rôle frontend
- [ ] Backend devra vérifier permissions
- [ ] Validation fichiers upload
- [ ] Pas de données sensibles en console

---

## 🔧 Troubleshooting

### Les sections CFO ne s'affichent pas

**Solutions**:
1. Vérifier dans DevTools console:
   ```javascript
   // Devrait afficher true pour un CFO
   console.log(userRoles.includes('CFO') || userRoles.includes('Admin'))
   ```

2. Vérifier Auth0 roles dans le token JWT

3. Vérifier `getRolesArray()` dans `utils/roleHelpers.ts`

### Modal ne se ferme pas

**Solutions**:
1. Vérifier `onClick` sur overlay avec `stopPropagation()` sur modal
2. Vérifier état `showModal` / `editingClientId`

### Import ne fonctionne pas

**Solutions**:
1. Vérifier format fichier (extension)
2. Vérifier taille < 10 MB
3. Regarder console pour erreurs détaillées
4. Tester avec fichier minimal (2-3 lignes)

### Données ne se rafraîchissent pas

**Solutions**:
1. Vérifier `loadInitialData()` est appelée après import
2. Vérifier `onSuccess` / `onRefresh` callbacks
3. Vérifier setState dans handlers

---

## 📞 Support

En cas de problème:
1. Consulter la documentation: `CFO_FEATURES_IMPLEMENTATION.md`
2. Consulter les endpoints API: `API_ENDPOINTS_CFO.md`
3. Vérifier les types TypeScript: `src/types/calculette.ts`
4. Examiner les mocks: `src/services/calculetteApi.ts`
