// src/services/profile.service.js
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
      console.log('Profile API response:', response.data);  // Debug log
      
      // Check response structure
      const data = response.data;
      
      // Handle different data structures that might come from the API
      return {
        // Basic user data - check in different possible locations
        id: data._id || data.id || '',
        username: data.username || (data.user && data.user.username) || '',
        email: data.email || (data.user && data.user.email) || '',
        role: data.role || (data.user && data.user.role) || '',
        
        // Exhibitor data
        representativeFunction: data.representativeFunction || '',
        personalPhone: data.personalPhone || '',
        personalPhoneCode: data.personalPhoneCode || '',
        
        // Company data (for exhibitors)
        company: data.company || {},
        
        // Organization data (for organizers)
        organizationName: data.organizationName || '',
        organizationAddress: data.organizationAddress || '',
        postalCity: data.postalCity || '',
        country: data.country || '',
        contactPhone: data.contactPhone || '',
        contactPhoneCode: data.contactPhoneCode || '',
        website: data.website || '',
        organizationDescription: data.organizationDescription || '',
        organizationLogoPath: data.organizationLogoPath || '',
        
        // Avatar for admins
        avatar: data.avatar || ''
      };
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