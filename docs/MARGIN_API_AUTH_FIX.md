# Correction de l'authentification - API Margin

## Problème identifié

L'endpoint `/api/margin/simulate` retournait une erreur **401 Unauthorized** car le token d'authentification n'était pas inclus dans les headers de la requête.

## Solution appliquée

### Modification : `src/services/api.ts`

**Avant :**
```typescript
export const marginApi = {
  simulate: async (request: MarginSimulationRequest): Promise<MarginSimulationResponse> => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5157';
    
    const response = await fetch(`${API_BASE_URL}/api/margin/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.title || 'Erreur lors de la simulation de marge');
    }

    return response.json();
  },
};
```

**Après :**
```typescript
import { fetchWithAuth } from '../utils/authFetch';

export const marginApi = {
  simulate: async (request: MarginSimulationRequest): Promise<MarginSimulationResponse> => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001';
    
    return fetchWithAuth<MarginSimulationResponse>(`${API_BASE_URL}/api/margin/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  },
};
```

## Changements apportés

1. **Import de `fetchWithAuth`** : Utilise la fonction d'authentification centralisée du projet
2. **Suppression du fetch natif** : Remplacé par `fetchWithAuth` qui ajoute automatiquement le token JWT
3. **Simplification de la gestion d'erreur** : `fetchWithAuth` gère déjà les erreurs HTTP
4. **Alignement avec les autres APIs** : Utilise la même approche que `clientsApi` et autres services

## Fonctionnement de `fetchWithAuth`

La fonction `fetchWithAuth` (définie dans `src/utils/authFetch.ts`) :
1. Récupère automatiquement le token d'authentification via Auth0
2. Ajoute le header `Authorization: Bearer <token>` à toutes les requêtes
3. Gère les erreurs HTTP de manière standardisée
4. Fournit des logs pour le debugging

## Test de la correction

Pour tester que l'authentification fonctionne :

1. Se connecter à l'application via Auth0
2. Naviguer vers la page Calculette
3. Sélectionner un client et remplir le formulaire
4. Cliquer sur "Calculer la marge"
5. Vérifier que :
   - La requête vers `/api/margin/simulate` contient le header `Authorization`
   - Le status code est **200 OK** (et non 401)
   - Les résultats s'affichent correctement

## Vérification dans les DevTools

Dans l'onglet **Network** des DevTools, vérifier que la requête contient :
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6...
```

## Impact

- ✅ Les appels à `/api/margin/simulate` sont maintenant authentifiés
- ✅ Aucun changement de comportement visible pour l'utilisateur
- ✅ Cohérence avec les autres APIs du projet
- ✅ Respect de la politique d'authentification du backend

## Date de la correction

5 décembre 2024
