// src/services/plan.service.js
import api from '../utils/api';
import { getFileUrl } from '../utils/fileUtils'; // Adjust the import based on your file structure

class PlanService {
  // Get all plans with optional search
  async getPlans(search = '') {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const response = await api.get(`/plans${params}`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error fetching plans');
      return [];
    }
  }

  // Get plans for the current organizer
  async getOrganizerPlans(organizerId) {
    try {
      const response = await api.get(`/plans/organizer/${organizerId}`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error fetching organizer plans');
      return [];
    }
  }

  // Get plan by ID
  async getPlanById(id) {
    try {
      const response = await api.get(`/plans/${id}`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Error fetching plan ${id}`);
      return null;
    }
  }
 
// Create new plan with PDF file
async createPlan(planData, pdfFile) {
    try {
      // Verify that the PDF file is present
      if (!pdfFile) {
        throw new Error('PDF file is required');
      }
      
      const formData = new FormData();
      
      // Add PDF file
      formData.append('pdfFile', pdfFile);
      
      // Add other form data, but exclude isActive for new plans
      Object.keys(planData).forEach(key => {
        // Skip isActive property during creation - it will use the default value from the schema
        if (key !== 'isActive' && planData[key] !== null && planData[key] !== undefined) {
          formData.append(key, planData[key]);
        }
      });
      
      const response = await api.post('/plans', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error creating plan');
      throw error;
    }
  }

  // Update plan
  async updatePlan(id, planData, pdfFile = null) {
    try {
      // For simple status toggling without a file, use JSON instead of FormData
      if (!pdfFile && Object.keys(planData).length === 1 && 'isActive' in planData) {
        // Send as regular JSON to avoid FormData string conversion
        const response = await api.patch(`/plans/${id}`, {
          isActive: Boolean(planData.isActive)
        });
        return response.data;
      }
      
      // Otherwise use FormData for file uploads
      const formData = new FormData();
      
      // Add PDF file if provided
      if (pdfFile) {
        formData.append('pdfFile', pdfFile);
      }
      
      // Add other form data
      Object.keys(planData).forEach(key => {
        if (planData[key] !== null && planData[key] !== undefined) {
          // Convert boolean to string for form data
          if (typeof planData[key] === 'boolean') {
            formData.append(key, planData[key].toString());
          } else {
            formData.append(key, planData[key]);
          }
        }
      });
      
      const response = await api.patch(`/plans/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      this._handleError(error, `Error updating plan ${id}`);
      throw error;
    }
  }

  // Delete plan
  async deletePlan(id) {
    try {
      const response = await api.delete(`/plans/${id}`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Error deleting plan ${id}`);
      throw error;
    }
  }

  // Associate plan with an event
  async associatePlanWithEvent(planId, eventId) {
    try {
      const response = await api.post(`/plans/${planId}/associate`, { eventId });
      return response.data;
    } catch (error) {
      this._handleError(error, `Error associating plan ${planId} with event ${eventId}`);
      throw error;
    }
  }

  // Dissociate plan from an event
  async dissociatePlanFromEvent(planId, eventId) {
    try {
      const response = await api.delete(`/plans/${planId}/dissociate/${eventId}`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Error dissociating plan ${planId} from event ${eventId}`);
      throw error;
    }
  }

  // Get PDF download URL - fixed path
  getPlanPdfUrl(pdfPath) {
    // Return the complete URL to download the PDF
    return `${api.defaults.baseURL}/files/uploads/plans/${pdfPath}`;
  }

  // Handle errors consistently
  _handleError(error, defaultMessage) {
    console.error(`${defaultMessage}:`, error);
    
    let errorMessage = defaultMessage;
    
    if (error.response) {
      if (error.response.status === 403) {
        errorMessage = "You don't have the necessary permissions to perform this action";
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
    }
    
    throw new Error(errorMessage);
  }
}

const planService = new PlanService();
export default planService;