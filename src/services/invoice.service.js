// src/services/invoice.service.js
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
      console.log('Fetching invoices for current exhibitor');
      const response = await api.get('/invoices/exhibitor');
      console.log('Invoices received:', response.data);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      
      // Si aucune facture n'est trouvée, essayons de les récupérer par les inscriptions
      console.log('No invoices found, trying to fetch through registrations');
      return this.getInvoicesViaRegistrations();
    } catch (error) {
      console.error('Error in getMyInvoices:', error);
      
      // En cas d'erreur, essayons d'obtenir les factures via les inscriptions
      try {
        console.log('Error occurred, trying to fetch through registrations');
        return this.getInvoicesViaRegistrations();
      } catch (secondError) {
        console.error('Error fetching via registrations:', secondError);
        this._handleError(error, 'Failed to fetch your invoices');
        return [];
      }
    }
  }
  
  // Méthode alternative pour récupérer les factures via les inscriptions
  async getInvoicesViaRegistrations() {
    try {
      // Importer le service de registrations dynamiquement
      const registrationService = await import('./registration.service').then(m => m.default);
      
      // Obtenir les inscriptions de l'utilisateur
      const registrations = await registrationService.getMyRegistrations();
      console.log('Registrations found:', registrations.length);
      
      // Pour chaque inscription avec statut COMPLETED, essayer de récupérer la facture
      const invoices = [];
      for (const registration of registrations) {
        if (registration.status === 'completed') {
          try {
            const invoice = await this.getInvoiceByRegistration(registration._id);
            if (invoice) {
              invoices.push(invoice);
            }
          } catch (error) {
            console.error(`Error fetching invoice for registration ${registration._id}:`, error);
          }
        }
      }
      
      console.log('Invoices found via registrations:', invoices.length);
      return invoices;
    } catch (error) {
      console.error('Failed to get invoices via registrations:', error);
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