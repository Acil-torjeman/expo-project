// src/services/registration.service.js
import api from '../utils/api';

class RegistrationService {
  /**
   * Register for an event - initial pre-registration
   * @param {Object} data - Registration data
   * @returns {Promise<Object>} Registration response
   */
  async registerForEvent(data) {
    try {
      const response = await api.post('/registrations', {
        eventId: data.eventId,
        participationNote: data.participationNote || ''
      });
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to register for event');
      throw error;
    }
  }

  /**
   * Get all registrations for the current exhibitor
   * @returns {Promise<Array>} List of registrations
   */
  async getMyRegistrations() {
    try {
      const response = await api.get('/registrations/my-registrations');
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to fetch your registrations');
      return [];
    }
  }

  /**
   * Get registration by ID
   * @param {string} id - Registration ID
   * @returns {Promise<Object>} Registration details
   */
  async getRegistrationById(id) {
    try {
      const response = await api.get(`/registrations/${id}`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Failed to fetch registration ${id}`);
      throw error;
    }
  }

  /**
   * Update registration's participation note
   * @param {string} id - Registration ID
   * @param {string} participationNote - Updated note
   * @returns {Promise<Object>} Updated registration
   */
  async updateParticipationNote(id, participationNote) {
    try {
      const response = await api.patch(`/registrations/${id}`, {
        participationNote
      });
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to update participation note');
      throw error;
    }
  }

  /**
   * Select stands for a registration
   * @param {string} id - Registration ID
   * @param {Object} data - Stand selection data
   * @returns {Promise<Object>} Updated registration
   */
  async selectStands(id, data) {
    try {
      const response = await api.post(`/registrations/${id}/select-stands`, data);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to select stands');
      throw error;
    }
  }

  /**
   * Select equipment for a registration
   * @param {string} id - Registration ID
   * @param {Object} data - Equipment selection data
   * @returns {Promise<Object>} Updated registration
   */
  async selectEquipment(id, data) {
    try {
      const response = await api.post(`/registrations/${id}/select-equipment`, data);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to select equipment');
      throw error;
    }
  }

  /**
   * Cancel a registration
   * @param {string} id - Registration ID
   * @returns {Promise<Object>} Cancelled registration
   */
  async cancelRegistration(id) {
    try {
      const response = await api.post(`/registrations/${id}/cancel`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to cancel registration');
      throw error;
    }
  }

  /**
   * Get official exhibitors for an event (completed registrations)
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} List of official exhibitors
   */
  async getEventExhibitors(eventId) {
    try {
      // Use the new simpler endpoint
      const response = await api.get(`/registrations/event/${eventId}/exhibitors`);
      return response.data;
    } catch (error) {
      // Try the old endpoint as fallback
      try {
        const fallbackResponse = await api.get(`/registrations/event/${eventId}/official`);
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error(`Failed to fetch exhibitors for event ${eventId}:`, error);
        return [];
      }
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
    
    throw new Error(errorMessage);
  }
}

const registrationService = new RegistrationService();
export default registrationService;