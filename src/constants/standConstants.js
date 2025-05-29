// src/constants/standConstants.js

/**
 * Possible statuses for a stand
 */
export const StandStatus = {
    AVAILABLE: 'available',
    RESERVED: 'reserved',
    UNAVAILABLE: 'unavailable'
  };
  

  /**
   * Types of stands
   */
  export const StandType = {
    STANDARD: 'standard',
    PREMIUM: 'premium',
    CORNER: 'corner',
    CUSTOM: 'custom'
  };
  
  export const PREMIUM_PRICES = [400, 600, 700, 800];
  
  /**
   * Get color scheme based on stand status
   * @param {string} status - Stand status
   * @returns {string} - Chakra UI color scheme
   */
  export const getStatusColorScheme = (status) => {
    switch (status) {
      case StandStatus.AVAILABLE:
        return 'green';
      case StandStatus.RESERVED:
        return 'blue';
      case StandStatus.UNAVAILABLE:
        return 'red';
      default:
        return 'gray';
    }
  };
  
  /**
   * Get color scheme based on stand type
   * @param {string} type - Stand type
   * @returns {string} - Chakra UI color scheme
   */
  export const getTypeColorScheme = (type) => {
    switch (type) {
      case StandType.STANDARD:
        return 'blue';
      case StandType.PREMIUM:
        return 'purple';
      case StandType.CORNER:
        return 'orange';
      case StandType.CUSTOM:
        return 'pink';
      default:
        return 'gray';
    }
  };