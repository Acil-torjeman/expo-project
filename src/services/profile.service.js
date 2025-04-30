// src/services/profile.service.js
import api from '../utils/api';
import { getCompanyLogoUrl, getOrganizationLogoUrl, getProfileImageUrl } from '../utils/fileUtils';

/**
 * Service for profile management
 */
class ProfileService {
  /**
   * Get user profile with role-specific data
   * @returns {Promise<Object>} User profile data
   */
  async getProfile() {
    try {
      const response = await api.get('/api/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Updated profile
   */
  async updateProfile(profileData) {
    try {
      const response = await api.patch('/api/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Change user password
   * @param {Object} passwordData - Password data object
   * @param {string} passwordData.oldPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise<Object>} Success message
   */
  async changePassword(passwordData) {
    try {
      const response = await api.post('/api/profile/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Upload profile image
   * @param {File} imageFile - Image file to upload
   * @returns {Promise<Object>} Upload result
   */
  async uploadProfileImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await api.post('/api/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }

  /**
   * Get appropriate image URL based on user role and path
   * @param {string} imagePath - Path to the image file
   * @returns {string} Full URL to the image
   */
  getImageUrl(imagePath) {
    if (!imagePath) return '';
    
    // Check if it's a logo or profile image based on path pattern
    if (imagePath.includes('exhibitor-documents')) {
      return getCompanyLogoUrl(imagePath);
    } else if (imagePath.includes('organization-logos')) {
      return getOrganizationLogoUrl(imagePath);
    } else {
      return getProfileImageUrl(imagePath);
    }
  }
}

export default new ProfileService();