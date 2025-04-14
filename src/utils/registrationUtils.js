/**
 * Sort registrations by date (newest first)
 * @param {Array} registrations - Array of registration objects
 * @returns {Array} Sorted registrations
 */
export const sortRegistrationsByDate = (registrations) => {
    return [...registrations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };
  
  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @param {boolean} includeTime - Whether to include time in the formatted date
   * @returns {string} Formatted date string
   */
  export const formatRegistrationDate = (dateString, includeTime = false) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    
    if (includeTime) {
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };