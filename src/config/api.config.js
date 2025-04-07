// src/config/api.config.js
// Centralized API configuration

// Get API URL from environment variable or use default
const API_URL = 'http://localhost:5001';

export default {
  API_URL,
  FILE_BASE_URL: `${API_URL}/files`,
  UPLOADS: {
    EVENTS: '/uploads/events',
    EQUIPMENT: '/uploads/equipment-images',
    PLANS: '/uploads/plans',
    LOGOS: '/uploads/organization-logos'
  }
};