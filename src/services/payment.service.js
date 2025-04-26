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
      
      // Prepare payload
      const payload = { invoiceId };
      if (returnUrl) payload.returnUrl = returnUrl;
      if (cancelUrl) payload.cancelUrl = cancelUrl;
      
      const response = await api.post('/payments', payload);
      
      // Log success
      console.log('Payment created successfully:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error.message);
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
      console.error('Error capturing payment:', error.message);
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
      console.error('Error fetching payments:', error.message);
      return [];
    }
  }
}

const paymentService = new PaymentService();
export default paymentService;