# API Endpoints - Calculette CFO

## Endpoints à implémenter côté backend Laravel

### 1. Configuration globale

#### GET `/api/calculette/config`
Récupère la configuration complète (globale + clients).

**Réponse**:
```json
{
  "globalCosts": {
    "chargesPatronales": 65,
    "coutsIndirects": 5000,
    "heuresFacturablesParAn": 1600
  },
  "clientConfigs": [
    {
      "clientId": "1",
      "clientName": "Banque Nationale",
      "margeCible": 25,
      "vendantCibleHoraire": 120
    }
  ]
}
```

**Permissions**: Tous les utilisateurs (lecture)

---

### 2. Mise à jour paramètres globaux

#### PUT `/api/calculette/config/global-costs`
Met à jour les paramètres financiers globaux.

**Requête**:
```json
{
  "chargesPatronales": 68,
  "coutsIndirects": 5500,
  "heuresFacturablesParAn": 1650
}
```

**Réponse**: `204 No Content` ou config mise à jour

**Permissions**: CFO uniquement ⚠️

**Validation**:
- `chargesPatronales`: required, numeric, min:0, max:100
- `coutsIndirects`: required, numeric, min:0
- `heuresFacturablesParAn`: required, integer, min:1

---

### 3. Liste des clients

#### GET `/api/calculette/config/clients`
Récupère la liste des clients avec leurs paramètres de marge.

**Réponse**:
```json
[
  {
    "clientId": "1",
    "clientName": "Banque Nationale",
    "margeCible": 25,
    "vendantCibleHoraire": 120
  },
  {
    "clientId": "2",
    "clientName": "Desjardins",
    "margeCible": 30,
    "vendantCibleHoraire": 130
  }
]
```

**Permissions**: CFO uniquement ⚠️

---

### 4. Mise à jour configuration client

#### PUT `/api/calculette/config/clients/{clientId}`
Met à jour les paramètres de marge pour un client spécifique.

**Requête**:
```json
{
  "margeCible": 28,
  "vendantCibleHoraire": 125
}
```

**Réponse**: `204 No Content` ou config mise à jour

**Permissions**: CFO uniquement ⚠️

**Validation**:
- `margeCible`: required, numeric, min:0, max:100
- `vendantCibleHoraire`: nullable, numeric, min:0

**Erreurs**:
- `404`: Client non trouvé

---

### 5. Import Excel/CSV

#### POST `/api/calculette/import`
Importe les marges cibles et vendants cibles depuis un fichier Excel/CSV.

**Requête**: `multipart/form-data`
```
file: [fichier .xlsx, .xls ou .csv]
```

**Format du fichier**:
| client_id | client_name      | marge_cible | vendant_cible |
|-----------|------------------|-------------|---------------|
| 1         | Banque Nationale | 25          | 120           |
| 2         | Desjardins       | 30          | 130           |

**Colonnes acceptées (case-insensitive)**:
- `client_id` ou `ClientID`
- `client_name` ou `ClientName`
- `marge_cible` ou `MargeCible`
- `vendant_cible` ou `VendantCible` (optionnel)

**Réponse**:
```json
{
  "success": true,
  "linesImported": 152,
  "message": "152 lignes importées avec succès"
}
```

**En cas d'erreur**:
```json
{
  "success": false,
  "linesImported": 0,
  "errors": [
    "Ligne 5: client_id manquant",
    "Ligne 12: marge_cible invalide (doit être entre 0 et 100)"
  ],
  "message": "Erreur lors de l'import du fichier"
}
```

**Permissions**: CFO uniquement ⚠️

**Validation**:
- Format: .xlsx, .xls, .csv uniquement
- Taille max: 10 MB
- Colonnes requises: client_id, marge_cible
- Validation ligne par ligne avec rapport d'erreurs

**Comportement**:
- Si `client_id` existe → mise à jour
- Si `client_id` n'existe pas → ignoré (avertissement dans errors)
- Import transactionnel recommandé (rollback si erreur)

**Librairie recommandée**: `maatwebsite/excel`

---

## Middleware Laravel recommandé

```php
// routes/api.php
Route::middleware(['auth:sanctum', 'role:CFO'])->group(function () {
    Route::put('/calculette/config/global-costs', [CalculetteConfigController::class, 'updateGlobalCosts']);
    Route::get('/calculette/config/clients', [CalculetteConfigController::class, 'getClients']);
    Route::put('/calculette/config/clients/{clientId}', [CalculetteConfigController::class, 'updateClient']);
    Route::post('/calculette/import', [CalculetteConfigController::class, 'importFile']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/calculette/config', [CalculetteConfigController::class, 'getConfig']);
    Route::post('/calculette/simulate', [CalculetteController::class, 'simulate']);
});
```

---

## Base de données suggérée

### Table `calculette_config`
```sql
CREATE TABLE calculette_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    charges_patronales DECIMAL(5,2) NOT NULL DEFAULT 65.00,
    couts_indirects DECIMAL(10,2) NOT NULL DEFAULT 5000.00,
    heures_facturables_par_an INT NOT NULL DEFAULT 1600,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Table `client_margin_configs`
```sql
CREATE TABLE client_margin_configs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    marge_cible DECIMAL(5,2) NOT NULL,
    vendant_cible_horaire DECIMAL(8,2) NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    UNIQUE KEY unique_client (client_id)
);
```

### Table audit (optionnel)
```sql
CREATE TABLE calculette_config_audit (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'update_global', 'update_client', 'import'
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    created_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Tests recommandés

### Tests unitaires (PHPUnit)
- ✅ Validation des paramètres globaux
- ✅ Validation des paramètres clients
- ✅ Parsing Excel avec données valides
- ✅ Gestion erreurs fichier invalide
- ✅ Vérification permissions CFO

### Tests d'intégration
- ✅ Workflow complet: config → simulation → résultats
- ✅ Import → vérification données importées
- ✅ Mise à jour client → simulation utilise nouvelles valeurs

### Tests frontend (Jest/React Testing Library)
- ✅ Composants CFO non visibles pour non-CFO
- ✅ Modal d'édition client
- ✅ Upload fichier avec drag & drop
- ✅ Validation formulaire paramètres globaux

---

## Sécurité

⚠️ **IMPORTANT**: Tous les endpoints CFO DOIVENT être protégés côté backend.

```php
// Exemple middleware personnalisé
class EnsureCFORole
{
    public function handle($request, Closure $next)
    {
        if (!$request->user()->hasRole('CFO')) {
            abort(403, 'Accès réservé aux CFO');
        }
        return $next($request);
    }
}
```

**Checklist sécurité**:
- ✅ Vérification rôle sur chaque endpoint sensible
- ✅ Validation stricte des inputs
- ✅ Limite taille fichiers upload (10 MB)
- ✅ Sanitization des données Excel/CSV
- ✅ Rate limiting sur import
- ✅ Logs des modifications CFO
- ✅ CSRF protection
- ✅ File type validation (pas seulement extension)

---

## Performance

**Optimisations recommandées**:
- Cache de la configuration globale (Redis)
- Invalidation du cache après mise à jour
- Index sur `client_id` dans `client_margin_configs`
- Traitement asynchrone pour gros fichiers (Laravel Queue)
- Pagination si nombre de clients > 100

**Import asynchrone pour gros fichiers**:
```php
// Si fichier > 1000 lignes → job en arrière-plan
if ($rowCount > 1000) {
    ImportCalculetteDataJob::dispatch($file, $user);
    return response()->json([
        'success' => true,
        'message' => 'Import en cours de traitement (notification par email)',
        'async' => true
    ]);
}
```
