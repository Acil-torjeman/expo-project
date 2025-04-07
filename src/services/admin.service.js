// src/services/admin.service.js
import axios from '../utils/api';

/**
 * Service for admin-related API calls
 */
class AdminService {
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStats() {
    try {
      const response = await axios.get('/admin/stats');
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error fetching dashboard stats');
    }
  }

  /**
   * Get recent users
   * @param {number} - Maximum number of users to return
   * @returns {Promise<Array>} Recent users
   */
  async getRecentUsers() {
    try {
      // In a real app, this would be a dedicated endpoint
      // For now, we'll use the users endpoint with a limit param
      const response = await axios.get(`/users?limit=${limit}`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error fetching recent users');
      return [];
    }
  }

  /**
   * Get users with filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Filtered users
   */
  async getUsers(filters = {}) {
    try {
      // Build query parameters
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
      const response = await axios.get(`/users${query}`);
      
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error fetching users');
      return [];
    }
  }
  
  /**
   * Get users in trash with filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Deleted users
   */
  async getTrashedUsers(filters = {}) {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (key !== 'expiringOnly' && value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await axios.get(`/users/trash${query}`);
      
      // Process the data to add days remaining
      return response.data.map(user => {
        const deletedDate = new Date(user.deletedAt);
        const expiryDate = new Date(deletedDate);
        expiryDate.setDate(expiryDate.getDate() + 30); // 30-day retention period
        
        const now = new Date();
        const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        
        return {
          ...user,
          daysRemaining: Math.max(0, daysRemaining)
        };
      });
    } catch (error) {
      this._handleError(error, 'Error fetching trashed users');
      return [];
    }
  }

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} User data
   */
  async getUserById(id) {
    try {
      const response = await axios.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Error fetching user ${id}`);
      return null;
    }
  }

  /**
   * Update user status
   * @param {string} id - User ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated user
   */
  async updateUserStatus(id, status) {
    try {
      const response = await axios.patch(`/users/${id}/status?status=${status}`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Error updating status for user ${id}`);
      throw error;
    }
  }

  /**
   * Move a user to trash
   * @param {string} id - User ID
   * @returns {Promise<Object>} Operation result
   */
  async moveUserToTrash(id) {
    try {
      const response = await axios.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Error moving user ${id} to trash`);
      throw error;
    }
  }

  /**
   * Move multiple users to trash
   * @param {string[]} userIds - User IDs
   * @returns {Promise<Object>} Operation result
   */
  async batchMoveToTrash(userIds) {
    try {
      // Check if a batch endpoint exists
      try {
        const response = await axios.post('/users/batch-delete', { userIds });
        return response.data;
      } catch (batchError) {
        // If batch endpoint doesn't exist, fall back to individual deletion
        console.log('Batch delete endpoint not available, using sequential deletion');
        
        const results = [];
        for (const userId of userIds) {
          const result = await this.moveUserToTrash(userId);
          results.push(result);
        }
        
        return { 
          success: true, 
          message: `${userIds.length} users moved to trash`,
          details: results
        };
      }
    } catch (error) {
      this._handleError(error, 'Error batch moving users to trash');
      throw error;
    }
  }

  /**
   * Restore a user from trash
   * @param {string} id - User ID
   * @returns {Promise<Object>} Restored user
   */
  async restoreUser(id) {
    try {
      const response = await axios.post(`/users/${id}/restore`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Error restoring user ${id}`);
      throw error;
    }
  }

  /**
   * Restore multiple users from trash
   * @param {string[]} userIds - User IDs
   * @returns {Promise<Object>} Operation result
   */
  async batchRestoreUsers(userIds) {
    try {
      // Check if a batch endpoint exists
      try {
        const response = await axios.post('/users/batch-restore', { userIds });
        return response.data;
      } catch (batchError) {
        // If batch endpoint doesn't exist, fall back to individual restoration
        console.log('Batch restore endpoint not available, using sequential restoration');
        
        const results = [];
        for (const userId of userIds) {
          const result = await this.restoreUser(userId);
          results.push(result);
        }
        
        return { 
          success: true, 
          message: `${userIds.length} users restored`,
          details: results
        };
      }
    } catch (error) {
      this._handleError(error, 'Error batch restoring users');
      throw error;
    }
  }

  /**
   * Permanently delete a user
   * @param {string} id - User ID
   * @returns {Promise<Object>} Operation result
   */
  async permanentlyDeleteUser(id) {
    try {
      const response = await axios.delete(`/users/${id}/permanent`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Error permanently deleting user ${id}`);
      throw error;
    }
  }

  /**
   * Permanently delete multiple users
   * @param {string[]} userIds - User IDs
   * @returns {Promise<Object>} Operation result
   */
  async batchPermanentlyDeleteUsers(userIds) {
    try {
      // Check if a batch endpoint exists
      try {
        const response = await axios.post('/users/batch-permanent-delete', { userIds });
        return response.data;
      } catch (batchError) {
        // If batch endpoint doesn't exist, fall back to individual deletion
        console.log('Batch permanent delete endpoint not available, using sequential deletion');
        
        const results = [];
        for (const userId of userIds) {
          const result = await this.permanentlyDeleteUser(userId);
          results.push(result);
        }
        
        return { 
          success: true, 
          message: `${userIds.length} users permanently deleted`,
          details: results
        };
      }
    } catch (error) {
      this._handleError(error, 'Error batch deleting users permanently');
      throw error;
    }
  }
  
  /**
   * Helper method to handle errors consistently
   * @private
   * @param {Error} error - The error object
   * @param {string} defaultMessage - Default error message
   * @returns {void}
   */
  _handleError(error, defaultMessage) {
    console.error(`${defaultMessage}:`, error);
    
    let errorMessage = defaultMessage;
    
    if (error.response && error.response.data) {
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
    
    throw new Error(errorMessage);
  }
}

// Create a singleton instance
const adminService = new AdminService();

export default adminService;