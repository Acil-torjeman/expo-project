// src/services/payment.service.js
import api from '../utils/api';

class PaymentService {
  /**
   * Create a new payment for an invoice
   * @param {string} invoiceId - ID of the invoice to pay
   * @param {string} returnUrl - URL to return to after successful payment (optional)
   * @param {string} cancelUrl - URL to return to if payment is cancelled (optional)
   */
  async createPayment(invoiceId, returnUrl, cancelUrl) {
    try {
      console.log('Creating payment for invoice:', invoiceId);
      
      // Prepare payload - only include returnUrl/cancelUrl if provided
      const payload = { invoiceId };
      if (returnUrl) payload.returnUrl = returnUrl;
      if (cancelUrl) payload.cancelUrl = cancelUrl;
      
      const response = await api.post('/payments', payload);
      
      // Log success for debugging
      console.log('Payment created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error details:', error.response?.data);
      this._handleError(error, 'Failed to create payment');
      throw error;
    }
  }

  /**
   * Capture a payment after PayPal approval
   * @param {string} orderId - PayPal order ID
   */
  async capturePayment(orderId) {
    try {
      console.log('Capturing payment for order:', orderId);
      const response = await api.get(`/payments/capture?orderId=${orderId}`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to capture payment');
      throw error;
    }
  }

  /**
   * Get all payments for the current user
   */
  async getMyPayments() {
    try {
      const response = await api.get('/payments/my-payments');
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to fetch your payments');
      return [];
    }
  }

  /**
   * Handle errors consistently
   */
  _handleError(error, defaultMessage) {
    console.error(`${defaultMessage}:`, error);
    
    let errorMessage = defaultMessage;
    
    if (error.response) {
      if (error.response.status === 403) {
        errorMessage = "You don't have permission to perform this action";
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

const paymentService = new PaymentService();
export default paymentService;