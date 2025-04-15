// src/services/registration.service.js
import api from '../utils/api';
import exhibitorService from './exhibitor.service';

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
      // Enrich with exhibitor data
      const enriched = await this.enrichRegistrationsWithExhibitorData([response.data]);
      return enriched[0];
    } catch (error) {
      this._handleError(error, `Failed to fetch registration ${id}`);
      throw error;
    }
  }

  /**
   * Find registrations by event ID with exhibitor details
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} List of registrations with exhibitor details
   */
  async findByEvent(eventId) {
    try {
      const response = await api.get(`/registrations/event/${eventId}`);
      
      // Enhance the registrations with exhibitor data
      const enhancedRegistrations = await Promise.all(response.data.map(async (registration) => {
        // If exhibitor field contains a User ID instead of Exhibitor ID
        if (registration.exhibitor) {
          // Treat exhibitor as a User ID and fetch exhibitor data
          const userId = typeof registration.exhibitor === 'object' 
            ? registration.exhibitor._id 
            : registration.exhibitor;
          
          try {
            // Get exhibitor by user ID
            const exhibitorData = await exhibitorService.getByUserId(userId);
            if (exhibitorData) {
              registration.exhibitor = exhibitorData;
            }
          } catch (error) {
            console.error(`Failed to get exhibitor data for user ID ${userId}`, error);
          }
        }
        
        return registration;
      }));
      
      return enhancedRegistrations;
    } catch (error) {
      this._handleError(error, `Failed to fetch registrations for event ${eventId}`);
      return [];
    }
  }

  /**
   * Enrich registration data with exhibitor and company information
   * @param {Array} registrations - Raw registration data
   * @returns {Promise<Array>} Enhanced registrations with full exhibitor data
   */
  async enrichRegistrationsWithExhibitorData(registrations) {
    if (!registrations || !registrations.length) return [];
    
    // Process each registration to get exhibitor details
    const enrichedRegistrations = await Promise.all(registrations.map(async (registration) => {
      // Skip if no user ID is available
      if (!registration.exhibitor) return registration;
      
      // Get the user ID from registration
      const userId = typeof registration.exhibitor === 'object' 
        ? registration.exhibitor._id 
        : registration.exhibitor;
      
      if (!userId) return registration;
      
      try {
        // Get exhibitor data by user ID
        const exhibitorData = await exhibitorService.getByUserId(userId);
        
        if (exhibitorData) {
          // Replace the user reference with full exhibitor data
          registration.exhibitor = exhibitorData;
        }
      } catch (error) {
        console.error(`Failed to fetch exhibitor data for user ${userId}:`, error.message);
      }
      
      return registration;
    }));
    
    return enrichedRegistrations;
  }

  /**
   * Get official exhibitors for an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} List of official exhibitors
   */
  async getEventExhibitors(eventId) {
    try {
      const response = await api.get(`/registrations/event/${eventId}/exhibitors`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Failed to fetch exhibitors for event ${eventId}`);
      return [];
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
   * Review a registration (approve or reject)
   * @param {string} id - Registration ID
   * @param {Object} reviewData - Review data object
   * @returns {Promise<Object>} Updated registration
   */
  async reviewRegistration(id, reviewData) {
    try {
      const response = await api.post(`/registrations/${id}/review`, {
        status: reviewData.status,
        reason: reviewData.reason
      });
      return response.data;
    } catch (error) {
      this._handleError(error, `Failed to ${reviewData.status} registration`);
      throw error;
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