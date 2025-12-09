# Client Default Margins Warning Feature

## Overview
This feature highlights clients that do not have default margins (target & minimum) configured on the Clients list screen.

## Implementation Summary

### Backend Changes (APG_Backend)

#### 1. ClientDto.cs
**Location:** `src/APG.Application/DTOs/ClientDto.cs`

Added a new computed property `HasDefaultMargins` as an alias to the existing `HasFinancialParameters`:

```csharp
/// <summary>
/// Alias for HasFinancialParameters - indicates if default margins are configured
/// </summary>
public bool HasDefaultMargins => HasFinancialParameters;
```

This property returns `true` only when both `DefaultTargetMarginPercent` and `DefaultMinimumMarginPercent` have values.

### Frontend Changes (APG_Front)

#### 1. Type Definitions

**services/clientsApi.ts** - Added to `ClientDto` interface:
```typescript
hasFinancialParameters?: boolean;
hasDefaultMargins?: boolean; // Alias for hasFinancialParameters
```

**types/index.ts** - Added to `Client` interface:
```typescript
hasFinancialParameters?: boolean;
```

#### 2. ClientsPage Component
**Location:** `src/pages/ClientsPage.tsx`

Modified the "Marges par défaut" column rendering logic:

- **When margins ARE configured** (`hasFinancialParameters === true`):
  - Shows: "Cible: XX% / Min: YY%"
  - Displays the colored progress bar (excellent/good/warning/danger)

- **When margins are NOT configured** (either margin is null):
  - Shows a warning message with icon
  - Text: "Marges non définies – à compléter par le CFO"
  - Uses yellow/orange warning styling
  - No "0%" values are displayed

#### 3. Styling
**Location:** `src/components/DataTable/DataTable.css`

Added new CSS classes for the warning indicator:

```css
.client-margins-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #FEF3C7;
  border: 1px solid #FCD34D;
  border-radius: 6px;
  color: #92400E;
  font-size: 12px;
  line-height: 1.4;
}

.client-margins-warning .warning-badge {
  font-size: 14px;
  flex-shrink: 0;
}

.client-margins-warning .warning-text {
  font-weight: 500;
}
```

## Testing Instructions

### Test Setup

Create or identify test clients in your database:

1. **Client A** - With configured margins:
   - `DefaultTargetMarginPercent`: 25.0
   - `DefaultMinimumMarginPercent`: 15.0

2. **Client B** - Without margins (one or both NULL):
   - `DefaultTargetMarginPercent`: NULL
   - `DefaultMinimumMarginPercent`: NULL

3. **Client C** - Partial margins (only one configured):
   - `DefaultTargetMarginPercent`: 20.0
   - `DefaultMinimumMarginPercent`: NULL

### Expected Results

#### Client A (Both margins configured)
✅ Should display:
- Text: "Cible: 25% / Min: 15%"
- Colored progress bar visible
- No warning message

#### Client B (No margins configured)
✅ Should display:
- Warning badge (⚠) with orange background
- Text: "Marges non définies – à compléter par le CFO"
- NO progress bar
- NO "0%" values

#### Client C (Partial margins)
✅ Should display:
- Warning badge (⚠) with orange background
- Text: "Marges non définies – à compléter par le CFO"
- NO progress bar
- NO "0%" values

### Test Scenarios

1. **View as Admin**
   - Navigate to Clients page
   - Verify all clients are visible
   - Confirm warning appears for clients without margins
   - Confirm clients with margins show normal display

2. **View as CFO**
   - Navigate to Clients page
   - Verify warning is visible for incomplete clients
   - Click "Modifier" on a client without margins
   - Fill in the margin fields
   - Save and verify warning disappears

3. **View as Regular User**
   - Navigate to Clients page
   - Verify warning is visible (read-only indicator)
   - Confirm no edit permissions for clients

4. **Filtering & Pagination**
   - Verify warning displays correctly on all pages
   - Test with search/filter active
   - Confirm warning styling is consistent

## Visual Design

### Warning Indicator
- **Background**: Light yellow (`#FEF3C7`)
- **Border**: Yellow/orange (`#FCD34D`)
- **Text Color**: Dark brown (`#92400E`)
- **Icon**: ⚠ warning symbol
- **Border Radius**: 6px for rounded corners

### Normal Display (with margins)
- Progress bar with gradient colors:
  - Excellent (≥25%): Green gradient
  - Good (≥20%): Blue gradient
  - Warning (≥15%): Orange gradient
  - Danger (<15%): Red gradient

## Notes

- The warning is visible to ALL user roles (Admin, CFO, regular users)
- Only Admin and CFO can edit client margins
- The backend property `HasDefaultMargins` is computed and read-only
- No changes needed to API endpoints - the property is automatically serialized
- This feature does NOT filter clients, only provides visual feedback
- Future enhancement: Filter clients on Calculette page to show only those with `hasFinancialParameters === true`

## Files Modified

### Backend
- `src/APG.Application/DTOs/ClientDto.cs`

### Frontend
- `src/services/clientsApi.ts`
- `src/types/index.ts`
- `src/pages/ClientsPage.tsx`
- `src/components/DataTable/DataTable.css`

## Related Features

This feature sets the foundation for:
- Filtering clients on the Calculette page (show only clients with configured margins)
- Dashboard metrics showing % of clients with configured margins
- Admin reports on incomplete client configurations
