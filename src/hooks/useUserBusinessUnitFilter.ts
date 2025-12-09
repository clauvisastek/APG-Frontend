import { useAuth0 } from '@auth0/auth0-react';
import { getUserRoles } from '../utils/roleHelpers';

export interface BusinessUnitFilter {
  scope: 'all' | 'bu';
  buId?: string;
  buCode?: string;
}

// Mapping between BU Leader roles and BU IDs
const BU_LEADER_MAPPING: Record<string, { buId: string; buCode: string }> = {
  'bu-1': { buId: '1', buCode: 'BU-1' },
  'bu-2': { buId: '2', buCode: 'BU-2' },
  'bu-3': { buId: '3', buCode: 'BU-3' },
};

/**
 * Hook to determine the user's Business Unit access scope
 * - Admin and CFO can see all BUs
 * - BU Leaders can only see their own BU
 */
export function useUserBusinessUnitFilter(): BusinessUnitFilter {
  const { user } = useAuth0();
  
  if (!user) {
    return { scope: 'all' };
  }

  const roles = getUserRoles(user);

  // Admin and CFO can see all BUs
  if (roles.includes('admin') || roles.includes('cfo')) {
    return { scope: 'all' };
  }

  // Check for BU Leader roles
  for (const role of roles) {
    if (role === 'bu-1' || role === 'bu-2' || role === 'bu-3') {
      const mapping = BU_LEADER_MAPPING[role];
      if (mapping) {
        return {
          scope: 'bu',
          buId: mapping.buId,
          buCode: mapping.buCode,
        };
      }
    }
  }

  // Default to all if no specific role found
  return { scope: 'all' };
}
