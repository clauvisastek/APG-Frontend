# Exemple de fichier Excel/CSV pour import CFO

## Format 1: Excel (.xlsx)

Créez un fichier Excel avec les colonnes suivantes (1ère ligne = en-têtes):

| client_id | client_name          | marge_cible | vendant_cible |
|-----------|---------------------|-------------|---------------|
| 1         | Banque Nationale     | 28          | 125           |
| 2         | Desjardins           | 32          | 135           |
| 3         | Hydro-Québec         | 24          | 115           |
| 4         | Bell Canada          | 30          | 140           |
| 5         | Vidéotron            | 27          | 130           |
| 6         | Air Canada           | 25          | 120           |
| 7         | CN Rail              | 26          | 122           |
| 8         | SAQ                  | 23          | 110           |
| 9         | Loto-Québec          | 29          | 128           |
| 10        | Revenu Québec        | 31          | 138           |

**Notes**:
- `client_id` : Doit correspondre à un ID client existant dans la base
- `client_name` : Nom du client (pour vérification humaine)
- `marge_cible` : Pourcentage (ex: 28 = 28%)
- `vendant_cible` : Tarif horaire en $ (optionnel, peut être vide)

---

## Format 2: CSV (.csv)

Créez un fichier texte `.csv` avec le contenu suivant:

```csv
client_id,client_name,marge_cible,vendant_cible
1,Banque Nationale,28,125
2,Desjardins,32,135
3,Hydro-Québec,24,115
4,Bell Canada,30,140
5,Vidéotron,27,130
6,Air Canada,25,120
7,CN Rail,26,122
8,SAQ,23,110
9,Loto-Québec,29,128
10,Revenu Québec,31,138
```

**Encodage**: UTF-8 (important pour les accents)

---

## Format 3: Variantes acceptées des noms de colonnes

Le système accepte différentes variantes (case-insensitive):

### Colonne ID client:
- `client_id` ✅
- `ClientID` ✅
- `clientid` ✅
- `CLIENT_ID` ✅

### Colonne nom client:
- `client_name` ✅
- `ClientName` ✅
- `clientname` ✅
- `CLIENT_NAME` ✅

### Colonne marge cible:
- `marge_cible` ✅
- `MargeCible` ✅
- `margecible` ✅
- `MARGE_CIBLE` ✅

### Colonne vendant cible:
- `vendant_cible` ✅
- `VendantCible` ✅
- `vendantcible` ✅
- `VENDANT_CIBLE` ✅

---

## Exemple avec colonnes optionnelles manquantes

Fichier valide **sans** vendant_cible:

| client_id | client_name      | marge_cible |
|-----------|------------------|-------------|
| 1         | Banque Nationale | 28          |
| 2         | Desjardins       | 32          |
| 3         | Hydro-Québec     | 24          |

Le système mettra à jour uniquement la marge cible, sans toucher au vendant cible existant.

---

## Exemple avec valeurs mixtes

| client_id | client_name      | marge_cible | vendant_cible |
|-----------|------------------|-------------|---------------|
| 1         | Banque Nationale | 28          | 125           |
| 2         | Desjardins       | 32          |               |
| 3         | Hydro-Québec     | 24          | 115           |

- Ligne 1: Met à jour marge ET vendant
- Ligne 2: Met à jour marge uniquement
- Ligne 3: Met à jour marge ET vendant

---

## Validation des données

### Valeurs acceptées:

**marge_cible**:
- Type: Nombre décimal
- Min: 0
- Max: 100
- Exemples valides: `25`, `28.5`, `32.75`
- Exemples invalides: `-5`, `150`, `abc`

**vendant_cible**:
- Type: Nombre décimal
- Min: 0
- Max: illimité (mais raisonnable < 1000)
- Exemples valides: `120`, `135.50`, `99.99`
- Exemples invalides: `-10`, `xyz`
- **Peut être vide** (laissé vide ou `NULL`)

