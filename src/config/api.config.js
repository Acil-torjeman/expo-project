const API_URL = import.meta.env.VITE_API_BASE_URL;

export default {
  API_URL,
  FILE_BASE_URL: `${API_URL}/files`,
  UPLOADS: {
    EVENTS: '/uploads/events',
    EQUIPMENT: '/uploads/equipment-images',
    PLANS: '/uploads/plans',
    LOGOS: '/uploads/organization-logos',
    INVOICES: '/uploads/invoices'
  }
};