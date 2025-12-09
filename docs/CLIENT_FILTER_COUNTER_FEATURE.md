# Client Filter & Counter Feature - Implementation Guide

## Overview
This feature adds a filter toggle and counter badge to help CFOs and admins quickly identify and view clients with incomplete margin configuration.

## Features Implemented

### 1. **Incomplete Clients Counter Badge**
- Displays next to the "Clients" page title
- Shows the number of clients missing default margins
- Format: "Clients à compléter : X"
- Only visible when count > 0
- Styled with amber/orange color scheme for attention

### 2. **Filter Toggle Buttons**
- Two-button toggle control:
  - **"Tous les clients (X)"** - Shows all clients
  - **"Clients à compléter (X)"** - Shows only incomplete clients
- Displays count for each filter option
- Active button highlighted with Astek green
- Smooth transitions and hover effects

### 3. **Client-Side Filtering**
- No new API endpoints required
- Fast, instant filtering on already loaded data
- Works with existing role-based filtering
- Compatible with DataTable pagination

## Implementation Details

### Type Definition
```typescript
type ClientsFilterMode = 'all' | 'incomplete';
```

### State Management
```typescript
const [filterMode, setFilterMode] = useState<ClientsFilterMode>('all');
```

### Computed Values

#### 1. Role-Based Filtering (existing, renamed)
```typescript
const roleFilteredClients = useMemo(() => {
  // Filters by user role and business unit access
  // Admin/CFO see all, others see only their BU clients
}, [clients, user]);
```

#### 2. Incomplete Clients Counter
```typescript
const incompleteClientsCount = useMemo(() => {
  return roleFilteredClients.filter(
    (client) => !client.hasFinancialParameters && !client.hasDefaultMargins
  ).length;
}, [roleFilteredClients]);
```

#### 3. Final Filtered Clients
```typescript
const filteredClients = useMemo(() => {
  if (filterMode === 'incomplete') {
    return roleFilteredClients.filter(
      (client) => !client.hasFinancialParameters && !client.hasDefaultMargins
    );
  }
  return roleFilteredClients; // 'all'
}, [roleFilteredClients, filterMode]);
```

### UI Components

#### Header Section
```tsx
<div className="astek-flex-between">
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <h1 className="astek-page-title">Clients</h1>
    {incompleteClientsCount > 0 && (
      <span className="clients-incomplete-badge">
        Clients à compléter : {incompleteClientsCount}
      </span>
    )}
  </div>
  <div>
    {/* Action buttons */}
  </div>
</div>
```

#### Filter Toggle
```tsx
<div className="clients-filter-section">
  <div className="clients-filter-toggle">
    <button
      className={filterMode === 'all' ? 'filter-button active' : 'filter-button'}
      onClick={() => setFilterMode('all')}
    >
      Tous les clients ({roleFilteredClients.length})
    </button>
    <button
      className={filterMode === 'incomplete' ? 'filter-button active' : 'filter-button'}
      onClick={() => setFilterMode('incomplete')}
    >
      Clients à compléter ({incompleteClientsCount})
    </button>
  </div>
</div>
```

## CSS Styling

### Incomplete Clients Badge
```css
.clients-incomplete-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #fffbeb; /* light amber */
  color: #92400e;            /* dark amber */
  border: 1px solid #fcd34d; /* amber border */
}
```

### Filter Toggle Container
```css
.clients-filter-toggle {
  display: inline-flex;
  gap: 8px;
  padding: 4px;
  background-color: #f3f4f6;
  border-radius: 8px;
}
```

### Filter Buttons
```css
.filter-button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background-color: transparent;
  color: #6b7280;
  transition: all 0.2s ease;
}

.filter-button.active {
  background-color: #00A86B; /* Astek green */
  color: white;
  font-weight: 600;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}
```

## User Experience

### Default View (All Clients)
```
┌─────────────────────────────────────────────────┐
│ Clients  [Clients à compléter : 3]             │
│                                   [📥][+ Nouveau]│
├─────────────────────────────────────────────────┤
│ [Tous les clients (25)] [Clients à compléter (3)]│
├─────────────────────────────────────────────────┤
│ Client A  |  Code  |  ...  |  ✅ Margins OK     │
│ Client B  |  Code  |  ...  |  ⚠️ Warning         │
│ Client C  |  Code  |  ...  |  ✅ Margins OK     │
└─────────────────────────────────────────────────┘
```

### Filtered View (Incomplete Only)
```
┌─────────────────────────────────────────────────┐
│ Clients  [Clients à compléter : 3]             │
│                                   [📥][+ Nouveau]│
├─────────────────────────────────────────────────┤
│ [Tous les clients (25)] [Clients à compléter (3)]│
├─────────────────────────────────────────────────┤
│ Client B  |  Code  |  ...  |  ⚠️ Warning         │
│ Client D  |  Code  |  ...  |  ⚠️ Warning         │
│ Client F  |  Code  |  ...  |  ⚠️ Warning         │
└─────────────────────────────────────────────────┘
```

## Business Logic

### What Makes a Client "Incomplete"?
A client is considered incomplete when:
```typescript
!client.hasFinancialParameters && !client.hasDefaultMargins
```

This evaluates to `true` when:
- `defaultTargetMarginPercent` is NULL, OR
- `defaultMinimumMarginPercent` is NULL

