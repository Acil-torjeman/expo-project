// src/services/event.service.js
import api from '../utils/api';

class EventService {
  /**
   * Get all events with optional filters
   * @param {string} search - Optional search term
   * @param {string} status - Optional status filter
   * @param {boolean} upcoming - Optional filter for upcoming events
   * @returns {Promise<Array>} Events array
   */
  async getEvents(search = '', status = '', upcoming = false) {
    try {
      let url = '/events?';
      
      if (search) {
        url += `search=${encodeURIComponent(search)}&`;
      }
      
      if (status) {
        url += `status=${encodeURIComponent(status)}&`;
      }
      
      if (upcoming) {
        url += `upcoming=true&`;
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error fetching events');
      return [];
    }
  }

  /**
   * Get events for the current organizer
   * @param {string} organizerId - Organizer ID
   * @returns {Promise<Array>} Events array
   */
  async getOrganizerEvents(organizerId) {
    try {
      const response = await api.get(`/events/organizer/${organizerId}`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error fetching organizer events');
      return [];
    }
  }

  /**
   * Get event by ID
   * @param {string} id - Event ID
   * @returns {Promise<Object>} Event object
   */
  async getEventById(id) {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Error fetching event ${id}`);
      throw error;
    }
  }

  /**
   * Create a new event with optional image
   * @param {Object} eventData - Event data to create
   * @param {File} imageFile - Optional image file
   * @returns {Promise<Object>} Created event
   */
  async createEvent(eventData, imageFile = null) {
    try {
      // First create the event
      const response = await api.post('/events', eventData);
      const createdEvent = response.data;
      
      // If image file is provided, upload it
      if (imageFile) {
        await this.uploadEventImage(createdEvent._id || createdEvent.id, imageFile);
      }
      
      return createdEvent;
    } catch (error) {
      this._handleError(error, 'Error creating event');
      throw error;
    }
  }

  /**
   * Update an existing event
   * @param {string} id - Event ID
   * @param {Object} eventData - Updated event data
   * @param {File} imageFile - Optional image file
   * @returns {Promise<Object>} Updated event
   */
  async updateEvent(id, eventData, imageFile = null) {
    try {
      // Update the event data
      const response = await api.patch(`/events/${id}`, eventData);
      const updatedEvent = response.data;
      
      // If image file is provided, upload it
      if (imageFile) {
        await this.uploadEventImage(id, imageFile);
      }
      
      return updatedEvent;
    } catch (error) {
      this._handleError(error, `Error updating event ${id}`);
      throw error;
    }
  }

  /**
   * Upload an image for an event
   * @param {string} id - Event ID
   * @param {File} imageFile - Image file to upload
   * @returns {Promise<Object>} Updated event
   */
  async uploadEventImage(id, imageFile) {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      
      const response = await api.post(`/events/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      this._handleError(error, `Error uploading image for event ${id}`);
      throw error;
    }
  }

  /**
   * Delete an event
   * @param {string} id - Event ID
   * @returns {Promise<Object>} Deletion response
   */
  async deleteEvent(id) {
    try {
      const response = await api.delete(`/events/${id}`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Error deleting event ${id}`);
      throw error;
    }
  }

  /**
   * Associate a plan with an event
   * @param {string} eventId - Event ID
   * @param {string} planId - Plan ID
   * @returns {Promise<Object>} Updated event
   */
  async associatePlan(eventId, planId) {
    try {
      const response = await api.post(`/events/${eventId}/plan`, { planId });
      return response.data;
    } catch (error) {
      this._handleError(error, `Error associating plan with event ${eventId}`);
      throw error;
    }
  }

  /**
   * Dissociate a plan from an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Updated event
   */
  async dissociatePlan(eventId) {
    try {
      const response = await api.delete(`/events/${eventId}/plan`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Error dissociating plan from event ${eventId}`);
      throw error;
    }
  }

  /**
   * Get event statistics
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Event stats
   */
  async getEventStats(eventId) {
    try {
      const response = await api.get(`/events/${eventId}/stats`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Error fetching stats for event ${eventId}`);
      throw error;
    }
  }

  /**
   * Get available stands for an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} Available stands
   */
  async getAvailableStands(eventId) {
    try {
      const response = await api.get(`/events/${eventId}/stands/available`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Error fetching available stands for event ${eventId}`);
      return [];
    }
  }

  /**
   * Associate equipment with an event
   * @param {string} eventId - Event ID
   * @param {Array} equipmentIds - Array of equipment IDs
   * @returns {Promise<Object>} Success response
   */
  async associateEquipment(eventId, equipmentIds) {
    try {
      const response = await api.post(`/events/${eventId}/equipment`, { equipmentIds });
      return response.data;
    } catch (error) {
      this._handleError(error, `Error associating equipment with event ${eventId}`);
      throw error;
    }
  }

  /**
   * Get dashboard data for the organizer
   * @returns {Promise<Object>} Dashboard data
   */
  async getOrganizerDashboard() {
    try {
      const response = await api.get('/events/dashboard/organizer');
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error fetching dashboard data');
      return {};
    }
  }

  /**
   * Generic error handler
   * @private
   * @param {Error} error - Error object
   * @param {string} defaultMessage - Default error message
   */
  _handleError(error, defaultMessage) {
    console.error(`${defaultMessage}:`, error);
    
    let errorMessage = defaultMessage;
    
    if (error.response) {
      if (error.response.status === 403) {
        errorMessage = "You don't have the necessary permissions to perform this action";
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

const eventService = new EventService();
export default eventService;