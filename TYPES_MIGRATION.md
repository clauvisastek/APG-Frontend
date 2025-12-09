# Migration des Types Frontend → Backend

## Changements effectués

Les types TypeScript ont été alignés avec les DTOs du backend C# pour garantir la cohérence.

### Principaux changements

1. **IDs: `string` → `number`**
   - `Client.id`: `string` → `number`
   - `BusinessUnit.id`: `string` → `number`
   - `BusinessUnitRef.id`: `string` → `number`

2. **Client**
   - Ajout: `businessUnitId`, `businessUnitName`, `countryId`, `currencyId`
   - Suppression: `country` (objet), `defaultCurrency` (objet), `businessUnit` (objet)
   - Les champs sont maintenant des IDs + noms séparés (comme dans le backend)

3. **CreateClientInput**
   - `businessUnitId`: `string` → `number`
   - `country`: `Country` → `countryId: number`
   - `defaultCurrency`: `Currency` → `currencyId: number`
   - `code` et `contactName` sont maintenant obligatoires

4. **BusinessUnit**
   - Simplifié pour correspondre à `BusinessUnitDto`
   - `managerName` au lieu de `leader`
   - `isActive` ajouté

## Fichiers à mettre à jour

Les fichiers suivants ont des erreurs TypeScript et doivent être mis à jour:

### Priorité HAUTE (bloquent le build)
- [x] `src/types/index.ts` ← **Fait**
- [ ] `src/services/api.ts` (36 erreurs) - Mock data à adapter
- [ ] `src/pages/HomePage.tsx` (24 erreurs)
- [ ] `src/pages/BusinessUnitsPage.tsx` (12 erreurs)

### Priorité MOYENNE
- [ ] `src/pages/CreateProjectPage.tsx` (11 erreurs)
- [ ] `src/components/ProjectCreationWizardSections.tsx` (6 erreurs)
- [ ] `src/components/ClientFormModal.tsx` (4 erreurs)

### Priorité BASSE
- [ ] Autres composants avec erreurs mineures

## Comment corriger

### Pour les conversions d'ID

```typescript
// Avant
const clientId: string = "123";

// Après
const clientId: number = 123;
```

### Pour les références aux objets imbriqués

```typescript
// Avant
client.country // objet Country
client.defaultCurrency // objet Currency

// Après
client.countryId // number
client.countryName // string
client.currencyId // number
client.currencyCode // string
```

### Pour BusinessUnit

```typescript
// Avant
businessUnit.leader

// Après
businessUnit.managerName
```

## Stratégie recommandée

1. **Court terme**: Ajouter des type assertions temporaires avec `as any` ou `// @ts-expect-error` pour permettre le déploiement
2. **Moyen terme**: Corriger fichier par fichier en testant chaque changement
3. **Long terme**: Supprimer les mocks de `api.ts` et utiliser uniquement les vrais endpoints

## Notes importantes

- ⚠️ Les types `Project` et `CreateProjectInput` n'ont PAS été mis à jour car le backend ne semble pas avoir de contrôleur Projects
- ✅ Les types `BusinessUnit` et `Client` sont maintenant parfaitement alignés avec le backend
- 🔄 Les fichiers dans `src/services/businessUnitsApi.ts` utilisent déjà les bons types (`BusinessUnitDto`)

