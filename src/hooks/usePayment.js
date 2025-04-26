// src/hooks/usePayment.js
import { useState } from 'react';
import { useToast } from '@chakra-ui/react';
import paymentService from '../services/payment.service';

const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  /**
   * Initialize payment process
   * @param {string} invoiceId - ID of the invoice to pay
   * @param {string} returnUrl - Optional override for return URL
   * @param {string} cancelUrl - Optional override for cancel URL
   */
  const initiatePayment = async (invoiceId, returnUrl, cancelUrl) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Initiating payment for invoice: ${invoiceId}`);
      
      // Create payment in backend
      const paymentData = await paymentService.createPayment(
        invoiceId, 
        returnUrl, 
        cancelUrl
      );
      
      console.log('Payment data received:', paymentData);
      
      // If Stripe checkout URL is returned, redirect to it
      if (paymentData && paymentData.paymentUrl) {
        console.log('Redirecting to Stripe checkout:', paymentData.paymentUrl);
        window.location.href = paymentData.paymentUrl;
        return paymentData;
      } else {
        throw new Error('No payment URL returned from server');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to initialize payment';
      setError(errorMessage);
      toast({
        title: 'Payment Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check payment status
   * @param {string} sessionId - Stripe session ID
   */
  const checkPaymentStatus = async (sessionId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await paymentService.checkPaymentStatus(sessionId);
      
      if (result && result.success) {
        toast({
          title: 'Payment Successful',
          description: 'Your payment has been processed successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      return result;
    } catch (error) {
      setError(error.message || 'Failed to process payment');
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to process payment',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get all payments for the current user
   */
  const getMyPayments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const payments = await paymentService.getMyPayments();
      return payments;
    } catch (error) {
      setError(error.message || 'Failed to fetch payments');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    initiatePayment,
    checkPaymentStatus,
    getMyPayments
  };
};

export default usePayment;