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
      // Use the my-registrations endpoint specifically for exhibitors
      const response = await api.get('/registrations/my-registrations');
      
      // Process the response to ensure it includes all necessary data
      if (Array.isArray(response.data)) {
        // Ensure each registration has event and exhibitor details loaded
        const enhancedRegistrations = await Promise.all(response.data.map(async (registration) => {
          // If registration already has populated fields, return as is
          if (registration.event && typeof registration.event === 'object' && 
              registration.exhibitor && typeof registration.exhibitor === 'object') {
            return registration;
          }
          
          // Otherwise, fetch complete registration details
          try {
            const fullRegistration = await this.getRegistrationById(registration._id);
            return fullRegistration;
          } catch (error) {
            console.error(`Failed to fetch details for registration ${registration._id}:`, error);
            return registration;
          }
        }));
        
        return enhancedRegistrations;
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch your registrations:', error);
      // Return empty array instead of throwing to avoid breaking UI
      return [];
    }
  }

  /**
   * Check registration status directly for a specific event
   * This is a direct API call, more reliable than client-side filtering
   * @param {string} eventId - Event ID to check registration for
   * @returns {Promise<Object>} Registration status object with 'registered' flag
   */
  async checkEventRegistration(eventId) {
    try {
      console.log(`Checking registration status for event: ${eventId}`);
      const response = await api.get(`/registrations/check/${eventId}`);
      return response.data;
    } catch (error) {
      console.error(`Error checking registration status: ${error}`);
      // In case of error, assume not registered for safety
      return { registered: false, registration: null };
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
      
      // Ensure full population of exhibitor and event data
      if (response.data) {
        // If exhibitor isn't fully populated, enrich it
        if (response.data.exhibitor && typeof response.data.exhibitor !== 'object') {
          const enrichedRegs = await this.enrichRegistrationsWithExhibitorData([response.data]);
          return enrichedRegs[0];
        }
        
        // Otherwise return as is
        return response.data;
      }
      
      throw new Error(`Registration with ID ${id} not found`);
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
      const enhancedRegistrations = await this.enrichRegistrationsWithExhibitorData(response.data);
      
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
      // Skip if no exhibitor ID is available
      if (!registration.exhibitor) return registration;
      
      // Get the exhibitor ID from registration
      const exhibitorId = typeof registration.exhibitor === 'object' 
        ? registration.exhibitor._id 
        : registration.exhibitor;
      
      if (!exhibitorId) return registration;
      
      try {
        // Get exhibitor data by ID
        const exhibitorData = await exhibitorService.getById(exhibitorId);
        
        if (exhibitorData) {
          // Replace the exhibitor reference with full exhibitor data
          registration.exhibitor = exhibitorData;
        }
      } catch (error) {
        console.error(`Failed to fetch exhibitor data for ID ${exhibitorId}:`, error.message);
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