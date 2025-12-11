# Test Manuel - Membres de l'équipe

## Procédure de test :

1. Ouvrir http://localhost:5174
2. Se connecter
3. Aller sur "Projets" > "Créer un projet"
4. Remplir les informations de base
5. Aller à l'étape "Équipe"

### Test 1 : Ajouter 3 membres
- Membre 1 : email1@test.com, taux coûtant : 80 CAD
- Membre 2 : email2@test.com, taux coûtant : 100 CAD  
- Membre 3 : email3@test.com, taux coûtant : 120 CAD

**Résultat attendu :** La grille affiche 3 membres avec les taux corrects

### Test 2 : Modifier le membre 2
- Cliquer sur "Modifier" pour le membre 2
- Changer le taux coûtant de 100 à 150 CAD
- Sauvegarder

**Résultat attendu :**
- Membre 1 : toujours 80 CAD ✅
- Membre 2 : maintenant 150 CAD ✅
- Membre 3 : toujours 120 CAD ✅

### Test 3 : Vérifier les logs console
Ouvrir la console (F12) et vérifier :
- `📊 LocalMembers before update` - doit montrer les 3 membres avec leurs taux actuels
- `🎯 Updating index: 1` - doit indiquer l'index 1 (membre 2)
- `📊 LocalMembers after update` - doit montrer membre 2 avec 150, les autres inchangés

## Logs attendus :

```
🔵 handleModalSave called: { isNewMember: false, editingIndex: 1, updatedMemberEmail: "email2@test.com", updatedMemberRate: 150 }
✏️ Updating member at index: 1 { id: "member-...", email: "email2@test.com", newRate: 150 }
📊 LocalMembers before update: [
  { index: 0, id: "...", email: "email1@test.com", rate: 80 },
  { index: 1, id: "...", email: "email2@test.com", rate: 100 },
  { index: 2, id: "...", email: "email3@test.com", rate: 120 }
]
🎯 Updating index: 1 with rate: 150
📊 LocalMembers after update: [
  { index: 0, id: "...", email: "email1@test.com", rate: 80 },
  { index: 1, id: "...", email: "email2@test.com", rate: 150 },
  { index: 2, id: "...", email: "email3@test.com", rate: 120 }
]
```

## Si le test échoue :

Vérifier si un `useEffect` se déclenche après la mise à jour et écrase le state local.
