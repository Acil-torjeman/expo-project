// src/pages/Exhibitor/PaymentProcessor.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Divider,
  Icon,
} from '@chakra-ui/react';
import { FiCreditCard, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import usePayment from '../../hooks/usePayment';
import invoiceService from '../../services/invoice.service';

const PaymentProcessor = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading: paymentLoading, error: paymentError, initiatePayment, checkPaymentStatus } = usePayment();
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('');
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const paypalOrderId = queryParams.get('token');
  
  // Background gradient
  const bgGradient = useColorModeValue(
    'linear(to-br, teal.50, blue.50)',
    'linear(to-br, gray.900, gray.800)'
  );
  
  // Card background
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // Load invoice details
  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        setLoading(true);
        const data = await invoiceService.getInvoiceById(invoiceId);
        setInvoice(data);
      } catch (err) {
        setError(err.message || 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };
    
    if (invoiceId) {
      fetchInvoiceDetails();
    }
  }, [invoiceId]);
  
  // Check for PayPal return
  useEffect(() => {
    const handlePayPalReturn = async () => {
      // If PayPal order ID is in the URL, process the payment
      if (paypalOrderId) {
        setProcessingStatus('processing');
        
        try {
          const result = await checkPaymentStatus(paypalOrderId);
          
          if (result.success) {
            setProcessingStatus('success');
            // Wait a moment to show success message before redirecting
            setTimeout(() => {
              navigate(`/exhibitor/invoices/${invoiceId}`);
            }, 2000);
          } else {
            setProcessingStatus('failed');
          }
        } catch (error) {
          setProcessingStatus('failed');
        }
      }
    };
    
    if (paypalOrderId) {
      handlePayPalReturn();
    }
  }, [paypalOrderId, checkPaymentStatus, navigate, invoiceId]);
  
  // Initiate payment - test for backend errors
  const handlePayNow = async () => {
    try {
      // Create base URL for the frontend routes
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const returnUrl = `${baseUrl}/exhibitor/payments/success`;
      const cancelUrl = `${baseUrl}/exhibitor/payments/cancel`;
      
      console.log('Initiating payment with URLs:', { returnUrl, cancelUrl });
      
      // Pass explicit returnUrl and cancelUrl to override backend config if needed
      await initiatePayment(invoiceId, returnUrl, cancelUrl);
    } catch (err) {
      console.error('Payment initiation error:', err);
      // Error is already handled in the hook
    }
  };
  
  // Go back to invoice
  const handleGoBack = () => {
    navigate(`/exhibitor/invoices/${invoiceId}`);
  };
  
  if (loading || !invoice) {
    return (
      <Box minH="100vh" bgGradient={bgGradient} py={10}>
        <Container maxW="container.md">
          <Flex direction="column" align="center" justify="center" minH="60vh">
            <Spinner size="xl" color="teal.500" thickness="4px" />
            <Text mt={4}>Loading payment information...</Text>
          </Flex>
        </Container>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box minH="100vh" bgGradient={bgGradient} py={10}>
        <Container maxW="container.md">
          <Flex direction="column" align="center" justify="center" minH="60vh">
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Text>{error}</Text>
            </Alert>
            <Button mt={6} onClick={handleGoBack} leftIcon={<FiArrowLeft />}>
              Back to Invoice
            </Button>
          </Flex>
        </Container>
      </Box>
    );
  }
  
  return (
    <Box minH="100vh" bgGradient={bgGradient} py={10}>
      <Container maxW="container.md">
        <Flex direction="column" align="center">
          {/* Header */}
          <Heading mb={6} size="xl" textAlign="center">
            Payment Processing
          </Heading>
          
          <Box
            w="full"
            bg={cardBg}
            borderRadius="xl"
            boxShadow="xl"
            overflow="hidden"
            p={8}
          >
            {/* Invoice summary */}
            <VStack spacing={6} align="start" mb={8}>
              <Heading size="md">Invoice Summary</Heading>
              
              <HStack w="full" justify="space-between">
                <Text fontWeight="medium">Invoice Number:</Text>
                <Text>{invoice.invoiceNumber}</Text>
              </HStack>
              
              <HStack w="full" justify="space-between">
                <Text fontWeight="medium">Event:</Text>
                <Text>{invoice.event?.name || 'N/A'}</Text>
              </HStack>
              
              <HStack w="full" justify="space-between">
                <Text fontWeight="medium">Amount Due:</Text>
                <Text fontWeight="bold" fontSize="lg">${invoice.total?.toFixed(2)}</Text>
              </HStack>
              
              <Divider />
            </VStack>
            
            {/* Payment status */}
            {/* Payment status */}
            {processingStatus === 'processing' && (
              <Alert status="info" borderRadius="md" mb={6}>
                <AlertIcon />
                <Text>Processing your payment...</Text>
                <Spinner ml={2} size="sm" />
              </Alert>
            )}
            
            {processingStatus === 'success' && (
              <Alert status="success" borderRadius="md" mb={6}>
                <AlertIcon />
                <Text>Payment successful! Redirecting to invoice...</Text>
              </Alert>
            )}
            
            {processingStatus === 'failed' && (
              <Alert status="error" borderRadius="md" mb={6}>
                <AlertIcon />
                <Text>Payment processing failed. Please try again.</Text>
              </Alert>
            )}
            
            {paymentError && (
              <Alert status="error" borderRadius="md" mb={6}>
                <AlertIcon />
                <VStack align="start" w="full">
                  <Text fontWeight="bold">Payment Error:</Text>
                  <Text>{paymentError}</Text>
                  <Text fontSize="sm" color="red.600">
                    If this error persists, please contact support with this error message.
                  </Text>
                </VStack>
              </Alert>
            )}
            
            {/* Payment actions */}
            <VStack spacing={4} width="full" mt={4}>
              {!paypalOrderId && invoice.status !== 'paid' && (
                <Button
                  colorScheme="blue"
                  size="lg"
                  width="full"
                  leftIcon={<FiCreditCard />}
                  onClick={handlePayNow}
                  isLoading={paymentLoading}
                >
                  Pay Now with PayPal
                </Button>
              )}
              
              {invoice.status === 'paid' && (
                <Alert status="success" borderRadius="md">
                  <AlertIcon as={FiCheckCircle} />
                  <Text>This invoice has already been paid.</Text>
                </Alert>
              )}
              
              <Button 
                variant="outline" 
                width="full"
                leftIcon={<FiArrowLeft />}
                onClick={handleGoBack}
              >
                Back to Invoice
              </Button>
            </VStack>
          </Box>
          
          {/* PayPal info */}
          <Text mt={8} fontSize="sm" color="gray.500" textAlign="center">
            Payments are securely processed through PayPal.
            You will be redirected to PayPal to complete your payment.
          </Text>
        </Flex>
      </Container>
    </Box>
  );
};

export default PaymentProcessor;