// src/utils/fileUtils.js
import apiConfig from '../config/api.config';

export const getFileUrl = (filePath) => {
  if (!filePath) return '';
  
  const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  
  return `${apiConfig.FILE_BASE_URL}${normalizedPath}`;
};

export const getEventImageUrl = (filename) => {
  if (!filename) return '';
  return getFileUrl(`${apiConfig.UPLOADS.EVENTS}/${filename}`);
};

export const getEquipmentImageUrl = (filename) => {
  if (!filename) return '';
  
  if (filename.startsWith('/uploads/')) {
    return getFileUrl(filename);
  }
  
  return getFileUrl(`${apiConfig.UPLOADS.EQUIPMENT}/${filename}`);
};

export const getPlanFileUrl = (filename) => {
  if (!filename) return '';
  return getFileUrl(`${apiConfig.UPLOADS.PLANS}/${filename}`);
};

export const getInvoicePdfUrl = (filename) => {
  if (!filename) return '';
  return getFileUrl(`${apiConfig.UPLOADS.INVOICES}/${filename}`);
};

// New utility functions for company documents

export const getCompanyLogoUrl = (filename) => {
  if (!filename) return '';
  return getFileUrl(`${apiConfig.UPLOADS.LOGOS}/${filename}`);
};

export const getCompanyDocumentUrl = (filename) => {
  if (!filename) return '';
  return getFileUrl(`/uploads/exhibitor-documents/${filename}`);
};

export const getKbisDocumentUrl = (filename) => {
  if (!filename) return '';
  return getCompanyDocumentUrl(filename);
};

export const getInsuranceDocumentUrl = (filename) => {
  if (!filename) return '';
  return getCompanyDocumentUrl(filename);
};