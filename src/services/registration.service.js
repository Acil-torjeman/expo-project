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
   * Find registrations by event ID with full exhibitor details
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} List of registrations for the event
   */
  async findByEvent(eventId) {
    try {
      const response = await api.get(`/registrations/event/${eventId}`);
      // Process registrations to ensure exhibitor data is complete
      const processed = await this.processRegistrations(response.data);
      return processed;
    } catch (error) {
      this._handleError(error, `Failed to fetch registrations for event ${eventId}`);
      return [];
    }
  }
  
   /**
   * Process registrations to ensure complete exhibitor and company data
   * This will fetch any missing exhibitor/company details
   */
   async processRegistrations(registrations) {
    if (!registrations || !registrations.length) return [];
    
    // Create a map to track which exhibitors we need to fetch
    const exhibitorsToFetch = new Map();
    
    // Mark registrations that need exhibitor details fetched
    registrations.forEach(reg => {
      // Check if exhibitor is just an ID or doesn't have company details
      if (reg.exhibitor) {
        if (typeof reg.exhibitor === 'string' || 
            !reg.exhibitor.company || 
            typeof reg.exhibitor.company === 'string') {
          
          // Store the exhibitor ID and the registration index
          const exhibitorId = typeof reg.exhibitor === 'string' ? 
            reg.exhibitor : reg.exhibitor._id;
            
          if (exhibitorId) {
            exhibitorsToFetch.set(exhibitorId, true);
          }
        }
      }
    });
    
    // If we have exhibitors to fetch, get their details
    if (exhibitorsToFetch.size > 0) {
      const exhibitorPromises = Array.from(exhibitorsToFetch.keys()).map(id => 
        exhibitorService.getById(id).catch(() => null)
      );
      
      const exhibitors = await Promise.all(exhibitorPromises);
      
      // Create a map of exhibitor IDs to their full details
      const exhibitorMap = new Map();
      exhibitors.forEach(exhibitor => {
        if (exhibitor && exhibitor._id) {
          exhibitorMap.set(exhibitor._id.toString(), exhibitor);
        }
      });
      
      // Update registrations with full exhibitor details
      registrations = registrations.map(reg => {
        if (reg.exhibitor) {
          const exhibitorId = typeof reg.exhibitor === 'string' ? 
            reg.exhibitor : reg.exhibitor._id;
            
          if (exhibitorId && exhibitorMap.has(exhibitorId.toString())) {
            reg.exhibitor = exhibitorMap.get(exhibitorId.toString());
          }
        }
        return reg;
      });
    }
    
    return registrations;
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