**client_id**:
- Type: Entier
- Doit exister dans la base de données
- Exemples valides: `1`, `2`, `42`
- Exemples invalides: `abc`, `-1`, `999999` (si n'existe pas)

---

## Comportement import

### Clients existants
✅ **Les données sont mises à jour**

Exemple:
- Base actuelle: Client 1 → marge 25%, vendant 120 $/h
- Fichier import: Client 1 → marge 28%, vendant 125 $/h
- Résultat: Client 1 → marge 28%, vendant 125 $/h ✅

### Clients inexistants
⚠️ **La ligne est ignorée avec un avertissement**

Exemple:
- Base actuelle: Clients 1, 2, 3
- Fichier import: Client 99 → marge 30%
- Résultat: Ligne ignorée, message dans `errors[]`

### Erreurs de validation
❌ **La ligne est rejetée**

Exemple:
- Fichier import: Client 1 → marge 150%
- Résultat: Erreur "marge_cible invalide (doit être entre 0 et 100)"

---

## Réponse API après import

### Import réussi (toutes lignes valides):
```json
{
  "success": true,
  "linesImported": 10,
  "message": "10 lignes importées avec succès"
}
```

### Import partiel (quelques erreurs):
```json
{
  "success": true,
  "linesImported": 8,
  "errors": [
    "Ligne 3: client_id 999 n'existe pas",
    "Ligne 7: marge_cible invalide (150 > 100)"
  ],
  "message": "8 lignes importées avec succès (2 erreurs)"
}
```

### Import échoué (fichier invalide):
```json
{
  "success": false,
  "linesImported": 0,
  "errors": [
    "Format de fichier invalide",
    "Colonne 'client_id' manquante"
  ],
  "message": "Erreur lors de l'import du fichier"
}
```

---

## Tips pour préparer le fichier

### Dans Excel:
1. Créer une nouvelle feuille de calcul
2. Ajouter les en-têtes en ligne 1: `client_id | client_name | marge_cible | vendant_cible`
3. Remplir les données ligne par ligne
4. Vérifier qu'il n'y a pas de lignes vides
5. Enregistrer au format `.xlsx`

### Dans Google Sheets:
1. Créer une feuille avec les en-têtes
2. Remplir les données
3. Télécharger au format `.xlsx` ou `.csv`
   - Fichier → Télécharger → Microsoft Excel (.xlsx)
   - Fichier → Télécharger → Valeurs séparées par des virgules (.csv)

### Dans un éditeur de texte (pour CSV):
1. Créer un fichier `.csv`
2. Respecter le format: `valeur1,valeur2,valeur3`
3. Pas d'espaces après les virgules
4. Encoder en UTF-8
5. Utiliser des guillemets `"` si valeurs contiennent des virgules

---

## Fichier test minimal

Pour tester rapidement, créez ce fichier CSV minimal:

```csv
client_id,client_name,marge_cible,vendant_cible
1,Test Client 1,28,125
2,Test Client 2,30,130
```

Enregistrez-le sous `test_import.csv` et uploadez-le via l'interface.

---

## Troubleshooting

### "Format de fichier non supporté"
- ✅ Vérifier l'extension: `.xlsx`, `.xls` ou `.csv` uniquement
- ✅ Ne pas utiliser `.txt`, `.doc`, `.pdf`

### "Fichier trop volumineux"
- ✅ Taille max: 10 MB
- ✅ Si > 10 MB, diviser en plusieurs fichiers
- ✅ Supprimer colonnes inutiles

### "Colonne manquante"
- ✅ Vérifier que `client_id` et `marge_cible` sont présents
- ✅ Respecter l'orthographe (ou variantes acceptées)
- ✅ Ligne 1 doit contenir les en-têtes

### "client_id n'existe pas"
- ✅ Vérifier l'ID dans l'interface (tableau clients)
- ✅ Ne pas créer de nouveaux clients via import
- ✅ Utiliser l'interface pour créer d'abord le client

### "Valeur invalide"
- ✅ marge_cible entre 0 et 100
- ✅ vendant_cible > 0 (ou vide)
- ✅ Pas de texte dans colonnes numériques
- ✅ Utiliser `.` comme séparateur décimal (pas `,`)

---

## Exemple complet de workflow

1. **Exporter les données actuelles** (depuis l'interface):
   - Copier le tableau clients existant
   - Coller dans Excel

2. **Modifier les valeurs**:
   - Mettre à jour les marges cibles
   - Ajuster les vendants cibles

3. **Vérifier le fichier**:
   - Colonnes requises présentes ✅
   - Pas de lignes vides ✅
   - IDs clients valides ✅
   - Valeurs dans les plages acceptées ✅

4. **Importer**:
   - Drag & drop ou cliquer pour sélectionner
   - Bouton "Lancer l'import"
   - Attendre confirmation

5. **Vérifier**:
   - Toast de succès avec nombre de lignes
   - Tableau clients rafraîchi
   - Faire une simulation pour tester

---

## Template Excel prêt à l'emploi

Téléchargez ce template et remplissez-le:

[À créer manuellement dans Excel et fournir aux CFO]

**Colonnes**:
- A: `client_id` (numérique, obligatoire)
- B: `client_name` (texte, obligatoire)
- C: `marge_cible` (numérique décimal, obligatoire, 0-100)
- D: `vendant_cible` (numérique décimal, optionnel, >0)

**Validation Excel**:
- Colonne C: Data Validation → Decimal between 0 and 100
- Colonne D: Data Validation → Decimal greater than 0
- Colonne A: Data Validation → Whole number

Cela empêchera les erreurs de saisie directement dans Excel!
