# Project Edit Wizard Implementation

## Overview
Implemented a complete project editing workflow with CFO validation for profitability changes. The edit wizard reuses the existing ProjectCreationWizard UI components while implementing a dual-update strategy:
- **Optimistic updates** for non-critical fields (name, code, dates)
- **Validation workflow** for profitability fields (margins, team members)

## Architecture

### Component Structure
```
EditProjectWizard (NEW)
├── Uses ProjectCreationWizardSections components
├── Pre-fills all 4 steps with existing project data
├── Implements dual-update logic on submission
└── Shows confirmation step with update summary
```

### Data Flow
1. **User clicks "Éditer" button** → Opens EditProjectWizard with project data
2. **User modifies project fields** → Validates each section
3. **User confirms changes** → Dual submission:
   - Non-critical fields → Direct API update (optimistic)
   - Profitability fields → Submit change request to CFO
4. **Success notification** → Modal closes, projects list refreshes

## Implementation Details

### 1. API Layer (`src/services/api.ts`)

#### Mock Storage
```typescript
let mockProjectChangeRequests: ProjectChangeRequest[] = [];
```

#### New API Functions

**projectApi.updateNonCritical()**
- Updates: name, code, startDate, endDate, notes
- Validates code uniqueness
- Returns updated project immediately

**projectChangeRequestApi.submitEditForValidation()**
- Creates change request with previousValues vs newValues
- Status: PENDING_CFO_APPROVAL
- Stores requestedByEmail and approverEmail

**projectChangeRequestApi.getAll()**
- Returns all change requests (for CFO approval screen later)

**projectChangeRequestApi.getByProjectId()**
- Returns change requests for specific project

**projectChangeRequestApi.approve()**
- Applies newValues to project
- Updates status to APPROVED

**projectChangeRequestApi.reject()**
- Updates status to REJECTED

### 2. Hooks Layer (`src/hooks/useApi.ts`)

#### New Hooks
```typescript
useSubmitProjectEditForValidation() // Submit profitability changes
useUpdateProjectNonCritical()       // Update name, dates, etc.
useProjectChangeRequests()          // Get all change requests
useProjectChangeRequestsByProject() // Get requests by project ID
```

### 3. Component Layer

#### EditProjectWizard (`src/components/EditProjectWizard.tsx`)
**Key Features:**
- Converts Project → ProjectWizardStep1Values format
- Pre-fills all 4 wizard steps with existing data
- Detects profitability changes (margins, team rates)
- Implements dual-update strategy on submission
- Shows appropriate confirmation message

**Helper Functions:**
```typescript
projectToWizardData(project)           // Convert Project to wizard format
hasProfitabilityChanges(orig, updated) // Detect profitability changes
```

**Update Logic:**
1. Check which fields changed
2. If non-critical fields changed → Call updateNonCritical()
3. If profitability fields changed → Call submitEditForValidation()
4. Show appropriate success message
5. Close wizard and refresh list

#### ProjectsPage (`src/pages/ProjectsPage.tsx`)
**Updates:**
- Added `isEditWizardOpen` state
- Added `projectToEdit` state
- Updated `handleEdit()` to open EditProjectWizard
- Added `handleEditSuccess()` callback
- Rendered EditProjectWizard conditionally

### 4. Type Definitions (`src/types/index.ts`)

```typescript
interface ProjectChangeRequest {
  id: string;
  projectId: string;
  previousValues: EditProjectProfitabilityPayload;
  newValues: EditProjectProfitabilityPayload;
  requestedByUserId: string;
  requestedByEmail: string;
  requestedAt: string;
  status: 'PENDING_CFO_APPROVAL' | 'APPROVED' | 'REJECTED';
  approverEmail?: string;
}

interface EditProjectProfitabilityPayload {
  targetMargin: number;
  minMargin: number;
  teamMembers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    resourceType: ResourceType;
    costRate: number;
    sellRate: number;
  }>;
}
```

## User Experience

