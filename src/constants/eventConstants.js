// src/constants/eventConstants.js

/**
 * Enum for event statuses
 */
export const EventStatus = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed'
  };
  
  /**
   * Enum for event visibility
   */
  export const EventVisibility = {
    PUBLIC: 'public',
    PRIVATE: 'private'
  };
  
  /**
   * Get color scheme for event status
   * @param {string} status - The event status
   * @returns {string} - Chakra UI color scheme name
   */
  export const getStatusColorScheme = (status) => {
    switch (status) {
      case EventStatus.PUBLISHED:
        return 'green';
      case EventStatus.DRAFT:
        return 'yellow';
      case EventStatus.CANCELLED:
        return 'red';
      case EventStatus.COMPLETED:
        return 'blue';
      default:
        return 'gray';
    }
  };
  
  /**
   * Get status display text
   * @param {string} status - The event status
   * @returns {string} - User-friendly status text
   */
  export const getStatusDisplayText = (status) => {
    switch (status) {
      case EventStatus.PUBLISHED:
        return 'Published';
      case EventStatus.DRAFT:
        return 'Draft';
      case EventStatus.CANCELLED:
        return 'Cancelled';
      case EventStatus.COMPLETED:
        return 'Completed';
      default:
        return 'Unknown';
    }
  };
  
  /**
   * Industry sectors and subsectors for event categorization
   */

  
  /**
   * Get all sectors as an array for dropdown menus
   */
  export const getAllSectors = () => {
    return Object.entries(IndustrySectors).map(([key, value]) => ({
      id: key,
      name: value.name
    }));
  };
  
  /**
   * Get all subsectors for a given sector
   * @param {string} sectorId - The sector ID
   * @returns {Array} - Array of subsector names
   */
  export const getSubsectors = (sectorId) => {
    if (sectorId && IndustrySectors[sectorId]) {
      return IndustrySectors[sectorId].subsectors;
    }
    return [];
  };
  
  /**
   * Get all subsectors as a flat array
   * @returns {Array} - Array of all subsector names
   */
  export const getAllSubsectors = () => {
    const allSubsectors = [];
    Object.values(IndustrySectors).forEach(sector => {
      allSubsectors.push(...sector.subsectors);
    });
    return [...new Set(allSubsectors)]; // Remove duplicates
  };