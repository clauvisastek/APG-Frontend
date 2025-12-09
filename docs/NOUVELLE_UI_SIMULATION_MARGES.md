# Nouvelle UI des Résultats de Simulation de Marge

## 📋 Vue d'ensemble

Cette documentation décrit la nouvelle interface utilisateur pour l'affichage des résultats de simulation de marge dans l'application APG.

## 🎨 Nouveau Composant : `SimulationResultsSection`

### Emplacement
- Fichier : `/src/components/SimulationResultsSection.tsx`
- Transformer : `/src/utils/marginTransformers.ts`

### Caractéristiques principales

#### 1. **Layout Responsive**
- **Mobile** : 1 colonne empilée
- **Desktop** : 2 colonnes côte à côte
- Adaptation automatique avec Tailwind breakpoints (`lg:grid-cols-2`)

#### 2. **Structure à 2 cartes**

##### Carte 1 : Objectifs CFO – Résultats cibles
- **KPIs principaux** (grille 3 colonnes) :
  - Coûtant moyen / h (fond gris)
  - Vendant cible / h après remise (fond bleu)
  - Marge cible théorique en % (fond vert)

- **Détails en 2 colonnes** :
  - Paramètres client : vendant brut, remise, jours vacances
  - Paramètres globaux : charges patronales, coûts indirects, heures facturables

- **Badge de statut** :
  - ✓ Conforme (vert) si conforme
  - ⚠ Sous l'objectif (ambré) sinon

##### Carte 2 : Résultats avec vendant proposé
- **KPIs principaux** (grille 3 colonnes) :
  - Vendant proposé / h (fond gris)
  - Marge obtenue en % + €/h (fond violet)
  - Écart vs marge cible (dynamique : vert si positif, rouge si négatif)

- **Barres de progression comparatives** :
  - Marge cible théorique (barre verte)
  - Marge avec vendant proposé (barre verte si ≥ cible, ambré sinon)
  - Animation CSS : transition fluide

- **Détails en 2 colonnes** :
  - Impact de la remise
  - Prime supplémentaire

- **Badge de conclusion** :
  - ✔ Excellente marge (vert) : écart ≥ +5%
  - ✓ Marge conforme (ambré) : écart ≥ 0%
  - ⚠ Marge en-dessous (rouge) : écart < 0%

### 3. **Palette de couleurs Tailwind**

```tsx
// Backgrounds KPIs
bg-gray-50    // Valeurs neutres
bg-blue-50    // Vendant cible
bg-emerald-50 // Marges cibles
bg-purple-50  // Résultats proposés

// Textes
text-gray-900  // Valeurs principales
text-blue-700  // Labels vendant
text-emerald-700 // Labels marges
text-purple-700  // Labels proposés

// Badges
ring-1 ring-emerald-200 // Badges verts
ring-1 ring-amber-200   // Badges ambres
ring-1 ring-red-200     // Badges rouges
```

## 🔄 Transformation des Données

### Fonction : `transformMarginResponse()`

**Rôle** : Adapter la réponse de l'API backend (`MarginSimulationResponse`) vers la structure attendue par `SimulationResultsSection`.

#### Mapping des propriétés

| Backend (API)                        | Frontend (SimulationResult)          |
|--------------------------------------|--------------------------------------|
| `targetResults.costPerHour`          | `target.hourlyCost`                  |
| `targetResults.effectiveTargetBillRate` | `target.targetRateAfterDiscount`  |
| `targetResults.theoreticalMarginPercent` | `target.targetMarginPercent`     |
| `targetResults.configuredMinMarginPercent` | `target.minMarginPercent`       |
| `targetResults.configuredDiscountPercent` | `target.discountPercent`         |
| `targetResults.forcedVacationDaysPerYear` | `target.forcedVacationDays`      |
| `proposedResults.proposedBillRate`   | `proposal.rate`                      |
| `proposedResults.marginPercent`      | `proposal.marginPercent`             |
| `proposedResults.marginPerHour`      | `proposal.marginPerHour`             |

#### Calculs dérivés

```typescript
// Vendant cible avant remise (reconstitué)
targetRateBeforeDiscount = effectiveTargetBillRate / (1 - discount/100)

// Écart vs marge cible
diffVsTarget = proposalMargin% - targetMargin%

// Prime au-dessus du cible
premiumVsTargetPerHour = proposedRate - effectiveTargetRate
```

#### Formatage automatique
Tous les montants sont formatés avec `formatEuros(value)` → `"XX.XX €"`

## 🛠️ Intégration dans `CalculettePage`

### Imports ajoutés

```typescript
import { SimulationResultsSection } from '../components/SimulationResultsSection';
import { transformMarginResponse } from '../utils/marginTransformers';
```

### Remplacement de l'ancien affichage

**Avant** (ancienne UI commentée) :
```tsx
{results && (
  <CalculetteResultsDisplay
    results={results}
    onSaveScenario={handleSaveScenario}
    savingScenario={false}
  />
)}
```

