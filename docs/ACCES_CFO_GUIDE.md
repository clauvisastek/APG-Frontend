# Guide d'accès aux fonctionnalités CFO

## 🎯 Problème
Vous ne voyez pas les sections CFO dans la page Calculette :
- Paramètres globaux salariés
- Configuration par client  
- Import Excel/CSV

## ✅ Solution appliquée (MODE DÉVELOPPEMENT)

J'ai **temporairement activé le mode CFO** dans le code pour vous permettre de tester toutes les fonctionnalités.

### Changement effectué dans `src/pages/CalculettePage.tsx` :

```typescript
// AVANT (ligne 24) :
const isCFO = userRoles.includes('CFO') || userRoles.includes('Admin');

// APRÈS (lignes 24-28) :
const isCFO = true; // ← Force le mode CFO pour le développement
```

### Comment tester maintenant :

1. **Ouvrir l'application** : http://localhost:5173/calculette

2. **Ouvrir la console du navigateur** (F12) pour voir vos rôles actuels :
   ```
   🔍 Rôles utilisateur: ["vendeur"] (ou vos rôles réels)
   🔐 Mode CFO actif: true
   ```

3. **Scroller vers le bas** de la page Calculette

4. **Vous devriez voir** :
   - Un divider "🔐 Zone réservée CFO"
   - Une alerte jaune "Paramètres financiers"
   - **3 cards CFO** :
     1. Paramètres globaux – Salariés
     2. Paramètres par client
     3. Import de données Excel/CSV

---

## 🔧 Pour utiliser les fonctionnalités CFO

### 1. Paramètres globaux salariés
- Cliquer sur "✏️ Modifier"
- Ajuster :
  - Charges patronales (%)
  - Coûts indirects annuels ($)
  - Heures facturables par an
- Cliquer "💾 Enregistrer"

### 2. Configuration par client
- Cliquer sur "✏️ Modifier" pour un client
- Ajuster :
  - Marge cible (%)
  - Vendant cible ($/h)
- Cliquer "Enregistrer"

### 3. Import Excel/CSV
- Préparer un fichier avec colonnes :
  - `client_id`
  - `client_name`
  - `marge_cible`
  - `vendant_cible` (optionnel)
- Glisser-déposer le fichier ou cliquer pour sélectionner
- Cliquer "📤 Lancer l'import"

**Format exemple** :
```csv
client_id,client_name,marge_cible,vendant_cible
1,Banque Nationale,28,125
2,Desjardins,32,135
```

Voir `IMPORT_FILE_FORMAT.md` pour plus de détails.

---

## 🚀 Solutions permanentes (PRODUCTION)

### Option A : Ajouter le rôle CFO dans Auth0 (RECOMMANDÉ)

1. **Se connecter à Auth0** Dashboard
2. **Aller dans** : User Management → Users
3. **Sélectionner votre utilisateur**
4. **Aller dans** : Roles
5. **Assigner le rôle** : `CFO` ou `Admin`
6. **Se déconnecter et reconnecter** dans l'application

Les rôles sont stockés dans le custom claim : `https://apg-astek.com/roles`

### Option B : Créer un utilisateur test CFO

1. **Créer un nouvel utilisateur** dans Auth0
2. **Lui assigner le rôle** `CFO`
3. **Se connecter avec ce compte** pour tester les fonctionnalités

### Option C : Modifier la règle Auth0

Si vous gérez les rôles via une règle Auth0, ajoutez `CFO` à votre profil :

```javascript
// Règle Auth0 (exemple)
function addRolesToUser(user, context, callback) {
  const namespace = 'https://apg-astek.com/';
  
  // Exemple : ajouter CFO à certains utilisateurs
  if (user.email === 'votre.email@exemple.com') {
    context.idToken[namespace + 'roles'] = ['CFO', 'Vendeur'];
    context.accessToken[namespace + 'roles'] = ['CFO', 'Vendeur'];
  }
  
  callback(null, user, context);
}
```

---

## ⚠️ IMPORTANT : Avant de passer en production

**Retirer le code de développement** dans `src/pages/CalculettePage.tsx` :

```typescript
// RETIRER CETTE LIGNE :
const isCFO = true; // ← À SUPPRIMER

// REMETTRE LA VERSION PRODUCTION :
const isCFO = userRoles.includes('CFO') || userRoles.includes('Admin');
```

Ou simplement :

```typescript
export const CalculettePage = () => {
  const { user } = useAuth0();
  const userRoles = getRolesArray(user);
  const isCFO = userRoles.includes('CFO') || userRoles.includes('Admin');
  
  // State
  // ... reste du code
```

---

## 🔍 Debugging : Vérifier vos rôles actuels

### Dans la console navigateur (F12) :

```javascript
// Afficher l'utilisateur Auth0
console.log('User:', user);

// Afficher les rôles extraits
console.log('Roles:', getRolesArray(user));

// Vérifier le claim custom
console.log('Custom claim:', user['https://apg-astek.com/roles']);
```

### Dans le code (temporaire) :

Ajoutez dans n'importe quelle page :

```typescript
const { user } = useAuth0();
console.log('🔍 Debug Auth0 User:', user);
console.log('🔐 Roles claim:', user['https://apg-astek.com/roles']);
```

---

## 📊 Vérification rapide

✅ **Le mode CFO est actif si vous voyez** :
- Le divider "🔐 Zone réservée CFO"
- 3 cards CFO en dessous de l'historique des scénarios
- Console affiche : `🔐 Mode CFO actif: true`

❌ **Le mode CFO n'est pas actif si** :
- Vous ne voyez que le formulaire de simulation
- Pas de sections CFO après l'historique
- Console affiche : `🔐 Mode CFO actif: false`

---

## 🆘 Dépannage

### "Je ne vois toujours pas les sections CFO"

1. **Vérifier que le serveur a redémarré** après la modification
2. **Rafraîchir la page** (Ctrl+R ou Cmd+R)
3. **Vider le cache** (Ctrl+Shift+R ou Cmd+Shift+R)
4. **Vérifier la console** : doit afficher `🔐 Mode CFO actif: true`

### "J'ai une erreur dans la console"

Vérifier que la modification est bien présente :
```bash
# Dans le terminal
cd /Users/clauviskitieu/Documents/Projets/DPO/Apps/APG_Front
grep -n "const isCFO = true" src/pages/CalculettePage.tsx
```

Devrait afficher :
```
27:  const isCFO = true; // Force le mode CFO pour le développement
```

### "Le serveur ne démarre pas"

```bash
# Arrêter tous les serveurs
pkill -f vite

# Relancer
cd /Users/clauviskitieu/Documents/Projets/DPO/Apps/APG_Front
npm run dev
```

---

## 📝 Résumé

**Actuellement** :
- ✅ Mode CFO forcé à `true` (développement)
- ✅ Toutes les fonctionnalités CFO accessibles
- ✅ Serveur sur http://localhost:5173/

**Pour la production** :
- ⚠️ Retirer `const isCFO = true`
- ✅ Ajouter le rôle CFO dans Auth0
- ✅ Vérifier le contrôle d'accès backend

**Fichiers modifiés** :
- `src/pages/CalculettePage.tsx` (ligne 27)

**Serveur actif** :
- http://localhost:5173/calculette
