import api from '../utils/api';
import { getInvoicePdfUrl } from '../utils/fileUtils';

class InvoiceService {
  async getInvoiceByRegistration(registrationId) {
    try {
      const response = await api.get(`/invoices/registration/${registrationId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return this.generateInvoice(registrationId);
      }
      this._handleError(error, 'Failed to fetch invoice');
      throw error;
    }
  }

  async generateInvoice(registrationId) {
    try {
      if (!registrationId) {
        throw new Error('Registration ID is required');
      }
      
      console.log(`Attempting to generate invoice for registration: ${registrationId}`);
      
      const response = await api.post(`/invoices/registration/${registrationId}`);
      console.log('Invoice generated successfully:', response.data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 400 && 
          error.response.data && error.response.data.message && 
          error.response.data.message.includes('already exists')) {
        console.log('Invoice already exists, fetching it...');
        return this.getInvoiceByRegistration(registrationId);
      }
      
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

  async getMyInvoices() {
    try {
      const response = await api.get('/invoices/exhibitor');
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to fetch your invoices');
      return [];
    }
  }

  async getInvoiceById(id) {
    try {
      const response = await api.get(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Failed to fetch invoice ${id}`);
      throw error;
    }
  }

  getInvoicePdfUrl(pdfPath) {
    return getInvoicePdfUrl(pdfPath);
  }

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