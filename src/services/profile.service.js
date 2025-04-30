// src/services/profile.service.js
import api from '../utils/api';
import apiConfig from '../config/api.config';
import { getFileUrl } from '../utils/fileUtils';

/**
 * Service for managing user profile data
 */
class ProfileService {
  /**
   * Get the current user profile
   * @returns {Promise<Object>} User profile data with role-specific information
   */
  async getProfile() {
    try {
      const response = await api.get('/api/profile');
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to fetch profile');
    }
  }

  /**
   * Update user profile information
   * @param {Object} profileData - User profile data to update
   * @returns {Promise<Object>} Updated profile
   */
  async updateProfile(profileData) {
    try {
      // Remove any undefined or null values to prevent unintended overwrites
      const cleanedData = Object.fromEntries(
        Object.entries(profileData).filter(([_, v]) => v !== null && v !== undefined)
      );
      
      const response = await api.patch('/api/profile', cleanedData);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to update profile');
    }
  }

  /**
   * Change user password
   * @param {Object} passwordData - Object containing oldPassword and newPassword
   * @returns {Promise<Object>} Operation result
   */
  async changePassword(passwordData) {
    try {
      const response = await api.post('/api/profile/change-password', passwordData);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to change password');
    }
  }

  /**
   * Upload profile image or organization/company logo
   * @param {File} file - Image file to upload
   * @returns {Promise<Object>} Upload result with file path
   */
  async uploadProfileImage(file) {
    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPG, PNG or GIF image.');
      }
      
      // Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 2MB limit.');
      }
      
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/api/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to upload image');
    }
  }

  /**
   * Get URL for a profile/company/organization image
   * @param {string} imagePath - Image path 
   * @param {string} role - User role (admin, organizer, exhibitor)
   * @returns {string} Full URL to the image
   */
  getImageUrl(imagePath, role) {
    if (!imagePath) return null;
    
    // If imagePath is already a full URL, return it
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If imagePath already includes the path structure, use it directly
    if (imagePath.startsWith('/uploads/')) {
      return getFileUrl(imagePath);
    }
    
    // Otherwise, construct the path based on role
    let path;
    if (role === 'exhibitor') {
      path = `${apiConfig.UPLOADS.EXHIBITOR_DOCUMENTS}/${imagePath}`;
    } else if (role === 'organizer') {
      path = `${apiConfig.UPLOADS.LOGOS}/${imagePath}`;
    } else {
      path = `${apiConfig.UPLOADS.PROFILE_IMAGES}/${imagePath}`;
    }
    
    return getFileUrl(path);
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
      if (error.response.status === 401) {
        errorMessage = "You need to log in again to continue";
      } else if (error.response.status === 403) {
        errorMessage = "You don't have permission to perform this action";
      } else if (error.response.status === 404) {
        errorMessage = "Resource not found. Please try again.";
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
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = "No response from server. Please check your internet connection.";
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = error.message || defaultMessage;
    }
    
    throw new Error(errorMessage);
  }
}

export default new ProfileService();