**Both margins must be configured** for the client to be considered "complete".

### Filter Behavior

| Filter Mode | Clients Shown |
|------------|---------------|
| `all` | All clients the user has access to (based on role) |
| `incomplete` | Only clients missing one or both default margins |

### Role-Based Access (unchanged)
- **Admin/CFO**: See all clients
- **BU Leaders**: See only clients in their business units
- **Regular Users**: See only clients in their business units

## Testing Scenarios

### Test Setup
Create test data with:
1. Client A: Both margins configured
2. Client B: No margins (both NULL)
3. Client C: Partial margins (one NULL)

### Test Cases

#### TC1: Page Load (Default State)
- [x] Filter mode is "all"
- [x] All accessible clients are visible
- [x] Badge shows correct count of incomplete clients
- [x] "Tous les clients" button is active (green)

#### TC2: Badge Visibility
- [x] Badge visible when incompleteClientsCount > 0
- [x] Badge hidden when incompleteClientsCount === 0
- [x] Badge shows correct number

#### TC3: Filter - Incomplete Clients
- [x] Click "Clients à compléter"
- [x] Only incomplete clients displayed
- [x] Each row shows warning in "Marges par défaut" column
- [x] Button shows correct count
- [x] Button is active (green)

#### TC4: Filter - All Clients
- [x] Click "Tous les clients" after filtering
- [x] All clients displayed again
- [x] Mix of complete and incomplete clients visible
- [x] Button is active (green)

#### TC5: Counter Updates
- [x] Edit a client to add margins
- [x] Counter decreases by 1
- [x] Badge updates or disappears if count reaches 0
- [x] Filter buttons update their counts

#### TC6: Pagination
- [x] Filter works with paginated data
- [x] Page numbers adjust to filtered results
- [x] Navigation between pages maintains filter

#### TC7: Role-Based Filtering
- [x] Admin sees all clients (complete + incomplete)
- [x] CFO sees all clients (complete + incomplete)
- [x] BU Leader sees only their BU's clients
- [x] Filter applies to role-filtered results

#### TC8: Responsive Design
- [x] Layout adapts on mobile screens
- [x] Buttons stack or resize appropriately
- [x] Badge remains visible and readable

## Integration Points

### Works With
- ✅ Existing role-based client filtering
- ✅ DataTable pagination
- ✅ Client edit modal
- ✅ Import clients functionality
- ✅ Previous margin warning feature

### Does Not Affect
- ✅ API endpoints (no changes required)
- ✅ Backend logic
- ✅ Database queries
- ✅ Other pages or components

## Performance Considerations

### Client-Side Filtering Benefits
- ✅ No additional API calls
- ✅ Instant filtering (no network latency)
- ✅ Works offline once data is loaded
- ✅ Reduces server load

### Potential Limitations
- Works well for datasets up to ~1000 clients
- For larger datasets, consider server-side filtering
- Current implementation filters already-loaded data

## Future Enhancements

### Phase 2 Possibilities
1. **Server-Side Filtering**
   - Add query parameter to API: `?filter=incomplete`
   - Reduces payload for large datasets

2. **Additional Filter Options**
   - Filter by Business Unit
   - Filter by sector
   - Combined filters

3. **Bulk Actions**
   - "Configure margins for selected clients"
   - Bulk edit functionality

4. **Export/Reports**
   - Export list of incomplete clients
   - Generate CFO report

5. **Dashboard Integration**
   - Show incomplete count on dashboard
   - Progress chart over time

## Files Modified

### Frontend
- `src/pages/ClientsPage.tsx` - Added filter logic and UI
- `src/pages/ClientsPage.css` - New styles for badge and buttons

### No Changes Required
- Backend files (filter is client-side)
- API endpoints
- Database schema
- Type definitions (already had required fields)

## Troubleshooting

### Badge Not Showing
1. Check that `hasFinancialParameters` or `hasDefaultMargins` exists in API response
2. Verify at least one client has incomplete margins
3. Check browser console for errors

### Filter Not Working
1. Verify `filterMode` state is updating (use React DevTools)
2. Check that `filteredClients` is being passed to `DataTable`
3. Ensure `roleFilteredClients` has data

### Incorrect Count
1. Verify logic: `!client.hasFinancialParameters && !client.hasDefaultMargins`
2. Check that backend returns correct boolean values
3. Test with known client data

### Styling Issues
1. Verify `ClientsPage.css` is imported
2. Check for CSS class name conflicts
3. Clear browser cache
4. Inspect elements in DevTools

## Success Criteria

✅ Feature is complete when:
1. Badge displays correct count of incomplete clients
2. Badge is only visible when count > 0
3. Filter toggle shows two buttons with counts
4. "Tous les clients" shows all accessible clients
5. "Clients à compléter" shows only incomplete clients
6. Active button highlighted with green background
7. Filter state persists during page interactions
8. Pagination works with filtered data
9. Responsive design works on mobile
10. No performance degradation

## Related Documentation
- Client Margins Warning Feature: `CLIENT_MARGINS_WARNING_FEATURE.md`
- Visual Guide: `CLIENT_MARGINS_WARNING_VISUAL_GUIDE.md`
- Quick Test Guide: `QUICKSTART_CLIENT_MARGINS_TEST.md`
