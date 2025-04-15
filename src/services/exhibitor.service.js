// src/services/exhibitor.service.js
import api from '../utils/api';

class ExhibitorService {
  /**
   * Get exhibitor by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Exhibitor data
   */
  async getByUserId(userId) {
    try {
      const response = await api.get(`/exhibitor/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch exhibitor profile for user ${userId}:`, error.message);
      return null;
    }
  }

  /**
   * Get exhibitor by ID
   * @param {string} id - Exhibitor ID
   * @returns {Promise<Object>} Exhibitor data
   */
  async getById(id) {
    try {
      const response = await api.get(`/exhibitor/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch exhibitor ${id}:`, error.message);
      return null;
    }
  }

  /**
   * Get all exhibitors (admin and organizer only)
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} List of exhibitors
   */
  async getAll(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      if (filters.status) {
        params.append('status', filters.status);
      }
      
      const query = params.toString() ? `?${params}` : '';
      const response = await api.get(`/exhibitor${query}`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to fetch exhibitors');
      return [];
    }
  }

  /**
   * Get exhibitors by event ID
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} List of exhibitors
   */
  async getByEvent(eventId) {
    try {
      const response = await api.get(`/exhibitor/event/${eventId}`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Failed to fetch exhibitors for event ${eventId}`);
      return [];
    }
  }

  /**
   * Update exhibitor profile
   * @param {string} id - Exhibitor ID
   * @param {Object} exhibitorData - Updated exhibitor data
   * @returns {Promise<Object>} Updated exhibitor
   */
  async update(id, exhibitorData) {
    try {
      const response = await api.patch(`/exhibitor/${id}`, exhibitorData);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to update exhibitor profile');
      throw error;
    }
  }

  /**
   * Upload company documents
   * @param {string} id - Exhibitor ID
   * @param {Object} files - Files to upload
   * @returns {Promise<Object>} Updated exhibitor
   */
  async uploadDocuments(id, files) {
    try {
      const formData = new FormData();
      
      // Add files to form data
      Object.keys(files).forEach(key => {
        if (files[key]) {
          formData.append(key, files[key]);
        }
      });
      
      const response = await api.post(`/exhibitor/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to upload company documents');
      throw error;
    }
  }

  /**
   * Register a new exhibitor
   * @param {Object} signupData - Exhibitor signup data
   * @param {Object} files - Company documents
   * @returns {Promise<Object>} Registration response
   */
  async register(signupData, files) {
    try {
      const formData = new FormData();
      
      // Add form fields
      Object.keys(signupData).forEach(key => {
        formData.append(key, signupData[key]);
      });
      
      // Add files
      Object.keys(files).forEach(key => {
        if (files[key]) {
          formData.append(key, files[key]);
        }
      });
      
      const response = await api.post('/exhibitor/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to register exhibitor');
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

const exhibitorService = new ExhibitorService();
export default exhibitorService;