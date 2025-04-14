// src/constants/registrationConstants.js
export const RegistrationStatus = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  };
  
  export const getStatusColorScheme = (status) => {
    switch (status) {
      case RegistrationStatus.PENDING:
        return 'yellow';
      case RegistrationStatus.APPROVED:
        return 'green';
      case RegistrationStatus.REJECTED:
        return 'red';
      case RegistrationStatus.COMPLETED:
        return 'blue';
      case RegistrationStatus.CANCELLED:
        return 'gray';
      default:
        return 'gray';
    }
  };
  
  export const getStatusDisplayText = (status) => {
    switch (status) {
      case RegistrationStatus.PENDING:
        return 'Pending';
      case RegistrationStatus.APPROVED:
        return 'Approved';
      case RegistrationStatus.REJECTED:
        return 'Rejected';
      case RegistrationStatus.COMPLETED:
        return 'Completed';
      case RegistrationStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };