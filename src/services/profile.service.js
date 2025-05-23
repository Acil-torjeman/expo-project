// src/services/profile.service.js
import api from '../utils/api';
import apiConfig from '../config/api.config';
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
      console.log('Profile API response:', JSON.stringify(response.data));
      
      const data = response.data;
      
      // Create a comprehensive profile object that works for all roles
      const profile = {
        // Core user fields that should exist for all roles
        id: data.id || data._id || '',
        username: data.username || '',
        email: data.email || '',
        role: data.role || '',
        avatar: data.avatar || '',
      };
      
      // Add exhibitor-specific fields if they exist
      if (data.company || data.representativeFunction) {
        profile.representativeFunction = data.representativeFunction || '';
        profile.personalPhone = data.personalPhone || '';
        profile.personalPhoneCode = data.personalPhoneCode || '';
        profile.company = data.company || {};
      }
      
      // Add organizer-specific fields if they exist
      if (data.organizationName || data.organizationAddress) {
        profile.organizationName = data.organizationName || '';
        profile.organizationAddress = data.organizationAddress || '';
        profile.postalCity = data.postalCity || '';
        profile.country = data.country || '';
        profile.contactPhone = data.contactPhone || '';
        profile.contactPhoneCode = data.contactPhoneCode || '';
        profile.website = data.website || '';
        profile.organizationDescription = data.organizationDescription || '';
        profile.organizationLogoPath = data.organizationLogoPath || '';
      }
      
      console.log('Processed profile data:', profile);
      return profile;
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
      // Format data for API
      const apiData = {
        username: profileData.username,
        email: profileData.email
      };
      
      // Add role-specific data
      if (profileData.representativeFunction || profileData.personalPhone || profileData.personalPhoneCode) {
        apiData.representativeFunction = profileData.representativeFunction;
        apiData.personalPhone = profileData.personalPhone;
        apiData.personalPhoneCode = profileData.personalPhoneCode;
      }
      
      // Add company data if present
      if (profileData.company && Object.keys(profileData.company).length > 0) {
        apiData.company = profileData.company;
      }
      
      // Add organization data if present
      if (profileData.organizationName || profileData.organizationAddress) {
        apiData.organization = {
          organizationName: profileData.organizationName,
          organizationAddress: profileData.organizationAddress,
          postalCity: profileData.postalCity,
          country: profileData.country,
          contactPhone: profileData.contactPhone,
          contactPhoneCode: profileData.contactPhoneCode,
          website: profileData.website,
          organizationDescription: profileData.organizationDescription
        };
      }
      
      const response = await api.patch('/api/profile', apiData);
      return this.getProfile(); // Fetch fresh data after update
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
    console.log('Uploading image file:', imageFile?.name, imageFile?.type, imageFile?.size);
    
    const formData = new FormData();
    formData.append('image', imageFile);
    
    // Log form data for debugging
    for (let pair of formData.entries()) {
      console.log('Form data entry:', pair[0], pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
    }
    
    const response = await api.post('/api/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Image upload successful, response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    console.error('Error details:', error.response?.data);
    throw error;
  }
}

   /**
   * Get appropriate image URL based on user role and path
   * @param {string} imagePath - Path to the image file
   * @param {string} role - User role
   * @returns {string} Full URL to the image
   */
   getImageUrl(imagePath, role) {
    if (!imagePath) return '';
    
    // Use the user role to determine the correct URL function
    if (role === 'exhibitor') {
      return getCompanyLogoUrl(imagePath);
    } else if (role === 'organizer') {
      return getOrganizationLogoUrl(imagePath);
    } else {
      return getProfileImageUrl(imagePath);
    }
  }
}

export default new ProfileService();