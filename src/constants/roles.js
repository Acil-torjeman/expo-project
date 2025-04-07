// src/constants/roles.js

/**
 * Enum for user roles that matches the backend definitions
 * @type {Object}
 */
export const UserRole = {
  ADMIN: 'admin',       // System administrator
  ORGANIZER: 'organizer', // Event organizer
  EXHIBITOR: 'exhibitor', // Exhibitor
};

/**
 * Enum for user status that matches the backend definitions
 * @type {Object}
 */
export const UserStatus = {
  PENDING: 'pending',   // Awaiting activation/verification
  ACTIVE: 'active',     // Active and usable account
  INACTIVE: 'inactive', // Temporarily deactivated account
  REJECTED: 'rejected', // Account rejected by administrator
  DELETED: 'deleted',   // Account in trash
};

/**
 * Get color scheme for a user status
 * @param {string} status - The user status
 * @returns {string} - Chakra UI color scheme name
 */
export const getStatusColorScheme = (status) => {
  switch (status) {
    case UserStatus.ACTIVE:
      return 'green';
    case UserStatus.PENDING:
      return 'yellow';
    case UserStatus.INACTIVE:
      return 'gray';
    case UserStatus.REJECTED:
      return 'red';
    case UserStatus.DELETED:
      return 'red';
    default:
      return 'gray';
  }
};

/**
 * Get color scheme for a user role
 * @param {string} role - The user role
 * @returns {string} - Chakra UI color scheme name
 */
export const getRoleColorScheme = (role) => {
  switch (role) {
    case UserRole.ADMIN:
      return 'purple';
    case UserRole.ORGANIZER:
      return 'blue';
    case UserRole.EXHIBITOR:
      return 'orange';
    default:
      return 'gray';
  }
};

/**
 * Check if a role has specific permissions
 * @param {string} role - The user role to check
 * @param {string} permission - The permission to check for
 * @returns {boolean} - Whether the role has the permission
 */
export const hasPermission = (role, permission) => {
  // Admin has all permissions
  if (role === UserRole.ADMIN) return true;
  
  // Define permission map for different roles
  const permissionMap = {
    [UserRole.ORGANIZER]: [
      'manage_events',
      'manage_exhibitors',
      'manage_registrations',
      'view_messages',
      'view_notifications',
    ],
    [UserRole.EXHIBITOR]: [
      'view_events',
      'manage_stands',
      'view_registrations',
      'view_messages',
      'view_notifications',
    ],
  };
  
  // Check if role exists in map and has the permission
  return permissionMap[role] ? permissionMap[role].includes(permission) : false;
};