// src/services/equipment.service.js
import api from '../utils/api';

class EquipmentService {
  // Get all equipment with filters
  async getEquipment(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'boolean') {
            params.append(key, value.toString());
          } else {
            params.append(key, value);
          }
        }
      });
      
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await api.get(`/equipment${query}`);
      
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error fetching equipment');
      return [];
    }
  }

  // Get equipment for the current organizer
  async getOrganizerEquipment(organizerId) {
    try {
      // If organizerId is provided, use the specific endpoint
      if (organizerId) {
        const response = await api.get(`/equipment/organizer/${organizerId}`);
        return response.data;
      } 
      
      // Otherwise, get equipment for current authenticated user using query parameter
      const response = await api.get('/equipment?currentUser=true');
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error fetching organizer equipment');
      return [];
    }
  }

  // Get equipment by ID
  async getEquipmentById(id) {
    try {
      const response = await api.get(`/equipment/${id}`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Error fetching equipment ${id}`);
      return null;
    }
  }

  // Get equipment associated with an event
  async getEventEquipment(eventId) {
    try {
      const response = await api.get(`/equipment/event/${eventId}`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Error fetching equipment for event ${eventId}`);
      return [];
    }
  }

  // Upload image for equipment
  async uploadEquipmentImage(id, file) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post(`/equipment/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      this._handleError(error, `Error uploading image for equipment ${id}`);
      throw error;
    }
  }

  // Create new equipment
  async createEquipment(equipmentData) {
    try {
      const response = await api.post('/equipment', equipmentData);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error creating equipment');
      throw error;
    }
  }

  // Update equipment
  async updateEquipment(id, equipmentData) {
    try {
      const response = await api.patch(`/equipment/${id}`, equipmentData);
      return response.data;
    } catch (error) {
      this._handleError(error, `Error updating equipment ${id}`);
      throw error;
    }
  }

  // Delete equipment
  async deleteEquipment(id) {
    try {
      const response = await api.delete(`/equipment/${id}`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Error deleting equipment ${id}`);
      throw error;
    }
  }

    
 //Get available quantity for equipment in an event
 
async getAvailableQuantity(equipmentId, eventId) {
  try {
    const response = await api.get(`/equipment/${equipmentId}/available-quantity/${eventId}`);
    return response.data.availableQuantity;
  } catch (error) {
    console.error(`Error fetching available quantity for equipment ${equipmentId}:`, error);
    return 0;
  }
}

  // Associate equipment with event
  async associateWithEvent(equipmentId, eventId, data = {}) {
    try {
      const payload = {
        eventId,
        ...data
      };
      
      const response = await api.post(`/equipment/${equipmentId}/associate`, payload);
      return response.data;
    } catch (error) {
      this._handleError(error, `Error associating equipment with event`);
      throw error;
    }
  }

  // Dissociate equipment from event
  async dissociateFromEvent(equipmentId, eventId) {
    try {
      const response = await api.delete(`/equipment/${equipmentId}/dissociate/${eventId}`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Error dissociating equipment from event`);
      throw error;
    }
  }

  // Handle errors consistently
  _handleError(error, defaultMessage) {
    console.error(`${defaultMessage}:`, error);
    
    let errorMessage = defaultMessage;
    
    if (error.response) {
      if (error.response.status === 403) {
        errorMessage = "You don't have the necessary permissions to perform this action";
      } else if (error.response.status === 404) {
        errorMessage = "The requested resource was not found";
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

const equipmentService = new EquipmentService();
export default equipmentService;