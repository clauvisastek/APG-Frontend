# Guide de Test - Nouvelle UI Simulation Marges

## 🧪 Scénarios de test manuels

### Prérequis
1. Backend démarré : `docker compose up -d`
2. Frontend démarré : `npm run dev` (dans APG_Front)
3. Client configuré dans la base avec paramètres financiers complets

---

## Scénario 1 : Marge excellente (Badge vert ✔)

### Configuration client recommandée
```
Marge cible : 25%
Marge minimale : 15%
Remise : 10%
Jours vacances forcées : 5
Vendant cible : 500 €/j
```

### Formulaire calculette
```
Type ressource : Salarié
Salaire annuel brut : 45000 €
Client : [Choisir le client configuré]
Vendant proposé : 650 €/j  ← 30% au-dessus du coûtant
Heures planifiées : 1500 h
Séniorité : Confirmé
```

### Résultat attendu
- **Carte 1 (Objectifs CFO)** :
  - Coûtant : ~40 €/h
  - Vendant cible après remise : ~56 €/h (500 × 0.9 / 7.5)
  - Marge cible théorique : ~25%
  - Badge : ✓ Conforme (vert)

- **Carte 2 (Vendant proposé)** :
  - Vendant proposé : ~81 €/h (650 / 7.5)
  - Marge obtenue : ~50%
  - Écart vs cible : **+25%** (vert)
  - Badge : **✔ Excellente marge** (vert)

---

## Scénario 2 : Marge conforme (Badge ambré ✓)

### Configuration client recommandée
```
Marge cible : 30%
Marge minimale : 20%
Remise : 5%
Jours vacances forcées : 10
Vendant cible : 550 €/j
```

### Formulaire calculette
```
Type ressource : Salarié
Salaire annuel brut : 50000 €
Client : [Choisir le client configuré]
Vendant proposé : 550 €/j  ← Juste au niveau de la cible
Heures planifiées : 1600 h
Séniorité : Senior
```

### Résultat attendu
- **Carte 1** :
  - Coûtant : ~45 €/h
  - Vendant cible après remise : ~69 €/h (550 × 0.95 / 7.5)
  - Marge cible : ~30%
  - Badge : ✓ Conforme

- **Carte 2** :
  - Vendant proposé : ~73 €/h (550 / 7.5)
  - Marge obtenue : ~31%
  - Écart vs cible : **+1%** (vert léger)
  - Badge : **✓ Marge conforme** (ambré)

---

## Scénario 3 : Marge insuffisante (Badge rouge ⚠)

### Configuration client recommandée
```
Marge cible : 35%
Marge minimale : 25%
Remise : 15%
Jours vacances forcées : 5
Vendant cible : 600 €/j
```

### Formulaire calculette
```
Type ressource : Salarié
Salaire annuel brut : 60000 €
Client : [Choisir le client configuré]
Vendant proposé : 450 €/j  ← En-dessous de la cible
Heures planifiées : 1400 h
Séniorité : Expert
```

### Résultat attendu
- **Carte 1** :
  - Coûtant : ~55 €/h
  - Vendant cible après remise : ~68 €/h (600 × 0.85 / 7.5)
  - Marge cible : ~35%
  - Badge : ⚠ Sous l'objectif

- **Carte 2** :
  - Vendant proposé : ~60 €/h (450 / 7.5)
  - Marge obtenue : ~8%
  - Écart vs cible : **-27%** (rouge)
  - Badge : **⚠ Marge en-dessous de l'objectif** (rouge)

---

## Scénario 4 : Pigiste (Coûtant = Vendant proposé)

### Configuration client recommandée
```
Marge cible : 20%
Marge minimale : 10%
Remise : 0%
Jours vacances forcées : 0
Vendant cible : 500 €/j
```

### Formulaire calculette
```
Type ressource : Pigiste  ← Important !
Salaire annuel brut : [Non applicable - laissez vide]
Client : [Choisir le client configuré]
Vendant proposé : 550 €/j
Heures planifiées : 1000 h
Séniorité : [Optionnel]
```

### Résultat attendu
- **Carte 1** :
  - Coûtant : ~73 €/h (= 550 / 7.5, car pigiste coûtant = vendant proposé)
  - Vendant cible après remise : ~67 €/h (500 / 7.5)
  - Marge cible : ~20%
  - Badge : ⚠ Sous l'objectif

- **Carte 2** :
  - Vendant proposé : ~73 €/h
  - Marge obtenue : ~0% (car coûtant = vendant pour pigiste)
  - Écart vs cible : **-20%** (rouge)
  - Badge : **⚠ Marge en-dessous de l'objectif**

---

## Scénario 5 : Sans remise (Discount = 0%)

### Configuration client recommandée
```
Marge cible : 28%
Marge minimale : 18%
Remise : 0%  ← Pas de remise
Jours vacances forcées : 5
Vendant cible : 520 €/j
```

### Formulaire calculette
```
Type ressource : Salarié
Salaire annuel brut : 48000 €
Client : [Choisir le client configuré]
Vendant proposé : 580 €/j
Heures planifiées : 1550 h
Séniorité : Confirmé
```

### Résultat attendu
- **Carte 1** :
  - Vendant cible brut : 520 €/j
  - Vendant cible après remise : **520 €/j** (identique, pas de remise)
  - Remise appliquée : **0.00 %**

- **Carte 2** :
  - Remise vs vendant cible : **0.00 %**
  - Badge : Selon l'écart de marge (vert/ambré/rouge)

