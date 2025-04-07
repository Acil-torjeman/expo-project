// src/utils/api.js
import axios from 'axios';
import { authService } from '../services/auth.service';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5001', // Your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get token from auth service
    const token = authService.getToken();
    
    // If token exists, add to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log the error for debugging
    console.error('API Error:', error.response?.status, error.response?.data);
    
    // If 401 Unauthorized error and not already retrying
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshSuccess = await authService.refreshToken();
        
        if (refreshSuccess) {
          // Update Authorization header with new token
          originalRequest.headers.Authorization = `Bearer ${authService.getToken()}`;
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token failed, redirect to login
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;