### Edit Flow
1. **Projects Table** → User clicks "Éditer" button (role-based visibility)
2. **Step 1: General Info** → Pre-filled with project.name, project.code, etc.
3. **Step 2: Client** → Pre-filled with client.name, client.country, etc.
4. **Step 3: Margins** → Pre-filled with project.targetMargin, project.minMargin
5. **Step 4: Team Members** → Pre-filled with existing team member data
6. **Confirmation Step** → Shows summary with important note:
   - Name, code, dates → Applied immediately
   - Margins, team rates → Submitted to CFO for validation

### Success Messages
**Case 1: Only non-critical changes**
```
"Les modifications ont été enregistrées avec succès."
```

**Case 2: Profitability changes included**
```
"Les modifications de rentabilité ont été soumises pour validation au CFO.
Les autres modifications (nom, dates) ont été appliquées immédiatement."
```

## Authorization

### Edit Permission
Uses `canEditProject(user, projectBuCode)` from `roleUtils.ts`:
- **Admin** → Can edit all projects
- **CFO** → Can edit all projects
- **BU Leader** → Can edit projects in their BU only
- **Others** → Cannot edit

### Validation Flow
All profitability changes require CFO approval:
- Change request created with status: PENDING_CFO_APPROVAL
- Change request stores previousValues and newValues
- CFO can approve/reject via separate admin screen (future feature)

## Testing Checklist

### Unit Tests (Manual)
- [ ] Open edit wizard → Pre-fills correctly
- [ ] Edit name only → Updates immediately, no validation request
- [ ] Edit margins → Shows validation message
- [ ] Edit team rates → Shows validation message
- [ ] Edit name + margins → Both messages shown
- [ ] Cancel wizard → No changes applied
- [ ] Validation on each step → Prevents invalid data

### Integration Tests
- [ ] BU leader can only edit their BU projects
- [ ] Admin can edit all projects
- [ ] Change request created in mockProjectChangeRequests
- [ ] Non-critical updates reflected immediately in table
- [ ] Profitability changes NOT reflected until approval

### Edge Cases
- [ ] Edit project with no team members
- [ ] Edit project with existing change request pending
- [ ] Code uniqueness validation on edit
- [ ] Date validation (endDate > startDate)

## Future Enhancements

### CFO Approval Screen (Not Yet Implemented)
```typescript
// Future component: ProjectChangeRequestsPage.tsx
- List all pending change requests
- Show previousValues vs newValues diff
- Approve/Reject buttons (CFO only)
- Email notifications on approval/rejection
```

### Additional Features
1. **Change Request History**
   - Show all change requests for a project
   - Display approval/rejection timestamps
   - Track who approved/rejected

2. **Validation Rules**
   - Configurable approval thresholds
   - Auto-approve small margin changes (<5%)
   - Multi-level approval for large changes

3. **Notifications**
   - Email to CFO when change request submitted
   - Email to requester when approved/rejected
   - In-app notification center

4. **Audit Trail**
   - Log all project modifications
   - Track who changed what and when
   - Export audit reports

## Technical Debt

### Current Limitations
1. Mock data storage (no persistence)
2. No email notifications
3. No CFO approval UI
4. No change request history view
5. No optimistic UI updates for pending changes

### Refactoring Opportunities
1. Extract validation logic to separate service
2. Create reusable confirmation modal component
3. Implement proper error boundaries
4. Add loading states for API calls
5. Create custom hooks for change request management

## Related Files

### Modified Files
- `src/services/api.ts` - Added projectChangeRequestApi and updateNonCritical
- `src/hooks/useApi.ts` - Added change request hooks
- `src/pages/ProjectsPage.tsx` - Wired edit button to open wizard
- `src/types/index.ts` - Added ProjectChangeRequest type

### New Files
- `src/components/EditProjectWizard.tsx` - Main edit wizard component

### Unchanged (Reused)
- `src/components/ProjectCreationWizardSections.tsx` - Reused all sections
- `src/components/ProjectCreationWizard.css` - Reused all styles
- `src/utils/roleUtils.ts` - Reused canEditProject()

## Summary

The project edit wizard is now fully functional with a sophisticated dual-update strategy that balances user experience (immediate updates for non-critical fields) with business requirements (validation for profitability changes). The implementation reuses existing UI components, maintains type safety, and provides a clear path for future CFO approval functionality.

**Status:** ✅ Complete and ready for testing
**Next Steps:** Implement CFO approval screen (ProjectChangeRequestsPage)