---

## 📱 Tests Responsive

### Mobile (375px - iPhone SE)
1. Ouvrir DevTools → Mode responsive → 375 × 667
2. Vérifier que :
   - ✅ Les 2 cartes sont empilées (1 colonne)
   - ✅ Les KPIs passent en 1 colonne sur très petit écran
   - ✅ Les textes restent lisibles (police ≥ 12px)
   - ✅ Les barres de progression occupent toute la largeur
   - ✅ Aucun débordement horizontal

### Tablette (768px - iPad)
1. Mode responsive → 768 × 1024
2. Vérifier que :
   - ✅ Les 2 cartes restent côte à côte (2 colonnes)
   - ✅ Les KPIs s'affichent en grille 3 colonnes
   - ✅ L'espacement est équilibré

### Desktop (1920px)
1. Plein écran
2. Vérifier que :
   - ✅ Les cartes ont une largeur maximale raisonnable
   - ✅ Le contenu reste centré
   - ✅ Aucun étirement excessif des éléments

---

## 🎨 Tests Visuels

### Couleurs et contrastes
- [ ] Textes noirs (#111827) sur fonds clairs lisibles
- [ ] Badges avec bords (`ring-1`) visibles
- [ ] Barres de progression avec couleurs distinctives :
  - Vert (`bg-emerald-500`) pour marge cible
  - Vert ou ambré selon résultat pour marge proposée

### Animation
- [ ] Barres de progression animées au chargement (`transition-all`)
- [ ] Pas de lag ou saccades

### Typographie
- [ ] Titres (`text-lg`, `font-semibold`) bien hiérarchisés
- [ ] Labels (`text-xs`, `uppercase`) distincts des valeurs
- [ ] Montants (`font-bold`) mis en évidence

---

## 🐛 Cas limites à tester

### Valeurs extrêmes
1. **Coûtant très élevé** : Salaire brut 150 000 € → Vérifier affichage
2. **Vendant très bas** : 200 €/j → Marge négative attendue
3. **Remise 100%** : Vendant cible après remise = 0 → Comportement ?
4. **Jours vacances = 50** : Heures facturables réduites drastiquement

### Données manquantes (Backend non enrichi)
- [ ] Vérifier que `employerRate: 0` s'affiche comme "0.00 %"
- [ ] Vérifier que `indirectCosts: 0 €` s'affiche proprement
- [ ] Vérifier que `billableHours: 0` ne casse rien

### Navigation
- [ ] Calculer → Résultats s'affichent
- [ ] Recalculer → Anciens résultats remplacés
- [ ] Rafraîchir la page → Résultats disparaissent (normal, pas de persistance)

---

## ✅ Checklist de validation finale

### Fonctionnel
- [ ] Tous les KPIs affichent des valeurs cohérentes
- [ ] Badges de statut changent correctement selon les seuils
- [ ] Barres de progression reflètent les marges calculées
- [ ] Écart vs cible calculé correctement (proposal - target)
- [ ] Vendant cible avant remise reconstitué (avec formule inverse)

### Visuel
- [ ] Layout responsive sur mobile/tablette/desktop
- [ ] Couleurs accessibles (contraste suffisant)
- [ ] Alignements et espacements propres
- [ ] Pas de texte tronqué ou débordant

### Technique
- [ ] Aucune erreur TypeScript dans la console
- [ ] Aucune erreur JavaScript dans la console
- [ ] Pas de warning React (keys, deps, etc.)
- [ ] Performance fluide (pas de re-render inutiles)

---

## 📊 Exemple de résultat attendu (Screenshot verbal)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                     Résultats de la simulation                             │
│   Analyse comparative des marges : objectifs CFO vs. vendant proposé      │
└────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────┬─────────────────────────────────────┐
│  Objectifs CFO – Résultats cibles   │ Résultats avec vendant proposé      │
│  Basé sur les paramètres financiers │ Simulation réelle en fonction du    │
│  configurés pour le client          │ vendant proposé au client           │
├─────────────────────────────────────┼─────────────────────────────────────┤
│ ┌─────────┬─────────┬─────────┐     │ ┌─────────┬─────────┬─────────┐     │
│ │Coûtant  │Vendant  │Marge    │     │ │Vendant  │Marge    │Écart vs │     │
│ │moyen/h  │cible/h  │cible    │     │ │proposé/h│obtenue  │cible    │     │
│ │40.00 €  │56.25 €  │25.00 %  │     │ │81.25 €  │50.00 %  │+25.00 % │     │
│ └─────────┴─────────┴─────────┘     │ └─────────┴─────────┴─────────┘     │
│                                     │                                     │
│ Vendant cible brut : 500.00 €       │ ██████████████████ 50.00%           │
│ Remise appliquée : 10.00 %          │ █████████ 25.00% (cible)            │
│ Jours vacances : 5 j/an             │                                     │
│ Charges patronales : 0.00 %         │ Remise vs cible : 10.00 %           │
│ Coûts indirects : 0 €               │ Prime au-dessus : +25.00 € / h      │
│                                     │                                     │
│ ✓ Conforme à l'objectif             │ ✔ Excellente marge                  │
│ (objectif minimal : 15.00 %)        │ Le vendant proposé permet de        │
│                                     │ dépasser la marge cible CFO.        │
└─────────────────────────────────────┴─────────────────────────────────────┘
```

---

**Bonne validation ! 🚀**
