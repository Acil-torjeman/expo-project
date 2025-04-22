// src/services/event.service.js
import api from '../utils/api';

class EventService {
  /**
   * Get all events with optional filters
   */
  async getEvents(search = '', status = '', upcoming = false) {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (upcoming) params.append('upcoming', 'true');
      
      const response = await api.get(`/events?${params}`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to fetch events');
      return [];
    }
  }

  /**
   * Get events for the current organizer
   */
  async getOrganizerEvents(organizerId) {
    try {
      const response = await api.get(`/events/organizer/${organizerId}`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to fetch your events');
      return [];
    }
  }

  /**
   * Get public events with filters
   */
  async getPublicEvents(search = '', sector = '', upcoming = true) {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (sector) params.append('sector', sector);
      params.append('upcoming', upcoming.toString());
      
      const response = await api.get(`/events/public-events?${params}`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to fetch public events');
      return [];
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(id) {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Failed to fetch event ${id}`);
      throw error;
    }
  }

  /**
   * Create new event
   */
  async createEvent(eventData) {
    try {
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to create event');
      throw error;
    }
  }

  /**
   * Update event
   */
  async updateEvent(id, eventData) {
    try {
      const response = await api.patch(`/events/${id}`, eventData);
      return response.data;
    } catch (error) {
      this._handleError(error, `Failed to update event ${id}`);
      throw error;
    }
  }

  /**
   * Upload event image
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
      this._handleError(error, `Failed to upload image for event ${id}`);
      throw error;
    }
  }

  /**
   * Delete event
   */
  async deleteEvent(id) {
    try {
      const response = await api.delete(`/events/${id}`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Failed to delete event ${id}`);
      throw error;
    }
  }

  /**
 * Get all stands for an event
 * @param {string} eventId - Event ID
 * @returns {Promise<Array>} List of stands
 */
async getStands(eventId) {
  try {
    const response = await api.get(`/events/${eventId}/stands`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch stands for event ${eventId}:`, error.message);
    throw error;
  }
}

  /**
   * Associate plan with event
   */
  async associatePlan(eventId, planId) {
    try {
      const response = await api.post(`/events/${eventId}/plan`, { planId });
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to associate plan with event');
      throw error;
    }
  }

  /**
   * Dissociate plan from event
   */
  async dissociatePlan(eventId) {
    try {
      const response = await api.delete(`/events/${eventId}/plan`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to remove plan from event');
      throw error;
    }
  }

  /**
   * Get event statistics
   */
  async getEventStats(eventId) {
    try {
      const response = await api.get(`/events/${eventId}/stats`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to fetch event statistics');
      return null;
    }
  }
  
  /**
   * Get all stands for an event
   */
  async getEventStands(eventId) {
    try {
      const response = await api.get(`/events/${eventId}/stands`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch stands for event ${eventId}:`, error);
      return [];
    }
  }
  
  /**
   * Get available stands for an event
   */
  async getAvailableStands(eventId) {
    try {
      // First fetch the event to ensure we have plan information
      const event = await this.getEventById(eventId);
      
      // Check if the event has a plan associated
      if (!event || !event.plan) {
        console.warn(`Event ${eventId} has no plan associated`);
        return [];
      }
      
      // Try to get available stands from the event endpoint first
      try {
        const response = await api.get(`/events/${eventId}/stands/available`);
        
        // If we got stands, return them
        if (response.data && response.data.length > 0) {
          return response.data;
        }
        
        // If no stands returned, try plan-based approach as fallback
        console.log(`No stands returned from event endpoint, trying plan approach`);
      } catch (error) {
        console.error(`Error fetching available stands from event endpoint:`, error);
        // Continue to plan-based approach as fallback
      }
      
      // Extract plan ID for fallback approach
      const planId = typeof event.plan === 'object' ? event.plan._id : event.plan;
      
      if (!planId) {
        return [];
      }
      
      // Try getting stands by plan directly
      try {
        const planResponse = await api.get(`/stands/plan/${planId}`);
        
        // Filter only available stands
        const availableStands = planResponse.data.filter(stand => stand.status === 'available');
        return availableStands;
      } catch (planError) {
        console.error(`Error getting stands from plan ${planId}:`, planError);
        return [];
      }
    } catch (error) {
      console.error(`Error in getAvailableStands for event ${eventId}:`, error);
      return [];
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

const eventService = new EventService();
export default eventService;