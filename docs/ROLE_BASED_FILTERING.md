# Role-Based Filtering Implementation

## Overview
This document describes the role-based data filtering implementation using Auth0 roles to control which Business Units users can access.

## Role Structure

### Roles
- **Admin**: Full access to all Business Units
- **CFO**: Full access to all Business Units
- **BU-1**: Access only to Business Unit BU-1 (Banking France)
- **BU-2**: Access only to Business Unit BU-2 (Energy Canada)
- **BU-3**: Access only to Business Unit BU-3 (Telecom Europe)

### Business Unit Codes
- **BU-1**: Banking France
- **BU-2**: Energy Canada
- **BU-3**: Telecom Europe

## Implementation Details

### Core Utility: `src/utils/roleUtils.ts`

This file provides the central role-based access control logic:

#### Functions

1. **`getRoleAccess(user)`**
   - Returns: `{ isAdminOrCfo: boolean, allowedBuCodes: string[] }`
   - Determines if user is Admin/CFO or which BU codes they can access
   - Admin/CFO: Returns empty array (meaning "all")
   - BU leaders: Returns array with their specific BU code

2. **`isBuCodeAllowed(buCode, roleAccess)`**
   - Checks if a specific BU code is accessible given the role access
   - Admin/CFO: Always returns true
   - BU leaders: Returns true only for their assigned BU

3. **`filterByBuCode<T>(items, roleAccess)`**
   - Generic function to filter any array of items by businessUnitCode
   - Admin/CFO: Returns all items unchanged
   - BU leaders: Filters to only items with matching businessUnitCode

### Updated Pages

#### 1. Business Units Page (`src/pages/BusinessUnitsPage.tsx`)
```typescript
const roleAccess = useMemo(() => getRoleAccess(user), [user]);
const filteredBusinessUnits = useMemo(() => {
  const units = localBusinessUnits.length > 0 ? localBusinessUnits : businessUnits || [];
  return filterByBuCode(units, roleAccess);
}, [localBusinessUnits, businessUnits, roleAccess]);
```
- Admin/CFO: See all 3 Business Units
- BU-1 leader: Sees only BU-1
- BU-2 leader: Sees only BU-2
- BU-3 leader: Sees only BU-3

#### 2. Clients Page (`src/pages/ClientsPage.tsx`)
```typescript
const roleAccess = useMemo(() => getRoleAccess(user), [user]);
const filteredClients = useMemo(() => 
  filterByBuCode(displayClients, roleAccess),
  [displayClients, roleAccess]
);
```
- Clients are filtered based on their `businessUnitCode` field
- BU leaders only see clients belonging to their Business Unit

#### 3. Projects Page (`src/pages/ProjectsPage.tsx`)
```typescript
const roleAccess = useMemo(() => getRoleAccess(user), [user]);
const filteredProjects = useMemo(() => 
  filterByBuCode(displayProjects, roleAccess),
  [displayProjects, roleAccess]
);
```
- Projects are filtered based on their `businessUnitCode` field
- BU leaders only see projects belonging to their Business Unit

### Data Model Changes

All entities now include `businessUnitCode` for efficient filtering:

```typescript
interface BusinessUnit {
  id: string;
  name: string;
  businessUnitCode: string;  // "BU-1", "BU-2", or "BU-3"
  // ... other fields
}

interface Client {
  id: string;
  businessUnit: BusinessUnitRef;
  businessUnitCode: string;  // Denormalized for quick filtering
  // ... other fields
}

interface Project {
  id: string;
  businessUnit: BusinessUnitRef;
  businessUnitCode: string;  // Denormalized for quick filtering
  // ... other fields
}
```

## Testing Scenarios

### Admin/CFO User
1. Navigate to Business Units → Should see all 3 BUs
2. Navigate to Clients → Should see all clients across all BUs
3. Navigate to Projects → Should see all projects across all BUs

### BU-1 Leader User
1. Navigate to Business Units → Should only see BU-1 (Banking France)
2. Navigate to Clients → Should only see clients with businessUnitCode "BU-1"
3. Navigate to Projects → Should only see projects with businessUnitCode "BU-1"

### BU-2 Leader User
1. Navigate to Business Units → Should only see BU-2 (Energy Canada)
2. Navigate to Clients → Should only see clients with businessUnitCode "BU-2"
3. Navigate to Projects → Should only see projects with businessUnitCode "BU-2"

### BU-3 Leader User
1. Navigate to Business Units → Should only see BU-3 (Telecom Europe)
2. Navigate to Clients → Should only see clients with businessUnitCode "BU-3"
3. Navigate to Projects → Should only see projects with businessUnitCode "BU-3"

## Mock Data

The application includes mock data for testing:

### Business Units
- BU-1: Banking France
- BU-2: Energy Canada
- BU-3: Telecom Europe

### Clients Distribution
- Multiple clients assigned to each BU via businessUnitCode field

### Projects Distribution
- Multiple projects assigned to each BU via businessUnitCode field

## Benefits

1. **Centralized Logic**: All role-based filtering logic is in one utility file
2. **Type Safety**: Generic `filterByBuCode` function works with any entity type
3. **Performance**: Uses `useMemo` to prevent unnecessary recalculations
4. **Maintainability**: Easy to update role mappings or add new BUs
5. **Consistency**: Same filtering pattern applied across all pages
6. **Security**: Role checks happen on frontend (backend should also enforce)

## Future Enhancements

1. Add backend API filtering to match frontend role-based filtering
2. Implement role-based create/edit permissions (e.g., BU leaders can only create/edit items in their BU)
3. Add audit logging for role-based access
4. Consider implementing hierarchical roles (e.g., Regional Manager sees multiple BUs)
