// src/services/organizer.service.js
import api from '../utils/api';

class OrganizerService {
  /**
   * Get organizer details by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Organizer data
   */
  async getByUserId(userId) {
    try {
      const response = await api.get(`/organizer/user/${userId}`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to fetch organizer details');
      return null;
    }
  }

  /**
   * Get organizer by ID
   * @param {string} id - Organizer ID
   * @returns {Promise<Object>} Organizer data
   */
  async getById(id) {
    try {
      const response = await api.get(`/organizer/${id}`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Failed to fetch organizer ${id}`);
      return null;
    }
  }

  /**
   * Handle errors consistently
   * @private
   * @param {Error} error - Error object
   * @param {string} defaultMessage - Default error message
   */
  _handleError(error, defaultMessage) {
    console.error(`${defaultMessage}:`, error);
    
    let errorMessage = defaultMessage;
    
    if (error.response) {
      if (error.response.status === 403) {
        errorMessage = "You don't have permission to perform this action";
      } else if (error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          if (Array.isArray(error.response.data.message)) {
            errorMessage = error.response.data.message.join(', ');
          } else {
            errorMessage = error.response.data.message;
          }
        }
      }
    }
    
    return errorMessage;
  }
}

const organizerService = new OrganizerService();
export default organizerService;