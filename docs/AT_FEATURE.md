# Nouvelle fonctionnalité : Assistance Technique (AT)

## Fichiers créés

### Types
- `src/types/technicalAssignment.ts` - Types TypeScript pour les missions AT

### Services API
- `src/services/technicalAssignmentsApi.ts` - API mock pour le CRUD des missions AT

### Pages
- `src/pages/TechnicalAssignmentsPage.tsx` - Page principale pour la liste des AT
- `src/pages/TechnicalAssignmentsPage.css` - Styles de la page AT

### Composants
- `src/components/TechnicalAssignmentFormModal.tsx` - Modale pour créer/modifier des AT (wizard 2 étapes)
- `src/components/TechnicalAssignmentFormModal.css` - Styles de la modale de formulaire
- `src/components/TechnicalAssignmentDetailsModal.tsx` - Modale de détails avec graphiques analytiques
- `src/components/TechnicalAssignmentDetailsModal.css` - Styles de la modale de détails

## Fichiers modifiés

### Navigation
- `src/components/Layout.tsx` - Ajout du lien "AT" dans la barre de navigation
- `src/App.tsx` - Ajout de la route `/technical-assignments`

### Helpers
- `src/utils/roleHelpers.ts` - Ajout de `hasManageRights()` et `getRolesArray()`

## Fonctionnalités implémentées

### 1. Page liste AT
- ✅ Tableau avec toutes les missions AT
- ✅ Filtres multiples (client, BU, métier, séniorité, statut)
- ✅ Pagination (5, 10, 25, 50 lignes par page)
- ✅ Barre de progression pour la marge
- ✅ Badges colorés pour statut et séniorité
- ✅ Filtrage automatique par rôles BU de l'utilisateur
- ✅ Actions conditionnelles (Admin, CFO, BU-*)

### 2. CRUD complet
- ✅ Création de mission AT (wizard 2 étapes)
- ✅ Modification de mission AT
- ✅ Suppression avec confirmation
- ✅ Calcul automatique de la marge en temps réel
- ✅ Validation des formulaires

### 3. Vue détaillée analytique
- ✅ Informations générales et financières
- ✅ Graphique d'évolution de la marge (ligne)
- ✅ Répartition de la marge par dimension (barres)
- ✅ Insights clés (métier dominant, profil rentable)

### 4. Contrôle d'accès (comme Projets/Clients)
- ✅ Fonction `hasManageRights(userRoles)` vérifie Admin, CFO, ou BU-*
- ✅ Bouton "Nouvelle mission AT" visible uniquement si droits
- ✅ Actions Éditer/Supprimer visibles uniquement si droits
- ✅ Filtrage des données par BU selon les rôles utilisateur

## Données mock
5 missions AT d'exemple sont pré-chargées avec différents clients, métiers, et BU.

## Navigation
Un nouvel onglet "AT" est disponible entre "Clients" et "Business Units" dans la barre de navigation.

## Prochaines étapes
- Connecter à l'API backend réelle (remplacer le mock)
- Ajouter des graphiques plus avancés avec une bibliothèque comme Chart.js ou Recharts
- Ajouter l'export Excel/PDF
- Ajouter des filtres de dates (plage de dates de début/fin)
