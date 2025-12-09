/**
 * Extract two-letter initials from user identity
 * @param user - Auth0 user object with name and/or email
 * @returns Two-letter initials in uppercase (e.g., "CK" for "Clauvis Kitieu")
 */
export function getUserInitials(user?: { name?: string; email?: string }): string {
  if (!user) return '??';

  // Try to get initials from name first
  if (user.name) {
    const nameParts = user.name.trim().split(/\s+/).filter(p => p.length > 0);
    
    if (nameParts.length >= 2) {
      // First letter of first name + first letter of last name
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    
    // Single name - take first two letters if available
    if (nameParts[0].length >= 2) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    
    // Single letter name - duplicate it
    return (nameParts[0][0] + nameParts[0][0]).toUpperCase();
  }

  // Fallback to email
  if (user.email) {
    const emailPrefix = user.email.split('@')[0];
    const parts = emailPrefix.split(/[._-]/).filter(p => p.length > 0);
    
    if (parts.length >= 2) {
      // e.g., "clauvis.kitieu" -> "CK"
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    
    // Single part - take first two letters
    if (parts[0].length >= 2) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    
    // Single letter - duplicate it
    return (parts[0][0] + parts[0][0]).toUpperCase();
  }

  return '??';
}
