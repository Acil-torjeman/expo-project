// src/services/exhibitor.service.js
import api from '../utils/api';

class ExhibitorService {
  /**
   * Get exhibitor by user ID
   */
  async getByUserId(userId) {
    try {
      const response = await api.get(`/exhibitor/user/${userId}`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to fetch exhibitor profile');
      throw error;
    }
  }

  /**
   * Get current exhibitor profile
   */
  async getCurrentExhibitor() {
    try {
      // We can use the current user's ID from the JWT token
      const response = await api.get('/exhibitor/current');
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to fetch your exhibitor profile');
      throw error;
    }
  }

  /**
   * Handle errors consistently
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
    
    throw new Error(errorMessage);
  }
}

const exhibitorService = new ExhibitorService();
export default exhibitorService;