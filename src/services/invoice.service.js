// src/services/invoice.service.js
import api from '../utils/api';


class InvoiceService {
  /**
   * Get invoice for a specific registration
   * @param {string} registrationId - Registration ID
   * @returns {Promise<Object>} Invoice data
   */
  async getInvoiceByRegistration(registrationId) {
    try {
      const response = await api.get(`/invoices/registration/${registrationId}`);
      return response.data;
    } catch (error) {
      // If invoice doesn't exist yet, generate it
      if (error.response && error.response.status === 404) {
        return this.generateInvoice(registrationId);
      }
      this._handleError(error, 'Failed to fetch invoice');
      throw error;
    }
  }

 /**
   * Generate new invoice for a registration
   * @param {string} registrationId - Registration ID
   * @returns {Promise<Object>} Generated invoice data
   */
 async generateInvoice(registrationId) {
    try {
      // Vérifier que l'ID est valide
      if (!registrationId) {
        throw new Error('Registration ID is required');
      }
      
      console.log(`Attempting to generate invoice for registration: ${registrationId}`);
      
      // Tenter de générer la facture
      const response = await api.post(`/invoices/registration/${registrationId}`);
      console.log('Invoice generated successfully:', response.data);
      return response.data;
    } catch (error) {
      // Si la facture existe déjà, essayons de la récupérer
      if (error.response && error.response.status === 400 && 
          error.response.data && error.response.data.message && 
          error.response.data.message.includes('already exists')) {
        console.log('Invoice already exists, fetching it...');
        return this.getInvoiceByRegistration(registrationId);
      }
      
      // Si la facture n'a pas pu être générée à cause d'une erreur d'organisateur,
      // nous pouvons quand même essayer de la récupérer car elle peut avoir été 
      // partiellement créée même avec une erreur
      if (error.message && (
          error.message.includes('Organizer with ID') || 
          error.message.includes('not found'))) {
        try {
          console.log('Attempting to fetch potentially created invoice despite organizer error');
          return await this.getInvoiceByRegistration(registrationId);
        } catch (secondError) {
          console.error('Failed to fetch invoice after generation error:', secondError);
        }
      }
      
      this._handleError(error, 'Failed to generate invoice');
      throw error;
    }
  }

  /**
   * Get all invoices for the current exhibitor
   * @returns {Promise<Array>} List of invoices
   */
  async getMyInvoices() {
    try {
      const response = await api.get('/invoices/exhibitor');
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to fetch your invoices');
      return [];
    }
  }

  /**
   * Get specific invoice by ID
   * @param {string} id - Invoice ID
   * @returns {Promise<Object>} Invoice data
   */
  async getInvoiceById(id) {
    try {
      const response = await api.get(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Failed to fetch invoice ${id}`);
      throw error;
    }
  }

    /**
   * Get PDF URL for an invoice
   * @param {string} id - Invoice ID
   * @returns {string} PDF URL
   */
    getInvoicePdfUrl(id) {
        // Utiliser la route publique pour les PDFs
        return `${api.defaults.baseURL}/invoices/${id}/public-pdf`;
      }

  /**
   * Handle errors consistently
   * @private
   */
  _handleError(error, defaultMessage) {
    console.error(`${defaultMessage}:`, error);
    
    let errorMessage = defaultMessage;
    
    if (error.response) {
      if (error.response.status === 403) {
        errorMessage = "You don't have permission to access this invoice";
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

const invoiceService = new InvoiceService();
export default invoiceService;