**Après** (nouvelle UI) :
```tsx
{results && (
  <SimulationResultsSection 
    simulationResult={transformMarginResponse(results)} 
  />
)}
```

### Fonctions désactivées temporairement

Les fonctions suivantes ont été commentées car la nouvelle UI ne nécessite pas encore de sauvegarde de scénarios :

- `handleSaveScenario()` : Sauvegarde de scénario
- `currentFormData` state : Stockage des données du formulaire

Ces fonctions pourront être réactivées ultérieurement si nécessaire.

## 📊 Données non disponibles dans l'API actuelle

Certaines données affichées dans la nouvelle UI ne sont pas encore retournées par l'API backend. Le transformer utilise des valeurs par défaut :

```typescript
globals: {
  employerRate: 0,              // ❌ Pas dans l'API
  indirectCostsFormatted: '0 €', // ❌ Pas dans l'API
  billableHours: 0,              // ❌ Pas dans l'API
}
```

### Recommandation backend

Pour une expérience complète, ajouter au DTO `TargetResults` :

```csharp
public decimal EmployerChargesRate { get; set; }
public decimal IndirectCostsPerYear { get; set; }
public int BillableHoursPerYear { get; set; }
```

## 🎯 Avantages de la nouvelle UI

### ✅ Améliorations UX
- **Clarté visuelle** : Séparation nette entre objectifs et résultats réels
- **Comparaison immédiate** : Barres de progression côte à côte
- **Hiérarchie d'information** : KPIs en haut, détails en-dessous
- **Feedback visuel** : Badges de statut dynamiques avec couleurs intuitives

### ✅ Améliorations techniques
- **Types stricts** : Interfaces TypeScript complètes
- **Transformation centralisée** : Logique de mapping isolée dans `marginTransformers.ts`
- **Responsive natif** : Tailwind breakpoints pour mobile-first
- **Aucune dépendance externe** : Composant standalone

### ✅ Maintenabilité
- **Séparation des préoccupations** : Composant UI + Transformer + Types
- **Testabilité** : Fonctions pures (transformer) facilement testables
- **Documentation inline** : JSDoc sur toutes les interfaces

## 🚀 Prochaines étapes

### Phase 1 : Backend (Optionnel)
- [ ] Ajouter `employerChargesRate`, `indirectCostsPerYear`, `billableHoursPerYear` au DTO
- [ ] Mettre à jour `MarginSimulationService` pour retourner ces valeurs

### Phase 2 : Frontend
- [ ] Mettre à jour le transformer quand l'API sera enrichie
- [ ] Ajouter des tests unitaires pour `transformMarginResponse()`

### Phase 3 : Fonctionnalités (Si nécessaire)
- [ ] Réactiver la sauvegarde de scénarios
- [ ] Ajouter un bouton d'export PDF/Excel des résultats
- [ ] Implémenter un historique de comparaison de simulations

## 📝 Notes de migration

### Ancienne UI → Nouvelle UI

| Aspect | Ancienne UI | Nouvelle UI |
|--------|-------------|-------------|
| Composant | `CalculetteResultsDisplay` | `SimulationResultsSection` |
| Structure données | Direct `MarginSimulationResponse` | Transformé `SimulationResult` |
| Layout | Bloc unique | 2 cartes côte à côte |
| Sauvegarde scénario | Bouton intégré | Désactivé temporairement |
| Barres de progression | ❌ Absentes | ✅ Présentes |
| Statuts visuels | Badges simples | Badges + emojis + couleurs |

### Rollback possible

L'ancienne UI est toujours disponible (commentée) dans `CalculettePage.tsx`. Pour y revenir :

1. Décommenter l'ancien bloc :
   ```tsx
   {results && (
     <CalculetteResultsDisplay
       results={results}
       onSaveScenario={handleSaveScenario}
       savingScenario={false}
     />
   )}
   ```

2. Commenter le nouveau bloc :
   ```tsx
   {/* {results && (
     <SimulationResultsSection 
       simulationResult={transformMarginResponse(results)} 
     />
   )} */}
   ```

3. Réactiver `handleSaveScenario` et `currentFormData`

## 🐛 Tests recommandés

### Scénarios de test

1. **Marge excellente** : Vendant proposé avec +5% au-dessus de la cible
2. **Marge conforme** : Vendant proposé entre cible et cible+5%
3. **Marge insuffisante** : Vendant proposé en-dessous de la cible
4. **Sans remise** : Client avec `discountPercent = 0`
5. **Avec remise élevée** : Client avec `discountPercent = 20%`
6. **Responsive** : Tester sur mobile (375px), tablette (768px), desktop (1920px)

### Validation visuelle

- ✅ Alignement des KPIs dans les cartes
- ✅ Tailles de police lisibles
- ✅ Espacement cohérent (padding, margins)
- ✅ Couleurs accessibles (contraste WCAG AA)
- ✅ Barres de progression fluides (animation CSS)
- ✅ Badges bien positionnés

---

**Date de création** : 5 décembre 2025  
**Version** : 1.0  
**Auteur** : GitHub Copilot  
**Statut** : ✅ Implémenté et fonctionnel
