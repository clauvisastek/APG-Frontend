// Custom claim namespace for Auth0 roles
const ROLES_CLAIM = 'https://apg-astek.com/roles';

/**
 * Extract roles from Auth0 user object
 */
export function getUserRoles(user: any): string[] {
  if (!user) return [];
  
  const roles = user[ROLES_CLAIM];
  
  if (Array.isArray(roles)) {
    return roles.map(role => role.toLowerCase());
  }
  
  return [];
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: any, role: string): boolean {
  const roles = getUserRoles(user);
  return roles.includes(role.toLowerCase());
}

/**
 * Check if user has at least one of the specified roles
 */
export function hasAnyRole(user: any, requiredRoles: string[]): boolean {
  const userRoles = getUserRoles(user);
  return requiredRoles.some(role => userRoles.includes(role.toLowerCase()));
}

/**
 * Check if user has manage rights (Admin, CFO, or any BU-* role)
 */
export function hasManageRights(userRoles: string[]): boolean {
  return userRoles.some(role => {
    const lowerRole = role.toLowerCase();
    return lowerRole === 'admin' || lowerRole === 'cfo' || lowerRole.startsWith('bu-');
  });
}

/**
 * Get user roles as an array of strings
 */
export function getRolesArray(user: any): string[] {
  return getUserRoles(user);
}
