// src/utils/fileUtils.js
import apiConfig from '../config/api.config';

/**
 * Get the full URL to a file on the server
 * @param {string} filePath - Path to the file (e.g., /uploads/events/image.jpg)
 * @returns {string} Full URL to the file
 */
export const getFileUrl = (filePath) => {
  if (!filePath) return '';
  
  // Make sure the path starts with /
  const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  
  return `${apiConfig.FILE_BASE_URL}${normalizedPath}`;
};

/**
 * Get the full URL to an event image
 * @param {string} filename - Image filename
 * @returns {string} Full URL to the event image
 */
export const getEventImageUrl = (filename) => {
  if (!filename) return '';
  return getFileUrl(`${apiConfig.UPLOADS.EVENTS}/${filename}`);
};

/**
 * Get the full URL to an equipment image
 * @param {string} filename - Image filename or full path
 * @returns {string} Full URL to the equipment image
 */
export const getEquipmentImageUrl = (filename) => {
  if (!filename) return '';
  
  // If filename is already a full path, use it as is
  if (filename.startsWith('/uploads/')) {
    return getFileUrl(filename);
  }
  
  return getFileUrl(`${apiConfig.UPLOADS.EQUIPMENT}/${filename}`);
};

/**
 * Get the full URL to a plan file
 * @param {string} filename - Plan filename
 * @returns {string} Full URL to the plan file
 */
export const getPlanFileUrl = (filename) => {
  if (!filename) return '';
  return getFileUrl(`${apiConfig.UPLOADS.PLANS}/${filename}`);
};