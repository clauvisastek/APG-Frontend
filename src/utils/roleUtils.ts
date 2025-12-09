import { User } from '@auth0/auth0-react';
import { getUserRoles } from './roleHelpers';

const ROLES_CLAIM = 'https://apg-astek.com/roles';

export interface RoleAccess {
  isAdminOrCfo: boolean;
  allowedBuCodes: string[];
}

/**
 * Extract Business Unit codes from Auth0 user roles
 * Returns empty array if user has Admin or CFO role (= no BU restriction)
 * Otherwise returns array of BU codes (e.g. ["BU-1", "BU-2"])
 */
export function getUserBusinessUnitCodes(user?: User): string[] {
  if (!user) return [];

  const roles = (user[ROLES_CLAIM] as string[]) ?? [];

  const hasAdminAccess = roles.includes('Admin') || roles.includes('CFO');
  if (hasAdminAccess) {
    return []; // empty array === no BU restriction
  }

  return roles.filter(r => r.startsWith('BU-'));
}

/**
 * Check if user has Admin or CFO role
 */
export function hasRole(user: any, role: 'Admin' | 'CFO'): boolean {
  if (!user) return false;
  const roles = (user[ROLES_CLAIM] as string[]) ?? [];
  return roles.includes(role);
}

/**
 * Check if user has at least one BU role
 */
export function hasAnyBuRole(user: any): boolean {
  if (!user) return false;
  const roles = (user[ROLES_CLAIM] as string[]) ?? [];
  return roles.some(r => r.startsWith('BU-'));
}

/**
 * Check if user can edit/delete a project
 * Rules: Admin, CFO, or has matching BU role
 */
export function canEditProject(user: any, projectBuCode: string): boolean {
  if (!user) return false;
  
  // Admin or CFO can edit any project
  if (hasRole(user, 'Admin') || hasRole(user, 'CFO')) {
    return true;
  }
  
  // User with BU role can edit if their BU matches project BU
  if (hasAnyBuRole(user)) {
    const userBuCodes = getUserBusinessUnitCodes(user);
    return userBuCodes.includes(projectBuCode);
  }
  
  return false;
}

/**
 * Extract Auth0 user roles and determine access level
 * Returns:
 * - isAdminOrCfo: true if user has Admin or CFO role
 * - allowedBuCodes: array of BU codes the user can access (e.g., ["BU-1"])
 */
export function getRoleAccess(user: any): RoleAccess {
  if (!user) {
    return {
      isAdminOrCfo: false,
      allowedBuCodes: [],
    };
  }

  const roles = getUserRoles(user);

  // Check if user is Admin or CFO
  const isAdminOrCfo = roles.includes('admin') || roles.includes('cfo');

  // If Admin or CFO, return empty array (means access to all)
  if (isAdminOrCfo) {
    return {
      isAdminOrCfo: true,
      allowedBuCodes: [],
    };
  }

  // Extract BU codes from roles (BU-1, BU-2, BU-3)
  const allowedBuCodes: string[] = [];
  
  for (const role of roles) {
    // Match exact BU codes: BU-1, BU-2, BU-3
    if (role === 'bu-1') {
      allowedBuCodes.push('BU-1');
    } else if (role === 'bu-2') {
      allowedBuCodes.push('BU-2');
    } else if (role === 'bu-3') {
      allowedBuCodes.push('BU-3');
    }
  }

  return {
    isAdminOrCfo: false,
    allowedBuCodes,
  };
}

/**
 * Check if a Business Unit code is allowed for the current user
 */
export function isBuCodeAllowed(buCode: string, roleAccess: RoleAccess): boolean {
  // Admin and CFO can see all BUs
  if (roleAccess.isAdminOrCfo) {
    return true;
  }
  
  // Check if BU code is in allowed list
  return roleAccess.allowedBuCodes.includes(buCode);
}

/**
 * Filter items by Business Unit code based on user's role access
 */
export function filterByBuCode<T extends { businessUnitCode?: string }>(
  items: T[],
  roleAccess: RoleAccess
): T[] {
  // Admin and CFO see all items
  if (roleAccess.isAdminOrCfo) {
    return items;
  }

  // Filter by allowed BU codes
  return items.filter(item => {
    if (!item.businessUnitCode) {
      return false;
    }
    return roleAccess.allowedBuCodes.includes(item.businessUnitCode);
  });
}
