// src/constants/registrationConstants.js

/**
 * Enum for registration status
 */
export const RegistrationStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

/**
 * Get the appropriate color scheme for a registration status
 * @param {string} status - Registration status
 * @returns {string} Chakra UI color scheme
 */
export const getStatusColorScheme = (status) => {
  switch(status) {
    case RegistrationStatus.PENDING:
      return 'yellow';
    case RegistrationStatus.APPROVED:
      return 'green';
    case RegistrationStatus.REJECTED:
      return 'red';
    case RegistrationStatus.CANCELLED:
      return 'gray';
    case RegistrationStatus.COMPLETED:
      return 'blue';
    default:
      return 'gray';
  }
};

/**
 * Get the display text for a registration status
 * @param {string} status - Registration status
 * @returns {string} Human-readable status text
 */
export const getStatusDisplayText = (status) => {
  switch(status) {
    case RegistrationStatus.PENDING:
      return 'Pending';
    case RegistrationStatus.APPROVED:
      return 'Approved';
    case RegistrationStatus.REJECTED:
      return 'Rejected';
    case RegistrationStatus.CANCELLED:
      return 'Cancelled';
    case RegistrationStatus.COMPLETED:
      return 'Completed';
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
  }
};